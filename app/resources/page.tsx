'use client'

import { useState, useMemo, useEffect } from 'react'
import { Resource, ResourceCategory } from '@/lib/types'
import resourcesData from '@/app/data/resources.json'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { ResourceCard } from '@/components/resources/ResourceCard'
import { GoogleDriveSyncButton } from '@/components/resources/GoogleDriveSyncButton'

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  const resources = resourcesData.resources as Resource[]

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    resources.forEach(r => r.tags.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  }, [resources])

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    let filtered = resources

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory)
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(r =>
        selectedTags.some(tag => r.tags.includes(tag))
      )
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.tags.some(t => t.toLowerCase().includes(query))
      )
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.uploadedAt).getTime()
      const dateB = new Date(b.uploadedAt).getTime()
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [resources, selectedCategory, selectedTags, searchQuery, sortBy])

  // Paginate resources
  const paginatedResources = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredResources.slice(startIndex, endIndex)
  }, [filteredResources, currentPage])

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, selectedTags, searchQuery, sortBy])

  const categories: Array<ResourceCategory | 'all'> = [
    'all', 'presentation', 'document', 'video', 'template', 'dataset', 'code', 'other'
  ]

  const categoryLabels = {
    all: 'All Resources',
    presentation: 'Presentations',
    document: 'Documents',
    video: 'Videos',
    template: 'Templates',
    dataset: 'Datasets',
    code: 'Code',
    other: 'Other'
  }

  return (
    <main className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-4">Resources</h1>
            <p className="text-gray-600">
              Access our collection of presentations, documents, templates, and learning materials
            </p>
          </div>
          <GoogleDriveSyncButton />
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === cat
                  ? 'bg-red-800 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Tag filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Tags:</span>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => {
                if (selectedTags.includes(tag)) {
                  setSelectedTags(selectedTags.filter(t => t !== tag))
                } else {
                  setSelectedTags([...selectedTags, tag])
                }
              }}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Sort and results count */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {filteredResources.length} resources found
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Resource grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedResources.map(resource => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-red-800 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </main>
  )
}