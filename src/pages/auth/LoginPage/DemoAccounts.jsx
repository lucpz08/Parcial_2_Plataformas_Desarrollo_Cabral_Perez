import { ChevronRight } from 'lucide-react'
import { Avatar, Badge } from '@/components/ui'
import { ROLE_LABELS } from '@/data/constants'
import styles from './LoginPage.module.css'

const DEMO_ACCOUNTS = [
  { name: 'Equipo Riolup', email: 'admin@riolup.com', password: 'admin123', role: 'admin' },
  { name: 'Matías Ríos', email: 'mati@riolup.com', password: 'demo123', role: 'coleccionista' },
]

export function DemoAccounts({ onSelect, disabled }) {
  return (
    <section className={styles.demo}>
      <span className={styles.demoTitle}>Accesos de prueba</span>
      <div className={styles.demoList}>
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            type="button"
            className={styles.demoAccount}
            onClick={() => onSelect(account)}
            disabled={disabled}
          >
            <Avatar name={account.name} size={36} />
            <span className={styles.demoInfo}>
              <strong>{account.name}</strong>
              <span>{account.email}</span>
            </span>
            <Badge tone={account.role === 'admin' ? 'gold' : 'primary'}>{ROLE_LABELS[account.role]}</Badge>
            <ChevronRight size={18} className={styles.demoArrow} />
          </button>
        ))}
      </div>
    </section>
  )
}
