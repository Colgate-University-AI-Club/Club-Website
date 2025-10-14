'use client'

import { ProjectItem } from '@/lib/types'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Star, GitFork, Clock, Code, Zap, Layers, ExternalLink } from 'lucide-react'
import { parseGitHubUrl } from '@/lib/github'

interface ProjectCardProps {
  item: ProjectItem
}

interface GitHubStats {
  stars: number
  forks: number
  lastUpdated: string
}

const levelColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
}

const projectTypeConfig = {
  code: {
    icon: Code,
    label: 'Coding Project',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  'no-code': {
    icon: Zap,
    label: 'No-Code Project',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
  },
  hybrid: {
    icon: Layers,
    label: 'Hybrid Project',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
}

/**
 * Format relative time from ISO date string
 * @param isoDate ISO 8601 date string
 * @returns Relative time string like "2 days ago"
 */
function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`
  if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
  if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  return 'just now'
}

export default function ProjectCard({ item }: ProjectCardProps) {
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Only fetch if repoUrl exists
    if (!item.repoUrl) {
      return
    }

    // Parse the GitHub URL to extract owner/repo
    const parsed = parseGitHubUrl(item.repoUrl)
    if (!parsed) {
      // Invalid URL, don't fetch
      return
    }

    const { owner, repo } = parsed

    // Fetch GitHub stats from API
    setLoading(true)
    fetch(`/api/github/${owner}/${repo}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setStats({
            stars: data.data.stars,
            forks: data.data.forks,
            lastUpdated: data.data.lastUpdated,
          })
        }
      })
      .catch((error) => {
        console.error('Failed to fetch GitHub stats:', error)
        // Silently fail - don't show error to user
      })
      .finally(() => {
        setLoading(false)
      })
  }, [item.repoUrl])

  const projectTypeInfo = projectTypeConfig[item.projectType]
  const ProjectTypeIcon = projectTypeInfo.icon

  // Tools display logic: show max 4, then "+X more"
  const maxToolsVisible = 4
  const visibleTools = item.tools.slice(0, maxToolsVisible)
  const remainingToolsCount = item.tools.length - maxToolsVisible

  return (
    <article className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelColors[item.level]}`}>
            {item.level}
          </span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${projectTypeInfo.bgColor} ${projectTypeInfo.textColor}`}>
            <ProjectTypeIcon className="h-3 w-3" />
            {projectTypeInfo.label}
          </span>
        </div>
        {item.durationHours && (
          <span className="text-sm text-gray-500">
            {item.durationHours}h
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        <Link
          href={`/projects/${item.slug}`}
          className="hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          {item.title}
        </Link>
      </h3>

      {/* GitHub Stats - Display below title if available */}
      {stats && !loading && (
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {stats.stars}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-3 w-3" />
            {stats.forks}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(stats.lastUpdated)}
          </span>
        </div>
      )}

      <p className="text-gray-600 mb-4 line-clamp-3">{item.summary}</p>

      {/* Tools display */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {visibleTools.map((tool, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-700"
          >
            {tool}
          </span>
        ))}
        {remainingToolsCount > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-700">
            +{remainingToolsCount} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Link
          href={`/projects/${item.slug}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          View Project →
        </Link>
        {item.repoUrl ? (
          <a
            href={item.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            title="View on GitHub"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        ) : item.workflowUrl ? (
          <a
            href={item.workflowUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            title="View Workflow"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </article>
  )
}