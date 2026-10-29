import { useState } from 'react'
import { Link } from 'react-router'
import { Library, Plus, Search, ShieldCheck } from 'lucide-react'
import { CardImage } from '@/components/cards/CardTile/CardTile'
import { Alert, Button, Chip, Field, Modal, QuantityInput, Select, Textarea } from '@/components/ui'
import { CONDITION_LABELS, CONDITIONS, LANGUAGES } from '@/data/constants'
import { collectionService } from '@/services/collection'
import { formatPrice } from '@/utils/format'
import styles from './CatalogPage.module.css'

const INITIAL_FORM = {
  condition: 'near_mint',
  language: 'ES',
  quantity: 1,
  notes: '',
  requestVerification: false,
}

export function AddToAlbumModal({ card, userId, onClose, onAdded }) {
  const [form, setForm] = useState(INITIAL_FORM)

  if (!card) return null

  const duplicate = collectionService.findDuplicate({
    userId,
    cardId: card.id,
    condition: form.condition,
    language: form.language,
  })

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const result = collectionService.addCard({ userId, cardId: card.id, ...form })
    onAdded(card, result)
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Agregar al álbum"
      description="Contanos en qué estado está tu carta."
      footer={
        <>
          <Button as={Link} to={`/publicar?busco=${card.id}`} variant="ghost" icon={Search} className={styles.wantedLink}>
            No la tengo, la busco
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="add-to-album" icon={duplicate ? Library : Plus}>
            {duplicate ? `Sumar ${form.quantity} al álbum` : 'Agregar al álbum'}
          </Button>
        </>
      }
    >
      <div className={styles.addLayout}>
        <div className={styles.addPreview}>
          <div className={styles.addImage}>
            <CardImage card={card} size="large" />
          </div>
          <strong>{card.name}</strong>
          <span className="text-muted">
            {card.setName} · {card.number}/{card.setTotal}
          </span>
          <span className={styles.addPrice}>Ref. {formatPrice(card.referencePrice)}</span>
        </div>

        <form id="add-to-album" className={styles.addForm} onSubmit={handleSubmit}>
          <fieldset className={styles.conditionField}>
            <legend>Estado de la carta</legend>
            <div className={styles.conditionChips} role="radiogroup">
              {CONDITIONS.map((condition) => (
                <Chip
                  key={condition.value}
                  selected={form.condition === condition.value}
                  onClick={() => update('condition', condition.value)}
                >
                  {condition.label}
                </Chip>
              ))}
            </div>
          </fieldset>

          <div className={styles.addRow}>
            <Field label="Idioma">
              <Select options={LANGUAGES} value={form.language} onChange={(event) => update('language', event.target.value)} />
            </Field>
            <Field label="Cantidad">
              <QuantityInput value={form.quantity} onChange={(value) => update('quantity', value)} />
            </Field>
          </div>

          <Field label="Notas" hint="Opcional. Por ejemplo: detalles del borde, si es primera edición, etc.">
            <Textarea
              rows={3}
              maxLength={200}
              placeholder="Algo que quieras recordar sobre esta carta..."
              value={form.notes}
              onChange={(event) => update('notes', event.target.value)}
            />
          </Field>

          <label className={styles.verifyOption}>
            <input
              type="checkbox"
              checked={form.requestVerification}
              onChange={(event) => update('requestVerification', event.target.checked)}
            />
            <span className={styles.verifyIcon}>
              <ShieldCheck size={18} />
            </span>
            <span>
              <strong>Solicitar verificación</strong>
              <small>El equipo de Riolup revisa la carta y le agrega el sello de verificada.</small>
            </span>
          </label>

          {duplicate && (
            <Alert tone="info" title="Ya tenés esta carta">
              Tenés {duplicate.quantity} en estado {CONDITION_LABELS[duplicate.condition]} ({duplicate.language}). Se va a
              sumar la cantidad en lugar de crear una entrada nueva.
            </Alert>
          )}
        </form>
      </div>
    </Modal>
  )
}
