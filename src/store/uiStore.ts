import { create } from 'zustand'

type Tab = 'workspace' | 'history' | 'settings' | 'about'
type Theme = 'dark' | 'light' | 'system'

interface UiState {
  activeTab: Tab
  theme: Theme
  sidebarOpen: boolean
  
  setActiveTab: (tab: Tab) => void
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  applyTheme: () => void
}

export const useUiStore = create<UiState>((set, get) => ({
  activeTab: 'workspace',
  theme: 'dark', // Default to premium dark mode
  sidebarOpen: true,

  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setTheme: (theme) => {
    set({ theme })
    get().applyTheme()
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  applyTheme: () => {
    if (typeof window === 'undefined') return
    const theme = get().theme
    const root = window.document.documentElement
    
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }
}))
