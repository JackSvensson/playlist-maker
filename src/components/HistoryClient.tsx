"use client"

import { useState } from "react"
import Link from "next/link"
import { Music, Calendar, X, Loader2 } from "lucide-react"

interface PlaylistTrack {
  id: string
  name: string
  artists: string
}

interface Playlist {
  id: string
  name: string
  description: string | null
  generatedTracks: PlaylistTrack[]
  createdAt: string
}

export default function HistoryClient({ initialPlaylists }: { initialPlaylists: Playlist[] }) {
  const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    })
  }

  const handleDelete = async (playlistId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm("Are you sure you want to delete this playlist?")) {
      return
    }

    setDeletingId(playlistId)
    
    try {
      const response = await fetch(`/api/playlist/${playlistId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete playlist")
      }

      setPlaylists(playlists.filter(p => p.id !== playlistId))
      
    } catch (error) {
      console.error("Delete error:", error)
      alert(`Failed to delete playlist: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Your Playlists
        </h1>
        <p className="text-gray-400 text-base sm:text-lg">
          Browse and manage all your AI-generated playlists
        </p>
      </div>

      {playlists.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-12 text-center border border-gray-800">
          <Music size={64} className="mx-auto mb-4 text-gray-600" />
          <h2 className="text-2xl font-bold mb-2">No playlists yet</h2>
          <p className="text-gray-400 mb-6">
            Create your first AI-powered playlist to get started
          </p>
          <Link
            href="/create"
            className="inline-block bg-[#1DB954] hover:bg-[#1ed760] text-white px-8 py-3 rounded-full font-semibold transition"
          >
            Create Playlist
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {playlists.map(playlist => {
            const tracks = playlist.generatedTracks as PlaylistTrack[]
            const trackCount = tracks?.length || 0
            const isDeleting = deletingId === playlist.id
            
            return (
              <div
                key={playlist.id}
                className="relative group"
              >
                <Link
                  href={`/playlist/${playlist.id}`}
                  className="block bg-gradient-to-br from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 rounded-xl p-6 transition border border-gray-800 hover:border-gray-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-[#1DB954] to-[#1ed760] rounded-lg p-4 flex-shrink-0">
                      <Music size={32} />
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <h2 className="text-xl font-bold mb-2 group-hover:text-[#1DB954] transition truncate">
                        {playlist.name}
                      </h2>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {playlist.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Music size={14} />
                          {trackCount} tracks
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(playlist.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDelete(playlist.id, e)}
                  disabled={isDeleting}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 p-2 rounded-lg border border-red-500/20 hover:border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                  title="Delete playlist"
                >
                  {isDeleting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <X size={18} />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}