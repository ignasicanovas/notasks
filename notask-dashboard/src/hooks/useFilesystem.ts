import { useCallback } from "react"
import { useNotesStore } from "~store/notesStore"
import { useUIStore } from "~store/uiStore"
import { useSettingsStore } from "~store/settingsStore"
import {
  readAllNotes,
  ensureSystemFolders,
  persistRootHandle,
  loadPersistedRootHandle,
  createNoteFile,
  ensureDirPath,
  moveNoteFile,
  deleteNoteFile
} from "~services/filesystem"
import { generateNoteId, inboxFilename } from "~utils/dateHelpers"
import type { Note } from "~types/note"

export function useFilesystem() {
  const {
    rootHandle,
    setRootHandle,
    setNotes,
    addNote,
    removeNote,
    fileHandles,
    dirHandles,
    setDirHandle,
    setFileHandle,
    setLoading,
    setError
  } = useNotesStore()
  const { setActiveNoteId } = useUIStore()
  const { setRootFolderName } = useSettingsStore()

  /** Ask the user to pick a folder and load all notes from it */
  const selectFolder = useCallback(async () => {
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" })
      await ensureSystemFolders(handle)
      await persistRootHandle(handle)
      setRootHandle(handle)
      setRootFolderName(handle.name)
      await scanFolder(handle)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return
      console.error("[useFilesystem] selectFolder error:", err)
    }
  }, [])

  /** Try to reconnect the previously selected folder */
  const tryReconnect = useCallback(async (): Promise<boolean> => {
    const handle = await loadPersistedRootHandle()
    if (!handle) return false
    setRootHandle(handle)
    setRootFolderName(handle.name)
    await scanFolder(handle)
    return true
  }, [])

  const scanFolder = useCallback(
    async (handle: FileSystemDirectoryHandle) => {
      setLoading(true)
      setError(null)
      try {
        const { notes, fileHandles: fh, dirHandles: dh } = await readAllNotes(handle)
        setNotes(notes)
        fh.forEach((v, k) => setFileHandle(k, v))
        dh.forEach((v, k) => setDirHandle(k, v))
      } catch (err) {
        setError("Error al leer la carpeta")
        console.error("[useFilesystem] scan error:", err)
      } finally {
        setLoading(false)
      }
    },
    [setNotes, setFileHandle, setDirHandle, setLoading, setError]
  )

  /** Refresh the note tree */
  const refresh = useCallback(async () => {
    if (!rootHandle) return
    await scanFolder(rootHandle)
  }, [rootHandle, scanFolder])

  /** Create a new blank note in the given folder path */
  const createNote = useCallback(
    async (folderPath: string, title?: string): Promise<Note | null> => {
      const root = rootHandle
      if (!root) return null

      const filename = title ?? inboxFilename()
      const dirHandle = await ensureDirPath(root, folderPath)
      const fileHandle = await createNoteFile(dirHandle, filename, `# ${filename}\n\n`)

      const notePath = folderPath ? `${folderPath}/${filename}` : filename
      const id = generateNoteId(notePath)
      const now = Date.now()

      const note: Note = {
        id,
        title: filename,
        path: notePath,
        content: `# ${filename}\n\n`,
        createdAt: now,
        updatedAt: now
      }

      addNote(note, fileHandle)
      setActiveNoteId(id)
      return note
    },
    [rootHandle, addNote, setActiveNoteId]
  )

  /** Move a note to _procesadas after AI processing */
  const archiveToProcessed = useCallback(
    async (noteId: string) => {
      const root = rootHandle
      if (!root) return

      const note = useNotesStore.getState().notes.find((n) => n.id === noteId)
      if (!note) return

      const sourceDirPath = note.path.split("/").slice(0, -1).join("/")
      const sourceDir =
        dirHandles.get(sourceDirPath) ??
        (await ensureDirPath(root, sourceDirPath))

      const destDir = await ensureDirPath(root, "_procesadas")
      const filename = note.title
      const newHandle = await moveNoteFile(sourceDir, destDir, filename)

      // Update state: remove old, add new with updated path
      removeNote(noteId)
      const newPath = `_procesadas/${filename}`
      const newId = generateNoteId(newPath)
      const updatedNote: Note = { ...note, id: newId, path: newPath }
      addNote(updatedNote, newHandle)
    },
    [rootHandle, dirHandles, removeNote, addNote]
  )

  /** Delete a note file and remove from state */
  const deleteNote = useCallback(
    async (noteId: string) => {
      const root = rootHandle
      if (!root) return

      const note = useNotesStore.getState().notes.find((n) => n.id === noteId)
      if (!note) return

      const dirPath = note.path.split("/").slice(0, -1).join("/")
      const dirHandle =
        dirHandles.get(dirPath) ?? (await ensureDirPath(root, dirPath))

      await deleteNoteFile(dirHandle, note.title)
      removeNote(noteId)
    },
    [rootHandle, dirHandles, removeNote]
  )

  return {
    selectFolder,
    tryReconnect,
    refresh,
    createNote,
    archiveToProcessed,
    deleteNote
  }
}
