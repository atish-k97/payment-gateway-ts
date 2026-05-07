// utils/validations.ts

import { CardType, FormErrors, PaymentFormState } from '@/types'
import { getCvvLength } from './cardUtils'

export const validateCardholderName = (name: string): string | undefined => {
  if (!name.trim()) return 'Cardholder name is required'
  if (/\d/.test(name)) return 'Name cannot contain numbers'
  if (name.trim().length < 3) return 'Name is too short'
  return undefined
}

export const validateCardNumber = (cardNumber: string, cardType: CardType): string | undefined => {
  const cleaned = cardNumber.replace(/\s/g, '')
  if (!cleaned) return 'Card number is required'
  
  const expectedLength = cardType === 'amex' ? 15 : 16
  if (cleaned.length !== expectedLength) return `Card number must be ${expectedLength} digits`
  
  return undefined
}

export const validateExpiry = (expiry: string): string | undefined => {
  if (!expiry) return 'Expiry date is required'
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return 'Use MM/YY format'

  const [month, year] = expiry.split('/').map(Number)

  if (month < 1 || month > 12) return 'Invalid month'

  const now = new Date()
  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'Card has expired'
  }

  return undefined
}

export const validateCvv = (cvv: string, cardType: CardType): string | undefined => {
  if (!cvv) return 'CVV is required'
  const expectedLength = getCvvLength(cardType)
  if (cvv.length !== expectedLength) return `CVV must be ${expectedLength} digits`
  return undefined
}

export const validateAmount = (amount: string): string | undefined => {
  if (!amount) return 'Amount is required'
  const parsed = parseFloat(amount)
  if (isNaN(parsed)) return 'Amount must be a number'
  if (parsed <= 0) return 'Amount must be greater than 0'
  if (parsed > 1000000) return 'Amount cannot exceed 10,00,000'
  return undefined
}

export const validateForm = (
  form: PaymentFormState,
  cardType: CardType
): FormErrors => {
  return {
    cardholderName: validateCardholderName(form.cardholderName),
    cardNumber: validateCardNumber(form.cardNumber, cardType),
    expiry: validateExpiry(form.expiry),
    cvv: validateCvv(form.cvv, cardType),
    amount: validateAmount(form.amount),
  }
}

export const isFormValid = (errors: FormErrors): boolean => {
  return Object.values(errors).every((e) => e === undefined)
}