'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { NewsletterItem } from '@/lib/types'
import { formatDate } from '@/lib/date'
import { ChevronDownIcon } from 'lucide-react'

interface NewsletterSectionProps {
  newsletters: NewsletterItem[]
}

// Helper function to detect if content is HTML or Markdown
function isHtmlContent(content: string): boolean {
  // Check for common HTML tags and look for newsletter-specific patterns
  const htmlTags = /<\/?(p|div|span|h[1-6]|br|strong|em|ul|ol|li|a|img|table|tr|td|th|thead|tbody|blockquote|pre|code|section|article)(\s[^>]*)?\/?>/i
  const hasHtmlStructure = htmlTags.test(content)
  const hasHtmlEntities = /&[a-zA-Z0-9#]+;/.test(content)
  return hasHtmlStructure || hasHtmlEntities
}

export default function NewsletterSection({ newsletters }: NewsletterSectionProps) {
  const [selectedNewsletterId, setSelectedNewsletterId] = useState<number | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Sort newsletters by date (most recent first)
  const sortedNewsletters = newsletters.sort(
    (a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
  )

  // Set the most recent newsletter as default
  useEffect(() => {
    if (sortedNewsletters.length > 0 && selectedNewsletterId === null) {
      setSelectedNewsletterId(sortedNewsletters[0].id)
    }
  }, [sortedNewsletters, selectedNewsletterId])

  const selectedNewsletter = sortedNewsletters.find(n => n.id === selectedNewsletterId)
  const isLegacy = selectedNewsletter && selectedNewsletter.id !== sortedNewsletters[0]?.id

  if (!newsletters.length) {
    return null
  }

  return (
    <section className="mb-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-heading font-bold text-foreground">
              Latest Newsletter
            </h2>
            {isLegacy && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                Legacy
              </span>
            )}
          </div>

          {/* Newsletter Dropdown */}
          {sortedNewsletters.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/80 hover:text-foreground rounded-lg border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
              >
                Browse archives
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  <div className="p-1">
                    {sortedNewsletters.map((newsletter, index) => (
                      <button
                        key={newsletter.id}
                        onClick={() => {
                          setSelectedNewsletterId(newsletter.id)
                          setIsDropdownOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          selectedNewsletterId === newsletter.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">
                            {newsletter.title}
                          </span>
                          {index === 0 && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 flex-shrink-0">
                              Latest
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(newsletter.publish_date)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Newsletter Content */}
        {selectedNewsletter && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="mb-4">
              <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                {selectedNewsletter.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDate(selectedNewsletter.publish_date)}</span>
              </div>
            </div>

            {isHtmlContent(selectedNewsletter.content_markdown) ? (
              <div
                className="newsletter-content"
                dangerouslySetInnerHTML={{ __html: selectedNewsletter.content_markdown }}
              />
            ) : (
              <div className="prose prose-sm max-w-none prose-headings:text-red-800 prose-headings:font-heading prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-red-800">
                <ReactMarkdown>{selectedNewsletter.content_markdown}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}