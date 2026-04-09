import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useTasksStore } from "~store/tasksStore"
import type { Task } from "~types/task"

interface Props {
  task: Task
  isDragging?: boolean
}

export function TaskCard({ task, isDragging = false }: Props) {
  const { removeTask } = useTasksStore()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.3 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-surface-container p-3 border border-outline-variant/30 hover:border-primary/40 hover:bg-surface-bright transition-all cursor-grab active:cursor-grabbing group relative ${
        isDragging ? "shadow-2xl rotate-1 scale-105" : ""
      }`}
    >
      {/* Status ribbon */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary opacity-50" />

      <div className="flex items-start justify-between gap-2 pl-2">
        <p className="font-mono text-sm text-on-surface leading-snug">{task.title}</p>
        {task.sourceNotePath && (
          <span
            className="material-symbols-outlined text-[14px] text-neutral-500 shrink-0"
            title={`Desde: ${task.sourceNotePath}`}
          >
            description
          </span>
        )}
      </div>

      {task.description && (
        <p className="text-[11px] text-neutral-500 mt-2 pl-2 font-mono leading-snug">
          {task.description}
        </p>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation()
          void removeTask(task.id)
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-600 hover:text-error-dim"
        title="Eliminar tarea"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
      </button>
    </div>
  )
}
