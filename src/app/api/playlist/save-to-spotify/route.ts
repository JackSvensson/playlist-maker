import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { getSpotifyClient } from "@/lib/spotify"
import { prisma } from "@/lib/prisma"

interface TrackWithUri {
  uri: string
}

interface SpotifyError {
  body?: {
    error?: {
      message?: string
    }
  }
  message?: string
}

export async function POST(request: Request) {
  const session = await auth()
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { playlistId } = await request.json()

    if (!playlistId) {
      return NextResponse.json(
        { error: "Playlist ID required" },
        { status: 400 }
      )
    }

    // Get playlist from database
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    })

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      )
    }

    const spotify = await getSpotifyClient(session.accessToken)
    
    // Get user's Spotify ID
    const meResponse = await spotify.getMe()
    const spotifyUserId = meResponse.body.id

    // Create playlist on Spotify
    const createdPlaylistResponse = await spotify.createPlaylist(
      playlist.name,
      {
        description: playlist.description || "Created with AI Playlist Generator",
        public: false, // Private by default
      }
    )

    // Extract body safely - spotify-web-api-node returns body in the response
    const spotifyPlaylistId = createdPlaylistResponse.body.id
    const spotifyUrl = createdPlaylistResponse.body.external_urls?.spotify

    console.log(`✅ Created Spotify playlist: ${spotifyPlaylistId}`)

    // Get track URIs from generated tracks with proper typing
    const generatedTracks = playlist.generatedTracks as unknown as TrackWithUri[]
    const trackUris = generatedTracks
      .map(track => track.uri)
      .filter((uri): uri is string => typeof uri === 'string' && uri.length > 0)

    if (trackUris.length === 0) {
      return NextResponse.json(
        { error: "No tracks to add to playlist" },
        { status: 400 }
      )
    }

    // Add tracks to playlist (Spotify limits to 100 tracks per request)
    const batchSize = 100
    for (let i = 0; i < trackUris.length; i += batchSize) {
      const batch = trackUris.slice(i, i + batchSize)
      await spotify.addTracksToPlaylist(spotifyPlaylistId, batch)
      console.log(`✅ Added ${batch.length} tracks to playlist`)
    }

    // Update playlist in database with Spotify ID
    await prisma.playlist.update({
      where: { id: playlistId },
      data: { spotifyPlaylistId: spotifyPlaylistId },
    })

    return NextResponse.json({
      success: true,
      spotifyPlaylistId: spotifyPlaylistId,
      spotifyUrl: spotifyUrl,
      trackCount: trackUris.length,
    })
  } catch (error: unknown) {
    console.error("Save to Spotify error:", error)
    
    const spotifyError = error as SpotifyError
    const errorMessage = spotifyError.message || "Unknown error"
    const errorBody = spotifyError.body?.error?.message
    
    return NextResponse.json(
      { 
        error: "Failed to save playlist to Spotify",
        details: errorBody || errorMessage
      },
      { status: 500 }
    )
  }
}