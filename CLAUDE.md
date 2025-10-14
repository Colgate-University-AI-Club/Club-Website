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
Corrupted `node_modules` or `.next` cache can cause the `next` command to hang indefinitely without starting the server.

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

This is a **Colgate AI Club website** built with Next.js 15 (App Router), TypeScript, and Tailwind CSS. The site renders content from JSON files without requiring a database or authentication.

### Data-Driven Content Model
Content is stored in `app/data/*.json` files and rendered through dedicated pages:
- `news.json` → `/news` page with tag filtering and pagination
- `jobs.json` → `/jobs` page with tag filtering and pagination
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

## Projects System

### Overview
The projects section (`/projects`) displays AI/ML learning projects with varying difficulty levels. Projects are stored in `app/data/projects.json` and include comprehensive markdown guides.

### Project Data Structure
Each project in `projects.json` includes:
- **id**: Unique identifier (e.g., "p1")
- **slug**: URL-safe identifier for routing (e.g., "sentiment-classifier")
- **title**: Project name
- **level**: Difficulty level ("beginner", "intermediate", or "advanced")
- **durationHours**: Estimated completion time in hours
- **summary**: Short description for project cards
- **repoUrl**: GitHub repository URL (points to Colgate-University-Ai-Club organization)
- **resources**: Array of helpful links (docs, tutorials, datasets, tools)
- **body**: Full markdown content with project guide (2000+ words including overview, learning objectives, prerequisites, step-by-step guide, expected outcomes)

### Project Filtering
The `/projects` page implements level-based filtering:
- Filter buttons use Next.js `Link` components (NOT static buttons)
- URL query parameters control filtering: `/projects?level=beginner`
- "All" button clears filters and returns to `/projects`
- Active filter is highlighted with maroon accent colors

**Implementation Note:** Filter buttons MUST be `<Link>` components with proper `href` attributes. Static `<button>` elements will not work for navigation.

### Markdown Rendering
Project detail pages (`/projects/[slug]`) render markdown content using `react-markdown`:
- Import: `import ReactMarkdown from 'react-markdown'`
- Component: `<ReactMarkdown>{project.body}</ReactMarkdown>`
- Styling: Comprehensive Tailwind prose classes for proper formatting
- **NEVER use `dangerouslySetInnerHTML`** for markdown content

### GitHub Integration
Projects reference repositories in the Colgate-University-Ai-Club GitHub organization:
- ProjectCard component fetches repository stats via `/api/github/repo-info?url=[repoUrl]`
- GitHub API returns stars, forks, and last updated timestamp
- Component includes graceful error handling for non-existent repositories (404s are caught and silently ignored)
- **Repository Creation**: GitHub repositories MUST be created manually before adding projects to `projects.json`. There is no automatic repository creation for security reasons.

### Sample Projects (Current)
The codebase includes 5 comprehensive sample projects:
1. **Twitter Sentiment Analysis Classifier** (Beginner, 4 hours)
2. **Chatbot with RAG Pipeline** (Intermediate, 6 hours)
3. **Computer Vision Object Detection** (Intermediate, 8 hours)
4. **NLP Text Summarizer** (Beginner, 3 hours)
5. **Deep Learning Image Generator** (Advanced, 8 hours)

Each sample includes realistic markdown guides with code examples, learning objectives, and step-by-step instructions.

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