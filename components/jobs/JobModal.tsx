'use client'

import { JobData } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

interface JobModalProps {
  job: JobData | null
  isOpen: boolean
  onClose: () => void
}

function parseMarkdownToHTML(markdown: string): string {
  // Basic markdown parsing for job descriptions
  return markdown
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/### (.*)/g, '<h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h3>')
    .replace(/## (.*)/g, '<h2 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h2>')
    .replace(/# (.*)/g, '<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-4">$1</h1>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n- /g, '</p><ul class="list-disc list-inside mb-4"><li>')
    .replace(/\n  - /g, '</li><li>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p class="mb-4">')
    .replace(/$/, '</p>')
    .replace(/<\/p><ul class="list-disc list-inside mb-4"><li>/g, '</p><ul class="list-disc list-inside mb-4 ml-4"><li>')
    .replace(/<\/li><\/ul>/g, '</li></ul>')
}

export default function JobModal({ job, isOpen, onClose }: JobModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !job) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleApplyClick = () => {
    window.open(job.applyUrl, '_blank', 'noopener,noreferrer')
  }

  const handleViewJobClick = () => {
    window.open(job.jobUrl, '_blank', 'noopener,noreferrer')
  }

  const requiredRequirements = job.requirements.filter(req => req.requirementSeverity === 'REQUIRED')
  const preferredRequirements = job.requirements.filter(req => req.requirementSeverity === 'PREFERRED')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-modal-title"
    >
      <div
        className={cn(
          "bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h1 id="job-modal-title" className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-gray-600">
                {job.companyName && (
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h4" />
                    </svg>
                    <span className="font-medium">{job.companyName}</span>
                    {job.companyUrl && (
                      <a
                        href={job.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-primary hover:text-primary/80"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{job.location.formattedAddressShort}</span>
                </div>
                {job.jobType.length > 0 && (
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                    </svg>
                    <span>{job.jobType.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-200px)]">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Salary */}
            {job.salary?.salaryText && (
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center text-green-700">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="font-semibold text-lg">{job.salary.salaryText}</span>
                </div>
              </div>
            )}

            {/* Job Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div
                className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: parseMarkdownToHTML(job.descriptionText)
                }}
              />
            </div>

            {/* Requirements */}
            {(requiredRequirements.length > 0 || preferredRequirements.length > 0) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>

                {requiredRequirements.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Required</h3>
                    <ul className="space-y-2">
                      {requiredRequirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                          <span className="text-gray-600">{req.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {preferredRequirements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Preferred</h3>
                    <ul className="space-y-2">
                      {preferredRequirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                          <span className="text-gray-600">{req.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Benefits */}
            {job.benefits.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {job.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <svg className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills/Attributes */}
            {job.attributes.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Technologies</h2>
                <div className="flex flex-wrap gap-2">
                  {job.attributes.map((attribute, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                    >
                      {attribute}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleApplyClick}
              size="lg"
              className="w-full"
            >
              Apply Now
              <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Button>
            <Button
              variant="outline"
              onClick={handleViewJobClick}
              size="lg"
              className="w-full"
            >
              View Original Posting
              <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}