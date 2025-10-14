import { supabase } from './supabase'
import { NewsletterItem } from './types'

export async function getNewsletters(): Promise<NewsletterItem[]> {
  try {
    const { data, error } = await supabase
      .from('AI_club_newsletter')
      .select('*')
      .order('publish_date', { ascending: false })

    if (error) {
      console.error('Error fetching newsletters:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch newsletters:', error)
    return []
  }
}

export async function getLatestNewsletter(): Promise<NewsletterItem | null> {
  try {
    const { data, error } = await supabase
      .from('AI_club_newsletter')
      .select('*')
      .order('publish_date', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching latest newsletter:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Failed to fetch latest newsletter:', error)
    return null
  }
}