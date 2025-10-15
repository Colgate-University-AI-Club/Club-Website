# Colgate University AI Club Website

Colgate University AI Club's official website built with Next.js 15, TypeScript, and Tailwind CSS.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

- **News**: Browse AI-related news with tag filtering and pagination
- **Jobs**: Explore AI job opportunities with advanced filtering (powered by Supabase)
- **Events**: View upcoming AI club events with automatic Google Calendar sync
- **Projects**: Showcase club projects with live GitHub statistics (stars, forks, last updated)
- **Contribute**: Submit resources to be added to the website

## Architecture

This is a data-driven Next.js application with:
- JSON-based content management (no database required)
- Server-side rendering and static generation
- Component-based architecture with shadcn/ui
- Responsive design optimized for all devices
- API routes for content submission

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment Variables

This project requires several environment variables for full functionality:

### Required for Production

```bash
# Supabase (Jobs Database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# GitHub API (Project Stats)
GITHUB_TOKEN=your_github_token
GITHUB_ORG=Colgate-University-AI-Club

# Google Calendar API (Event Sync)
GOOGLE_CALENDAR_API_KEY=your_calendar_api_key
GOOGLE_CALENDAR_ID=your_calendar_id
```

### Optional

```bash
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
CRON_SECRET=your_cron_secret_for_vercel
```

Create a `.env.local` file in the project root with these values for local development.

## Calendar Sync

The website automatically syncs events from Google Calendar. To manually trigger a sync:

```bash
# Local development
curl -X POST "http://localhost:3000/api/events/sync"

# Production
curl -X POST "https://yourdomain.com/api/events/sync"
```

The sync endpoint:
- Fetches upcoming events from Google Calendar
- Updates `app/data/events.json`
- Preserves manually added events
- Includes rate limiting (1 request per minute for manual requests)

For automatic syncing in production, set up a Vercel Cron Job (see CLAUDE.md for details).

## Deploy on Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables (see above)
4. Deploy
5. Set up Vercel Cron Job for automatic calendar sync (optional)

For a comprehensive deployment checklist and troubleshooting guide, see `CLAUDE.md`.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
