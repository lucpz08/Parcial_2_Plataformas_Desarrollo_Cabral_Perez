import { useSearchParams } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Tabs } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useDatabase } from '@/hooks/useDatabase'
import { moderationService } from '@/services/moderation'
import { ListingsReview } from './ListingsReview'
import { ReportsQueue } from './ReportsQueue'
import { StaleReservations } from './StaleReservations'
import { VerificationQueue } from './VerificationQueue'
import styles from './ModerationPage.module.css'

const TABS = ['verificaciones', 'denuncias', 'publicaciones', 'reservas']

export function ModerationPage() {
  useDatabase()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get('tab')
  const tab = TABS.includes(requested) ? requested : TABS[0]
  const counts = moderationService.getCounts()

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Administración"
        title="Moderación"
        subtitle="Verificá cartas, atendé denuncias y mantené el mercado confiable."
      />

      <Tabs
        tabs={[
          { value: 'verificaciones', label: 'Verificaciones', count: counts.verifications },
          { value: 'denuncias', label: 'Denuncias', count: counts.reports },
          { value: 'publicaciones', label: 'Publicaciones con alertas', count: counts.flagged },
          { value: 'reservas', label: 'Reservas demoradas', count: counts.staleReservations },
        ]}
        value={tab}
        onChange={(value) => setSearchParams({ tab: value }, { replace: true })}
      />

      {tab === 'verificaciones' && <VerificationQueue adminId={user.id} />}
      {tab === 'denuncias' && <ReportsQueue adminId={user.id} />}
      {tab === 'publicaciones' && <ListingsReview adminId={user.id} />}
      {tab === 'reservas' && <StaleReservations adminId={user.id} />}
    </div>
  )
}
