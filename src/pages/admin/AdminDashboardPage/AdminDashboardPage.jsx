import { Link } from 'react-router'
import {
  BadgeCheck,
  ChevronRight,
  Clock,
  Flag,
  Handshake,
  Layers,
  MessageSquareQuote,
  ShieldAlert,
  Star,
  Ticket,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react'
import { BarList } from '@/components/charts/BarList'
import { ChartCard } from '@/components/charts/ChartCard'
import { ColumnChart } from '@/components/charts/ColumnChart'
import { StackedBar } from '@/components/charts/StackedBar'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Avatar, StarRating, StatCard } from '@/components/ui'
import { useDatabase } from '@/hooks/useDatabase'
import { adminService } from '@/services/admin'
import { cx } from '@/utils/cx'
import { formatCompactPrice, formatPrice, formatRelative, pluralize } from '@/utils/format'
import styles from './AdminDashboardPage.module.css'

const INTENT_COLORS = {
  vender: 'var(--chart-vender)',
  cambiar: 'var(--chart-cambiar)',
  busco: 'var(--chart-busco)',
}

const ACTIVITY_ICONS = {
  user: UserPlus,
  listing: Layers,
  claim: Ticket,
  completed: Handshake,
  review: MessageSquareQuote,
}

function AttentionItem({ icon: Icon, count, label, description, to, tone }) {
  const content = (
    <>
      <span className={cx(styles.attentionIcon, count > 0 && styles[tone])}>
        <Icon size={18} />
      </span>
      <div className={styles.attentionText}>
        <strong>
          {count} {label}
        </strong>
        <span>{description}</span>
      </div>
      {to && <ChevronRight size={18} className={styles.attentionArrow} />}
    </>
  )

  return <li>{to ? <Link to={to} className={styles.attentionItem}>{content}</Link> : <div className={styles.attentionItem}>{content}</div>}</li>
}

