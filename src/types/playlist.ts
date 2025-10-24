export interface Track {
    id: string
    name: string
    artists: string
    album: string
    image: string
    uri: string
    duration_ms: number
  }
  
  export interface AudioFeatures {
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
  
  export interface AudioFeaturesData {
    avgFeatures: {
      danceability: number
      energy: number
      valence: number
      tempo: number
      acousticness: number
    }
    seedAudioFeatures: AudioFeatures[]
  }
  
  export interface AIAnalysis {
    mood: string
    vibe?: string
    recommendedGenres: string[]
    reasoning: string
    listeningContext?: string
    emotionalJourney?: string
    usedFallback?: boolean
    algorithm?: string
  }
  
  export interface PlaylistData {
    id: string
    name: string
    description: string | null
    seedTracks: Track[]
    generatedTracks: Track[]
    audioFeatures: AudioFeaturesData | null
    aiReasoning: AIAnalysis | null
    createdAt: Date
    updatedAt: Date
  }
  
  // Helper function to safely parse Prisma JSON fields
  export function parsePlaylistData(playlist: any): PlaylistData {
    return {
      ...playlist,
      seedTracks: Array.isArray(playlist.seedTracks) 
        ? (playlist.seedTracks as Track[])
        : [],
      generatedTracks: Array.isArray(playlist.generatedTracks)
        ? (playlist.generatedTracks as Track[])
        : [],
      audioFeatures: playlist.audioFeatures 
        ? (playlist.audioFeatures as AudioFeaturesData)
        : null,
      aiReasoning: playlist.aiReasoning
        ? (playlist.aiReasoning as AIAnalysis)
        : null,
    }
  }