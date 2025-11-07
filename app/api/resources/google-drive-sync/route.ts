import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import fs from 'fs/promises'
import path from 'path'
import { Resource, ResourceCategory } from '@/lib/types'

// Rate limiting
const syncCooldown = new Map<string, number>()
const COOLDOWN_DURATION = 60000 // 1 minute

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const lastSync = syncCooldown.get(ip)
    if (lastSync && Date.now() - lastSync < COOLDOWN_DURATION) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please wait before syncing again',
          cooldown: Math.ceil((COOLDOWN_DURATION - (Date.now() - lastSync)) / 1000)
        },
        { status: 429 }
      )
    }
    syncCooldown.set(ip, Date.now())

    // Get environment variables
    const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID
    const GOOGLE_SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY

    if (!GOOGLE_DRIVE_FOLDER_ID || !GOOGLE_SERVICE_ACCOUNT_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Drive configuration missing. Please set GOOGLE_DRIVE_FOLDER_ID and GOOGLE_SERVICE_ACCOUNT_KEY environment variables.'
        },
        { status: 500 }
      )
    }

    // Parse service account credentials
    let credentials
    try {
      credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_KEY)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid service account credentials format' },
        { status: 500 }
      )
    }

    // Authenticate with Google Drive
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    })

    const drive = google.drive({ version: 'v3', auth })

    // List files in the specified folder
    const response = await drive.files.list({
      q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink, description)',
      orderBy: 'modifiedTime desc',
      pageSize: 1000
    })

    const files = response.data.files || []

    // Transform Google Drive files to Resource format
    const driveResources: Resource[] = files.map(file => {
      const category = determineCategory(file.mimeType || '', file.name || '')
      const fileExtension = getFileExtension(file.name || '')

      return {
        id: `gdrive-${file.id}`,
        title: cleanFileName(file.name || 'Untitled'),
        description: file.description || generateDescription(file.name || '', category),
        category,
        tags: extractTagsFromFileName(file.name || ''),
        fileType: fileExtension,
        fileSize: formatFileSize(parseInt(file.size || '0')),
        downloadUrl: file.webContentLink || file.webViewLink || '',
        author: 'Google Drive',
        uploadedAt: file.modifiedTime || new Date().toISOString(),
        source: 'google-drive' as const
      }
    })

    // Load existing resources
    const resourcesPath = path.join(process.cwd(), 'app/data/resources.json')
    const existingData = JSON.parse(await fs.readFile(resourcesPath, 'utf-8'))

    // Merge resources: keep manual ones, update Google Drive ones
    const manualResources = existingData.resources.filter((r: Resource) => r.source !== 'google-drive')
    const mergedResources = [...manualResources, ...driveResources]

    // Sort by upload date (newest first)
    mergedResources.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )

    // Update resources.json
    const updatedData = {
      lastUpdated: new Date().toISOString(),
      resources: mergedResources
    }

    await fs.writeFile(resourcesPath, JSON.stringify(updatedData, null, 2))

    return NextResponse.json({
      success: true,
      message: `Synced ${driveResources.length} resources from Google Drive`,
      stats: {
        driveResources: driveResources.length,
        manualResources: manualResources.length,
        totalResources: mergedResources.length
      }
    })

  } catch (error) {
    console.error('Google Drive sync error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Provide helpful error messages
    if (errorMessage.includes('invalid_grant')) {
      return NextResponse.json(
        { success: false, error: 'Service account authentication failed. Please check credentials.' },
        { status: 401 }
      )
    }

    if (errorMessage.includes('Folder not found')) {
      return NextResponse.json(
        { success: false, error: 'Google Drive folder not found. Please check folder ID and permissions.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: errorMessage || 'Failed to sync with Google Drive' },
      { status: 500 }
    )
  }
}

// Helper functions

function determineCategory(mimeType: string, fileName: string): ResourceCategory {
  const name = fileName.toLowerCase()

  // Check file extensions first
  if (name.endsWith('.pptx') || name.endsWith('.ppt') || name.includes('slides')) {
    return 'presentation'
  }
  if (name.endsWith('.pdf') || name.endsWith('.docx') || name.endsWith('.doc')) {
    return 'document'
  }
  if (name.endsWith('.mp4') || name.endsWith('.mov') || name.endsWith('.avi')) {
    return 'video'
  }
  if (name.includes('template') || name.endsWith('.zip')) {
    return 'template'
  }
  if (name.endsWith('.csv') || name.endsWith('.json') || name.includes('dataset')) {
    return 'dataset'
  }
  if (name.endsWith('.py') || name.endsWith('.ipynb') || name.endsWith('.js')) {
    return 'code'
  }

  // Check MIME types
  if (mimeType.includes('presentation')) return 'presentation'
  if (mimeType.includes('spreadsheet')) return 'dataset'
  if (mimeType.includes('document')) return 'document'
  if (mimeType.includes('video')) return 'video'
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'template'

  return 'other'
}

function getFileExtension(fileName: string): string {
  const parts = fileName.split('.')
  if (parts.length > 1) {
    return parts[parts.length - 1].toLowerCase()
  }
  return 'file'
}

function cleanFileName(fileName: string): string {
  // Remove file extension and clean up
  return fileName
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .trim()
    // Capitalize first letter of each word
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function extractTagsFromFileName(fileName: string): string[] {
  const tags = new Set<string>()
  const name = fileName.toLowerCase()

  // Common keywords to extract as tags
  const keywords = [
    'machine learning', 'ml', 'ai', 'artificial intelligence',
    'deep learning', 'neural network', 'python', 'tensorflow',
    'pytorch', 'sklearn', 'scikit-learn', 'numpy', 'pandas',
    'data science', 'statistics', 'algorithm', 'model',
    'tutorial', 'workshop', 'lecture', 'assignment', 'project',
    'beginner', 'intermediate', 'advanced', 'introduction', 'intro',
    'nlp', 'computer vision', 'cv', 'reinforcement learning',
    'classification', 'regression', 'clustering', 'prediction'
  ]

  keywords.forEach(keyword => {
    if (name.includes(keyword.replace(' ', '')) || name.includes(keyword)) {
      tags.add(keyword)
    }
  })

  // Extract course codes (e.g., COSC290)
  const courseMatch = name.match(/[a-z]{2,4}\s?\d{3}/i)
  if (courseMatch) {
    tags.add(courseMatch[0].toUpperCase())
  }

  // Extract year (e.g., 2024)
  const yearMatch = name.match(/20\d{2}/)
  if (yearMatch) {
    tags.add(yearMatch[0])
  }

  // Add category-specific tags
  if (name.includes('slides') || name.includes('presentation')) tags.add('presentation')
  if (name.includes('notebook') || name.includes('.ipynb')) tags.add('jupyter')
  if (name.includes('dataset') || name.includes('data')) tags.add('dataset')
  if (name.includes('template')) tags.add('template')

  return Array.from(tags).slice(0, 10) // Limit to 10 tags
}

function generateDescription(fileName: string, category: ResourceCategory): string {
  const name = cleanFileName(fileName)

  const descriptions: Record<ResourceCategory, string> = {
    presentation: `Presentation slides on ${name}`,
    document: `Document covering ${name}`,
    video: `Video tutorial on ${name}`,
    template: `${name} template for projects and assignments`,
    dataset: `Dataset for ${name} analysis and experiments`,
    code: `Code implementation for ${name}`,
    other: `Resource file: ${name}`
  }

  return descriptions[category]
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}