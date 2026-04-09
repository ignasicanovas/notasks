import { create } from "zustand"
import type { Note, FolderNode } from "~types/note"
import { buildFolderTree } from "~utils/folderTree"

interface NotesState {
  notes: Note[]
  folderTree: FolderNode[]
  /** Map from noteId → FileSystemFileHandle */
  fileHandles: Map<string, FileSystemFileHandle>
  /** Map from folder path → FileSystemDirectoryHandle */
  dirHandles: Map<string, FileSystemDirectoryHandle>
  rootHandle: FileSystemDirectoryHandle | null
  isLoading: boolean
  error: string | null

  setRootHandle: (handle: FileSystemDirectoryHandle) => void
  setNotes: (notes: Note[]) => void
  addNote: (note: Note, fileHandle: FileSystemFileHandle) => void
  updateNote: (id: string, content: string, updatedAt: number) => void
  removeNote: (id: string) => void
  setFileHandle: (noteId: string, handle: FileSystemFileHandle) => void
  setDirHandle: (path: string, handle: FileSystemDirectoryHandle) => void
  setLoading: (v: boolean) => void
  setError: (err: string | null) => void
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  folderTree: [],
  fileHandles: new Map(),
  dirHandles: new Map(),
  rootHandle: null,
  isLoading: false,
  error: null,

  setRootHandle: (handle) => set({ rootHandle: handle }),

  setNotes: (notes) =>
    set({ notes, folderTree: buildFolderTree(notes) }),

  addNote: (note, fileHandle) => {
    const handles = new Map(get().fileHandles)
    handles.set(note.id, fileHandle)
    const notes = [...get().notes, note]
    set({ notes, folderTree: buildFolderTree(notes), fileHandles: handles })
  },

  updateNote: (id, content, updatedAt) => {
    const notes = get().notes.map((n) =>
      n.id === id ? { ...n, content, updatedAt } : n
    )
    set({ notes, folderTree: buildFolderTree(notes) })
  },

  removeNote: (id) => {
    const handles = new Map(get().fileHandles)
    handles.delete(id)
    const notes = get().notes.filter((n) => n.id !== id)
    set({ notes, folderTree: buildFolderTree(notes), fileHandles: handles })
  },

  setFileHandle: (noteId, handle) => {
    const handles = new Map(get().fileHandles)
    handles.set(noteId, handle)
    set({ fileHandles: handles })
  },

  setDirHandle: (path, handle) => {
    const dirs = new Map(get().dirHandles)
    dirs.set(path, handle)
    set({ dirHandles: dirs })
  },

  setLoading: (v) => set({ isLoading: v }),
  setError: (err) => set({ error: err })
}))
