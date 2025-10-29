import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Music, Calendar } from "lucide-react"

interface PlaylistTrack {
  id: string
  name: string
  artists: string
}

export default async function HistoryPage() {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      playlists: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  const playlists = user?.playlists || []

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-8">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <h1 className="text-5xl font-bold mb-8">Your Playlists</h1>

        {playlists.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-12 text-center">
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
              const tracks = playlist.generatedTracks as unknown as PlaylistTrack[]
              const trackCount = tracks?.length || 0
              
              return (
                <Link
                  key={playlist.id}
                  href={`/playlist/${playlist.id}`}
                  className="bg-gray-900 hover:bg-gray-800 rounded-xl p-6 transition group"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-[#1DB954] to-[#1ed760] rounded-lg p-4 flex-shrink-0">
                      <Music size={32} />
                    </div>
                    <div className="flex-1 min-w-0">
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
                          {new Date(playlist.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}