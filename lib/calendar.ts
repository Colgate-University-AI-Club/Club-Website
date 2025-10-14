import { v4 as uuidv4 } from 'uuid';
import type { EventItem, GoogleCalendarEvent, GoogleCalendarResponse } from './types';

/**
 * Fetches events from Google Calendar API v3
 * @param calendarId - Google Calendar ID
 * @param apiKey - Google Calendar API key
 * @param maxResults - Maximum number of events to fetch (default: 50)
 * @returns Array of EventItem objects
 */
export async function fetchCalendarEvents(
  calendarId: string,
  apiKey: string,
  maxResults: number = 50
): Promise<EventItem[]> {
  try {
    // Get current date in ISO format for timeMin parameter
    const now = new Date().toISOString();

    // Construct API URL
    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
    );

    url.searchParams.append('key', apiKey);
    url.searchParams.append('timeMin', now);
    url.searchParams.append('maxResults', maxResults.toString());
    url.searchParams.append('singleEvents', 'true');
    url.searchParams.append('orderBy', 'startTime');

    // Fetch events from Google Calendar API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Google Calendar API error: ${response.status} ${response.statusText}`
      );
    }

    const data: GoogleCalendarResponse = await response.json();

    // Map Google Calendar events to EventItem format
    const events: EventItem[] = data.items.map((event) =>
      mapGoogleEventToEventItem(event)
    );

    return events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
}

/**
 * Maps a Google Calendar event to EventItem format
 * @param event - Google Calendar event object
 * @returns EventItem object
 */
export function mapGoogleEventToEventItem(event: GoogleCalendarEvent): EventItem {
  // Extract start and end times (handle both all-day and timed events)
  const startsAt = event.start.dateTime || event.start.date || '';
  const endsAt = event.end.dateTime || event.end.date;

  // Parse RSVP URL from description
  const rsvpUrl = extractRsvpUrl(event.description);

  return {
    id: uuidv4(), // Generate unique ID for our system
    title: event.summary || 'Untitled Event',
    startsAt,
    endsAt,
    location: event.location,
    description: event.description,
    rsvpUrl,
    calendarEventId: event.id, // Store Google's event ID for reference
  };
}

/**
 * Extracts RSVP URL from event description
 * Looks for "RSVP:" followed by a URL or any URL in the description
 * @param description - Event description text
 * @returns RSVP URL if found, undefined otherwise
 */
export function extractRsvpUrl(description?: string): string | undefined {
  if (!description) {
    return undefined;
  }

  // Pattern 1: Look for "RSVP:" followed by a URL
  const rsvpPattern = /RSVP:\s*(https?:\/\/[^\s]+)/i;
  const rsvpMatch = description.match(rsvpPattern);

  if (rsvpMatch && rsvpMatch[1]) {
    return rsvpMatch[1].trim();
  }

  // Pattern 2: Look for any URL in the description (fallback)
  const urlPattern = /(https?:\/\/[^\s]+)/;
  const urlMatch = description.match(urlPattern);

  if (urlMatch && urlMatch[1]) {
    return urlMatch[1].trim();
  }

  return undefined;
}

/**
 * Determines if an event is an all-day event
 * @param event - Google Calendar event object
 * @returns true if all-day event, false if timed event
 */
export function isAllDayEvent(event: GoogleCalendarEvent): boolean {
  return !!event.start.date && !event.start.dateTime;
}
