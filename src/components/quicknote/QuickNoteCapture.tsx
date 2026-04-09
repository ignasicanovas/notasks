import { useState } from "react"
import { useFilesystem } from "~hooks/useFilesystem"
import { useNotesStore } from "~store/notesStore"
import { useUIStore } from "~store/uiStore"
import { writeNoteContent } from "~services/filesystem"
import { inboxFilename } from "~utils/dateHelpers"

export function QuickNoteCapture() {
  const [text, setText] = useState("")
  const [saving, setSaving] = useState(false)
  const { createNote } = useFilesystem()
  const { fileHandles } = useNotesStore()
  const { setActiveNoteId, setActiveView } = useUIStore()

  const handleSave = async () => {
    if (!text.trim()) return
    setSaving(true)
    try {
      const title = inboxFilename()
      const note = await createNote("_inbox", title)
      if (note) {
        // Write the actual content
        const handle = fileHandles.get(note.id)
        if (handle) {
          await writeNoteContent(handle, text)
        }
        setActiveNoteId(note.id)
        setActiveView("notes")
        setText("")
      }
    } catch (err) {
      console.error("[QuickNote] save error:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      void handleSave()
    }
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-indigo-200">
        <span className="material-symbols-outlined text-[18px]">bolt</span>
        <span className="font-bold text-xs">Nueva nota rápida</span>
      </div>

      <div className="bg-surface-container-highest border border-outline-variant/50 overflow-hidden transition-transform focus-within:scale-[0.99]">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe algo rápido..."
          className="w-full bg-transparent border-none outline-none p-3 text-neutral-300 font-mono text-[12px] h-32 resize-none placeholder:text-neutral-600 focus:ring-0"
        />
        <div className="p-2 flex justify-between items-center bg-neutral-900/50">
          <span className="text-[9px] text-neutral-600 font-mono">⌘+Enter para guardar</span>
          <button
            onClick={handleSave}
            disabled={!text.trim() || saving}
            className="bg-indigo-300 text-on-primary font-bold px-3 py-1 text-[11px] hover:bg-indigo-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  )
}
