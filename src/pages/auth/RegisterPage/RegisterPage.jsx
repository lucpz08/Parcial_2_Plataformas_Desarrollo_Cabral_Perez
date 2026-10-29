import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { ArrowLeft, ArrowRight, AtSign, Lock, Mail, MapPin, User, UserPlus } from 'lucide-react'
import { Alert, Button, Field, Input, Select } from '@/components/ui'
import { PROVINCES } from '@/data/constants'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/hooks/useToast'
import { usersService } from '@/services/users'
import { isBlank, isEmail, isValidUsername } from '@/utils/validation'
import { PasswordStrength } from './PasswordStrength'
import { Stepper } from './Stepper'
import styles from './RegisterPage.module.css'

const STEPS = ['Tu cuenta', 'Tu perfil']

const INITIAL_FORM = {
  email: '',
  password: '',
  confirmPassword: '',
  displayName: '',
  username: '',
  province: '',
  city: '',
  acceptTerms: false,
}

function validateAccount(form) {
  const errors = {}
  if (isBlank(form.email)) errors.email = 'Ingresá tu email.'
  else if (!isEmail(form.email)) errors.email = 'El email no tiene un formato válido.'
  else if (usersService.findByEmail(form.email)) errors.email = 'Ya existe una cuenta con ese email.'

  if (isBlank(form.password)) errors.password = 'Creá una contraseña.'
  else if (form.password.length < 6) errors.password = 'Tiene que tener al menos 6 caracteres.'

  if (isBlank(form.confirmPassword)) errors.confirmPassword = 'Repetí la contraseña.'
  else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden.'
  return errors
}

function validateProfile(form) {
  const errors = {}
  if (isBlank(form.displayName)) errors.displayName = 'Ingresá tu nombre.'
  else if (form.displayName.trim().length < 3) errors.displayName = 'Tiene que tener al menos 3 caracteres.'

  if (isBlank(form.username)) errors.username = 'Elegí un nombre de usuario.'
  else if (!isValidUsername(form.username)) errors.username = 'Entre 3 y 20 caracteres: letras, números, punto o guion bajo.'
  else if (usersService.findByUsername(form.username)) errors.username = 'Ese nombre de usuario ya está en uso.'

  if (isBlank(form.province)) errors.province = 'Elegí tu provincia.'
  if (!form.acceptTerms) errors.acceptTerms = 'Tenés que aceptar las normas de la comunidad.'
  return errors
}

function getUsernameStatus(username) {
  if (!username || !isValidUsername(username)) return { hint: 'Así te van a encontrar otros coleccionistas.' }
  if (usersService.findByUsername(username)) return { error: 'Ese nombre de usuario ya está en uso.' }
  return { hint: `✓ @${username.toLowerCase()} está disponible` }
}

export function RegisterPage() {
  useDocumentTitle('Crear cuenta')
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user && !submitting) return <Navigate to="/explorar" replace />

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setServerError('')
  }

  function handleNext(event) {
    event.preventDefault()
    const validationErrors = validateAccount(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length === 0) setStep(1)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateProfile(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      const newUser = await register(form)
      toast.success(`¡Bienvenido/a, ${newUser.displayName.split(' ')[0]}!`, 'Tu cuenta fue creada. Empezá cargando tus cartas.')
      navigate('/album', { replace: true })
    } catch (error) {
      if (error.field === 'email') setStep(0)
      if (error.field) setErrors({ [error.field]: error.message })
      else setServerError(error.message)
      setSubmitting(false)
    }
  }

  const usernameStatus = getUsernameStatus(form.username)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Creá tu cuenta</h1>
        <p className="text-muted">Sumate a la comunidad de coleccionistas de Riolup.</p>
      </header>

      <Stepper steps={STEPS} current={step} />

      {serverError && (
        <Alert tone="danger" title="No pudimos crear tu cuenta">
          {serverError}
        </Alert>
      )}

      {step === 0 ? (
        <form key="account" className={styles.form} onSubmit={handleNext} noValidate>
          <Field label="Email" error={errors.email} required>
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

          <Field label="Contraseña" error={errors.password} required>
            <Input
              icon={Lock}
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
            />
          </Field>
          <PasswordStrength password={form.password} />

          <Field label="Repetí la contraseña" error={errors.confirmPassword} required>
            <Input
              icon={Lock}
              type="password"
              autoComplete="new-password"
              placeholder="Repetí tu contraseña"
              value={form.confirmPassword}
              onChange={(event) => updateField('confirmPassword', event.target.value)}
            />
          </Field>

          <Button type="submit" size="lg" iconRight={ArrowRight} fullWidth>
            Continuar
          </Button>
        </form>
      ) : (
        <form key="profile" className={styles.form} onSubmit={handleSubmit} noValidate>
          <Field label="Nombre y apellido" error={errors.displayName} required>
            <Input
              icon={User}
              autoComplete="name"
              placeholder="Ej: Camila Sosa"
              value={form.displayName}
              onChange={(event) => updateField('displayName', event.target.value)}
              autoFocus
            />
          </Field>

          <Field
            label="Nombre de usuario"
            error={errors.username ?? usernameStatus.error}
            hint={usernameStatus.hint}
            required
          >
            <Input
              icon={AtSign}
              autoComplete="username"
              placeholder="ej: cami.cards"
              value={form.username}
              onChange={(event) => updateField('username', event.target.value.replace(/\s/g, ''))}
            />
          </Field>

          <div className={styles.row}>
            <Field label="Provincia" error={errors.province} required>
              <Select
                options={PROVINCES}
                placeholder="Elegí una"
                value={form.province}
                onChange={(event) => updateField('province', event.target.value)}
              />
            </Field>
            <Field label="Ciudad" hint="Opcional">
              <Input
                icon={MapPin}
                placeholder="Ej: Rosario"
                value={form.city}
                onChange={(event) => updateField('city', event.target.value)}
              />
            </Field>
          </div>

          <div>
            <label className={styles.terms}>
              <input
                type="checkbox"
                checked={form.acceptTerms}
                onChange={(event) => updateField('acceptTerms', event.target.checked)}
                aria-invalid={Boolean(errors.acceptTerms)}
              />
              <span>
                Acepto las normas de la comunidad: publicar cartas reales, describir su estado con honestidad y
                tratar con respeto a otros coleccionistas.
              </span>
            </label>
            {errors.acceptTerms && <p className={styles.termsError}>{errors.acceptTerms}</p>}
          </div>

          <div className={styles.actions}>
            <Button variant="outline" size="lg" icon={ArrowLeft} onClick={() => setStep(0)} disabled={submitting}>
              Atrás
            </Button>
            <Button type="submit" size="lg" icon={UserPlus} loading={submitting} fullWidth>
              Crear cuenta
            </Button>
          </div>
        </form>
      )}

      <p className={styles.switch}>
        ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
      </p>
    </div>
  )
}
