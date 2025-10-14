import { Metadata } from 'next'
import Link from 'next/link'
import { NewsItem } from '@/lib/types'
import { paginateArray } from '@/lib/paginate'
import NewsCard from '@/components/news/NewsCard'
import Pagination from '@/components/common/Pagination'
import Tag from '@/components/common/Tag'
import SectionHeader from '@/components/ui/SectionHeader'
import CardGrid from '@/components/ui/CardGrid'
import { NewsletterSectionWithPolling } from '@/components/newsletter'
import { getNewsletters } from '@/lib/newsletter'
import newsData from '@/app/data/news.json'
import NewsletterNavButton from '@/components/news/NewsletterNavButton'

export const metadata: Metadata = {
  title: 'News – Colgate AI Club',
}

interface NewsPageProps {
  searchParams?: Promise<{
    tag?: string
    page?: string
  }>
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  // Fetch newsletters from Supabase
  const newsletters = await getNewsletters()

  const news = (newsData as NewsItem[]).sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  const params = await searchParams
  const selectedTag = params?.tag
  const currentPage = parseInt(params?.page || '1', 10)

  // Filter by tag if specified - "All" shows everything, specific tags filter by tag
  const filteredNews = selectedTag
    ? news.filter(item => item.tags?.includes(selectedTag))
    : news

  // Paginate the filtered results
  const paginatedData = paginateArray(filteredNews, currentPage, 9)

  // Collect all unique tags for the tag bar
  const allTags = Array.from(new Set(news.flatMap(item => item.tags || []))).sort()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative">
        <SectionHeader
          title="What's New"
          description="Club posts and curated AI reads."
        />

        {/* Newsletter Navigation Button */}
        <NewsletterNavButton />
      </div>

      {/* Tag Filter Bar */}
      {allTags.length > 0 && (
        <div
          className="sticky top-16 z-10 bg-background border-b border-border mb-8 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent md:border-none md:static"
          aria-label="Filter by tag"
        >
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <Tag
              label="All"
              selected={!selectedTag}
            />
            {allTags.map((tag) => (
              <Tag
                key={tag}
                label={tag}
                selected={selectedTag === tag}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content Area */}
      {paginatedData.slice.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto max-w-md">
            <h3 className="text-lg font-medium mb-2">No articles found</h3>
            <p className="text-muted-foreground mb-6">
              {selectedTag
                ? `No articles found with the tag "${selectedTag}". Try selecting a different tag or browse all articles.`
                : 'No articles are available yet. Check back soon for updates!'
              }
            </p>
            <div className="flex gap-4 justify-center">
              {selectedTag && (
                <Tag label="All" selected={false} />
              )}
              <Link
                href="/contribute"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Submit news →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <CardGrid>
            {paginatedData.slice.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </CardGrid>

          <Pagination
            page={paginatedData.page}
            totalPages={paginatedData.totalPages}
          />
        </>
      )}

      {/* Newsletter Section */}
      <div id="newsletter-section" className="mt-20 pt-12 border-t border-border">
        <NewsletterSectionWithPolling initialNewsletters={newsletters} />
      </div>
    </div>
  )
}
