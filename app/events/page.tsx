import { EventItem } from '@/lib/types'
import { isUpcoming } from '@/lib/date'
import EventCard from '@/components/events/EventCard'
import eventsDataRaw from '@/app/data/events.json'
import { Calendar } from 'lucide-react'
import EventSyncStatus from '@/components/events/EventSyncStatus'

// Handle both old format (array) and new format (object with events array)
type EventsData = EventItem[] | { lastSyncedAt?: string; events: EventItem[] }

export default function EventsPage() {
  const eventsData = eventsDataRaw as EventsData
  const events = Array.isArray(eventsData) ? eventsData : eventsData.events
  const lastSyncedAt = Array.isArray(eventsData) ? undefined : eventsData.lastSyncedAt

  const upcomingEvents = events
    .filter(event => isUpcoming(event.startsAt))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 6)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="relative mb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-muted/50 rounded-3xl -z-10"></div>
        <div className="py-16 px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Events & Workshops
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join us for workshops, guest lectures, hackathons, and networking opportunities.
            Connect with fellow AI enthusiasts and expand your knowledge through hands-on learning experiences.
          </p>
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Event Calendar</h2>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <iframe
            src="https://calendar.google.com/calendar/embed?src=c_70be99447b04664cf84e02e27ec0b6ce9cba03440ae2ea9891d1c2e0d7b59ab3%40group.calendar.google.com&ctz=America%2FNew_York"
            className="w-full aspect-video rounded-lg border-0"
            style={{ border: 0 }}
            width="800"
            height="600"
            frameBorder="0"
            scrolling="no"
          ></iframe>
          <EventSyncStatus lastSyncedAt={lastSyncedAt} />
        </div>
      </div>

      <div>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold">Upcoming Events</h2>
        </div>
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Calendar className="mx-auto h-16 w-16 mb-6 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No upcoming events scheduled</h3>
            <p className="text-sm">Check back soon for new workshops and events!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} item={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
