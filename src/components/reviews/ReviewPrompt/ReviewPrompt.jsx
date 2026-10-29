import { Star } from 'lucide-react'
import { Button, StarRating } from '@/components/ui'
import { cx } from '@/utils/cx'
import styles from './ReviewPrompt.module.css'

export function ReviewPrompt({ context, onReview, compact = false }) {
  if (!context?.counterpart) return null
  const firstName = context.counterpart.displayName.split(' ')[0]

  if (context.myReview) {
    return (
      <div className={cx(styles.prompt, styles.done, compact && styles.compact)}>
        <span>Calificaste a {firstName}</span>
        <StarRating value={context.myReview.rating} size={14} />
      </div>
    )
  }

  return (
    <div className={cx(styles.prompt, compact && styles.compact)}>
      <span className={styles.icon}>
        <Star size={18} />
      </span>
      <div className={styles.text}>
        <strong>¿Cómo te fue con {firstName}?</strong>
        <span>
          {context.theirReview ? `${firstName} ya te calificó. ` : ''}Tu reseña ayuda a toda la comunidad.
        </span>
      </div>
      <Button size="sm" variant="gold" onClick={onReview}>
        Calificar
      </Button>
    </div>
  )
}
