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
  artists: Array<{ name: string; id: string; genres?: string[] }>
  album: {
    name: string
    images: Array<{ url: string }>
    release_date?: string
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

// 🆕 Funktion för att uppskatta BPM baserat på genre
function estimateBPMFromGenre(genres: string[], targetTempo?: number): number {
  if (targetTempo) return targetTempo
  
  const genreString = genres.join(' ').toLowerCase()
  
  // Snabba genrer
  if (genreString.includes('drum and bass') || genreString.includes('dnb')) return 170
  if (genreString.includes('hardstyle') || genreString.includes('hardcore')) return 150
  if (genreString.includes('techno') || genreString.includes('trance')) return 135
  if (genreString.includes('house') || genreString.includes('edm')) return 128
  if (genreString.includes('dubstep')) return 140
  
  // Medium tempo
  if (genreString.includes('pop') || genreString.includes('indie pop')) return 120
  if (genreString.includes('rock') || genreString.includes('alternative')) return 125
  if (genreString.includes('hip hop') || genreString.includes('rap')) return 95
  if (genreString.includes('r&b') || genreString.includes('soul')) return 90
  
  // Långsamma genrer
  if (genreString.includes('downtempo') || genreString.includes('chillout')) return 85
  if (genreString.includes('ambient') || genreString.includes('drone')) return 70
  if (genreString.includes('ballad')) return 75
  
  return 120 // Default
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
    let seedAvgFeatures = {
      danceability: filters?.targetDanceability || 0.5,
      energy: filters?.targetEnergy || 0.5,
      valence: filters?.targetValence || 0.5,
      tempo: filters?.targetTempo || 120,
      acousticness: filters?.targetAcousticness || 0.5,
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
        target_danceability: filters?.targetDanceability || seedAvgFeatures.danceability,
        target_energy: filters?.targetEnergy || seedAvgFeatures.energy,
        target_valence: filters?.targetValence || seedAvgFeatures.valence,
        target_tempo: filters?.targetTempo || seedAvgFeatures.tempo,
        target_acousticness: filters?.targetAcousticness || seedAvgFeatures.acousticness,
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
      console.log("⚠️ Recommendations API failed, using IMPROVED FALLBACK algorithm with filters...")
      usedFallback = true
      
      try {
        console.log("🤖 Asking AI for diversity strategies...")
        const { getAISearchStrategies } = await import("@/lib/openai")
        aiSearchStrategy = await getAISearchStrategies(seedTracksData, seedAvgFeatures)
        
        console.log("✨ AI suggests:", {
          genres: aiSearchStrategy.primaryGenres,
          artists: aiSearchStrategy.suggestedArtists,
          strategy: aiSearchStrategy.diversityStrategy
        })
        
        // 🆕 Respektera limit från filters!
        const targetLimit = filters?.limit || 20
        console.log(`🎯 Target: ${targetLimit} tracks`)
        
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
          
          // 🆕 Filtrera efter år om specificerat
          if (filters?.minYear || filters?.maxYear) {
            const releaseYear = track.album.release_date ? parseInt(track.album.release_date.split('-')[0]) : null
            if (releaseYear) {
              if (filters.minYear && releaseYear < filters.minYear) return false
              if (filters.maxYear && releaseYear > filters.maxYear) return false
            }
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
        for (const artistName of aiSearchStrategy.suggestedArtists.slice(0, 8)) {
          try {
            const artistSearch = await spotify.searchArtists(artistName, { limit: 1 })
            if (artistSearch.body.artists?.items[0]) {
              const artist = artistSearch.body.artists.items[0]
              const topTracks = await spotify.getArtistTopTracks(artist.id, 'SE')
              
              let added = 0
              for (const track of topTracks.body.tracks) {
                if (addTrackWithDiversity(track)) {
                  added++
                  if (added >= 2) break
                }
              }
            }
          } catch {
            console.error(`Failed to get tracks for ${artistName}`)
          }
          
          // 🆕 Stoppa när vi når target
          if (uniqueTracks.size >= targetLimit) break
        }
        
        console.log(`✅ Got ${uniqueTracks.size} tracks from AI-suggested artists`)
        
        // 🆕 Fortsätt bara om vi behöver fler
        if (uniqueTracks.size < targetLimit) {
          console.log("🔍 Strategy 2: Using AI-generated search queries...")
          for (const searchQuery of aiSearchStrategy.searchQueries) {
            try {
              const searchResults = await spotify.searchTracks(searchQuery, { 
                limit: 20,
                offset: Math.floor(Math.random() * 10)
              })
              
              if (searchResults.body.tracks) {
                const tracks = searchResults.body.tracks.items
                
                for (const track of tracks) {
                  addTrackWithDiversity(track)
                  if (uniqueTracks.size >= targetLimit) break
                }
              }
            } catch {
              console.error("AI search query failed")
            }
            
            if (uniqueTracks.size >= targetLimit) break
          }
        }
        
        console.log(`✅ Total after AI searches: ${uniqueTracks.size} tracks`)
        
        // 🆕 Fortsätt bara om vi behöver fler
        if (uniqueTracks.size < targetLimit) {
          console.log("🔍 Strategy 3: Related artists for more variety...")
          for (const artistId of seedArtistIds.slice(0, 3)) {
            try {
              const relatedArtists = await spotify.getArtistRelatedArtists(artistId)
              
              for (const relatedArtist of relatedArtists.body.artists.slice(0, 8)) {
                try {
                  const topTracks = await spotify.getArtistTopTracks(relatedArtist.id, 'SE')
                  
                  for (const track of topTracks.body.tracks.slice(0, 3)) {
                    addTrackWithDiversity(track)
                    if (uniqueTracks.size >= targetLimit) break
                  }
                } catch {
                  // Silent fail
                }
                
                if (uniqueTracks.size >= targetLimit) break
              }
            } catch {
              console.error("Failed to get related artists")
            }
            
            if (uniqueTracks.size >= targetLimit) break
          }
        }
        
        recommendedTracks = Array.from(uniqueTracks.values())
        
        // 🆕 Skära ner till exakt limit
        recommendedTracks = recommendedTracks
          .sort(() => Math.random() - 0.5)
          .slice(0, targetLimit)
        
        console.log(`✅ Final AI-enhanced playlist: ${recommendedTracks.length} tracks (target was ${targetLimit})`)
        console.log(`📊 Unique artists: ${new Set(recommendedTracks.map(t => t.artists.split(',')[0].trim())).size}`)
        
      } catch (error) {
        console.error("❌ AI-enhanced algorithm failed:", error)
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
      recommendedTracks = [...recommendedTracks, ...seedTracksData].slice(0, filters?.limit || 20)
    }

    // 🆕 Uppskatta features från genre istället för API
    console.log("🎨 Estimating audio features from genres...")
    let estimatedFeatures = {
      danceability: filters?.targetDanceability || seedAvgFeatures.danceability,
      energy: filters?.targetEnergy || seedAvgFeatures.energy,
      valence: filters?.targetValence || seedAvgFeatures.valence,
      tempo: estimateBPMFromGenre(aiSearchStrategy?.primaryGenres || [], filters?.targetTempo),
      acousticness: filters?.targetAcousticness || seedAvgFeatures.acousticness,
    }
    
    console.log(`✅ Estimated features:`)
    console.log(`   - BPM: ${estimatedFeatures.tempo} (from ${aiSearchStrategy?.primaryGenres.join(', ') || 'filters'})`)
    console.log(`   - Energy: ${(estimatedFeatures.energy * 100).toFixed(0)}%`)
    console.log(`   - Danceability: ${(estimatedFeatures.danceability * 100).toFixed(0)}%`)

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
        estimatedFeatures,
        tracksForAnalysis
      )
      
      console.log("✅ AI Analysis complete")
      
      playlistName = aiAnalysis.playlistName
      playlistDescription = aiAnalysis.description
    } catch (error) {
      console.error("❌ AI analysis failed:", error)
    }

    // 🆕 Spara estimated features istället
    const audioFeaturesData = {
      avgFeatures: estimatedFeatures,
      seedAudioFeatures: seedAudioFeatures,
      isEstimated: true // 🆕 Flagga för att visa att det är uppskattat
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
      algorithm: 'ai-enhanced-diversity-with-filters',
      aiSearchStrategy: aiSearchStrategy || undefined,
      filtersApplied: filters // 🆕 Spara vilka filters som användes
    } : { 
      usedFallback,
      algorithm: 'ai-enhanced-diversity-with-filters',
      aiSearchStrategy: aiSearchStrategy || undefined,
      filtersApplied: filters
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
    console.log(`📊 Final stats: ${recommendedTracks.length} tracks, estimated BPM: ${estimatedFeatures.tempo.toFixed(0)}`)

    return NextResponse.json({
      playlistId: playlist.id,
      tracks: recommendedTracks,
      seedTracks: seedTracksData,
      audioFeatures: estimatedFeatures,
      usedFallback,
      algorithm: 'ai-enhanced-diversity-with-filters',
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