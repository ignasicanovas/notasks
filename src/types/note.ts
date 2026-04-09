export interface Note {
  /** Unique ID derived from the file path relative to root */
  id: string
  /** Display name without extension */
  title: string
  /** Relative path from root dir, e.g. "Trabajo/Reuniones/Q2" */
  path: string
  /** Full markdown content */
  content: string
  createdAt: number
  updatedAt: number
}

export interface FolderNode {
  name: string
  /** Full path from root, e.g. "Trabajo/Reuniones" */
  path: string
  children: FolderNode[]
  notes: Note[]
  isExpanded?: boolean
}

/** Virtual handle reference stored in state */
export interface NoteFileRef {
  noteId: string
  /** FileSystemFileHandle — stored in IndexedDB, not serializable to JSON */
  handle: FileSystemFileHandle
  dirHandle: FileSystemDirectoryHandle
}
