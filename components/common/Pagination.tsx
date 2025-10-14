'use client'

import { useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'

interface PaginationProps {
  page: number
  totalPages: number
}

export default function Pagination({ page, totalPages }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newPage === 1) {
      params.delete('page')
    } else {
      params.set('page', newPage.toString())
    }
    return params.toString() ? `${pathname}?${params}` : pathname
  }

  if (totalPages <= 1) return null

  const hasPrevious = page > 1
  const hasNext = page < totalPages

  return (
    <div className="flex items-center justify-center gap-4 mt-12">
      {hasPrevious ? (
        <Link
          href={createPageUrl(page - 1)}
          aria-label="Previous page"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
        >
          ← Previous
        </Link>
      ) : (
        <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground/50 bg-muted/50 border border-border/50 rounded-md cursor-not-allowed">
          ← Previous
        </span>
      )}

      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={createPageUrl(page + 1)}
          aria-label="Next page"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
        >
          Next →
        </Link>
      ) : (
        <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground/50 bg-muted/50 border border-border/50 rounded-md cursor-not-allowed">
          Next →
        </span>
      )}
    </div>
  )
}