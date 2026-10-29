import { Link } from 'react-router'
import { Layers, MapPinned, Plus, UserPlus, Users } from 'lucide-react'
import { CardImage } from '@/components/cards/CardTile/CardTile'
import { Button } from '@/components/ui'
import styles from './ExplorePage.module.css'

export function ExploreHero({ user, stats, featuredCards }) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroText}>
        <span className={styles.heroEyebrow}>Mercado Riolup</span>
        <h1>{user ? `¿Qué carta buscás hoy, ${user.displayName.split(' ')[0]}?` : 'Comprá, vendé y cambiá cartas'}</h1>
        <p>Publicaciones de coleccionistas de todo el país, con reputación real y cartas verificadas.</p>

        <div className={styles.heroStats}>
          <span>
            <Layers size={16} />
            <strong>{stats.listings}</strong> publicaciones
          </span>
          <span>
            <Users size={16} />
            <strong>{stats.sellers}</strong> coleccionistas
          </span>
          <span>
            <MapPinned size={16} />
            <strong>{stats.provinces}</strong> provincias
          </span>
        </div>

        {user ? (
          <Button as={Link} to="/publicar" variant="gold" icon={Plus}>
            Publicar una carta
          </Button>
        ) : (
          <Button as={Link} to="/registro" variant="gold" icon={UserPlus}>
            Crear cuenta gratis
          </Button>
        )}
      </div>

      <div className={styles.heroCards} aria-hidden>
        {featuredCards.map((card, index) => (
          <div key={card.id} className={styles.heroCard} style={{ '--index': index }}>
            <CardImage card={card} />
          </div>
        ))}
      </div>
    </section>
  )
}
