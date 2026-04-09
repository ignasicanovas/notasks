import { QuickNoteCapture } from "~components/quicknote/QuickNoteCapture"
import { CalendarPanel } from "~components/calendar/CalendarPanel"
import { useAIProcess } from "~hooks/useAIProcess"

interface Props {
  aiActivity?: string[]
}

export function RightPanel({ aiActivity = [] }: Props) {
  return (
    <div className="flex flex-col h-full text-xs font-sans overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800/50 shrink-0">
        <div className="text-neutral-400 uppercase tracking-widest text-[10px] font-bold">
          CONTEXT_PANEL
        </div>
        <div className="text-neutral-600 text-[9px] font-mono">v0.1.0 — LOCAL_ONLY</div>
      </div>

      {/* Quick note capture */}
      <div className="shrink-0">
        <QuickNoteCapture />
      </div>

      {/* AI activity log (shown only when there's activity) */}
      {aiActivity.length > 0 && (
        <div className="px-4 pb-4 shrink-0">
          <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-3">
            Actividad IA
          </p>
          <div className="space-y-2">
            {aiActivity.map((entry, i) => (
              <div key={i} className="flex gap-2">
                <div className="w-1 h-6 bg-indigo-500 rounded-full shrink-0 mt-0.5" />
                <p className="text-[11px] text-neutral-300 leading-snug">{entry}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar — takes remaining space */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <CalendarPanel />
      </div>
    </div>
  )
}
