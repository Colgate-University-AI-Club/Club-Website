'use client'

import { JobData } from '@/lib/types'
import { formatDate } from '@/lib/date'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EnhancedJobCardProps {
  job: JobData
  onViewDetails: (job: JobData) => void
  className?: string
}

export default function EnhancedJobCard({ job, onViewDetails, className }: EnhancedJobCardProps) {
  const handleCardClick = () => {
    onViewDetails(job)
  }

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering card click
    window.open(job.applyUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <article
      className={cn(
        "bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className
      )}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${job.title} at ${job.companyName || 'Unknown Company'}`}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
            {job.title}
          </h3>
          {job.jobType.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary ml-2 shrink-0">
              {job.jobType[0]}
            </span>
          )}
        </div>

        {job.companyName && (
          <p className="text-gray-600 font-medium mb-1">{job.companyName}</p>
        )}

        <div className="flex items-center text-gray-500 text-sm">
          <svg className="h-4 w-4 mr-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{job.location.formattedAddressShort}</span>
        </div>
      </div>

      {/* Salary */}
      {job.salary?.salaryText && (
        <div className="mb-4">
          <div className="flex items-center text-green-700 text-sm font-medium">
            <svg className="h-4 w-4 mr-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span className="truncate">{job.salary.salaryText}</span>
          </div>
        </div>
      )}

      {/* Job Summary */}
      <div className="mb-4">
        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
          {job.jobCardSummary}
        </p>
      </div>

      {/* Skills/Attributes */}
      {job.attributes && job.attributes.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {job.attributes.slice(0, 3).map((attribute, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground"
              >
                {attribute}
              </span>
            ))}
            {job.attributes.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                +{job.attributes.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {job.postedAt && (
          <div className="flex items-center text-gray-500 text-xs">
            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
            </svg>
            Posted {formatDate(job.postedAt)}
          </div>
        )}

        <Button
          size="sm"
          onClick={handleApplyClick}
          className="ml-auto"
        >
          Apply Now
          <svg className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Button>
      </div>
    </article>
  )
}