import { useState } from 'react'
import { AtSign, KeyRound, Mail, Save, UserPlus } from 'lucide-react'
import { Alert, Button, Field, Input, Modal, Select } from '@/components/ui'
import { PROVINCES, ROLE_LABELS, ROLES } from '@/data/constants'
import { adminUsersService } from '@/services/adminUsers'
import { wait } from '@/utils/validation'
import styles from './AdminUsersPage.module.css'

const ROLE_OPTIONS = Object.values(ROLES).map((role) => ({ value: role, label: ROLE_LABELS[role] }))

function toForm(user) {
  return {
    displayName: user?.displayName ?? '',
    username: user?.username ?? '',
    email: user?.email ?? '',
    password: '',
    role: user?.role ?? ROLES.COLECCIONISTA,
    province: user?.province ?? '',
    city: user?.city ?? '',
  }
}

export function UserFormModal({ user, isSelf, onClose, onSubmit }) {
  const editing = Boolean(user)
  const [form, setForm] = useState(() => toForm(user))
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')
  const validation = adminUsersService.validate(form, user?.id ?? null)
  const errors = attempted ? validation : {}

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setAttempted(true)
    setServerError('')
    if (Object.keys(validation).length > 0) return

    setSaving(true)
    await wait(400)
    try {
      onSubmit(form)
    } catch (error) {
      setServerError(error.message)
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? `Editar a ${user.displayName}` : 'Nuevo usuario'}
      description={editing ? 'Los cambios se aplican al instante.' : 'La cuenta queda activa y puede ingresar enseguida.'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="user-form" icon={editing ? Save : UserPlus} loading={saving}>
            {editing ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </>
      }
    >
      <form id="user-form" className={styles.form} onSubmit={handleSubmit} noValidate>
        {serverError && <Alert tone="danger">{serverError}</Alert>}
        <div className={styles.formGrid}>
          <Field label="Nombre visible" error={errors.displayName} required>
            <Input value={form.displayName} onChange={(event) => update('displayName', event.target.value)} maxLength={40} />
          </Field>
          <Field label="Nombre de usuario" error={errors.username} required>
            <Input icon={AtSign} value={form.username} onChange={(event) => update('username', event.target.value)} maxLength={20} />
          </Field>
        </div>
        <Field label="Email" error={errors.email} required>
          <Input icon={Mail} type="email" value={form.email} onChange={(event) => update('email', event.target.value)} />
        </Field>
        <div className={styles.formGrid}>
          <Field
            label={editing ? 'Nueva contraseña' : 'Contraseña inicial'}
            hint={editing ? 'Dejala vacía para no cambiarla.' : 'Compartila con la persona por un canal seguro.'}
            error={errors.password}
            required={!editing}
          >
            <Input
              icon={KeyRound}
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
            />
          </Field>
          <Field
            label="Rol"
            hint={isSelf ? 'No podés cambiar tu propio rol.' : 'Los administradores también son coleccionistas.'}
            error={errors.role}
            required
          >
            <Select
              options={ROLE_OPTIONS}
              value={form.role}
              onChange={(event) => update('role', event.target.value)}
              disabled={isSelf}
            />
          </Field>
        </div>
        <div className={styles.formGrid}>
          <Field label="Provincia">
            <Select
              options={PROVINCES}
              placeholder="Sin especificar"
              value={form.province}
              onChange={(event) => update('province', event.target.value)}
            />
          </Field>
          <Field label="Ciudad">
            <Input value={form.city} onChange={(event) => update('city', event.target.value)} maxLength={40} />
          </Field>
        </div>
      </form>
    </Modal>
  )
}
