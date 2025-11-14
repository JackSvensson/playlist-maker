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

interface TrackInsight {
  trackNumber: number
  insight: string
  icon: string
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
  energyFlow: {
    description: string
    pattern: 'steady' | 'building' | 'wave' | 'declining' | 'varied'
    peaks: number[]
    valleys: number[]
  }
  emotionalArc: {
    description: string
    pattern: 'uplifting' | 'melancholic' | 'journey' | 'stable' | 'varied'
    progression: string
  }
  insights: TrackInsight[]
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
  audioFeatures: AudioFeatures,
  generatedTracks?: Array<{ name: string; artists: string; audioFeatures?: AudioFeatures }>
): Promise<AIAnalysis> {
  try {
    const trackList = generatedTracks && generatedTracks.length > 0
      ? generatedTracks.map((t, i) => `${i + 1}. "${t.name}" by ${t.artists}`)
      : seedTracks.map((t, i) => `${i + 1}. "${t.name}" by ${t.artists}`)

    const prompt = `You are an expert music curator and data analyst. Analyze this complete playlist to create insights about energy flow, emotional progression, and specific moments.

PLAYLIST (${trackList.length} tracks):
${trackList.join('\n')}

SEED TRACKS (what the user selected):
${seedTracks.map((t, i) => `${i + 1}. "${t.name}" by ${t.artists}`).join('\n')}

OVERALL AUDIO CHARACTERISTICS:
- Energy: ${(audioFeatures.energy * 100).toFixed(0)}% ${audioFeatures.energy > 0.7 ? '(energetic)' : audioFeatures.energy < 0.4 ? '(calm)' : '(moderate)'}
- Danceability: ${(audioFeatures.danceability * 100).toFixed(0)}%
- Mood: ${(audioFeatures.valence * 100).toFixed(0)}% ${audioFeatures.valence > 0.6 ? '(positive)' : audioFeatures.valence < 0.4 ? '(melancholic)' : '(balanced)'}
- Tempo: ${audioFeatures.tempo.toFixed(0)} BPM
- Acousticness: ${(audioFeatures.acousticness * 100).toFixed(0)}%

Create a DETAILED and ACCURATE analysis. Be specific about track numbers and transitions.

Respond in JSON:
{
  "playlistName": "Creative, specific name (60 chars max, NO generic words like 'Mix' or 'Playlist')",
  "description": "Compelling description matching the actual vibe (150 chars max)",
  "mood": "Precise one-word mood",
  "vibe": "2-3 words describing the exact feeling",
  "recommendedGenres": ["specific genre 1", "specific genre 2", "specific genre 3"],
  "listeningContext": "Perfect situation for this SPECIFIC vibe",
  "emotionalJourney": "What emotional experience this playlist creates",
  "reasoning": "Why these tracks work together and what makes them cohesive (2-3 sentences)",
  "energyFlow": {
    "description": "Describe how energy changes through the playlist",
    "pattern": "steady|building|wave|declining|varied",
    "peaks": [8, 12, 18],
    "valleys": [3, 15]
  },
  "emotionalArc": {
    "description": "Describe the emotional progression",
    "pattern": "uplifting|melancholic|journey|stable|varied",
    "progression": "Detailed description of how mood evolves"
  },
  "insights": [
    {
      "trackNumber": 3,
      "insight": "Specific observation about this track or transition",
      "icon": "🎵|⚡|💫|🎸|🎹|🎤"
    },
    {
      "trackNumber": 8,
      "insight": "Another specific insight",
      "icon": "emoji"
    },
    {
      "trackNumber": 15,
      "insight": "Final insight",
      "icon": "emoji"
    }
  ]
}

IMPORTANT: 
- Track numbers in peaks/valleys/insights must be actual positions (1-${trackList.length})
- Insights should reference SPECIFIC tracks by number
- Be accurate about key changes, tempo shifts, and emotional progressions
- Don't make up transitions that don't exist`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a world-class music curator who understands subtle musical nuances and creates compelling, accurate playlist narratives. You are precise and specific in your genre identification. You analyze energy flow, emotional arcs, and specific transitions with expert precision."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1200,
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
      energyFlow: analysis.energyFlow || {
        description: "Steady energy throughout",
        pattern: 'steady',
        peaks: [],
        valleys: []
      },
      emotionalArc: analysis.emotionalArc || {
        description: "Balanced emotional progression",
        pattern: 'stable',
        progression: "Maintains consistent mood"
      },
      insights: analysis.insights || []
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
  let energyPattern: 'steady' | 'building' | 'wave' | 'declining' | 'varied' = 'steady'
  let emotionalPattern: 'uplifting' | 'melancholic' | 'journey' | 'stable' | 'varied' = 'stable'
  
  if (acousticness > 0.6) {
    if (valence > 0.6) {
      mood = "Uplifting"
      vibe = "Acoustic Sunshine"
      context = "Perfect for peaceful mornings or sunny afternoons"
      name = "Acoustic Daydreams"
      genres = ["acoustic", "indie folk", "singer-songwriter"]
      energyPattern = 'wave'
      emotionalPattern = 'uplifting'
    } else if (valence < 0.4) {
      mood = "Contemplative"
      vibe = "Introspective Acoustic"
      context = "Late night reflection and quiet moments"
      name = "Quiet Contemplation"
      genres = ["acoustic", "indie folk", "melancholic"]
      energyPattern = 'declining'
      emotionalPattern = 'melancholic'
    } else {
      mood = "Mellow"
      vibe = "Acoustic Balance"
      context = "Background music for focus or relaxation"
      name = "Acoustic Reflections"
      genres = ["acoustic", "indie", "folk"]
      energyPattern = 'steady'
      emotionalPattern = 'stable'
    }
  } else if (energy > 0.7 && valence > 0.6) {
    mood = "Euphoric"
    vibe = "High Energy"
    context = "Perfect for workouts or parties"
    name = "Energy Surge"
    genres = ["pop", "dance", "indie pop"]
    energyPattern = 'building'
    emotionalPattern = 'uplifting'
  } else if (energy < 0.4 && valence < 0.4) {
    mood = "Melancholic"
    vibe = "Introspective"
    context = "Late night contemplation"
    name = "Midnight Thoughts"
    genres = ["indie", "alternative", "downtempo"]
    energyPattern = 'declining'
    emotionalPattern = 'melancholic'
  } else if (valence > 0.6) {
    mood = "Content"
    vibe = "Feel Good"
    context = "Easy listening for relaxed moments"
    name = "Good Vibes"
    genres = ["indie pop", "pop", "alternative"]
    energyPattern = 'wave'
    emotionalPattern = 'journey'
  } else {
    mood = "Reflective"
    vibe = "Thoughtful Moments"
    context = "For introspection and emotional depth"
    name = "Emotional Landscape"
    genres = ["indie", "alternative", "soul"]
    energyPattern = 'varied'
    emotionalPattern = 'varied'
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
    energyFlow: {
      description: `${energyPattern === 'building' ? 'Gradually building energy' : energyPattern === 'wave' ? 'Wave-like energy with peaks and valleys' : energyPattern === 'declining' ? 'Gently declining energy for relaxation' : 'Steady, consistent energy throughout'}`,
      pattern: energyPattern,
      peaks: energyPattern === 'wave' ? [8, 15] : energyPattern === 'building' ? [18, 20] : [],
      valleys: energyPattern === 'wave' ? [3, 12] : []
    },
    emotionalArc: {
      description: `${emotionalPattern === 'uplifting' ? 'Progressively uplifting mood' : emotionalPattern === 'melancholic' ? 'Contemplative and introspective journey' : emotionalPattern === 'journey' ? 'Emotional journey with varied moods' : 'Stable, consistent emotional tone'}`,
      pattern: emotionalPattern,
      progression: `Maintains a ${mood.toLowerCase()} atmosphere throughout`
    },
    insights: [
      {
        trackNumber: 3,
        insight: "Sets the foundational mood for the playlist",
        icon: "🎵"
      },
      {
        trackNumber: Math.floor(tracks.length / 2),
        insight: "Midpoint brings perfect balance to the flow",
        icon: "⚡"
      },
      {
        trackNumber: tracks.length - 2,
        insight: "Creates satisfying emotional resolution",
        icon: "💫"
      }
    ]
  }
}

export default openai