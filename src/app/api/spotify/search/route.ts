import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { getSpotifyClient } from "@/lib/spotify"

export async function GET(request: Request) {
  const session = await auth()
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query required" }, { status: 400 })
  }

  try {
    const spotify = await getSpotifyClient(session.accessToken)
    const results = await spotify.searchTracks(query, { limit: 20 })

    const tracks = results.body.tracks?.items.map(track => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map(artist => artist.name).join(", "),
      album: track.album.name,
      image: track.album.images[0]?.url,
      uri: track.uri,
      duration_ms: track.duration_ms,
    }))

    return NextResponse.json({ tracks })
  } catch (error) {
    console.error("Spotify search error:", error)
    return NextResponse.json(
      { error: "Failed to search tracks" },
      { status: 500 }
    )
  }
}