import { Outlet } from 'react-router'
import { MessageCircle, ShieldCheck, Star } from 'lucide-react'
import { CardImage } from '@/components/cards/CardTile/CardTile'
import { cardsService } from '@/services/cards'
import { Logo } from '../Logo/Logo'
import styles from './AuthLayout.module.css'

const SHOWCASE_CARDS = ['base1-2', 'base1-4', 'swsh7-215']

const HIGHLIGHTS = [
  { icon: ShieldCheck, text: 'Cartas verificadas por el equipo de Riolup' },
  { icon: MessageCircle, text: 'Chateá y coordiná la entrega sin salir de la app' },
  { icon: Star, text: 'Reputación real basada en reseñas de cada intercambio' },
]

export function AuthLayout() {
  const cards = SHOWCASE_CARDS.map((id) => cardsService.findById(id)).filter(Boolean)

  return (
    <div className={styles.layout}>
      <aside className={styles.brand}>
        <Logo to="/explorar" light />

        <div className={styles.showcase} aria-hidden>
          {cards.map((card, index) => (
            <div key={card.id} className={styles.showcaseCard} style={{ '--index': index - 1 }}>
              <CardImage card={card} size="large" />
            </div>
          ))}
        </div>

        <div className={styles.copy}>
          <h2>El mercado de cartas de tu provincia.</h2>
          <ul className={styles.highlights}>
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text}>
                <span className={styles.highlightIcon}>
                  <Icon size={18} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className={styles.content}>
        <div className={styles.mobileLogo}>
          <Logo to="/explorar" />
        </div>
        <div className={styles.formWrapper}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
