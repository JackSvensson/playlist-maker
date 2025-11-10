import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Music, Calendar, Clock } from "lucide-react"
import { parsePlaylistData } from "@/types/playlist"
import SaveToSpotifyButton from "@/components/SaveToSpotifyButton"
import { PlaylistVisualizations, GenreDistribution, AIInsights } from "@/components/visualizations/PlaylistVisualizations"

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  const { id } = await params

  const playlist = await prisma.playlist.findUnique({
    where: { id },
    include: { user: true }
  })

  if (!playlist) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Playlist Not Found</h1>
          <Link href="/dashboard" className="text-[#1DB954] hover:underline text-sm sm:text-base">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const playlistData = parsePlaylistData(playlist)
  const { seedTracks, generatedTracks, audioFeatures, aiReasoning } = playlistData

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const totalDuration = generatedTracks.reduce((sum, track) => sum + (track.duration_ms || 0), 0)
  const totalMinutes = Math.floor(totalDuration / 60000)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Button */}
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 sm:mb-6 transition text-sm sm:text-base"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* Playlist Header Card */}
        <div className="bg-gradient-to-br from-purple-900/20 via-gray-900 to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-purple-500/20">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {/* Playlist Cover */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#1DB954] via-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
              <Music size={48} className="text-white/90 sm:w-16 sm:h-16 lg:w-20 lg:h-20" />
            </div>

            {/* Playlist Info */}
            <div className="flex-1 w-full sm:w-auto">
              <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">AI Generated Playlist</p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent break-words">
                {playlist.name}
              </h1>
              <p className="text-gray-300 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 line-clamp-3">
                {playlist.description}
              </p>
              
              {/* Tags */}
              {aiReasoning?.mood && (
                <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                  <span className="bg-[#1DB954]/20 text-[#1DB954] px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-[#1DB954]/30">
                    {aiReasoning.mood}
                  </span>
                  {aiReasoning.recommendedGenres?.slice(0, 3).map((genre: string) => (
                    <span key={genre} className="bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-purple-500/30">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Music size={14} className="sm:w-4 sm:h-4" />
                  <span>{generatedTracks.length} tracks</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Clock size={14} className="sm:w-4 sm:h-4" />
                  <span>{totalHours > 0 ? `${totalHours}h ${remainingMinutes}m` : `${remainingMinutes}m`}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{new Date(playlist.createdAt).toLocaleDateString()}</span>
                  <span className="sm:hidden">{new Date(playlist.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
              
              {/* Save Button */}
              <div className="w-full sm:w-auto">
                <SaveToSpotifyButton 
                  playlistId={playlist.id} 
                  spotifyPlaylistId={playlist.spotifyPlaylistId}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visualizations */}
        {audioFeatures && (
          <PlaylistVisualizations 
            audioFeatures={audioFeatures} 
            trackCount={generatedTracks.length}
          />
        )}

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Tracks */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Seed Tracks */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-800">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-1 h-5 sm:h-6 bg-[#1DB954] rounded-full"></span>
                Seed Tracks
              </h2>
              <div className="space-y-2">
                {seedTracks.map((track, index) => (
                  <div key={track.id} className="flex items-center gap-3 sm:gap-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg sm:rounded-xl p-2 sm:p-3 transition-all group">
                    <span className="text-gray-500 w-4 sm:w-6 text-center text-sm">{index + 1}</span>
                    <Image
                      src={track.image || "/placeholder-album.png"}
                      alt={track.name}
                      width={40}
                      height={40}
                      className="rounded sm:rounded-lg w-10 h-10 sm:w-12 sm:h-12"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-sm sm:text-base group-hover:text-[#1DB954] transition">{track.name}</p>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">{track.artists}</p>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">
                      {formatDuration(track.duration_ms || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Tracks */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span className="w-1 h-5 sm:h-6 bg-purple-500 rounded-full"></span>
                  <span className="hidden sm:inline">Recommended Tracks</span>
                  <span className="sm:hidden">Tracks</span>
                </h2>
              </div>
              <div className="space-y-1 sm:space-y-2 max-h-[500px] sm:max-h-[600px] overflow-y-auto scrollbar-custom pr-1 sm:pr-2">
                {generatedTracks.map((track, index) => (
                  <div 
                    key={track.id} 
                    className="flex items-center gap-3 sm:gap-4 bg-gray-800/30 hover:bg-gray-700/50 rounded-lg sm:rounded-xl p-2 sm:p-3 transition-all group cursor-pointer"
                  >
                    <span className="text-gray-500 w-4 sm:w-6 text-center text-xs sm:text-sm">{index + 1}</span>
                    <Image
                      src={track.image || "/placeholder-album.png"}
                      alt={track.name}
                      width={40}
                      height={40}
                      className="rounded sm:rounded-lg w-10 h-10 sm:w-12 sm:h-12"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-sm sm:text-base group-hover:text-[#1DB954] transition">{track.name}</p>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">{track.artists}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate hidden sm:block">{track.album}</p>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline flex-shrink-0">
                      {formatDuration(track.duration_ms || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Insights */}
          <div className="space-y-4 sm:space-y-6">
            {/* Genre Distribution */}
            {aiReasoning?.recommendedGenres && aiReasoning.recommendedGenres.length > 0 && (
              <GenreDistribution genres={aiReasoning.recommendedGenres} />
            )}

            {/* AI Insights */}
            {aiReasoning && (
              <AIInsights aiReasoning={aiReasoning} />
            )}

            {/* Why These Tracks */}
            {aiReasoning?.reasoning && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-800">
                <h3 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">🤖</span>
                  Why These Tracks?
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {aiReasoning.reasoning}
                </p>
                
                {aiReasoning.listeningContext && (
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
                    <p className="text-[10px] sm:text-xs text-gray-400 mb-1">Best For:</p>
                    <p className="text-xs sm:text-sm font-medium text-[#1DB954]">{aiReasoning.listeningContext}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}