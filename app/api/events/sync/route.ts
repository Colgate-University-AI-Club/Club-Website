import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fetchCalendarEvents } from '@/lib/calendar';
import type { EventItem } from '@/lib/types';
import type { NextRequest } from 'next/server';

const EVENTS_FILE_PATH = join(process.cwd(), 'app/data/events.json');

// Rate limiting: Track last sync time
let lastSyncTime = 0;
const SYNC_COOLDOWN_MS = 60 * 1000; // 1 minute

/**
 * POST /api/events/sync
 * Syncs events from Google Calendar to events.json
 * Can be triggered by:
 * - Vercel Cron Jobs (automatic, every 6 hours)
 * - Manual POST requests (for testing/on-demand sync)
 */
export async function POST(request: NextRequest) {
  // Check if request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  // Log the sync trigger source
  console.log(`[Events Sync] Triggered by: ${isVercelCron ? 'Vercel Cron' : 'Manual Request'}`);
  try {
    // Rate limiting check (skip for Vercel Cron requests)
    const now = Date.now();
    if (!isVercelCron && now - lastSyncTime < SYNC_COOLDOWN_MS) {
      const waitTime = Math.ceil((SYNC_COOLDOWN_MS - (now - lastSyncTime)) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit: Please wait ${waitTime} seconds before syncing again`,
        },
        { status: 429 }
      );
    }

    // Get environment variables
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;

    if (!calendarId || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required environment variables: GOOGLE_CALENDAR_ID or GOOGLE_CALENDAR_API_KEY',
        },
        { status: 500 }
      );
    }

    // Fetch events from Google Calendar
    const calendarEvents = await fetchCalendarEvents(calendarId, apiKey, 50);

    // Read existing events from file
    let existingEvents: EventItem[] = [];
    try {
      const fileContent = readFileSync(EVENTS_FILE_PATH, 'utf-8');
      const parsedData = JSON.parse(fileContent);
      // Handle both old format (array) and new format (object with events array)
      existingEvents = Array.isArray(parsedData) ? parsedData : parsedData.events || [];
    } catch {
      console.log('No existing events file found, creating new one');
      existingEvents = [];
    }

    // Separate manual events (without calendarEventId) from calendar events
    const manualEvents = existingEvents.filter((event) => !event.calendarEventId);
    const oldCalendarEvents = existingEvents.filter((event) => event.calendarEventId);

    // Create a map of calendar events by calendarEventId for easy lookup
    const calendarEventMap = new Map<string, EventItem>();
    calendarEvents.forEach((event) => {
      if (event.calendarEventId) {
        calendarEventMap.set(event.calendarEventId, event);
      }
    });

    // Update existing calendar events and track which ones are updated
    const updatedEvents: EventItem[] = [];
    const updatedEventIds = new Set<string>();

    oldCalendarEvents.forEach((oldEvent) => {
      if (oldEvent.calendarEventId && calendarEventMap.has(oldEvent.calendarEventId)) {
        // Event still exists in calendar, update it
        const updatedEvent = calendarEventMap.get(oldEvent.calendarEventId)!;
        // Preserve the original internal ID
        updatedEvent.id = oldEvent.id;
        updatedEvents.push(updatedEvent);
        updatedEventIds.add(oldEvent.calendarEventId);
      }
      // If event doesn't exist in calendar anymore, it's removed (not added to updatedEvents)
    });

    // Add new calendar events (ones not in updatedEventIds)
    const newEvents = calendarEvents.filter(
      (event) => event.calendarEventId && !updatedEventIds.has(event.calendarEventId)
    );

    // Combine all events: manual events + updated calendar events + new calendar events
    const allEvents = [...manualEvents, ...updatedEvents, ...newEvents];

    // Sort events by startsAt date (upcoming first)
    allEvents.sort((a, b) => {
      const dateA = new Date(a.startsAt).getTime();
      const dateB = new Date(b.startsAt).getTime();
      return dateA - dateB;
    });

    // Create data structure with metadata
    const eventsData = {
      lastSyncedAt: new Date().toISOString(),
      events: allEvents,
    };

    // Write back to file with pretty formatting
    writeFileSync(EVENTS_FILE_PATH, JSON.stringify(eventsData, null, 2));

    // Update last sync time
    lastSyncTime = now;

    // Calculate stats
    const removedCount = oldCalendarEvents.length - updatedEvents.length;

    return NextResponse.json({
      success: true,
      synced: calendarEvents.length,
      message: `Successfully synced ${calendarEvents.length} events from Google Calendar`,
      triggeredBy: isVercelCron ? 'Vercel Cron' : 'Manual Request',
      stats: {
        total: allEvents.length,
        fromCalendar: updatedEvents.length + newEvents.length,
        manual: manualEvents.length,
        new: newEvents.length,
        updated: updatedEvents.length,
        removed: removedCount,
      },
    });
  } catch (error) {
    console.error('Error syncing calendar events:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync calendar events',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
