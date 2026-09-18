import React from 'react'
import { FileAudio, History, Settings, Info, ChevronLeft, ChevronRight, HardDrive } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, sidebarOpen, toggleSidebar } = useUiStore()

  const navItems = [
    { id: 'workspace', label: 'Voice Editor', icon: FileAudio },
    { id: 'history', label: 'Generation History', icon: History },
    { id: 'settings', label: 'Studio Settings', icon: Settings },
    { id: 'about', label: 'About Project', icon: Info },
  ] as const

  if (!sidebarOpen) {
    return (
      <div className="flex h-full w-12 flex-col items-center border-r border-border bg-card py-4 transition-all duration-300">
        <button
          onClick={toggleSidebar}
          className="mb-6 rounded-md p-1.5 hover:bg-secondary text-muted-foreground transition-colors"
          title="Expand Sidebar"
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`rounded-md p-2 transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
                title={item.label}
                type="button"
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          }
          )}
        </div>
      </div>
    )
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card px-4 py-4 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Navigation</span>
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1 hover:bg-secondary text-muted-foreground transition-colors"
          title="Collapse Sidebar"
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/10'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
              type="button"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Storage Footer Info */}
      <div className="mt-auto border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2 rounded-lg bg-secondary/30 p-2.5 border border-border/30">
          <HardDrive className="h-3.5 w-3.5 text-primary shrink-0" />
          <div className="space-y-0.5">
            <span className="font-semibold text-foreground">Local DB Caching</span>
            <p className="leading-relaxed">All voice data is stored locally in IndexedDB.</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
