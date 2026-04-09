import { getDB } from "./index"
import type { Task, KanbanColumn } from "~types/task"

// ── Tasks ──────────────────────────────────────────────────────────────────

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDB()
  return db.getAll("tasks")
}

export async function putTask(task: Task): Promise<void> {
  const db = await getDB()
  await db.put("tasks", task)
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB()
  await db.delete("tasks", id)
}

export async function getTasksByColumn(columnId: string): Promise<Task[]> {
  const db = await getDB()
  return db.getAllFromIndex("tasks", "by-column", columnId)
}

// ── Columns ────────────────────────────────────────────────────────────────

export async function getAllColumns(): Promise<KanbanColumn[]> {
  const db = await getDB()
  const cols = await db.getAll("columns")
  return cols.sort((a, b) => a.order - b.order)
}

export async function putColumn(column: KanbanColumn): Promise<void> {
  const db = await getDB()
  await db.put("columns", column)
}

export async function deleteColumn(id: string): Promise<void> {
  const db = await getDB()
  await db.delete("columns", id)
}
