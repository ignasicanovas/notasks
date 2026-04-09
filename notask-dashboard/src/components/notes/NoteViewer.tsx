import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useNotesStore } from "~store/notesStore"
import { useUIStore } from "~store/uiStore"
import type { Note } from "~types/note"

interface Props {
  note: Note
  isInbox: boolean
  onEdit: () => void
  onProcess: () => void
  isProcessing: boolean
}

export function NoteViewer({ note, isInbox, onEdit, onProcess, isProcessing }: Props) {
  const breadcrumbs = note.path.split("/").filter(Boolean)

  return (
    <div className="flex flex-col h-full relative">
      {/* Breadcrumb */}
      <div className="h-10 border-b border-outline-variant/20 flex items-center px-6 text-[11px] text-neutral-500 font-mono gap-1 shrink-0">
        {breadcrumbs.map((seg, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && (
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            )}
            <span className={i === breadcrumbs.length - 1 ? "text-neutral-300" : ""}>
              {seg}
            </span>
          </span>
        ))}
        <span className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
            Guardado
          </span>
          <span className="text-neutral-600 uppercase tracking-tighter font-bold">UTF-8</span>
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-12 py-10 max-w-4xl mx-auto w-full">
        <article className="md-content font-mono text-[14px] leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {note.content}
          </ReactMarkdown>
        </article>
      </div>

      {/* Floating action bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-neutral-900/80 backdrop-blur-md p-2 rounded-xl border border-outline-variant/30 shadow-2xl">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2 rounded-lg transition-all font-bold text-xs"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          Editar
        </button>

        {isInbox && (
          <>
            <div className="w-px h-4 bg-outline-variant/40" />
            <button
              onClick={onProcess}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-inverse-primary/20 hover:bg-inverse-primary/30 text-indigo-300 px-4 py-2 rounded-lg transition-all font-bold text-xs border border-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isProcessing ? "hourglass_empty" : "psychology"}
              </span>
              {isProcessing ? "Procesando..." : "Procesar con IA"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
