'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

interface TagProps {
  label: string
  selected: boolean
}

export default function Tag({ label, selected }: TagProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString())

    if (selected) {
      params.delete('tag')
    } else {
      if (label === 'All') {
        params.delete('tag')
      } else {
        params.set('tag', label)
      }
    }
    params.delete('page')

    const newUrl = params.toString() ? `${pathname}?${params}` : pathname
    router.replace(newUrl, { scroll: false })
  }

  return (
    <button
      onClick={handleClick}
      aria-pressed={selected}
      className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        selected
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
      }`}
    >
      {label}
    </button>
  )
}