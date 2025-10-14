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