import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useTasksStore } from "~store/tasksStore"
import { TaskCard } from "./TaskCard"
import type { KanbanColumn as KanbanColumnType, Task } from "~types/task"

interface Props {
  column: KanbanColumnType
  tasks: Task[]
}

export function KanbanColumn({ column, tasks }: Props) {
  const { updateColumn, removeColumn, createTask } = useTasksStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(column.name)

  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const isActive = column.name === "En progreso"

  const handleRename = async () => {
    if (editName.trim() && editName !== column.name) {
      await updateColumn(column.id, { name: editName.trim() })
    }
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (tasks.length > 0) {
      const confirmed = window.confirm(
        `La columna "${column.name}" tiene ${tasks.length} tarea(s). ¿Eliminar igualmente?`
      )
      if (!confirmed) return
    }
    await removeColumn(column.id)
  }

  const handleAddTask = async () => {
    const title = window.prompt("Título de la tarea:")
    if (!title?.trim()) return
    await createTask({
      id: crypto.randomUUID(),
      title: title.trim(),
      description: "",
      columnId: column.id,
      order: tasks.length,
      sourceNotePath: null,
      createdAt: Date.now()
    })
  }

  return (
    <div className="w-72 flex flex-col shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-4 px-2 group">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              className="text-[11px] font-bold uppercase tracking-widest bg-surface-container-highest border border-indigo-500/50 px-2 py-0.5 text-neutral-200 outline-none w-32"
              autoFocus
            />
          ) : (
            <h2
              className={`text-[11px] font-bold uppercase tracking-widest ${
                isActive ? "text-indigo-300" : "text-neutral-400"
              }`}
            >
              {column.name}
            </h2>
          )}
          <span
            className={`text-[10px] px-1.5 py-0.5 ${
              isActive
                ? "bg-primary-container/20 text-indigo-300"
                : "bg-neutral-800 text-neutral-500"
            }`}
          >
            {tasks.length}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="text-neutral-600 hover:text-neutral-300 transition-colors"
            title="Renombrar"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="text-neutral-600 hover:text-error-dim transition-colors"
            title="Eliminar columna"
          >
            <span className="material-symbols-outlined text-[14px]">delete</span>
          </button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-3 min-h-[200px] transition-colors ${
          isOver ? "bg-indigo-500/5" : ""
        }`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center h-24 border border-dashed border-outline-variant/20 opacity-30">
            <span className="material-symbols-outlined text-neutral-600">inventory_2</span>
            <span className="text-[10px] mt-2 font-mono">Drop items here</span>
          </div>
        )}

        {/* Add task */}
        <button
          onClick={handleAddTask}
          className="border border-dashed border-outline-variant/50 p-2 text-[11px] text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/30 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[14px]">add</span>
          Nueva Tarea
        </button>
      </div>
    </div>
  )
}
