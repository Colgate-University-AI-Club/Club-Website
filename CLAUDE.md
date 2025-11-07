# CLAUDE.md - Development Guide

This file provides guidance to Claude Code when working with this repository.

## Quick Start

```bash
# Development
npm run dev  # Runs at http://127.0.0.1:3001

# Build & Test
npm run build
npm run start

# Clear cache if issues
rm -rf .next && npm run dev
```

## Architecture Overview

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase

**Data Strategy:**
- **Supabase:** Dynamic content (news, jobs, newsletters)
- **JSON Files:** Static content (resources, events, projects)
- **GitHub:** File storage for resources (`Club-Resources` repo)

## Key Features

### 1. Resources Page (`/resources`)
**NEW** - Centralized learning materials library with Google Drive sync ✅

**Management:**
```bash
# Add/manage resources manually
node scripts/update-resources.js add    # Interactive add
node scripts/update-resources.js list   # List all
node scripts/update-resources.js clear  # Remove samples

# Or sync from Google Drive
# Click "Sync from Google Drive" button on /resources page
```

**Data Structure (`app/data/resources.json`):**
```json
{
  "id": "res-001",
  "title": "Resource Title",
  "description": "Description",
  "category": "presentation|document|video|template|dataset|code|other",
  "tags": ["tag1", "tag2"],
  "fileType": "pdf",
  "fileSize": "3.2 MB",
  "downloadUrl": "https://raw.githubusercontent.com/...",
  "embedUrl": "https://youtube.com/...",
  "author": "Name",
  "course": "COSC 290",
  "uploadedAt": "2024-11-07T10:00:00Z",
  "source": "manual|google-drive"
}
```

**File Storage:**
- Upload to `https://github.com/Colgate-University-AI-Club/Club-Resources`
- Organize in folders: `/presentations`, `/documents`, `/templates`, etc.
- Use raw URLs for `downloadUrl` field

### 2. News System (Supabase)
- **Table:** `news` (id, title, content, url, published_at)
- **API:** POST `/api/news` (accepts array of articles from n8n)
- **Auto-sync:** n8n workflow → API endpoint

### 3. Jobs Board (Supabase)
- **Table:** `jobs` (comprehensive job data)
- **Real-time:** Supabase subscriptions for live updates
- **Filtering:** Type, location, remote options

### 4. Events Calendar
- **Data:** `app/data/events.json`
- **Sync:** Manual button on `/events` page
- **API:** Google Calendar integration

### 5. Projects Showcase
- **Types:** Code, No-Code, Hybrid
- **Data:** `app/data/projects.json`
- **GitHub:** Stats fetched from org repos

### 6. Newsletter System
- **Signup:** API proxy → n8n webhook (avoids CORS)
- **Archive:** Supabase `newsletters` table

## Navigation Structure
```
Home → News → Jobs → Events → Projects → Resources → About
```
- Contribute form moved to footer only
- Resources replaced Contribute in main nav

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/news` | POST | n8n news sync |
| `/api/jobs` | POST | Job updates |
| `/api/events/sync` | POST | Google Calendar sync |
| `/api/newsletter/subscribe` | POST | Newsletter signup |
| `/api/contribute` | POST | Resource submissions |
| `/api/github/[owner]/[repo]` | GET | GitHub stats |
| `/api/resources/google-drive-sync` | POST | Google Drive sync |

## Environment Variables

```bash
# Required for production
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GITHUB_TOKEN=
GOOGLE_CALENDAR_API_KEY=
GOOGLE_CALENDAR_ID=
GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_SERVICE_ACCOUNT_KEY=
```

## Common Tasks

### Add a Resource
```bash
node scripts/update-resources.js add
# Or edit app/data/resources.json directly
```

### Update Navigation
- Edit `components/site/NavBar.tsx` for header
- Edit `components/site/Footer.tsx` for footer

### Sync External Data
- **News:** Automatic via n8n
- **Events:** Click "Sync Now" on `/events`
- **Resources:** Click "Sync from Google Drive" on `/resources`

### Deploy Changes
```bash
git add .
git commit -m "Update description"
git push origin main
# Vercel auto-deploys
```

## Troubleshooting

### Dev Server Issues
```bash
# Kill hanging processes
pkill -9 -f "next dev"

# Clear cache and restart
rm -rf .next node_modules
npm install
npm run dev
```

### Build Errors
- Check TypeScript: `npx tsc --noEmit`
- Fix ESLint: `npm run lint`
- Clear cache: `rm -rf .next`

### Resource Page Issues
- Verify JSON syntax in `resources.json`
- Check GitHub repo is public
- Ensure raw URLs are correct
- File size limit: 50MB (GitHub web)

## File Organization
```
app/
├── resources/        # NEW Resources page
├── data/
│   ├── resources.json  # Resource data
│   ├── events.json     # Events data
│   └── projects.json   # Projects data
components/
├── resources/        # Resource components
│   ├── ResourceCard.tsx
│   ├── VideoModal.tsx
│   └── GoogleDriveSyncButton.tsx
├── site/
│   ├── NavBar.tsx     # Updated with Resources
│   ├── Footer.tsx     # Contains contribute form
│   └── ContributeForm.tsx
scripts/
└── update-resources.js  # Resource management helper
```

## Best Practices

1. **Resources:** Use consistent tags, proper categories
2. **Files:** Upload to GitHub repo, use raw URLs
3. **Commits:** Never include Claude attribution
4. **Builds:** Always test with `npm run build`
5. **Cache:** Clear `.next` if issues persist


---

*See PRD.md for product details, RESOURCES_GUIDE.md for resource management*