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
      // If already saved, just open in Spotify
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
      
      // Success notification
      alert(`✅ Playlist saved to Spotify with ${data.trackCount} tracks!`)
      
      // Open in Spotify
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
        className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition"
      >
        <Check size={20} />
        Saved to Spotify
        <ExternalLink size={16} />
      </button>
    )
  }

  return (
    <div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition"
      >
        {saving ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Saving to Spotify...
          </>
        ) : (
          <>
            <Music size={20} />
            Save to Spotify
          </>
        )}
      </button>
      
      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}