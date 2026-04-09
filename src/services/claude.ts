/**
 * claude.ts — Anthropic API service
 *
 * Security notes:
 * - API key is decrypted in memory and sent ONLY to api.anthropic.com.
 * - Never logged, never stored in DOM.
 * - Response is parsed as JSON only — no eval().
 */

import type { AIProcessingResult } from "~types/task"

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"
const MODEL = "claude-sonnet-4-6"
const MAX_TOKENS = 4096

function buildPrompt(noteContent: string, existingNotePaths: string[]): string {
  const pathsList =
    existingNotePaths.length > 0
      ? existingNotePaths.map((p) => `- ${p}`).join("\n")
      : "(ninguna nota existente aún)"

  return `Eres un asistente personal que organiza notas de trabajo y vida personal.

El usuario tiene las siguientes notas existentes (rutas):
${pathsList}

Nueva nota a procesar:
---
${noteContent}
---

Tu tarea:
1. Extrae información estructurada de la nota.
2. Sugiere crear notas nuevas, actualizar notas existentes, o crear tareas según corresponda.
3. Para "update_note", solo úsalo si la nota existente es claramente relacionada.
4. Para "task", extrae acciones concretas y pendientes.

Devuelve SOLO un objeto JSON válido con esta estructura exacta:
{
  "suggestions": [
    {
      "type": "new_note",
      "title": "Título de la nota",
      "path": "Carpeta/Subcarpeta/Titulo",
      "content": "# Título\\n\\nContenido en markdown..."
    },
    {
      "type": "update_note",
      "title": "Título descriptivo del cambio",
      "existingNotePath": "ruta/exacta/de/nota/existente",
      "content": "## Sección nueva\\n\\n- Punto añadido",
      "position": "append",
      "sectionHeading": null
    },
    {
      "type": "task",
      "title": "Acción concreta a realizar",
      "description": "Contexto adicional si lo hay",
      "sourceContext": "Cita textual de la nota original"
    }
  ]
}

No incluyas ningún texto fuera del JSON. No uses markdown fences.`
}

export class ClaudeAPIError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message)
    this.name = "ClaudeAPIError"
  }
}

export async function processNoteWithClaude(
  noteContent: string,
  existingNotePaths: string[],
  apiKey: string
): Promise<AIProcessingResult> {
  const response = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Security: key sent only to api.anthropic.com via host_permissions
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: buildPrompt(noteContent, existingNotePaths)
        }
      ]
    })
  })

  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const errBody = await response.json() as { error?: { message?: string } }
      message = errBody?.error?.message ?? message
    } catch {
      // ignore parse error
    }
    throw new ClaudeAPIError(message, response.status)
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>
  }

  const text = data.content.find((c) => c.type === "text")?.text ?? ""

  // Defensively strip any accidental markdown fences
  const jsonStr = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim()

  try {
    const parsed = JSON.parse(jsonStr) as AIProcessingResult
    if (!Array.isArray(parsed.suggestions)) {
      throw new Error("Response missing suggestions array")
    }
    return parsed
  } catch (err) {
    throw new ClaudeAPIError(
      `Failed to parse Claude response: ${(err as Error).message}`
    )
  }
}
