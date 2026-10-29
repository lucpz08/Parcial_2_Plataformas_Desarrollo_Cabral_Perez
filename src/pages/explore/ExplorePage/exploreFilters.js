export const FILTER_KEYS = ['q', 'intent', 'province', 'condition', 'min', 'max', 'verified', 'sort']

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
]

function toNumber(value) {
  if (value === null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

export function readFilters(searchParams) {
  return {
    q: searchParams.get('q') ?? '',
    intent: searchParams.get('intent') ?? '',
    province: searchParams.get('province') ?? '',
    condition: searchParams.get('condition') ?? '',
    min: searchParams.get('min') ?? '',
    max: searchParams.get('max') ?? '',
    verified: searchParams.get('verified') === '1',
    sort: searchParams.get('sort') ?? 'recent',
  }
}

export function toSearchOptions(filters) {
  return {
    query: filters.q,
    intent: filters.intent,
    province: filters.province,
    condition: filters.condition,
    minPrice: toNumber(filters.min),
    maxPrice: toNumber(filters.max),
    verifiedOnly: filters.verified,
    sort: filters.sort,
  }
}

export function countActiveFilters(filters) {
  return ['intent', 'province', 'condition', 'min', 'max'].filter((key) => filters[key]).length + (filters.verified ? 1 : 0)
}
