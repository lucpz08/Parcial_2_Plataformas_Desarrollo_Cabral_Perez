import { Link } from 'react-router'
import { ArrowLeft, BadgeCheck, Layers, Scale, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { CardImage } from '@/components/cards/CardTile/CardTile'
import { VerificationBadge } from '@/components/cards/VerificationBadge/VerificationBadge'
import { BarList } from '@/components/charts/BarList'
import { ChartCard } from '@/components/charts/ChartCard'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Button, EmptyState, StatCard } from '@/components/ui'
import { CONDITION_LABELS, CONDITION_VALUE_FACTORS, CONDITIONS, VERIFIED_VALUE_BONUS } from '@/data/constants'
import { useAuth } from '@/hooks/useAuth'
import { useDatabase } from '@/hooks/useDatabase'
import { valuationService } from '@/services/valuation'
import { cx } from '@/utils/cx'
import { formatCompactPrice, formatPrice, pluralize } from '@/utils/format'
import styles from './ValuationPage.module.css'

function MarketDelta({ item }) {
  if (item.lowestPrice == null) return <span className={styles.muted}>Sin ofertas</span>
  const diff = Math.round(((item.lowestPrice - item.unitValue) / item.unitValue) * 100)
  const up = diff >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span className={cx(styles.delta, up ? styles.up : styles.down)}>
      <Icon size={13} />
      {formatPrice(item.lowestPrice)} ({up ? '+' : ''}
      {diff}%)
    </span>
  )
}

export function ValuationPage() {
  useDatabase()
  const { user } = useAuth()
  const valuation = valuationService.getForUser(user.id)
  const adjustmentUp = valuation.conditionAdjustment >= 0

  const header = (
    <PageHeader
      eyebrow="Mi colección"
      title="Valuación del álbum"
      subtitle="Una estimación según el precio de referencia, el estado de cada carta y si está verificada."
      actions={
        <Button as={Link} to="/album" variant="outline" icon={ArrowLeft}>
          Volver al álbum
        </Button>
      }
    />
  )

  if (valuation.cards === 0) {
    return (
      <div className={styles.page}>
        {header}
        <EmptyState
          icon={Wallet}
          title="Tu álbum está vacío"
          description="Agregá cartas desde el catálogo para ver cuánto vale tu colección."
          action={
            <Button as={Link} to="/album/catalogo">
              Ir al catálogo
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {header}

      <section className={styles.hero}>
        <span className="label">Valor estimado de tu colección</span>
        <strong>{formatPrice(valuation.total)}</strong>
        <p>
          {pluralize(valuation.cards, 'carta', 'cartas')} · {adjustmentUp ? '+' : '−'}
          {formatPrice(Math.abs(valuation.conditionAdjustment))} respecto del valor de referencia por estado y verificación
        </p>
      </section>

      <div className={styles.stats}>
        <StatCard icon={Scale} label="Valor de referencia" value={formatCompactPrice(valuation.referenceTotal)} hint="Todas en near mint" />
        <StatCard
          icon={adjustmentUp ? TrendingUp : TrendingDown}
          tone={adjustmentUp ? 'success' : 'danger'}
          label="Ajuste por estado"
          value={`${adjustmentUp ? '+' : '−'}${formatCompactPrice(Math.abs(valuation.conditionAdjustment))}`}
          hint="Mint suma, jugadas restan"
        />
        <StatCard
          icon={BadgeCheck}
          tone="gold"
          label="Valor verificado"
          value={`${Math.round(valuation.verifiedShare * 100)}%`}
          hint={`Las verificadas suman ${Math.round(VERIFIED_VALUE_BONUS * 100)}%`}
        />
      </div>

      <div className={styles.charts}>
        <ChartCard
          title="Por expansión"
          subtitle="Valor estimado de cada expansión"
          table={{
            columns: ['Expansión', 'Cartas', 'Valor'],
            rows: valuation.bySet.map((row) => [row.label, row.cards, formatPrice(row.value)]),
          }}
        >
          <BarList data={valuation.bySet} label="Valor por expansión" formatValue={formatCompactPrice} />
        </ChartCard>
        <ChartCard
          title="Por estado"
          subtitle="Cuánto aporta cada condición"
          table={{
            columns: ['Estado', 'Cartas', 'Valor'],
            rows: valuation.byCondition.map((row) => [row.label, row.cards, formatPrice(row.value)]),
          }}
        >
          <BarList data={valuation.byCondition} label="Valor por estado" formatValue={formatCompactPrice} />
        </ChartCard>
      </div>

      <section className={styles.tableSection}>
        <header>
          <h2>Detalle por carta</h2>
          <span className={styles.muted}>
            Factores: {CONDITIONS.map(({ value }) => `${CONDITION_LABELS[value]} ×${CONDITION_VALUE_FACTORS[value]}`).join(' · ')}
          </span>
        </header>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Carta</th>
                <th scope="col">Estado</th>
                <th scope="col" className={styles.numeric}>
                  Cant.
                </th>
                <th scope="col" className={styles.numeric}>
                  Referencia
                </th>
                <th scope="col" className={styles.numeric}>
                  Valor unitario
                </th>
                <th scope="col" className={styles.numeric}>
                  Total
                </th>
                <th scope="col" className={styles.numeric}>
                  Menor oferta hoy
                </th>
              </tr>
            </thead>
            <tbody>
              {valuation.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.cardCell}>
                      <span className={styles.thumb}>
                        <CardImage card={item.card} />
                      </span>
                      <div>
                        <strong>{item.card.name}</strong>
                        <span>{item.card.setName}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.condition}>
                      {CONDITION_LABELS[item.condition]}
                      {item.verification === 'verified' && <VerificationBadge status="verified" compact />}
                    </div>
                  </td>
                  <td className={styles.numeric}>{item.quantity}</td>
                  <td className={styles.numeric}>{formatPrice(item.card.referencePrice)}</td>
                  <td className={styles.numeric}>{formatPrice(item.unitValue)}</td>
                  <td className={styles.numeric}>
                    <strong>{formatPrice(item.totalValue)}</strong>
                  </td>
                  <td className={styles.numeric}>
                    <MarketDelta item={item} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5}>
                  <span className={styles.footLabel}>
                    <Layers size={14} />
                    Total del álbum
                  </span>
                </td>
                <td className={styles.numeric}>
                  <strong>{formatPrice(valuation.total)}</strong>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <p className={styles.muted}>
          “Menor oferta hoy” compara tu valor unitario con la publicación en venta más barata de esa carta en Explorar.
        </p>
      </section>
    </div>
  )
}
