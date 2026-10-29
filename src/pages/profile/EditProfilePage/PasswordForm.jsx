import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { Button, Field, Input } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { PasswordStrength } from '@/pages/auth/RegisterPage/PasswordStrength'
import { profilesService } from '@/services/profiles'
import { isBlank, wait } from '@/utils/validation'
import styles from './EditProfilePage.module.css'

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' }

function validate(form) {
  const errors = {}
  if (isBlank(form.currentPassword)) errors.currentPassword = 'Ingresá tu contraseña actual.'
  if (form.newPassword.length < 6) errors.newPassword = 'Usá al menos 6 caracteres.'
  if (form.confirmPassword !== form.newPassword) errors.confirmPassword = 'Las contraseñas no coinciden.'
  return errors
}

export function PasswordForm({ userId }) {
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    await wait(500)
    try {
      profilesService.changePassword(userId, form)
      setForm(EMPTY)
      toast.success('Contraseña actualizada', 'La próxima vez ingresá con la nueva.')
    } catch (error) {
      setErrors({ [error.field ?? 'currentPassword']: error.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={styles.section} onSubmit={handleSubmit} noValidate>
      <header className={styles.sectionHeader}>
        <h2>Seguridad</h2>
        <p>Cambiá tu contraseña. Te vamos a pedir la actual para confirmar que sos vos.</p>
      </header>

      <Field label="Contraseña actual" error={errors.currentPassword} required>
        <Input
          type="password"
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={(event) => update('currentPassword', event.target.value)}
        />
      </Field>
      <div className={styles.grid}>
        <Field label="Nueva contraseña" error={errors.newPassword} required>
          <Input
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(event) => update('newPassword', event.target.value)}
          />
        </Field>
        <Field label="Repetí la nueva contraseña" error={errors.confirmPassword} required>
          <Input
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(event) => update('confirmPassword', event.target.value)}
          />
        </Field>
      </div>
      <PasswordStrength password={form.newPassword} />

      <footer className={styles.footer}>
        <Button type="submit" variant="outline" icon={KeyRound} loading={saving}>
          Cambiar contraseña
        </Button>
      </footer>
    </form>
  )
}
