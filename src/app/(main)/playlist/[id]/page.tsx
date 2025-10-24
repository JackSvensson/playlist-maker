import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Music } from "lucide-react"
import { parsePlaylistData, type Track } from "@/types/playlist"
import AudioFeaturesVisualization from "@/components/AudioFeaturesVisualization"
import SaveToSpotifyButton from "@/components/SaveToSpotifyButton"

export default async function PlaylistPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  const playlist = await prisma.playlist.findUnique({
    where: { id: params.id },
    include: { user: true }
  })

  if (!playlist) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Playlist Not Found</h1>
          <Link href="/dashboard" className="text-[#1DB954] hover:underline">
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

  const totalDuration = generatedTracks.reduce((sum, track) => sum + track.duration_ms, 0)
  const totalMinutes = Math.floor(totalDuration / 60000)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        {/* Playlist Info */}
        <div className="bg-gradient-to-br from-[#1DB954] to-[#1ed760] rounded-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Music size={32} />
            <h1 className="text-4xl font-bold">{playlist.name}</h1>
          </div>
          <p className="text-white/90 mb-4">{playlist.description}</p>
          
          {/* AI Insights */}
          {aiReasoning?.mood && (
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                {aiReasoning.mood}
              </span>
              {aiReasoning.vibe && (
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                  {aiReasoning.vibe}
                </span>
              )}
              {aiReasoning.recommendedGenres?.slice(0, 3).map((genre: string) => (
                <span key={genre} className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                  {genre}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex gap-6 text-sm">
            <span>{generatedTracks.length} tracks</span>
            <span>•</span>
            <span>{totalMinutes} minutes</span>
            <span>•</span>
            <span>Created {new Date(playlist.createdAt).toLocaleDateString()}</span>
          </div>
          
          {/* Save to Spotify Button */}
          <div className="mt-6">
            <SaveToSpotifyButton 
              playlistId={playlist.id} 
              spotifyPlaylistId={playlist.spotifyPlaylistId}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Audio Features */}
          <div className="lg:col-span-1">
            {audioFeatures?.avgFeatures && (
              <AudioFeaturesVisualization 
                features={audioFeatures.avgFeatures}
              />
            )}
            
            {/* AI Reasoning */}
            {aiReasoning?.reasoning && (
              <div className="bg-gray-900 rounded-xl p-6 mt-6">
                <h3 className="font-bold mb-3 text-[#1DB954]">Why These Tracks?</h3>
                <p className="text-sm text-gray-300">{aiReasoning.reasoning}</p>
                
                {aiReasoning.listeningContext && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-400 mb-1">Best For:</p>
                    <p className="text-sm font-medium">{aiReasoning.listeningContext}</p>
                  </div>
                )}
                
                {aiReasoning.emotionalJourney && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-1">Emotional Journey:</p>
                    <p className="text-sm">{aiReasoning.emotionalJourney}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Tracks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seed Tracks */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Seed Tracks</h2>
              <div className="space-y-3">
                {seedTracks.map((track, index) => (
                  <div key={track.id} className="flex items-center gap-4 bg-gray-800 rounded-lg p-3">
                    <span className="text-gray-400 w-6">{index + 1}</span>
                    <Image
                      src={track.image || "/placeholder-album.png"}
                      alt={track.name}
                      width={50}
                      height={50}
                      className="rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{track.name}</p>
                      <p className="text-sm text-gray-400 truncate">{track.artists}</p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {formatDuration(track.duration_ms)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Tracks */}
            <div className="bg-gray-900 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Recommended Tracks</h2>
              <div className="space-y-2">
                {generatedTracks.map((track, index) => (
                  <div 
                    key={track.id} 
                    className="flex items-center gap-4 bg-gray-800 hover:bg-gray-750 rounded-lg p-3 transition"
                  >
                    <span className="text-gray-400 w-6">{index + 1}</span>
                    <Image
                      src={track.image || "/placeholder-album.png"}
                      alt={track.name}
                      width={50}
                      height={50}
                      className="rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{track.name}</p>
                      <p className="text-sm text-gray-400 truncate">{track.artists}</p>
                      <p className="text-xs text-gray-500 truncate">{track.album}</p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {formatDuration(track.duration_ms)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}