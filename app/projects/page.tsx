import { Suspense } from 'react'
import Link from 'next/link'
import { ProjectItem } from '@/lib/types'
import { paginateArray } from '@/lib/paginate'
import ProjectCard from '@/components/projects/ProjectCard'
import Pagination from '@/components/common/Pagination'
import projectsData from '@/app/data/projects.json'

interface ProjectsPageProps {
  searchParams?: Promise<{
    type?: string
    level?: string
    page?: string
  }>
}

async function ProjectsContent({ searchParams }: ProjectsPageProps) {
  const projects = projectsData as ProjectItem[]
  const params = await searchParams
  const type = params?.type
  const level = params?.level
  const page = parseInt(params?.page || '1', 10)

  // Filter by type first
  let filteredProjects = projects
  if (type && type !== 'all') {
    filteredProjects = filteredProjects.filter(item => item.projectType === type)
  }

  // Then filter by level
  if (level) {
    filteredProjects = filteredProjects.filter(item => item.level === level)
  }

  const sortedProjects = filteredProjects.sort((a, b) => a.title.localeCompare(b.title))

  const paginatedData = paginateArray(sortedProjects, page, 9)
  const allLevels = ['beginner', 'intermediate', 'advanced'] as const
  const allTypes = [
    { value: 'all', label: 'All', emoji: '', bgColor: 'bg-gray-100', textColor: 'text-gray-800', activeBg: 'bg-gray-200' },
    { value: 'code', label: 'Coding', emoji: '💻', bgColor: 'bg-blue-100', textColor: 'text-blue-800', activeBg: 'bg-blue-100' },
    { value: 'no-code', label: 'No-Code', emoji: '⚡', bgColor: 'bg-purple-100', textColor: 'text-purple-800', activeBg: 'bg-purple-100' },
    { value: 'hybrid', label: 'Hybrid', emoji: '🔀', bgColor: 'bg-green-100', textColor: 'text-green-800', activeBg: 'bg-green-100' },
  ] as const

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Projects</h1>
        <p className="text-gray-600 mb-6">
          Hands-on AI and machine learning projects to practice your skills.
        </p>

        {/* Project Type Filter */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Filter by type:</h2>
          <div className="flex flex-wrap gap-2">
            {allTypes.map((typeOption) => {
              const isActive = !type ? typeOption.value === 'all' : type === typeOption.value
              const baseUrl = level ? `/projects?level=${level}` : '/projects'
              const href = typeOption.value === 'all'
                ? baseUrl
                : level
                  ? `/projects?type=${typeOption.value}&level=${level}`
                  : `/projects?type=${typeOption.value}`

              return (
                <Link
                  key={typeOption.value}
                  href={href}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? `${typeOption.activeBg} ${typeOption.textColor} hover:opacity-90`
                      : `${typeOption.bgColor} ${typeOption.textColor} hover:opacity-75`
                  }`}
                >
                  {typeOption.emoji && <span>{typeOption.emoji}</span>}
                  {typeOption.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Difficulty Level Filter */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Filter by level:</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href={type ? `/projects?type=${type}` : '/projects'}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                !level
                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              All
            </Link>
            {allLevels.map((levelName) => {
              const href = type
                ? `/projects?type=${type}&level=${levelName}`
                : `/projects?level=${levelName}`

              return (
                <Link
                  key={levelName}
                  href={href}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                    level === levelName
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {levelName}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {paginatedData.slice.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {type || level
              ? `No ${type && type !== 'all' ? type.replace('-', ' ') : ''} ${level || ''} projects found. Try adjusting your filters.`
              : 'No projects available.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedData.slice.map((item) => (
              <ProjectCard key={item.id} item={item} />
            ))}
          </div>

          <Pagination
            page={paginatedData.page}
            totalPages={paginatedData.totalPages}
          />
        </>
      )}
    </div>
  )
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>}>
      <ProjectsContent searchParams={searchParams} />
    </Suspense>
  )
}
