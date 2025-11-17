import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { Music, Calendar, Clock } from "lucide-react"
import { parsePlaylistData } from "@/types/playlist"
import SaveToSpotifyButton from "@/components/SaveToSpotifyButton"
import { PlaylistVisualizations, GenreDistribution, AIInsights } from "@/components/visualizations/PlaylistVisualizations"
import Header from "@/components/Header"
import BackButton from "@/components/BackButton"

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
      <div className="min-h-screen bg-black text-white">
        <Header 
          user={session.user} 
          onLogout={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}
        />
        <div className="flex items-center justify-center px-4 pt-20">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Playlist Not Found</h1>
            <Link href="/dashboard" className="text-[#1DB954] hover:underline text-sm sm:text-base">
              Go to Dashboard
            </Link>
          </div>
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
    <div className="min-h-screen bg-black text-white pb-6">
      <Header 
        user={session.user} 
        onLogout={async () => {
          "use server"
          await signOut({ redirectTo: "/login" })
        }}
      />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6 lg:py-8">
        {/* Back Button */}
        <BackButton />

        {/* Playlist Header Card - Optimized for Mobile */}
        <div className="bg-gradient-to-br from-purple-900/20 via-gray-900 to-gray-900 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-5 lg:p-8 mb-3 sm:mb-6 lg:mb-8 border border-purple-500/20">
          <div className="flex items-start gap-2 sm:gap-4 lg:gap-6">
            {/* Playlist Cover - Smaller on Mobile */}
            <div className="relative w-14 h-14 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-md sm:rounded-lg bg-gradient-to-br from-[#1DB954] via-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Music size={20} className="text-white/90 sm:w-12 sm:h-12 lg:w-16 lg:h-16" />
            </div>

            {/* Playlist Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[8px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">AI Playlist</p>
              <h1 className="text-sm sm:text-2xl lg:text-4xl font-bold mb-1 sm:mb-3 lg:mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent line-clamp-2 sm:line-clamp-none">
                {playlist.name}
              </h1>
              
              {/* Description - Hide on mobile */}
              <p className="hidden sm:block text-gray-300 text-xs sm:text-sm lg:text-base mb-3 sm:mb-4 lg:mb-6 line-clamp-2">
                {playlist.description}
              </p>
              
              {/* Tags - Show max 2 on mobile */}
              {aiReasoning?.mood && (
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-1.5 sm:mb-4 lg:mb-6">
                  <span className="bg-[#1DB954]/20 text-[#1DB954] px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full text-[8px] sm:text-xs font-medium border border-[#1DB954]/30">
                    {aiReasoning.mood}
                  </span>
                  {aiReasoning.recommendedGenres?.[0] && (
                    <span className="bg-purple-500/20 text-purple-300 px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full text-[8px] sm:text-xs font-medium border border-purple-500/30 line-clamp-1">
                      {aiReasoning.recommendedGenres[0]}
                    </span>
                  )}
                  {aiReasoning.recommendedGenres?.slice(1, 3).map((genre: string) => (
                    <span key={genre} className="hidden sm:inline bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-full text-xs font-medium border border-purple-500/30">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Meta Info - Compact on mobile */}
              <div className="flex flex-wrap items-center gap-1 sm:gap-3 text-[8px] sm:text-xs text-gray-400 mb-2 sm:mb-4 lg:mb-6">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Music size={9} className="sm:w-3.5 sm:h-3.5" />
                  <span>{generatedTracks.length}</span>
                </div>
                <span className="text-gray-700 text-[6px] sm:text-xs">•</span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Clock size={9} className="sm:w-3.5 sm:h-3.5" />
                  <span>{totalHours > 0 ? `${totalHours}h ${remainingMinutes}m` : `${remainingMinutes}m`}</span>
                </div>
                <span className="text-gray-700 text-[6px] sm:text-xs hidden sm:inline">•</span>
                <div className="hidden sm:flex items-center gap-1">
                  <Calendar size={9} className="sm:w-3.5 sm:h-3.5" />
                  <span className="text-[8px] sm:text-xs">{new Date(playlist.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
              
              {/* Save Button - Compact on mobile */}
              <div className="w-full sm:w-auto mt-2 sm:mt-0">
                <SaveToSpotifyButton 
                  playlistId={playlist.id} 
                  spotifyPlaylistId={playlist.spotifyPlaylistId}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visualizations - Hide on mobile */}
        {audioFeatures && (
          <div className="hidden md:block">
            <PlaylistVisualizations 
              audioFeatures={audioFeatures} 
              trackCount={generatedTracks.length}
              aiReasoning={aiReasoning || undefined}
            />
          </div>
        )}

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* Main Content - Tracks */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Seed Tracks - Simplified for Mobile */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-5 lg:p-6 border border-gray-800">
              <h2 className="text-sm sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1 sm:gap-2">
                <span className="w-0.5 sm:w-1 h-3 sm:h-5 lg:h-6 bg-[#1DB954] rounded-full"></span>
                <span>Seed ({seedTracks.length})</span>
              </h2>
              <div className="space-y-1 sm:space-y-2">
                {seedTracks.map((track, index) => (
                  <div key={track.id} className="flex items-center gap-1.5 sm:gap-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-md sm:rounded-lg p-1.5 sm:p-3 transition-all group">
                    <span className="text-gray-500 w-3 sm:w-4 lg:w-6 text-center text-[9px] sm:text-xs">{index + 1}</span>
                    <Image
                      src={track.image || "/placeholder-album.png"}
                      alt={track.name}
                      width={32}
                      height={32}
                      className="rounded w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-[10px] sm:text-sm group-hover:text-[#1DB954] transition">{track.name}</p>
                      <p className="text-[8px] sm:text-xs text-gray-400 truncate">{track.artists}</p>
                    </div>
                    <span className="text-[8px] sm:text-xs text-gray-500 hidden sm:inline flex-shrink-0">
                      {formatDuration(track.duration_ms || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Tracks - Optimized for Mobile */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-5 lg:p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                <h2 className="text-sm sm:text-lg lg:text-xl font-bold flex items-center gap-1 sm:gap-2">
                  <span className="w-0.5 sm:w-1 h-3 sm:h-5 lg:h-6 bg-purple-500 rounded-full"></span>
                  <span>Tracks ({generatedTracks.length})</span>
                </h2>
              </div>
              <div className="space-y-0.5 sm:space-y-1.5 max-h-[350px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto scrollbar-custom pr-1 sm:pr-2">
                {generatedTracks.map((track, index) => (
                  <div 
                    key={track.id} 
                    className="flex items-center gap-1.5 sm:gap-3 bg-gray-800/30 hover:bg-gray-700/50 rounded-md sm:rounded-lg p-1.5 sm:p-2 lg:p-3 transition-all group"
                  >
                    <span className="text-gray-500 w-3 sm:w-4 lg:w-6 text-center text-[9px] sm:text-xs">{index + 1}</span>
                    <Image
                      src={track.image || "/placeholder-album.png"}
                      alt={track.name}
                      width={32}
                      height={32}
                      className="rounded w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-[10px] sm:text-sm group-hover:text-[#1DB954] transition">{track.name}</p>
                      <p className="text-[8px] sm:text-xs text-gray-400 truncate">{track.artists}</p>
                    </div>
                    <span className="text-[8px] sm:text-xs text-gray-500 hidden sm:inline flex-shrink-0">
                      {formatDuration(track.duration_ms || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Insights - Simplified for Mobile */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Genre Distribution */}
            {aiReasoning?.recommendedGenres && aiReasoning.recommendedGenres.length > 0 && (
              <GenreDistribution genres={aiReasoning.recommendedGenres} />
            )}

            {/* AI Insights */}
            {aiReasoning && (
              <AIInsights aiReasoning={aiReasoning} />
            )}

            {/* Why These Tracks - Shortened for Mobile */}
            {aiReasoning?.reasoning && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-5 lg:p-6 border border-gray-800">
                <h3 className="text-xs sm:text-base lg:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
                  <span className="text-base sm:text-xl lg:text-2xl">🤖</span>
                  <span>Why These?</span>
                </h3>
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-300 leading-relaxed line-clamp-3 sm:line-clamp-none">
                  {aiReasoning.reasoning}
                </p>
                
                {aiReasoning.listeningContext && (
                  <div className="mt-2 sm:mt-3 lg:mt-4 pt-2 sm:pt-3 lg:pt-4 border-t border-gray-700">
                    <p className="text-[8px] sm:text-xs text-gray-400 mb-1">Best For:</p>
                    <p className="text-[10px] sm:text-sm font-medium text-[#1DB954] line-clamp-2 sm:line-clamp-none">{aiReasoning.listeningContext}</p>
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