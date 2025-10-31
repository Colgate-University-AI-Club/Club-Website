# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

Always run `npm run build` before committing to ensure TypeScript and build errors are caught early.

## Starting the Dev Server

### Quick Start

**Option 1: From the inner directory (recommended)**
```bash
cd "/Users/seabasstheman/Desktop/AI Club Website/colgate-ai-club"
npm run dev
```

**Option 2: From the root directory**
```bash
cd "/Users/seabasstheman/Desktop/AI Club Website"
npm run dev
```

### Troubleshooting Dev Server Issues

**Root Cause of Common Issues:**
Corrupted `node_modules` or `.next` cache can cause the `next` command to hang indefinitely without starting the server. Multiple concurrent dev servers or interrupted builds can corrupt the `.next` cache directory.

**If the dev server hangs or won't start:**

1. **Kill any hanging processes:**
   ```bash
   pkill -9 -f "next dev"
   ```

2. **Clean the cache:**
   ```bash
   cd "/Users/seabasstheman/Desktop/AI Club Website/colgate-ai-club"
   rm -rf .next
   npm run dev
   ```

3. **Reinstall dependencies (if cache cleaning didn't work):**
   ```bash
   cd "/Users/seabasstheman/Desktop/AI Club Website/colgate-ai-club"
   rm -rf node_modules .next
   npm install
   npm run dev
   ```

**Common Cache Corruption Symptoms:**

1. **500 Internal Server Error on specific pages** (e.g., `/jobs`)
   - Error message: `Cannot find module '.next/server/app/jobs/page.js'`
   - Cause: Corrupted or incomplete build artifacts in `.next` directory
   - Solution: Clear `.next` cache and restart dev server

2. **Module not found errors for numbered modules** (e.g., `Cannot find module './611.js'`)
   - Cause: Webpack chunk files corrupted or missing from `.next` directory
   - Solution: Clear `.next` cache and restart dev server

3. **Dev server starts but pages fail to load**
   - Cause: Partial or corrupted build in `.next` directory
   - Solution: Clear `.next` cache and restart dev server

**Prevention Tips:**
- Avoid running multiple `npm run dev` instances simultaneously
- Always kill dev server cleanly (Ctrl+C) instead of force-killing terminal
- If making major code changes, restart dev server after completion
- Clear `.next` cache before major git branch switches

### Quick Reference

**Fast startup:**
```bash
cd "colgate-ai-club" && npm run dev
```

**Clean restart (if problems occur):**
```bash
cd "colgate-ai-club"
rm -rf .next
npm run dev
```

**Nuclear option (complete reinstall):**
```bash
cd "colgate-ai-club"
rm -rf node_modules .next
npm install
npm run dev
```

The server runs at **http://127.0.0.1:3000**

## Architecture Overview

This is a **Colgate AI Club website** built with Next.js 15 (App Router), TypeScript, and Tailwind CSS. The site renders content from Supabase database tables (news, jobs) and JSON files (events, projects) without requiring authentication.

### Data-Driven Content Model
Content is stored in both Supabase database tables and `app/data/*.json` files:
- **Supabase tables:**
  - `news` → `/news` page with tag filtering and pagination (tags auto-generated)
  - `jobs` → `/jobs` page with tag filtering and pagination
- **JSON files:**
  - `events.json` → `/events` page showing upcoming events + Google Calendar embed
  - `projects.json` → `/projects` list page + individual `/projects/[slug]` detail pages
  - `contribute-queue.json` → Created dynamically by API submissions

All content types use TypeScript definitions in `lib/types.ts` (`NewsItem`, `JobItem`, `EventItem`, `ProjectItem`).

### Page Architecture
- **Static pages**: `/`, `/about`, `/events`, `/contribute`
- **Dynamic filtered lists**: `/news`, `/jobs`, `/projects` (support `?tag=` and `?page=` search params)
- **Dynamic detail pages**: `/projects/[slug]` (finds project by slug from JSON)
- **API routes**: `/api/contribute` (POST endpoint with rate limiting, validation, file storage)

### Component Structure
```
components/
├── site/          # Global chrome (NavBar, Footer)
├── ui/            # Reusable UI primitives (SectionHeader, CardGrid)
├── common/        # Shared functionality (Tag filtering, Pagination)
└── [domain]/      # Domain-specific cards (news/, jobs/, events/, projects/)
```

### Key Utilities
- `lib/date.ts` - Date formatting ("Thu, Sep 18, 7:00 PM" format)
- `lib/paginate.ts` - Array pagination returning `{slice, page, perPage, total, totalPages}`
- `lib/validators.ts` - Form validation (`isHttpUrl`, `isNonEmpty`)

### Design System
- **Colors**: Maroon accents (`text-red-800`, `bg-red-100`) with white background
- **Typography**: Clean, university-grade styling
- **Layout**: Responsive cards with `rounded-2xl` borders, hover transitions
- **Accessibility**: Focus-visible rings, semantic HTML, adequate contrast

### External Service Placeholders
The codebase includes TODO placeholders for:
1. **Google Calendar** - iframe src in `/events` page (currently embedded)
2. **Buttondown newsletter** - form action URL in Footer and home page
3. **Plausible Analytics** - script tag with domain in `app/layout.tsx`

### Contribute Flow
The `/contribute` form accepts resource submissions with client-side validation and posts to `/api/contribute`, which:
- Validates required fields using `lib/validators`
- Implements in-memory rate limiting (10 requests/minute per IP)
- Appends submissions to `app/data/contribute-queue.json`
- Includes honeypot spam protection

### SEO & Performance
- Dynamic `sitemap.xml` includes all static routes + project detail pages
- `robots.txt` allows all crawlers
- Static generation where possible, dynamic rendering for filtered pages
- Optimized with Next.js 15 and Turbopack bundler
- Follow the styling and layout approach of the home page for all other page builds.

## News System (Supabase)

### Overview
The news system stores articles in a Supabase PostgreSQL database and supports automated ingestion from n8n workflows. News articles can be from external sources (RSS feeds, scraped content) or club posts.

### Database Schema

**Table:** `news`

```sql
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  card_summary TEXT,
  content TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('club', 'external')),
  url TEXT NOT NULL UNIQUE,
  published_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Enable read access for all users" ON news
  FOR SELECT USING (true);

-- Policy: Allow service role to insert/update
CREATE POLICY "Enable insert for service role" ON news
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for service role" ON news
  FOR UPDATE USING (true);
```

**Key Features:**
- `source_type`: Distinguishes between club posts and external articles
- `url`: Unique constraint prevents duplicate articles
- Tags are generated on-the-fly using `extractTags()` function (not stored)
- No `updated_at` column (deemed irrelevant)

### Data Access Layer

**File:** `lib/news.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import { NewsItem } from './types'
import { extractTags } from './tags'

export async function getNews(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })

  return (data as SupabaseNewsRow[]).map(row => ({
    id: row.id,
    title: row.title,
    summary: row.card_summary || undefined,
    content: row.content || undefined,
    sourceType: row.source_type,
    url: row.url,
    tags: extractTags(row.title, row.content || ''),
    publishedAt: row.published_at
  }))
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  // Similar implementation with single article fetch
}
```

### News API Endpoint

**Endpoint:** `/api/news` (POST)

**Purpose:** Accepts news articles from n8n workflows and upserts them into Supabase

**Request Body:** Array of articles (sent as RAW JSON array, not wrapped in object)

```json
[
  {
    "url": "https://example.com/article",
    "title": "Article Title",
    "published_date": "2025-10-31T12:00:00Z",
    "content": "Full article content...",
    "card_summary": "Brief summary for card display"
  }
]
```

**Response:**
```json
{
  "success": true,
  "message": "Added/updated 5 articles. Total external articles: 42",
  "added": 5,
  "total": 42
}
```

**Implementation Details:**
- Uses `SUPABASE_SERVICE_ROLE_KEY` for write access (falls back to anon key)
- Upserts based on `url` field (prevents duplicates)
- Transforms `published_date` to ISO 8601 format
- Sets `source_type` to 'external' for n8n articles
- Returns count of added/updated articles

**File:** `app/api/news/route.ts`

### n8n Integration

**Workflow Configuration:**

1. **HTTP Request Node Settings:**
   - Method: POST
   - URL: `https://www.colgateaiclub.com/api/news`
   - Headers: `Content-Type: application/json`
   - **Body Type:** RAW (NOT "Using Fields Below")
   - **Body Expression:** `{{ $json.articles }}`

2. **Data Transformation:**
   - Fetch articles from RSS feeds or scraping nodes
   - Transform `published_date` to ISO 8601: `{{ new Date($json.pubDate).toISOString() }}`
   - Ensure array structure (not wrapped in object)

3. **Error Handling:**
   - Workflow includes retry logic (3 attempts)
   - API returns detailed error messages
   - Logs success/failure to n8n console

**Common Issues:**

- **"b.filter is not a function":** Body sent as object instead of array
  - Fix: Use RAW body type with expression `{{ $json.articles }}`
- **"read-only file system":** Attempting to write to JSON files in production
  - Fix: Already resolved - now uses Supabase
- **Date format errors:** Published date not in ISO 8601 format
  - Fix: Use `new Date(dateString).toISOString()` in n8n

### Page Implementation

**News List:** `app/news/page.tsx`
- Fetches articles with `getNews()` from `lib/news.ts`
- Uses `export const revalidate = 0` to disable caching
- Supports tag filtering and pagination

**News Detail:** `app/news/[id]/page.tsx`
- Fetches single article with `getNewsById(id)`
- Uses `export const dynamic = 'force-dynamic'` for fresh data
- Displays full content, summary, tags, and external link (if applicable)

**Homepage:** `app/page.tsx`
- Shows 3 latest articles from `getNews().slice(0, 3)`
- Also uses `export const revalidate = 0`

## Newsletter System

### Overview
The newsletter signup form uses an API proxy pattern to avoid CORS errors when posting to n8n webhooks. Client-side code calls our API, which forwards requests server-side to n8n.

### The CORS Problem

**Original Issue:**
```
Access to fetch at 'https://seabass34.app.n8n.cloud/webhook/...' from origin 'https://www.colgateaiclub.com'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**Why it happens:**
- Browsers block cross-origin requests from client JavaScript for security
- n8n webhooks don't include CORS headers by default
- Direct client-to-n8n requests are blocked in production

**Solution:**
Create an API proxy route that forwards requests server-side (server-to-server requests bypass CORS)

### API Proxy Implementation

**Endpoint:** `/api/newsletter/subscribe` (POST)

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid email address"
}
```

**Features:**
1. **Email Validation:** Uses `isValidEmail()` from `lib/validators.ts`
2. **Rate Limiting:** 10 requests per minute per IP address
3. **Metadata Enrichment:** Adds timestamp, source, and IP to n8n payload
4. **Error Handling:** Catches and returns detailed error messages

**File:** `app/api/newsletter/subscribe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { isValidEmail } from '@/lib/validators'

const N8N_NEWSLETTER_WEBHOOK = 'https://seabass34.app.n8n.cloud/webhook/9245414e-3af7-40f8-98ab-cd50d44750b5'

export async function POST(request: NextRequest) {
  // Email validation
  const { email } = await request.json()
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { success: false, error: 'Invalid email address' },
      { status: 400 }
    )
  }

  // Rate limiting check
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  // ... rate limiting logic ...

  // Forward to n8n webhook
  const n8nResponse = await fetch(N8N_NEWSLETTER_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      timestamp: new Date().toISOString(),
      source: 'website',
      ip
    })
  })

  return NextResponse.json({
    success: true,
    message: 'Successfully subscribed to newsletter'
  })
}
```

### Client-Side Integration

**Component:** `components/NewsletterSignup.tsx`

**Before (caused CORS error):**
```typescript
const response = await fetch('https://seabass34.app.n8n.cloud/webhook/...', {
  method: 'POST',
  mode: 'cors'  // Blocked by browser!
})
```

**After (uses API proxy):**
```typescript
const response = await fetch('/api/newsletter/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email })
})

const data = await response.json()
if (response.ok && data.success) {
  setStatus('success')
  setMessage('Thank you for subscribing!')
}
```

### n8n Webhook Configuration

**Newsletter Workflow:**
1. Receive webhook POST from API proxy
2. Extract email, timestamp, source, ip from payload
3. Validate email is not already subscribed
4. Add to email list (Buttondown, Mailchimp, etc.)
5. Send welcome email (optional)
6. Log subscription to Google Sheets or database

**Webhook URL:** `https://seabass34.app.n8n.cloud/webhook/9245414e-3af7-40f8-98ab-cd50d44750b5`

## Projects System

### Overview
The projects section (`/projects`) displays AI/ML learning projects with three project types (code, no-code, hybrid) and varying difficulty levels. Projects are stored in `app/data/projects.json` and include comprehensive markdown guides.

### Project Data Structure
Each project in `projects.json` includes:
- **id**: Unique identifier (e.g., "p1")
- **slug**: URL-safe identifier for routing (e.g., "sentiment-classifier")
- **title**: Project name
- **level**: Difficulty level ("beginner", "intermediate", or "advanced")
- **projectType**: Project classification ("code", "no-code", or "hybrid")
- **tools**: Array of required tools/technologies (e.g., ["Python", "scikit-learn"] or ["n8n", "OpenAI API"])
- **durationHours**: Estimated completion time in hours
- **summary**: Short description for project cards
- **repoUrl** (optional): GitHub repository URL (points to Colgate-University-Ai-Club organization)
- **workflowUrl** (optional): Workflow template URL (for no-code projects)
- **resources**: Array of helpful links (docs, tutorials, datasets, tools)
- **body**: Full markdown content with project guide (2000+ words including overview, learning objectives, prerequisites, step-by-step guide, expected outcomes)

### Project Type System

**Three Project Types:**

1. **Code Projects** (💻 Blue)
   - Traditional programming projects
   - Display GitHub repository links
   - Examples: Python ML classifiers, web applications, data pipelines
   - Tools: Programming languages, frameworks, libraries

2. **No-Code Projects** (⚡ Purple)
   - Visual automation and no-code tool projects
   - Display workflow template links
   - Examples: n8n workflows, Make.com automations, Lovable websites
   - Tools: n8n, Make.com, Zapier, Airtable, Lovable

3. **Hybrid Projects** (🔀 Green)
   - Combination of coding and no-code tools
   - Display both repository and workflow links
   - Examples: Python backend + n8n automation
   - Tools: Mix of programming languages and no-code platforms

### Project Filtering
The `/projects` page implements dual filtering (type + level):
- **Type filter**: All / Code / No-Code / Hybrid
- **Level filter**: All / Beginner / Intermediate / Advanced
- Filter buttons use Next.js `Link` components (NOT static buttons)
- URL query parameters control filtering:
  - Type only: `/projects?type=no-code`
  - Level only: `/projects?level=beginner`
  - Combined: `/projects?type=no-code&level=beginner`
- Both filters preserve each other's state when changed
- "All" button for each filter dimension
- Active filters highlighted with their respective colors

**Implementation Note:** Filter buttons MUST be `<Link>` components with proper `href` attributes. Static `<button>` elements will not work for navigation.

### Markdown Rendering
Project detail pages (`/projects/[slug]`) render markdown content using `react-markdown`:
- Import: `import ReactMarkdown from 'react-markdown'`
- Component: `<ReactMarkdown>{project.body}</ReactMarkdown>`
- **Content Format**: MUST be Markdown, NOT HTML
  - All projects in `projects.json` must have `body` field in Markdown format
  - HTML tags (like `<h2>`, `<p>`, `<ul>`) will display as plain text
  - Use Markdown syntax: `## Heading`, `- List item`, etc.
- **Enhanced Styling** (line 222 of `app/projects/[slug]/page.tsx`):
  - Larger base font size (`prose-lg`)
  - H2 headings in Colgate maroon (`text-red-800`) with bottom border accents
  - Increased spacing for clear visual hierarchy (mt-12 for H2, mt-8 for H3)
  - Relaxed line heights for better readability
  - Enhanced list spacing and indentation
  - Well-styled inline code and code blocks
- **NEVER use `dangerouslySetInnerHTML`** for markdown content

### GitHub Integration
Projects reference repositories in the Colgate-University-Ai-Club GitHub organization:
- ProjectCard component fetches repository stats via `/api/github/repo-info?url=[repoUrl]`
- GitHub API returns stars, forks, and last updated timestamp
- Component includes graceful error handling for non-existent repositories (404s are caught and silently ignored)
- **Repository Creation**: GitHub repositories MUST be created manually before adding projects to `projects.json`. There is no automatic repository creation for security reasons.

### Tool Color Categorization

Project detail pages automatically color-code tools based on their category:

- **Programming Languages** (Blue): python, javascript, typescript, java, c++, rust, go
- **No-Code Tools** (Purple): n8n, make.com, lovable, zapier, airtable
- **AI APIs** (Green): openai, anthropic, dalle, gpt, claude
- **Databases** (Orange): postgresql, mysql, mongodb, pinecone, redis, supabase
- **Default** (Gray): Unknown or uncategorized tools

Implementation in `app/projects/[slug]/page.tsx:48-73` with the `getToolColor()` function.

### UI Components

**ProjectCard** (`components/projects/ProjectCard.tsx`):
- Displays project type badge with icon (Code/Zap/Layers)
- Shows up to 4 tools, with "+X more" overflow indicator
- Conditional link display:
  - GitHub icon for `repoUrl`
  - ExternalLink icon for `workflowUrl` (if no repoUrl)
  - Both icons for hybrid projects

**Project Detail Page** (`app/projects/[slug]/page.tsx`):
- **Project Type Section** (lines 118-132): Large colored badge with icon and description
- **Tools & Technologies Section** (lines 135-147): All tools with automatic color categorization
- **Prerequisites Callout** (lines 150-163): Auto-generated list from tools array
- **Repository/Workflow Buttons** (lines 166-193): Conditional display based on project type

### Sample Projects (Current)
The codebase includes 7 comprehensive sample projects:
1. **Twitter Sentiment Analysis Classifier** (Beginner, Code, 4 hours)
2. **Course-Specific RAG Chatbot** (Intermediate, No-Code, 3 hours)
3. **Flour and Salt Restaurant Website** (Beginner, No-Code, 2 hours)
4. **AI Email Manager Agent** (Beginner, No-Code, 2 hours)
5. **AI Image Generation for Product Marketing** (Intermediate, No-Code, 3 hours)
6. **AI-Powered Lead Generation System** (Advanced, Hybrid, 8 hours)
7. **AI Research Insights Dashboard** (Intermediate, Code, 5 hours)

Each sample includes realistic markdown guides with code examples, learning objectives, and step-by-step instructions.

## Google Calendar Event Sync

### Overview
The events page integrates with Google Calendar to sync events from a shared calendar into `app/data/events.json` via a manual "Sync Now" button.

### Sync Endpoint
**URL:** `/api/events/sync` (POST)

**Features:**
- Fetches events from Google Calendar API v3
- Syncs upcoming events (timeMin = current date)
- Preserves manual events (events without `calendarEventId`)
- Updates existing calendar events
- Adds new calendar events
- Removes deleted calendar events
- Rate limiting: 1 minute cooldown between manual sync requests

**Configuration:**
Required environment variables in `.env.local`:
```bash
GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key
GOOGLE_CALENDAR_ID=your_calendar_id@group.calendar.google.com
```

**Manual Sync Options:**

1. **Via UI (Recommended):**
   - Navigate to `/events` page
   - Click "Sync Now" button below the calendar
   - Available in both development and production
   - Shows real-time sync status and success message
   - Automatically refreshes page after successful sync

2. **Via API (Development/Testing):**
   ```bash
   curl -X POST "http://127.0.0.1:3000/api/events/sync"
   ```

**Files:**
- `app/api/events/sync/route.ts` - Sync endpoint
- `lib/calendar.ts` - Google Calendar API utilities
- `components/events/EventSyncStatus.tsx` - Manual sync button and status display
- `app/data/events.json` - Event data (hybrid: manual + synced)

**Data Structure:**
```json
{
  "lastSyncedAt": "2025-10-15T00:11:05.127Z",
  "events": [
    {
      "id": "uuid-here",
      "title": "Event Title",
      "startsAt": "2025-10-30T19:00:00-04:00",
      "endsAt": "2025-10-30T20:00:00-04:00",
      "location": "Room Name",
      "description": "Event description",
      "rsvpUrl": "https://forms.gle/...",
      "calendarEventId": "google-calendar-event-id"
    }
  ]
}
```

**Important Notes:**
- Events with `calendarEventId` are synced from Google Calendar
- Events without `calendarEventId` are manual and preserved during sync
- The sync merges both types, keeping manual events intact
- After adding events to Google Calendar, use the "Sync Now" button on the `/events` page to fetch updates
- No automatic/scheduled syncing - all syncs are triggered manually by users

## File Management & Recovery

### CRITICAL: Documentation File Protection
**NEVER delete documentation files without explicit permission from the user.**

Protected files include:
- `CLAUDE.md` (this file)
- `PRD.md` (Product Requirements Document)
- `README.md` (Getting started guide)

These files are essential to the development process and must be preserved during any troubleshooting operations.

### Git Recovery Procedures
If configuration or documentation files are accidentally deleted:

1. **Check git status** to identify deleted files:
   ```bash
   cd "/Users/seabasstheman/Desktop/AI Club Website/colgate-ai-club"
   git status
   ```

2. **Restore deleted files** using git:
   ```bash
   git restore CLAUDE.md PRD.md README.md package.json tsconfig.json next.config.ts
   ```

3. **Stage restored files** to fix git status showing them as deleted:
   ```bash
   git add [file names]
   ```

### Cache Management Safety
When clearing the `.next` cache directory:
- **ONLY delete the `.next` directory itself**
- NEVER use wildcards or broad deletion patterns
- Always verify you're in the correct directory before running `rm -rf`
- Proper command: `rm -rf .next` (nothing else)

If you accidentally delete config files:
1. DO NOT panic
2. Use `git status` to assess damage
3. Use `git restore` to recover files
4. Rebuild with `npm run build`
5. Restart dev server

## Production Deployment

### Deployment Status: ✅ LIVE

**Current Version:** v1.1.0
**Deployment Date:** October 14, 2025
**Status:** Successfully deployed to Vercel
**Repository:** Colgate-University-AI-Club/Club-Website

**What's Deployed:**
- ✅ Project type system (code/no-code/hybrid)
- ✅ Dual filtering (type + level)
- ✅ All 7 projects with GitHub integration
- ✅ Enhanced project detail pages with tool categorization
- ✅ Job board with Supabase integration
- ✅ News system with Supabase integration and n8n automation
- ✅ Newsletter signup with API proxy (CORS fix)
- ✅ Events with Google Calendar sync
- ✅ SEO optimization (sitemap, robots.txt)
- ✅ Responsive design for mobile and desktop

### Required Environment Variables for Vercel

The following environment variables MUST be configured in Vercel before deploying:

#### Supabase Configuration (News & Jobs Database)
```
NEXT_PUBLIC_SUPABASE_URL=https://njmzznceiykpybpuabgs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qbXp6bmNlaXlrcHlicHVhYmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODI0ODgsImV4cCI6MjA2NzU1ODQ4OH0.SqeHr41yIXqdkxG4jMOTE8u4Yb3nxseujgEg22csj5s

# Optional: Service role key for write operations (more secure for n8n news API)
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

#### GitHub API (Project Repository Stats)
```
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_ORG=Colgate-University-AI-Club
```

#### Google Calendar API (Event Sync)
```
GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key
GOOGLE_CALENDAR_ID=your_calendar_id@group.calendar.google.com
```

#### Optional
```
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
CRON_SECRET=your_secure_random_string_for_cron_auth
```

### Setting Up GitHub Personal Access Token

1. Go to GitHub Settings > Developer Settings > Personal Access Tokens > Fine-grained tokens
2. Click "Generate new token"
3. Configure token:
   - Token name: "Colgate AI Club Website - Repo Stats"
   - Expiration: 1 year (or custom)
   - Repository access: "Public Repositories (read-only)"
   - Permissions:
     - Repository permissions:
       - Contents: Read-only
       - Metadata: Read-only
4. Click "Generate token" and copy it
5. Add to Vercel environment variables as `GITHUB_TOKEN`

**Note:** The GitHub token is used to fetch repository statistics (stars, forks, last updated) for project cards on the /projects page. Without it, API rate limits may be hit quickly.

### Setting Up Google Calendar API Key

1. Go to Google Cloud Console (console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google Calendar API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create API credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key
   - (Recommended) Click "Restrict Key":
     - API restrictions: "Google Calendar API"
     - Website restrictions: Add your production domain
5. Get your Calendar ID:
   - Open Google Calendar
   - Go to calendar settings
   - Scroll to "Integrate calendar"
   - Copy the Calendar ID (looks like: c_abc123...@group.calendar.google.com)
6. Make calendar public:
   - In calendar settings, go to "Access permissions"
   - Check "Make available to public"
   - Set to "See all event details"
7. Add both values to Vercel environment variables:
   - `GOOGLE_CALENDAR_API_KEY`
   - `GOOGLE_CALENDAR_ID`

### Initial Calendar Sync

After deploying to Vercel, trigger the first calendar sync manually:

```bash
curl -X POST "https://yourdomain.com/api/events/sync" \
  -H "Content-Type: application/json"
```

This will:
- Fetch all upcoming events from Google Calendar
- Sync them to `app/data/events.json`
- Preserve any manually added events

### Automatic Calendar Sync with Vercel Cron Jobs

To enable automatic calendar sync every 6 hours:

1. Add `vercel.json` in project root (if not exists):
```json
{
  "crons": [{
    "path": "/api/events/sync",
    "schedule": "0 */6 * * *"
  }]
}
```

2. Set `CRON_SECRET` environment variable in Vercel
3. The cron job will automatically sync calendar events every 6 hours

### Vercel Deployment Checklist

- [ ] Create new project in Vercel dashboard
- [ ] Connect to GitHub repository
- [ ] Set Framework Preset to "Next.js"
- [ ] Configure all required environment variables (see above)
- [ ] Set Node.js version to 20.x (in Settings > General)
- [ ] Deploy and verify build succeeds
- [ ] Test /projects page (GitHub stats should load or fail gracefully)
- [ ] Test /events page (should display events)
- [ ] Trigger initial calendar sync with curl
- [ ] Verify /jobs page loads (Supabase connection)
- [ ] Test /news page (should display articles)
- [ ] Test /contribute form submission
- [ ] Set up Vercel Cron Job for calendar sync (optional)
- [ ] Configure custom domain (if needed)
- [ ] Update `NEXT_PUBLIC_BASE_URL` to production domain

### Troubleshooting Production Issues

#### GitHub Stats Not Loading on /projects Page
- Verify `GITHUB_TOKEN` is set in Vercel environment variables
- Check token hasn't expired
- Verify token has correct permissions (Contents: read, Metadata: read)
- Check browser console for API errors
- Note: 404s are expected if repositories don't exist yet

#### Calendar Sync Failing
- Verify `GOOGLE_CALENDAR_API_KEY` is set correctly
- Verify `GOOGLE_CALENDAR_ID` is correct
- Check calendar is set to public
- Check API key restrictions aren't blocking requests
- Test API key with: `https://www.googleapis.com/calendar/v3/calendars/CALENDAR_ID/events?key=API_KEY`

#### Jobs Page Not Loading
- Verify Supabase environment variables are set
- Check Supabase project is active
- Verify database connection in Supabase dashboard
- Check API route logs in Vercel dashboard

#### Build Failing
- Run `npm run build` locally to reproduce
- Check for TypeScript errors
- Verify all dependencies are in package.json
- Check Node.js version matches Vercel settings (20.x)

#### Deployment Webhook Not Triggering

**Problem:** Git push succeeds but Vercel doesn't automatically deploy

**Symptoms:**
- `git push origin main` completes successfully
- Commit appears on GitHub
- Vercel Deployments tab shows no new deployment
- Production site doesn't reflect recent changes

**Common Causes:**
1. **Webhook Disconnected** - GitHub → Vercel integration broken
2. **Cron Job Conflicts** - Adding `vercel.json` with cron configuration can interfere with webhooks
3. **Rate Limiting** - Multiple rapid pushes may trigger temporary deployment blocks
4. **GitHub App Permissions** - Vercel GitHub app may need re-authorization

**Solutions (in order of preference):**

**Option 1: Manual Redeploy via Vercel Dashboard** (Fastest)
```
1. Navigate to https://vercel.com/dashboard
2. Select your project
3. Go to "Deployments" tab
4. Find most recent deployment
5. Click three-dot menu (•••) next to it
6. Select "Redeploy"
7. Click "Redeploy" to confirm
```
This bypasses the webhook entirely and forces Vercel to pull latest code from GitHub.

**Option 2: Vercel CLI Deployment**
```bash
# First time only - authenticate
vercel login

# Deploy to production
cd "/Users/seabasstheman/Desktop/AI Club Website/colgate-ai-club"
vercel --prod --yes
```

**Option 3: Force Webhook Re-trigger**
```bash
# Create empty commit to trigger webhook
git commit --allow-empty -m "Trigger deployment webhook"
git push origin main
```
If this works, the webhook is functional but may have skipped previous commits.

**Option 4: Reconnect GitHub Integration**
```
1. Vercel Dashboard → Project Settings → Git
2. Click "Disconnect" to remove GitHub integration
3. Click "Connect Git Repository"
4. Re-authorize Vercel GitHub App
5. Select repository again
6. Verify webhook appears in GitHub repo settings
```

**Debugging Checklist:**
- [ ] Verify commit is on GitHub: `git log --oneline -3` matches GitHub commits
- [ ] Check Vercel deployment history for any errors or stuck builds
- [ ] Review Vercel project Git settings for connection status
- [ ] Check GitHub repo → Settings → Webhooks for Vercel webhook (should show recent deliveries)
- [ ] Review Vercel status page: https://www.vercel-status.com/
- [ ] Check for build errors in previous deployments that might block new ones

**Prevention:**
- Avoid rapid successive pushes (wait for previous deployment to complete)
- Test `vercel.json` changes locally before pushing
- Monitor Vercel dashboard for deployment confirmations after pushing

### Post-Deployment Tasks

✅ **Completed:**
1. ✅ Deploy to Vercel
2. ✅ Configure environment variables
3. ✅ Verify build success
4. ✅ Test production deployment
5. ✅ All 7 project GitHub repositories created and linked

**Next Steps (v1.2.0):**

**1. Custom Domain Setup**
- Purchase domain (suggestions: colgateai.org, colgateaiclub.com)
- Configure DNS in domain registrar:
  - Add A record or CNAME pointing to Vercel
  - Verify domain ownership
- Add custom domain in Vercel dashboard (Settings > Domains)
- Enable automatic HTTPS
- Update `NEXT_PUBLIC_BASE_URL` environment variable in Vercel

**2. n8n Job Sync Workflow**
- Create new workflow in n8n for job board automation
- Configure webhook to POST to `/api/jobs` endpoint
- Set up scheduled trigger (daily at 6 AM or weekly)
- Implement job data transformation:
  - Fetch from job board APIs (LinkedIn, Greenhouse, Indeed)
  - Transform to JobData format
  - Upsert to Supabase jobs table
- Add error handling and Slack notifications
- Test workflow end-to-end
- Document workflow URL and configuration in PRD.md

**3. Job Check & Refresh**
- The manual refresh button already exists on `/jobs` page
- Test cache invalidation functionality
- Add "Last updated" timestamp display
- Consider adding automatic background refresh (optional)

**4. Final Polish**
- Run Lighthouse audit and fix issues
- Test on mobile devices (iOS Safari, Android Chrome)
- Verify accessibility (keyboard navigation, screen readers)
- Optimize images (convert to WebP, add lazy loading)
- Test all links and forms
- Review error handling and loading states

**5. Launch Preparation**
- Set up analytics (Plausible or Google Analytics)
- Test Google Calendar integration for events
- Prepare launch announcement
- Create social media posts
- Share with Colgate AI Club members

**6. Monitor Production**
- Check Vercel logs for errors
- Monitor Supabase usage
- Track page load times
- Review user feedback
- Fix any reported bugs