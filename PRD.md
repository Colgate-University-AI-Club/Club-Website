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
- **Data Storage:**
  - JSON files (`app/data/*.json`) for static content
  - Supabase for dynamic, frequently-updated content
- **External Integrations:**
  - n8n workflow automation for news syndication
  - Job board API integrations (via n8n)
  - Buttondown (placeholder for newsletter)
  - Google Calendar (embedded iframe for events)

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
    │  - news.json     │    │   - jobs table             │
    │  - events.json   │    │   - newsletters table      │
    │  - projects.json │    │   - real-time subscriptions│
    │  - jobs.json     │    │   - Row Level Security     │
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
- **Status:** ✅ Complete
- **Description:** Paginated news feed with filtering
- **Features:**
  - Tag-based filtering (URL query param: `?tag=ai`)
  - Pagination (12 items per page, query param: `?page=2`)
  - Source type badges (club/external)
  - Published date display
  - Automated sync from n8n workflow
  - Dynamic metadata for SEO
- **Files:** `app/news/page.tsx`, `components/news/NewsCard.tsx`, `scripts/sync-news.js`
- **Data Source:** `app/data/news.json` (synced from n8n)

#### 3. **News Detail Page** (`/news/[id]`)
- **Status:** ✅ Complete
- **Description:** Individual news article view
- **Features:**
  - Full article content (markdown rendering)
  - Source attribution
  - Related tags
  - "Back to News" navigation
- **File:** `app/news/[id]/page.tsx`

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
- **Status:** ✅ Complete
- **Description:** Event listings with Google Calendar integration
- **Features:**
  - Upcoming events list (sorted by start date)
  - Past events section
  - Event details: date, time, location, description
  - RSVP links
  - Google Calendar embed (iframe placeholder)
  - Event filtering (upcoming vs. past)
- **Files:** `app/events/page.tsx`, `components/events/EventCard.tsx`
- **Data Source:** `app/data/events.json`

#### 6. **Projects Page** (`/projects`)
- **Status:** ✅ Complete
- **Description:** Project catalog with filtering
- **Features:**
  - Level-based filtering (beginner/intermediate/advanced)
  - Filter buttons using Next.js Link components for URL-based navigation
  - "All" filter to clear active filters
  - Difficulty level badges with color coding
  - Duration indicators (estimated hours)
  - Project summaries
  - GitHub repository integration (displays repo stats when available)
  - Graceful handling of non-existent repositories
  - Links to individual project pages
- **Files:** `app/projects/page.tsx`, `components/projects/ProjectCard.tsx`
- **Data Source:** `app/data/projects.json`
- **Technical Notes:**
  - Filter buttons MUST be `<Link>` components, not static `<button>` elements
  - Query parameter format: `?level=beginner`
  - GitHub stats fetched via `/api/github/repo-info` endpoint

#### 7. **Project Detail Page** (`/projects/[slug]`)
- **Status:** ✅ Complete
- **Description:** Individual project view with comprehensive markdown guides
- **Features:**
  - Full project description (markdown body rendered with ReactMarkdown)
  - Comprehensive markdown content (2000+ words):
    - Project overview
    - Learning objectives
    - Prerequisites
    - Step-by-step implementation guide
    - Code examples and snippets
    - Expected outcomes
  - Resource links (tutorials, docs, datasets, tools)
  - GitHub repository link with stats
  - Estimated time to complete
  - Difficulty level badge
  - Related tags
  - Tailwind prose classes for markdown styling
- **File:** `app/projects/[slug]/page.tsx`
- **Technical Notes:**
  - Uses `react-markdown` for rendering (NEVER `dangerouslySetInnerHTML`)
  - Markdown content stored in `body` field of project JSON
  - Comprehensive prose classes for proper formatting

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
- **Status:** ✅ Complete
- **Description:** Newsletter archive and signup
- **Features:**
  - Newsletter archive page with polling
  - Real-time updates from Supabase
  - Newsletter signup component (Buttondown placeholder)
  - Archive view with markdown rendering
  - Polling hook for live updates
- **Files:**
  - `components/newsletter/NewsletterSection.tsx`
  - `components/newsletter/NewsletterSectionWithPolling.tsx`
  - `hooks/useNewsletterPolling.ts`
  - `app/api/newsletters/route.ts`
  - `lib/newsletter.ts`
- **Data Source:** Supabase `newsletters` table

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
  durationHours?: number;  // Estimated completion time (2-8 hours typical)
  summary: string;         // Short description for cards
  repoUrl?: string;        // GitHub link (Colgate-University-Ai-Club org)
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
1. Twitter Sentiment Analysis Classifier (Beginner, 4 hours)
2. Chatbot with RAG Pipeline (Intermediate, 6 hours)
3. Computer Vision Object Detection (Intermediate, 8 hours)
4. NLP Text Summarizer (Beginner, 3 hours)
5. Deep Learning Image Generator (Advanced, 8 hours)

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
2. User filters by tag (e.g., "computer-vision")
3. User sees projects with difficulty levels
4. User clicks project → navigates to `/projects/[slug]`
5. User reads project details, views resources
6. User clicks "View Repository" → opens GitHub in new tab

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

### Production Deployment (Planned)

#### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Any other secrets (Plausible domain, etc.)
3. Deploy main branch → automatic deployments on push
4. Preview deployments for pull requests

#### Build Process
```bash
npm run build        # Next.js production build
npm run start        # Start production server (port 3000)
```

#### CI/CD Pipeline (Future)
- GitHub Actions workflow
- Run ESLint and TypeScript checks
- Run build test
- Deploy to Vercel on merge to main

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
**Webhook URL:** `https://seabass34.app.n8n.cloud/webhook/e72f4374-f5b6-4dc8-9e75-29d942960d23`

**Trigger:** Manual via `npm run sync-news` or scheduled (daily cron)

**Workflow Steps:**
1. Receive webhook trigger
2. Fetch RSS feeds from AI news sources (TechCrunch, MIT News, etc.)
3. Extract article data (title, URL, published date)
4. Summarize content using AI (optional)
5. Generate UUID for each article
6. Tag articles based on keywords
7. Deduplicate against existing `news.json`
8. Return array of new articles
9. Local script (`sync-news.js`) posts to `/api/news`
10. API merges new articles into `news.json`

**Error Handling:**
- If n8n fails, script logs error and exits
- If API fails, articles are lost (no retry mechanism yet)

---

#### Jobs Sync Workflow (Planned)
**Webhook URL:** `https://seabass34.app.n8n.cloud/webhook/9245414e-3af7-40f8-98ab-cd50d44750b5`

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

### v1.0.0 (Current - October 14, 2025)
- ✅ All core pages implemented
- ✅ News sync automation (n8n)
- ✅ Jobs board with Supabase + real-time updates
- ✅ Advanced job filtering and search
- ✅ Newsletter archive with polling
- ✅ SEO optimization (sitemap, robots.txt)
- ✅ Responsive design (mobile + desktop)
- ✅ Contribution form with rate limiting

### v0.9.0 (Planned - Late October 2025)
- Dedicated newsletter archive page
- Newsletter pagination
- Analytics integration (Plausible)
- Google Calendar API sync

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

The Colgate AI Club Website is a modern, scalable platform designed to serve the AI/ML community at Colgate University. With a solid foundation in place (85% complete), the project is ready for production deployment and future enhancements.

**Next Immediate Steps:**
1. Complete newsletter archive page (`/newsletters`)
2. Integrate analytics (Plausible)
3. Deploy to Vercel (production)
4. Test performance and accessibility
5. Launch publicly and promote to Colgate students

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
