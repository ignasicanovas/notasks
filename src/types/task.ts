export interface Task {
  id: string
  title: string
  description: string
  columnId: string
  /** Lower number = higher in the column */
  order: number
  /** Path of the note this task was extracted from, if any */
  sourceNotePath: string | null
  createdAt: number
}

export interface KanbanColumn {
  id: string
  name: string
  order: number
  color?: string
}

/** Discriminated union for all message types between AI suggestions and stores */
export type AISuggestion =
  | {
      type: "new_note"
      title: string
      /** e.g. "Trabajo/Proyectos/Alpha-Roadmap" */
      path: string
      content: string
    }
  | {
      type: "update_note"
      title: string
      /** Path of the existing note to update */
      existingNotePath: string
      /** Content to append/insert */
      content: string
      /** Where to insert: append, before_section, replace_section */
      position: "append" | "before_section" | "replace_section"
      /** Section heading to insert before/replace (if position !== append) */
      sectionHeading?: string
    }
  | {
      type: "task"
      title: string
      description: string
      /** Quote from original note that originated this task */
      sourceContext: string
    }

export interface AIProcessingResult {
  suggestions: AISuggestion[]
}
