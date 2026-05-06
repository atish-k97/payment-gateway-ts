import { create } from 'zustand'
import { PaymentStatus, Transaction } from '@/types'
import { saveTransactions, loadTransactions } from '@/utils/storage'

interface PaymentStore {
  status: PaymentStatus
  currentTransactionId: string | null
  attemptCount: number
  failureReason: string | null
  history: Transaction[]
  setStatus: (status: PaymentStatus) => void
  setTransactionId: (id: string) => void
  incrementAttempt: () => void
  resetAttempts: () => void
  setFailureReason: (reason: string | null) => void
  addOrUpdateTransaction: (tx: Transaction) => void
  loadHistoryFromStorage: () => void
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  status: 'idle',
  currentTransactionId: null,
  attemptCount: 0,
  failureReason: null,
  history: [],

  setStatus: (status) => set({ status }),

  setTransactionId: (id) => set({ currentTransactionId: id }),

  incrementAttempt: () => set((state) => ({ attemptCount: state.attemptCount + 1 })),

  resetAttempts: () => set({ attemptCount: 0, currentTransactionId: null }),

  setFailureReason: (reason) => set({ failureReason: reason }),

  addOrUpdateTransaction: (tx) => {
    const existing = get().history.findIndex(
      (t) => t.transactionId === tx.transactionId
    )
    set((state) => {
      const updated = [...state.history]
      if (existing >= 0) {
        updated[existing] = tx
      } else {
        updated.unshift(tx)
      }
      saveTransactions(updated)
      return { history: updated }
    })
  },

  loadHistoryFromStorage: () => {
   set({ history: loadTransactions() })
  },
}))