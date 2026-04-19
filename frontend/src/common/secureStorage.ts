import secureLocalStorage from 'react-secure-storage'
import type { SecureStorageApi } from './types'

const secureStorage = ((secureLocalStorage as { default?: SecureStorageApi }).default ??
  secureLocalStorage) as SecureStorageApi

export const TOKEN_STORAGE_KEY = 'token'

export function getSecureToken() {
  const value = secureStorage.getItem(TOKEN_STORAGE_KEY)
  return typeof value === 'string' && value.trim() ? value : null
}

export function setSecureToken(token: string) {
  secureStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearSecureToken() {
  secureStorage.removeItem(TOKEN_STORAGE_KEY)
}
