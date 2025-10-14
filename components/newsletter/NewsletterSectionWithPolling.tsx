'use client'

import { NewsletterItem } from '@/lib/types'
import { useNewsletterPolling } from '@/hooks/useNewsletterPolling'
import NewsletterSection from './NewsletterSection'

interface NewsletterSectionWithPollingProps {
  initialNewsletters: NewsletterItem[]
}

export default function NewsletterSectionWithPolling({ initialNewsletters }: NewsletterSectionWithPollingProps) {
  const { newsletters, isLoading } = useNewsletterPolling(initialNewsletters)

  return (
    <>
      {isLoading && (
        <div className="mb-4 text-center text-sm text-muted-foreground">
          Checking for newsletter updates...
        </div>
      )}
      <NewsletterSection newsletters={newsletters} />
    </>
  )
}