export function AdminDashboardPage() {
  useDatabase()
  const { kpis, weeklyListings, intentMix, provinces, attention, topCollectors, activity } = adminService.getDashboard()
  const weeklyTotal = weeklyListings.reduce((sum, week) => sum + week.value, 0)

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Administración"
        title="Dashboard"
        subtitle="El pulso del mercado Riolup: usuarios, publicaciones y transacciones."
      />

      <div className={styles.kpis}>
        <StatCard
          icon={Users}
          label="Usuarios activos"
          value={kpis.activeUsers}
          hint={`+${kpis.newUsers} en los últimos 30 días`}
        />
        <StatCard
          icon={Layers}
          label="Publicaciones disponibles"
          value={kpis.availableListings}
          hint={`${kpis.reservedListings} reservadas ahora`}
        />
        <StatCard
          icon={Handshake}
          tone="success"
          label="Transacciones"
          value={kpis.completedTransactions}
          hint={`${formatCompactPrice(kpis.volume)} en ventas`}
        />
        <StatCard
          icon={Star}
          tone="gold"
          label="Reputación promedio"
          value={kpis.reviewCount ? kpis.averageRating.toFixed(1) : '—'}
          hint={pluralize(kpis.reviewCount, 'reseña', 'reseñas')}
        />
      </div>

      <div className={styles.grid}>
        <ChartCard
          title="Publicaciones nuevas por semana"
          subtitle={`Últimas 8 semanas · ${pluralize(weeklyTotal, 'publicación', 'publicaciones')}`}
          table={{
            columns: ['Semana del', 'Publicaciones'],
            rows: weeklyListings.map((week) => [week.label, week.value]),
          }}
        >
          <ColumnChart
            data={weeklyListings}
            label="Publicaciones nuevas por semana"
            formatTooltip={(week) => `Semana del ${week.label}: ${pluralize(week.value, 'publicación', 'publicaciones')}`}
          />
        </ChartCard>

        <section className={styles.attention}>
          <h2>Requiere atención</h2>
          <ul>
            <AttentionItem
              icon={BadgeCheck}
              tone="warning"
              count={attention.pendingVerifications}
              label={attention.pendingVerifications === 1 ? 'verificación pendiente' : 'verificaciones pendientes'}
              description="Cartas esperando revisión de fotos"
              to="/admin/moderacion?tab=verificaciones"
            />
            <AttentionItem
              icon={Flag}
              tone="danger"
              count={attention.pendingReports}
              label={attention.pendingReports === 1 ? 'publicación denunciada' : 'publicaciones denunciadas'}
              description="Reportes de la comunidad sin resolver"
              to="/admin/moderacion?tab=denuncias"
            />
            <AttentionItem
              icon={Clock}
              tone="warning"
              count={attention.staleReservations}
              label={attention.staleReservations === 1 ? 'reserva demorada' : 'reservas demoradas'}
              description="Activas hace más de 7 días"
              to="/admin/moderacion?tab=reservas"
            />
            <AttentionItem
              icon={UserX}
              tone="danger"
              count={attention.suspendedUsers}
              label={attention.suspendedUsers === 1 ? 'cuenta suspendida' : 'cuentas suspendidas'}
              description="Revisá si corresponde reactivarlas"
              to="/admin/usuarios"
            />
          </ul>
        </section>

        <ChartCard
          title="Disponibles por tipo"
          subtitle={pluralize(kpis.availableListings, 'publicación disponible', 'publicaciones disponibles')}
          table={{
            columns: ['Tipo', 'Publicaciones'],
            rows: intentMix.map((item) => [item.label, item.value]),
          }}
        >
          <StackedBar
            label="Publicaciones disponibles por tipo"
            segments={intentMix.map((item) => ({ ...item, color: INTENT_COLORS[item.key] }))}
          />
        </ChartCard>

        <ChartCard
          title="Disponibles por provincia"
          subtitle="Dónde está la oferta hoy"
          table={{
            columns: ['Provincia', 'Publicaciones'],
            rows: provinces.map((item) => [item.label, item.value]),
          }}
        >
          <BarList data={provinces} label="Publicaciones disponibles por provincia" />
        </ChartCard>

        <section className={styles.panel}>
          <header>
            <h2>Coleccionistas destacados</h2>
            <Link to="/admin/usuarios">Ver todos</Link>
          </header>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Coleccionista</th>
                <th scope="col">Reputación</th>
                <th scope="col">Transacciones</th>
                <th scope="col">Activas</th>
              </tr>
            </thead>
            <tbody>
              {topCollectors.map(({ user, rating, transactions, activeListings }) => (
                <tr key={user.id}>
                  <td>
                    <Link to={`/usuarios/${user.id}`} className={styles.collector}>
                      <Avatar name={user.displayName} src={user.avatarUrl} size={30} />
                      <span>
                        <strong>{user.displayName}</strong>
                        <em>{user.province ?? 'Sin provincia'}</em>
                      </span>
                    </Link>
                  </td>
                  <td>
                    {rating.count > 0 ? (
                      <span className={styles.rating}>
                        <StarRating value={rating.average} size={12} />
                        {rating.average.toFixed(1)}
                      </span>
                    ) : (
                      <span className={styles.muted}>Sin reseñas</span>
                    )}
                  </td>
                  <td>{transactions}</td>
                  <td>{activeListings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.panel}>
          <header>
            <h2>Actividad reciente</h2>
            <span className={styles.muted}>Volumen total {formatPrice(kpis.volume)}</span>
          </header>
          <ol className={styles.activity}>
            {activity.map((event) => {
              const Icon = ACTIVITY_ICONS[event.type] ?? ShieldAlert
              return (
                <li key={event.id}>
                  <span className={cx(styles.activityIcon, styles[event.type])}>
                    <Icon size={15} />
                  </span>
                  <Link to={event.to}>{event.text}</Link>
                  <time dateTime={event.at}>{formatRelative(event.at)}</time>
                </li>
              )
            })}
          </ol>
        </section>
      </div>
    </div>
  )
}
