import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { getSpotifyClient } from "@/lib/spotify"
import { prisma } from "@/lib/prisma"

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
  [key: string]: number
}

interface PlaylistFilters {
  limit?: number
  targetDanceability?: number
  targetEnergy?: number
  targetValence?: number
  targetTempo?: number
  targetAcousticness?: number
  minYear?: number
  maxYear?: number
}

interface RequestBody {
  seedTracks: string[]
  filters?: PlaylistFilters
}

interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string; id: string }>
  album: {
    name: string
    images: Array<{ url: string }>
  }
  uri: string
  duration_ms: number
}

interface AISearchStrategy {
  primaryGenres: string[]
  relatedGenres: string[]
  suggestedArtists: string[]
  searchQueries: string[]
  timeContext: string
  diversityStrategy: string
}

interface AIAnalysis {
  playlistName: string
  description: string
  mood: string
  vibe?: string
  recommendedGenres: string[]
  reasoning: string
  listeningContext?: string
  emotionalJourney?: string
  energyFlow?: {
    description: string
    pattern: string
    peaks: number[]
    valleys: number[]
  }
  emotionalArc?: {
    description: string
    pattern: string
    progression: string
  }
  insights?: Array<{
    trackNumber: number
    insight: string
    icon: string
  }>
}

