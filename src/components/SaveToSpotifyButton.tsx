"use client"

import { useState } from "react"
import { Music, Loader2, Check, ExternalLink } from "lucide-react"

interface SaveToSpotifyButtonProps {
  playlistId: string
  spotifyPlaylistId?: string | null
}

export default function SaveToSpotifyButton({ 
  playlistId, 
  spotifyPlaylistId 
}: SaveToSpotifyButtonProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(!!spotifyPlaylistId)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (saved) {
      if (spotifyPlaylistId) {
        window.open(`https://open.spotify.com/playlist/${spotifyPlaylistId}`, '_blank')
      }
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/playlist/save-to-spotify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playlistId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to save playlist')
      }

      const data = await response.json()
      
      setSaved(true)
      
      alert(`✅ Playlist saved to Spotify with ${data.trackCount} tracks!`)
      
      if (data.spotifyUrl) {
        window.open(data.spotifyUrl, '_blank')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save playlist'
      console.error('Save to Spotify error:', err)
      setError(errorMessage)
      alert(`❌ Failed to save: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <button
        onClick={handleSave}
        className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white text-black px-3 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-base font-bold hover:scale-105 transition w-full sm:w-auto"
      >
        <Check size={14} className="sm:w-5 sm:h-5" />
        <span className="hidden xs:inline">Saved to Spotify</span>
        <span className="xs:hidden">Saved</span>
        <ExternalLink size={12} className="sm:w-4 sm:h-4" />
      </button>
    )
  }

  return (
    <div className="w-full sm:w-auto">
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white text-black px-3 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-base font-bold hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition w-full"
      >
        {saving ? (
          <>
            <Loader2 size={14} className="animate-spin sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Saving...</span>
            <span className="xs:hidden">Saving</span>
          </>
        ) : (
          <>
            <Music size={14} className="sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Save to Spotify</span>
            <span className="xs:hidden">Save</span>
          </>
        )}
      </button>
      
      {error && (
        <p className="text-red-400 text-[10px] sm:text-sm mt-2">{error}</p>
      )}
    </div>
  )
}