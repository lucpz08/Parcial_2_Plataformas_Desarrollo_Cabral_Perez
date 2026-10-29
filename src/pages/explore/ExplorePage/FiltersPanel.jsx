import { ArrowLeftRight, BadgeCheck, LayoutGrid, MapPin, RotateCcw, Search, Tag } from 'lucide-react'
import { Button, Field, Input, Select } from '@/components/ui'
import { CONDITIONS, PROVINCES } from '@/data/constants'
import { cx } from '@/utils/cx'
import styles from './ExplorePage.module.css'

const INTENT_OPTIONS = [
  { value: '', label: 'Todas', icon: LayoutGrid },
  { value: 'vender', label: 'Venta', icon: Tag },
  { value: 'cambiar', label: 'Cambio', icon: ArrowLeftRight },
  { value: 'busco', label: 'Busco', icon: Search },
]

export function FiltersPanel({ filters, onChange, onReset, activeCount, userProvince }) {
  return (
    <aside className={styles.panel} aria-label="Filtros">
      <div className={styles.panelHeader}>
        <h2>Filtros</h2>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onReset}>
            Limpiar ({activeCount})
          </Button>
        )}
      </div>

      <fieldset className={styles.panelSection}>
        <legend>Tipo de publicación</legend>
        <div className={styles.intents}>
          {INTENT_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className={cx(styles.intentOption, value && styles[value], filters.intent === value && styles.intentActive)}
              onClick={() => onChange('intent', value)}
              aria-pressed={filters.intent === value}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className={styles.panelSection}>
        <Field label="Provincia">
          <Select
            options={PROVINCES}
            placeholder="Todo el país"
            value={filters.province}
            onChange={(event) => onChange('province', event.target.value)}
          />
        </Field>
        {userProvince && filters.province !== userProvince && (
          <button type="button" className={styles.nearMe} onClick={() => onChange('province', userProvince)}>
            <MapPin size={14} />
            Ver solo {userProvince}
          </button>
        )}
      </div>

      <fieldset className={styles.panelSection}>
        <legend>Precio (ARS)</legend>
        <div className={styles.priceRange}>
          <Input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Mínimo"
            value={filters.min}
            onChange={(event) => onChange('min', event.target.value)}
            aria-label="Precio mínimo"
          />
          <span>—</span>
          <Input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Máximo"
            value={filters.max}
            onChange={(event) => onChange('max', event.target.value)}
            aria-label="Precio máximo"
          />
        </div>
        <p className={styles.panelHint}>Las publicaciones para cambio no tienen precio y se ocultan al filtrar.</p>
      </fieldset>

      <div className={styles.panelSection}>
        <Field label="Estado de la carta">
          <Select
            options={CONDITIONS}
            placeholder="Cualquier estado"
            value={filters.condition}
            onChange={(event) => onChange('condition', event.target.value)}
          />
        </Field>
      </div>

      <label className={styles.toggle}>
        <input
          type="checkbox"
          role="switch"
          checked={filters.verified}
          onChange={(event) => onChange('verified', event.target.checked)}
        />
        <span className={styles.toggleTrack} aria-hidden />
        <span className={styles.toggleLabel}>
          <BadgeCheck size={16} />
          Solo cartas verificadas
        </span>
      </label>
    </aside>
  )
}
