import { useState } from 'react'
import { ArrowLeftRight, Search, Sparkles, Tag } from 'lucide-react'
import { CardImage } from '@/components/cards/CardTile/CardTile'
import { VerificationBadge } from '@/components/cards/VerificationBadge/VerificationBadge'
import { ListingCard } from '@/components/listings/ListingCard/ListingCard'
import { Alert, Button, Field, Input, Select, Textarea } from '@/components/ui'
import {
  CONDITION_LABELS,
  INTENTS,
  LANGUAGE_LABELS,
  LISTING_MAX_DESCRIPTION,
  PROVINCES,
} from '@/data/constants'
import { cx } from '@/utils/cx'
import { formatPrice, pluralize } from '@/utils/format'
import { wait } from '@/utils/validation'
import { buildPreviewListing, PRICE_COPY, validateListingForm } from './publishForm'
import styles from './PublishPage.module.css'

const INTENT_ICONS = { vender: Tag, cambiar: ArrowLeftRight, busco: Search }

function EntryRow({ entry, intent, price, error, onPriceChange, active, onPreview }) {
  const { card, collectionItem } = entry
  const priceCopy = PRICE_COPY[intent]

  return (
    <li className={cx(styles.entry, active && styles.entryActive)}>
      <button type="button" className={styles.entryThumb} onClick={onPreview} aria-label={`Ver vista previa de ${card.name}`}>
        <CardImage card={card} />
      </button>
      <div className={styles.entryInfo}>
        <strong>{card.name}</strong>
        <span>
          {card.setName} · {card.number}/{card.setTotal}
        </span>
        {collectionItem && (
          <span className={styles.entryTags}>
            {CONDITION_LABELS[collectionItem.condition]} · {LANGUAGE_LABELS[collectionItem.language]}
            <VerificationBadge status={collectionItem.verification} compact />
          </span>
        )}
      </div>
      {priceCopy && (
        <div className={styles.entryPrice}>
          <Field label={priceCopy.label} error={error} required={intent === 'vender'}>
            <Input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              placeholder={intent === 'busco' ? 'A convenir' : '0'}
              value={price ?? ''}
              onChange={(event) => onPriceChange(event.target.value)}
            />
          </Field>
          {card.referencePrice && (
            <button type="button" className={styles.reference} onClick={() => onPriceChange(String(card.referencePrice))}>
              Referencia: {formatPrice(card.referencePrice)}
            </button>
          )}
        </div>
      )}
    </li>
  )
}

export function ListingForm({ entries, allowedIntents, initialValues, seller, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues)
  const [attempted, setAttempted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [previewKey, setPreviewKey] = useState(entries[0].key)

  const errors = attempted ? validateListingForm(values, entries) : null
  const previewEntry = entries.find((entry) => entry.key === previewKey) ?? entries[0]
  const multiple = entries.length > 1
  const intents = INTENTS.filter((intent) => allowedIntents.includes(intent.value))
  const hasPrices = values.intent !== 'cambiar'

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function updatePrice(key, value) {
    setValues((current) => ({ ...current, prices: { ...current.prices, [key]: value } }))
  }

  function applyReferencePrices() {
    setValues((current) => ({
      ...current,
      prices: Object.fromEntries(entries.map((entry) => [entry.key, String(entry.card.referencePrice ?? '')])),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setAttempted(true)
    setServerError('')
    if (!validateListingForm(values, entries).valid) return

    setSubmitting(true)
    await wait(500)
    try {
      onSubmit(values)
    } catch (error) {
      setServerError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.layout} onSubmit={handleSubmit} noValidate>
      <div className={styles.form}>
        {serverError && (
          <Alert tone="danger" title="No pudimos guardar la publicación">
            {serverError}
          </Alert>
        )}

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2>Tipo de publicación</h2>
            {multiple && <span>Se aplica a las {entries.length} cartas</span>}
          </header>
          <div className={styles.intents} role="radiogroup" aria-label="Tipo de publicación">
            {intents.map(({ value, label, description }) => {
              const Icon = INTENT_ICONS[value]
              const checked = values.intent === value
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  className={cx(styles.intent, styles[value], checked && styles.intentChecked)}
                  onClick={() => update('intent', value)}
                >
                  <span className={styles.intentIcon}>
                    <Icon size={20} />
                  </span>
                  <strong>{label}</strong>
                  <span>{description}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2>{multiple ? pluralize(entries.length, 'carta', 'cartas') : 'Carta'}</h2>
            {hasPrices && entries.some((entry) => entry.card.referencePrice) && (
              <Button type="button" variant="ghost" size="sm" icon={Sparkles} onClick={applyReferencePrices}>
                {multiple ? 'Usar precios de referencia' : 'Usar precio de referencia'}
              </Button>
            )}
          </header>
          <ul className={styles.entries}>
            {entries.map((entry) => (
              <EntryRow
                key={entry.key}
                entry={entry}
                intent={values.intent}
                price={values.prices[entry.key]}
                error={errors?.prices[entry.key]}
                onPriceChange={(value) => updatePrice(entry.key, value)}
                active={multiple && entry.key === previewEntry.key}
                onPreview={() => setPreviewKey(entry.key)}
              />
            ))}
          </ul>
          {values.intent === 'cambiar' && (
            <p className={styles.sectionHint}>Las publicaciones para cambio no llevan precio: lo acordás por chat.</p>
          )}
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2>Detalles</h2>
          </header>
          <Field
            label="Descripción"
            hint={`${values.description.length}/${LISTING_MAX_DESCRIPTION} · Contá el estado real, cómo entregás o qué cartas aceptás.`}
            error={errors?.description}
          >
            <Textarea
              rows={4}
              maxLength={LISTING_MAX_DESCRIPTION + 50}
              placeholder={
                values.intent === 'busco'
                  ? 'Ej: Busco en near mint o mejor, preferentemente en español.'
                  : 'Ej: Sin marcas, siempre en folio. Entrego en mano o envío por correo.'
              }
              value={values.description}
              onChange={(event) => update('description', event.target.value)}
            />
          </Field>
          <Field label="Provincia" hint="Ayuda a encontrar coleccionistas cerca tuyo.">
            <Select
              options={PROVINCES}
              placeholder="Sin especificar"
              value={values.province}
              onChange={(event) => update('province', event.target.value)}
            />
          </Field>
        </section>

        <div className={styles.footer}>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" size="lg" loading={submitting}>
            {submitLabel}
          </Button>
        </div>
      </div>

      <aside className={styles.preview} aria-label="Vista previa">
        <span className="label">Así se verá en Explorar</span>
        <ListingCard listing={buildPreviewListing({ entry: previewEntry, values, seller })} isOwn preview />
        {multiple && (
          <p className={styles.previewHint}>Tocá la miniatura de cada carta para ver su vista previa.</p>
        )}
      </aside>
    </form>
  )
}
