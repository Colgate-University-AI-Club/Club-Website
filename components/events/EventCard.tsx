import { EventItem } from '@/lib/types'
import { formatDateTime, isUpcoming } from '@/lib/date'

interface EventCardProps {
  item: EventItem
}

export default function EventCard({ item }: EventCardProps) {
  const upcoming = isUpcoming(item.startsAt)

  return (
    <article className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          upcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {upcoming ? 'Upcoming' : 'Past'}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.title}</h3>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600 text-sm">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
          </svg>
          {formatDateTime(item.startsAt)}
          {item.endsAt && ` - ${formatDateTime(item.endsAt)}`}
        </div>

        {item.location && (
          <div className="flex items-center text-gray-600 text-sm">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {item.location}
          </div>
        )}
      </div>

      {item.description && (
        <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>
      )}

      {item.rsvpUrl && upcoming && (
        <a
          href={item.rsvpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
        >
          RSVP
          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </article>
  )
}