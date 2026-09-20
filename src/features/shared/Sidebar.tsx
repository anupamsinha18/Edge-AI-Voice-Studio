import React from 'react'
import { FileAudio, History, Settings, Info, ChevronLeft, ChevronRight, HardDrive, X, Sparkles } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, sidebarOpen, toggleSidebar, mobileDrawerOpen, setMobileDrawerOpen } = useUiStore()

  const navItems = [
    { id: 'workspace', label: 'Voice Editor', icon: FileAudio, desc: 'Generate & edit speech' },
    { id: 'history', label: 'Generation History', icon: History, desc: 'Cached audio tracks' },
    { id: 'settings', label: 'Studio Settings', icon: Settings, desc: 'Themes & preferences' },
    { id: 'about', label: 'About Project', icon: Info, desc: 'Specs & architecture' },
  ] as const

  return (
    <>
      {/* Mobile Slide-Out Drawer & Backdrop */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative flex w-4/5 max-w-xs flex-col bg-card border-r border-border shadow-2xl p-4 z-10 animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">AI Voice Studio</h3>
                  <p className="text-[10px] text-muted-foreground">Neural Voice Synthesis</p>
                </div>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="rounded-lg p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                type="button"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-1 flex-col gap-2 py-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id)
                      setMobileDrawerOpen(false)
                    }}
                    className={`flex items-center gap-3 rounded-xl p-3 text-left transition-all ${
                      active
                        ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                    type="button"
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className={`text-[10px] ${active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {item.desc}
                      </span>
                    </div>
                  </button>
                )
              })}
            </nav>

            {/* Storage Info */}
            <div className="mt-auto border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2.5 rounded-xl bg-secondary/40 p-3 border border-border/40">
                <HardDrive className="h-4 w-4 text-primary shrink-0" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground text-xs">IndexedDB Storage</span>
                  <p className="text-[10px] leading-relaxed">Runs 100% locally on your device without server uploads.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex h-full flex-col border-r border-border bg-card transition-all duration-300 ${
        sidebarOpen ? 'w-64 px-4 py-4' : 'w-16 items-center py-4 px-2'
      }`}>
        <div className={`flex items-center mb-6 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen && (
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Navigation</span>
          )}
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            type="button"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 w-full">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center rounded-xl transition-all ${
                  sidebarOpen ? 'gap-3 px-3 py-2.5 text-sm font-medium' : 'justify-center p-2.5'
                } ${
                  active
                    ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/10'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
                title={!sidebarOpen ? item.label : undefined}
                type="button"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Storage Footer Info (Desktop) */}
        {sidebarOpen && (
          <div className="mt-auto border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2 rounded-lg bg-secondary/30 p-2.5 border border-border/30">
              <HardDrive className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground">Local DB Caching</span>
                <p className="leading-relaxed">All voice data is stored locally in IndexedDB.</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

