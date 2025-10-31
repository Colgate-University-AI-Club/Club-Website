import { NextRequest, NextResponse } from 'next/server'
import { isValidEmail } from '@/lib/validators'

// n8n webhook URL for newsletter signups
const N8N_NEWSLETTER_WEBHOOK = 'https://seabass34.app.n8n.cloud/webhook/859ca13a-afa5-4879-946b-4f4cca54527c'

// Simple in-memory rate limiting (10 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      )
    }

    const { email, timestamp, source } = body

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Forward to n8n webhook
    console.log('📧 Forwarding newsletter signup to n8n:', { email, source })

    const n8nResponse = await fetch(N8N_NEWSLETTER_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        timestamp: timestamp || new Date().toISOString(),
        source: source || 'AI Club Website',
        ip,
      }),
    })

    console.log('📥 n8n response status:', n8nResponse.status)

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('❌ n8n webhook error:', errorText)
      throw new Error(`n8n webhook returned ${n8nResponse.status}`)
    }

    // Parse n8n response (if any)
    let n8nData
    try {
      const responseText = await n8nResponse.text()
      n8nData = responseText ? JSON.parse(responseText) : {}
    } catch {
      n8nData = {}
    }

    console.log('✅ Newsletter signup forwarded successfully')

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: n8nData,
    })

  } catch (error) {
    console.error('💥 Newsletter subscription error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process subscription. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
