import { create } from "zustand"
import type { Task, KanbanColumn } from "~types/task"
import { getAllTasks, getAllColumns, putTask, putColumn, deleteTask, deleteColumn } from "~db/tasks"
import { seedDefaultColumns } from "~db/index"

interface TasksState {
  tasks: Task[]
  columns: KanbanColumn[]
  isLoading: boolean

  loadAll: () => Promise<void>
  createTask: (task: Task) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  moveTask: (taskId: string, toColumnId: string, newOrder: number) => Promise<void>
  removeTask: (id: string) => Promise<void>
  createColumn: (column: KanbanColumn) => Promise<void>
  updateColumn: (id: string, updates: Partial<KanbanColumn>) => Promise<void>
  reorderColumns: (ordered: KanbanColumn[]) => Promise<void>
  removeColumn: (id: string) => Promise<void>
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  columns: [],
  isLoading: false,

  loadAll: async () => {
    set({ isLoading: true })
    try {
      await seedDefaultColumns()
      const [tasks, columns] = await Promise.all([getAllTasks(), getAllColumns()])
      set({ tasks, columns })
    } catch (err) {
      console.error("[tasks] Failed to load:", err)
    } finally {
      set({ isLoading: false })
    }
  },

  createTask: async (task) => {
    await putTask(task)
    set((s) => ({ tasks: [...s.tasks, task] }))
  },

  updateTask: async (id, updates) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return
    const updated = { ...task, ...updates }
    await putTask(updated)
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? updated : t)) }))
  },

  moveTask: async (taskId, toColumnId, newOrder) => {
    const task = get().tasks.find((t) => t.id === taskId)
    if (!task) return
    const updated: Task = { ...task, columnId: toColumnId, order: newOrder }
    // Optimistic update first
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? updated : t))
    }))
    await putTask(updated)
  },

  removeTask: async (id) => {
    await deleteTask(id)
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
  },

  createColumn: async (column) => {
    await putColumn(column)
    set((s) => ({
      columns: [...s.columns, column].sort((a, b) => a.order - b.order)
    }))
  },

  updateColumn: async (id, updates) => {
    const col = get().columns.find((c) => c.id === id)
    if (!col) return
    const updated = { ...col, ...updates }
    await putColumn(updated)
    set((s) => ({
      columns: s.columns
        .map((c) => (c.id === id ? updated : c))
        .sort((a, b) => a.order - b.order)
    }))
  },

  reorderColumns: async (ordered) => {
    const withOrder = ordered.map((c, i) => ({ ...c, order: i }))
    set({ columns: withOrder })
    await Promise.all(withOrder.map((c) => putColumn(c)))
  },

  removeColumn: async (id) => {
    await deleteColumn(id)
    set((s) => ({ columns: s.columns.filter((c) => c.id !== id) }))
  }
}))
