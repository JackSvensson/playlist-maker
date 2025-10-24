"use client"

import { useState } from "react"
import { Sliders, Calendar, Music2 } from "lucide-react"

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

interface PlaylistFiltersProps {
  onFiltersChange: (filters: PlaylistFilters) => void
  onApply: () => void
}

export default function PlaylistFilters({ onFiltersChange, onApply }: PlaylistFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<PlaylistFilters>({
    targetEnergy: 0.5,
    targetDanceability: 0.5,
    targetValence: 0.5,
    targetTempo: 120,
    targetAcousticness: 0.5,
    limit: 20,
  })

  const handleSliderChange = (key: keyof PlaylistFilters, value: number) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleYearChange = (key: 'minYear' | 'maxYear', value: string) => {
    const year = parseInt(value) || undefined
    const newFilters = { ...filters, [key]: year }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const resetFilters = () => {
    const defaultFilters: PlaylistFilters = {
      targetEnergy: 0.5,
      targetDanceability: 0.5,
      targetValence: 0.5,
      targetTempo: 120,
      targetAcousticness: 0.5,
      limit: 20,
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
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
    
    const newFilters = { ...filters, genres: newGenres }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 mb-6">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-xl font-bold mb-4 hover:text-[#1DB954] transition"
      >
        <Sliders size={24} />
        Advanced Filters {showFilters ? '▼' : '▶'}
      </button>

      {showFilters && (
        <div className="space-y-6">
          {/* Audio Features Sliders */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Energy */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Energy: {(filters.targetEnergy! * 100).toFixed(0)}%
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
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Calm</span>
                <span>Intense</span>
              </div>
            </div>

            {/* Danceability */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Danceability: {(filters.targetDanceability! * 100).toFixed(0)}%
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
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Not Danceable</span>
                <span>Very Danceable</span>
              </div>
            </div>

            {/* Valence (Mood) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Mood: {(filters.targetValence! * 100).toFixed(0)}%
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
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Sad</span>
                <span>Happy</span>
              </div>
            </div>

            {/* Tempo */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tempo: {filters.targetTempo?.toFixed(0)} BPM
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
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>

            {/* Acousticness */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Acousticness: {(filters.targetAcousticness! * 100).toFixed(0)}%
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
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Electronic</span>
                <span>Acoustic</span>
              </div>
            </div>

            {/* Playlist Size */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Playlist Size: {filters.limit} tracks
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
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10 tracks</span>
                <span>50 tracks</span>
              </div>
            </div>
          </div>

          {/* Year Range */}
          <div className="border-t border-gray-800 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={20} className="text-[#1DB954]" />
              <h3 className="font-semibold">Release Year Range</h3>
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
              <Music2 size={20} className="text-[#1DB954]" />
              <h3 className="font-semibold">Preferred Genres (Optional)</h3>
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

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onApply}
              className="flex-1 bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold py-3 rounded-lg transition"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="px-6 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-lg transition"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}