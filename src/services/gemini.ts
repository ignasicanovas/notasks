/**
 * gemini.ts — Google Gemini API service
 *
 * Uses Gemini 2.0 Flash (free tier: 15 req/min).
 * Same output contract as claude.ts: returns AIProcessingResult.
 */

import type { AIProcessingResult } from "~types/task"

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

export class GeminiAPIError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message)
    this.name = "GeminiAPIError"
  }
}

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

export async function processNoteWithGemini(
  noteContent: string,
  existingNotePaths: string[],
  apiKey: string
): Promise<AIProcessingResult> {
  const url = `${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(noteContent, existingNotePaths) }] }],
      generationConfig: { maxOutputTokens: 4096 }
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
    throw new GeminiAPIError(message, response.status)
  }

  const data = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""

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
    throw new GeminiAPIError(
      `Failed to parse Gemini response: ${(err as Error).message}`
    )
  }
}
