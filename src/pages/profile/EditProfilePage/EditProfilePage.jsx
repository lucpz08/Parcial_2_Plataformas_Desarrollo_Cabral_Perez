import { useState } from 'react'
import { Link } from 'react-router'
import { Eye, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Avatar, Button, StarRating } from '@/components/ui'
import { ROLE_LABELS } from '@/data/constants'
import { useAuth } from '@/hooks/useAuth'
import { PasswordForm } from './PasswordForm'
import { ProfileForm } from './ProfileForm'
import styles from './EditProfilePage.module.css'

function ProfilePreview({ user, draft }) {
  const place = [draft.city.trim(), draft.province].filter(Boolean).join(', ')

  return (
    <aside className={styles.preview} aria-label="Vista previa del perfil">
      <span className="label">Vista previa</span>
      <div className={styles.previewCard}>
        <div className={styles.previewCover} aria-hidden />
        <Avatar
          name={draft.displayName || user.displayName}
          src={draft.avatarUrl.trim() || null}
          size={72}
          className={styles.previewAvatar}
        />
        <strong>{draft.displayName || 'Tu nombre'}</strong>
        <span className={styles.previewUsername}>@{draft.username.trim().toLowerCase() || 'usuario'}</span>
        <StarRating value={user.rating.average} count={user.rating.count} size={13} showValue />
        {place && (
          <span className={styles.previewPlace}>
            <MapPin size={13} />
            {place}
          </span>
        )}
        <p className={styles.previewBio}>{draft.bio.trim() || 'Sin bio todavía.'}</p>
      </div>
      <dl className={styles.account}>
        <div>
          <dt>Rol</dt>
          <dd>{ROLE_LABELS[user.role]}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>{user.status === 'activo' ? 'Activa' : 'Suspendida'}</dd>
        </div>
      </dl>
    </aside>
  )
}

export function EditProfilePage() {
  const { user } = useAuth()
  const [draft, setDraft] = useState(() => ({
    displayName: user.displayName,
    username: user.username,
    bio: user.bio ?? '',
    province: user.province ?? '',
    city: user.city ?? '',
    avatarUrl: user.avatarUrl ?? '',
  }))

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Cuenta"
        title="Editar perfil"
        subtitle="Mantené tus datos al día para generar confianza con otros coleccionistas."
        actions={
          <Button as={Link} to="/perfil" variant="outline" icon={Eye}>
            Ver mi perfil
          </Button>
        }
      />
      <div className={styles.layout}>
        <div className={styles.forms}>
          <ProfileForm user={user} onChange={setDraft} />
          <PasswordForm userId={user.id} />
        </div>
        <ProfilePreview user={user} draft={draft} />
      </div>
    </div>
  )
}
