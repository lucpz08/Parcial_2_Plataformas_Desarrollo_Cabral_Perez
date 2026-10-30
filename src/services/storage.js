import { seed } from '@/data/seed'

const STORAGE_KEY = 'riolup-tcg:db'
const DB_VERSION = 3

const listeners = new Set()

function createInitialData() {
  return structuredClone(seed)
}

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.version === DB_VERSION) return parsed.data
    }
  } catch {
    return createInitialData()
  }
  const data = createInitialData()
  write(data)
  return data
}

function write(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: DB_VERSION, data }))
  } catch {
    return
  }
}

let db = read()

function notify() {
  listeners.forEach((listener) => listener())
}

export function getSnapshot() {
  return db
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getTable(name) {
  return db[name]
}

export function setTable(name, rows) {
  db = { ...db, [name]: rows }
  write(db)
  notify()
}

export function resetDatabase() {
  db = createInitialData()
  write(db)
  notify()
}

window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return
  db = read()
  notify()
})
