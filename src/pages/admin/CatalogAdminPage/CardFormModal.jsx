import { useState } from 'react'
import { ImageIcon, Plus, Save, Wand2 } from 'lucide-react'
import { CardImage } from '@/components/cards/CardTile/CardTile'
import { Alert, Button, Field, Input, Modal, Select } from '@/components/ui'
import { CARD_RARITIES, CARD_TYPES } from '@/data/constants'
import { cardsService } from '@/services/cards'
import { catalogAdminService } from '@/services/catalogAdmin'
import { formatPrice } from '@/utils/format'
import { wait } from '@/utils/validation'
import styles from './CatalogAdminPage.module.css'

const NEW_SET = '__new__'

function toForm(card) {
  return {
    name: card?.name ?? '',
    setChoice: card?.setId ?? '',
    setId: card?.setId ?? '',
    setName: card?.setName ?? '',
    setTotal: card ? String(card.setTotal) : '',
    number: card?.number ?? '',
    type: card?.type ?? '',
    rarity: card?.rarity ?? '',
    referencePrice: card ? String(card.referencePrice) : '',
    imageSmall: card?.imageSmall ?? '',
    imageLarge: card?.imageLarge ?? '',
    active: card?.active ?? true,
  }
}

export function CardFormModal({ card, onClose, onSubmit }) {
  const editing = Boolean(card)
  const sets = cardsService.getSets()
  const [form, setForm] = useState(() => toForm(card))
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')
  const validation = catalogAdminService.validate(form, card?.id ?? null)
  const errors = attempted ? validation : {}
  const isNewSet = form.setChoice === NEW_SET

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function chooseSet(value) {
    const set = sets.find((candidate) => candidate.id === value)
    setForm((current) => ({
      ...current,
      setChoice: value,
      setId: set?.id ?? '',
      setName: set?.name ?? '',
      setTotal: set ? String(set.total) : '',
    }))
  }

  function fillImages() {
    setForm((current) => ({ ...current, ...catalogAdminService.buildImageUrls(current.setId, current.number) }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setAttempted(true)
    setServerError('')
    if (Object.keys(validation).length > 0) return
    setSaving(true)
    await wait(400)
    try {
      onSubmit(form)
    } catch (error) {
      setServerError(error.message)
      setSaving(false)
    }
  }

  const preview = {
    name: form.name || 'Nueva carta',
    setName: form.setName || 'Expansión',
    number: form.number || '?',
    setTotal: form.setTotal || '?',
    imageSmall: form.imageSmall || null,
    imageLarge: form.imageLarge || null,
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={editing ? `Editar ${card.name}` : 'Nueva carta'}
      description={
        editing
          ? 'La expansión y el número forman el identificador de la carta y no se pueden cambiar.'
          : 'Va a aparecer en el catálogo para que los coleccionistas la agreguen a su álbum.'
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="card-form" icon={editing ? Save : Plus} loading={saving}>
            {editing ? 'Guardar cambios' : 'Agregar al catálogo'}
          </Button>
        </>
      }
    >
      <form id="card-form" className={styles.cardForm} onSubmit={handleSubmit} noValidate>
        <div className={styles.cardFormPreview}>
          <div className={styles.previewImage}>
            <CardImage key={preview.imageSmall ?? 'empty'} card={preview} />
          </div>
          <strong>{preview.name}</strong>
          <span>
            {preview.setName} · {preview.number}/{preview.setTotal}
          </span>
          {form.referencePrice && !errors.referencePrice && <span>{formatPrice(Number(form.referencePrice))}</span>}
        </div>

        <div className={styles.cardFormFields}>
          {serverError && <Alert tone="danger">{serverError}</Alert>}

          <Field label="Nombre" error={errors.name} required>
            <Input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Ej: Charizard" />
          </Field>

          <div className={styles.formGrid}>
            <Field label="Expansión" error={!isNewSet ? errors.setId : undefined} required>
              <Select
                options={[...sets.map((set) => ({ value: set.id, label: `${set.name} (${set.id})` })), { value: NEW_SET, label: '+ Nueva expansión…' }]}
                placeholder="Elegí una expansión"
                value={form.setChoice}
                onChange={(event) => chooseSet(event.target.value)}
                disabled={editing}
              />
            </Field>
            <Field label="Número" error={errors.number} required>
              <Input value={form.number} onChange={(event) => update('number', event.target.value)} placeholder="Ej: 4" disabled={editing} />
            </Field>
          </div>

          {isNewSet && (
            <div className={styles.newSet}>
              <Field label="Código" error={errors.setId} required>
                <Input value={form.setId} onChange={(event) => update('setId', event.target.value)} placeholder="ej: sv4" />
              </Field>
              <Field label="Nombre de la expansión" error={errors.setName} required>
                <Input value={form.setName} onChange={(event) => update('setName', event.target.value)} placeholder="ej: Paradox Rift" />
              </Field>
              <Field label="Total" error={errors.setTotal} required>
                <Input type="number" min="1" value={form.setTotal} onChange={(event) => update('setTotal', event.target.value)} />
              </Field>
            </div>
          )}

          <div className={styles.formGrid}>
            <Field label="Tipo" error={errors.type} required>
              <Select options={CARD_TYPES} placeholder="Elegí un tipo" value={form.type} onChange={(event) => update('type', event.target.value)} />
            </Field>
            <Field label="Rareza" error={errors.rarity} required>
              <Select
                options={CARD_RARITIES}
                placeholder="Elegí una rareza"
                value={form.rarity}
                onChange={(event) => update('rarity', event.target.value)}
              />
            </Field>
          </div>

          <Field label="Precio de referencia (ARS)" hint="Se usa para valuar álbumes y detectar precios sospechosos." error={errors.referencePrice} required>
            <Input
              type="number"
              min="1"
              step="1000"
              value={form.referencePrice}
              onChange={(event) => update('referencePrice', event.target.value)}
            />
          </Field>

          <div className={styles.imagesHeader}>
            <span>Imágenes</span>
            <Button type="button" variant="ghost" size="sm" icon={Wand2} onClick={fillImages} disabled={!form.setId || !form.number}>
              Completar desde pokemontcg.io
            </Button>
          </div>
          <Field label="Imagen chica (URL)" error={errors.imageSmall}>
            <Input icon={ImageIcon} type="url" value={form.imageSmall} onChange={(event) => update('imageSmall', event.target.value)} />
          </Field>
          <Field label="Imagen grande (URL)" error={errors.imageLarge}>
            <Input icon={ImageIcon} type="url" value={form.imageLarge} onChange={(event) => update('imageLarge', event.target.value)} />
          </Field>

          <label className={styles.activeToggle}>
            <input type="checkbox" checked={form.active} onChange={(event) => update('active', event.target.checked)} />
            Visible en el catálogo para los coleccionistas
          </label>
        </div>
      </form>
    </Modal>
  )
}
