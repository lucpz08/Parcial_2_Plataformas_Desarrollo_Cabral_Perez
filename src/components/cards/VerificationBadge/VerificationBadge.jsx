import { BadgeCheck, Clock, ShieldOff, ShieldQuestion } from 'lucide-react'
import { Badge } from '@/components/ui'
import { VERIFICATION_STATUSES } from '@/data/constants'

const CONFIG = {
  none: { tone: 'neutral', icon: ShieldQuestion },
  pending: { tone: 'warning', icon: Clock },
  verified: { tone: 'success', icon: BadgeCheck },
  rejected: { tone: 'danger', icon: ShieldOff },
}

export function VerificationBadge({ status = 'none', compact = false }) {
  const { tone, icon } = CONFIG[status]
  return (
    <Badge tone={tone} icon={icon}>
      {compact ? null : VERIFICATION_STATUSES[status]}
    </Badge>
  )
}
