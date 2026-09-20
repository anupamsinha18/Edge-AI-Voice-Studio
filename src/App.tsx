import { useEffect } from 'react'
import { Header } from '@/features/shared/Header'
import { Sidebar } from '@/features/shared/Sidebar'
import { StatusBar } from '@/features/shared/StatusBar'
import { MobileNav } from '@/features/shared/MobileNav'
import { Workspace } from '@/features/workspace'
import { History } from '@/features/history'
import { Settings } from '@/features/settings'
import { About } from '@/features/about'
import { useUiStore } from '@/store/uiStore'

function App() {
  const { activeTab, applyTheme } = useUiStore()

  // Apply visual theme constraints (Dark, Light, System) on mount
  useEffect(() => {
    applyTheme()
  }, [applyTheme])

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'workspace':
        return <Workspace />
      case 'history':
        return <History />
      case 'settings':
        return <Settings />
      case 'about':
        return <About />
      default:
        return <Workspace />
    }
  }

  return (
    <div className="flex h-[100dvh] min-h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Top Banner Header */}
      <Header />

      {/* Main Core Container */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Sidebar Navigation (Desktop sidebar + Mobile Drawer) */}
        <Sidebar />

        {/* Dynamic Display Panel */}
        <main className="flex-1 min-w-0 min-h-0 overflow-hidden relative">
          {renderActiveTab()}
        </main>
      </div>

      {/* Bottom Status Ticker (Desktop) */}
      <StatusBar />

      {/* Bottom Navigation Bar (Mobile) */}
      <MobileNav />
    </div>
  )
}

export default App

