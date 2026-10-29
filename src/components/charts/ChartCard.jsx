import { useState } from 'react'
import { BarChart3, Table2 } from 'lucide-react'
import styles from './charts.module.css'

export function ChartCard({ title, subtitle, table, children }) {
  const [showTable, setShowTable] = useState(false)

  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button
          type="button"
          className={styles.viewToggle}
          onClick={() => setShowTable((value) => !value)}
          aria-pressed={showTable}
        >
          {showTable ? <BarChart3 size={15} /> : <Table2 size={15} />}
          {showTable ? 'Gráfico' : 'Tabla'}
        </button>
      </header>

      {showTable ? (
        <table className={styles.table}>
          <thead>
            <tr>
              {table.columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, index) => (
                  <td key={index}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        children
      )}
    </section>
  )
}
