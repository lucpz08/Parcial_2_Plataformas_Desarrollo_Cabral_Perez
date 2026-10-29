const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isEmail(value) {
  return EMAIL_PATTERN.test(value.trim())
}

export function isBlank(value) {
  return !value || !String(value).trim()
}

const USERNAME_PATTERN = /^[a-z0-9._]{3,20}$/

export function isValidUsername(value) {
  return USERNAME_PATTERN.test(value.trim().toLowerCase())
}

export function getPasswordStrength(password) {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++
  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Excelente']
  return { score, label: labels[score] }
}

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
