import { usePaymentStore } from '@/store/paymentStore'
import { PaymentFormState, Transaction } from '@/types'

const MAX_RETRIES = 3
const TIMEOUT_MS = 6000

export const usePayment = () => {
  const {
    status,
    attemptCount,
    currentTransactionId,
    setStatus,
    setTransactionId,
    setFailureReason,
    incrementAttempt,
    resetAttempts,
    addOrUpdateTransaction,
  } = usePaymentStore()

  const submitPayment = async (form: PaymentFormState) => {
    // first attempt — generate new transaction ID
    const transactionId = currentTransactionId ?? crypto.randomUUID()
    if (!currentTransactionId) setTransactionId(transactionId)

    incrementAttempt()
    setStatus('processing')
    setFailureReason(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          cardholderName: form.cardholderName,
          cardNumber: form.cardNumber.replace(/\s/g, ''),
          expiry: form.expiry,
          amount: parseFloat(form.amount),
          currency: form.currency,
        }),
        signal: controller.signal,
      })

      const data = await response.json()

      const tx: Transaction = {
        transactionId,
        amount: parseFloat(form.amount),
        currency: form.currency,
        status: data.status,
        timestamp: new Date().toISOString(),
        failureReason: data.reason,
        attemptCount: attemptCount + 1,
      }

      addOrUpdateTransaction(tx)

      if (data.status === 'success') {
        setStatus('success')
        resetAttempts()
      } else if (data.status === 'failed') {
        setStatus('failed')
        setFailureReason(data.reason ?? 'Payment failed')
      } else {
        setStatus('timeout')
        setFailureReason('Request timed out')
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        const tx: Transaction = {
          transactionId,
          amount: parseFloat(form.amount),
          currency: form.currency,
          status: 'timeout',
          timestamp: new Date().toISOString(),
          attemptCount: attemptCount + 1,
        }
        addOrUpdateTransaction(tx)
        setStatus('timeout')
        setFailureReason('Request timed out. Please try again.')
      } else {
        setStatus('failed')
        setFailureReason('Network error. Please check your connection.')
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const retry = (form: PaymentFormState) => {
    if (attemptCount >= MAX_RETRIES) return
    submitPayment(form)
  }

  const reset = () => {
    resetAttempts()
    setStatus('idle')
    setFailureReason(null)
  }

  return {
    status,
    attemptCount,
    maxRetries: MAX_RETRIES,
    submitPayment,
    retry,
    reset,
  }
}