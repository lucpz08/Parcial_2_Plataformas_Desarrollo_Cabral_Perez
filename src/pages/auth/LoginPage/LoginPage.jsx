import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { Lock, LogIn, Mail } from 'lucide-react'
import { Alert, Button, Field, Input } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { isBlank, isEmail } from '@/utils/validation'
import { DemoAccounts } from './DemoAccounts'
import styles from './LoginPage.module.css'

function validate({ email, password }) {
  const errors = {}
  if (isBlank(email)) errors.email = 'Ingresá tu email.'
  else if (!isEmail(email)) errors.email = 'El email no tiene un formato válido.'
  if (isBlank(password)) errors.password = 'Ingresá tu contraseña.'
  return errors
}

function getHomePath(user) {
  return user.role === 'admin' ? '/admin' : '/explorar'
}

export function LoginPage() {
  useDocumentTitle('Iniciar sesión')
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const [form, setForm] = useState({ email: '', password: '', remember: true })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user && !submitting) return <Navigate to={getHomePath(user)} replace />

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setServerError('')
  }

  async function signIn(credentials) {
    const validationErrors = validate(credentials)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    setServerError('')
    try {
      const loggedUser = await login(credentials.email, credentials.password, credentials.remember)
      toast.success(`¡Hola, ${loggedUser.displayName.split(' ')[0]}!`, 'Iniciaste sesión correctamente.')
      navigate(location.state?.from ?? getHomePath(loggedUser), { replace: true })
    } catch (error) {
      setServerError(error.message)
      setSubmitting(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    signIn(form)
  }

  function handleDemoSelect(account) {
    const credentials = { email: account.email, password: account.password, remember: form.remember }
    setForm(credentials)
    setErrors({})
    signIn(credentials)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>¡Hola de nuevo!</h1>
        <p className="text-muted">Ingresá para gestionar tu álbum y tus publicaciones.</p>
      </header>

      {location.state?.from && !serverError && (
        <Alert tone="info">Iniciá sesión para continuar.</Alert>
      )}
      {serverError && (
        <Alert tone="danger" title="No pudimos iniciar sesión">
          {serverError}
        </Alert>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Field label="Email" error={errors.email}>
          <Input
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="vos@ejemplo.com"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            autoFocus
          />
        </Field>

        <Field label="Contraseña" error={errors.password}>
          <Input
            icon={Lock}
            type="password"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            value={form.password}
            onChange={(event) => updateField('password', event.target.value)}
          />
        </Field>

        <label className={styles.remember}>
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(event) => updateField('remember', event.target.checked)}
          />
          Mantener la sesión iniciada
        </label>

        <Button type="submit" size="lg" icon={LogIn} loading={submitting} fullWidth>
          Ingresar
        </Button>
      </form>

      <p className={styles.switch}>
        ¿Todavía no tenés cuenta? <Link to="/registro">Creá una gratis</Link>
      </p>

      <DemoAccounts onSelect={handleDemoSelect} disabled={submitting} />
    </div>
  )
}
