import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { getSpotifyClient } from "@/lib/spotify"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()
  
  if (!session?.accessToken || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { seedTracks } = await request.json()

    if (!seedTracks || !Array.isArray(seedTracks) || seedTracks.length < 3) {
      return NextResponse.json(
        { error: "At least 3 seed tracks required" },
        { status: 400 }
      )
    }

    const spotify = await getSpotifyClient(session.accessToken)
    
    // Get audio features for seed tracks
    const audioFeaturesResponse = await spotify.getAudioFeaturesForTracks(seedTracks)
    const seedAudioFeatures = audioFeaturesResponse.body.audio_features.filter(f => f !== null)
    
    // Calculate average audio features from seed tracks
    const avgFeatures = {
      danceability: seedAudioFeatures.reduce((sum, f) => sum + f.danceability, 0) / seedAudioFeatures.length,
      energy: seedAudioFeatures.reduce((sum, f) => sum + f.energy, 0) / seedAudioFeatures.length,
      valence: seedAudioFeatures.reduce((sum, f) => sum + f.valence, 0) / seedAudioFeatures.length,
      tempo: seedAudioFeatures.reduce((sum, f) => sum + f.tempo, 0) / seedAudioFeatures.length,
      acousticness: seedAudioFeatures.reduce((sum, f) => sum + f.acousticness, 0) / seedAudioFeatures.length,
    }

    // Get recommendations based on seed tracks and their audio features
    const recommendations = await spotify.getRecommendations({
      seed_tracks: seedTracks.slice(0, 5), // Spotify API allows max 5 seeds
      limit: 20,
      target_danceability: avgFeatures.danceability,
      target_energy: avgFeatures.energy,
      target_valence: avgFeatures.valence,
      target_tempo: avgFeatures.tempo,
      target_acousticness: avgFeatures.acousticness,
    })

    const recommendedTracks = recommendations.body.tracks.map(track => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map(a => a.name).join(", "),
      album: track.album.name,
      image: track.album.images[0]?.url,
      uri: track.uri,
      duration_ms: track.duration_ms,
    }))

    // Get seed track details
    const seedTracksDetails = await spotify.getTracks(seedTracks)
    const seedTracksData = seedTracksDetails.body.tracks.map(track => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map(a => a.name).join(", "),
      album: track.album.name,
      image: track.album.images[0]?.url,
      uri: track.uri,
      duration_ms: track.duration_ms,
    }))

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || "Unknown",
          spotifyId: session.user.email,
          image: session.user.image,
        }
      })
    }

    // Simple playlist metadata (default)
    let playlistName = `AI Playlist - ${new Date().toLocaleDateString()}`
    let playlistDescription = `Generated from ${seedTracks.length} seed tracks`
    let aiAnalysis = null
    
    // Use AI to analyze and create better playlist metadata
    try {
      const { analyzePlaylistWithAI } = await import("@/lib/openai")
      aiAnalysis = await analyzePlaylistWithAI(seedTracksData, avgFeatures)
      playlistName = aiAnalysis.playlistName
      playlistDescription = aiAnalysis.description
    } catch (error) {
      console.error("AI analysis failed, using defaults:", error)
    }

    // Prepare data for Prisma with proper typing
    const audioFeaturesData = {
      avgFeatures,
      seedAudioFeatures: seedAudioFeatures.map(f => ({
        danceability: f.danceability,
        energy: f.energy,
        key: f.key,
        loudness: f.loudness,
        mode: f.mode,
        speechiness: f.speechiness,
        acousticness: f.acousticness,
        instrumentalness: f.instrumentalness,
        liveness: f.liveness,
        valence: f.valence,
        tempo: f.tempo,
      }))
    }

    // Prepare AI reasoning data
    const aiReasoningData = aiAnalysis ? {
      mood: aiAnalysis.mood,
      recommendedGenres: aiAnalysis.recommendedGenres,
      reasoning: aiAnalysis.reasoning,
    } : null

    // Save playlist to database
    const playlist = await prisma.playlist.create({
      data: {
        name: playlistName,
        description: playlistDescription,
        seedTracks: seedTracksData as any,
        generatedTracks: recommendedTracks as any,
        audioFeatures: audioFeaturesData as any,
        aiReasoning: aiReasoningData as any,
        userId: user.id,
      }
    })

    return NextResponse.json({
      playlistId: playlist.id,
      tracks: recommendedTracks,
      seedTracks: seedTracksData,
      audioFeatures: avgFeatures,
    })
  } catch (error) {
    console.error("Playlist generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate playlist" },
      { status: 500 }
    )
  }
}