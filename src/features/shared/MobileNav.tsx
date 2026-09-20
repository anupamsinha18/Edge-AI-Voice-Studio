import React from 'react'
import { FileAudio, History, Settings, Info } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { useHistoryStore } from '@/store/historyStore'

interface NavItem {
  id: 'workspace' | 'history' | 'settings' | 'about'
  label: string
  icon: typeof FileAudio
  badge?: number
}

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useUiStore()
  const { items } = useHistoryStore()

  const navItems: NavItem[] = [
    { id: 'workspace', label: 'Studio', icon: FileAudio },
    { id: 'history', label: 'History', icon: History, badge: items.length > 0 ? items.length : undefined },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About', icon: Info },
  ]

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-card/90 backdrop-blur-xl px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-lg shadow-black/30 select-none"
    >
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 ${
                active
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              type="button"
            >
              {/* Active glow pill */}
              {active && (
                <span className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20 shadow-sm shadow-primary/10" />
              )}

              <div className="relative">
                <Icon className={`h-5 w-5 transition-transform ${active ? 'scale-110 text-primary' : ''}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground px-1 shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-1 tracking-tight transition-colors ${active ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
