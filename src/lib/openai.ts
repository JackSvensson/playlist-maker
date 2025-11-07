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
    const prompt = `You are a music discovery expert. Analyze these seed tracks and help me find DIVERSE, similar music.

SEED TRACKS:
${seedTracks.map((t, i) => `${i + 1}. "${t.name}" by ${t.artists}`).join('\n')}

AUDIO PROFILE:
- Energy: ${(audioFeatures.energy * 100).toFixed(0)}%
- Danceability: ${(audioFeatures.danceability * 100).toFixed(0)}%
- Mood: ${(audioFeatures.valence * 100).toFixed(0)}%
- Tempo: ${audioFeatures.tempo.toFixed(0)} BPM
- Acousticness: ${(audioFeatures.acousticness * 100).toFixed(0)}%

YOUR TASK:
Generate a diverse discovery strategy to find similar but DIFFERENT artists. Think about:
1. What genres/subgenres are these tracks in?
2. What related genres might fans enjoy?
3. What artists are similar but not obvious?
4. What time periods/eras match this vibe?
5. What moods/contexts fit these tracks?

Respond in JSON with:
{
  "primaryGenres": ["genre1", "genre2"],
  "relatedGenres": ["genre3", "genre4"],
  "suggestedArtists": ["artist1", "artist2", "artist3"],
  "searchQueries": ["query1", "query2", "query3", "query4", "query5"],
  "timeContext": "era description (e.g., '70s soul', '2010s indie')",
  "diversityStrategy": "brief explanation of how to find variety"
}

IMPORTANT:
- suggestedArtists should be DIFFERENT from the seed artists
- searchQueries should be creative (not just artist names)
- Think about discovering NEW music, not just popular hits`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a music curator expert who helps discover diverse music. You think deeply about genres, eras, and musical connections to help users find new artists they'll love."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 600,
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
    }
  } catch (error) {
    console.error("AI search strategies error:", error)
    
    return {
      primaryGenres: ["indie", "alternative"],
      relatedGenres: ["indie rock", "indie pop"],
      suggestedArtists: [],
      searchQueries: [
        "indie alternative",
        "alternative rock",
        "indie pop",
      ],
      timeContext: "modern era",
      diversityStrategy: "Using genre-based search",
    }
  }
}

export async function analyzePlaylistWithAI(
  seedTracks: Track[],
  audioFeatures: AudioFeatures
): Promise<AIAnalysis> {
  try {
    const prompt = `You are an expert music curator and data analyst. Analyze these seed tracks and their audio characteristics to create a perfect playlist theme.

SEED TRACKS:
${seedTracks.map((t, i) => `${i + 1}. "${t.name}" by ${t.artists}`).join('\n')}

AUDIO ANALYSIS:
- Energy Level: ${(audioFeatures.energy * 100).toFixed(0)}%
- Danceability: ${(audioFeatures.danceability * 100).toFixed(0)}%
- Mood (Valence): ${(audioFeatures.valence * 100).toFixed(0)}%
- Tempo: ${audioFeatures.tempo.toFixed(0)} BPM
- Acousticness: ${(audioFeatures.acousticness * 100).toFixed(0)}%

YOUR TASK:
Create a cohesive playlist concept that captures the essence of these tracks.

Respond in JSON format with:
{
  "playlistName": "Creative name (max 60 chars, no generic words like 'Mix' or 'Playlist')",
  "description": "Compelling description (max 150 chars)",
  "mood": "One-word mood descriptor",
  "vibe": "2-3 word vibe",
  "recommendedGenres": ["genre1", "genre2", "genre3"],
  "listeningContext": "When/where to listen",
  "emotionalJourney": "Brief description of the emotional arc",
  "reasoning": "Why these recommendations work together (2-3 sentences)"
}`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a world-class music curator who understands the psychology of music and creates compelling playlist narratives."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,
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
  
  let mood = "Balanced"
  let vibe = "Chill Vibes"
  let context = "Anytime listening"
  let name = "Curated Mix"
  
  if (valence > 0.6 && energy > 0.6) {
    mood = "Euphoric"
    vibe = "High Energy"
    context = "Perfect for workouts or parties"
    name = "Energy Boost"
  } else if (valence > 0.6 && energy < 0.4) {
    mood = "Content"
    vibe = "Sunny Day"
    context = "Great for relaxed afternoons"
    name = "Sunshine Mix"
  } else if (valence < 0.4 && energy > 0.6) {
    mood = "Intense"
    vibe = "Raw Emotion"
    context = "When you need to feel something deep"
    name = "Emotional Release"
  } else if (valence < 0.4 && energy < 0.4) {
    mood = "Melancholic"
    vibe = "Introspective"
    context = "Late night contemplation"
    name = "Midnight Thoughts"
  }
  
  return {
    playlistName: name,
    description: `A ${mood.toLowerCase()} collection based on your selections`,
    mood,
    vibe,
    recommendedGenres: [],
    listeningContext: context,
    emotionalJourney: `From ${tracks[0].name} to new discoveries`,
    reasoning: "Selected to match the energy and mood of your seed tracks",
  }
}

export default openai