import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface AudioFeatures {
  danceability: number
  energy: number
  valence: number
  tempo: number
  acousticness: number
  instrumentalness?: number
  speechiness?: number
  liveness?: number
}

interface Track {
  id: string
  name: string
  artists: string
  album?: string
}

// FÖRBÄTTRAD AI-ANALYS
export async function analyzePlaylistWithAI(
  seedTracks: Track[],
  audioFeatures: AudioFeatures
) {
  try {
    const prompt = `You are an expert music curator and data analyst. Analyze these seed tracks and their audio characteristics to create a perfect playlist theme.

SEED TRACKS:
${seedTracks.map((t, i) => `${i + 1}. "${t.name}" by ${t.artists}`).join('\n')}

AUDIO ANALYSIS:
- Energy Level: ${(audioFeatures.energy * 100).toFixed(0)}% ${getEnergyDescription(audioFeatures.energy)}
- Danceability: ${(audioFeatures.danceability * 100).toFixed(0)}% ${getDanceabilityDescription(audioFeatures.danceability)}
- Mood (Valence): ${(audioFeatures.valence * 100).toFixed(0)}% ${getValenceDescription(audioFeatures.valence)}
- Tempo: ${audioFeatures.tempo.toFixed(0)} BPM ${getTempoDescription(audioFeatures.tempo)}
- Acousticness: ${(audioFeatures.acousticness * 100).toFixed(0)}% ${getAcousticnessDescription(audioFeatures.acousticness)}

YOUR TASK:
Create a cohesive playlist concept that captures the essence of these tracks. Consider:
1. The emotional journey these songs create
2. The musical characteristics they share
3. The perfect listening context (workout, study, party, etc.)
4. Time of day or season that fits this vibe

Respond in JSON format with:
{
  "playlistName": "Creative name (max 60 chars, no generic words like 'Mix' or 'Playlist')",
  "description": "Compelling description (max 150 chars) that makes someone want to listen",
  "mood": "One-word mood descriptor (e.g., 'Euphoric', 'Melancholic', 'Energetic')",
  "vibe": "2-3 word vibe (e.g., 'Late Night Drive', 'Summer Sunset', 'Gym Motivation')",
  "recommendedGenres": ["genre1", "genre2", "genre3"],
  "listeningContext": "When/where to listen (e.g., 'Perfect for evening workouts')",
  "emotionalJourney": "Brief description of the emotional arc",
  "reasoning": "Why these recommendations work together (2-3 sentences)"
}`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a world-class music curator who understands the psychology of music, audio engineering, and creates compelling playlist narratives. You never use generic playlist names and always think deeply about the listening experience."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9, // Higher for more creative names
      max_tokens: 800,
      response_format: { type: "json_object" }
    })

    const analysis = JSON.parse(response.choices[0].message.content || '{}')
    
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
    
    // Enhanced fallback with audio features
    return createIntelligentFallback(seedTracks, audioFeatures)
  }
}

// Helper functions for audio feature descriptions
function getEnergyDescription(energy: number): string {
  if (energy > 0.8) return "(Very High - Intense & Powerful)"
  if (energy > 0.6) return "(High - Energetic & Lively)"
  if (energy > 0.4) return "(Medium - Balanced)"
  if (energy > 0.2) return "(Low - Calm & Relaxed)"
  return "(Very Low - Ambient & Peaceful)"
}

function getDanceabilityDescription(danceability: number): string {
  if (danceability > 0.8) return "(Very High - Club Ready)"
  if (danceability > 0.6) return "(High - Groovy)"
  if (danceability > 0.4) return "(Medium - Moderate Groove)"
  if (danceability > 0.2) return "(Low - Not Dance-Focused)"
  return "(Very Low - Ambient/Experimental)"
}

function getValenceDescription(valence: number): string {
  if (valence > 0.8) return "(Very Positive - Euphoric & Upbeat)"
  if (valence > 0.6) return "(Positive - Happy & Cheerful)"
  if (valence > 0.4) return "(Neutral - Balanced)"
  if (valence > 0.2) return "(Negative - Melancholic)"
  return "(Very Negative - Dark & Somber)"
}

function getTempoDescription(tempo: number): string {
  if (tempo > 140) return "(Very Fast - High Energy)"
  if (tempo > 120) return "(Fast - Upbeat)"
  if (tempo > 100) return "(Medium - Moderate)"
  if (tempo > 80) return "(Slow - Relaxed)"
  return "(Very Slow - Downtempo)"
}

function getAcousticnessDescription(acousticness: number): string {
  if (acousticness > 0.7) return "(Highly Acoustic - Organic)"
  if (acousticness > 0.4) return "(Somewhat Acoustic - Balanced)"
  return "(Electronic - Produced)"
}

// Intelligent fallback when AI fails
function createIntelligentFallback(tracks: Track[], features: AudioFeatures) {
  const energy = features.energy
  const valence = features.valence
  const danceability = features.danceability
  
  let mood = "Balanced"
  let vibe = "Chill Vibes"
  let context = "Anytime listening"
  let name = "Curated Mix"
  
  // Determine mood based on valence and energy
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
  
  // Add danceability context
  if (danceability > 0.7) {
    vibe = "Dance Floor Ready"
    context = "Get moving to these beats"
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