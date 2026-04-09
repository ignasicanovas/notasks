import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  closestCorners
} from "@dnd-kit/core"
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable"
import { useTasksStore } from "~store/tasksStore"
import { KanbanColumn } from "./KanbanColumn"
import { TaskCard } from "./TaskCard"
import type { Task } from "~types/task"

export function KanbanBoard() {
  const { tasks, columns, moveTask, reorderColumns, createColumn } = useTasksStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const taskId = active.id as string
    const overId = over.id as string

    // Check if dropped on a column
    const targetColumn = columns.find((c) => c.id === overId)
    if (targetColumn) {
      const tasksInCol = tasks
        .filter((t) => t.columnId === targetColumn.id)
        .sort((a, b) => a.order - b.order)
      const newOrder =
        tasksInCol.length > 0
          ? tasksInCol[tasksInCol.length - 1].order + 1
          : 0
      void moveTask(taskId, targetColumn.id, newOrder)
      return
    }

    // Check if dropped on another task
    const overTask = tasks.find((t) => t.id === overId)
    if (overTask) {
      void moveTask(taskId, overTask.columnId, overTask.order - 0.5)
    }
  }

  const handleAddColumn = async () => {
    const name = window.prompt("Nombre de la nueva columna:")
    if (!name?.trim()) return
    await createColumn({
      id: crypto.randomUUID(),
      name: name.trim(),
      order: columns.length
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-x-auto no-scrollbar p-6">
        <div className="flex gap-6 h-full items-start min-w-max">
          <SortableContext
            items={columns.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={tasks
                  .filter((t) => t.columnId === col.id)
                  .sort((a, b) => a.order - b.order)}
              />
            ))}
          </SortableContext>

          {/* Add column button */}
          <div className="w-72 shrink-0">
            <button
              onClick={handleAddColumn}
              className="w-full flex items-center justify-center gap-2 py-4 border border-dashed border-outline-variant/30 hover:border-outline-variant hover:bg-neutral-900/50 text-neutral-500 hover:text-neutral-300 transition-all duration-150"
            >
              <span className="material-symbols-outlined text-[18px]">add_column_right</span>
              <span className="font-mono text-[11px] font-bold uppercase">+ Columna</span>
            </button>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
