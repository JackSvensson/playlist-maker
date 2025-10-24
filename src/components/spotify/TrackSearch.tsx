"use client"

import { useState, useCallback } from "react"
import { Search, Plus, X, Music, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import PlaylistFilters from "../PlaylistFilters"

interface Track {
  id: string
  name: string
  artists: string
  album: string
  image: string
  uri: string
  duration_ms: number
}

interface PlaylistFilters {
  targetEnergy?: number
  targetDanceability?: number
  targetValence?: number
  targetTempo?: number
  targetAcousticness?: number
  minYear?: number
  maxYear?: number
  genres?: string[]
  limit?: number
}

export default function TrackSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Track[]>([])
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const [filters, setFilters] = useState<PlaylistFilters>({})

  const searchTracks = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(searchQuery)}`
      )
      const data = await response.json()
      setResults(data.tracks || [])
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      searchTracks(value)
    }, 500)

    setSearchTimeout(timeout)
  }

  const addTrack = (track: Track) => {
    if (selectedTracks.length >= 5) {
      alert("Maximum 5 seed tracks allowed")
      return
    }
    if (selectedTracks.find(t => t.id === track.id)) {
      return
    }
    setSelectedTracks([...selectedTracks, track])
  }

  const removeTrack = (trackId: string) => {
    setSelectedTracks(selectedTracks.filter(t => t.id !== trackId))
  }

  const handleFiltersChange = (newFilters: PlaylistFilters) => {
    setFilters(newFilters)
  }

  const generatePlaylist = async () => {
    if (selectedTracks.length < 3) {
      alert("Please select at least 3 tracks")
      return
    }

    setGenerating(true)
    try {
      const response = await fetch("/api/playlist/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seedTracks: selectedTracks.map(t => t.id),
          filters: filters, // Send filters to backend
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate playlist")
      }

      const data = await response.json()
      
      router.push(`/playlist/${data.playlistId}`)
    } catch (error) {
      console.error("Generate playlist error:", error)
      alert("Failed to generate playlist. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-8">
      {/* Filters Component */}
      <PlaylistFilters 
        onFiltersChange={handleFiltersChange}
        onApply={generatePlaylist}
      />

      {/* Selected Tracks */}
      {selectedTracks.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              Selected Tracks ({selectedTracks.length}/5)
            </h2>
            {selectedTracks.length >= 3 && (
              <button
                onClick={generatePlaylist}
                disabled={generating}
                className="bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-gray-600 text-white font-bold px-6 py-3 rounded-full transition flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Music size={20} />
                    Generate Playlist
                  </>
                )}
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {selectedTracks.map(track => (
              <div
                key={track.id}
                className="flex items-center gap-4 bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition"
              >
                <Image
                  src={track.image || "/placeholder-album.png"}
                  alt={track.name}
                  width={50}
                  height={50}
                  className="rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{track.name}</p>
                  <p className="text-sm text-gray-400 truncate">{track.artists}</p>
                </div>
                <button
                  onClick={() => removeTrack(track.id)}
                  className="p-2 hover:bg-gray-700 rounded-full transition flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>

          {selectedTracks.length < 3 && (
            <p className="text-gray-400 text-sm mt-4">
              Select at least {3 - selectedTracks.length} more track{3 - selectedTracks.length !== 1 ? 's' : ''} to generate a playlist
            </p>
          )}
        </div>
      )}

      {/* Search */}
      <div>
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search for tracks, artists, or albums..."
            className="w-full bg-gray-900 text-white pl-12 pr-4 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
          />
          {loading && (
            <Loader2 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" 
              size={20} 
            />
          )}
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="text-xl font-semibold mb-4">Search Results</h3>
            {results.map(track => {
              const isSelected = selectedTracks.find(t => t.id === track.id)
              
              return (
                <div
                  key={track.id}
                  className={`flex items-center gap-4 rounded-lg p-3 transition cursor-pointer ${
                    isSelected 
                      ? 'bg-gray-800 opacity-50 cursor-not-allowed' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  onClick={() => !isSelected && addTrack(track)}
                >
                  <Image
                    src={track.image || "/placeholder-album.png"}
                    alt={track.name}
                    width={50}
                    height={50}
                    className="rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{track.name}</p>
                    <p className="text-sm text-gray-400 truncate">{track.artists}</p>
                    <p className="text-xs text-gray-500 truncate">{track.album}</p>
                  </div>
                  <span className="text-sm text-gray-400 flex-shrink-0">
                    {formatDuration(track.duration_ms)}
                  </span>
                  {isSelected ? (
                    <div className="p-2 bg-[#1DB954] rounded-full flex-shrink-0">
                      <X size={20} />
                    </div>
                  ) : (
                    <button className="p-2 bg-[#1DB954] hover:bg-[#1ed760] rounded-full transition flex-shrink-0">
                      <Plus size={20} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <p className="text-center text-gray-400 mt-8">No results found</p>
        )}
      </div>
    </div>
  )
}