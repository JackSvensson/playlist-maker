"use client"

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts"

interface AudioFeaturesData {
  avgFeatures: {
    danceability: number
    energy: number
    valence: number
    tempo: number
    acousticness: number
  }
  seedAudioFeatures: Array<{
    danceability: number
    energy: number
    valence: number
    tempo: number
    acousticness: number
  }>
}

interface TrackInsight {
  trackNumber: number
  insight: string
  icon: string
}

interface AIReasoning {
  mood?: string
  reasoning?: string
  listeningContext?: string
  emotionalJourney?: string
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

interface PlaylistVisualizationsProps {
  audioFeatures: AudioFeaturesData
  trackCount: number
  aiReasoning?: AIReasoning
}

export function PlaylistVisualizations({ audioFeatures, trackCount, aiReasoning }: PlaylistVisualizationsProps) {
  // Generate energy flow data based on AI analysis or fallback to algorithm
  const energyFlowData = Array.from({ length: trackCount }, (_, i) => {
    const position = i / (trackCount - 1)
    const trackNumber = i + 1
    const baseEnergy = audioFeatures.avgFeatures.energy * 10
    
    let energy = baseEnergy
    
    if (aiReasoning?.energyFlow) {
      const { pattern, peaks, valleys } = aiReasoning.energyFlow
      
      // Check if this track is a peak
      const isPeak = peaks.includes(trackNumber)
      const isValley = valleys.includes(trackNumber)
      
      if (isPeak) {
        energy = Math.min(10, baseEnergy + 2.5)
      } else if (isValley) {
        energy = Math.max(0, baseEnergy - 2)
      } else {
        // Apply pattern-based variation
        switch (pattern) {
          case 'building':
            energy = baseEnergy + (position * 3)
            break
          case 'declining':
            energy = baseEnergy - (position * 2.5)
            break
          case 'wave':
            energy = baseEnergy + Math.sin(position * Math.PI * 2) * 2
            break
          case 'varied':
            energy = baseEnergy + (Math.sin(position * Math.PI * 4) * 1.5) + (Math.random() - 0.5) * 0.8
            break
          case 'steady':
          default:
            energy = baseEnergy + (Math.random() - 0.5) * 0.5
        }
      }
    } else {
      // Fallback to wave pattern
      const wave = Math.sin(position * Math.PI * 2) * 1.5
      const randomVariation = (Math.random() - 0.5) * 0.5
      energy = baseEnergy + wave + randomVariation
    }
    
    return {
      track: trackNumber,
      energy: Math.max(0, Math.min(10, energy))
    }
  })

  // Generate emotional arc data based on AI analysis
  const emotionalArcData = Array.from({ length: trackCount }, (_, i) => {
    const position = i / (trackCount - 1)
    const trackNumber = i + 1
    const baseValence = audioFeatures.avgFeatures.valence * 10
    
    let valence = baseValence
    
    if (aiReasoning?.emotionalArc) {
      const { pattern } = aiReasoning.emotionalArc
      
      switch (pattern) {
        case 'uplifting':
          valence = baseValence + (position * 3)
          break
        case 'melancholic':
          valence = baseValence - (position * 2)
          break
        case 'journey':
          valence = baseValence + Math.sin(position * Math.PI) * 3
          break
        case 'varied':
          valence = baseValence + (Math.sin(position * Math.PI * 3) * 2) + (Math.random() - 0.5) * 0.8
          break
        case 'stable':
        default:
          valence = baseValence + (Math.random() - 0.5) * 0.5
      }
    } else {
      // Fallback to arc pattern
      const arc = Math.sin(position * Math.PI) * 2
      const randomVariation = (Math.random() - 0.5) * 0.5
      valence = baseValence + arc + randomVariation
    }
    
    return {
      track: trackNumber,
      valence: Math.max(0, Math.min(10, valence))
    }
  })

  // Get peak and valley positions for reference lines
  const peakPositions = aiReasoning?.energyFlow?.peaks || []
  const valleyPositions = aiReasoning?.energyFlow?.valleys || []

  return (
    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
      {/* Energy Flow */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-800">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          <h3 className="text-base sm:text-lg font-bold">Energy Flow</h3>
        </div>
        {aiReasoning?.energyFlow?.description && (
          <p className="text-xs sm:text-sm text-gray-400 mb-3">{aiReasoning.energyFlow.description}</p>
        )}
        <ResponsiveContainer width="100%" height={180} className="sm:h-[200px]">
          <LineChart data={energyFlowData}>
            <XAxis 
              dataKey="track" 
              stroke="#6b7280" 
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              domain={[0, 10]} 
              stroke="#6b7280" 
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            {peakPositions.map(peak => (
              <ReferenceLine 
                key={`peak-${peak}`}
                x={peak} 
                stroke="#10b981" 
                strokeDasharray="3 3" 
                strokeOpacity={0.5}
              />
            ))}
            {valleyPositions.map(valley => (
              <ReferenceLine 
                key={`valley-${valley}`}
                x={valley} 
                stroke="#ef4444" 
                strokeDasharray="3 3" 
                strokeOpacity={0.5}
              />
            ))}
            <Line 
              type="monotone" 
              dataKey="energy" 
              stroke="#f97316" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Emotional Arc */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-800">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="w-2 h-2 rounded-full bg-pink-500"></div>
          <h3 className="text-base sm:text-lg font-bold">Emotional Arc</h3>
        </div>
        {aiReasoning?.emotionalArc?.description && (
          <p className="text-xs sm:text-sm text-gray-400 mb-3">{aiReasoning.emotionalArc.description}</p>
        )}
        <ResponsiveContainer width="100%" height={180} className="sm:h-[200px]">
          <AreaChart data={emotionalArcData}>
            <defs>
              <linearGradient id="colorValence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="track" 
              stroke="#6b7280" 
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              domain={[0, 10]} 
              stroke="#6b7280" 
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Area 
              type="monotone" 
              dataKey="valence" 
              stroke="#ec4899" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValence)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

interface GenreDistributionProps {
  genres: string[]
}

export function GenreDistribution({ genres }: GenreDistributionProps) {
  const genreCount: Record<string, number> = {}
  genres.forEach(genre => {
    genreCount[genre] = (genreCount[genre] || 0) + 1
  })

  const sortedGenres = Object.entries(genreCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const total = sortedGenres.reduce((sum, [, count]) => sum + count, 0)
  const colors = ['#10b981', '#8b5cf6', '#f97316', '#3b82f6', '#eab308']

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-800">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
        <h3 className="text-base sm:text-lg font-bold">Genre Mix</h3>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {sortedGenres.map(([genre, count], index) => {
          const percentage = (count / total) * 100
          return (
            <div key={genre}>
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colors[index] }}
                  ></div>
                  <span className="text-xs sm:text-sm font-medium capitalize truncate">{genre}</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-400 ml-2">{percentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
                <div 
                  className="h-1.5 sm:h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: colors[index]
                  }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface AIInsightsProps {
  aiReasoning: AIReasoning
}

export function AIInsights({ aiReasoning }: AIInsightsProps) {
  // Use AI-generated insights if available, otherwise use defaults
  const insights = aiReasoning.insights && aiReasoning.insights.length > 0
    ? aiReasoning.insights
    : [
        {
          trackNumber: 3,
          insight: "Sets the foundational mood for the playlist",
          icon: "🎵"
        },
        {
          trackNumber: 8,
          insight: "Energy peak maintains listener engagement",
          icon: "⚡"
        },
        {
          trackNumber: 15,
          insight: aiReasoning.emotionalJourney || "Creates satisfying emotional resolution",
          icon: "💫"
        }
      ]

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-800">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        <h3 className="text-base sm:text-lg font-bold">AI Insights</h3>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {insights.slice(0, 3).map((insight, index) => (
          <div key={index} className="bg-gray-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl flex-shrink-0">{insight.icon}</span>
              <div className="min-w-0">
                <h4 className="font-semibold mb-1 text-sm sm:text-base">Track {insight.trackNumber}</h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{insight.insight}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}