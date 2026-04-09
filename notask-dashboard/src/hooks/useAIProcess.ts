import { useState, useCallback } from "react"
import { useSettingsStore } from "~store/settingsStore"
import { useNotesStore } from "~store/notesStore"
import { useTasksStore } from "~store/tasksStore"
import { processNoteWithClaude, ClaudeAPIError } from "~services/claude"
import { processNoteWithGemini, GeminiAPIError } from "~services/gemini"
import {
  createNoteFile,
  ensureDirPath,
  readNoteContent,
  writeNoteContent
} from "~services/filesystem"
import { generateNoteId } from "~utils/dateHelpers"
import type { AISuggestion } from "~types/task"
import type { Note } from "~types/note"

export interface ProcessingState {
  isProcessing: boolean
  suggestions: AISuggestion[]
  currentIndex: number
  error: string | null
}

export function useAIProcess() {
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    suggestions: [],
    currentIndex: 0,
    error: null
  })

  const { claudeApiKey, geminiApiKey, aiProvider } = useSettingsStore()
  const { notes, rootHandle, fileHandles, dirHandles, addNote, setFileHandle } =
    useNotesStore()
  const { createTask, columns } = useTasksStore()

  const startProcessing = useCallback(
    async (noteId: string) => {
      const activeKey = aiProvider === "gemini" ? geminiApiKey : claudeApiKey
      if (!activeKey) {
        const providerName = aiProvider === "gemini" ? "Gemini" : "Claude"
        setState((s) => ({
          ...s,
          error: `Configura tu ${providerName} API key en Ajustes antes de procesar.`
        }))
        return
      }

      const note = notes.find((n) => n.id === noteId)
      if (!note) return

      setState({ isProcessing: true, suggestions: [], currentIndex: 0, error: null })

      try {
        const existingPaths = notes.map((n) => n.path)
        const result =
          aiProvider === "gemini"
            ? await processNoteWithGemini(note.content, existingPaths, activeKey)
            : await processNoteWithClaude(note.content, existingPaths, activeKey)
        setState({
          isProcessing: false,
          suggestions: result.suggestions,
          currentIndex: 0,
          error: null
        })
      } catch (err) {
        const message =
          err instanceof ClaudeAPIError || err instanceof GeminiAPIError
            ? err.message
            : `Error al conectar con ${aiProvider === "gemini" ? "Gemini" : "Claude"} API`
        setState({ isProcessing: false, suggestions: [], currentIndex: 0, error: message })
      }
    },
    [claudeApiKey, geminiApiKey, aiProvider, notes]
  )

  /** Apply an approved suggestion and advance to the next */
  const approveSuggestion = useCallback(
    async (suggestion: AISuggestion) => {
      const root = rootHandle
      if (!root) return

      try {
        if (suggestion.type === "new_note") {
          const folderPath = suggestion.path.split("/").slice(0, -1).join("/")
          const filename = suggestion.path.split("/").pop() ?? suggestion.title
          const dirHandle = await ensureDirPath(root, folderPath)
          const fileHandle = await createNoteFile(dirHandle, filename, suggestion.content)
          const id = generateNoteId(suggestion.path)
          const now = Date.now()
          const note: Note = {
            id,
            title: filename,
            path: suggestion.path,
            content: suggestion.content,
            createdAt: now,
            updatedAt: now
          }
          addNote(note, fileHandle)
        } else if (suggestion.type === "update_note") {
          const existingNote = notes.find(
            (n) => n.path === suggestion.existingNotePath
          )
          if (existingNote) {
            const handle = fileHandles.get(existingNote.id)
            if (handle) {
              const current = await readNoteContent(handle)
              let updated: string
              if (suggestion.position === "append") {
                updated = `${current}\n\n${suggestion.content}`
              } else if (
                suggestion.position === "before_section" &&
                suggestion.sectionHeading
              ) {
                const idx = current.indexOf(`## ${suggestion.sectionHeading}`)
                updated =
                  idx !== -1
                    ? current.slice(0, idx) +
                      suggestion.content +
                      "\n\n" +
                      current.slice(idx)
                    : `${current}\n\n${suggestion.content}`
              } else {
                // replace_section
                updated = `${current}\n\n${suggestion.content}`
              }
              await writeNoteContent(handle, updated)
            }
          }
        } else if (suggestion.type === "task") {
          const defaultColumn = columns[0]
          if (defaultColumn) {
            await createTask({
              id: crypto.randomUUID(),
              title: suggestion.title,
              description: suggestion.description,
              columnId: defaultColumn.id,
              order: Date.now(),
              sourceNotePath: null,
              createdAt: Date.now()
            })
          }
        }
      } catch (err) {
        console.error("[useAIProcess] approveSuggestion error:", err)
      }

      // Advance
      setState((s) => ({
        ...s,
        currentIndex: s.currentIndex + 1
      }))
    },
    [rootHandle, notes, fileHandles, addNote, createTask, columns]
  )

  const discardSuggestion = useCallback(() => {
    setState((s) => ({ ...s, currentIndex: s.currentIndex + 1 }))
  }, [])

  const clearSuggestions = useCallback(() => {
    setState({ isProcessing: false, suggestions: [], currentIndex: 0, error: null })
  }, [])

  const isDone =
    state.suggestions.length > 0 &&
    state.currentIndex >= state.suggestions.length

  return {
    ...state,
    isDone,
    startProcessing,
    approveSuggestion,
    discardSuggestion,
    clearSuggestions
  }
}
