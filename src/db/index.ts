import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { Task, KanbanColumn } from "~types/task"

interface NotaskDB extends DBSchema {
  /**
   * Key-value store for app settings.
   * Includes the FileSystemDirectoryHandle (stored as-is, not serialized).
   */
  settings: {
    key: string
    value: unknown
  }
  tasks: {
    key: string
    value: Task
    indexes: { "by-column": string }
  }
  columns: {
    key: string
    value: KanbanColumn
    indexes: { "by-order": number }
  }
}

const DB_NAME = "notask-db"
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<NotaskDB>> | null = null

export function getDB(): Promise<IDBPDatabase<NotaskDB>> {
  if (!dbPromise) {
    dbPromise = openDB<NotaskDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Settings store — generic key/value
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings")
        }

        // Tasks store
        if (!db.objectStoreNames.contains("tasks")) {
          const tasksStore = db.createObjectStore("tasks", { keyPath: "id" })
          tasksStore.createIndex("by-column", "columnId")
        }

        // Columns store
        if (!db.objectStoreNames.contains("columns")) {
          const colStore = db.createObjectStore("columns", { keyPath: "id" })
          colStore.createIndex("by-order", "order")
        }
      },
      blocked() {
        console.warn("[notask] DB upgrade blocked by another tab")
      },
      blocking() {
        dbPromise = null
      }
    })
  }
  return dbPromise
}

/** Seed default kanban columns if none exist */
export async function seedDefaultColumns(): Promise<void> {
  const db = await getDB()
  const existing = await db.getAll("columns")
  if (existing.length > 0) return

  const defaults: KanbanColumn[] = [
    { id: "col-todo", name: "Pendiente", order: 0 },
    { id: "col-doing", name: "En progreso", order: 1 },
    { id: "col-done", name: "Hecho", order: 2 }
  ]

  const tx = db.transaction("columns", "readwrite")
  await Promise.all([...defaults.map((c) => tx.store.put(c)), tx.done])
}
