import Link from "next/link"
import { NewsItem, EventItem, ProjectItem } from '@/lib/types'
import { formatDate, isUpcoming } from '@/lib/date'
import { Newspaper, Calendar, Rocket } from 'lucide-react'
import newsData from '@/app/data/news.json'
import eventsDataRaw from '@/app/data/events.json'
import projectsData from '@/app/data/projects.json'
import NewsletterSignup from '@/components/NewsletterSignup'

// Handle both old format (array) and new format (object with events array)
type EventsData = EventItem[] | { lastSyncedAt?: string; events: EventItem[] }

export default function Home() {
  const news = (newsData as NewsItem[])
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3)

  const eventsData = eventsDataRaw as EventsData
  const events = Array.isArray(eventsData) ? eventsData : eventsData.events

  const upcomingEvents = events
    .filter(event => isUpcoming(event.startsAt))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 3)

  const featuredProjects = (projectsData as ProjectItem[])
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, 3)

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-foreground">
              Colgate AI Club
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Exploring artificial intelligence and machine learning at Colgate University through hands-on projects, workshops, and community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/events"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                See Events
              </Link>
              <a
                href="#newsletter"
                className="inline-flex items-center justify-center px-6 py-3 border border-border bg-background text-foreground font-medium rounded-lg hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Join Newsletter
              </a>
            </div>
          </div>

          {/* Right Column - Decorative */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-muted rounded-3xl transform rotate-3"></div>
            <div className="relative bg-card border border-border rounded-3xl p-8 shadow-sm">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <Newspaper className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">News</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Events</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <Rocket className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Projects</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section divider */}
      <div className="relative mb-20">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-gradient-to-r from-background via-background to-background px-6">
            <div className="w-2 h-2 bg-primary/20 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* News Rail */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Newspaper className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Latest News</h2>
          </div>
          <Link href="/news" className="text-primary hover:text-primary/80 font-medium transition-colors group">
            View all
            <span className="inline-block ml-1 transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
        {news.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {news.map((item) => (
              <article key={item.id} className="group relative rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      item.sourceType === 'external' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      {item.sourceType === 'external' ? 'External' : 'Club'}
                    </span>
                    <span className="text-sm text-muted-foreground">{formatDate(item.publishedAt)}</span>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    <a
                      href={item.url}
                      target={item.sourceType === 'external' ? '_blank' : undefined}
                      rel={item.sourceType === 'external' ? 'noopener noreferrer' : undefined}
                      className="after:absolute after:inset-0"
                    >
                      {item.title}
                    </a>
                  </h3>
                  {item.summary && (
                    <p className="text-muted-foreground text-sm line-clamp-2">{item.summary}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No news available yet.</p>
          </div>
        )}
      </section>

      {/* Events Rail */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Upcoming Events</h2>
          </div>
          <Link href="/events" className="text-primary hover:text-primary/80 font-medium transition-colors group">
            View all
            <span className="inline-block ml-1 transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {upcomingEvents.map((item) => (
              <article key={item.id} className="group relative rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <div className="p-6">
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      Upcoming
                    </span>
                  </div>
                  <h3 className="font-semibold mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                  <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(item.startsAt)}
                    </div>
                    {item.location && (
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {item.location}
                      </div>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{item.description}</p>
                  )}
                  {item.rsvpUrl && (
                    <a
                      href={item.rsvpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium transition-colors group"
                    >
                      RSVP
                      <span className="inline-block ml-1 transition-transform group-hover:translate-x-0.5">→</span>
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming events scheduled.</p>
          </div>
        )}
      </section>

      {/* Projects Rail */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Rocket className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Featured Projects</h2>
          </div>
          <Link href="/projects" className="text-primary hover:text-primary/80 font-medium transition-colors group">
            View all
            <span className="inline-block ml-1 transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
        {featuredProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {featuredProjects.map((item) => (
              <article key={item.id} className="group relative rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                      item.level === 'beginner' ? 'bg-green-50 text-green-700 border-green-200' :
                      item.level === 'intermediate' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-orange-50 text-orange-700 border-orange-200'
                    }`}>
                      {item.level}
                    </span>
                    {item.durationHours && (
                      <span className="text-sm text-muted-foreground">{item.durationHours}h</span>
                    )}
                  </div>
                  <h3 className="font-semibold mb-3 group-hover:text-primary transition-colors">
                    <Link href={`/projects/${item.slug}`} className="after:absolute after:inset-0">
                      {item.title}
                    </Link>
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{item.summary}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Rocket className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No projects available yet.</p>
          </div>
        )}
      </section>

      <footer id="newsletter" className="mt-16 border-t pt-8">
        <h2 className="text-xl font-medium">Get updates</h2>
        <p className="text-neutral-600">Subscribe to the Colgate AI Digest.</p>
        <div className="mt-4">
          <NewsletterSignup variant="home" />
        </div>
      </footer>
    </main>
  )
}
