export const ROLES = {
  ADMIN: 'admin',
  COLECCIONISTA: 'coleccionista',
}

export const ROLE_LABELS = {
  admin: 'Administrador',
  coleccionista: 'Coleccionista',
}

export const USER_STATUSES = {
  activo: 'Activo',
  suspendido: 'Suspendido',
}

export const PROVINCES = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
]

export const CONDITIONS = [
  { value: 'mint', label: 'Mint', short: 'M' },
  { value: 'near_mint', label: 'Near Mint', short: 'NM' },
  { value: 'excellent', label: 'Excelente', short: 'EX' },
  { value: 'good', label: 'Buena', short: 'GD' },
  { value: 'played', label: 'Jugada', short: 'PL' },
  { value: 'poor', label: 'Mala', short: 'PR' },
]

export const CONDITION_LABELS = Object.fromEntries(CONDITIONS.map((condition) => [condition.value, condition.label]))

export const LANGUAGES = [
  { value: 'ES', label: 'Español' },
  { value: 'EN', label: 'Inglés' },
  { value: 'JP', label: 'Japonés' },
]

export const LANGUAGE_LABELS = Object.fromEntries(LANGUAGES.map((language) => [language.value, language.label]))

export const CARD_TYPES = [
  'Fuego',
  'Agua',
  'Planta',
  'Eléctrico',
  'Psíquico',
  'Lucha',
  'Siniestro',
  'Incoloro',
]

export const INTENTS = [
  { value: 'vender', label: 'Vender', description: 'Ofrecés la carta a cambio de dinero' },
  { value: 'cambiar', label: 'Cambiar', description: 'Buscás intercambiarla por otra carta' },
  { value: 'busco', label: 'Busco', description: 'Querés conseguir esta carta' },
]

export const LISTING_STATUSES = {
  disponible: 'Disponible',
  reservado: 'Reservado',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

export const CLAIM_STATUSES = {
  active: 'Activa',
  cancelled: 'Cancelada',
  completed: 'Completada',
}

export const VERIFICATION_STATUSES = {
  none: 'Sin verificar',
  pending: 'En revisión',
  verified: 'Verificada',
  rejected: 'Rechazada',
}

export const CURRENCY = 'ARS'

export const LISTING_MAX_PRICE = 100000000

export const LISTING_MAX_DESCRIPTION = 500

export const MESSAGE_MAX_LENGTH = 1000

export const PROFILE_BIO_MAX_LENGTH = 280

export const REVIEW_COMMENT_MAX_LENGTH = 500

export const RATING_LABELS = {
  1: 'Muy mala',
  2: 'Mala',
  3: 'Regular',
  4: 'Buena',
  5: 'Excelente',
}

export const REVIEW_TAGS = [
  'Carta como se describió',
  'Buena comunicación',
  'Envío rápido',
  'Pago al instante',
  'Embalaje cuidado',
  'Puntual en el encuentro',
]
