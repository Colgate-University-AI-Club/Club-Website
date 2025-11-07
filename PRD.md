# Product Requirements Document (PRD)
## Colgate AI Club Website

**Version:** 2.0
**Last Updated:** November 7, 2024
**Status:** Active Development

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technical Architecture](#technical-architecture)
3. [Feature Inventory](#feature-inventory)
4. [Data Model](#data-model)
5. [Implementation Status](#implementation-status)
6. [Deployment & Operations](#deployment--operations)

---

## Executive Summary

The Colgate AI Club Website is a modern web application serving as the digital hub for the Colgate University AI Club. It provides resources, news, events, projects, and job opportunities through a scalable hybrid architecture using both file-based and database storage.

**Key Features:**
- **Resources Library**: Centralized repository for presentations, documents, videos, templates, and datasets
- **Dynamic News Feed**: Automated syndication from external sources via Supabase
- **Project Showcase**: Three-tier system (code/no-code/hybrid) with GitHub integration
- **Job Board**: Real-time updates with advanced filtering
- **Event Calendar**: Google Calendar sync with manual trigger
- **Newsletter System**: Archive and signup with n8n integration

---

## Technical Architecture

### Tech Stack

#### Frontend
- **Framework:** Next.js 15.5.3 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + Custom Design System
- **UI Components:** Radix UI, shadcn/ui pattern, lucide-react icons
- **Markdown:** react-markdown for content rendering

#### Backend & Data
- **API Routes:** Next.js API Routes
- **Database:** Supabase (PostgreSQL) for news, jobs, newsletters
- **Static Data:** JSON files for resources, events, projects
- **File Storage:** GitHub Repository (Club-Resources) for resource files
- **Integrations:**
  - n8n workflow automation
  - Google Calendar API
  - GitHub API for repo stats

---

## Feature Inventory

### Core Pages

#### 1. **Resources Page** (`/resources`) - NEW ✅
- **Description:** Centralized library for all learning materials
- **Features:**
  - 7 resource categories (presentation, document, video, template, dataset, code, other)
  - Multi-filter system (category + tags + search)
  - Download functionality for files
  - YouTube embed modal for videos
  - Pagination (12 items/page)
  - Sort by newest/oldest
  - File size display
  - Author & course attribution
  - **Google Drive Sync:** One-click sync from configured folder ✅
- **Data:** `app/data/resources.json`
- **Storage:** GitHub repo `Colgate-University-AI-Club/Club-Resources`
- **Google Drive:** Auto-sync from folder ID `1pQ_R08BmLw2OWgk97mlqFXYvQAWB-1GR`
- **Management:** Helper script at `scripts/update-resources.js` + Google Drive sync button

#### 2. **News Page** (`/news`) ✅
- **Description:** AI/ML news feed with Supabase integration
- **Features:**
  - Automated syndication via n8n
  - Tag-based filtering
  - Pagination
  - External/internal source types
- **Data:** Supabase `news` table

#### 3. **Jobs Board** (`/jobs`) ✅
- **Description:** AI/ML career opportunities
- **Features:**
  - Real-time updates via Supabase
  - Advanced filtering (type, location, remote)
  - Detailed job cards with requirements
- **Data:** Supabase `jobs` table

#### 4. **Events Calendar** (`/events`) ✅
- **Description:** Club events with Google Calendar sync
- **Features:**
  - Manual sync button
  - Event cards with RSVP links
  - Google Calendar embed
- **Data:** `app/data/events.json` + Google Calendar API

#### 5. **Projects Showcase** (`/projects`) ✅
- **Description:** Three-tier project system
- **Features:**
  - Code/No-Code/Hybrid categorization
  - Dual filtering (type + difficulty)
  - GitHub repo integration
  - Markdown guides (2000+ words)
- **Data:** `app/data/projects.json`

#### 6. **Homepage** (`/`) ✅
- Hero section with CTAs
- Latest news (3 items)
- Upcoming events (3 items)
- Newsletter signup

#### 7. **About** (`/about`) ✅
- Mission statement
- Activities overview
- Meeting information

### Components

#### Navigation & Layout ✅
- **NavBar:** Responsive with mobile menu
- **Footer:** Newsletter signup + contribute form
- **Links:** Home, News, Jobs, Events, Projects, Resources, About

#### Contribute Form ✅
- **Location:** Footer only (moved from dedicated page)
- **Features:** Collapsible form, spam protection, validation

---

## Data Model

### Resources (JSON)
```typescript
interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  tags: string[];
  fileType: string;
  fileSize?: string;
  downloadUrl?: string;
  embedUrl?: string;
  githubPath?: string;
  author?: string;
  course?: string;
  uploadedAt: string;
}
```

### News (Supabase)
```sql
CREATE TABLE news (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  card_summary TEXT,
  content TEXT,
  source_type TEXT CHECK (source_type IN ('club', 'external')),
  url TEXT NOT NULL UNIQUE,
  published_at TIMESTAMPTZ NOT NULL
);
```

### Jobs (Supabase)
```sql
CREATE TABLE jobs (
  job_key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company_name TEXT,
  job_type TEXT[],
  description_text TEXT,
  job_url TEXT,
  apply_url TEXT,
  -- location fields, salary fields, etc.
);
```

---

## Implementation Status

### ✅ Complete
- Resources page with filtering and pagination
- **Google Drive Integration** for Resources ✅
- News system with Supabase integration
- Job board with real-time updates
- Events with Google Calendar sync
- Projects showcase (code/no-code/hybrid)
- Newsletter signup with n8n
- Contribute form in footer
- SEO (sitemap, robots.txt)
- GitHub API integration

### 🚧 Planned Enhancements
1. Automated job scraping workflow
2. Analytics tracking for downloads
3. Member authentication system
4. Admin dashboard
5. Resource submission approval workflow

---

## Deployment & Operations

### Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# GitHub
GITHUB_TOKEN=
GITHUB_ORG=Colgate-University-AI-Club

# Google Calendar
GOOGLE_CALENDAR_API_KEY=
GOOGLE_CALENDAR_ID=

# Google Drive ✅
GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_SERVICE_ACCOUNT_KEY=
```

### Deployment
- **Platform:** Vercel
- **Domain:** TBD (colgateai.org suggested)
- **Build Command:** `npm run build`
- **Node Version:** 20.x

### Resource Management

#### Adding Resources
```bash
# Clear sample data
node scripts/update-resources.js clear

# Add new resource interactively
node scripts/update-resources.js add

# List all resources
node scripts/update-resources.js list
```

#### File Storage Structure
```
Colgate-University-AI-Club/Club-Resources/
├── presentations/
├── documents/
├── templates/
├── datasets/
├── code/
└── videos/
```

### Manual Processes
1. **Google Calendar Sync:** Click "Sync Now" button on `/events`
2. **Google Drive Sync:** Click "Sync from Google Drive" button on `/resources`
3. **Resource Updates:** Use helper script or edit JSON
4. **GitHub Repo Creation:** Manual for new projects

### Automated Processes
1. **News Syndication:** n8n workflow → `/api/news`
2. **Newsletter Signups:** Form → API proxy → n8n webhook
3. **Job Updates:** Supabase real-time subscriptions

---

## Quick Reference

### Common Tasks

#### Deploy to Production
```bash
git push origin main
# Vercel auto-deploys from main branch
```

#### Add a Resource
```bash
node scripts/update-resources.js add
```

#### Sync Events
Visit `/events` and click "Sync Now"

#### Test Build
```bash
npm run build
npm run start
```

#### Development
```bash
npm run dev
# Visit http://127.0.0.1:3001
```

---

*For detailed implementation guides, see CLAUDE.md and RESOURCES_GUIDE.md*