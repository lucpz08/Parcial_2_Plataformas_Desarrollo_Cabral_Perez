import { BadgeCheck, Layers, Store, Wallet } from 'lucide-react'
import { StatCard } from '@/components/ui'
import { formatPrice, pluralize } from '@/utils/format'
import styles from './AlbumPage.module.css'

export function AlbumStats({ stats }) {
  return (
    <div className={styles.stats}>
      <StatCard
        icon={Wallet}
        label="Valor estimado"
        value={formatPrice(stats.estimatedValue)}
        hint="Según precios de referencia"
        highlight
      />
      <StatCard
        icon={Layers}
        label="Cartas en el álbum"
        value={stats.totalCards}
        hint={pluralize(stats.uniqueCards, 'carta única', 'cartas únicas')}
      />
      <StatCard
        icon={BadgeCheck}
        label="Verificadas"
        value={stats.verified}
        hint={stats.uniqueCards ? `${Math.round((stats.verified / stats.uniqueCards) * 100)}% de tu colección` : '—'}
        tone="success"
      />
      <StatCard icon={Store} label="Publicadas" value={stats.published} hint="En venta o cambio" tone="gold" />
    </div>
  )
}
