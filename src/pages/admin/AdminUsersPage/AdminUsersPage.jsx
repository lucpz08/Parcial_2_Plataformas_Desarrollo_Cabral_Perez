import { useState } from 'react'
import { Search, UserPlus, UsersRound } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Button, ConfirmDialog, EmptyState, Input, Select, Tabs } from '@/components/ui'
import { ROLES } from '@/data/constants'
import { useAuth } from '@/hooks/useAuth'
import { useDatabase } from '@/hooks/useDatabase'
import { useToast } from '@/hooks/useToast'
import { adminUsersService } from '@/services/adminUsers'
import { pluralize } from '@/utils/format'
import { SuspendModal } from './SuspendModal'
import { UserFormModal } from './UserFormModal'
import { UsersTable } from './UsersTable'
import styles from './AdminUsersPage.module.css'

const TAB_FILTERS = {
  all: {},
  activo: { status: 'activo' },
  suspendido: { status: 'suspendido' },
  admin: { role: ROLES.ADMIN },
}

const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'name', label: 'Nombre (A-Z)' },
  { value: 'rating', label: 'Mejor reputación' },
  { value: 'lastLogin', label: 'Último ingreso' },
]

export function AdminUsersPage() {
  useDatabase()
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')
  const [sort, setSort] = useState('recent')
  const [modal, setModal] = useState(null)

  const users = adminUsersService.list({ query, sort, ...TAB_FILTERS[tab] })
  const counts = adminUsersService.getCounts()
  const closeModal = () => setModal(null)

  function attempt(action, message) {
    try {
      action()
      toast.success(message)
    } catch (error) {
      toast.error('No se pudo completar la acción', error.message)
    } finally {
      closeModal()
    }
  }

  function handleFormSubmit(form) {
    if (modal.user) {
      adminUsersService.update(modal.user.id, currentUser.id, form)
      toast.success('Usuario actualizado')
    } else {
      const created = adminUsersService.create(form)
      toast.success(`Creaste la cuenta de ${created.displayName}`)
    }
    closeModal()
  }

  function handleSuspend(reason) {
    const { cancelledClaims } = adminUsersService.suspend(modal.user.id, currentUser.id, reason)
    toast.success(
      `Suspendiste a ${modal.user.displayName}`,
      cancelledClaims > 0 ? `Se cancelaron ${pluralize(cancelledClaims, 'reserva activa', 'reservas activas')}.` : undefined,
    )
    closeModal()
  }

  const confirmations = modal && {
    role: {
      title: modal.user.role === ROLES.ADMIN ? '¿Quitar permisos de administrador?' : '¿Hacer administrador?',
      message:
        modal.user.role === ROLES.ADMIN
          ? `${modal.user.displayName} pasa a ser coleccionista y deja de ver el panel de administración.`
          : `${modal.user.displayName} va a poder gestionar usuarios, moderar publicaciones y el catálogo.`,
      confirmLabel: modal.user.role === ROLES.ADMIN ? 'Quitar permisos' : 'Hacer administrador',
      danger: modal.user.role === ROLES.ADMIN,
      onConfirm: () =>
        attempt(
          () =>
            adminUsersService.setRole(
              modal.user.id,
              currentUser.id,
              modal.user.role === ROLES.ADMIN ? ROLES.COLECCIONISTA : ROLES.ADMIN,
            ),
          'Rol actualizado',
        ),
    },
    reactivate: {
      title: `¿Reactivar a ${modal.user.displayName}?`,
      message: 'Va a poder ingresar otra vez y sus publicaciones vuelven a mostrarse en Explorar.',
      confirmLabel: 'Reactivar',
      onConfirm: () => attempt(() => adminUsersService.reactivate(modal.user.id), 'Cuenta reactivada'),
    },
    delete: {
      title: `¿Eliminar a ${modal.user.displayName}?`,
      message: 'Se borran su cuenta, su álbum, sus publicaciones y sus chats. Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar definitivamente',
      danger: true,
      onConfirm: () => attempt(() => adminUsersService.remove(modal.user.id, currentUser.id), 'Cuenta eliminada'),
    },
  }[modal.type]

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Administración"
        title="Gestión de usuarios"
        subtitle="Creá cuentas, asigná roles y suspendé a quienes no respeten las normas de la comunidad."
        actions={
          <Button icon={UserPlus} onClick={() => setModal({ type: 'form', user: null })}>
            Nuevo usuario
          </Button>
        }
      />

      <div className={styles.toolbar}>
        <Tabs
          tabs={[
            { value: 'all', label: 'Todos', count: counts.all },
            { value: 'activo', label: 'Activos', count: counts.activo },
            { value: 'suspendido', label: 'Suspendidos', count: counts.suspendido },
            { value: 'admin', label: 'Administradores', count: counts.admin },
          ]}
          value={tab}
          onChange={setTab}
        />
        <div className={styles.toolbarRow}>
          <Input
            icon={Search}
            type="search"
            placeholder="Buscar por nombre, usuario o email..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Buscar usuarios"
            className={styles.search}
          />
          <Select options={SORT_OPTIONS} value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Ordenar" />
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState icon={UsersRound} title="No hay usuarios que coincidan" description="Probá con otra búsqueda o pestaña." />
      ) : (
        <UsersTable
          users={users}
          currentUserId={currentUser.id}
          onEdit={(user) => setModal({ type: 'form', user })}
          onToggleRole={(user) => setModal({ type: 'role', user })}
          onSuspend={(user) => setModal({ type: 'suspend', user })}
          onReactivate={(user) => setModal({ type: 'reactivate', user })}
          onDelete={(user) => setModal({ type: 'delete', user })}
        />
      )}

      {modal?.type === 'form' && (
        <UserFormModal
          key={modal.user?.id ?? 'new'}
          user={modal.user}
          isSelf={modal.user?.id === currentUser.id}
          onClose={closeModal}
          onSubmit={handleFormSubmit}
        />
      )}
      {modal?.type === 'suspend' && <SuspendModal user={modal.user} onClose={closeModal} onConfirm={handleSuspend} />}
      <ConfirmDialog open={Boolean(confirmations)} onClose={closeModal} {...confirmations} />
    </div>
  )
}
