import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { NewsItem } from '@/lib/types'
import { extractTags } from '@/lib/tags'

interface N8NArticle {
  url: string
  title: string
  published_date: string
  content: string
  card_summary: string
}

const NEWS_FILE_PATH = join(process.cwd(), 'app/data/news.json')
const MAX_EXTERNAL_ARTICLES = 30

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

    // Read current news data
    let currentNews: NewsItem[] = []
    try {
      const fileContent = readFileSync(NEWS_FILE_PATH, 'utf-8')
      currentNews = JSON.parse(fileContent)
    } catch {
      console.log('No existing news file found, creating new one')
      currentNews = []
    }

    // Separate club articles from external articles
    const clubArticles = currentNews.filter(item => item.sourceType === 'club')
    const externalArticles = currentNews.filter(item => item.sourceType === 'external')

    // Get existing URLs to prevent duplicates
    const existingUrls = new Set(externalArticles.map(item => item.url))

    // Transform and filter new articles
    const newArticles: NewsItem[] = articles
      .filter(article => !existingUrls.has(article.url)) // Remove duplicates
      .map(article => ({
        id: uuidv4(),
        title: article.title,
        summary: article.card_summary,
        content: article.content,
        sourceType: 'external' as const,
        url: article.url,
        tags: extractTags(article.title, article.content),
        publishedAt: new Date(article.published_date).toISOString()
      }))

    // Combine all external articles and sort by publishedAt (newest first)
    const allExternalArticles = [...externalArticles, ...newArticles]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    // Keep only the newest 15 external articles
    const limitedExternalArticles = allExternalArticles.slice(0, MAX_EXTERNAL_ARTICLES)

    // Combine club articles with limited external articles
    const finalNews = [...clubArticles, ...limitedExternalArticles]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    // Write back to file
    writeFileSync(NEWS_FILE_PATH, JSON.stringify(finalNews, null, 2))

    return NextResponse.json({
      success: true,
      message: `Added ${newArticles.length} new articles, keeping ${limitedExternalArticles.length} external articles total`,
      added: newArticles.length,
      total: finalNews.length
    })

  } catch (error) {
    console.error('Error processing news articles:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return NextResponse.json(
      { success: false, error: 'Failed to process articles', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}