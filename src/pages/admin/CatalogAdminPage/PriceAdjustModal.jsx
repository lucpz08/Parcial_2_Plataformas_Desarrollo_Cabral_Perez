import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { Button, Field, Input, Modal, Select } from '@/components/ui'
import { cardsService } from '@/services/cards'
import { catalogAdminService } from '@/services/catalogAdmin'
import { formatPrice, pluralize } from '@/utils/format'
import styles from './CatalogAdminPage.module.css'

const PRESETS = [-10, 5, 10, 25]

export function PriceAdjustModal({ onClose, onSubmit }) {
  const sets = cardsService.getSets()
  const [setId, setSetId] = useState('')
  const [percent, setPercent] = useState('10')
  const [error, setError] = useState('')
  const value = Number(percent)
  const affected = cardsService.search({ setId, includeInactive: true })
  const safePercent = Number.isFinite(value) ? value : 0
  const sample = affected.slice(0, 4)

  function handleConfirm() {
    try {
      onSubmit({ setId, percent })
    } catch (submitError) {
      setError(submitError.message)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Ajustar precios de referencia"
      description="Útil cuando cambia el mercado o la cotización. Se redondea a miles."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button icon={TrendingUp} onClick={handleConfirm}>
            Aplicar a {pluralize(affected.length, 'carta', 'cartas')}
          </Button>
        </>
      }
    >
      <div className={styles.adjust}>
        <div className={styles.formGrid}>
          <Field label="Expansión">
            <Select
              options={sets.map((set) => ({ value: set.id, label: set.name }))}
              placeholder="Todo el catálogo"
              value={setId}
              onChange={(event) => setSetId(event.target.value)}
            />
          </Field>
          <Field label="Variación (%)" error={error}>
            <Input
              type="number"
              step="1"
              value={percent}
              onChange={(event) => {
                setPercent(event.target.value)
                setError('')
              }}
            />
          </Field>
        </div>
        <div className={styles.presets}>
          {PRESETS.map((preset) => (
            <button key={preset} type="button" onClick={() => setPercent(String(preset))}>
              {preset > 0 ? `+${preset}` : preset}%
            </button>
          ))}
        </div>

        <div className={styles.adjustPreview}>
          <span className="label">Vista previa</span>
          <ul>
            {sample.map((card) => (
              <li key={card.id}>
                <span>{card.name}</span>
                <span className={styles.muted}>{formatPrice(card.referencePrice)}</span>
                <span>→</span>
                <strong>{formatPrice(catalogAdminService.adjustedPrice(card.referencePrice, safePercent))}</strong>
              </li>
            ))}
          </ul>
          {affected.length > sample.length && (
            <span className={styles.muted}>y {pluralize(affected.length - sample.length, 'carta más', 'cartas más')}</span>
          )}
        </div>
      </div>
    </Modal>
  )
}
