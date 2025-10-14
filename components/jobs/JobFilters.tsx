'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface JobFilters {
  search: string
  jobTypes: string[]
  locations: string[]
  salaryRange: {
    min: number
    max: number
  }
  isRemote: boolean | null // null = all, true = remote only, false = on-site only
}

export type SortOption = 'title' | 'company' | 'salary-high' | 'salary-low' | 'date'

interface JobFiltersProps {
  filters: JobFilters
  sortBy: SortOption
  onFiltersChange: (filters: JobFilters) => void
  onSortChange: (sortBy: SortOption) => void
  availableJobTypes: string[]
  availableLocations: string[]
  className?: string
}

export default function JobFiltersComponent({
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  availableJobTypes,
  availableLocations,
  className
}: JobFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilters = (updates: Partial<JobFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const handleJobTypeToggle = (jobType: string) => {
    const newJobTypes = filters.jobTypes.includes(jobType)
      ? filters.jobTypes.filter(type => type !== jobType)
      : [...filters.jobTypes, jobType]
    updateFilters({ jobTypes: newJobTypes })
  }

  const handleLocationToggle = (location: string) => {
    const newLocations = filters.locations.includes(location)
      ? filters.locations.filter(loc => loc !== location)
      : [...filters.locations, location]
    updateFilters({ locations: newLocations })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      jobTypes: [],
      locations: [],
      salaryRange: { min: 0, max: 1000000 },
      isRemote: null
    })
    onSortChange('date')
  }

  const hasActiveFilters =
    filters.search !== '' ||
    filters.jobTypes.length > 0 ||
    filters.locations.length > 0 ||
    filters.isRemote !== null ||
    filters.salaryRange.min > 0 ||
    filters.salaryRange.max < 1000000

  return (
    <div className={cn("bg-white rounded-2xl border border-gray-200 p-6", className)}>
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Search */}
        <div className="flex-1">
          <label htmlFor="job-search" className="block text-sm font-medium text-gray-700 mb-1">
            Search jobs
          </label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="job-search"
              type="text"
              placeholder="Search by title or company..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="sm:w-48">
          <label htmlFor="job-sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort by
          </label>
          <select
            id="job-sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="date">Most Recent</option>
            <option value="title">Job Title</option>
            <option value="company">Company Name</option>
            <option value="salary-high">Salary (High to Low)</option>
            <option value="salary-low">Salary (Low to High)</option>
          </select>
        </div>

        {/* Expand/Collapse Filters */}
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="whitespace-nowrap"
          >
            {isExpanded ? 'Hide Filters' : 'More Filters'}
            <svg className={cn("h-4 w-4 ml-2 transition-transform", isExpanded && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          {/* Job Types */}
          {availableJobTypes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Job Type</h3>
              <div className="flex flex-wrap gap-2">
                {availableJobTypes.map((jobType) => (
                  <button
                    key={jobType}
                    onClick={() => handleJobTypeToggle(jobType)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      filters.jobTypes.includes(jobType)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {jobType}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Remote/On-site */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Work Style</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'All', value: null },
                { label: 'Remote', value: true },
                { label: 'On-site', value: false }
              ].map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => updateFilters({ isRemote: value })}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    filters.isRemote === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Locations */}
          {availableLocations.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableLocations.slice(0, 15).map((location) => (
                  <button
                    key={location}
                    onClick={() => handleLocationToggle(location)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      filters.locations.includes(location)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {location}
                  </button>
                ))}
                {availableLocations.length > 15 && (
                  <span className="px-3 py-1.5 text-sm text-gray-500">
                    +{availableLocations.length - 15} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Salary Range */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Salary Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="salary-min" className="block text-xs text-gray-500 mb-1">Minimum</label>
                <input
                  id="salary-min"
                  type="number"
                  placeholder="0"
                  value={filters.salaryRange.min || ''}
                  onChange={(e) => updateFilters({
                    salaryRange: {
                      ...filters.salaryRange,
                      min: parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label htmlFor="salary-max" className="block text-xs text-gray-500 mb-1">Maximum</label>
                <input
                  id="salary-max"
                  type="number"
                  placeholder="1000000"
                  value={filters.salaryRange.max === 1000000 ? '' : filters.salaryRange.max}
                  onChange={(e) => updateFilters({
                    salaryRange: {
                      ...filters.salaryRange,
                      max: parseInt(e.target.value) || 1000000
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                size="sm"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}