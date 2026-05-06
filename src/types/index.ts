// types/index.ts

export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed' | 'timeout'

export type CardType = 'visa' | 'mastercard' | 'amex' | 'unknown'

export type Currency = 'INR' | 'USD'

export interface PaymentPayload {
  transactionId: string
  cardholderName: string
  cardNumber: string
  expiry: string
  cvv: string
  amount: number
  currency: Currency
}

export interface Transaction {
  transactionId: string
  amount: number
  currency: Currency
  status: Exclude<PaymentStatus, 'idle' | 'processing'>
  timestamp: string
  failureReason?: string
  attemptCount: number
}

export interface PaymentFormState {
  cardholderName: string
  cardNumber: string
  expiry: string
  cvv: string
  amount: string
  currency: Currency
}

export interface FormErrors {
  cardholderName?: string
  cardNumber?: string
  expiry?: string
  cvv?: string
  amount?: string
}   