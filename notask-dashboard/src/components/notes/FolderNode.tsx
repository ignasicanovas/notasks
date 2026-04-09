import { useUIStore } from "~store/uiStore"
import type { FolderNode as FolderNodeType } from "~types/note"
import { NoteItem } from "./NoteItem"

interface Props {
  node: FolderNodeType
  onSelectNote: (id: string) => void
  depth?: number
}

export function FolderNode({ node, onSelectNote, depth = 0 }: Props) {
  const { expandedFolders, toggleFolder } = useUIStore()
  const isExpanded = expandedFolders.has(node.path)
  const isSystem = node.name.startsWith("_")
  const hasChildren = node.children.length > 0 || node.notes.length > 0

  const inboxCount =
    node.name === "_inbox" ? node.notes.length : 0

  return (
    <div>
      {/* Folder row */}
      <button
        onClick={() => hasChildren && toggleFolder(node.path)}
        className={`w-full flex items-center gap-2 px-2 py-1 rounded transition-colors text-left group
          ${isSystem ? "text-neutral-400" : "text-neutral-400 hover:bg-neutral-800"}
        `}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {hasChildren ? (
          <span className="material-symbols-outlined text-[14px] shrink-0">
            {isExpanded ? "expand_more" : "chevron_right"}
          </span>
        ) : (
          <span className="w-[14px] shrink-0" />
        )}

        <span className="material-symbols-outlined text-[14px] shrink-0">
          {isSystem
            ? node.name === "_inbox"
              ? "inbox"
              : "task_alt"
            : isExpanded
            ? "folder_open"
            : "folder"}
        </span>

        <span className="truncate flex-1 text-[13px]">{node.name}</span>

        {inboxCount > 0 && (
          <span className="text-[10px] text-indigo-300 bg-indigo-900/30 px-1 rounded shrink-0">
            {inboxCount}
          </span>
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div
          className="border-l border-neutral-800 ml-4"
          style={{ marginLeft: `${16 + depth * 16}px` }}
        >
          {node.children.map((child) => (
            <FolderNode
              key={child.path}
              node={child}
              onSelectNote={onSelectNote}
              depth={depth + 1}
            />
          ))}
          {node.notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onSelect={() => onSelectNote(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
