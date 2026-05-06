// utils/cardUtils.ts

import { CardType } from '@/types'

export const detectCardType = (cardNumber: string): CardType => {
  const cleaned = cardNumber.replace(/\s/g, '')
  
  if (/^4/.test(cleaned)) return 'visa'
  if (/^5[1-5]/.test(cleaned)) return 'mastercard'
  if (/^3[47]/.test(cleaned)) return 'amex'
  
  return 'unknown'
}

export const formatCardNumber = (value: string, cardType: CardType): string => {
  const cleaned = value.replace(/\s/g, '')
  
  if (cardType === 'amex') {
    // Amex format: 4-6-5
    return cleaned
      .slice(0, 15)
      .replace(/^(\d{4})(\d{0,6})(\d{0,5})/, (_, a, b, c) =>
        [a, b, c].filter(Boolean).join(' ')
      )
  }

  // Visa/Mastercard format: 4-4-4-4
  return cleaned
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
}

export const getCvvLength = (cardType: CardType): number => {
  return cardType === 'amex' ? 4 : 3
}

export const maskCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '')
  const last4 = cleaned.slice(-4)
  const masked = cleaned.slice(0, -4).replace(/\d/g, '*')
  return formatCardNumber(masked + last4, detectCardType(cardNumber))
}