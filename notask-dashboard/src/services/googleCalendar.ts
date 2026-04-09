/**
 * googleCalendar.ts — Google Calendar REST API
 *
 * Security notes:
 * - Token used only to call googleapis.com (validated via host_permissions).
 * - If the token is invalid (401), we trigger re-auth.
 */

import type { CalendarEvent } from "~types/calendar"

const BASE = "https://www.googleapis.com/calendar/v3"

export class CalendarAPIError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message)
    this.name = "CalendarAPIError"
  }
}

async function calFetch<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    throw new CalendarAPIError(`Google Calendar API error`, res.status)
  }
  return res.json() as Promise<T>
}

export async function getTodayEvents(token: string): Promise<CalendarEvent[]> {
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  const url = new URL(`${BASE}/calendars/primary/events`)
  url.searchParams.set("timeMin", start.toISOString())
  url.searchParams.set("timeMax", end.toISOString())
  url.searchParams.set("orderBy", "startTime")
  url.searchParams.set("singleEvents", "true")
  url.searchParams.set("maxResults", "20")

  const data = await calFetch<{ items?: CalendarEvent[] }>(
    url.toString(),
    token
  )
  return data.items ?? []
}

export async function getCalendarProfile(
  token: string
): Promise<{ email: string }> {
  return calFetch<{ email: string }>(
    `${BASE}/calendars/primary`,
    token
  )
}
