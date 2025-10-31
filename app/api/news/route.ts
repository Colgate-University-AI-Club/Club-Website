import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface N8NArticle {
  url: string
  title: string
  published_date: string
  content: string
  card_summary: string
}

// Initialize Supabase client with service role for write access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    let articles: N8NArticle[]
    try {
      articles = await request.json()
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError)
      return NextResponse.json(
        { success: false, error: 'Invalid JSON format in request body' },
        { status: 400 }
      )
    }

    if (!Array.isArray(articles)) {
      return NextResponse.json(
        { success: false, error: 'Request body must be an array of articles' },
        { status: 400 }
      )
    }

    console.log(`📰 Received ${articles.length} articles from n8n`)

    // Transform articles to database format
    const newsRecords = articles.map(article => ({
      title: article.title,
      card_summary: article.card_summary,
      content: article.content,
      source_type: 'external' as const,
      url: article.url,
      published_at: new Date(article.published_date).toISOString()
    }))

    // Upsert articles (insert or update if URL already exists)
    const { data, error } = await supabase
      .from('news')
      .upsert(newsRecords, {
        onConflict: 'url',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      console.error('❌ Supabase upsert error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    // Get total count of news articles
    const { count, error: countError } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true })
      .eq('source_type', 'external')

    if (countError) {
      console.error('Error getting count:', countError)
    }

    const addedCount = data?.length || 0
    console.log(`✅ Added/updated ${addedCount} articles. Total external articles: ${count}`)

    return NextResponse.json({
      success: true,
      message: `Added/updated ${addedCount} articles. Total external articles: ${count || 'unknown'}`,
      added: addedCount,
      total: count || 0
    })

  } catch (error) {
    console.error('💥 Error processing news articles:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process articles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}