export interface CalendarEvent {
  id: string
  summary: string
  location?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  hangoutLink?: string
  colorId?: string
}

export interface CalendarState {
  connected: boolean
  email: string | null
  events: CalendarEvent[]
  loading: boolean
  error: string | null
}
