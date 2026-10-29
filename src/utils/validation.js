const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isEmail(value) {
  return EMAIL_PATTERN.test(value.trim())
}

export function isBlank(value) {
  return !value || !String(value).trim()
}

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
