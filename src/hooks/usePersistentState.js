import { useEffect, useState } from 'react'

export function usePersistentState(key, initialValue) {
  const storageKey = `riolup-tcg:pref:${key}`

  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value))
    } catch {
      return
    }
  }, [storageKey, value])

  return [value, setValue]
}
