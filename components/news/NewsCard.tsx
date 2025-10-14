import Link from 'next/link'
import { NewsItem } from '@/lib/types'
import { formatDate } from '@/lib/date'

interface NewsCardProps {
  item: NewsItem
}

export default function NewsCard({ item }: NewsCardProps) {
  const isClubArticle = item.sourceType === 'club'
  const href = isClubArticle ? item.url : `/news/${item.id}`

  return (
    <article className="group relative rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
              item.sourceType === 'external'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-green-50 text-green-700 border-green-200'
            }`}>
              {item.sourceType === 'external' ? 'External' : 'Club'}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatDate(item.publishedAt)}
            </span>
          </div>
        </div>

        <h3 className="font-semibold mb-3 group-hover:text-primary transition-colors leading-tight">
          <Link href={href} className="after:absolute after:inset-0">
            {item.title}
          </Link>
        </h3>

        {item.summary && (
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4 leading-relaxed">
            {item.summary}
          </p>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}