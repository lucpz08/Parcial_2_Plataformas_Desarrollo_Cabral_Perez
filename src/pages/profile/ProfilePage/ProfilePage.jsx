import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Handshake, Layers, Library, Star, UserX } from 'lucide-react'
import { Alert, Button, EmptyState, StatCard, Tabs } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useDatabase } from '@/hooks/useDatabase'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { chatsService } from '@/services/chats'
import { profilesService } from '@/services/profiles'
import { pluralize } from '@/utils/format'
import { ProfileHeader } from './ProfileHeader'
import { ClaimsTab, CollectionTab, ListingsTab, ReviewsTab } from './ProfileTabs'
import styles from './ProfilePage.module.css'

function ProfileContent({ profile, isOwn, canSeeAll, viewer }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState('listings')
  const { user, stats } = profile
  const firstName = user.displayName.split(' ')[0]
  const hidden = user.status !== 'activo' && !canSeeAll

  function handleMessage() {
    try {
      const conversation = chatsService.getOrCreate({ userId: viewer.id, peerId: user.id })
      navigate(`/chats/${conversation.id}`)
    } catch (error) {
      toast.error('No se pudo abrir el chat', error.message)
    }
  }

  const tabs = [
    { value: 'listings', label: 'Publicaciones', count: stats.activeListings },
    { value: 'reviews', label: 'Reseñas', count: stats.rating.count },
    { value: 'collection', label: 'Colección', count: profile.collection.length },
    ...(isOwn ? [{ value: 'claims', label: 'Mis reservas' }] : []),
  ]

  return (
    <div className={styles.page}>
      <ProfileHeader user={user} isOwn={isOwn} viewer={viewer} onMessage={handleMessage} />

      {hidden ? (
        <Alert tone="warning" title="Cuenta suspendida">
          Esta cuenta fue suspendida por el equipo de moderación y sus publicaciones no están visibles.
        </Alert>
      ) : (
        <>
          {user.status !== 'activo' && (
            <Alert tone="warning" title="Cuenta suspendida">
              {isOwn
                ? 'Tus publicaciones no se muestran en Explorar mientras la cuenta esté suspendida.'
                : 'Ves este perfil completo porque sos administrador.'}
            </Alert>
          )}

          <div className={styles.stats}>
            <StatCard
              icon={Star}
              tone="gold"
              label="Reputación"
              value={stats.rating.count > 0 ? stats.rating.average.toFixed(1) : '—'}
              hint={pluralize(stats.rating.count, 'reseña', 'reseñas')}
            />
            <StatCard
              icon={Handshake}
              tone="success"
              label="Transacciones"
              value={stats.completedTransactions}
              hint="Completadas"
            />
            <StatCard icon={Layers} label="Publicaciones" value={stats.activeListings} hint="Activas" />
            <StatCard icon={Library} label="Cartas" value={stats.cards} hint="En su álbum" />
          </div>

          <Tabs tabs={tabs} value={tab} onChange={setTab} />

          {tab === 'listings' && (
            <ListingsTab
              activeListings={profile.activeListings}
              pastListings={profile.pastListings}
              isOwn={isOwn}
              firstName={firstName}
            />
          )}
          {tab === 'reviews' && (
            <ReviewsTab reviews={profile.reviews} rating={stats.rating} firstName={firstName} isOwn={isOwn} />
          )}
          {tab === 'collection' && <CollectionTab collection={profile.collection} isOwn={isOwn} firstName={firstName} />}
          {tab === 'claims' && isOwn && <ClaimsTab userId={user.id} />}
        </>
      )}
    </div>
  )
}

export function ProfilePage() {
  useDatabase()
  const params = useParams()
  const { user: viewer, isAdmin } = useAuth()
  const userId = params.userId ?? viewer?.id
  const profile = userId ? profilesService.getProfile(userId) : null
  const isOwn = Boolean(viewer) && viewer.id === userId
  useDocumentTitle(profile ? (isOwn ? 'Mi perfil' : profile.user.displayName) : 'Perfil no encontrado')

  if (!profile) {
    return (
      <EmptyState
        icon={UserX}
        title="No encontramos este perfil"
        description="Puede que la cuenta se haya eliminado o que el enlace no sea correcto."
        action={
          <Button as={Link} to="/explorar">
            Ir a Explorar
          </Button>
        }
      />
    )
  }

  return <ProfileContent key={userId} profile={profile} isOwn={isOwn} canSeeAll={isOwn || isAdmin} viewer={viewer} />
}
