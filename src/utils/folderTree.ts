import type { Note, FolderNode } from "~types/note"

/**
 * Builds a virtual folder tree from a flat array of notes.
 * A note with path "Trabajo/Reuniones/Q2" produces:
 *   root → Trabajo → Reuniones → [note Q2]
 *
 * Notes at the root level (no "/" in path) go directly into root.children
 * as leaf nodes with an empty children array.
 */
export function buildFolderTree(notes: Note[]): FolderNode[] {
  const root: FolderNode = { name: "root", path: "", children: [], notes: [] }

  for (const note of notes) {
    const segments = note.path.split("/").filter(Boolean)
    // Last segment is the note title/filename — everything before is folders
    const folderSegments = segments.slice(0, -1)
    insertNote(root, folderSegments, note)
  }

  return sortNode(root).children
}

function insertNote(
  node: FolderNode,
  folderSegments: string[],
  note: Note
): void {
  if (folderSegments.length === 0) {
    node.notes.push(note)
    return
  }

  const [head, ...rest] = folderSegments
  let child = node.children.find((c) => c.name === head)

  if (!child) {
    const childPath = node.path ? `${node.path}/${head}` : head
    child = { name: head, path: childPath, children: [], notes: [] }
    node.children.push(child)
  }

  insertNote(child, rest, note)
}

function sortNode(node: FolderNode): FolderNode {
  node.children = node.children
    .map(sortNode)
    .sort((a, b) => {
      // System folders (_inbox, _procesadas) always first
      const aSystem = a.name.startsWith("_")
      const bSystem = b.name.startsWith("_")
      if (aSystem && !bSystem) return -1
      if (!aSystem && bSystem) return 1
      return a.name.localeCompare(b.name)
    })

  node.notes = node.notes.sort((a, b) => a.title.localeCompare(b.title))
  return node
}

/** Returns the folder path prefix for a note path */
export function getFolderPath(notePath: string): string {
  const segments = notePath.split("/").filter(Boolean)
  return segments.slice(0, -1).join("/")
}

/** Returns the filename (last segment without extension) */
export function getNoteFilename(notePath: string): string {
  const segments = notePath.split("/").filter(Boolean)
  return segments[segments.length - 1] ?? notePath
}
