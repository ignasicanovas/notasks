import { create } from "zustand"

export type ActiveView = "notes" | "kanban"

interface UIState {
  activeView: ActiveView
  sidebarCollapsed: boolean
  darkMode: boolean
  settingsOpen: boolean
  activeNoteId: string | null
  expandedFolders: Set<string>

  setActiveView: (view: ActiveView) => void
  setSidebarCollapsed: (v: boolean) => void
  toggleDarkMode: () => void
  setSettingsOpen: (v: boolean) => void
  setActiveNoteId: (id: string | null) => void
  toggleFolder: (path: string) => void
  setDarkMode: (v: boolean) => void
  loadDarkMode: () => Promise<void>
}

const saveDarkMode = (value: boolean) => {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    chrome.storage.local.set({ darkMode: value })
  }
}

export const useUIStore = create<UIState>((set, get) => ({
  activeView: "notes",
  sidebarCollapsed: false,
  darkMode: true,
  settingsOpen: false,
  activeNoteId: null,
  expandedFolders: new Set(),

  setActiveView: (view) => set({ activeView: view }),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  toggleDarkMode: () => {
    const next = !get().darkMode
    saveDarkMode(next)
    set({ darkMode: next })
  },
  setSettingsOpen: (v) => set({ settingsOpen: v }),
  setActiveNoteId: (id) => set({ activeNoteId: id }),
  setDarkMode: (v) => {
    saveDarkMode(v)
    set({ darkMode: v })
  },
  toggleFolder: (path) =>
    set((s) => {
      const next = new Set(s.expandedFolders)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return { expandedFolders: next }
    }),
  loadDarkMode: async () => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) return
    return new Promise<void>((resolve) => {
      chrome.storage.local.get(["darkMode"], (result) => {
        if (result.darkMode !== undefined) {
          set({ darkMode: result.darkMode as boolean })
        }
        resolve()
      })
    })
  }
}))
