/**
 * Formats a Calendar event time for display.
 * Returns "HH:MM" from an ISO dateTime string.
 */
export function formatEventTime(dateTime?: string, date?: string): string {
  if (dateTime) {
    return new Date(dateTime).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    })
  }
  if (date) {
    // All-day event
    return "Todo el día"
  }
  return ""
}

export function formatEventRange(
  start: { dateTime?: string; date?: string },
  end: { dateTime?: string; date?: string }
): string {
  const s = formatEventTime(start.dateTime, start.date)
  const e = formatEventTime(end.dateTime, end.date)
  if (s === "Todo el día") return s
  return `${s} — ${e}`
}

export function todayLabel(): string {
  return new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long"
  })
}

export function isEventNow(start: { dateTime?: string }, end: { dateTime?: string }): boolean {
  if (!start.dateTime || !end.dateTime) return false
  const now = Date.now()
  return (
    new Date(start.dateTime).getTime() <= now &&
    new Date(end.dateTime).getTime() >= now
  )
}

export function generateNoteId(path: string): string {
  return path.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()
}

export function inboxFilename(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-nota-rapida`
}
