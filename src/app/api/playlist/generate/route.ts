import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { getSpotifyClient } from "@/lib/spotify"
import { prisma } from "@/lib/prisma"

// Define types for our track data
interface TrackData {
  id: string
  name: string
  artists: string
  album: string
  image: string | undefined
  uri: string
  duration_ms: number
}

interface AudioFeature {
  danceability: number
  energy: number
  key: number
  loudness: number
  mode: number
  speechiness: number
  acousticness: number
  instrumentalness: number
  liveness: number
  valence: number
  tempo: number
}

export async function POST(request: Request) {
  const session = await auth()
  
  if (!session?.accessToken || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { seedTracks, filters } = await request.json()

    if (!seedTracks || !Array.isArray(seedTracks) || seedTracks.length < 3) {
      return NextResponse.json(
        { error: "At least 3 seed tracks required" },
        { status: 400 }
      )
    }

    const spotify = await getSpotifyClient(session.accessToken)
    
    let seedTracksData: TrackData[] = []
    let seedAudioFeatures: AudioFeature[] = []
    let avgFeatures = {
      danceability: 0.5,
      energy: 0.5,
      valence: 0.5,
      tempo: 120,
      acousticness: 0.5,
    }

    try {
      const seedTracksDetails = await spotify.getTracks(seedTracks)
      seedTracksData = seedTracksDetails.body.tracks.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(a => a.name).join(", "),
        album: track.album.name,
        image: track.album.images[0]?.url,
        uri: track.uri,
        duration_ms: track.duration_ms,
      }))
      
      const audioFeaturesResponse = await spotify.getAudioFeaturesForTracks(seedTracks)
      seedAudioFeatures = audioFeaturesResponse.body.audio_features
        .filter((f): f is NonNullable<typeof f> => f !== null)
        .map(f => ({
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
      
      if (seedAudioFeatures.length > 0) {
        avgFeatures = {
          danceability: seedAudioFeatures.reduce((sum, f) => sum + f.danceability, 0) / seedAudioFeatures.length,
          energy: seedAudioFeatures.reduce((sum, f) => sum + f.energy, 0) / seedAudioFeatures.length,
          valence: seedAudioFeatures.reduce((sum, f) => sum + f.valence, 0) / seedAudioFeatures.length,
          tempo: seedAudioFeatures.reduce((sum, f) => sum + f.tempo, 0) / seedAudioFeatures.length,
          acousticness: seedAudioFeatures.reduce((sum, f) => sum + f.acousticness, 0) / seedAudioFeatures.length,
        }
      }
    } catch (error) {
      console.error("❌ Failed to get seed track details:", error)
    }

    let recommendedTracks: TrackData[] = []
    let usedFallback = false

    try {
      console.log("🎵 Attempting to get Spotify Recommendations...")
      const recommendations = await spotify.getRecommendations({
        seed_tracks: seedTracks.slice(0, 5),
        limit: filters?.limit || 20,
        target_danceability: filters?.targetDanceability || avgFeatures.danceability,
        target_energy: filters?.targetEnergy || avgFeatures.energy,
        target_valence: filters?.targetValence || avgFeatures.valence,
        target_tempo: filters?.targetTempo || avgFeatures.tempo,
        target_acousticness: filters?.targetAcousticness || avgFeatures.acousticness,
        // Lägg till year filters om de finns:
        ...(filters?.minYear && { min_release_date: `${filters.minYear}-01-01` }),
        ...(filters?.maxYear && { max_release_date: `${filters.maxYear}-12-31` }),
      })

      recommendedTracks = recommendations.body.tracks.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(a => a.name).join(", "),
        album: track.album.name,
        image: track.album.images[0]?.url,
        uri: track.uri,
        duration_ms: track.duration_ms,
      }))
      
      console.log("✅ Got recommendations successfully!")
      
    } catch (error: any) {
      console.log("⚠️ Recommendations API failed, using DEVELOPMENT MODE optimized algorithm...")
      usedFallback = true
      
      // DEVELOPMENT MODE OPTIMIZED ALGORITHM
      // Uses only APIs that work in dev mode: Albums, Tracks, Search
      try {
        const uniqueTracks = new Map<string, TrackData>()
        const seedTracksDetails = await spotify.getTracks(seedTracks)
        const seedArtistIds = seedTracksDetails.body.tracks.map(t => t.artists[0].id)
        const seedArtistNames = seedTracksDetails.body.tracks.map(t => t.artists[0].name)
        
        console.log("🔍 Strategy 1: Getting diverse albums from seed artists...")
        // Get multiple albums per artist for variety
        for (const artistId of seedArtistIds) {
          try {
            const albums = await spotify.getArtistAlbums(artistId, { 
              limit: 5, // More albums = more variety
              include_groups: 'album,single,compilation'
            })
            
            // Shuffle albums to get random variety
            const shuffledAlbums = albums.body.items.sort(() => Math.random() - 0.5)
            
            for (const album of shuffledAlbums.slice(0, 3)) {
              try {
                const albumTracks = await spotify.getAlbumTracks(album.id, { limit: 15 })
                
                // Take random tracks from different parts of the album
                const trackCount = albumTracks.body.items.length
                const positions = [
                  Math.floor(trackCount * 0.2), // 20% into album
                  Math.floor(trackCount * 0.5), // Middle
                  Math.floor(trackCount * 0.8), // 80% into album
                ]
                
                for (const pos of positions) {
                  const track = albumTracks.body.items[pos]
                  if (track && !uniqueTracks.has(track.id) && !seedTracks.includes(track.id)) {
                    try {
                      const fullTrack = await spotify.getTrack(track.id)
                      uniqueTracks.set(fullTrack.body.id, {
                        id: fullTrack.body.id,
                        name: fullTrack.body.name,
                        artists: fullTrack.body.artists.map(a => a.name).join(", "),
                        album: fullTrack.body.album.name,
                        image: fullTrack.body.album.images[0]?.url,
                        uri: fullTrack.body.uri,
                        duration_ms: fullTrack.body.duration_ms,
                      })
                    } catch (trackErr) {
                      // Skip if track fetch fails
                    }
                  }
                  
                  if (uniqueTracks.size >= 12) break
                }
              } catch (albumErr) {
                // Continue if album fetch fails
              }
              
              if (uniqueTracks.size >= 12) break
            }
          } catch (err) {
            console.error("Failed to get artist albums:", err)
          }
          
          if (uniqueTracks.size >= 12) break
        }
        
        console.log(`✅ Got ${uniqueTracks.size} tracks from seed artist albums`)
        
        console.log("🔍 Strategy 2: Search-based discovery for variety...")
        // Use search with genre-like terms to find similar music
        const searchQueries = [
          ...seedArtistNames.slice(0, 2), // Artist names
          `${seedArtistNames[0]} similar`, // "Similar to X"
          `${seedTracksData[0]?.name.split(' ')[0]} music`, // Keywords from track names
        ]
        
        for (const query of searchQueries) {
          try {
            const searchResults = await spotify.searchTracks(query, { limit: 15 })
            
            if (searchResults.body.tracks) {
              // Take tracks from positions 3-12 to avoid only getting the most popular
              const tracks = searchResults.body.tracks.items.slice(2, 12)
              
              for (const track of tracks) {
                if (!uniqueTracks.has(track.id) && !seedTracks.includes(track.id)) {
                  // Avoid adding tracks from seed artists (we want variety)
                  const isFromSeedArtist = track.artists.some(a => 
                    seedArtistNames.includes(a.name)
                  )
                  
                  if (!isFromSeedArtist) {
                    uniqueTracks.set(track.id, {
                      id: track.id,
                      name: track.name,
                      artists: track.artists.map(a => a.name).join(", "),
                      album: track.album.name,
                      image: track.album.images[0]?.url,
                      uri: track.uri,
                      duration_ms: track.duration_ms,
                    })
                  }
                }
                
                if (uniqueTracks.size >= 25) break
              }
            }
          } catch (searchErr) {
            console.error("Search failed:", searchErr)
          }
          
          if (uniqueTracks.size >= 25) break
        }
        
        console.log(`✅ Total unique tracks: ${uniqueTracks.size}`)
        
        // If still need more, add some carefully selected tracks from seed artists
        if (uniqueTracks.size < 15) {
          console.log("⚠️ Adding backup tracks from seed artists...")
          for (const artistId of seedArtistIds.slice(0, 2)) {
            try {
              const topTracks = await spotify.getArtistTopTracks(artistId, 'SE')
              // Take tracks from the middle of the top tracks list (positions 3-7)
              for (const track of topTracks.body.tracks.slice(2, 7)) {
                if (!uniqueTracks.has(track.id) && !seedTracks.includes(track.id)) {
                  uniqueTracks.set(track.id, {
                    id: track.id,
                    name: track.name,
                    artists: track.artists.map(a => a.name).join(", "),
                    album: track.album.name,
                    image: track.album.images[0]?.url,
                    uri: track.uri,
                    duration_ms: track.duration_ms,
                  })
                }
                
                if (uniqueTracks.size >= 20) break
              }
            } catch (err) {
              console.error("Failed to get backup tracks:", err)
            }
            
            if (uniqueTracks.size >= 20) break
          }
        }
        
        recommendedTracks = Array.from(uniqueTracks.values())
        
        // Shuffle for maximum variety
        recommendedTracks = recommendedTracks
          .sort(() => Math.random() - 0.5)
          .slice(0, 20)
        
        console.log(`✅ Final playlist: ${recommendedTracks.length} tracks with variety`)
        
      } catch (fallbackError) {
        console.error("❌ Algorithm failed:", fallbackError)
        return NextResponse.json(
          { 
            error: "Failed to generate recommendations. Please try again.",
            details: "Recommendation algorithm failed."
          },
          { status: 500 }
        )
      }
    }

    if (recommendedTracks.length < 10 && seedTracksData.length > 0) {
      console.log("⚠️ Padding with seed tracks...")
      recommendedTracks = [...recommendedTracks, ...seedTracksData]
    }

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

    let playlistName = `AI Playlist - ${new Date().toLocaleDateString()}`
    let playlistDescription = usedFallback 
      ? `Generated using intelligent algorithm with ${seedTracks.length} seed tracks`
      : `Generated from ${seedTracks.length} seed tracks`
    let aiAnalysis = null
    
    try {
      const { analyzePlaylistWithAI } = await import("@/lib/openai")
      aiAnalysis = await analyzePlaylistWithAI(seedTracksData, avgFeatures)
      playlistName = aiAnalysis.playlistName
      playlistDescription = aiAnalysis.description
    } catch (error) {
      console.error("AI analysis failed, using defaults:", error)
    }

    const audioFeaturesData = {
      avgFeatures,
      seedAudioFeatures: seedAudioFeatures
    }

    const aiReasoningData = aiAnalysis ? {
      mood: aiAnalysis.mood,
      recommendedGenres: aiAnalysis.recommendedGenres,
      reasoning: aiAnalysis.reasoning,
      usedFallback,
      algorithm: usedFallback ? 'dev-mode-optimized' : 'spotify-recommendations'
    } : { 
      usedFallback,
      algorithm: usedFallback ? 'dev-mode-optimized' : 'spotify-recommendations'
    }

    const playlist = await prisma.playlist.create({
      data: {
        name: playlistName,
        description: playlistDescription,
        seedTracks: seedTracksData.length > 0 ? seedTracksData as any : [],
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
      usedFallback,
      algorithm: usedFallback ? 'dev-mode-optimized' : 'spotify-recommendations'
    })
  } catch (error) {
    console.error("Playlist generation error:", error)
    return NextResponse.json(
      { 
        error: "Failed to generate playlist",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}