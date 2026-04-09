import { useEffect, useState } from "react"
import "~style.css"

import { RootLayout } from "~components/layout/RootLayout"
import { RightPanel } from "~components/layout/RightPanel"
import { EmptyState } from "~components/layout/EmptyState"
import { FolderTree } from "~components/notes/FolderTree"
import { NoteViewer } from "~components/notes/NoteViewer"
import { NoteEditor } from "~components/notes/NoteEditor"
import { ProcessingReviewModal } from "~components/quicknote/ProcessingReviewModal"
import { KanbanBoard } from "~components/kanban/KanbanBoard"
import { SettingsModal } from "~components/settings/SettingsModal"

import { useUIStore } from "~store/uiStore"
import { useNotesStore } from "~store/notesStore"
import { useTasksStore } from "~store/tasksStore"
import { useSettingsStore } from "~store/settingsStore"
import { useFilesystem } from "~hooks/useFilesystem"
import { useAIProcess } from "~hooks/useAIProcess"

function NotaskApp() {
  const { activeView, activeNoteId, darkMode, loadDarkMode } = useUIStore()
  const { notes, rootHandle } = useNotesStore()
  const { loadAll } = useTasksStore()
  const { loadSettings } = useSettingsStore()
  const { tryReconnect, archiveToProcessed } = useFilesystem()
  const [isEditing, setIsEditing] = useState(false)
  const [aiActivityLog, setAiActivityLog] = useState<string[]>([])

  const {
    isProcessing,
    suggestions,
    currentIndex,
    error: aiError,
    isDone,
    startProcessing,
    approveSuggestion,
    discardSuggestion,
    clearSuggestions
  } = useAIProcess()

  // Bootstrap on mount
  useEffect(() => {
    void loadDarkMode()
    void loadSettings()
    void loadAll()
    void tryReconnect()
  }, [])

  // Reset edit mode when note changes
  useEffect(() => {
    setIsEditing(false)
  }, [activeNoteId])

  // Handle AI done — archive note
  useEffect(() => {
    if (!isDone || !activeNoteId) return
    void archiveToProcessed(activeNoteId).then(() => {
      setAiActivityLog((prev) => [
        `Nota procesada y archivada`,
        ...prev.slice(0, 4)
      ])
    })
    clearSuggestions()
  }, [isDone, activeNoteId, archiveToProcessed, clearSuggestions])

  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null
  const isInboxNote = activeNote?.path.startsWith("_inbox") ?? false

  const handleProcessNote = async () => {
    if (!activeNoteId) return
    setAiActivityLog((prev) => ["Generando sugerencias...", ...prev.slice(0, 4)])
    await startProcessing(activeNoteId)
  }

  // Main area content
  const mainContent = (() => {
    if (!rootHandle) return <EmptyState />

    if (activeView === "kanban") {
      return (
        <div className="flex flex-col h-full">
          <KanbanBoard />
        </div>
      )
    }

    // Notes view
    if (!activeNote) {
      return (
        <div className="flex-1 flex items-center justify-center text-neutral-600 font-mono text-sm">
          Selecciona una nota o crea una nueva
        </div>
      )
    }

    return (
      <div className="flex-1 flex flex-col h-full relative">
        {isEditing ? (
          <NoteEditor note={activeNote} onClose={() => setIsEditing(false)} />
        ) : (
          <NoteViewer
            note={activeNote}
            isInbox={isInboxNote}
            onEdit={() => setIsEditing(true)}
            onProcess={handleProcessNote}
            isProcessing={isProcessing}
          />
        )}

        {/* AI Review Modal — overlays the main area */}
        {suggestions.length > 0 && !isDone && (
          <ProcessingReviewModal
            suggestions={suggestions}
            currentIndex={currentIndex}
            onApprove={(s) => {
              void approveSuggestion(s)
              setAiActivityLog((prev) => [
                `Aprobado: ${s.type === "task" ? s.title : s.title}`,
                ...prev.slice(0, 4)
              ])
            }}
            onDiscard={() => {
              discardSuggestion()
              setAiActivityLog((prev) => ["Sugerencia descartada", ...prev.slice(0, 4)])
            }}
            onDone={clearSuggestions}
          />
        )}

        {aiError && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-error-container text-on-error-container text-xs font-mono px-4 py-2 border border-error-dim/40">
            {aiError}
          </div>
        )}
      </div>
    )
  })()

  return (
    <div
      id="notask-root"
      className={darkMode ? "dark" : ""}
    >
      <RootLayout
        sidebar={<FolderTree />}
        main={mainContent}
        rightPanel={<RightPanel aiActivity={aiActivityLog} />}
      />
      <SettingsModal />
    </div>
  )
}

export default NotaskApp
