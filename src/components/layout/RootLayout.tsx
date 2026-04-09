import { type ReactNode } from "react"
import { TopBar } from "./TopBar"

interface RootLayoutProps {
  sidebar: ReactNode
  main: ReactNode
  rightPanel: ReactNode
}

export function RootLayout({ sidebar, main, rightPanel }: RootLayoutProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface text-on-surface font-body">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — fixed 260px */}
        <aside className="w-[260px] shrink-0 flex flex-col bg-neutral-900 border-r border-neutral-800 h-full overflow-hidden">
          {sidebar}
        </aside>

        {/* Main area — flexible */}
        <main className="flex-1 flex flex-col overflow-hidden bg-surface relative">
          {main}
        </main>

        {/* Right panel — fixed 300px */}
        <aside className="w-[300px] shrink-0 flex flex-col bg-neutral-950 border-l border-neutral-800 h-full overflow-hidden">
          {rightPanel}
        </aside>
      </div>
    </div>
  )
}
