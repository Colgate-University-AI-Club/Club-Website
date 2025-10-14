import { NextResponse } from 'next/server'
import { getNewsletters } from '@/lib/newsletter'

export async function GET() {
  try {
    const newsletters = await getNewsletters()
    return NextResponse.json({
      success: true,
      newsletters
    })
  } catch (error) {
    console.error('Error fetching newsletters:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}