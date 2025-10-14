'use client'

import { ChevronDown, Mail } from 'lucide-react'

export default function NewsletterNavButton() {
  const scrollToNewsletter = () => {
    const newsletterSection = document.querySelector('#newsletter-section')
    if (newsletterSection) {
      newsletterSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <>
      {/* Desktop Version */}
      <div className="absolute top-0 right-0 hidden md:block">
        <button
          onClick={scrollToNewsletter}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          aria-label="Jump to newsletter section"
        >
          <Mail className="h-4 w-4" />
          <span className="hidden lg:inline">Newsletter</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Mobile Version */}
      <div className="md:hidden mt-4 flex justify-center">
        <button
          onClick={scrollToNewsletter}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-800 bg-red-50 hover:bg-red-100 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          aria-label="Jump to newsletter section"
        >
          <Mail className="h-4 w-4" />
          <span>Jump to Newsletter</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
    </>
  )
}