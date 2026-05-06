import { Transaction } from '@/types'

const STORAGE_KEY = 'transactions'

export const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
}

export const loadTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Transaction[]
  } catch {
    return []
  }
}

export const clearTransactions = (): void => {
  localStorage.removeItem(STORAGE_KEY)
}