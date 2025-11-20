"use client"

import { useEffect } from "react"
import { CheckCircle, X, ExternalLink, AlertCircle } from "lucide-react"

interface ToastProps {
  message: string
  isOpen: boolean
  onClose: () => void
  spotifyUrl?: string
  trackCount?: number
  isError?: boolean
}

export default function Toast({ 
  message, 
  isOpen, 
  onClose, 
  spotifyUrl, 
  trackCount,
  isError = false 
}: ToastProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, 10000)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const Icon = isError ? AlertCircle : CheckCircle

  return (
    <>ß
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md animate-in zoom-in duration-200"
        role="alertdialog"
        aria-labelledby="toast-title"
        aria-describedby="toast-description"
        aria-modal="true"
      >
        <div className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl ${
          isError 
            ? "border border-red-500/30 shadow-red-500/20" 
            : "border border-[#1DB954]/30 shadow-[#1DB954]/20"
        }`}>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white transition p-1 hover:bg-gray-700 rounded-lg"
            aria-label="Close notification"
          >
            <X size={18} className="sm:w-5 sm:h-5" aria-hidden="true" />
          </button>

          {/* Content */}
          <div className="flex items-start gap-3 sm:gap-4 pr-8">
            {/* Icon */}
            <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
              isError 
                ? "bg-red-500/20" 
                : "bg-[#1DB954]/20"
            }`} aria-hidden="true">
              <Icon size={20} className={`sm:w-6 sm:h-6 ${
                isError ? "text-red-400" : "text-[#1DB954]"
              }`} />
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <h3 id="toast-title" className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
                {isError ? "Error" : "Success!"}
              </h3>
              <p id="toast-description" className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4">
                {message}
                {!isError && trackCount && (
                  <span className="block mt-1 text-[#1DB954] font-semibold">
                    {trackCount} tracks saved
                  </span>
                )}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col xs:flex-row gap-2">
                {!isError && spotifyUrl && (
                  <a
                    href={spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-white px-4 py-2 rounded-lg transition font-semibold text-xs sm:text-sm"
                    aria-label="Open playlist in Spotify (opens in new window)"
                  >
                    <span>Open in Spotify</span>
                    <ExternalLink size={14} className="sm:w-4 sm:h-4" aria-hidden="true" />
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition font-medium text-xs sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}