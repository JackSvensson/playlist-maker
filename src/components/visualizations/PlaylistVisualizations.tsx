"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart, ReferenceLine, Tooltip } from "recharts"
import { Info, X, AlertCircle } from "lucide-react"

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
  isEstimated?: boolean // 🆕 Ny flagga
}

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

function InfoModal({ isOpen, onClose, title, children }: InfoModalProps) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700 shadow-2xl animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Info className="text-[#1DB954]" size={24} />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-1 hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        <div className="text-gray-300 space-y-3">
          {children}
        </div>
      </div>
    </div>
  )
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

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    name: string
  }>
  label?: number
  type: 'energy' | 'emotion'
}

interface DotProps {
  cx?: number
  cy?: number
  payload?: {
    track: number
    energy?: number
    valence?: number
  }
}

function CustomTooltip({ active, payload, label, type }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const value = payload[0].value.toFixed(1)
    const percentage = ((payload[0].value / 10) * 100).toFixed(0)
    
    let label_text = ""
    let color = "#f97316"
    
    if (type === 'energy') {
      color = "#f97316"
      if (payload[0].value < 3) label_text = "Lugn"
      else if (payload[0].value < 5) label_text = "Moderat"
      else if (payload[0].value < 7) label_text = "Energisk"
      else label_text = "Intensiv"
    } else {
      color = "#ec4899"
      if (payload[0].value < 3) label_text = "Melankoli"
      else if (payload[0].value < 5) label_text = "Neutral"
      else if (payload[0].value < 7) label_text = "Positiv"
      else label_text = "Euforisk"
    }
    
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-medium text-gray-300">Låt #{label}</p>
        <p className="text-lg font-bold" style={{ color }}>
          {value}/10 <span className="text-sm text-gray-400">({percentage}%)</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">{label_text}</p>
      </div>
    )
  }
  return null
}

