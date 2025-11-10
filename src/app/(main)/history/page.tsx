import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import HistoryClient from "@/components/HistoryClient"

interface PlaylistTrack {
  id: string
  name: string
  artists: string
}

interface SerializedPlaylist {
  id: string
  name: string
  description: string | null
  generatedTracks: PlaylistTrack[]
  createdAt: string
}

// Helper function to safely convert JsonValue to PlaylistTrack[]
function parseGeneratedTracks(jsonValue: unknown): PlaylistTrack[] {
  if (!Array.isArray(jsonValue)) {
    return []
  }
  
  return jsonValue.map((item: unknown) => {
    const track = item as Record<string, unknown>
    return {
      id: String(track.id || ''),
      name: String(track.name || ''),
      artists: String(track.artists || ''),
    }
  })
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

  // Convert to plain objects for client component with safe parsing
  const playlists: SerializedPlaylist[] = user?.playlists.map(playlist => ({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    generatedTracks: parseGeneratedTracks(playlist.generatedTracks),
    createdAt: playlist.createdAt.toISOString(),
  })) || []

  return <HistoryClient initialPlaylists={playlists} />
}