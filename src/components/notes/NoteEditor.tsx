import { useState, useEffect, useRef, useCallback } from "react"
import type { Note } from "~types/note"
import { useNotesStore } from "~store/notesStore"
import { writeNoteContent } from "~services/filesystem"

interface Props {
  note: Note
  onClose: () => void
}

const DEBOUNCE_MS = 500

type SaveStatus = "idle" | "saving" | "saved" | "error"

export function NoteEditor({ note, onClose }: Props) {
  const [content, setContent] = useState(note.content)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const { fileHandles, updateNote } = useNotesStore()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(
    async (value: string) => {
      const handle = fileHandles.get(note.id)
      if (!handle) return
      setSaveStatus("saving")
      try {
        await writeNoteContent(handle, value)
        updateNote(note.id, value, Date.now())
        setSaveStatus("saved")
      } catch (err) {
        console.error("[NoteEditor] Save failed:", err)
        setSaveStatus("error")
      }
    },
    [note.id, fileHandles, updateNote]
  )

  // Debounced autosave
  useEffect(() => {
    if (content === note.content) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(content), DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [content, note.content, save])

  const breadcrumbs = note.path.split("/").filter(Boolean)

  return (
    <div className="flex flex-col h-full">
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
        <span className="ml-auto flex items-center gap-3 text-[10px]">
          {saveStatus === "saving" && (
            <span className="text-neutral-500">Guardando...</span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-neutral-500">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
              Guardado
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-error-dim">Error al guardar</span>
          )}
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">visibility</span>
            Vista previa
          </button>
        </span>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        spellCheck={false}
        className="flex-1 bg-transparent border-none outline-none resize-none px-12 py-10 font-mono text-[14px] text-neutral-200 leading-relaxed placeholder:text-neutral-600 max-w-4xl mx-auto w-full"
        placeholder="Escribe en markdown..."
        autoFocus
      />
    </div>
  )
}
