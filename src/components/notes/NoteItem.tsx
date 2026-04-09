import { useUIStore } from "~store/uiStore"
import type { Note } from "~types/note"

interface Props {
  note: Note
  onSelect: () => void
}

export function NoteItem({ note, onSelect }: Props) {
  const { activeNoteId } = useUIStore()
  const isActive = activeNoteId === note.id

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-2 px-2 py-1 text-left transition-colors rounded text-[13px]
        ${isActive
          ? "text-indigo-200 bg-neutral-800/30 border-l border-indigo-300"
          : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
        }
      `}
    >
      <span className="material-symbols-outlined text-[14px] shrink-0">description</span>
      <span className="truncate">{note.title}</span>
    </button>
  )
}
