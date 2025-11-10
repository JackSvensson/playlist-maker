"use client"

import { useState, useCallback } from "react"
import { Search, X, Music, Loader2, Sparkles } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import PlaylistFilters from "@/components/PlaylistFilters"

interface Track {
  id: string
  name: string
  artists: string
  album: string
  image: string
  uri: string
  duration_ms: number
}

interface PlaylistFiltersType {
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
  const [filters, setFilters] = useState<PlaylistFiltersType>({})

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
    setQuery("")
    setResults([])
  }

  const removeTrack = (trackId: string) => {
    setSelectedTracks(selectedTracks.filter(t => t.id !== trackId))
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
          filters: filters,
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
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="flex items-center justify-center gap-2 lg:gap-3 mb-3 lg:mb-4">
            <Music className="text-[#1DB954]" size={32} />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              AI Playlist Generator
            </h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 px-4">
            {selectedTracks.length === 0 
              ? "Select 3-5 tracks that represent your desired vibe."
              : `${selectedTracks.length}/5 tracks selected`}
          </p>
        </div>

        {/* Advanced Filters */}
        <PlaylistFilters 
          onFiltersChange={setFilters}
          onApply={() => {
            // Filters are already set via onFiltersChange
            console.log("Filters applied:", filters)
          }}
        />

        {/* Main Content - Fixed Layout */}
        <div className="space-y-6">
          {/* Selected Tracks - Always visible at top on mobile, sticky sidebar on desktop */}
          <div className="lg:grid lg:grid-cols-[380px,1fr] lg:gap-8">
            {/* Left Sidebar - Selected Tracks */}
            <div className="lg:sticky lg:top-6 lg:self-start" style={{ maxHeight: 'calc(100vh - 3rem)' }}>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl lg:rounded-2xl p-4 sm:p-6 border border-gray-800 flex flex-col" style={{ maxHeight: 'calc(100vh - 3rem)' }}>
                <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                  <Music className="text-[#1DB954]" size={18} />
                  <h2 className="text-lg sm:text-xl font-bold">Selected Tracks</h2>
                  <span className="ml-auto text-xs sm:text-sm text-gray-400">({selectedTracks.length}/5)</span>
                </div>
                
                {selectedTracks.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 flex-shrink-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                      <Music className="text-gray-600" size={24} />
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm px-2">
                      Start by searching and selecting tracks
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 sm:space-y-3 overflow-y-auto flex-1 pr-2 scrollbar-custom">
                      {selectedTracks.map((track, index) => (
                        <div
                          key={track.id}
                          className="group relative bg-gray-800/50 hover:bg-gray-700/50 rounded-lg sm:rounded-xl p-2 sm:p-3 transition-all"
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-xs sm:text-sm text-gray-500 w-4 sm:w-6 flex-shrink-0">{index + 1}</span>
                            <Image
                              src={track.image || "/placeholder-album.png"}
                              alt={track.name}
                              width={40}
                              height={40}
                              className="rounded sm:rounded-lg sm:w-12 sm:h-12 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-xs sm:text-sm">{track.name}</p>
                              <p className="text-[10px] sm:text-xs text-gray-400 truncate">{track.artists}</p>
                            </div>
                            <button
                              onClick={() => removeTrack(track.id)}
                              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1 sm:p-1.5 hover:bg-gray-600 rounded-full flex-shrink-0"
                            >
                              <X size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Generate Button - Always visible */}
                    <div className="mt-4 sm:mt-6 flex-shrink-0">
                      <button
                        onClick={generatePlaylist}
                        disabled={generating || selectedTracks.length < 3}
                        className="w-full bg-gradient-to-r from-[#1DB954] to-[#1ed760] hover:from-[#1ed760] hover:to-[#1DB954] text-white font-bold py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#1DB954]/20 text-sm sm:text-base"
                      >
                        {generating ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            <span>Generate AI Playlist</span>
                          </>
                        )}
                      </button>

                      {selectedTracks.length > 0 && selectedTracks.length < 3 && (
                        <p className="text-[10px] sm:text-xs text-center text-gray-500 mt-3 sm:mt-4">
                          Select {3 - selectedTracks.length} more track{3 - selectedTracks.length !== 1 ? 's' : ''} to generate
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Side - Search */}
            <div className="space-y-4 sm:space-y-6 mt-6 lg:mt-0">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl lg:rounded-2xl p-4 sm:p-6 border border-gray-800">
                <div className="relative">
                  <Search
                    className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    placeholder="Search for tracks, artists, or albums..."
                    className="w-full bg-gray-800 text-white pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1DB954] transition-all text-sm sm:text-base"
                  />
                  {loading && (
                    <Loader2 
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" 
                      size={18} 
                    />
                  )}
                </div>

                {/* Search Results */}
                {results.length > 0 && (
                  <div className="mt-4 sm:mt-6 space-y-1 sm:space-y-2 max-h-[400px] sm:max-h-[600px] overflow-y-auto pr-1 sm:pr-2 scrollbar-custom">
                    {results.map(track => {
                      const isSelected = selectedTracks.find(t => t.id === track.id)
                      const isDisabled = selectedTracks.length >= 5 && !isSelected
                      
                      return (
                        <div
                          key={track.id}
                          onClick={() => !isSelected && !isDisabled && addTrack(track)}
                          className={`flex items-center gap-3 sm:gap-4 rounded-lg sm:rounded-xl p-2 sm:p-3 transition-all ${
                            isSelected 
                              ? 'bg-[#1DB954]/10 border border-[#1DB954]/20 opacity-60 cursor-not-allowed' 
                              : isDisabled
                              ? 'bg-gray-800/30 opacity-40 cursor-not-allowed'
                              : 'bg-gray-800/50 hover:bg-gray-700/50 cursor-pointer active:scale-[0.98]'
                          }`}
                        >
                          <Image
                            src={track.image || "/placeholder-album.png"}
                            alt={track.name}
                            width={48}
                            height={48}
                            className="rounded sm:rounded-lg w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate text-sm sm:text-base">{track.name}</p>
                            <p className="text-xs sm:text-sm text-gray-400 truncate">{track.artists}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500 truncate hidden sm:block">{track.album}</p>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline">
                              {formatDuration(track.duration_ms)}
                            </span>
                            {isSelected && (
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#1DB954] flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {query && !loading && results.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <Search className="mx-auto text-gray-600 mb-3 sm:mb-4" size={40} />
                    <p className="text-gray-400 text-sm sm:text-base">No results found for "{query}"</p>
                  </div>
                )}

                {!query && !loading && (
                  <div className="text-center py-8 sm:py-12">
                    <Search className="mx-auto text-gray-600 mb-3 sm:mb-4" size={40} />
                    <p className="text-gray-400 text-sm sm:text-base">Start typing to search for tracks</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}