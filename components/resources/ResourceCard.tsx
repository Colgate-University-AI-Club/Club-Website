'use client'

import { useState } from 'react'
import { Resource } from '@/lib/types'
import {
  Download,
  FileText,
  Video,
  Code,
  Database,
  Presentation,
  Play,
  Package
} from 'lucide-react'
import { VideoModal } from './VideoModal'

interface ResourceCardProps {
  resource: Resource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [showVideoModal, setShowVideoModal] = useState(false)

  const getCategoryIcon = () => {
    switch(resource.category) {
      case 'presentation':
        return <Presentation className="w-5 h-5" />
      case 'document':
        return <FileText className="w-5 h-5" />
      case 'video':
        return <Video className="w-5 h-5" />
      case 'code':
        return <Code className="w-5 h-5" />
      case 'dataset':
        return <Database className="w-5 h-5" />
      case 'template':
        return <Package className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getCategoryColor = () => {
    const colors = {
      presentation: 'bg-blue-100 text-blue-800',
      document: 'bg-green-100 text-green-800',
      video: 'bg-purple-100 text-purple-800',
      template: 'bg-yellow-100 text-yellow-800',
      dataset: 'bg-orange-100 text-orange-800',
      code: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[resource.category] || colors.other
  }

  const handleAction = () => {
    if (resource.category === 'video' && resource.embedUrl) {
      setShowVideoModal(true)
    } else if (resource.downloadUrl) {
      // Track download (optional)
      console.log('Downloading:', resource.title)

      // Create download link
      const link = document.createElement('a')
      link.href = resource.downloadUrl
      link.download = resource.title
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const getActionButton = () => {
    if (resource.category === 'video' && resource.embedUrl) {
      return (
        <>
          <button
            onClick={handleAction}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-800 text-white rounded-lg hover:bg-red-900 text-sm transition-colors"
          >
            <Play className="w-4 h-4" />
            Watch
          </button>
          <VideoModal
            isOpen={showVideoModal}
            onClose={() => setShowVideoModal(false)}
            title={resource.title}
            embedUrl={resource.embedUrl}
          />
        </>
      )
    }

    return (
      <button
        onClick={handleAction}
        className="flex items-center gap-1 px-3 py-1.5 bg-red-800 text-white rounded-lg hover:bg-red-900 text-sm transition-colors"
      >
        <Download className="w-4 h-4" />
        Download
      </button>
    )
  }

  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="border rounded-2xl p-6 hover:shadow-lg transition-all duration-200 bg-white">
      {/* Category badge */}
      <div className="flex justify-between items-start mb-3">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor()}`}>
          {getCategoryIcon()}
          {resource.category}
        </span>
        {resource.fileSize && (
          <span className="text-xs text-gray-500">{resource.fileSize}</span>
        )}
      </div>

      {/* Content */}
      <h3 className="font-semibold text-lg mb-2 text-gray-900">{resource.title}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {resource.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {resource.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
            {tag}
          </span>
        ))}
        {resource.tags.length > 3 && (
          <span className="text-xs px-2 py-1 text-gray-500">
            +{resource.tags.length - 3} more
          </span>
        )}
      </div>

      {/* Footer with metadata and action */}
      <div className="flex justify-between items-center pt-3 border-t">
        <div className="text-xs text-gray-500">
          {resource.author && <div>By {resource.author}</div>}
          {resource.course && <div className="text-red-800">{resource.course}</div>}
          <div>{formatDate(resource.uploadedAt)}</div>
        </div>

        {getActionButton()}
      </div>
    </div>
  )
}