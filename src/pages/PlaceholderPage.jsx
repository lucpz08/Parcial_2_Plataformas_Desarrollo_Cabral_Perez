import { Construction } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { EmptyState } from '@/components/ui'

export function PlaceholderPage({ eyebrow, title, subtitle, icon = Construction }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <EmptyState
        icon={icon}
        title="Pantalla en construcción"
        description="Esta sección se está desarrollando y va a estar disponible muy pronto."
      />
    </>
  )
}
