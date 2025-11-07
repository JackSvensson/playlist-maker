import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface Track {
  id: string
  name: string
  artists: string
  album?: string
}

interface AudioFeatures {
  danceability: number
  energy: number
  valence: number
  tempo: number
  acousticness: number
}

interface AISearchStrategy {
  primaryGenres: string[]
  relatedGenres: string[]
  suggestedArtists: string[]
  searchQueries: string[]
  timeContext: string
  diversityStrategy: string
  excludedGenres: string[]
  musicalCharacteristics: string[]
}

interface AIAnalysis {
  playlistName: string
  description: string
  mood: string
  vibe: string
  recommendedGenres: string[]
  listeningContext: string
  emotionalJourney: string
  reasoning: string
}

export async function getAISearchStrategies(
  seedTracks: Track[],
  audioFeatures: AudioFeatures
): Promise<AISearchStrategy> {
  try {
    const prompt = `You are an expert music curator. Analyze these seed tracks VERY CAREFULLY to understand their exact musical style, mood, and genre.

SEED TRACKS:
${seedTracks.map((t, i) => `${i + 1}. "${t.name}" by ${t.artists}`).join('\n')}

AUDIO CHARACTERISTICS:
- Energy: ${(audioFeatures.energy * 100).toFixed(0)}% ${audioFeatures.energy > 0.7 ? '(High energy)' : audioFeatures.energy < 0.4 ? '(Low energy/calm)' : '(Moderate)'}
- Danceability: ${(audioFeatures.danceability * 100).toFixed(0)}% ${audioFeatures.danceability > 0.7 ? '(Very danceable)' : audioFeatures.danceability < 0.4 ? '(Not very danceable)' : '(Somewhat danceable)'}
- Mood: ${(audioFeatures.valence * 100).toFixed(0)}% ${audioFeatures.valence > 0.6 ? '(Happy/uplifting)' : audioFeatures.valence < 0.4 ? '(Melancholic/sad)' : '(Balanced mood)'}
- Tempo: ${audioFeatures.tempo.toFixed(0)} BPM ${audioFeatures.tempo > 140 ? '(Fast)' : audioFeatures.tempo < 100 ? '(Slow)' : '(Medium)'}
- Acousticness: ${(audioFeatures.acousticness * 100).toFixed(0)}% ${audioFeatures.acousticness > 0.6 ? '(Very acoustic)' : '(More electronic/produced)'}

CRITICAL INSTRUCTIONS:
1. **Identify the EXACT genre(s)** of these tracks - be specific (e.g., "indie pop", "soul", "contemporary R&B", NOT just "pop")
2. **Pay close attention to the VIBE** - are these introspective? Uplifting? Melancholic? Party tracks? Chill?
3. **Match the instrumentation** - acoustic vs electronic, organic vs synthesized
4. **DO NOT mix genres** - if tracks are indie/pop/soul, DO NOT suggest hip-hop/rap/rock unless they truly match
5. **Suggest artists with SIMILAR SOUND** - not just same era or popularity

Respond in JSON with:
{
  "primaryGenres": ["specific genre 1", "specific genre 2"],
  "relatedGenres": ["closely related genre 1", "closely related genre 2"],
  "suggestedArtists": ["artist who sounds VERY similar 1", "artist 2", "artist 3", "artist 4", "artist 5"],
  "searchQueries": [
    "genre + mood combination 1",
    "genre + mood combination 2", 
    "specific musical style descriptor",
    "instrumentation + genre",
    "mood + era"
  ],
  "timeContext": "specific era/period that matches these tracks",
  "diversityStrategy": "how to find variety WITHIN the same genre/vibe",
  "excludedGenres": ["genres to AVOID that don't match this vibe"],
  "musicalCharacteristics": ["key musical elements like 'acoustic guitar', 'soulful vocals', 'electronic production', etc."]
}

EXAMPLES OF GOOD VS BAD MATCHING:
- Seed: Indie pop ballads → GOOD: acoustic indie, dream pop, indie folk | BAD: hip-hop, metal, EDM
- Seed: Upbeat soul → GOOD: neo-soul, contemporary R&B, funk | BAD: sad indie, heavy rock
- Seed: Chill electronic → GOOD: chillwave, downtempo, ambient | BAD: hardstyle, dubstep

Be PRECISE and SPECIFIC. Quality over quantity.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional music curator with deep knowledge of genres, subgenres, and musical styles. You excel at identifying subtle differences between genres and matching tracks with precision. You NEVER mix incompatible genres."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error("No response from OpenAI")
    }

    const strategy = JSON.parse(content) as Partial<AISearchStrategy>
    
    return {
      primaryGenres: strategy.primaryGenres || [],
      relatedGenres: strategy.relatedGenres || [],
      suggestedArtists: strategy.suggestedArtists || [],
      searchQueries: strategy.searchQueries || [],
      timeContext: strategy.timeContext || "",
      diversityStrategy: strategy.diversityStrategy || "",
      excludedGenres: strategy.excludedGenres || [],
      musicalCharacteristics: strategy.musicalCharacteristics || [],
    }
  } catch (error) {
    console.error("AI search strategies error:", error)
    
    const isChill = audioFeatures.energy < 0.5 && audioFeatures.valence < 0.6
    const isUpbeat = audioFeatures.energy > 0.6 && audioFeatures.valence > 0.6
    const isAcoustic = audioFeatures.acousticness > 0.5
    
    let fallbackGenres = ["indie", "alternative"]
    let fallbackQueries = ["indie alternative", "indie pop"]
    
    if (isChill && isAcoustic) {
      fallbackGenres = ["indie folk", "acoustic"]
      fallbackQueries = ["acoustic indie", "indie folk", "singer songwriter"]
    } else if (isUpbeat) {
      fallbackGenres = ["indie pop", "alternative pop"]
      fallbackQueries = ["indie pop", "upbeat indie", "alternative pop"]
    }
    
    return {
      primaryGenres: fallbackGenres,
      relatedGenres: ["indie rock", "indie pop"],
      suggestedArtists: [],
      searchQueries: fallbackQueries,
      timeContext: "modern era",
      diversityStrategy: "Using genre-based search with mood matching",
      excludedGenres: [],
      musicalCharacteristics: [],
    }
  }
}

export async function analyzePlaylistWithAI(
  seedTracks: Track[],
  audioFeatures: AudioFeatures
): Promise<AIAnalysis> {
  try {
    const prompt = `You are an expert music curator. Analyze these tracks to create a cohesive playlist theme.

SEED TRACKS:
${seedTracks.map((t, i) => `${i + 1}. "${t.name}" by ${t.artists}`).join('\n')}

AUDIO CHARACTERISTICS:
- Energy: ${(audioFeatures.energy * 100).toFixed(0)}% ${audioFeatures.energy > 0.7 ? '(energetic)' : audioFeatures.energy < 0.4 ? '(calm)' : '(moderate)'}
- Danceability: ${(audioFeatures.danceability * 100).toFixed(0)}%
- Mood: ${(audioFeatures.valence * 100).toFixed(0)}% ${audioFeatures.valence > 0.6 ? '(positive)' : audioFeatures.valence < 0.4 ? '(melancholic)' : '(balanced)'}
- Tempo: ${audioFeatures.tempo.toFixed(0)} BPM
- Acousticness: ${(audioFeatures.acousticness * 100).toFixed(0)}%

Create a SPECIFIC and ACCURATE playlist concept that truly captures these tracks.

Respond in JSON:
{
  "playlistName": "Creative, specific name (60 chars max, NO generic words like 'Mix' or 'Playlist')",
  "description": "Compelling description matching the actual vibe (150 chars max)",
  "mood": "Precise one-word mood",
  "vibe": "2-3 words describing the exact feeling",
  "recommendedGenres": ["specific genre 1", "specific genre 2", "specific genre 3"],
  "listeningContext": "Perfect situation for this SPECIFIC vibe",
  "emotionalJourney": "What emotional experience this playlist creates",
  "reasoning": "Why these tracks work together and what makes them cohesive (2-3 sentences)"
}`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a world-class music curator who understands subtle musical nuances and creates compelling, accurate playlist narratives. You are precise and specific in your genre identification."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 800,
      response_format: { type: "json_object" }
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error("No response from OpenAI")
    }

    const analysis = JSON.parse(content) as Partial<AIAnalysis>
    
    return {
      playlistName: analysis.playlistName || `Curated Mix - ${new Date().toLocaleDateString()}`,
      description: analysis.description || "AI-generated playlist based on your music taste",
      mood: analysis.mood || "Mixed",
      vibe: analysis.vibe || "Chill Vibes",
      recommendedGenres: analysis.recommendedGenres || [],
      listeningContext: analysis.listeningContext || "Anytime listening",
      emotionalJourney: analysis.emotionalJourney || "A journey through sound",
      reasoning: analysis.reasoning || "Selected based on musical similarity",
    }
  } catch (error) {
    console.error("OpenAI analysis error:", error)
    return createIntelligentFallback(seedTracks, audioFeatures)
  }
}

function createIntelligentFallback(tracks: Track[], features: AudioFeatures): AIAnalysis {
  const energy = features.energy
  const valence = features.valence
  const acousticness = features.acousticness
  
  let mood = "Balanced"
  let vibe = "Chill Vibes"
  let context = "Anytime listening"
  let name = "Curated Mix"
  let genres: string[] = []
  
  // More nuanced fallback logic
  if (acousticness > 0.6) {
    if (valence > 0.6) {
      mood = "Uplifting"
      vibe = "Acoustic Sunshine"
      context = "Perfect for peaceful mornings or sunny afternoons"
      name = "Acoustic Daydreams"
      genres = ["acoustic", "indie folk", "singer-songwriter"]
    } else if (valence < 0.4) {
      mood = "Contemplative"
      vibe = "Introspective Acoustic"
      context = "Late night reflection and quiet moments"
      name = "Quiet Contemplation"
      genres = ["acoustic", "indie folk", "melancholic"]
    } else {
      mood = "Mellow"
      vibe = "Acoustic Balance"
      context = "Background music for focus or relaxation"
      name = "Acoustic Reflections"
      genres = ["acoustic", "indie", "folk"]
    }
  } else if (energy > 0.7 && valence > 0.6) {
    mood = "Euphoric"
    vibe = "High Energy"
    context = "Perfect for workouts or parties"
    name = "Energy Surge"
    genres = ["pop", "dance", "indie pop"]
  } else if (energy < 0.4 && valence < 0.4) {
    mood = "Melancholic"
    vibe = "Introspective"
    context = "Late night contemplation"
    name = "Midnight Thoughts"
    genres = ["indie", "alternative", "downtempo"]
  } else if (valence > 0.6) {
    mood = "Content"
    vibe = "Feel Good"
    context = "Easy listening for relaxed moments"
    name = "Good Vibes"
    genres = ["indie pop", "pop", "alternative"]
  } else {
    mood = "Reflective"
    vibe = "Thoughtful Moments"
    context = "For introspection and emotional depth"
    name = "Emotional Landscape"
    genres = ["indie", "alternative", "soul"]
  }
  
  return {
    playlistName: name,
    description: `A ${mood.toLowerCase()} collection perfectly suited for ${context.toLowerCase()}`,
    mood,
    vibe,
    recommendedGenres: genres,
    listeningContext: context,
    emotionalJourney: `From ${tracks[0]?.name || 'your first track'} through a carefully curated emotional journey`,
    reasoning: "These tracks share similar energy, mood, and musical characteristics, creating a cohesive listening experience.",
  }
}

export default openai