'use client'

import { useEffect, useState } from 'react'
import { NewsletterItem } from '@/lib/types'

interface UseNewsletterPollingResult {
  newsletters: NewsletterItem[]
  isLoading: boolean
  lastUpdated: Date | null
}

export function useNewsletterPolling(initialNewsletters: NewsletterItem[]): UseNewsletterPollingResult {
  const [newsletters, setNewsletters] = useState<NewsletterItem[]>(initialNewsletters)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/newsletters')
        if (response.ok) {
          const data = await response.json()
          if (data.newsletters) {
            setNewsletters(data.newsletters)
            setLastUpdated(new Date())
          }
        }
      } catch (error) {
        console.error('Failed to fetch newsletter updates:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const scheduleDailyCheck = () => {
      const now = new Date()
      const targetTime = new Date()
      targetTime.setHours(15, 0, 0, 0) // 3:00 PM

      // If it's already past 3 PM today, schedule for tomorrow
      if (now > targetTime) {
        targetTime.setDate(targetTime.getDate() + 1)
      }

      const timeUntilTarget = targetTime.getTime() - now.getTime()

      // Set timeout for the next 3 PM
      const timeoutId = setTimeout(() => {
        checkForUpdates()
        // After the first check, set up daily interval
        const dailyInterval = setInterval(checkForUpdates, 24 * 60 * 60 * 1000) // 24 hours

        return () => clearInterval(dailyInterval)
      }, timeUntilTarget)

      return () => clearTimeout(timeoutId)
    }

    // Schedule the daily check
    const cleanup = scheduleDailyCheck()

    return cleanup
  }, [])

  return {
    newsletters,
    isLoading,
    lastUpdated
  }
}