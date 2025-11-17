"use client"

import { useState } from "react"
import { Music, Loader2, Check, ExternalLink } from "lucide-react"
import Toast from "./dialogs/Toast"

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
  const [savedSpotifyUrl, setSavedSpotifyUrl] = useState<string | null>(
    spotifyPlaylistId ? `https://open.spotify.com/playlist/${spotifyPlaylistId}` : null
  )
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastData, setToastData] = useState<{ url?: string; count?: number }>({})

  const handleSave = async () => {
    // If already saved, open Spotify
    if (saved && savedSpotifyUrl) {
      window.open(savedSpotifyUrl, '_blank')
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
      
      console.log("✅ Save successful:", data) // Debug log
      
      // Update state
      setSaved(true)
      setSavedSpotifyUrl(data.spotifyUrl || null)
      
      // Show toast
      setToastData({
        url: data.spotifyUrl,
        count: data.trackCount
      })
      setShowToast(true)
      
      // Open Spotify immediately (in same user action to avoid popup blocker)
      if (data.spotifyUrl) {
        console.log("🎵 Opening Spotify:", data.spotifyUrl) // Debug log
        window.open(data.spotifyUrl, '_blank')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save playlist'
      console.error('❌ Save to Spotify error:', err)
      setError(errorMessage)
      
      // Show error toast instead of alert
      setToastData({
        url: undefined,
        count: undefined
      })
      setShowToast(true)
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <>
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white text-black px-3 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-base font-bold hover:scale-105 transition w-full sm:w-auto"
        >
          <Check size={14} className="sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Saved to Spotify</span>
          <span className="xs:hidden">Saved</span>
          <ExternalLink size={12} className="sm:w-4 sm:h-4" />
        </button>

        {/* Toast Notification */}
        <Toast
          message={error || "Playlist saved to Spotify!"}
          isOpen={showToast}
          onClose={() => setShowToast(false)}
          spotifyUrl={toastData.url}
          trackCount={toastData.count}
          isError={!!error}
        />
      </>
    )
  }

  return (
    <>
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

      {/* Toast Notification */}
      <Toast
        message={error || "Playlist saved to Spotify!"}
        isOpen={showToast}
        onClose={() => setShowToast(false)}
        spotifyUrl={toastData.url}
        trackCount={toastData.count}
        isError={!!error}
      />
    </>
  )
}