export function PlaylistVisualizations({ audioFeatures, trackCount, aiReasoning }: PlaylistVisualizationsProps) {
  const [showEnergyInfo, setShowEnergyInfo] = useState(false)
  const [showEmotionInfo, setShowEmotionInfo] = useState(false)

  // 🆕 Visa varning om features är estimated
  const isEstimated = audioFeatures.isEstimated || false

  const energyFlowData = Array.from({ length: trackCount }, (_, i) => {
    const position = i / (trackCount - 1)
    const trackNumber = i + 1
    const baseEnergy = audioFeatures.avgFeatures.energy * 10
    
    let energy = baseEnergy
    
    if (aiReasoning?.energyFlow) {
      const { pattern, peaks, valleys } = aiReasoning.energyFlow
      
      const isPeak = peaks.includes(trackNumber)
      const isValley = valleys.includes(trackNumber)
      
      if (isPeak) {
        energy = Math.min(10, baseEnergy + 2.5)
      } else if (isValley) {
        energy = Math.max(0, baseEnergy - 2)
      } else {
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
      const wave = Math.sin(position * Math.PI * 2) * 1.5
      const randomVariation = (Math.random() - 0.5) * 0.5
      energy = baseEnergy + wave + randomVariation
    }
    
    return {
      track: trackNumber,
      energy: Math.max(0, Math.min(10, energy))
    }
  })

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
      const arc = Math.sin(position * Math.PI) * 2
      const randomVariation = (Math.random() - 0.5) * 0.5
      valence = baseValence + arc + randomVariation
    }
    
    return {
      track: trackNumber,
      valence: Math.max(0, Math.min(10, valence))
    }
  })

  const peakPositions = aiReasoning?.energyFlow?.peaks || []
  const valleyPositions = aiReasoning?.energyFlow?.valleys || []
  
  const avgTempo = audioFeatures.avgFeatures.tempo.toFixed(0)

  return (
    <>
      {/* 🆕 Varning om estimated features */}
      {isEstimated && (
        <div className="mb-6 bg-gradient-to-r from-amber-900/20 via-amber-800/20 to-amber-900/20 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-amber-400 mb-1">Uppskattade värden</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Audio features är uppskattade baserat på genre och dina filter-inställningar. 
                BPM och energinivåer är approximationer och kan skilja sig från de faktiska låtarna.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Energy Flow */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <h3 className="text-base sm:text-lg font-bold">Energy Flow</h3>
              {isEstimated && <span className="text-xs text-amber-400">~</span>}
            </div>
            <button
              onClick={() => setShowEnergyInfo(true)}
              className="text-gray-400 hover:text-[#1DB954] transition p-1 hover:bg-gray-800 rounded-lg"
              aria-label="Info om Energy Flow"
            >
              <Info size={18} />
            </button>
          </div>
          
          {aiReasoning?.energyFlow?.description && (
            <p className="text-xs sm:text-sm text-gray-400 mb-3">{aiReasoning.energyFlow.description}</p>
          )}
          
          {/* Tempo display */}
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <span className="text-orange-500">♫</span>
              <span>Tempo: {avgTempo} BPM {isEstimated && <span className="text-amber-400">(uppskattat)</span>}</span>
            </div>
          </div>
          
          {/* Peaks and valleys legend */}
          {(peakPositions.length > 0 || valleyPositions.length > 0) && (
            <div className="flex gap-4 mb-3 text-xs">
              {peakPositions.length > 0 && (
                <div className="flex items-center gap-1.5 text-green-400">
                  <span className="text-sm">●</span>
                  <span>Toppar: #{peakPositions.join(', #')}</span>
                </div>
              )}
              {valleyPositions.length > 0 && (
                <div className="flex items-center gap-1.5 text-red-400">
                  <span className="text-sm">●</span>
                  <span>Dalar: #{valleyPositions.join(', #')}</span>
                </div>
              )}
            </div>
          )}
          
          <ResponsiveContainer width="100%" height={180} className="sm:h-[200px]">
            <LineChart data={energyFlowData}>
              <XAxis 
                dataKey="track" 
                stroke="#6b7280" 
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Låtnummer', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#9ca3af' }}
              />
              <YAxis 
                domain={[0, 10]} 
                stroke="#6b7280" 
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                ticks={[0, 2.5, 5, 7.5, 10]}
                tickFormatter={(value) => {
                  if (value === 0) return 'Lugn'
                  if (value === 2.5) return '2.5'
                  if (value === 5) return 'Medel'
                  if (value === 7.5) return '7.5'
                  return 'Intensiv'
                }}
              />
              <Tooltip content={<CustomTooltip type="energy" />} />
              {/* Reference lines for peaks and valleys */}
              {peakPositions.map(peak => (
                <ReferenceLine 
                  key={`peak-${peak}`}
                  x={peak} 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeOpacity={0.4}
                />
              ))}
              {valleyPositions.map(valley => (
                <ReferenceLine 
                  key={`valley-${valley}`}
                  x={valley} 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeOpacity={0.4}
                />
              ))}
              <Line 
                type="monotone" 
                dataKey="energy" 
                stroke="#f97316" 
                strokeWidth={3}
                dot={(props: DotProps) => {
                  const { cx, cy, payload } = props
                  if (!cx || !cy || !payload) return <g />
                  
                  const trackNum = payload.track
                  const isPeak = peakPositions.includes(trackNum)
                  const isValley = valleyPositions.includes(trackNum)
                  
                  if (isPeak) {
                    return (
                      <g key={`peak-${trackNum}`}>
                        <circle cx={cx} cy={cy} r={5} fill="#10b981" stroke="#fff" strokeWidth={2} />
                        <text x={cx} y={cy - 12} textAnchor="middle" fontSize={12} fill="#10b981">↑</text>
                      </g>
                    )
                  }
                  if (isValley) {
                    return (
                      <g key={`valley-${trackNum}`}>
                        <circle cx={cx} cy={cy} r={5} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                        <text x={cx} y={cy + 18} textAnchor="middle" fontSize={12} fill="#ef4444">↓</text>
                      </g>
                    )
                  }
                  return <g key={`track-${trackNum}`} />
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Emotional Arc */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              <h3 className="text-base sm:text-lg font-bold">Emotional Arc</h3>
              {isEstimated && <span className="text-xs text-amber-400">~</span>}
            </div>
            <button
              onClick={() => setShowEmotionInfo(true)}
              className="text-gray-400 hover:text-[#1DB954] transition p-1 hover:bg-gray-800 rounded-lg"
              aria-label="Info om Emotional Arc"
            >
              <Info size={18} />
            </button>
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
                label={{ value: 'Låtnummer', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#9ca3af' }}
              />
              <YAxis 
                domain={[0, 10]} 
                stroke="#6b7280" 
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                ticks={[0, 2.5, 5, 7.5, 10]}
                tickFormatter={(value) => {
                  if (value === 0) return 'Sorglig'
                  if (value === 2.5) return '2.5'
                  if (value === 5) return 'Neutral'
                  if (value === 7.5) return '7.5'
                  return 'Glad'
                }}
              />
              <Tooltip content={<CustomTooltip type="emotion" />} />
              <Area 
                type="monotone" 
                dataKey="valence" 
                stroke="#ec4899" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValence)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Energy Flow Info Modal */}
      <InfoModal
        isOpen={showEnergyInfo}
        onClose={() => setShowEnergyInfo(false)}
        title="Vad är Energy Flow?"
      >
        <div className="space-y-3">
          <p className="text-sm">
            <strong className="text-white">Energy Flow</strong> visar hur intensiteten och aktiviteten varierar genom spellistan.
          </p>
          
          {isEstimated && (
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-3">
              <p className="text-xs text-amber-300">
                <strong>OBS:</strong> Dessa värden är uppskattade baserat på genre och dina filter-inställningar.
              </p>
            </div>
          )}
          
          <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
            <h4 className="font-semibold text-white text-sm">Skalan (0-10):</h4>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-orange-500">●</span>
                <strong>0-3:</strong> Lugn, stillsam, avslappnad
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">●</span>
                <strong>3-6:</strong> Moderat energi, balanserad
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">●</span>
                <strong>6-8:</strong> Energisk, aktiv, livlig
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-500">●</span>
                <strong>8-10:</strong> Intensiv, explosiv, högenergi
              </li>
            </ul>
          </div>
        </div>
      </InfoModal>

      {/* Emotional Arc Info Modal */}
      <InfoModal
        isOpen={showEmotionInfo}
        onClose={() => setShowEmotionInfo(false)}
        title="Vad är Emotional Arc?"
      >
        <div className="space-y-3">
          <p className="text-sm">
            <strong className="text-white">Emotional Arc</strong> visar den känslomässiga resan genom spellistan - från melankoli till lycka.
          </p>
          
          {isEstimated && (
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-3">
              <p className="text-xs text-amber-300">
                <strong>OBS:</strong> Dessa värden är uppskattade baserat på genre och dina filter-inställningar.
              </p>
            </div>
          )}
          
          <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
            <h4 className="font-semibold text-white text-sm">Skalan (0-10):</h4>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-pink-500">●</span>
                <strong>0-3:</strong> Melankoli, sorg, mörka känslor
              </li>
              <li className="flex items-center gap-2">
                <span className="text-pink-500">●</span>
                <strong>3-6:</strong> Neutral, balanserad känsla
              </li>
              <li className="flex items-center gap-2">
                <span className="text-pink-500">●</span>
                <strong>6-8:</strong> Positiv, uppåt, hoppfull
              </li>
              <li className="flex items-center gap-2">
                <span className="text-pink-500">●</span>
                <strong>8-10:</strong> Euforisk, glädjefylld, lycklig
              </li>
            </ul>
          </div>
        </div>
      </InfoModal>
    </>
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