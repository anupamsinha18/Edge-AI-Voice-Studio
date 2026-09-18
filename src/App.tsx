import { useEffect } from 'react'
import { Header } from '@/features/shared/Header'
import { Sidebar } from '@/features/shared/Sidebar'
import { StatusBar } from '@/features/shared/StatusBar'
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
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Top Banner Header */}
      <Header />

      {/* Main Core Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Dynamic Display Panel */}
        <main className="flex-1 overflow-hidden">
          {renderActiveTab()}
        </main>
      </div>

      {/* Bottom Status Ticker */}
      <StatusBar />
    </div>
  )
}

export default App
