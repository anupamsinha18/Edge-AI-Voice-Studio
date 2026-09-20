import React, { useEffect, useState } from 'react'
import { 
  Search, 
  Trash2, 
  Star, 
  Play, 
  Pause, 
  Download, 
  Calendar, 
  Clock, 
  Cpu, 
  User, 
  Sparkles, 
  Edit3, 
  Check, 
  X,
  Loader2
} from 'lucide-react'
import { useHistoryStore, type HistoryItem } from '@/store/historyStore'
import { useAudioStore } from '@/store/audioStore'

export const History: React.FC = () => {
  const { 
    items, 
    isLoading, 
    searchQuery, 
    sortBy, 
    filterFavorite,
    initializeHistory, 
    deleteItem, 
    renameItem, 
    toggleFavorite, 
    setSearchQuery, 
    setSortBy, 
    setFilterFavorite,
    clearAllHistory
  } = useHistoryStore()

  const { isPlaying, play, pause, stop } = useAudioStore()
  const [playingId, setPlayingId] = useState<string | null>(null)
  
  // Track inline editing fields
  const [editId, setEditId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    initializeHistory()
  }, [initializeHistory])

  useEffect(() => {
    if (!isPlaying) {
      setTimeout(() => setPlayingId(null), 0)
    }
  }, [isPlaying])

  const handlePlayPause = (item: HistoryItem) => {
    if (playingId === item.id && isPlaying) {
      pause(item.engineId)
      setPlayingId(null)
    } else {
      // Reset any active audio
      stop(item.engineId)
      setPlayingId(item.id)
      
      // Load and play history item URL using global audio store
      play(
        item.text,
        item.engineId,
        item.audioUrl,
        item.voiceId,
        1.0, // Default playback rate
        1.0, // Default pitch
        1.0  // Full volume
      )
    }
  }

  const startEditing = (item: HistoryItem) => {
    setEditId(item.id)
    setNewName(item.name)
  }

  const saveRename = async (id: string) => {
    if (newName.trim()) {
      await renameItem(id, newName.trim())
    }
    setEditId(null)
  }

  const cancelRename = () => {
    setEditId(null)
  }

  // Filter and Sort array logic
  const filteredItems = items
    .filter((item) => {
      const matchesSearch = 
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFavorite = !filterFavorite || item.isFavorite
      return matchesSearch && matchesFavorite
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return b.timestamp - a.timestamp
      if (sortBy === 'date_asc') return a.timestamp - b.timestamp
      if (sortBy === 'duration_desc') return b.duration - a.duration
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name)
      return 0
    })

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex h-full flex-col bg-background p-3 sm:p-6 pb-24 sm:pb-6 overflow-hidden">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">Generation History</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage and replay locally cached voice files.</p>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to purge all voice generation records? This is irreversible.')) {
                clearAllHistory()
              }
            }}
            className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-destructive/20 hover:bg-destructive/10 text-destructive text-xs font-semibold px-3 py-2 transition-all active:scale-95"
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Purge History
          </button>
        )}
      </div>

      {/* Filter and Search Bar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6 bg-secondary/30 p-2.5 sm:p-3 rounded-2xl border border-border">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search saved text or names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date_desc' | 'date_asc' | 'name_asc' | 'duration_desc')}
          className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none transition-colors"
        >
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="duration_desc">Length (Descending)</option>
        </select>

        {/* Favorites Filter */}
        <button
          onClick={() => setFilterFavorite(!filterFavorite)}
          className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all active:scale-95 ${
            filterFavorite
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'border-border bg-background text-muted-foreground hover:text-foreground'
          }`}
          type="button"
        >
          <Star className={`h-3.5 w-3.5 ${filterFavorite ? 'fill-current' : ''}`} />
          Favorites Only
        </button>
      </div>

      {/* History List Results */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs">Accessing IndexedDB log...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed border-border bg-card/10 text-muted-foreground p-6">
            <Sparkles className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <span className="text-xs font-semibold text-foreground">No records found</span>
            <p className="text-[10px] text-muted-foreground text-center mt-1 max-w-xs leading-relaxed">
              {items.length === 0
                ? "You haven't generated any speech tracks yet. Visit the editor to get started!"
                : 'No results match your active search filter settings.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div 
              key={item.id} 
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between border rounded-xl bg-card/35 p-4 gap-4 transition-all ${
                playingId === item.id ? 'border-primary shadow shadow-primary/5 bg-primary/5' : 'border-border hover:bg-secondary/20'
              }`}
            >
              {/* Left Column: Metadata & Title */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Title Section (Renameable) */}
                <div className="flex items-center gap-2">
                  {editId === item.id ? (
                    <div className="flex items-center gap-1.5 max-w-sm">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="rounded border border-primary bg-background px-2 py-0.5 text-xs text-foreground focus:outline-none font-semibold"
                        autoFocus
                      />
                      <button 
                        onClick={() => saveRename(item.id)}
                        className="text-green-500 hover:bg-green-500/10 p-0.5 rounded"
                        type="button"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={cancelRename}
                        className="text-muted-foreground hover:bg-secondary p-0.5 rounded"
                        type="button"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold text-sm text-foreground truncate">{item.name}</span>
                      <button
                        onClick={() => startEditing(item)}
                        className="text-muted-foreground hover:text-foreground p-0.5 hover:bg-secondary rounded opacity-0 group-hover:opacity-100 focus:opacity-100 sm:opacity-50 transition-opacity"
                        title="Rename record"
                        type="button"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {/* Favorite button */}
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className={`ml-1 text-muted-foreground hover:text-yellow-500 transition-colors ${
                      item.isFavorite ? 'text-yellow-500' : ''
                    }`}
                    type="button"
                  >
                    <Star className={`h-4 w-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Subtitle / Script Content */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic pr-4">
                  "{item.text}"
                </p>

                {/* Badges Info */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    {formatDate(item.timestamp)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {item.duration.toFixed(1)}s
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 uppercase bg-secondary/80 px-1.5 py-0.5 rounded font-mono font-bold text-foreground">
                    <Cpu className="h-2.5 w-2.5 mr-0.5" />
                    {item.engineId}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
                    <User className="h-2.5 w-2.5 mr-0.5" />
                    {item.voiceId}
                  </span>
                </div>
              </div>

              {/* Right Column: Console Player */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto bg-secondary/30 p-1.5 rounded-lg border border-border/40">
                <button
                  onClick={() => handlePlayPause(item)}
                  className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm transition-all"
                  title={playingId === item.id && isPlaying ? 'Pause' : 'Play'}
                  type="button"
                >
                  {playingId === item.id && isPlaying ? (
                    <Pause className="h-3.5 w-3.5 fill-current" />
                  ) : (
                    <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                  )}
                </button>
                
                <a
                  href={item.audioUrl}
                  download={`${item.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.wav`}
                  className="flex h-8 w-8 items-center justify-center rounded border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                  title="Download File"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>

                <button
                  onClick={() => {
                    if (confirm(`Delete generation record "${item.name}"?`)) {
                      deleteItem(item.id)
                    }
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded border border-border bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                  title="Delete generation"
                  type="button"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
