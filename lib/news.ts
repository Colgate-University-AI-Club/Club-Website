import { createClient } from '@supabase/supabase-js'
import { NewsItem } from './types'
import { extractTags } from './tags'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface SupabaseNewsRow {
  id: string
  title: string
  card_summary: string | null
  content: string | null
  source_type: 'club' | 'external'
  url: string
  published_at: string
  created_at: string
}

/**
 * Fetch all news articles from Supabase
 * Returns articles sorted by published_at (newest first)
 * Tags are generated on-the-fly from title and content
 */
export async function getNews(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching news:', error)
    return []
  }

  // Transform database rows to NewsItem format and generate tags
  return (data as SupabaseNewsRow[]).map(row => ({
    id: row.id,
    title: row.title,
    summary: row.card_summary || undefined,
    content: row.content || undefined,
    sourceType: row.source_type,
    url: row.url,
    tags: extractTags(row.title, row.content || ''),
    publishedAt: row.published_at
  }))
}

/**
 * Fetch a single news article by ID
 * Tags are generated on-the-fly from title and content
 */
export async function getNewsById(id: string): Promise<NewsItem | null> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching news by ID:', error)
    return null
  }

  const row = data as SupabaseNewsRow
  return {
    id: row.id,
    title: row.title,
    summary: row.card_summary || undefined,
    content: row.content || undefined,
    sourceType: row.source_type,
    url: row.url,
    tags: extractTags(row.title, row.content || ''),
    publishedAt: row.published_at
  }
}
