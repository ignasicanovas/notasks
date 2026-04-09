import { useNotesStore } from "~store/notesStore"
import { useUIStore } from "~store/uiStore"
import { FolderNode } from "./FolderNode"
import { useFilesystem } from "~hooks/useFilesystem"

export function FolderTree() {
  const { folderTree, rootHandle } = useNotesStore()
  const { setActiveNoteId } = useUIStore()
  const { createNote } = useFilesystem()

  const handleNewNote = async () => {
    if (!rootHandle) return
    await createNote("_inbox")
  }

  const handleNewFolder = async () => {
    if (!rootHandle) return
    const name = window.prompt("Nombre de la carpeta:")
    if (!name?.trim()) return
    try {
      await rootHandle.getDirectoryHandle(name.trim(), { create: true })
      // Re-scan will be triggered by the filesystem hook
    } catch (err) {
      console.error("[FolderTree] Failed to create folder:", err)
    }
  }

  return (
    <div className="flex flex-col h-full font-mono text-[13px]">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800/50">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[14px] text-neutral-500">
            folder_shared
          </span>
          <span className="text-neutral-100 font-bold text-[11px] uppercase tracking-wider">
            NOTASK_FS
          </span>
        </div>
        {rootHandle && (
          <div className="text-neutral-600 text-[10px] truncate">
            {rootHandle.name}
          </div>
        )}
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {folderTree.length === 0 ? (
          <div className="px-2 py-4 text-neutral-600 text-[11px] text-center">
            Carpeta vacía
          </div>
        ) : (
          folderTree.map((node) => (
            <FolderNode
              key={node.path}
              node={node}
              onSelectNote={(id) => setActiveNoteId(id)}
            />
          ))
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t border-neutral-800 p-2 grid grid-cols-2 gap-1">
        <button
          onClick={handleNewFolder}
          className="flex items-center justify-center gap-1.5 py-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-all text-[11px]"
        >
          <span className="material-symbols-outlined text-[14px]">create_new_folder</span>
          + Carpeta
        </button>
        <button
          onClick={handleNewNote}
          className="flex items-center justify-center gap-1.5 py-1.5 rounded bg-neutral-800 text-indigo-300 hover:bg-neutral-700 transition-all text-[11px] font-bold"
        >
          <span className="material-symbols-outlined text-[14px]">note_add</span>
          + Nota
        </button>
      </div>
    </div>
  )
}
