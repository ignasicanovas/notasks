/**
 * filesystem.ts — File System Access API wrapper
 *
 * Security notes:
 * - All file operations use the user-granted FileSystemDirectoryHandle.
 * - No eval() or innerHTML with file content.
 * - Content is read as plain text and passed to react-markdown for rendering.
 * - We never execute file content.
 */

import { getSetting, setSetting } from "~db/settings"
import type { Note } from "~types/note"
import { generateNoteId } from "~utils/dateHelpers"

const ROOT_HANDLE_KEY = "rootDirHandle"
const SYSTEM_FOLDERS = ["_inbox", "_procesadas"]

// ── Directory Handle Persistence ────────────────────────────────────────────

export async function persistRootHandle(
  handle: FileSystemDirectoryHandle
): Promise<void> {
  await setSetting(ROOT_HANDLE_KEY, handle)
}

export async function loadPersistedRootHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle = await getSetting<FileSystemDirectoryHandle>(ROOT_HANDLE_KEY)
    if (!handle) return null

    // Check if we still have permission
    const perm = await handle.queryPermission({ mode: "readwrite" })
    if (perm === "granted") return handle

    // Try to request permission (only works if triggered by user gesture)
    const req = await handle.requestPermission({ mode: "readwrite" })
    return req === "granted" ? handle : null
  } catch {
    return null
  }
}

// ── Folder Setup ─────────────────────────────────────────────────────────────

export async function ensureSystemFolders(
  root: FileSystemDirectoryHandle
): Promise<void> {
  for (const folder of SYSTEM_FOLDERS) {
    await root.getDirectoryHandle(folder, { create: true })
  }
}

// ── Tree Reading ─────────────────────────────────────────────────────────────

interface ReadResult {
  notes: Note[]
  fileHandles: Map<string, FileSystemFileHandle>
  dirHandles: Map<string, FileSystemDirectoryHandle>
}

export async function readAllNotes(
  root: FileSystemDirectoryHandle
): Promise<ReadResult> {
  const notes: Note[] = []
  const fileHandles = new Map<string, FileSystemFileHandle>()
  const dirHandles = new Map<string, FileSystemDirectoryHandle>()

  await walkDirectory(root, "", notes, fileHandles, dirHandles)

  return { notes, fileHandles, dirHandles }
}

async function walkDirectory(
  dir: FileSystemDirectoryHandle,
  relativePath: string,
  notes: Note[],
  fileHandles: Map<string, FileSystemFileHandle>,
  dirHandles: Map<string, FileSystemDirectoryHandle>
): Promise<void> {
  dirHandles.set(relativePath, dir)

  for await (const [name, handle] of dir.entries()) {
    if (handle.kind === "file" && name.endsWith(".md")) {
      const file = await handle.getFile()
      const content = await file.text()
      const titleWithoutExt = name.replace(/\.md$/, "")
      const notePath = relativePath ? `${relativePath}/${titleWithoutExt}` : titleWithoutExt
      const id = generateNoteId(notePath)

      const note: Note = {
        id,
        title: titleWithoutExt,
        path: notePath,
        content,
        createdAt: file.lastModified,
        updatedAt: file.lastModified
      }

      notes.push(note)
      fileHandles.set(id, handle as FileSystemFileHandle)
    } else if (handle.kind === "directory") {
      const childPath = relativePath ? `${relativePath}/${name}` : name
      await walkDirectory(
        handle as FileSystemDirectoryHandle,
        childPath,
        notes,
        fileHandles,
        dirHandles
      )
    }
  }
}

// ── File Operations ──────────────────────────────────────────────────────────

export async function readNoteContent(
  handle: FileSystemFileHandle
): Promise<string> {
  const file = await handle.getFile()
  return file.text()
}

export async function writeNoteContent(
  handle: FileSystemFileHandle,
  content: string
): Promise<void> {
  const writable = await handle.createWritable()
  await writable.write(content)
  await writable.close()
}

export async function createNoteFile(
  dirHandle: FileSystemDirectoryHandle,
  filename: string,
  content: string
): Promise<FileSystemFileHandle> {
  const safeName = filename.endsWith(".md") ? filename : `${filename}.md`
  const handle = await dirHandle.getFileHandle(safeName, { create: true })
  await writeNoteContent(handle, content)
  return handle
}

export async function deleteNoteFile(
  dirHandle: FileSystemDirectoryHandle,
  filename: string
): Promise<void> {
  const safeName = filename.endsWith(".md") ? filename : `${filename}.md`
  await dirHandle.removeEntry(safeName)
}

/**
 * Moves a note file from one directory to another.
 * The File System Access API has no native move — we copy + delete.
 */
export async function moveNoteFile(
  sourceDir: FileSystemDirectoryHandle,
  destDir: FileSystemDirectoryHandle,
  filename: string
): Promise<FileSystemFileHandle> {
  const safeName = filename.endsWith(".md") ? filename : `${filename}.md`
  const sourceHandle = await sourceDir.getFileHandle(safeName)
  const content = await readNoteContent(sourceHandle)
  const destHandle = await createNoteFile(destDir, safeName, content)
  await sourceDir.removeEntry(safeName)
  return destHandle
}

/**
 * Ensures a nested directory path exists, creating folders as needed.
 * Returns the deepest DirectoryHandle.
 */
export async function ensureDirPath(
  root: FileSystemDirectoryHandle,
  path: string
): Promise<FileSystemDirectoryHandle> {
  const segments = path.split("/").filter(Boolean)
  let current = root
  for (const segment of segments) {
    current = await current.getDirectoryHandle(segment, { create: true })
  }
  return current
}

/**
 * Renames a .md file within the same directory.
 */
export async function renameNoteFile(
  dirHandle: FileSystemDirectoryHandle,
  oldName: string,
  newName: string
): Promise<FileSystemFileHandle> {
  const oldSafe = oldName.endsWith(".md") ? oldName : `${oldName}.md`
  const oldHandle = await dirHandle.getFileHandle(oldSafe)
  const content = await readNoteContent(oldHandle)
  const newHandle = await createNoteFile(dirHandle, newName, content)
  await dirHandle.removeEntry(oldSafe)
  return newHandle
}
