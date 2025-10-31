import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/date'
import { getNews, getNewsById } from '@/lib/news'

interface NewsArticlePageProps {
  params: Promise<{
    id: string
  }>
}

// Disable static generation for dynamic data
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const { id } = await params
  const article = await getNewsById(id)

  if (!article) {
    return {
      title: 'Article Not Found – Colgate AI Club'
    }
  }

  return {
    title: `${article.title} – Colgate AI Club`,
    description: article.summary || article.title
  }
}

export async function generateStaticParams() {
  // Fetch all news to generate static params
  const news = await getNews()
  return news.map(item => ({
    id: item.id
  }))
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { id } = await params
  const article = await getNewsById(id)

  if (!article) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Navigation */}
      <div className="mb-8">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-red-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2 rounded-md px-2 py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to News
        </Link>
      </div>

      {/* Article Container */}
      <article className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Article Header */}
        <header className="bg-gradient-to-br from-red-50/50 via-white to-red-50/20 border-b border-red-100 p-8">
          {/* Article Type Badge */}
          <div className="mb-6">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium border ${
              article.sourceType === 'external'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-green-50 text-green-700 border-green-200'
            }`}>
              {article.sourceType === 'external' ? 'External Article' : 'Club Post'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-red-800 mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-4 text-red-700 mb-8">
            <time dateTime={article.publishedAt} className="font-medium">
              {formatDate(article.publishedAt)}
            </time>
            <span className="w-1.5 h-1.5 bg-red-300 rounded-full"></span>
            <span className="text-sm">
              Published by {article.sourceType === 'club' ? 'Colgate AI Club' : 'External Source'}
            </span>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Summary Box */}
          {article.summary && (
            <div className="bg-white border-l-4 border-red-800 rounded-r-xl shadow-sm p-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-800 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h2 className="text-sm font-semibold text-red-800 uppercase tracking-wide mb-2">
                    Article Summary
                  </h2>
                  <p className="text-lg text-red-700 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="p-8">
          {article.content && (
            <div
              className="prose prose-lg max-w-none prose-headings:text-red-800 prose-headings:font-heading prose-p:text-foreground prose-p:leading-relaxed prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-red-800 prose-blockquote:border-red-200 prose-blockquote:bg-red-50/50 prose-blockquote:text-red-700"
              dangerouslySetInnerHTML={{
                __html: article.content.replace(/\n/g, '<br />')
              }}
            />
          )}

          {/* External Link Section */}
          {article.sourceType === 'external' && (
            <div className="mt-12 pt-8 border-t border-red-100">
              <div className="bg-gradient-to-br from-red-50 via-white to-red-50/50 border border-red-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-3">
                  Continue Reading
                </h3>
                <p className="text-red-700 mb-4 leading-relaxed">
                  This article was originally published externally. Click below to read the full content on the original website.
                </p>
                <Link
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-800 text-white font-medium rounded-lg hover:bg-red-900 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2"
                >
                  Read Full Article
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  )
}