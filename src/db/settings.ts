import { getDB } from "./index"

/**
 * Store a value in the settings object store.
 * FileSystemDirectoryHandle is stored as-is (structured clone safe).
 */
export async function setSetting(key: string, value: unknown): Promise<void> {
  const db = await getDB()
  await db.put("settings", value, key)
}

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDB()
  return db.get("settings", key) as Promise<T | undefined>
}

export async function deleteSetting(key: string): Promise<void> {
  const db = await getDB()
  await db.delete("settings", key)
}
