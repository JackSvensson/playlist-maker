"use client"

import { useState, useCallback } from "react"
import { Search, X, Music, Loader2, Sparkles, Sliders, Calendar, Music2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { auth, signOut } from "@/auth"
import Header from "@/components/Header"

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
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<PlaylistFiltersType>({
    targetEnergy: 0.5,
    targetDanceability: 0.5,
    targetValence: 0.5,
    targetTempo: 120,
    targetAcousticness: 0.5,
    limit: 20,
  })

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

  const handleSliderChange = (key: keyof PlaylistFiltersType, value: number) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleYearChange = (key: 'minYear' | 'maxYear', value: string) => {
    const year = parseInt(value) || undefined
    setFilters(prev => ({ ...prev, [key]: year }))
  }

  const resetFilters = () => {
    setFilters({
      targetEnergy: 0.5,
      targetDanceability: 0.5,
      targetValence: 0.5,
      targetTempo: 120,
      targetAcousticness: 0.5,
      limit: 20,
    })
  }

  const commonGenres = [
    "pop", "rock", "hip-hop", "r-n-b", "electronic", "indie", "alternative",
    "jazz", "classical", "country", "metal", "folk", "soul", "funk"
  ]

  const toggleGenre = (genre: string) => {
    const currentGenres = filters.genres || []
    const newGenres = currentGenres.includes(genre)
      ? currentGenres.filter(g => g !== genre)
      : [...currentGenres, genre]
    
    setFilters(prev => ({ ...prev, genres: newGenres }))
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Choose Your Seed Tracks
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 px-4">
            {selectedTracks.length === 0 
              ? "Select 3-5 tracks that represent your desired vibe. Our AI will analyze them to create the perfect playlist."
              : `${selectedTracks.length}/5 tracks selected`}
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div className="lg:grid lg:grid-cols-[380px,1fr] lg:gap-8">
            {/* Left Sidebar - Advanced Filters & Selected Tracks */}
            <div className="space-y-6">
              {/* Advanced Filters */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl lg:rounded-2xl p-4 sm:p-6 border border-gray-800">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-between w-full group"
                >
                  <div className="flex items-center gap-3">
                    <Sliders size={20} className="text-[#1DB954]" />
                    <h3 className="text-lg sm:text-xl font-bold">Advanced Filters</h3>
                  </div>
                  <div className={`text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {showFilters && (
                  <div className="mt-6 space-y-6">
                    {/* Audio Features Sliders */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Energy */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          Energy: <span className="text-[#1DB954]">{(filters.targetEnergy! * 100).toFixed(0)}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={filters.targetEnergy}
                          onChange={(e) => handleSliderChange('targetEnergy', parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Calm</span>
                          <span>Intense</span>
                        </div>
                      </div>

                      {/* Danceability */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          Danceability: <span className="text-[#1DB954]">{(filters.targetDanceability! * 100).toFixed(0)}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={filters.targetDanceability}
                          onChange={(e) => handleSliderChange('targetDanceability', parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Not Danceable</span>
                          <span>Very Danceable</span>
                        </div>
                      </div>

                      {/* Valence (Mood) */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          Mood: <span className="text-[#1DB954]">{(filters.targetValence! * 100).toFixed(0)}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={filters.targetValence}
                          onChange={(e) => handleSliderChange('targetValence', parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Sad</span>
                          <span>Happy</span>
                        </div>
                      </div>

                      {/* Tempo */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          Tempo: <span className="text-[#1DB954]">{filters.targetTempo?.toFixed(0)} BPM</span>
                        </label>
                        <input
                          type="range"
                          min="60"
                          max="200"
                          step="1"
                          value={filters.targetTempo}
                          onChange={(e) => handleSliderChange('targetTempo', parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Slow</span>
                          <span>Fast</span>
                        </div>
                      </div>

                      {/* Acousticness */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          Acousticness: <span className="text-[#1DB954]">{(filters.targetAcousticness! * 100).toFixed(0)}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={filters.targetAcousticness}
                          onChange={(e) => handleSliderChange('targetAcousticness', parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Electronic</span>
                          <span>Acoustic</span>
                        </div>
                      </div>

                      {/* Playlist Size */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          Playlist Size: <span className="text-[#1DB954]">{filters.limit} tracks</span>
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="50"
                          step="5"
                          value={filters.limit}
                          onChange={(e) => handleSliderChange('limit', parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>10 tracks</span>
                          <span>50 tracks</span>
                        </div>
                      </div>
                    </div>

                    {/* Year Range */}
                    <div className="border-t border-gray-800 pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar size={18} className="text-[#1DB954]" />
                        <h4 className="font-semibold text-gray-300">Release Year Range</h4>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">From Year</label>
                          <input
                            type="number"
                            placeholder="e.g., 2000"
                            min="1950"
                            max={new Date().getFullYear()}
                            value={filters.minYear || ''}
                            onChange={(e) => handleYearChange('minYear', e.target.value)}
                            className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">To Year</label>
                          <input
                            type="number"
                            placeholder="e.g., 2024"
                            min="1950"
                            max={new Date().getFullYear()}
                            value={filters.maxYear || ''}
                            onChange={(e) => handleYearChange('maxYear', e.target.value)}
                            className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Genres */}
                    <div className="border-t border-gray-800 pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Music2 size={18} className="text-[#1DB954]" />
                        <h4 className="font-semibold text-gray-300">Preferred Genres (Optional)</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {commonGenres.map(genre => (
                          <button
                            key={genre}
                            onClick={() => toggleGenre(genre)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                              filters.genres?.includes(genre)
                                ? 'bg-[#1DB954] text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reset Button */}
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={resetFilters}
                        className="px-6 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition text-sm"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Tracks */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl lg:rounded-2xl p-4 sm:p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold">Selected Tracks ({selectedTracks.length}/5)</h2>
                </div>
                
                {selectedTracks.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                      <Music className="text-gray-600" size={24} />
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm px-2">
                      Start by searching and selecting tracks
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 sm:space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-custom">
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

                    {/* Generate Button */}
                    <div className="mt-4 sm:mt-6">
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
              {/* Search Bar */}
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
                    <p className="text-gray-400 text-sm sm:text-base">No results found for &quot;{query}&quot;</p>
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