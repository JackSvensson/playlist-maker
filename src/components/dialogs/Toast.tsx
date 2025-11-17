"use client"

import { useEffect } from "react"
import { CheckCircle, X, ExternalLink } from "lucide-react"

interface ToastProps {
  message: string
  isOpen: boolean
  onClose: () => void
  spotifyUrl?: string
  trackCount?: number
}

export default function Toast({ message, isOpen, onClose, spotifyUrl, trackCount }: ToastProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000) // Auto-close after 5 seconds
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Toast */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md animate-in zoom-in duration-200">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#1DB954]/30 shadow-2xl shadow-[#1DB954]/20">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white transition p-1 hover:bg-gray-700 rounded-lg"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>

          {/* Content */}
          <div className="flex items-start gap-3 sm:gap-4 pr-8">
            {/* Success Icon */}
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
              <CheckCircle size={20} className="text-[#1DB954] sm:w-6 sm:h-6" />
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
                Success!
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4">
                {message}
                {trackCount && (
                  <span className="block mt-1 text-[#1DB954] font-semibold">
                    {trackCount} tracks saved
                  </span>
                )}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col xs:flex-row gap-2">
                {spotifyUrl && (
                  <a
                    href={spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-white px-4 py-2 rounded-lg transition font-semibold text-xs sm:text-sm"
                  >
                    <span>Open in Spotify</span>
                    <ExternalLink size={14} className="sm:w-4 sm:h-4" />
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