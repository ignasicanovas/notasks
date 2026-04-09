import { useCalendar } from "~hooks/useCalendar"
import { EventItem } from "./EventItem"
import { todayLabel } from "~utils/dateHelpers"

export function CalendarPanel() {
  const { connected, events, loading, error, connect, refresh } = useCalendar()

  return (
    <div className="flex flex-col flex-1 overflow-hidden p-4 pt-2">
      <hr className="border-neutral-800 mb-4" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-indigo-200">
          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          <span className="font-bold text-xs capitalize">{todayLabel()}</span>
        </div>
        {connected && (
          <button
            onClick={refresh}
            title="Actualizar"
            className="text-neutral-600 hover:text-neutral-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
          </button>
        )}
      </div>

      {!connected && (
        <button
          onClick={connect}
          disabled={loading}
          className="w-full border border-outline-variant/40 py-2 text-[11px] text-neutral-500 hover:text-neutral-300 hover:border-indigo-500/30 transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "[ Conectando... ]" : "[ Conectar Google Calendar ]"}
        </button>
      )}

      {connected && loading && (
        <div className="text-neutral-600 text-[11px] font-mono text-center py-4">
          Cargando eventos...
        </div>
      )}

      {error && (
        <div className="text-error-dim text-[11px] font-mono px-1 py-2">
          {error}
        </div>
      )}

      {connected && !loading && events.length === 0 && !error && (
        <div className="text-neutral-600 text-[11px] font-mono text-center py-4">
          Sin eventos hoy
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        {events.map((event) => (
          <EventItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}