export async function POST(request: Request) {
  const session = await auth()
  
  if (!session?.accessToken || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json() as RequestBody
    const { seedTracks, filters } = body

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
      seedTracksData = seedTracksDetails.body.tracks.map((track): TrackData => ({
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
        .map((f): AudioFeature => ({
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
    } catch {
      console.error("❌ Failed to get seed track details")
    }

    let recommendedTracks: TrackData[] = []
    let usedFallback = false
    let aiSearchStrategy: AISearchStrategy | null = null

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
        ...(filters?.minYear && { min_release_date: `${filters.minYear}-01-01` }),
        ...(filters?.maxYear && { max_release_date: `${filters.maxYear}-12-31` }),
      })

      recommendedTracks = recommendations.body.tracks.map((track): TrackData => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(a => a.name).join(", "),
        album: track.album.name,
        image: track.album.images[0]?.url,
        uri: track.uri,
        duration_ms: track.duration_ms,
      }))
      
      console.log("✅ Got recommendations successfully!")
      
    } catch {
      console.log("⚠️ Recommendations API failed, using AI-ENHANCED DIVERSITY algorithm...")
      usedFallback = true
      
      try {
        console.log("🤖 Asking AI for diversity strategies...")
        const { getAISearchStrategies } = await import("@/lib/openai")
        aiSearchStrategy = await getAISearchStrategies(seedTracksData, avgFeatures)
        
        console.log("✨ AI suggests:", {
          genres: aiSearchStrategy.primaryGenres,
          artists: aiSearchStrategy.suggestedArtists,
          strategy: aiSearchStrategy.diversityStrategy
        })
        
        const uniqueTracks = new Map<string, TrackData>()
        const artistTrackCount = new Map<string, number>()
        const usedTrackNames = new Set<string>()
        const MAX_TRACKS_PER_ARTIST = 2
        
        const seedTracksDetails = await spotify.getTracks(seedTracks)
        const seedArtistIds = seedTracksDetails.body.tracks.map(t => t.artists[0].id)
        
        const isSimilarTrackName = (name: string): boolean => {
          const normalized = name.toLowerCase()
            .replace(/\s*\(.*?\)\s*/g, '')
            .replace(/\s*-.*$/g, '')
            .trim()
          return usedTrackNames.has(normalized)
        }
        
        const addTrackWithDiversity = (track: SpotifyTrack): boolean => {
          if (!track || !track.id || uniqueTracks.has(track.id) || seedTracks.includes(track.id)) {
            return false
          }
          
          const artistName = track.artists[0].name
          const trackName = track.name
          
          const currentCount = artistTrackCount.get(artistName) || 0
          if (currentCount >= MAX_TRACKS_PER_ARTIST) {
            return false
          }
          
          if (isSimilarTrackName(trackName)) {
            return false
          }
          
          uniqueTracks.set(track.id, {
            id: track.id,
            name: track.name,
            artists: track.artists.map((a) => a.name).join(", "),
            album: track.album.name,
            image: track.album?.images?.[0]?.url,
            uri: track.uri,
            duration_ms: track.duration_ms,
          })
          
          artistTrackCount.set(artistName, currentCount + 1)
          const normalized = trackName.toLowerCase()
            .replace(/\s*\(.*?\)\s*/g, '')
            .replace(/\s*-.*$/g, '')
            .trim()
          usedTrackNames.add(normalized)
          
          return true
        }
        
        console.log("🔍 Strategy 1: Searching for AI-suggested artists...")
        for (const artistName of aiSearchStrategy.suggestedArtists.slice(0, 5)) {
          try {
            const artistSearch = await spotify.searchArtists(artistName, { limit: 1 })
            if (artistSearch.body.artists?.items[0]) {
              const artist = artistSearch.body.artists.items[0]
              const topTracks = await spotify.getArtistTopTracks(artist.id, 'SE')
              
              let added = 0
              for (const track of topTracks.body.tracks.slice(0, 5)) {
                if (addTrackWithDiversity(track)) {
                  added++
                  if (added >= 2) break
                }
              }
            }
          } catch {
            console.error(`Failed to get tracks for ${artistName}`)
          }
          
          if (uniqueTracks.size >= 10) break
        }
        
        console.log(`✅ Got ${uniqueTracks.size} tracks from AI-suggested artists`)
        
        console.log("🔍 Strategy 2: Using AI-generated search queries...")
        for (const searchQuery of aiSearchStrategy.searchQueries) {
          try {
            const searchResults = await spotify.searchTracks(searchQuery, { 
              limit: 20,
              offset: Math.floor(Math.random() * 10)
            })
            
            if (searchResults.body.tracks) {
              const tracks = searchResults.body.tracks.items.slice(5, 20)
              
              for (const track of tracks) {
                addTrackWithDiversity(track)
                if (uniqueTracks.size >= 20) break
              }
            }
          } catch {
            console.error("AI search query failed")
          }
          
          if (uniqueTracks.size >= 20) break
        }
        
        console.log(`✅ Total after AI searches: ${uniqueTracks.size} tracks`)
        
        if (uniqueTracks.size < 15) {
          console.log("🔍 Strategy 3: Related artists for more variety...")
          for (const artistId of seedArtistIds.slice(0, 3)) {
            try {
              const relatedArtists = await spotify.getArtistRelatedArtists(artistId)
              
              for (const relatedArtist of relatedArtists.body.artists.slice(0, 8)) {
                try {
                  const topTracks = await spotify.getArtistTopTracks(relatedArtist.id, 'SE')
                  
                  let addedFromThisArtist = 0
                  for (const track of topTracks.body.tracks.slice(0, 5)) {
                    if (addTrackWithDiversity(track)) {
                      addedFromThisArtist++
                      if (addedFromThisArtist >= 1) break
                    }
                  }
                } catch {
                
                }
                
                if (uniqueTracks.size >= 20) break
              }
            } catch {
              console.error("Failed to get related artists")
            }
            
            if (uniqueTracks.size >= 20) break
          }
        }
        
        if (uniqueTracks.size < 15) {
          console.log("⚠️ Adding carefully selected tracks from seed artists...")
          for (const artistId of seedArtistIds) {
            try {
              const topTracks = await spotify.getArtistTopTracks(artistId, 'SE')
              
              let added = 0
              for (const track of topTracks.body.tracks) {
                if (addTrackWithDiversity(track)) {
                  added++
                  if (added >= 1) break
                }
              }
            } catch {
              console.error("Failed to get artist top tracks")
            }
            
            if (uniqueTracks.size >= 20) break
          }
        }
        
        recommendedTracks = Array.from(uniqueTracks.values())
        
        recommendedTracks = recommendedTracks
          .sort(() => Math.random() - 0.5)
          .slice(0, filters?.limit || 20)
        
        console.log(`✅ Final AI-enhanced playlist: ${recommendedTracks.length} tracks`)
        console.log(`📊 Unique artists: ${new Set(recommendedTracks.map(t => t.artists.split(',')[0].trim())).size}`)
        console.log(`🤖 AI Strategy used: ${aiSearchStrategy.diversityStrategy}`)
        
      } catch {
        console.error("❌ AI-enhanced algorithm failed")
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
      ? `AI-powered discovery with ${seedTracks.length} seed tracks`
      : `Generated from ${seedTracks.length} seed tracks`
    let aiAnalysis: AIAnalysis | null = null
    
    try {
      console.log("🤖 Analyzing complete playlist with AI...")
      const { analyzePlaylistWithAI } = await import("@/lib/openai")
      
      const tracksForAnalysis = recommendedTracks.map(track => ({
        name: track.name,
        artists: track.artists
      }))
      
      console.log(`📊 Analyzing ${tracksForAnalysis.length} tracks...`)
      
      aiAnalysis = await analyzePlaylistWithAI(
        seedTracksData,
        avgFeatures,
        tracksForAnalysis
      )
      
      console.log("✅ AI Analysis complete:")
      console.log(`  - Energy Flow: ${aiAnalysis.energyFlow?.pattern || 'N/A'}`)
      console.log(`  - Emotional Arc: ${aiAnalysis.emotionalArc?.pattern || 'N/A'}`)
      console.log(`  - Insights: ${aiAnalysis.insights?.length || 0} track insights`)
      
      playlistName = aiAnalysis.playlistName
      playlistDescription = aiAnalysis.description
    } catch (error) {
      console.error("❌ AI analysis failed:", error)
      console.error("Using fallback defaults")
    }

    const audioFeaturesData = {
      avgFeatures,
      seedAudioFeatures: seedAudioFeatures
    }

    const aiReasoningData = aiAnalysis ? {
      mood: aiAnalysis.mood,
      vibe: aiAnalysis.vibe,
      recommendedGenres: aiAnalysis.recommendedGenres,
      reasoning: aiAnalysis.reasoning,
      listeningContext: aiAnalysis.listeningContext,
      emotionalJourney: aiAnalysis.emotionalJourney,
      energyFlow: aiAnalysis.energyFlow,
      emotionalArc: aiAnalysis.emotionalArc,
      insights: aiAnalysis.insights,
      usedFallback,
      algorithm: usedFallback ? 'ai-enhanced-diversity' : 'spotify-recommendations',
      aiSearchStrategy: aiSearchStrategy || undefined
    } : { 
      usedFallback,
      algorithm: usedFallback ? 'ai-enhanced-diversity' : 'spotify-recommendations',
      aiSearchStrategy: aiSearchStrategy || undefined
    }

    const playlist = await prisma.playlist.create({
      data: {
        name: playlistName,
        description: playlistDescription,
        seedTracks: JSON.parse(JSON.stringify(seedTracksData)),
        generatedTracks: JSON.parse(JSON.stringify(recommendedTracks)),
        audioFeatures: JSON.parse(JSON.stringify(audioFeaturesData)),
        aiReasoning: JSON.parse(JSON.stringify(aiReasoningData)),
        userId: user.id,
      }
    })

    console.log("✅ Playlist created successfully with ID:", playlist.id)

    return NextResponse.json({
      playlistId: playlist.id,
      tracks: recommendedTracks,
      seedTracks: seedTracksData,
      audioFeatures: avgFeatures,
      usedFallback,
      algorithm: usedFallback ? 'ai-enhanced-diversity' : 'spotify-recommendations',
      aiStrategy: aiSearchStrategy
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