import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { isHttpUrl, isNonEmpty } from '@/lib/validators'

interface ContributeItem {
  id: string
  title: string
  url: string
  note?: string
  email?: string
  submittedAt: string
}

const RATE_LIMIT_MAP = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_MAX = 10 // 10 requests per minute per IP
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

function getRateLimitKey(ip: string): string {
  return `rate_limit_${ip}`
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const key = getRateLimitKey(ip)
  const limit = RATE_LIMIT_MAP.get(key)

  if (!limit || now > limit.resetTime) {
    RATE_LIMIT_MAP.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return false
  }

  limit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { ok: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { title, url, note, email, website } = body

    // Honeypot check
    if (website) {
      return NextResponse.json(
        { ok: false, error: 'Invalid submission.' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!isNonEmpty(title) || !isNonEmpty(url)) {
      return NextResponse.json(
        { ok: false, error: 'Title and URL are required.' },
        { status: 400 }
      )
    }

    // Validate URL format
    if (!isHttpUrl(url)) {
      return NextResponse.json(
        { ok: false, error: 'Please provide a valid URL starting with http:// or https://' },
        { status: 400 }
      )
    }

    // Create contribution item
    const contribution: ContributeItem = {
      id: randomUUID(),
      title: title.trim(),
      url: url.trim(),
      note: note?.trim(),
      email: email?.trim(),
      submittedAt: new Date().toISOString()
    }

    // Read existing contributions or create empty array
    const filePath = path.join(process.cwd(), 'app/data/contribute-queue.json')
    let contributions: ContributeItem[] = []

    try {
      const fileContent = await fs.readFile(filePath, 'utf8')
      contributions = JSON.parse(fileContent)
    } catch {
      // File doesn't exist yet, start with empty array
    }

    // Add new contribution
    contributions.push(contribution)

    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(contributions, null, 2))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}