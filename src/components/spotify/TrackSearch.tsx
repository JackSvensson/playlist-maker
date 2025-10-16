"use client"

import { useState } from "react"
import { Search, Plus, X } from "lucide-react"
import Image from "next/image"

interface Track {
  id: string
  name: string
  artists: string
  album: string
  image: string
  uri: string
  duration_ms: number
}

export default function TrackSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Track[]>([])
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)

  const searchTracks = async (searchQuery: string) => {
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
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchTracks(value)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const addTrack = (track: Track) => {
    if (selectedTracks.length >= 5) {
      alert("Maximum 5 tracks allowed")
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

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-8">
      {/* Selected Tracks */}
      {selectedTracks.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">
            Selected Tracks ({selectedTracks.length}/5)
          </h2>
          <div className="space-y-3">
            {selectedTracks.map(track => (
              <div
                key={track.id}
                className="flex items-center gap-4 bg-gray-800 rounded-lg p-3"
              >
                <Image
                  src={track.image}
                  alt={track.name}
                  width={50}
                  height={50}
                  className="rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold">{track.name}</p>
                  <p className="text-sm text-gray-400">{track.artists}</p>
                </div>
                <button
                  onClick={() => removeTrack(track.id)}
                  className="p-2 hover:bg-gray-700 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>

          {selectedTracks.length >= 3 && (
            <button
              className="w-full mt-4 bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold py-3 rounded-full transition"
              onClick={() => {
                // TODO: Generate playlist
                alert("Playlist generation coming in next step!")
              }}
            >
              Generate Playlist
            </button>
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
        </div>

        {/* Search Results */}
        {loading && (
          <p className="text-center text-gray-400 mt-8">Searching...</p>
        )}

        {results.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="text-xl font-semibold mb-4">Search Results</h3>
            {results.map(track => (
              <div
                key={track.id}
                className="flex items-center gap-4 bg-gray-900 hover:bg-gray-800 rounded-lg p-3 transition cursor-pointer"
                onClick={() => addTrack(track)}
              >
                <Image
                  src={track.image}
                  alt={track.name}
                  width={50}
                  height={50}
                  className="rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold">{track.name}</p>
                  <p className="text-sm text-gray-400">{track.artists}</p>
                  <p className="text-xs text-gray-500">{track.album}</p>
                </div>
                <span className="text-sm text-gray-400">
                  {formatDuration(track.duration_ms)}
                </span>
                <button className="p-2 bg-[#1DB954] hover:bg-[#1ed760] rounded-full transition">
                  <Plus size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}