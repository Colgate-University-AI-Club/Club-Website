import { JobData, SupabaseJobRow } from './types'
import { JobFilters, SortOption } from '@/components/jobs/JobFilters'

/**
 * Maps a Supabase job row to JobData interface
 */
export function mapSupabaseJobToJobData(row: SupabaseJobRow): JobData {
  return {
    jobKey: row.job_key,
    title: row.title,
    companyName: row.company_name,
    jobType: row.job_type || ['Full-time'],
    descriptionText: row.description_text,
    companyUrl: row.company_url,
    location: {
      city: row.location_city,
      postalCode: row.location_postal_code,
      country: row.location_country,
      countryCode: row.location_country_code,
      formattedAddressLong: row.location_full_address,
      formattedAddressShort: `${row.location_city}, ${row.location_country_code}`,
      latitude: 0, // We'll set default values since these aren't in your schema
      longitude: 0,
      streetAddress: null,
      fullAddress: row.location_full_address
    },
    salary: {
      salaryCurrency: row.salary_currency,
      salaryMax: row.salary_max || 0,
      salaryMin: row.salary_min || 0,
      salarySource: 'database',
      salaryText: row.salary_text,
      salaryType: row.salary_type
    },
    benefits: row.benefits || [],
    attributes: row.attributes || [],
    jobUrl: row.job_url,
    applyUrl: row.apply_url,
    requirements: row.requirements || [],
    jobCardSummary: row.job_card_summary,
    postedAt: row.created_at
  }
}

/**
 * Checks if a location indicates remote work
 */
export function isRemoteLocation(location: string): boolean {
  const remoteKeywords = ['remote', 'anywhere', 'virtual', 'work from home', 'wfh']
  return remoteKeywords.some(keyword =>
    location.toLowerCase().includes(keyword.toLowerCase())
  )
}

/**
 * Extracts numeric salary value for sorting
 */
export function extractSalaryValue(job: JobData): number {
  if (!job.salary?.salaryMax && !job.salary?.salaryMin) return 0

  // Use the average of min and max, or whichever is available
  if (job.salary.salaryMax && job.salary.salaryMin) {
    return (job.salary.salaryMax + job.salary.salaryMin) / 2
  }

  return job.salary.salaryMax || job.salary.salaryMin || 0
}

/**
 * Filters jobs based on the provided filters
 */
export function filterJobs(jobs: JobData[], filters: JobFilters): JobData[] {
  return jobs.filter(job => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const matchesTitle = job.title.toLowerCase().includes(searchTerm)
      const matchesCompany = job.companyName?.toLowerCase().includes(searchTerm) || false
      const matchesLocation = job.location.formattedAddressShort.toLowerCase().includes(searchTerm)

      if (!matchesTitle && !matchesCompany && !matchesLocation) {
        return false
      }
    }

    // Job type filter
    if (filters.jobTypes.length > 0) {
      const hasMatchingJobType = job.jobType.some(type =>
        filters.jobTypes.includes(type)
      )
      if (!hasMatchingJobType) return false
    }

    // Location filter
    if (filters.locations.length > 0) {
      const matchesLocation = filters.locations.includes(job.location.city) ||
        filters.locations.includes(job.location.formattedAddressShort)
      if (!matchesLocation) return false
    }

    // Remote filter
    if (filters.isRemote !== null) {
      const jobIsRemote = isRemoteLocation(job.location.formattedAddressShort) ||
        isRemoteLocation(job.location.fullAddress)

      if (filters.isRemote && !jobIsRemote) return false
      if (!filters.isRemote && jobIsRemote) return false
    }

    // Salary range filter
    if (filters.salaryRange.min > 0 || filters.salaryRange.max < 1000000) {
      const jobSalary = extractSalaryValue(job)
      if (jobSalary === 0) return true // Include jobs with unknown salary

      if (jobSalary < filters.salaryRange.min || jobSalary > filters.salaryRange.max) {
        return false
      }
    }

    return true
  })
}

/**
 * Sorts jobs based on the specified sort option
 */
export function sortJobs(jobs: JobData[], sortBy: SortOption): JobData[] {
  const sortedJobs = [...jobs]

  switch (sortBy) {
    case 'title':
      return sortedJobs.sort((a, b) => a.title.localeCompare(b.title))

    case 'company':
      return sortedJobs.sort((a, b) => {
        const companyA = a.companyName || ''
        const companyB = b.companyName || ''
        return companyA.localeCompare(companyB)
      })

    case 'salary-high':
      return sortedJobs.sort((a, b) => {
        const salaryA = extractSalaryValue(a)
        const salaryB = extractSalaryValue(b)
        return salaryB - salaryA // Descending order
      })

    case 'salary-low':
      return sortedJobs.sort((a, b) => {
        const salaryA = extractSalaryValue(a)
        const salaryB = extractSalaryValue(b)
        return salaryA - salaryB // Ascending order
      })

    case 'date':
    default:
      return sortedJobs.sort((a, b) => {
        // Sort by posted date if available, otherwise by job key
        if (a.postedAt && b.postedAt) {
          return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
        }
        if (a.postedAt && !b.postedAt) return -1
        if (!a.postedAt && b.postedAt) return 1
        return b.jobKey.localeCompare(a.jobKey)
      })
  }
}

/**
 * Extracts unique values for filter options
 */
export function extractFilterOptions(jobs: JobData[]) {
  const jobTypes = new Set<string>()
  const locations = new Set<string>()

  jobs.forEach(job => {
    // Job types
    job.jobType.forEach(type => jobTypes.add(type))

    // Locations (use city for cleaner display)
    locations.add(job.location.city)
  })

  return {
    jobTypes: Array.from(jobTypes).sort(),
    locations: Array.from(locations).sort()
  }
}

/**
 * Creates a debounced function for search
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Fetches jobs data from the API
 */
export async function fetchJobs(): Promise<{
  jobs: JobData[]
  cached: boolean
  lastUpdated: string | null
  count: number
  error?: string
}> {
  try {
    const response = await fetch('/api/jobs', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return {
      jobs: [],
      cached: false,
      lastUpdated: null,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Forces a refresh of the jobs cache
 */
export async function refreshJobsCache(): Promise<{
  success: boolean
  count?: number
  lastUpdated?: string
  error?: string
}> {
  try {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Refresh request failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error refreshing jobs cache:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}