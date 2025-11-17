"use client"

import { useState } from "react"
import Link from "next/link"
import { Music, Calendar, X, Loader2 } from "lucide-react"
import ConfirmDialog from "./dialogs/ConfirmDialog"

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [playlistToDelete, setPlaylistToDelete] = useState<{ id: string; name: string } | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatDateFull = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const handleDeleteClick = (playlistId: string, playlistName: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setPlaylistToDelete({ id: playlistId, name: playlistName })
    setShowConfirmDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!playlistToDelete) return

    setDeletingId(playlistToDelete.id)
    
    try {
      const response = await fetch(`/api/playlist/${playlistToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete playlist")
      }

      setPlaylists(playlists.filter(p => p.id !== playlistToDelete.id))
      
    } catch (error) {
      console.error("Delete error:", error)
      // You could show an error toast here
      alert(`Failed to delete playlist: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeletingId(null)
      setPlaylistToDelete(null)
    }
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Your Playlists
          </h1>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
            Browse and manage all your AI-generated playlists
          </p>
        </div>

        {playlists.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center border border-gray-800">
            <Music size={48} className="mx-auto mb-3 sm:mb-4 text-gray-600 sm:w-16 sm:h-16" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">No playlists yet</h2>
            <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
              Create your first AI-powered playlist to get started
            </p>
            <Link
              href="/create"
              className="inline-block bg-[#1DB954] hover:bg-[#1ed760] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold transition text-sm sm:text-base"
            >
              Create Playlist
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 md:gap-6 md:grid-cols-2">
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
                    className="block bg-gradient-to-br from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 rounded-lg sm:rounded-xl p-3 sm:p-6 transition border border-gray-800 hover:border-gray-700"
                  >
                    <div className="flex items-start gap-2.5 sm:gap-4">
                      <div className="bg-gradient-to-br from-[#1DB954] to-[#1ed760] rounded-lg p-2.5 sm:p-4 flex-shrink-0 shadow-lg shadow-[#1DB954]/20">
                        <Music size={18} className="sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 pr-7 sm:pr-10">
                        <h2 className="text-sm sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2 group-hover:text-[#1DB954] transition line-clamp-2">
                          {playlist.name}
                        </h2>
                        
                        <p className="hidden sm:block text-gray-400 text-sm mb-3 line-clamp-2">
                          {playlist.description}
                        </p>
                        
                        <div className="flex items-center gap-1.5 sm:gap-3 text-[11px] sm:text-sm text-gray-500">
                          <span className="flex items-center gap-0.5 sm:gap-1">
                            <Music size={11} className="flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                            <span className="whitespace-nowrap">{trackCount}</span>
                          </span>
                          <span className="text-gray-700 text-[10px]">•</span>
                          <span className="flex items-center gap-0.5 sm:gap-1 truncate">
                            <Calendar size={11} className="flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                            <span className="sm:hidden text-[11px]">{formatDate(playlist.createdAt)}</span>
                            <span className="hidden sm:inline">{formatDateFull(playlist.createdAt)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteClick(playlist.id, playlist.name, e)}
                    disabled={isDeleting}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 p-1 sm:p-2 rounded-md sm:rounded-lg border border-red-500/20 hover:border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                    title="Delete playlist"
                    aria-label="Delete playlist"
                  >
                    {isDeleting ? (
                      <Loader2 size={12} className="animate-spin sm:w-[18px] sm:h-[18px]" />
                    ) : (
                      <X size={12} className="sm:w-[18px] sm:h-[18px]" />
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false)
          setPlaylistToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Playlist?"
        message={`Are you sure you want to delete "${playlistToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
      />
    </>
  )
}