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

export async function analyzePlaylistWithAI(
  seedTracks: Track[],
  audioFeatures: AudioFeatures
) {
  try {
    const prompt = `You are a music expert AI. Analyze these seed tracks and their audio characteristics to suggest a cohesive playlist theme and recommendation strategy.

Seed Tracks:
${seedTracks.map((t, i) => `${i + 1}. "${t.name}" by ${t.artists}`).join('\n')}

Average Audio Features:
- Danceability: ${(audioFeatures.danceability * 100).toFixed(0)}%
- Energy: ${(audioFeatures.energy * 100).toFixed(0)}%
- Valence (Happiness): ${(audioFeatures.valence * 100).toFixed(0)}%
- Tempo: ${audioFeatures.tempo.toFixed(0)} BPM
- Acousticness: ${(audioFeatures.acousticness * 100).toFixed(0)}%

Based on this information:
1. What is the overall mood/vibe of this playlist?
2. Suggest a creative playlist name (max 50 characters)
3. Write a short playlist description (max 150 characters)
4. What genres or styles should we prioritize in recommendations?

Respond in JSON format:
{
  "mood": "...",
  "playlistName": "...",
  "description": "...",
  "recommendedGenres": ["...", "..."],
  "reasoning": "..."
}`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a music expert who understands audio features and can create perfect playlists."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 500,
      response_format: { type: "json_object" }
    })

    const analysis = JSON.parse(response.choices[0].message.content || '{}')
    
    return {
      mood: analysis.mood || "Unknown",
      playlistName: analysis.playlistName || "AI Generated Playlist",
      description: analysis.description || "Generated with AI",
      recommendedGenres: analysis.recommendedGenres || [],
      reasoning: analysis.reasoning || "",
    }
  } catch (error) {
    console.error("OpenAI analysis error:", error)
    
    // Fallback if OpenAI fails
    return {
      mood: "Mixed",
      playlistName: "AI Playlist",
      description: "AI-generated based on your music taste",
      recommendedGenres: [],
      reasoning: "AI analysis unavailable",
    }
  }
}

export default openai