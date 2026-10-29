import { useState } from 'react'
import { AtSign, ImageIcon, Mail, Save } from 'lucide-react'
import { Alert, Avatar, Button, Field, Input, Select, Textarea } from '@/components/ui'
import { PROFILE_BIO_MAX_LENGTH, PROVINCES } from '@/data/constants'
import { useToast } from '@/hooks/useToast'
import { profilesService } from '@/services/profiles'
import { wait } from '@/utils/validation'
import styles from './EditProfilePage.module.css'

function toForm(user) {
  return {
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    bio: user.bio ?? '',
    province: user.province ?? '',
    city: user.city ?? '',
    avatarUrl: user.avatarUrl ?? '',
  }
}

export function ProfileForm({ user, onChange }) {
  const toast = useToast()
  const [initial, setInitial] = useState(() => toForm(user))
  const [form, setForm] = useState(initial)
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')

  const validation = profilesService.validateProfile(user.id, form)
  const errors = attempted ? validation : {}
  const dirty = Object.keys(form).some((key) => form[key] !== initial[key])
  const usernameChanged = form.username.trim().toLowerCase() !== user.username
  const usernameError = validation.username
  const usernameHint =
    usernameChanged && !usernameError
      ? `✓ @${form.username.trim().toLowerCase()} está disponible`
      : `Tu perfil: riolup.com/@${user.username}`

  function update(field, value) {
    const next = { ...form, [field]: value }
    setForm(next)
    onChange(next)
  }

  function reset() {
    setForm(initial)
    onChange(initial)
    setAttempted(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setAttempted(true)
    setServerError('')
    if (Object.keys(validation).length > 0) return

    setSaving(true)
    await wait(500)
    try {
      const updated = profilesService.updateProfile(user.id, form)
      const saved = toForm(updated)
      setInitial(saved)
      setForm(saved)
      onChange(saved)
      setAttempted(false)
      toast.success('Perfil actualizado')
    } catch (error) {
      setServerError(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={styles.section} onSubmit={handleSubmit} noValidate>
      <header className={styles.sectionHeader}>
        <h2>Datos del perfil</h2>
        <p>Lo que ven los demás coleccionistas en tu perfil público y en tus publicaciones.</p>
      </header>

      {serverError && <Alert tone="danger">{serverError}</Alert>}

      <div className={styles.avatarRow}>
        <Avatar name={form.displayName || user.displayName} src={form.avatarUrl.trim() || null} size={72} />
        <Field label="Foto de perfil (URL)" hint="Opcional. Si la dejás vacía usamos tus iniciales." error={errors.avatarUrl}>
          <Input
            icon={ImageIcon}
            type="url"
            placeholder="https://..."
            value={form.avatarUrl}
            onChange={(event) => update('avatarUrl', event.target.value)}
          />
        </Field>
      </div>

      <div className={styles.grid}>
        <Field label="Nombre visible" error={errors.displayName} required>
          <Input value={form.displayName} onChange={(event) => update('displayName', event.target.value)} maxLength={40} />
        </Field>
        <Field label="Nombre de usuario" hint={usernameHint} error={errors.username ?? (usernameChanged ? usernameError : undefined)} required>
          <Input
            icon={AtSign}
            value={form.username}
            onChange={(event) => update('username', event.target.value)}
            autoComplete="username"
            maxLength={20}
          />
        </Field>
      </div>

      <Field label="Email" hint="Lo usás para ingresar. No se muestra en tu perfil." error={errors.email} required>
        <Input icon={Mail} type="email" value={form.email} onChange={(event) => update('email', event.target.value)} autoComplete="email" />
      </Field>

      <Field label="Bio" hint={`${form.bio.length}/${PROFILE_BIO_MAX_LENGTH} · Qué coleccionás, qué buscás, cómo preferís entregar.`} error={errors.bio}>
        <Textarea rows={3} value={form.bio} onChange={(event) => update('bio', event.target.value)} />
      </Field>

      <div className={styles.grid}>
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

      <footer className={styles.footer}>
        {dirty && <span className={styles.unsaved}>Tenés cambios sin guardar</span>}
        <Button type="button" variant="ghost" onClick={reset} disabled={!dirty || saving}>
          Descartar
        </Button>
        <Button type="submit" icon={Save} loading={saving} disabled={!dirty}>
          Guardar cambios
        </Button>
      </footer>
    </form>
  )
}
