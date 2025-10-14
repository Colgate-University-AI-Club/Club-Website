import { Suspense } from 'react'
import { ProjectItem } from '@/lib/types'
import { paginateArray } from '@/lib/paginate'
import ProjectCard from '@/components/projects/ProjectCard'
import Pagination from '@/components/common/Pagination'
import projectsData from '@/app/data/projects.json'

interface ProjectsPageProps {
  searchParams?: Promise<{
    level?: string
    page?: string
  }>
}

async function ProjectsContent({ searchParams }: ProjectsPageProps) {
  const projects = projectsData as ProjectItem[]
  const params = await searchParams
  const level = params?.level
  const page = parseInt(params?.page || '1', 10)

  let filteredProjects = projects
  if (level) {
    filteredProjects = projects.filter(item => item.level === level)
  }

  const sortedProjects = filteredProjects.sort((a, b) => a.title.localeCompare(b.title))

  const paginatedData = paginateArray(sortedProjects, page, 9)
  const allLevels = ['beginner', 'intermediate', 'advanced'] as const

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Projects</h1>
        <p className="text-gray-600 mb-6">
          Hands-on AI and machine learning projects to practice your skills.
        </p>

        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Filter by level:</h2>
          <div className="flex flex-wrap gap-2">
            {allLevels.map((levelName) => (
              <button
                key={levelName}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                  level === levelName
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {levelName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {paginatedData.slice.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {level ? `No ${level} projects found.` : 'No projects available.'}
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
