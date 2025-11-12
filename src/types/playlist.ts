export interface Track {
    id: string
    name: string
    artists: string
    album: string
    image: string | null
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
  
  export interface TrackInsight {
    trackNumber: number
    insight: string
    icon: string
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
    energyFlow?: {
      description: string
      pattern: 'steady' | 'building' | 'wave' | 'declining' | 'varied'
      peaks: number[]
      valleys: number[]
    }
    emotionalArc?: {
      description: string
      pattern: 'uplifting' | 'melancholic' | 'journey' | 'stable' | 'varied'
      progression: string
    }
    insights?: TrackInsight[]
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
  
  interface PrismaPlaylist {
    id: string
    name: string
    description: string | null
    seedTracks: unknown
    generatedTracks: unknown
    audioFeatures: unknown
    aiReasoning: unknown
    createdAt: Date
    updatedAt: Date
    [key: string]: unknown
  }
  
  function parseTrack(track: unknown): Track {
    const t = track as Record<string, unknown>
    return {
      id: String(t.id || ''),
      name: String(t.name || ''),
      artists: String(t.artists || ''),
      album: String(t.album || ''),
      image: t.image ? String(t.image) : null,
      uri: String(t.uri || ''),
      duration_ms: Number(t.duration_ms || 0),
    }
  }
  
  export function parsePlaylistData(playlist: PrismaPlaylist): PlaylistData {
    const seedTracks = Array.isArray(playlist.seedTracks) 
      ? playlist.seedTracks.map(parseTrack)
      : []
  
    const generatedTracks = Array.isArray(playlist.generatedTracks)
      ? playlist.generatedTracks.map(parseTrack)
      : []
  
    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
      seedTracks,
      generatedTracks,
      audioFeatures: playlist.audioFeatures 
        ? (playlist.audioFeatures as AudioFeaturesData)
        : null,
      aiReasoning: playlist.aiReasoning
        ? (playlist.aiReasoning as AIAnalysis)
        : null,
    }
  }