import { create } from 'zustand'
import localforage from 'localforage'

export interface HistoryItem {
  id: string
  text: string
  voiceId: string
  engineId: string
  duration: number
  timestamp: number
  audioBlob: Blob
  audioUrl?: string // Local runtime URL mapped on startup/creation
  isFavorite: boolean
  name: string
}

interface HistoryState {
  items: HistoryItem[]
  isLoading: boolean
  searchQuery: string
  sortBy: 'date_desc' | 'date_asc' | 'name_asc' | 'duration_desc'
  filterFavorite: boolean

  initializeHistory: () => Promise<void>
  addItem: (item: Omit<HistoryItem, 'audioUrl'>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  renameItem: (id: string, name: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  setSearchQuery: (query: string) => void
  setSortBy: (sort: HistoryState['sortBy']) => void
  setFilterFavorite: (filter: boolean) => void
  clearAllHistory: () => Promise<void>
}

// Initialize clean localforage database instance
const historyDb = localforage.createInstance({
  name: 'ai-voice-studio',
  storeName: 'generation-history',
})

export const useHistoryStore = create<HistoryState>((set, get) => ({
  items: [],
  isLoading: false,
  searchQuery: '',
  sortBy: 'date_desc',
  filterFavorite: false,

  initializeHistory: async () => {
    set({ isLoading: true })
    try {
      const items: HistoryItem[] = []
      await historyDb.iterate((value: unknown) => {
        if (value && typeof value === 'object') {
          const item = value as HistoryItem
          // Map local object URL for instant web-audio playback
          item.audioUrl = URL.createObjectURL(item.audioBlob)
          items.push(item)
        }
      })
      
      set({ items, isLoading: false })
    } catch (err) {
      console.error('Failed to initialize history store:', err)
      set({ isLoading: false })
    }
  },

  addItem: async (itemData) => {
    try {
      const id = itemData.id
      const item: HistoryItem = {
        ...itemData,
        audioUrl: URL.createObjectURL(itemData.audioBlob),
      }
      
      // Save item without the temporary URL to the database
      const dbSaveObject = { ...itemData }
      
      await historyDb.setItem(id, dbSaveObject)
      
      set((state) => ({
        items: [item, ...state.items],
      }))
    } catch (err) {
      console.error('Failed to save history item:', err)
    }
  },

  deleteItem: async (id) => {
    try {
      await historyDb.removeItem(id)
      
      const item = get().items.find((i) => i.id === id)
      if (item?.audioUrl) {
        URL.revokeObjectURL(item.audioUrl)
      }

      set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      }))
    } catch (err) {
      console.error('Failed to delete history item:', err)
    }
  },

  renameItem: async (id, name) => {
    try {
      const item = get().items.find((i) => i.id === id)
      if (!item) return

      const updatedItem = { ...item, name }
      const dbSaveObject = { ...updatedItem }
      delete dbSaveObject.audioUrl

      await historyDb.setItem(id, dbSaveObject)

      set((state) => ({
        items: state.items.map((i) => (i.id === id ? updatedItem : i)),
      }))
    } catch (err) {
      console.error('Failed to rename history item:', err)
    }
  },

  toggleFavorite: async (id) => {
    try {
      const item = get().items.find((i) => i.id === id)
      if (!item) return

      const isFavorite = !item.isFavorite
      const updatedItem = { ...item, isFavorite }
      const dbSaveObject = { ...updatedItem }
      delete dbSaveObject.audioUrl

      await historyDb.setItem(id, dbSaveObject)

      set((state) => ({
        items: state.items.map((i) => (i.id === id ? updatedItem : i)),
      }))
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setFilterFavorite: (filter) => set({ filterFavorite: filter }),

  clearAllHistory: async () => {
    try {
      get().items.forEach((item) => {
        if (item.audioUrl) {
          URL.revokeObjectURL(item.audioUrl)
        }
      })

      await historyDb.clear()
      set({ items: [] })
    } catch (err) {
      console.error('Failed to clear history store:', err)
    }
  },
}))
