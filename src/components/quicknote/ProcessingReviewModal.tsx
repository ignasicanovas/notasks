import { useState, useEffect } from "react"
import type { AISuggestion } from "~types/task"
import { useTasksStore } from "~store/tasksStore"

interface Props {
  suggestions: AISuggestion[]
  currentIndex: number
  onApprove: (suggestion: AISuggestion) => void
  onDiscard: () => void
  onDone: () => void
}

export function ProcessingReviewModal({
  suggestions,
  currentIndex,
  onApprove,
  onDiscard,
  onDone
}: Props) {
  const suggestion = suggestions[currentIndex]
  const isDone = currentIndex >= suggestions.length
  const progress = suggestions.length > 0 ? (currentIndex / suggestions.length) * 100 : 0

  // Local editable state for the current suggestion
  const [editedContent, setEditedContent] = useState("")
  const [editedTitle, setEditedTitle] = useState("")
  const [editedPath, setEditedPath] = useState("")
  const [editedColumnId, setEditedColumnId] = useState("")
  const { columns } = useTasksStore()

  useEffect(() => {
    if (!suggestion) return
    if (suggestion.type === "new_note") {
      setEditedContent(suggestion.content)
      setEditedTitle(suggestion.title)
      setEditedPath(suggestion.path)
    } else if (suggestion.type === "update_note") {
      setEditedContent(suggestion.content)
      setEditedTitle(suggestion.title)
      setEditedPath(suggestion.existingNotePath)
    } else if (suggestion.type === "task") {
      setEditedTitle(suggestion.title)
      setEditedColumnId(columns[0]?.id ?? "")
    }
  }, [suggestion, columns])

  if (isDone) return null

  const handleApprove = () => {
    if (!suggestion) return
    let edited: AISuggestion
    if (suggestion.type === "new_note") {
      edited = { ...suggestion, content: editedContent, title: editedTitle, path: editedPath }
    } else if (suggestion.type === "update_note") {
      edited = { ...suggestion, content: editedContent, title: editedTitle, existingNotePath: editedPath }
    } else {
      edited = { ...suggestion, title: editedTitle }
    }
    onApprove(edited)
  }

  const typeLabel =
    suggestion.type === "new_note"
      ? "📄 Nota nueva"
      : suggestion.type === "update_note"
      ? "✏️ Añadir a nota existente"
      : "✅ Tarea nueva"

  return (
    <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl bg-surface-container border border-outline-variant shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-outline-variant bg-surface-container-high shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-300">psychology</span>
            <span className="text-sm font-semibold text-neutral-100">Sugerencias de IA</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-500 tracking-wider">
            SUGERENCIA{" "}
            <span className="text-indigo-300">{currentIndex + 1}</span>{" "}
            DE{" "}
            <span className="text-neutral-400">{suggestions.length}</span>
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Type badge */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center px-2 py-1 bg-indigo-500/10 border border-indigo-500/30">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest font-label">
                TIPO: {typeLabel}
              </span>
            </div>
            <div className="text-[10px] font-mono text-neutral-500">
              claude-sonnet-4-6
            </div>
          </div>

          {/* Note fields */}
          {(suggestion.type === "new_note" || suggestion.type === "update_note") && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-label">
                  {suggestion.type === "new_note" ? "Ruta de destino" : "Nota a actualizar"}
                </label>
                <div className="bg-surface-container-highest border border-outline-variant px-3 py-2 font-mono text-xs text-neutral-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px] text-neutral-500">folder</span>
                  {suggestion.type === "new_note" ? (
                    <input
                      value={editedPath}
                      onChange={(e) => setEditedPath(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-indigo-300"
                      spellCheck={false}
                    />
                  ) : (
                    <span className="text-neutral-400">{suggestion.existingNotePath}</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-label">
                  Contenido sugerido (Markdown)
                </label>
                <div className="bg-surface-container-lowest border border-outline-variant focus-within:border-indigo-500/50 transition-colors">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    spellCheck={false}
                    className="w-full bg-transparent border-none outline-none p-4 font-mono text-sm text-neutral-200 leading-relaxed resize-none"
                    rows={12}
                  />
                </div>
              </div>
            </>
          )}

          {/* Task fields */}
          {suggestion.type === "task" && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-label">
                  Título
                </label>
                <input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant px-3 py-2 font-mono text-sm text-neutral-200 outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-label">
                  Columna
                </label>
                <select
                  value={editedColumnId}
                  onChange={(e) => setEditedColumnId(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant px-3 py-2 font-mono text-sm text-neutral-200 outline-none"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-label">
                  Contexto original
                </label>
                <div className="bg-surface-container-highest border border-outline-variant/40 px-3 py-2 font-mono text-xs text-neutral-500 italic">
                  "{suggestion.sourceContext}"
                </div>
              </div>
            </>
          )}

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>PROCESANDO COLA...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 bg-surface-container-highest w-full overflow-hidden">
              <div
                className="h-full bg-indigo-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-surface-container-high border-t border-outline-variant flex justify-end items-center gap-3 shrink-0">
          <button
            onClick={onDiscard}
            className="px-4 py-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-all font-label border border-transparent hover:border-neutral-700"
          >
            Descartar
          </button>
          <button
            onClick={handleApprove}
            className="px-5 py-1.5 text-xs font-bold bg-indigo-400 text-neutral-950 hover:bg-indigo-300 transition-all font-label flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">check_circle</span>
            Aprobar
          </button>
        </div>
      </div>
    </div>
  )
}
