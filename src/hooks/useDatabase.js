import { useSyncExternalStore } from 'react'
import { getSnapshot, subscribe } from '@/services/storage'

export function useDatabase() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
