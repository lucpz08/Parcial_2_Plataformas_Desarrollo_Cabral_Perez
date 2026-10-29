import { ArrowLeftRight, Search, Tag } from 'lucide-react'
import { Badge } from '@/components/ui'
import { INTENTS, LISTING_STATUSES } from '@/data/constants'

const INTENT_CONFIG = {
  vender: { tone: 'primary', icon: Tag },
  cambiar: { tone: 'success', icon: ArrowLeftRight },
  busco: { tone: 'gold', icon: Search },
}

const STATUS_TONES = {
  disponible: 'success',
  reservado: 'warning',
  completado: 'neutral',
  cancelado: 'danger',
}

export function IntentBadge({ intent, variant = 'solid' }) {
  const { tone, icon } = INTENT_CONFIG[intent]
  const label = INTENTS.find((option) => option.value === intent).label
  return (
    <Badge tone={tone} icon={icon} variant={variant}>
      {label}
    </Badge>
  )
}

export function ListingStatusBadge({ status }) {
  return (
    <Badge tone={STATUS_TONES[status]} dot>
      {LISTING_STATUSES[status]}
    </Badge>
  )
}
