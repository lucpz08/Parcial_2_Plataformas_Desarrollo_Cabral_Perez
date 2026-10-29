import { useState } from 'react'
import { Send } from 'lucide-react'
import { CardImage } from '@/components/cards/CardTile/CardTile'
import { Alert, Button, Chip, Field, Modal, StarRating, Textarea } from '@/components/ui'
import { RATING_LABELS, REVIEW_COMMENT_MAX_LENGTH, REVIEW_TAGS } from '@/data/constants'
import { useToast } from '@/hooks/useToast'
import { feedbackService } from '@/services/feedback'
import { wait } from '@/utils/validation'
import styles from './ReviewModal.module.css'

const INITIAL = { rating: 0, tags: [], comment: '' }

export function ReviewModal({ context, userId, onClose }) {
  const toast = useToast()
  const [form, setForm] = useState(INITIAL)
  const [attempted, setAttempted] = useState(false)
  const [sending, setSending] = useState(false)
  const [serverError, setServerError] = useState('')

  const open = Boolean(context)
  const errors = attempted ? feedbackService.validate(form) : {}
  const counterpartName = context?.counterpart?.displayName ?? ''
  const firstName = counterpartName.split(' ')[0]

  function close() {
    setForm(INITIAL)
    setAttempted(false)
    setServerError('')
    onClose()
  }

  function toggleTag(tag) {
    setForm((current) => ({
      ...current,
      tags: current.tags.includes(tag) ? current.tags.filter((other) => other !== tag) : [...current.tags, tag],
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setAttempted(true)
    setServerError('')
    if (Object.keys(feedbackService.validate(form)).length > 0) return

    setSending(true)
    await wait(500)
    try {
      feedbackService.submit({ claimId: context.claim.id, reviewerId: userId, ...form })
      toast.success('¡Gracias por tu reseña!', `Ayudás a que la comunidad sepa con quién operar.`)
      close()
    } catch (error) {
      setServerError(error.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={`Calificá a ${firstName}`}
      description="Tu reseña es pública, aparece en su perfil y no se puede editar."
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={sending}>
            Más tarde
          </Button>
          <Button type="submit" form="review-form" icon={Send} loading={sending}>
            Publicar reseña
          </Button>
        </>
      }
    >
      {context && (
        <form id="review-form" className={styles.form} onSubmit={handleSubmit} noValidate>
          {serverError && <Alert tone="danger">{serverError}</Alert>}

          <div className={styles.transaction}>
            <span className={styles.thumb}>
              <CardImage card={context.listing.card} />
            </span>
            <div>
              <strong>{context.listing.card.name}</strong>
              <span>
                {context.role === 'buyer' ? `Se la compraste a ${counterpartName}` : `Se la vendiste a ${counterpartName}`}
              </span>
            </div>
          </div>

          <div className={styles.stars}>
            <StarRating value={form.rating} onChange={(rating) => setForm((current) => ({ ...current, rating }))} size={38} />
            <span className={styles.ratingLabel}>
              {form.rating ? RATING_LABELS[form.rating] : '¿Cómo fue la experiencia?'}
            </span>
            {errors.rating && <span className={styles.error}>{errors.rating}</span>}
          </div>

          <fieldset className={styles.tags}>
            <legend>¿Qué destacarías? (opcional)</legend>
            <div>
              {REVIEW_TAGS.map((tag) => (
                <Chip key={tag} selected={form.tags.includes(tag)} onClick={() => toggleTag(tag)}>
                  {tag}
                </Chip>
              ))}
            </div>
          </fieldset>

          <Field
            label="Comentario"
            hint={`${form.comment.length}/${REVIEW_COMMENT_MAX_LENGTH}${form.rating && form.rating <= 2 ? ' · Obligatorio para calificaciones bajas' : ''}`}
            error={errors.comment}
          >
            <Textarea
              rows={3}
              placeholder={`Contá cómo fue operar con ${firstName}...`}
              value={form.comment}
              onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
            />
          </Field>
        </form>
      )}
    </Modal>
  )
}
