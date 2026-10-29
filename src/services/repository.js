import { getTable, setTable } from './storage'
import { createId, now } from '@/utils/id'

export function createRepository(table, idPrefix) {
  const all = () => getTable(table)

  return {
    all,

    findById(id) {
      return all().find((row) => row.id === id) ?? null
    },

    where(predicate) {
      return all().filter(predicate)
    },

    create(data) {
      const timestamp = now()
      const row = { id: createId(idPrefix), createdAt: timestamp, ...data }
      setTable(table, [...all(), row])
      return row
    },

    update(id, changes) {
      let updated = null
      const rows = all().map((row) => {
        if (row.id !== id) return row
        updated = { ...row, ...changes, updatedAt: now() }
        return updated
      })
      if (updated) setTable(table, rows)
      return updated
    },

    remove(id) {
      setTable(
        table,
        all().filter((row) => row.id !== id),
      )
    },
  }
}
