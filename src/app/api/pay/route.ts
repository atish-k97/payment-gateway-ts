// app/api/pay/route.ts

import { NextRequest, NextResponse } from 'next/server'

const FAILURE_REASONS = [
  'Insufficient funds',
  'Card declined',
  'Transaction limit exceeded',
  'Invalid card details',
]

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { transactionId } = body

  if (!transactionId) {
    return NextResponse.json(
      { error: 'Transaction ID is required' },
      { status: 400 }
    )
  }

  const random = Math.random()

  // 15% timeout — respond after 8 seconds
  if (random < 0.15) {
    await delay(8000)
    return NextResponse.json(
      { status: 'timeout', transactionId },
      { status: 200 }
    )
  }

  // 25% failed
  if (random < 0.40) {
    await delay(1000)
    const reason = FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)]
    return NextResponse.json(
      { status: 'failed', transactionId, reason },
      { status: 200 }
    )
  }

  // 60% success
  await delay(1000)
  return NextResponse.json(
    { status: 'success', transactionId },
    { status: 200 }
  )
}

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))