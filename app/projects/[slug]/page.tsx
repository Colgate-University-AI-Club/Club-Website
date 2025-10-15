import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { ProjectItem } from '@/lib/types'
import projectsData from '@/app/data/projects.json'
import { Code, Zap, Layers, ExternalLink } from 'lucide-react'

interface ProjectDetailPageProps {
  params: Promise<{
    slug: string
  }>
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
    description: "This is a coding project. You'll write code to build this project.",
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
  },
  'no-code': {
    icon: Zap,
    label: 'No-Code Project',
    description: 'This is a no-code project. No programming required - use visual tools!',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200',
  },
  hybrid: {
    icon: Layers,
    label: 'Hybrid Project',
    description: 'This project combines coding and no-code tools.',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
  },
}

// Tool color categorization
const getToolColor = (tool: string): string => {
  const toolLower = tool.toLowerCase()

  // Programming languages - blue
  if (['python', 'javascript', 'typescript', 'java', 'c++', 'rust', 'go'].some(lang => toolLower.includes(lang))) {
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }

  // No-code tools - purple
  if (['n8n', 'make.com', 'lovable', 'zapier', 'airtable'].some(tool => toolLower.includes(tool))) {
    return 'bg-purple-100 text-purple-800 border-purple-200'
  }

  // AI APIs - green
  if (['openai', 'anthropic', 'dalle', 'gpt', 'claude'].some(ai => toolLower.includes(ai.toLowerCase()))) {
    return 'bg-green-100 text-green-800 border-green-200'
  }

  // Databases - orange
  if (['postgresql', 'mysql', 'mongodb', 'pinecone', 'redis', 'supabase'].some(db => toolLower.includes(db))) {
    return 'bg-orange-100 text-orange-800 border-orange-200'
  }

  // Default - gray
  return 'bg-gray-100 text-gray-700 border-gray-200'
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const projects = projectsData as ProjectItem[]
  const { slug } = await params
  const project = projects.find(p => p.slug === slug)

  if (!project) {
    notFound()
  }

  const projectTypeInfo = projectTypeConfig[project.projectType]
  const ProjectTypeIcon = projectTypeInfo.icon

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/projects"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Projects
        </Link>
      </div>

      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${levelColors[project.level]}`}>
            {project.level}
          </span>
          {project.durationHours && (
            <span className="text-gray-500 text-sm">
              Estimated time: {project.durationHours} hours
            </span>
          )}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">{project.title}</h1>
        <p className="text-xl text-gray-600 mb-6">{project.summary}</p>
      </header>

      {/* Project Type Section */}
      <section className={`mb-8 p-6 rounded-2xl border-2 ${projectTypeInfo.borderColor} ${projectTypeInfo.bgColor}`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${projectTypeInfo.bgColor} ${projectTypeInfo.textColor}`}>
            <ProjectTypeIcon className="h-8 w-8" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${projectTypeInfo.textColor} mb-2`}>
              {projectTypeInfo.label}
            </h2>
            <p className={`${projectTypeInfo.textColor} opacity-90`}>
              {projectTypeInfo.description}
            </p>
          </div>
        </div>
      </section>

      {/* Tools & Technologies Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tools & Technologies</h2>
        <div className="flex flex-wrap gap-3">
          {project.tools.map((tool, index) => (
            <span
              key={index}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all hover:shadow-md ${getToolColor(tool)}`}
            >
              {tool}
            </span>
          ))}
        </div>
      </section>

      {/* Prerequisites Callout */}
      <section className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Prerequisites
        </h3>
        <p className="text-gray-700 mb-3">Before starting, make sure you have:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {project.tools.map((tool, index) => (
            <li key={index}>{tool} {tool.toLowerCase().includes('api') ? 'key' : 'account or installation'}</li>
          ))}
        </ul>
      </section>

      {/* Repository & Workflow Buttons */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-4">
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:shadow-md"
            >
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View GitHub Repository
            </a>
          )}
          {project.workflowUrl && (
            <a
              href={project.workflowUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-purple-300 text-sm font-medium rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all hover:shadow-md"
            >
              <ExternalLink className="h-5 w-5" />
              View Workflow Template
            </a>
          )}
        </div>
      </section>

      {project.resources && project.resources.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{resource.label}</span>
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {project.body && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Details</h2>
          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:text-red-800 prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-red-100 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:mb-5 prose-p:leading-relaxed prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-medium prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-6 prose-ul:list-disc prose-ul:ml-6 prose-ul:space-y-3 prose-ol:list-decimal prose-ol:ml-6 prose-ol:space-y-3 prose-li:leading-relaxed">
            <ReactMarkdown>{project.body}</ReactMarkdown>
          </div>
        </section>
      )}
    </div>
  )
}