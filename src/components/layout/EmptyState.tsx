import { useFilesystem } from "~hooks/useFilesystem"

export function EmptyState() {
  const { selectFolder } = useFilesystem()

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 p-8">
      <span className="material-symbols-outlined text-[64px] text-neutral-700">folder_open</span>
      <div>
        <h2 className="text-lg font-bold text-neutral-300 font-headline mb-2">
          No hay carpeta de notas seleccionada
        </h2>
        <p className="text-neutral-500 text-sm max-w-sm leading-relaxed">
          Selecciona la carpeta donde quieres guardar tus notas .md.
          Compatible con Obsidian. Notask creará automáticamente las carpetas necesarias.
        </p>
      </div>
      <button
        onClick={selectFolder}
        className="bg-indigo-300 text-on-primary font-bold px-6 py-2.5 font-mono text-sm hover:bg-indigo-200 transition-colors mt-2"
      >
        [ Seleccionar carpeta ]
      </button>
      <p className="text-[11px] text-neutral-600 font-mono">
        También puedes configurarlo en Ajustes ⚙️
      </p>
    </div>
  )
}
