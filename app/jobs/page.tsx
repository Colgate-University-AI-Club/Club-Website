'use client'

import { useState, useEffect, useMemo } from 'react'
import { JobData } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { paginateArray } from '@/lib/paginate'
import EnhancedJobCard from '@/components/jobs/EnhancedJobCard'
import JobModal from '@/components/jobs/JobModal'
import JobFiltersComponent, { JobFilters, SortOption } from '@/components/jobs/JobFilters'
import { Button } from '@/components/ui/button'
import {
  fetchJobs,
  filterJobs,
  sortJobs,
  extractFilterOptions,
  debounce,
  refreshJobsCache
} from '@/lib/jobUtils'

export default function JobsPage() {
  // State management
  const [jobs, setJobs] = useState<JobData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Modal state
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter and pagination state
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    jobTypes: [],
    locations: [],
    salaryRange: { min: 0, max: 1000000 },
    isRemote: null
  })
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [currentPage, setCurrentPage] = useState(1)

  // Debounced search
  const debouncedSetFilters = useMemo(
    () => debounce((newFilters: JobFilters) => {
      setFilters(newFilters)
      setCurrentPage(1) // Reset to first page when filters change
    }, 300),
    []
  )

  // Load jobs data and set up real-time subscription
  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true)
      try {
        const result = await fetchJobs()
        setJobs(result.jobs)
        setLastUpdated(result.lastUpdated)
        setIsCached(result.cached)
        if (result.error) {
          setError(result.error)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs')
      } finally {
        setLoading(false)
      }
    }

    loadJobs()

    // Set up real-time subscription for job updates
    const subscription = supabase
      .channel('jobs_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: 'status=eq.active'
        },
        (payload) => {
          console.log('🔄 Real-time job update:', payload)

          // Refresh jobs when there are changes to active jobs
          if (payload.eventType === 'INSERT' ||
              payload.eventType === 'UPDATE' ||
              payload.eventType === 'DELETE') {

            // Reload jobs data in the background
            fetchJobs().then(result => {
              setJobs(result.jobs)
              setLastUpdated(result.lastUpdated)
              setIsCached(result.cached)
              if (result.error) {
                setError(result.error)
              }
            }).catch(err => {
              console.error('Failed to refresh jobs after real-time update:', err)
            })
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const result = await refreshJobsCache()
      if (result.success) {
        // Reload the jobs data
        const jobsResult = await fetchJobs()
        setJobs(jobsResult.jobs)
        setLastUpdated(jobsResult.lastUpdated)
        setIsCached(false)
        setError(null)
      } else {
        setError(result.error || 'Failed to refresh jobs')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh jobs')
    } finally {
      setRefreshing(false)
    }
  }

  // Handle modal operations
  const handleJobSelect = (job: JobData) => {
    setSelectedJob(job)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedJob(null)
  }

  // Process jobs with filters and sorting
  const { filteredAndSortedJobs, filterOptions } = useMemo(() => {
    const filtered = filterJobs(jobs, filters)
    const sorted = sortJobs(filtered, sortBy)
    const options = extractFilterOptions(jobs)

    return {
      filteredAndSortedJobs: sorted,
      filterOptions: options
    }
  }, [jobs, filters, sortBy])

  // Pagination
  const paginatedData = useMemo(() => {
    return paginateArray(filteredAndSortedJobs, currentPage, 12) // 12 jobs per page
  }, [filteredAndSortedJobs, currentPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, sortBy])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded mb-6 w-3/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Jobs</h1>
            <p className="text-gray-600">
              Discover AI and machine learning opportunities curated for students.
            </p>
          </div>

          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            {lastUpdated && (
              <div className="text-sm text-gray-500">
                Last updated: {new Date(lastUpdated).toLocaleDateString()}
                {isCached && (
                  <span className="ml-1 text-blue-600">(cached)</span>
                )}
              </div>
            )}

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              size="sm"
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Job count and results info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 mb-6">
          <div>
            Showing {paginatedData.slice.length} of {filteredAndSortedJobs.length} jobs
            {filteredAndSortedJobs.length !== jobs.length && (
              <span className="ml-1">
                (filtered from {jobs.length} total)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <JobFiltersComponent
        filters={filters}
        sortBy={sortBy}
        onFiltersChange={debouncedSetFilters}
        onSortChange={setSortBy}
        availableJobTypes={filterOptions.jobTypes}
        availableLocations={filterOptions.locations}
        className="mb-8"
      />

      {/* Jobs Grid */}
      {paginatedData.slice.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500 mb-4">
            {jobs.length === 0
              ? 'No jobs are currently available. Please check back later.'
              : 'Try adjusting your filters to see more results.'}
          </p>
          {filteredAndSortedJobs.length !== jobs.length && (
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  search: '',
                  jobTypes: [],
                  locations: [],
                  salaryRange: { min: 0, max: 1000000 },
                  isRemote: null
                })
                setSortBy('date')
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginatedData.slice.map((job) => (
              <EnhancedJobCard
                key={job.jobKey}
                job={job}
                onViewDetails={handleJobSelect}
              />
            ))}
          </div>

          {/* Pagination */}
          {paginatedData.totalPages > 1 && (
            <div className="mt-8">
              <div className="flex items-center justify-center gap-4">
                {currentPage > 1 ? (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    aria-label="Previous page"
                  >
                    ← Previous
                  </Button>
                ) : (
                  <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground/50 bg-muted/50 border border-border/50 rounded-md cursor-not-allowed">
                    ← Previous
                  </span>
                )}

                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {paginatedData.totalPages}
                </span>

                {currentPage < paginatedData.totalPages ? (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    aria-label="Next page"
                  >
                    Next →
                  </Button>
                ) : (
                  <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground/50 bg-muted/50 border border-border/50 rounded-md cursor-not-allowed">
                    Next →
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Job Modal */}
      <JobModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  )
}
