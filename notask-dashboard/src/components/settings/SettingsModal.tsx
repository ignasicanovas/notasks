import { useState } from "react"
import { useUIStore } from "~store/uiStore"
import { useSettingsStore } from "~store/settingsStore"
import { useFilesystem } from "~hooks/useFilesystem"
import { useCalendar } from "~hooks/useCalendar"
import { useNotesStore } from "~store/notesStore"

type SettingsSection = "general" | "appearance" | "integrations" | "privacy"

export function SettingsModal() {
  const { settingsOpen, setSettingsOpen, darkMode, setDarkMode } = useUIStore()
  const { claudeApiKey, geminiApiKey, aiProvider, saveClaudeApiKey, saveGeminiApiKey, setAiProvider, rootFolderName } = useSettingsStore()
  const { selectFolder } = useFilesystem()
  const { connected, email, connect, disconnect } = useCalendar()
  const { rootHandle } = useNotesStore()

  const [section, setSection] = useState<SettingsSection>("general")
  const [claudeKeyInput, setClaudeKeyInput] = useState(claudeApiKey ?? "")
  const [geminiKeyInput, setGeminiKeyInput] = useState(geminiApiKey ?? "")
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  if (!settingsOpen) return null

  const handleSaveApiKey = async () => {
    setSaving(true)
    try {
      if (aiProvider === "claude" && claudeKeyInput.trim()) {
        await saveClaudeApiKey(claudeKeyInput.trim())
      } else if (aiProvider === "gemini" && geminiKeyInput.trim()) {
        await saveGeminiApiKey(geminiKeyInput.trim())
      }
      setSaveMsg("Guardado")
      setTimeout(() => setSaveMsg(null), 2000)
    } catch {
      setSaveMsg("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const navItems: { id: SettingsSection; label: string; icon: string }[] = [
    { id: "general", label: "General", icon: "settings" },
    { id: "appearance", label: "Apariencia", icon: "palette" },
    { id: "integrations", label: "Integraciones", icon: "api" },
    { id: "privacy", label: "Privacidad", icon: "security" }
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-surface-container border border-outline-variant shadow-none overflow-hidden">
        {/* Header */}
        <header className="bg-neutral-950 flex justify-between items-center w-full px-4 h-12 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tighter text-neutral-100">Notask</span>
            <span className="h-4 w-px bg-neutral-800" />
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
              SETTINGS_V1.0
            </span>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className="text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Body */}
        <div className="flex h-[520px]">
          {/* Sidebar nav */}
          <aside className="bg-neutral-900 border-r border-neutral-800 w-[200px] flex flex-col shrink-0">
            <div className="p-3">
              <div className="text-neutral-600 font-bold font-mono text-[10px] mb-4 px-2 uppercase">
                USER_WORKSPACE
              </div>
              <nav className="space-y-0.5">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSection(item.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 font-mono text-[13px] transition-all text-left ${
                      section === item.id
                        ? "text-indigo-300 bg-neutral-800/50"
                        : "text-neutral-400 hover:bg-neutral-800"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 overflow-y-auto bg-surface p-6 space-y-8">
            {section === "general" && (
              <>
                {/* Folder */}
                <section className="space-y-3">
                  <SectionHeader title="Carpeta de notas" />
                  <div className="bg-surface-container-highest ghost-border p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-neutral-500">folder_open</span>
                      <code className="font-mono text-[12px] text-indigo-300 truncate">
                        {rootFolderName ?? "Sin seleccionar"}
                      </code>
                    </div>
                    <button
                      onClick={async () => {
                        await selectFolder()
                        setSettingsOpen(false)
                      }}
                      className="bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-[11px] px-3 py-1 font-mono transition-colors shrink-0 ml-3"
                    >
                      [ Cambiar ]
                    </button>
                  </div>
                </section>

                {/* AI Provider */}
                <section className="space-y-3">
                  <SectionHeader title="Proveedor de IA" />
                  <div className="flex gap-2">
                    {(["gemini", "claude"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setAiProvider(p)}
                        className={`flex-1 py-2 text-[11px] font-mono border transition-all ${
                          aiProvider === p
                            ? "border-primary/60 text-primary bg-primary/10"
                            : "border-outline-variant/40 text-neutral-500 hover:text-neutral-300"
                        }`}
                      >
                        {p === "gemini" ? "Gemini 2.0 Flash" : "Claude Sonnet"}
                        {p === "gemini" && (
                          <span className="ml-1.5 text-[9px] text-emerald-400 font-bold">GRATIS</span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="password"
                          value={aiProvider === "gemini" ? geminiKeyInput : claudeKeyInput}
                          onChange={(e) =>
                            aiProvider === "gemini"
                              ? setGeminiKeyInput(e.target.value)
                              : setClaudeKeyInput(e.target.value)
                          }
                          placeholder={aiProvider === "gemini" ? "AIza..." : "sk-ant-..."}
                          className="w-full bg-surface-container-highest ghost-border font-mono text-[13px] text-on-surface py-2 px-3 pr-8 outline-none focus:border-primary transition-colors"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 material-symbols-outlined text-[14px]">
                          lock
                        </span>
                      </div>
                      <button
                        onClick={handleSaveApiKey}
                        disabled={saving}
                        className="bg-primary text-on-primary px-4 py-2 text-[11px] font-bold font-mono hover:bg-primary-dim transition-colors disabled:opacity-50"
                      >
                        {saveMsg ?? "[ Guardar ]"}
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-500 italic leading-relaxed">
                      {aiProvider === "gemini"
                        ? "API key gratuita en aistudio.google.com. Se cifra con AES-256-GCM localmente."
                        : "La clave se cifra localmente con AES-256-GCM. Nunca sale de tu navegador excepto hacia api.anthropic.com."}
                    </p>
                  </div>
                </section>
              </>
            )}

            {section === "integrations" && (
              <section className="space-y-3">
                <SectionHeader title="Google Calendar" />
                <div className="bg-surface-container-highest ghost-border p-3 flex items-center justify-between">
                  {connected ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                        <span className="text-[13px] text-on-surface">
                          Conectado como{" "}
                          <span className="font-mono text-indigo-300">{email}</span>
                        </span>
                      </div>
                      <button
                        onClick={disconnect}
                        className="text-error-dim hover:text-error text-[11px] font-mono transition-colors"
                      >
                        [ Desconectar ]
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-neutral-500 text-[13px]">No conectado</span>
                      <button
                        onClick={connect}
                        className="bg-indigo-300 text-on-primary text-[11px] font-bold font-mono px-3 py-1 hover:bg-indigo-200 transition-colors"
                      >
                        [ Conectar ]
                      </button>
                    </>
                  )}
                </div>
              </section>
            )}

            {section === "appearance" && (
              <section className="space-y-3">
                <SectionHeader title="Apariencia" />
                <div className="grid grid-cols-3 gap-3">
                  {(["dark", "light", "system"] as const).map((mode) => (
                    <label key={mode} className="group cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        className="hidden"
                        checked={
                          mode === "system"
                            ? false
                            : darkMode === (mode === "dark")
                        }
                        onChange={() => {
                          if (mode !== "system") setDarkMode(mode === "dark")
                        }}
                      />
                      <div
                        className={`ghost-border p-4 text-center transition-all relative ${
                          (mode === "dark" && darkMode) ||
                          (mode === "light" && !darkMode)
                            ? "border-primary/50"
                            : ""
                        }`}
                      >
                        <div
                          className={`h-8 w-full mb-2 border border-neutral-800 ${
                            mode === "dark"
                              ? "bg-neutral-950"
                              : mode === "light"
                              ? "bg-neutral-100"
                              : "bg-gradient-to-r from-neutral-950 to-neutral-100"
                          }`}
                        />
                        <span className="text-[11px] font-mono text-neutral-400 capitalize">
                          {mode === "dark" ? "Dark" : mode === "light" ? "Light" : "Sistema"}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            )}

            {section === "privacy" && (
              <section className="space-y-4">
                <SectionHeader title="Privacidad y datos" />
                <div className="space-y-3 text-[12px] text-neutral-400 leading-relaxed font-mono">
                  <p>
                    <span className="text-neutral-200 font-bold">Notas:</span>{" "}
                    Almacenadas como ficheros .md en tu filesystem local. Notask no tiene acceso externo a tus notas.
                  </p>
                  <p>
                    <span className="text-neutral-200 font-bold">Tareas y columnas:</span>{" "}
                    Guardadas en IndexedDB de tu navegador. No se sincronizan con ningún servidor.
                  </p>
                  <p>
                    <span className="text-neutral-200 font-bold">Claude API Key:</span>{" "}
                    Cifrada con AES-256-GCM en chrome.storage.local. Solo se usa para llamadas a api.anthropic.com.
                  </p>
                  <p>
                    <span className="text-neutral-200 font-bold">Google Calendar:</span>{" "}
                    Token OAuth gestionado por Chrome. Solo se usa para leer eventos del día.
                  </p>
                </div>
              </section>
            )}
          </main>
        </div>

        {/* Footer */}
        <footer className="h-8 bg-neutral-950 border-t border-neutral-800 flex items-center px-4 justify-between">
          <div className="text-[10px] font-mono text-neutral-600">V_STABLE_0.1.0</div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LOCAL_ONLY
          </div>
        </footer>
      </div>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-xs font-bold font-label tracking-wider text-on-surface-variant uppercase">
        {title}
      </h3>
      <span className="h-px flex-1 mx-4 bg-outline-variant/30" />
    </div>
  )
}
