import { create } from "zustand"

export type AIProvider = "claude" | "gemini"

/**
 * Encrypts plaintext using AES-GCM (Web Crypto API).
 * Returns base64(iv + ciphertext).
 */
async function encryptApiKey(plaintext: string): Promise<string> {
  const enc = new TextEncoder()
  // Derive a key from a fixed app-level secret + extension origin
  const rawKey = await crypto.subtle.importKey(
    "raw",
    enc.encode("notask-key-v1-" + chrome.runtime.id).slice(0, 32),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  )
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    rawKey,
    enc.encode(plaintext)
  )
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), iv.byteLength)
  return btoa(String.fromCharCode(...combined))
}

async function decryptApiKey(encoded: string): Promise<string> {
  const combined = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0))
  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)
  const enc = new TextEncoder()
  const rawKey = await crypto.subtle.importKey(
    "raw",
    enc.encode("notask-key-v1-" + chrome.runtime.id).slice(0, 32),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  )
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    rawKey,
    ciphertext
  )
  return new TextDecoder().decode(plainBuf)
}

interface SettingsState {
  /** Decrypted Claude API key — only in memory, never stored as-is */
  claudeApiKey: string | null
  /** Decrypted Gemini API key — only in memory, never stored as-is */
  geminiApiKey: string | null
  /** Active AI provider */
  aiProvider: AIProvider
  gcalConnected: boolean
  gcalEmail: string | null
  rootFolderName: string | null

  loadSettings: () => Promise<void>
  saveClaudeApiKey: (key: string) => Promise<void>
  saveGeminiApiKey: (key: string) => Promise<void>
  setAiProvider: (provider: AIProvider) => void
  setGcalConnected: (connected: boolean, email: string | null) => void
  setRootFolderName: (name: string) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  claudeApiKey: null,
  geminiApiKey: null,
  aiProvider: "gemini",
  gcalConnected: false,
  gcalEmail: null,
  rootFolderName: null,

  loadSettings: async () => {
    try {
      const result = await chrome.storage.local.get([
        "claudeApiKeyEncrypted",
        "geminiApiKeyEncrypted",
        "aiProvider",
        "gcalConnected",
        "gcalEmail",
        "rootFolderName",
        "darkMode"
      ])
      let claudeApiKey: string | null = null
      if (result.claudeApiKeyEncrypted) {
        try {
          claudeApiKey = await decryptApiKey(result.claudeApiKeyEncrypted)
        } catch {
          // Key decryption failed — treat as missing
        }
      }
      let geminiApiKey: string | null = null
      if (result.geminiApiKeyEncrypted) {
        try {
          geminiApiKey = await decryptApiKey(result.geminiApiKeyEncrypted)
        } catch {
          // Key decryption failed — treat as missing
        }
      }
      set({
        claudeApiKey,
        geminiApiKey,
        aiProvider: (result.aiProvider as AIProvider) ?? "gemini",
        gcalConnected: result.gcalConnected ?? false,
        gcalEmail: result.gcalEmail ?? null,
        rootFolderName: result.rootFolderName ?? null
      })
    } catch (err) {
      console.error("[settings] Failed to load settings:", err)
    }
  },

  saveClaudeApiKey: async (key: string) => {
    try {
      const encrypted = await encryptApiKey(key)
      await chrome.storage.local.set({ claudeApiKeyEncrypted: encrypted })
      set({ claudeApiKey: key })
    } catch (err) {
      console.error("[settings] Failed to save Claude API key:", err)
      throw err
    }
  },

  saveGeminiApiKey: async (key: string) => {
    try {
      const encrypted = await encryptApiKey(key)
      await chrome.storage.local.set({ geminiApiKeyEncrypted: encrypted })
      set({ geminiApiKey: key })
    } catch (err) {
      console.error("[settings] Failed to save Gemini API key:", err)
      throw err
    }
  },

  setAiProvider: (provider) => {
    chrome.storage.local
      .set({ aiProvider: provider })
      .catch((err) => console.error("[settings] Failed to persist aiProvider:", err))
    set({ aiProvider: provider })
  },

  setGcalConnected: (connected, email) => {
    chrome.storage.local
      .set({ gcalConnected: connected, gcalEmail: email })
      .catch((err) => console.error("[settings] Failed to persist gcal state:", err))
    set({ gcalConnected: connected, gcalEmail: email })
  },

  setRootFolderName: (name) => {
    chrome.storage.local
      .set({ rootFolderName: name })
      .catch((err) =>
        console.error("[settings] Failed to persist folder name:", err)
      )
    set({ rootFolderName: name })
  }
}))
