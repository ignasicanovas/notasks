import type { CalendarEvent } from "~types/calendar"
import { formatEventRange, isEventNow } from "~utils/dateHelpers"

interface Props {
  event: CalendarEvent
}

export function EventItem({ event }: Props) {
  const timeStr = formatEventRange(event.start, event.end)
  const isNow = isEventNow(
    event.start as { dateTime?: string },
    event.end as { dateTime?: string }
  )

  return (
    <div
      className={`p-3 bg-neutral-900 rounded-r hover:bg-neutral-800 transition-colors cursor-pointer relative overflow-hidden
        ${isNow ? "border-l-2 border-indigo-300" : "border-l-2 border-neutral-700"}
      `}
    >
      <div
        className={`text-[10px] font-mono mb-1 ${
          isNow ? "text-indigo-300" : "text-neutral-400"
        }`}
      >
        {timeStr}
        {isNow && (
          <span className="ml-2 text-[9px] bg-indigo-900/30 text-indigo-300 px-1">
            AHORA
          </span>
        )}
      </div>
      <div className="text-neutral-200 font-bold text-[12px] leading-snug">
        {event.summary}
      </div>
      {event.location && (
        <div className="text-[10px] text-neutral-500 mt-1 truncate">
          {event.location}
        </div>
      )}
    </div>
  )
}
