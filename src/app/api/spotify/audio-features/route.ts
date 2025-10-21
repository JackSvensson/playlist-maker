import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { getSpotifyClient } from "@/lib/spotify"

export async function POST(request: Request) {
  const session = await auth()
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { trackIds } = await request.json()

    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      return NextResponse.json(
        { error: "Track IDs required" },
        { status: 400 }
      )
    }

    const spotify = await getSpotifyClient(session.accessToken)
    
    // Get audio features for multiple tracks
    const audioFeatures = await spotify.getAudioFeaturesForTracks(trackIds)
    
    // Get track details
    const tracks = await spotify.getTracks(trackIds)

    const combinedData = tracks.body.tracks.map((track, index) => {
      const features = audioFeatures.body.audio_features[index]
      
      return {
        id: track?.id,
        name: track?.name,
        artists: track?.artists.map(a => a.name).join(", "),
        album: track?.album.name,
        image: track?.album.images[0]?.url,
        duration_ms: track?.duration_ms,
        audioFeatures: features ? {
          danceability: features.danceability,
          energy: features.energy,
          key: features.key,
          loudness: features.loudness,
          mode: features.mode,
          speechiness: features.speechiness,
          acousticness: features.acousticness,
          instrumentalness: features.instrumentalness,
          liveness: features.liveness,
          valence: features.valence,
          tempo: features.tempo,
        } : null
      }
    })

    return NextResponse.json({ tracks: combinedData })
  } catch (error) {
    console.error("Audio features error:", error)
    return NextResponse.json(
      { error: "Failed to fetch audio features" },
      { status: 500 }
    )
  }
}