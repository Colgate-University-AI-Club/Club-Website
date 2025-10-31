# Product Requirements Document (PRD)
## Colgate AI Club Website

**Version:** 1.0
**Last Updated:** October 14, 2025
**Status:** Active Development

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [Technical Architecture](#technical-architecture)
4. [Feature Inventory](#feature-inventory)
5. [Data Model](#data-model)
6. [User Flows](#user-flows)
7. [Implementation Status](#implementation-status)
8. [Future Roadmap](#future-roadmap)
9. [Technical Specifications](#technical-specifications)
10. [Deployment & Operations](#deployment--operations)

---

## Executive Summary

The Colgate AI Club Website is a modern, content-driven web application built to serve the Colgate University AI Club community. It provides a centralized hub for news, events, projects, job opportunities, and newsletters—all managed through a scalable, file-based and database-hybrid architecture.

**Key Objectives:**
- Provide a single source of truth for AI Club activities at Colgate University
- Streamline content discovery through filtering, tagging, and search
- Enable automated content syndication from external sources
- Showcase student projects and learning resources
- Connect students with AI/ML career opportunities
- Foster community engagement through newsletters and events

**Target Audience:**
- Colgate University students interested in AI/ML
- AI Club members and leadership
- Faculty advisors and researchers
- Industry partners and recruiters
- Prospective students exploring AI at Colgate

---

## Product Overview

### Vision
Create a vibrant digital ecosystem that democratizes AI education, facilitates collaboration, and connects Colgate students with the broader AI community.

### Core Value Propositions

1. **For Students:**
   - Discover curated AI/ML news and resources
   - Find internships and job opportunities
   - Access beginner-to-advanced project tutorials
   - Stay informed about club events and workshops
   - Subscribe to the AI Digest newsletter

2. **For Club Leadership:**
   - Easy content management through JSON files and database
   - Automated news syndication from external sources
   - Real-time job board updates via Supabase
   - Community contribution pipeline via forms

3. **For Recruiters/Partners:**
   - Direct access to AI-interested student audience
   - Job posting integration via external APIs
   - Event collaboration opportunities

---

## Technical Architecture

### Tech Stack Overview

#### Frontend
- **Framework:** Next.js 15.5.3 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + tw-animate-css
- **UI Components:**
  - Radix UI primitives (@radix-ui/react-slot, @radix-ui/react-tabs)
  - Custom component library (shadcn/ui pattern)
  - class-variance-authority for component variants
- **Icons:** lucide-react
- **Markdown Rendering:** react-markdown

#### Backend & Data
- **API Routes:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
  - Real-time subscriptions for live updates
  - Job data storage and management
  - Newsletter content management
  - News article storage and syndication
- **Data Storage:**
  - JSON files (`app/data/*.json`) for static content (events, projects)
  - Supabase for dynamic, frequently-updated content (jobs, news, newsletters)
- **External Integrations:**
  - n8n workflow automation for news syndication (posts to `/api/news`)
  - n8n newsletter signup webhook (via `/api/newsletter/subscribe` proxy)
  - Job board API integrations (via n8n)
  - Google Calendar API for event sync

#### Development Tools
- **Package Manager:** npm
- **Linting:** ESLint 9 with Next.js config
- **Type Checking:** TypeScript strict mode
- **Dev Server:** Custom port-finding script (`scripts/dev.js`)

#### Deployment (Planned)
- **Hosting:** Vercel (optimized for Next.js)
- **Analytics:** Plausible Analytics (placeholder in layout)
- **Domain:** TBD
- **CDN:** Vercel Edge Network
- **Environment:** Production, Staging

---

### Architecture Diagram (Conceptual)

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│                    (Next.js 15 App Router)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/S
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Next.js Server                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Pages       │  │  API Routes  │  │  Components  │      │
│  │  /news       │  │  /api/news   │  │  NewsCard    │      │
│  │  /jobs       │  │  /api/jobs   │  │  JobCard     │      │
│  │  /events     │  │  /api/contrib│  │  EventCard   │      │
│  │  /projects   │  │  /api/newslet│  │  Pagination  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────┬───────────────────┬─────────────────────────┘
              │                   │
              │                   │
    ┌─────────▼────────┐    ┌─────▼──────────────────────┐
    │  JSON Data Files │    │   Supabase (PostgreSQL)    │
    │  - events.json   │    │   - news table             │
    │  - projects.json │    │   - jobs table             │
    │                  │    │   - newsletters table      │
    │                  │    │   - real-time subscriptions│
    │                  │    │   - Row Level Security     │
    └──────────────────┘    └────────────────────────────┘
              │
              │
    ┌─────────▼────────────────────┐
    │  External Services            │
    │  - n8n (news sync workflow)  │
    │  - Job Board APIs            │
    │  - Google Calendar           │
    │  - Buttondown (newsletter)   │
    └──────────────────────────────┘
```

---

## Feature Inventory

### ✅ Completed Features

#### 1. **Home Page** (`/`)
- **Status:** ✅ Complete
- **Description:** Landing page with hero section and content rails
- **Features:**
  - Hero banner with CTA buttons ("See Events", "Join Newsletter")
  - Latest 3 news items with source badges (club/external)
  - Upcoming 3 events with RSVP links
  - Featured 3 projects with difficulty levels
  - Newsletter signup form in footer
  - Responsive design with Tailwind CSS
- **File:** `app/page.tsx`

#### 2. **News Page** (`/news`)
- **Status:** ✅ Complete (Enhanced with Supabase)
- **Description:** Paginated news feed with filtering and real-time updates
- **Features:**
  - Real-time news updates from Supabase
  - Tag-based filtering (URL query param: `?tag=ai`)
  - Tags generated on-the-fly from article content
  - Pagination (9 items per page, query param: `?page=2`)
  - Source type badges (club/external)
  - Published date display
  - Automated sync from n8n workflow to Supabase
  - Dynamic metadata for SEO
  - No caching for fresh data
- **Files:** `app/news/page.tsx`, `components/news/NewsCard.tsx`, `lib/news.ts`
- **Data Source:** Supabase `news` table (synced from n8n via `/api/news`)

#### 3. **News Detail Page** (`/news/[id]`)
- **Status:** ✅ Complete (Enhanced with Supabase)
- **Description:** Individual news article view with real-time data
- **Features:**
  - Full article content (markdown rendering)
  - Source attribution
  - Related tags (auto-generated)
  - "Back to News" navigation
  - Real-time data from Supabase
- **File:** `app/news/[id]/page.tsx`, `lib/news.ts`
- **Data Source:** Supabase `news` table

#### 4. **Jobs Page** (`/jobs`)
- **Status:** ✅ Complete (Enhanced)
- **Description:** Advanced job board with Supabase integration
- **Features:**
  - Real-time job updates via Supabase subscriptions
  - Advanced filtering:
    - Search by title/company
    - Job type filters (Full-time, Internship, etc.)
    - Location filters with remote option
    - Salary range slider
  - Sorting options (date, salary, relevance)
  - Pagination (12 jobs per page)
  - Enhanced job cards with:
    - Company logo placeholder
    - Salary information
    - Job type badges
    - Location with map icon
    - Benefits chips
  - Modal view for job details:
    - Full job description (markdown)
    - Requirements (REQUIRED/PREFERRED)
    - Benefits list
    - Attributes/skills
    - Direct apply link
  - Manual refresh button with loading state
  - Cache status indicator
  - Empty state handling
- **Files:**
  - `app/jobs/page.tsx`
  - `components/jobs/EnhancedJobCard.tsx`
  - `components/jobs/JobModal.tsx`
  - `components/jobs/JobFilters.tsx`
  - `lib/jobUtils.ts`
- **Data Source:** Supabase `jobs` table (+ legacy `jobs.json` fallback)

#### 5. **Events Page** (`/events`)
- **Status:** ✅ Complete (Enhanced with Google Calendar Sync)
- **Description:** Event listings with Google Calendar integration and manual sync
- **Features:**
  - Upcoming events list (sorted by start date)
  - Past events section
  - Event details: date, time, location, description
  - RSVP links
  - Google Calendar embed (iframe with live calendar)
  - Event filtering (upcoming vs. past)
  - **Google Calendar API sync:**
    - Manual "Sync Now" button for on-demand synchronization
    - Sync endpoint: `/api/events/sync` (POST request)
    - Rate limiting (1 minute cooldown between manual syncs)
    - Preserves manual events while syncing calendar events
    - Updates existing events and adds new ones
    - Sync status display showing last sync time and sync button
    - Visible in both development and production environments
- **Files:**
  - `app/events/page.tsx`
  - `components/events/EventCard.tsx`
  - `components/events/EventSyncStatus.tsx`
  - `app/api/events/sync/route.ts`
  - `lib/calendar.ts`
- **Data Source:** `app/data/events.json` (hybrid: manual + Google Calendar synced events)

#### 6. **Projects Page** (`/projects`)
- **Status:** ✅ Complete (Enhanced with Project Type System)
- **Description:** Project catalog with dual filtering (type + level)
- **Features:**
  - **Dual filtering system:**
    - Project type filtering (code/no-code/hybrid) with icons and emojis
    - Level-based filtering (beginner/intermediate/advanced)
    - Both filters work together via URL query parameters
    - "All" option for each filter dimension
  - Filter buttons using Next.js Link components for URL-based navigation
  - Project type badges with color coding:
    - Code projects: Blue (💻)
    - No-code projects: Purple (⚡)
    - Hybrid projects: Green (🔀)
  - Difficulty level badges with color coding
  - Duration indicators (estimated hours)
  - Tools display (max 4 visible, "+X more" overflow)
  - Project summaries
  - GitHub repository integration (displays repo stats when available)
  - Workflow URL support for no-code projects
  - Graceful handling of non-existent repositories
  - Links to individual project pages
- **Files:** `app/projects/page.tsx`, `components/projects/ProjectCard.tsx`
- **Data Source:** `app/data/projects.json`
- **Technical Notes:**
  - Filter buttons MUST be `<Link>` components, not static `<button>` elements
  - Query parameter format: `?type=no-code&level=beginner`
  - Both filters preserve each other's state when changed
  - GitHub stats fetched via `/api/github/[owner]/[repo]` endpoint

#### 7. **Project Detail Page** (`/projects/[slug]`)
- **Status:** ✅ Complete (Enhanced with Project Type Information)
- **Description:** Individual project view with comprehensive markdown guides
- **Features:**
  - **Project Type Section:**
    - Large, prominent badge showing project type (code/no-code/hybrid)
    - Icon display (Code/Zap/Layers from lucide-react)
    - Descriptive text explaining the project type
    - Color-coded border and background
  - **Tools & Technologies Section:**
    - All required tools displayed as colored badges
    - Automatic color categorization:
      - Programming languages: Blue
      - No-code tools (n8n, Make.com, etc.): Purple
      - AI APIs (OpenAI, Anthropic, etc.): Green
      - Databases (PostgreSQL, Pinecone, etc.): Orange
      - Default: Gray
    - Hover effects on tool badges
  - **Prerequisites Callout:**
    - Blue-bordered callout box
    - Icon indicator
    - Lists all tools with "key" or "account/installation" requirement
    - Based on tools array
  - **Project Details Section (Enhanced Styling):**
    - Rendered with ReactMarkdown (Markdown format only, no HTML)
    - **Enhanced typography with Colgate branding:**
      - Larger base font size (prose-lg)
      - H2 headings in maroon (text-red-800) with bottom border accents
      - Increased spacing between sections (mt-12 for H2, mt-8 for H3)
      - Relaxed line heights for better readability
      - Enhanced list spacing with proper indentation
      - Well-styled inline code and code blocks
    - Comprehensive markdown content (2000+ words):
      - Project overview
      - Learning objectives
      - Prerequisites
      - Step-by-step implementation guide
      - Code examples and snippets
      - Expected outcomes
  - Resource links (tutorials, docs, datasets, tools)
  - **Enhanced Repository/Workflow Buttons:**
    - GitHub repository link with GitHub icon (for code projects)
    - Workflow template link with ExternalLink icon (for no-code projects)
    - Both can appear for hybrid projects
    - Distinct styling for each button type
  - Estimated time to complete
  - Difficulty level badge
  - Related tags
  - Tailwind prose classes for markdown styling
- **File:** `app/projects/[slug]/page.tsx`
- **Technical Notes:**
  - Uses `react-markdown` for rendering (NEVER `dangerouslySetInnerHTML`)
  - Markdown content stored in `body` field of project JSON
  - Comprehensive prose classes for proper formatting
  - Tool color categorization function: `getToolColor(tool: string)`

#### 8. **About Page** (`/about`)
- **Status:** ✅ Complete
- **Description:** Club information and mission
- **Features:**
  - Mission statement
  - What we do (4 activity cards):
    - Workshops & Learning
    - Project Collaboration
    - Industry Connections
    - Research Support
  - Join us section with meeting info placeholder
  - Contact information
- **File:** `app/about/page.tsx`

#### 9. **Contribute Page** (`/contribute`)
- **Status:** ✅ Complete
- **Description:** Community contribution form
- **Features:**
  - Resource submission form (URL, title, description, category)
  - Client-side validation (lib/validators.ts)
  - Honeypot spam protection
  - Rate limiting (10 requests/min per IP)
  - Submissions saved to `contribute-queue.json`
  - Success/error feedback
- **Files:** `app/contribute/page.tsx`, `app/api/contribute/route.ts`

#### 10. **Newsletter System**
- **Status:** ✅ Complete (Enhanced)
- **Description:** Newsletter archive and signup with n8n integration
- **Features:**
  - Newsletter archive page with polling
  - Real-time updates from Supabase
  - Newsletter signup component with CORS-safe API proxy
  - n8n webhook integration via `/api/newsletter/subscribe`
  - Rate limiting (10 requests/min per IP)
  - Email validation
  - Archive view with markdown rendering
  - Polling hook for live updates
- **Files:**
  - `components/newsletter/NewsletterSection.tsx`
  - `components/newsletter/NewsletterSectionWithPolling.tsx`
  - `components/NewsletterSignup.tsx`
  - `hooks/useNewsletterPolling.ts`
  - `app/api/newsletters/route.ts`
  - `app/api/newsletter/subscribe/route.ts` (NEW: CORS proxy)
  - `lib/newsletter.ts`
- **Data Source:** Supabase `newsletters` table, n8n webhook for signups

#### 11. **Navigation & Layout**
- **Status:** ✅ Complete
- **Description:** Global navigation and footer
- **Features:**
  - Responsive navbar with:
    - Logo/brand
    - Links: Home, News, Jobs, Events, Projects, About, Contribute
    - Mobile hamburger menu
  - Footer with:
    - Newsletter signup
    - Social links (placeholder)
    - Copyright
  - Consistent page layout with max-width container
- **Files:** `components/site/NavBar.tsx`, `components/site/Footer.tsx`, `app/layout.tsx`

#### 12. **SEO & Metadata**
- **Status:** ✅ Complete
- **Description:** Search engine optimization
- **Features:**
  - Dynamic sitemap.xml (includes all routes + project slugs)
  - robots.txt (allow all crawlers)
  - Page-level metadata (title, description)
  - Open Graph tags (placeholder)
- **Files:** `app/sitemap.xml/route.ts`, `app/robots.txt/route.ts`

#### 13. **Utility Libraries**
- **Status:** ✅ Complete
- **Description:** Reusable helper functions
- **Features:**
  - Date formatting (`lib/date.ts`)
  - Pagination (`lib/paginate.ts`)
  - Form validation (`lib/validators.ts`)
  - Tag extraction and normalization (`lib/tags.ts`)
  - Job utilities (filtering, sorting, caching) (`lib/jobUtils.ts`)
  - Brand constants (`lib/brand.ts`)
  - Type definitions (`lib/types.ts`)

#### 14. **UI Component Library**
- **Status:** ✅ Complete
- **Description:** Reusable UI components (shadcn/ui pattern)
- **Components:**
  - Button
  - Card
  - Input
  - Textarea
  - Badge
  - Tabs
  - SectionHeader
  - CardGrid
  - Pagination
  - Tag

#### 15. **News Sync Automation**
- **Status:** ✅ Complete
- **Description:** Automated news syndication via n8n
- **Features:**
  - n8n webhook trigger
  - Article fetching from external RSS/APIs
  - Automatic tagging
  - Content extraction and summarization
  - UUID generation for articles
  - Deduplication
  - JSON file update
- **Files:** `scripts/sync-news.js`, `app/api/news/route.ts`
- **Workflow:** External (n8n cloud)

#### 16. **Real-time Job Updates**
- **Status:** ✅ Complete
- **Description:** Live job board updates via Supabase
- **Features:**
  - Supabase real-time subscriptions
  - Automatic UI refresh on job changes (INSERT/UPDATE/DELETE)
  - Client-side cache with manual refresh
  - Optimistic updates
- **File:** `app/jobs/page.tsx`, `lib/jobUtils.ts`

#### 17. **GitHub Repository Integration**
- **Status:** ✅ Complete
- **Description:** Display GitHub repository stats for projects
- **Features:**
  - Fetches repository statistics (stars, forks, last updated)
  - API endpoint: `/api/github/repo-info?url=[repo-url]`
  - Graceful error handling for non-existent repositories
  - Displays repo stats on project cards when available
  - Links to GitHub repositories from project detail pages
- **Files:**
  - `app/api/github/route.ts` (or similar API route)
  - `components/projects/ProjectCard.tsx`
  - `lib/github.ts` (GitHub API utilities)
- **Data Source:** GitHub REST API
- **Technical Notes:**
  - All project repositories should be in the `Colgate-University-Ai-Club` organization
  - Repositories MUST be created manually (no automatic creation)
  - 404 errors are caught and handled silently
  - No authentication required for public repository stats

---

### 🚧 In Progress / Partially Complete

#### 1. **Newsletter Archive Page**
- **Status:** 🚧 80% Complete
- **Missing:**
  - Dedicated route `/newsletters` (currently embedded in home)
  - Pagination for large newsletter lists
  - Search/filter by date or topic
- **Next Steps:**
  - Create `app/newsletters/page.tsx`
  - Add pagination component
  - Implement date range filters

#### 2. **User Authentication** (Optional)
- **Status:** 🚧 Not Started
- **Description:** Member-only features
- **Potential Features:**
  - Sign in with Colgate email
  - Member directory
  - Private event RSVPs
  - Project submission by members
- **Dependencies:** Supabase Auth or NextAuth.js

#### 3. **Admin Dashboard** (Optional)
- **Status:** 🚧 Not Started
- **Description:** Content management interface
- **Potential Features:**
  - Approve/reject community contributions
  - Edit news/events/projects via UI
  - Moderate newsletter submissions
  - View analytics
- **Dependencies:** Authentication system

---

### ❌ Not Started / Future Features

#### 1. **Advanced Search**
- **Status:** ❌ Not Started
- **Description:** Global search across all content types
- **Potential Features:**
  - Search bar in navbar
  - Full-text search across news, events, projects, jobs
  - Search results page with filtering
  - Search suggestions/autocomplete
- **Dependencies:** Search indexing (Algolia, Meilisearch, or client-side search)

#### 2. **Member Profiles**
- **Status:** ❌ Not Started
- **Description:** Individual member pages
- **Potential Features:**
  - Member bio and interests
  - Project contributions
  - Event attendance history
  - Skills and expertise
- **Dependencies:** Authentication

#### 3. **Discussion Forum**
- **Status:** ❌ Not Started
- **Description:** Community discussion board
- **Potential Features:**
  - Topic threads
  - Comments and replies
  - Upvoting/downvoting
  - Moderation tools
- **Dependencies:** Authentication, database schema

#### 4. **Event Registration System**
- **Status:** ❌ Not Started
- **Description:** Built-in RSVP management
- **Potential Features:**
  - One-click RSVP
  - Waitlist management
  - Attendance tracking
  - Email reminders
- **Dependencies:** Authentication, email service

#### 5. **Project Submissions**
- **Status:** ❌ Not Started
- **Description:** Student-submitted projects
- **Potential Features:**
  - Upload project details via form
  - Image/video uploads
  - Review/approval workflow
  - Project versioning
- **Dependencies:** File storage (Supabase Storage), admin dashboard

#### 6. **Analytics Dashboard**
- **Status:** ❌ Not Started
- **Description:** Public-facing usage stats
- **Potential Features:**
  - Page view counts
  - Popular content
  - Member growth metrics
  - Event attendance stats
- **Dependencies:** Analytics integration (Plausible API)

#### 7. **Multilingual Support**
- **Status:** ❌ Not Started
- **Description:** International student access
- **Potential Features:**
  - i18n framework (next-intl)
  - Spanish/Chinese translations
  - Locale-aware date formatting
- **Dependencies:** Translation system

#### 8. **Mobile App**
- **Status:** ❌ Not Started
- **Description:** Native iOS/Android app
- **Potential Features:**
  - Push notifications for events
  - Offline mode
  - Quick RSVP
- **Dependencies:** React Native or Expo

---

## Data Model

### JSON File-Based Data

#### `news.json`
```typescript
type NewsItem = {
  id: string;              // UUID
  title: string;           // Article title
  summary?: string;        // Short description
  content?: string;        // Full markdown content
  sourceType: 'club' | 'external';
  url: string;             // Link to full article
  tags?: string[];         // e.g., ["ai", "llm", "ethics"]
  publishedAt: string;     // ISO 8601 date
}
```

**Example:**
```json
{
  "id": "c58da2a4-00b7-43b2-9b97-6fed3a410be6",
  "title": "AI Finds its Niche: Writing Corporate Press Releases",
  "summary": "AI tools now draft about 25% of corporate press releases",
  "sourceType": "external",
  "url": "https://gizmodo.com/ai-finds-its-niche-writing-corporate-press-releases-2000666360",
  "tags": ["ai"],
  "publishedAt": "2025-10-02T15:00:39.000Z"
}
```

---

#### `jobs.json` (Legacy)
```typescript
type JobItem = {
  id: string;
  role: string;
  company: string;
  location?: string;
  url: string;
  postedAt?: string;
  tags?: string[];
}
```

**Note:** This is a legacy format. New jobs are stored in Supabase.

---

#### `events.json`
```typescript
type EventItem = {
  id: string;
  title: string;
  startsAt: string;        // ISO 8601 date
  endsAt?: string;         // ISO 8601 date
  location?: string;       // e.g., "Olin 318" or "Virtual"
  description?: string;    // Markdown
  rsvpUrl?: string;        // External RSVP link
}
```

---

#### `projects.json`
```typescript
type ProjectItem = {
  id: string;
  slug: string;            // URL-safe identifier (e.g., "sentiment-classifier")
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  projectType: 'code' | 'no-code' | 'hybrid';  // NEW: Project type classification
  tools: string[];         // NEW: Required tools/technologies (e.g., ["Python", "scikit-learn"])
  durationHours?: number;  // Estimated completion time (2-8 hours typical)
  summary: string;         // Short description for cards
  repoUrl?: string;        // GitHub link (Colgate-University-Ai-Club org) - now optional
  workflowUrl?: string;    // NEW: Link to workflow template (for no-code/hybrid projects)
  resources?: {
    label: string;         // e.g., "scikit-learn Documentation"
    url: string;
  }[];                     // 4-5 helpful links per project
  body?: string;           // Full markdown content (2000+ words)
                          // Includes: overview, learning objectives,
                          // prerequisites, step-by-step guide, code examples
}
```

**Example Project:**
```json
{
  "id": "p1",
  "slug": "sentiment-classifier",
  "title": "Twitter Sentiment Analysis Classifier",
  "level": "beginner",
  "projectType": "code",
  "tools": ["Python", "scikit-learn", "Pandas", "Jupyter"],
  "durationHours": 4,
  "summary": "Build a machine learning model to classify tweets as positive, negative, or neutral using Python and scikit-learn.",
  "repoUrl": "https://github.com/Colgate-University-Ai-Club/sentiment-classifier",
  "resources": [
    {
      "label": "Google Colab",
      "url": "https://colab.research.google.com"
    },
    {
      "label": "scikit-learn Documentation",
      "url": "https://scikit-learn.org/stable/"
    }
  ],
  "body": "## Project Overview\n\nBuild your first machine learning classifier..."
}
```

**Sample Projects (Current):**
1. Twitter Sentiment Analysis Classifier (Beginner, Code, 4 hours)
2. Course-Specific RAG Chatbot (Intermediate, No-Code, 3 hours)
3. Flour and Salt Restaurant Website (Beginner, No-Code, 2 hours)
4. AI Email Manager Agent (Beginner, No-Code, 2 hours)
5. AI Image Generation for Product Marketing (Intermediate, No-Code, 3 hours)
6. AI-Powered Lead Generation System (Advanced, Hybrid, 8 hours)
7. AI Research Insights Dashboard (Intermediate, Code, 5 hours)

---

#### `contribute-queue.json`
```typescript
type ContributionItem = {
  id: string;              // UUID
  title: string;
  url: string;
  description: string;
  category: string;        // e.g., "article", "tool", "dataset"
  submittedAt: string;     // ISO 8601 date
  submittedBy?: string;    // Optional email
}
```

---

### Supabase Database Schema

#### `jobs` Table
```sql
CREATE TABLE jobs (
  job_key TEXT PRIMARY KEY,                  -- Unique job identifier
  title TEXT NOT NULL,
  company_name TEXT,
  job_type TEXT[],                           -- Array: ["Full-time", "Remote"]
  benefits TEXT[],                           -- Array: ["Health insurance", "401k"]
  attributes TEXT[],                         -- Array: ["Python", "Machine Learning"]
  description_text TEXT NOT NULL,            -- Markdown
  job_card_summary TEXT,                     -- Short summary for cards
  company_url TEXT,
  job_url TEXT NOT NULL,
  apply_url TEXT,
  location_city TEXT,
  location_postal_code TEXT,
  location_country TEXT,
  location_country_code TEXT,
  location_full_address TEXT,
  salary_currency TEXT,
  salary_max NUMERIC,
  salary_min NUMERIC,
  salary_text TEXT,
  salary_type TEXT,                          -- "yearly", "hourly"
  requirements JSONB,                        -- [{label, requirementSeverity}]
  status TEXT DEFAULT 'active',              -- "active", "expired", "filled"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
```

**Row Level Security:**
- All users can read active jobs
- Only service role can insert/update/delete

---

#### `newsletters` Table
```sql
CREATE TABLE newsletters (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  publish_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_newsletters_publish_date ON newsletters(publish_date DESC);
```

---

### TypeScript Type Definitions

**File:** `lib/types.ts`

All data models have corresponding TypeScript interfaces:
- `NewsItem`
- `JobItem` (legacy)
- `JobData` (Supabase format)
- `SupabaseJobRow` (database format)
- `EventItem`
- `ProjectItem`
- `NewsletterItem`

---

## User Flows

### 1. **Discovering News**
1. User lands on home page → sees latest 3 news items
2. User clicks "View all" → navigates to `/news`
3. User filters by tag (e.g., "LLM") → URL updates to `/news?tag=llm`
4. User clicks news card → navigates to `/news/[id]` for full article
5. User clicks external link → opens article in new tab

### 2. **Browsing Jobs**
1. User navigates to `/jobs`
2. System loads jobs from Supabase (or cache)
3. User applies filters:
   - Search: "machine learning"
   - Job type: "Internship"
   - Location: "Remote"
   - Salary range: $50k-$100k
4. User clicks job card → modal opens with full details
5. User clicks "Apply" → redirects to external apply URL
6. User closes modal → returns to filtered job list
7. (Background) Real-time subscription updates job list if new jobs are added

### 3. **Exploring Projects**
1. User navigates to `/projects`
2. User applies filters:
   - Project type: "No-Code" (filters to no-code projects)
   - Level: "Beginner" (further filters to beginner projects)
   - URL updates to: `/projects?type=no-code&level=beginner`
3. User sees filtered projects with:
   - Project type badges (💻 Code, ⚡ No-Code, 🔀 Hybrid)
   - Difficulty level badges
   - Tools preview (max 4 visible)
   - Duration and summary
4. User clicks project → navigates to `/projects/[slug]`
5. User sees comprehensive project details:
   - Project type section with icon and description
   - All required tools with color coding
   - Prerequisites callout
   - Full markdown guide
   - Resources
6. User clicks "View Repository" (code project) or "View Workflow Template" (no-code project) → opens in new tab

### 4. **Submitting a Resource**
1. User navigates to `/contribute`
2. User fills out form (title, URL, description, category)
3. User submits → client-side validation runs
4. If valid → POST to `/api/contribute`
5. API checks rate limit → validates data
6. API appends to `contribute-queue.json`
7. User sees success message
8. (Manual) Admin reviews and approves contribution

### 5. **Subscribing to Newsletter**
1. User scrolls to footer on any page
2. User enters email in Buttondown form (placeholder)
3. User clicks "Subscribe"
4. External service (Buttondown) handles subscription
5. User receives confirmation email

---

## Implementation Status

### Overall Progress: ~85% Complete

| Category                  | Status | Notes                                   |
|---------------------------|--------|-----------------------------------------|
| Core Pages                | ✅ 100% | All main pages functional              |
| News System               | ✅ 100% | Automated sync, filtering, pagination  |
| Jobs Board                | ✅ 100% | Supabase integration, real-time updates|
| Events                    | ✅ 100% | Static data, Google Calendar embed     |
| Projects                  | ✅ 100% | Detail pages, filtering                |
| Navigation & Layout       | ✅ 100% | Responsive navbar/footer               |
| SEO                       | ✅ 100% | Sitemap, robots.txt, metadata          |
| Newsletter Archive        | 🚧 80%  | Missing dedicated page                 |
| Contribution System       | ✅ 100% | Form + API + rate limiting             |
| Authentication            | ❌ 0%   | Not yet required                       |
| Admin Dashboard           | ❌ 0%   | Future feature                         |
| Advanced Search           | ❌ 0%   | Future feature                         |

---

## Future Roadmap

### Phase 1: MVP (✅ Complete)
- [x] Home page with content rails
- [x] News page with filtering
- [x] Jobs board (basic)
- [x] Events page
- [x] Projects catalog
- [x] About page
- [x] Contribute form
- [x] Newsletter signup
- [x] SEO basics
- [x] Responsive design

### Phase 2: Enhanced Features (Current)
- [x] Real-time job updates (Supabase)
- [x] Advanced job filtering (search, location, salary)
- [x] Job detail modal
- [x] Newsletter archive with polling
- [ ] Dedicated newsletter archive page (`/newsletters`)
- [ ] Newsletter pagination
- [ ] Analytics integration (Plausible)
- [ ] Google Calendar sync for events

### Phase 3: Community Features (Q1 2026)
- [ ] User authentication (Supabase Auth)
- [ ] Member profiles
- [ ] Project submission by members
- [ ] Event registration/RSVP system
- [ ] Admin dashboard for content approval
- [ ] Email notifications for events

### Phase 4: Advanced Features (Q2-Q3 2026)
- [ ] Global search (Algolia/Meilisearch)
- [ ] Discussion forum
- [ ] Member directory
- [ ] Analytics dashboard (public-facing)
- [ ] Mobile app (React Native)

### Phase 5: Scale & Optimize (Q4 2026)
- [ ] CDN optimization
- [ ] Image optimization (Next.js Image)
- [ ] Code splitting
- [ ] Performance monitoring (Sentry)
- [ ] Multilingual support (i18n)
- [ ] Accessibility audit (WCAG 2.1 AA)

---

## Technical Specifications

### Performance Targets

| Metric                    | Target  | Current Status |
|---------------------------|---------|----------------|
| Lighthouse Performance    | 90+     | TBD            |
| Lighthouse Accessibility  | 95+     | TBD            |
| First Contentful Paint    | <1.5s   | TBD            |
| Time to Interactive       | <3s     | TBD            |
| Total Bundle Size         | <300KB  | TBD            |

### Browser Support
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- Mobile Safari (iOS 14+) ✅
- Chrome Mobile (Android 10+) ✅

### Accessibility Standards
- WCAG 2.1 Level AA compliance (target)
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast
- Focus indicators on interactive elements

### Security Measures
- **Rate Limiting:** 10 requests/min per IP on `/api/contribute`
- **Honeypot Protection:** Hidden form field to catch bots
- **Input Validation:** Client and server-side validation (lib/validators.ts)
- **CORS:** Next.js default (same-origin)
- **Content Security Policy:** TBD (future)
- **Supabase RLS:** Row-level security for database tables
- **Environment Variables:** Secrets stored in `.env.local` (gitignored)

### API Endpoints

| Endpoint                  | Method | Description                          | Auth Required |
|---------------------------|--------|--------------------------------------|---------------|
| `/api/news`               | POST   | Sync news from n8n webhook          | No            |
| `/api/jobs`               | GET    | Fetch jobs from Supabase/cache      | No            |
| `/api/jobs`               | POST   | Refresh jobs cache (n8n trigger)    | No            |
| `/api/contribute`         | POST   | Submit community resource           | No            |
| `/api/newsletters`        | GET    | Fetch newsletter archive            | No            |

### External Services

| Service        | Purpose                          | Status      | URL/Config                                    |
|----------------|----------------------------------|-------------|-----------------------------------------------|
| Supabase       | Database, real-time, auth        | ✅ Active   | `NEXT_PUBLIC_SUPABASE_URL`                    |
| n8n            | Workflow automation (news, jobs) | ✅ Active   | Webhook: `seabass34.app.n8n.cloud/webhook/*`  |
| Buttondown     | Newsletter management            | 🚧 Placeholder | Form action URL (TBD)                       |
| Google Calendar| Event calendar embed             | 🚧 Placeholder | iframe src (TBD)                            |
| Plausible      | Privacy-friendly analytics       | 🚧 Placeholder | Script tag in `layout.tsx` (domain TBD)     |
| Vercel         | Hosting, deployment              | 🚧 Not yet  | Planned for production                        |

---

## Deployment & Operations

### Development Workflow

#### Prerequisites
- Node.js 20+
- npm (comes with Node.js)
- Git
- Supabase account (for database features)
- n8n instance (for automation workflows)

#### Local Setup
```bash
# Clone repository
git clone <repo-url>
cd colgate-ai-club

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start dev server
npm run dev
# Server runs at http://127.0.0.1:3000 (port auto-selected if 3000 busy)
```

#### Environment Variables
```bash
# .env.local (gitignored)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Development Commands
```bash
npm run dev          # Start development server (auto port selection)
npm run build        # Build production bundle
npm run start        # Start production server (after build)
npm run lint         # Run ESLint
npm run sync-news    # Manually trigger news sync (requires dev server)
```

---

### Troubleshooting Dev Server

**Common Issues:**

1. **Dev server hangs or won't start**
   - **Cause:** Corrupted `node_modules` or `.next` cache
   - **Solution:**
     ```bash
     pkill -9 -f "next dev"               # Kill hanging processes
     rm -rf .next                         # Clear cache
     npm run dev                          # Restart
     ```

2. **Port 3000 already in use**
   - **Solution:** The custom dev script (`scripts/dev.js`) automatically finds an open port (3000-3050)
   - Check `.next-dev-port` file for the actual port being used

3. **Dependencies not installing**
   - **Solution:**
     ```bash
     rm -rf node_modules package-lock.json
     npm install
     ```

4. **Supabase connection errors**
   - Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Verify Supabase project is active

**See `CLAUDE.md` for complete troubleshooting guide.**

---

### Troubleshooting Production Deployment

**Issue: Git push doesn't trigger Vercel deployment**

**Symptoms:**
- Code successfully pushed to GitHub
- Vercel dashboard shows no new deployment
- Changes not visible on production site

**Possible Causes:**
1. **Webhook disconnected** - GitHub → Vercel webhook may have been broken
2. **Cron job conflicts** - Adding `vercel.json` with cron jobs can sometimes interfere with webhooks
3. **Rate limiting** - Multiple rapid deployments may trigger temporary blocks

**Solutions:**

**Option 1: Manual Redeploy via Vercel Dashboard** (Recommended)
```
1. Go to Vercel Dashboard → Your Project
2. Navigate to "Deployments" tab
3. Find most recent deployment
4. Click three-dot menu (•••)
5. Select "Redeploy"
6. Confirm redeployment
```

**Option 2: Vercel CLI Deployment**
```bash
# Authenticate (first time only)
vercel login

# Deploy to production
cd colgate-ai-club
vercel --prod
```

**Option 3: Force Webhook Trigger**
```bash
# Create small change to trigger webhook
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

**Option 4: Reconnect GitHub Integration**
```
1. Vercel Dashboard → Project Settings → Git
2. Disconnect GitHub repository
3. Reconnect GitHub repository
4. Verify webhook is active
```

**Debugging Steps:**
1. Verify commit is on GitHub: `git log --oneline -3` and check GitHub repo
2. Check Vercel deployment history for errors
3. Review Vercel project settings for Git connection status
4. Check Vercel status page for platform issues
5. Review build logs if deployment started but failed

**See `CLAUDE.md` for complete deployment troubleshooting procedures.**

---

### Project Type System Architecture

The projects section implements a comprehensive classification system to support three types of AI/ML learning projects:

#### Project Types

1. **Code Projects** (💻 Blue)
   - Traditional programming projects requiring code
   - Examples: Python ML classifiers, web apps, data pipelines
   - Display GitHub repository links
   - Tools: Programming languages, frameworks, libraries

2. **No-Code Projects** (⚡ Purple)
   - Visual automation and no-code tool projects
   - Examples: n8n workflows, Make.com automations, Lovable websites
   - Display workflow template links
   - Tools: n8n, Make.com, Zapier, Airtable, Lovable

3. **Hybrid Projects** (🔀 Green)
   - Combination of coding and no-code tools
   - Examples: Python backend + n8n automation, API + workflow orchestration
   - Display both repository and workflow links
   - Tools: Mix of programming languages and no-code platforms

#### Data Model Changes

**New Required Fields:**
- `projectType: 'code' | 'no-code' | 'hybrid'` - Classification type
- `tools: string[]` - Array of required tools/technologies

**Modified Fields:**
- `repoUrl?: string` - Now optional (not all projects need repos)
- `workflowUrl?: string` - New optional field for workflow templates

#### UI Components

**ProjectCard Component** (`components/projects/ProjectCard.tsx`):
- Project type badge with icon (Code/Zap/Layers from lucide-react)
- Color-coded type badge matching project type colors
- Tools display: Max 4 visible, "+X more" for overflow
- Conditional link display:
  - Shows GitHub icon if `repoUrl` exists
  - Shows ExternalLink icon if `workflowUrl` exists (and no `repoUrl`)
  - Both can appear for hybrid projects

**Project Detail Page** (`app/projects/[slug]/page.tsx`):
- **Project Type Section:**
  - Large 2xl rounded border with type color
  - Icon + label + description
  - Prominent placement at top of page
- **Tools & Technologies Section:**
  - All tools displayed as colored badges
  - Automatic categorization:
    - Programming languages (python, javascript, etc.) → Blue
    - No-code tools (n8n, make.com, etc.) → Purple
    - AI APIs (openai, anthropic, etc.) → Green
    - Databases (postgresql, pinecone, etc.) → Orange
    - Default → Gray
  - Hover effects with shadow
- **Prerequisites Callout:**
  - Blue-bordered box with info icon
  - Auto-generates list from tools array
  - Adds "key" for API tools, "account or installation" for others

**Projects Listing Page** (`app/projects/page.tsx`):
- **Dual Filter System:**
  - Type filter: All / Code / No-Code / Hybrid
  - Level filter: All / Beginner / Intermediate / Advanced
  - Both filters work together via URL query parameters
  - Each filter preserves the other's state
  - "All" button for each dimension
- **Filter URL Format:**
  - Type only: `/projects?type=no-code`
  - Level only: `/projects?level=beginner`
  - Combined: `/projects?type=no-code&level=beginner`
- **Empty State Handling:**
  - Shows customized message based on active filters
  - Example: "No no-code beginner projects found. Try adjusting your filters."

#### Tool Color Categorization Function

```typescript
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
```

#### Implementation Notes

- **Type Safety:** TypeScript ensures `projectType` is one of three valid values
- **Backward Compatibility:** Existing projects updated with new fields
- **Filtering Logic:** Sequential filtering (type first, then level)
- **URL State Management:** Filters preserved across navigation
- **Icon Library:** lucide-react provides Code, Zap, Layers, ExternalLink icons
- **Color Consistency:** Project type colors used throughout (cards, detail page, filters)

---

### Production Deployment

#### Vercel Deployment ✅ COMPLETED
**Status:** Live in production

**Deployment Details:**
- ✅ Repository connected: `Colgate-University-AI-Club/Club-Website`
- ✅ Environment variables configured in Vercel dashboard
- ✅ Automatic deployments enabled on push to main
- ✅ Preview deployments enabled for pull requests
- ✅ Build successful with no errors
- ✅ All routes accessible and functional

**Environment Variables Configured:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- (Additional secrets as needed)

**Deployment URL:** [Temporary Vercel URL] (pending custom domain)

#### Build Process
```bash
npm run build        # Next.js production build
npm run start        # Start production server (port 3000)
```

#### CI/CD Pipeline
- ✅ GitHub repository connected to Vercel
- ✅ Automatic deployments on push to main
- ✅ Preview deployments for pull requests
- ✅ Build logs available in Vercel dashboard
- Future: GitHub Actions for additional checks (ESLint, TypeScript, tests)

---

### Post-Deployment Tasks

#### Immediate (v1.2.0 - Next Sprint)

**1. Custom Domain Setup**
- [ ] Purchase domain (suggestions: `colgateai.org`, `colgateaiclub.com`)
- [ ] Configure DNS settings in domain registrar
- [ ] Add custom domain in Vercel dashboard
- [ ] Verify domain ownership
- [ ] Enable automatic HTTPS
- [ ] Update `NEXT_PUBLIC_BASE_URL` environment variable

**2. n8n Job Sync Workflow**
- [ ] Create n8n workflow for job board API integration
- [ ] Configure webhook endpoint: `/api/jobs` (POST)
- [ ] Set up scheduled trigger (daily or weekly)
- [ ] Implement job data transformation logic
- [ ] Test upsert functionality to Supabase
- [ ] Add error handling and notifications
- [ ] Document workflow in PRD and CLAUDE.md

**3. Job Check & Refresh Automation**
- [ ] Create manual refresh button on jobs page (already exists)
- [ ] Add loading states and feedback
- [ ] Implement cache invalidation
- [ ] Add last-updated timestamp display
- [ ] Optional: Add automatic background refresh every X minutes

**4. Final UI/UX Adjustments**
- [ ] Review all pages on mobile devices
- [ ] Test navigation flow
- [ ] Verify color contrast for accessibility
- [ ] Add loading skeletons for async content
- [ ] Polish animations and transitions
- [ ] Test with different browsers (Chrome, Firefox, Safari, Edge)

**5. Performance Optimization**
- [ ] Run Lighthouse audit
- [ ] Optimize images (convert to WebP, add lazy loading)
- [ ] Implement code splitting for large components
- [ ] Add proper caching headers
- [ ] Minimize bundle size
- [ ] Test page load times

#### Future Enhancements (v1.3.0+)
- [ ] Dedicated newsletter archive page with pagination
- [ ] Analytics integration (Plausible)
- [ ] Google Calendar API sync for events
- [ ] Open Graph meta tags for social sharing
- [ ] Structured data (JSON-LD) for SEO
- [ ] Admin dashboard for content management
- [ ] User authentication for member features
- [ ] Email notifications for new jobs/events

---

### Monitoring & Maintenance

#### Logs
- **Development:** Console logs in terminal
- **Production (Vercel):** Real-time logs in Vercel dashboard
- **Supabase:** Database logs in Supabase dashboard

#### Error Tracking (Planned)
- Sentry integration for client and server errors
- Error boundary components for graceful failures

#### Analytics (Planned)
- Plausible Analytics (privacy-friendly, GDPR-compliant)
- Page view tracking
- Event tracking (job clicks, project views, etc.)

#### Database Maintenance
- **Supabase:**
  - Automatic backups (daily)
  - Monitor table sizes
  - Review RLS policies
  - Optimize indexes

#### Content Updates
- **News:** Automated via n8n workflow (daily sync)
- **Jobs:** Automated via n8n workflow (daily/weekly sync from job APIs)
- **Events:** Manual updates to `events.json` (future: admin dashboard)
- **Projects:** Manual updates to `projects.json` (future: member submissions)
- **Newsletters:** Manual updates via Supabase dashboard (future: CMS)

---

## Design System

### Color Palette

**Primary (Maroon - Colgate Brand)**
```css
--primary: hsl(0 70% 30%)      /* Dark maroon */
--primary-foreground: #ffffff
```

**Secondary/Accent**
```css
--accent: hsl(0 70% 95%)       /* Light maroon tint */
--accent-foreground: hsl(0 70% 30%)
```

**Neutral**
```css
--background: #ffffff
--foreground: hsl(0 0% 10%)
--muted: hsl(0 0% 96%)
--muted-foreground: hsl(0 0% 45%)
--border: hsl(0 0% 90%)
```

**Semantic Colors**
```css
--success: hsl(120 60% 50%)    /* Green */
--warning: hsl(45 90% 55%)     /* Yellow */
--error: hsl(0 70% 50%)        /* Red */
--info: hsl(200 90% 50%)       /* Blue */
```

### Typography

**Font Family**
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**Font Sizes**
- `text-xs`: 0.75rem (12px)
- `text-sm`: 0.875rem (14px)
- `text-base`: 1rem (16px)
- `text-lg`: 1.125rem (18px)
- `text-xl`: 1.25rem (20px)
- `text-2xl`: 1.5rem (24px)
- `text-3xl`: 1.875rem (30px)
- `text-4xl`: 2.25rem (36px)
- `text-5xl`: 3rem (48px)

**Font Weights**
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Spacing
Tailwind's default spacing scale (0.25rem increments):
- `p-4`: 1rem (16px)
- `p-6`: 1.5rem (24px)
- `p-8`: 2rem (32px)
- `gap-6`: 1.5rem between grid items

### Border Radius
- Cards: `rounded-2xl` (1rem)
- Buttons: `rounded-lg` (0.5rem)
- Badges: `rounded-md` (0.375rem)
- Inputs: `rounded-lg` (0.5rem)

### Component Patterns

**Card Hover Effect**
```css
transition-all duration-200 hover:-translate-y-1 hover:shadow-lg
```

**Button Variants**
- Primary: `bg-primary text-primary-foreground hover:bg-primary/90`
- Secondary: `border border-border bg-background hover:bg-accent`
- Outline: `border border-border hover:bg-accent`

**Badge Styles**
- Club: `bg-green-50 text-green-700 border border-green-200`
- External: `bg-blue-50 text-blue-700 border border-blue-200`
- Tag: `bg-gray-100 text-gray-700 hover:bg-gray-200`

---

## Content Guidelines

### News Articles
- **Title:** Clear, concise (max 80 characters)
- **Summary:** 1-2 sentences (max 150 characters)
- **Tags:** 2-5 relevant tags (lowercase, hyphenated)
- **Source Type:** "club" for internal, "external" for syndicated
- **URL:** Always link to full article

### Events
- **Title:** Event name + type (e.g., "Intro to ML Workshop")
- **Description:** What, why, who should attend
- **Location:** Be specific (building + room) or "Virtual + Zoom link"
- **RSVP:** Always include a link (Google Forms, Eventbrite, etc.)

### Projects
- **Difficulty:** Be honest about complexity
- **Duration:** Estimate realistically (include setup time)
- **Resources:** Provide diverse learning materials (video, article, repo)
- **Body:** Step-by-step guide with code examples

### Jobs
- **Accuracy:** Verify salary, location, and job type
- **Requirements:** Separate REQUIRED vs. PREFERRED clearly
- **Benefits:** Highlight what makes the role attractive
- **Apply URL:** Link directly to application (not company homepage)

---

## API Integration Details

### n8n Workflows

#### News Sync Workflow
**Target Endpoint:** `https://www.colgateaiclub.com/api/news` (POST)

**Trigger:** Scheduled (daily cron) or manual

**Workflow Steps:**
1. Trigger workflow (scheduled or manual)
2. Fetch RSS feeds from AI news sources (TechCrunch, MIT News, etc.)
3. Extract article data (title, URL, published date, content, summary)
4. Summarize content using AI (optional)
5. Transform published_date to ISO 8601 format
6. Format as array of articles:
   ```json
   [
     {
       "url": "string",
       "title": "string",
       "published_date": "ISO 8601 date",
       "content": "string",
       "card_summary": "string"
     }
   ]
   ```
7. HTTP Request node POSTs array to `/api/news`
8. API upserts articles into Supabase `news` table
9. Tags auto-generated on-the-fly when articles are fetched

**Configuration:**
- **Method:** POST
- **URL:** `https://www.colgateaiclub.com/api/news`
- **Headers:** `Content-Type: application/json`
- **Body:** Raw array (not wrapped in object)
- **Body Expression:** `{{ $json.articles }}` (use Aggregate node if needed)

**Error Handling:**
- Upsert prevents duplicates (based on URL)
- API returns success/error status
- Workflow includes retry logic (3 attempts)

---

#### Newsletter Signup Workflow
**Webhook URL:** `https://seabass34.app.n8n.cloud/webhook/9245414e-3af7-40f8-98ab-cd50d44750b5`

**Trigger:** HTTP POST request from `/api/newsletter/subscribe` endpoint

**Purpose:** Process newsletter signups from the website and add subscribers to email list

**Workflow Steps:**
1. Receive webhook POST from API proxy
2. Extract email, timestamp, source, and IP from payload
3. Validate email is not already subscribed
4. Add to email list (Buttondown, Mailchimp, or similar)
5. Send welcome email (optional)
6. Log subscription to Google Sheets or database
7. Return success response

**API Endpoint:** `https://www.colgateaiclub.com/api/newsletter/subscribe` (POST)

**How It Works:**
- Client calls `/api/newsletter/subscribe` with email
- API proxy validates email and forwards to n8n webhook
- Server-to-server request bypasses CORS restrictions
- n8n processes signup and returns success/failure

**Configuration:**
- **Method:** POST (webhook configured to accept POST requests)
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "timestamp": "2025-10-31T12:00:00Z",
    "source": "AI Club Website",
    "ip": "192.168.1.1"
  }
  ```
- **Response:** HTTP 200 on success

**Error Handling:**
- Email validation in API proxy
- Rate limiting (10 requests/min per IP)
- Duplicate email detection in n8n
- Detailed error logging

---

#### Jobs Sync Workflow (Planned)
**Status:** Not yet implemented

**Trigger:** Scheduled (daily/weekly)

**Workflow Steps:**
1. Fetch jobs from external APIs (LinkedIn, Greenhouse, etc.)
2. Parse job data (title, company, location, salary, etc.)
3. Transform to `JobData` format
4. Upsert into Supabase `jobs` table (based on `job_key`)
5. Mark old jobs as expired (status = 'expired')

**Data Sources (Potential):**
- LinkedIn Jobs API
- Greenhouse API
- Indeed API
- GitHub Jobs
- Custom scraper (legal/ethical scraping only)

---

#### GitHub Repository Stats Integration

**API Endpoint:** `/api/github/repo-info?url=[repository-url]`

**Purpose:** Fetch and display GitHub repository statistics for projects

**Implementation:**
- Accepts GitHub repository URL as query parameter
- Extracts owner and repo name from URL
- Calls GitHub REST API: `GET /repos/{owner}/{repo}`
- Returns: stars, forks, last updated timestamp
- No authentication required (public repos only)

**Error Handling:**
- 404 responses (non-existent repos): Return empty/null stats, fail silently
- Rate limiting: GitHub allows 60 requests/hour for unauthenticated calls
- Network errors: Caught and handled gracefully in UI

**Important Notes:**
- **Manual Repository Creation Required**: GitHub repositories cannot be automatically created via the website for security reasons:
  1. Would require storing GitHub Personal Access Token with write permissions (security risk)
  2. Repositories need manual curation (README, starter code, description, license, etc.)
  3. This is a read-only display layer, not a repository management system
- **Workflow:**
  1. Club admin manually creates repository in Colgate-University-Ai-Club organization
  2. Club admin adds project entry to `projects.json` with correct `repoUrl`
  3. Website automatically fetches and displays repo stats
- **Graceful Degradation**: If repository doesn't exist yet, project card still displays correctly without GitHub stats

**Potential Future Enhancement:**
Could build a separate admin script/tool to create template repositories using GitHub API with stored credentials, but this would be:
- Run manually/on-demand (not automatic)
- Kept separate from public website
- Secured with proper credential management (environment variables, not in codebase)

---

### Supabase Real-time Subscriptions

**Jobs Table Subscription**
```typescript
supabase
  .channel('jobs_changes')
  .on('postgres_changes', {
    event: '*',                  // INSERT, UPDATE, DELETE
    schema: 'public',
    table: 'jobs',
    filter: 'status=eq.active'
  }, (payload) => {
    // Reload jobs data
    fetchJobs().then(setJobs)
  })
  .subscribe()
```

**Benefits:**
- Instant UI updates when jobs are added/removed
- No polling required
- Reduced API calls

---

## Testing Strategy (Future)

### Unit Tests
- **Framework:** Jest + React Testing Library
- **Coverage:**
  - Utility functions (date.ts, paginate.ts, validators.ts)
  - Component rendering (cards, buttons, forms)
  - API route handlers

### Integration Tests
- **Framework:** Playwright or Cypress
- **Coverage:**
  - User flows (news browsing, job filtering)
  - Form submissions
  - Navigation

### E2E Tests
- **Framework:** Playwright
- **Coverage:**
  - Critical paths (home → news → detail)
  - Jobs filtering and modal
  - Contribute form submission

### Performance Tests
- **Tool:** Lighthouse CI
- **Metrics:** Performance, Accessibility, Best Practices, SEO

---

## Documentation Structure

```
/
├── README.md                   # Getting started guide
├── PRD.md                      # This document
├── CLAUDE.md                   # Claude Code instructions
├── CONTRIBUTING.md             # Future: Contribution guidelines
├── CHANGELOG.md                # Future: Version history
└── docs/                       # Future: Extended documentation
    ├── api-reference.md
    ├── component-guide.md
    ├── deployment-guide.md
    └── troubleshooting.md
```

---

## Glossary

- **App Router:** Next.js 15's file-based routing system (app/ directory)
- **CVA:** class-variance-authority (utility for component variants)
- **n8n:** Open-source workflow automation tool
- **RLS:** Row Level Security (Supabase database access control)
- **Radix UI:** Unstyled, accessible UI component primitives
- **shadcn/ui:** Component pattern (not a library) for composable UI
- **Supabase:** Open-source Firebase alternative (Postgres + real-time + auth)
- **Tailwind CSS:** Utility-first CSS framework

---

## Contact & Support

**Maintainers:**
- AI Club Leadership (TBD)
- Technical Lead: [Name] (TBD)

**Repository:** [GitHub URL] (TBD)

**Issues:** Report bugs via GitHub Issues (TBD)

**Discussions:** GitHub Discussions for feature requests (TBD)

---

## Changelog

### v1.1.2 (Current - October 15, 2025)
- ✅ **Manual Calendar Sync Button** - Enabled manual "Sync Now" button on Events page for both development and production
- ✅ **Deployment Troubleshooting** - Investigated and documented Vercel webhook deployment issues
- ✅ **Deployment Testing** - Created test commits to isolate webhook vs deployment issues
- ✅ **Documentation Updates** - Comprehensive deployment troubleshooting guides in PRD.md and CLAUDE.md
- ✅ Removed automatic cron job configuration (manual sync preferred for better control)

### v1.1.1 (October 15, 2025)
- ✅ **Google Calendar Event Sync** - Implemented and tested calendar sync functionality
- ✅ **Fixed HTML Rendering in Projects** - Converted all project body content from HTML to Markdown
- ✅ **Enhanced Project Details Styling** - Improved visual hierarchy with maroon accents and better spacing
- ✅ Event sync via `/api/events/sync` endpoint working correctly
- ✅ All 6 projects (p2-p7) now render properly with Markdown formatting
- ✅ Project details section redesigned with clean, readable typography

### v1.1.0 (October 14, 2025)
- ✅ **DEPLOYED TO VERCEL** - Production site live
- ✅ Project type system (code/no-code/hybrid)
- ✅ Dual filtering (type + level) on projects page
- ✅ Tool color categorization
- ✅ Enhanced project detail pages
- ✅ All 7 projects with GitHub integration
- ✅ Updated documentation (PRD.md, CLAUDE.md)

### v1.0.0 (Completed - October 13, 2025)
- ✅ All core pages implemented
- ✅ News sync automation (n8n)
- ✅ Jobs board with Supabase + real-time updates
- ✅ Advanced job filtering and search
- ✅ Newsletter archive with polling
- ✅ SEO optimization (sitemap, robots.txt)
- ✅ Responsive design (mobile + desktop)
- ✅ Contribution form with rate limiting

### v1.2.0 (Planned - Next)
- [ ] Custom domain setup and DNS configuration
- [ ] n8n job sync workflow (automated job board updates)
- [ ] Job check & refresh automation
- [ ] Final UI/UX adjustments
- [ ] Performance optimization
- [ ] Analytics integration (Plausible)
- [ ] Google Calendar API sync

### v0.8.0 (Completed - Early October 2025)
- Initial MVP release
- Basic news, jobs, events, projects pages
- Static data via JSON files
- Basic filtering and pagination

---

## Appendix

### A. File Structure
```
colgate-ai-club/
├── app/
│   ├── (routes)/
│   │   ├── page.tsx              # Home
│   │   ├── about/page.tsx
│   │   ├── news/page.tsx
│   │   ├── news/[id]/page.tsx
│   │   ├── jobs/page.tsx
│   │   ├── events/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── projects/[slug]/page.tsx
│   │   └── contribute/page.tsx
│   ├── api/
│   │   ├── news/route.ts
│   │   ├── jobs/route.ts
│   │   ├── newsletters/route.ts
│   │   └── contribute/route.ts
│   ├── data/
│   │   ├── news.json
│   │   ├── jobs.json
│   │   ├── events.json
│   │   ├── projects.json
│   │   ├── newsletters.json
│   │   └── contribute-queue.json
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── site/                    # NavBar, Footer
│   ├── ui/                      # Button, Card, Input, etc.
│   ├── common/                  # Pagination, Tag
│   ├── news/                    # NewsCard, NewsletterNavButton
│   ├── jobs/                    # EnhancedJobCard, JobModal, JobFilters
│   ├── events/                  # EventCard
│   ├── projects/                # ProjectCard
│   └── newsletter/              # NewsletterSection, NewsletterSectionWithPolling
├── lib/
│   ├── types.ts                 # TypeScript definitions
│   ├── utils.ts                 # Utility functions (cn, etc.)
│   ├── date.ts                  # Date formatting
│   ├── paginate.ts              # Pagination logic
│   ├── validators.ts            # Form validation
│   ├── tags.ts                  # Tag utilities
│   ├── jobUtils.ts              # Job filtering/sorting
│   ├── newsletter.ts            # Newsletter utilities
│   ├── supabase.ts              # Supabase client
│   └── brand.ts                 # Brand constants
├── hooks/
│   └── useNewsletterPolling.ts  # Newsletter polling hook
├── scripts/
│   ├── dev.js                   # Custom dev server (port selection)
│   └── sync-news.js             # News sync script
├── public/                      # Static assets
├── .env.local                   # Environment variables (gitignored)
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── package.json
├── README.md
├── CLAUDE.md
└── PRD.md                       # This document
```

---

### B. Key Dependencies

**Production:**
- `next@15.5.3` - React framework
- `react@19.1.0` - UI library
- `react-dom@19.1.0` - React DOM renderer
- `@supabase/supabase-js@2.58.0` - Database client
- `tailwindcss@4` - CSS framework
- `lucide-react@0.544.0` - Icons
- `react-markdown@10.1.0` - Markdown rendering
- `uuid@13.0.0` - UUID generation
- `@radix-ui/react-*` - UI primitives
- `class-variance-authority@0.7.1` - Component variants
- `clsx@2.1.1` - Conditional classes
- `tailwind-merge@3.3.1` - Merge Tailwind classes

**Development:**
- `typescript@5` - Type checking
- `eslint@9` - Linting
- `eslint-config-next@15.5.3` - Next.js ESLint config
- `@types/*` - TypeScript definitions

---

### C. Performance Checklist

- [ ] Implement Next.js Image component for optimized images
- [ ] Enable Next.js font optimization
- [ ] Add loading skeletons for async content
- [ ] Implement code splitting (dynamic imports)
- [ ] Optimize bundle size (analyze with `@next/bundle-analyzer`)
- [ ] Add service worker for offline support (PWA)
- [ ] Implement lazy loading for below-the-fold content
- [ ] Use `useTransition` for non-urgent updates
- [ ] Add `Suspense` boundaries for streaming SSR
- [ ] Optimize Supabase queries (indexes, select specific columns)

---

### D. Accessibility Checklist

- [ ] Add alt text to all images
- [ ] Ensure sufficient color contrast (WCAG AA)
- [ ] Add focus indicators to all interactive elements
- [ ] Use semantic HTML (nav, main, article, section)
- [ ] Add ARIA labels where needed
- [ ] Test with keyboard navigation (Tab, Enter, Esc)
- [ ] Test with screen readers (VoiceOver, NVDA)
- [ ] Add skip-to-content link
- [ ] Ensure form errors are announced
- [ ] Add loading indicators for async actions

---

### E. SEO Checklist

- [x] Implement sitemap.xml (dynamic)
- [x] Implement robots.txt
- [ ] Add Open Graph meta tags
- [ ] Add Twitter Card meta tags
- [ ] Add structured data (JSON-LD) for events, articles
- [ ] Implement canonical URLs
- [ ] Add breadcrumb navigation
- [ ] Optimize page titles and descriptions
- [ ] Add internal linking strategy
- [ ] Submit sitemap to Google Search Console

---

## Conclusion

The Colgate AI Club Website is a modern, scalable platform designed to serve the AI/ML community at Colgate University. **The site is now live in production on Vercel** with comprehensive project type support and full feature parity.

**Current Status: v1.1.0 - DEPLOYED ✅**

**Next Immediate Steps (v1.2.0):**
1. ~~Deploy to Vercel~~ ✅ **COMPLETED**
2. Purchase and configure custom domain
3. Set up n8n job sync workflow for automated job board updates
4. Implement job check & refresh automation
5. Final UI/UX adjustments and polish
6. Performance optimization (Lighthouse audit)
7. Complete newsletter archive page (`/newsletters`)
8. Integrate analytics (Plausible)
9. Test accessibility with screen readers
10. Launch publicly and promote to Colgate students

**Long-term Vision:**
- Become the central hub for AI/ML at Colgate
- Scale to support 500+ active users
- Expand to include authentication and member features
- Build out admin dashboard for easy content management
- Integrate with Colgate's student information systems

**Success Metrics (6 months post-launch):**
- 200+ monthly active users
- 50+ newsletter subscribers
- 20+ community contributions
- 100+ job applications via the platform
- 10+ student projects showcased

---

*Document maintained by AI Club Technical Team. Last updated: October 14, 2025.*
