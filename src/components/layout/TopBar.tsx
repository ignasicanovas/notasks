import { useUIStore } from "~store/uiStore"
import { useSettingsStore } from "~store/settingsStore"

export function TopBar() {
  const { activeView, setActiveView, toggleDarkMode, darkMode, setSettingsOpen } = useUIStore()
  const { rootFolderName } = useSettingsStore()

  return (
    <header className="bg-neutral-950 border-b border-neutral-800 h-12 flex items-center justify-between px-4 shrink-0 z-50">
      <div className="flex items-center gap-6">
        <span className="text-lg font-bold tracking-tighter text-neutral-100 font-headline">
          Notask
        </span>
        {rootFolderName && (
          <span className="text-[10px] text-neutral-600 font-mono hidden sm:block">
            {rootFolderName}
          </span>
        )}
        <nav className="flex gap-4 items-center">
          <button
            onClick={() => setActiveView("notes")}
            className={`text-xs tracking-tight pb-1 transition-colors ${
              activeView === "notes"
                ? "text-indigo-300 border-b-2 border-indigo-300"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Notas
          </button>
          <button
            onClick={() => setActiveView("kanban")}
            className={`text-xs tracking-tight pb-1 transition-colors ${
              activeView === "kanban"
                ? "text-indigo-300 border-b-2 border-indigo-300"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Kanban
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleDarkMode}
          title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className="p-1.5 hover:bg-neutral-800/50 transition-colors rounded text-neutral-400 hover:text-neutral-200"
        >
          <span className="material-symbols-outlined">
            {darkMode ? "light_mode" : "dark_mode"}
          </span>
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          title="Ajustes"
          className="p-1.5 hover:bg-neutral-800/50 transition-colors rounded text-neutral-400 hover:text-neutral-200"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  )
}
