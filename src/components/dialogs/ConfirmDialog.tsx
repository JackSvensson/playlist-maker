"use client"

import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md animate-in zoom-in duration-200">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700 shadow-2xl">
          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            {isDangerous && (
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400 sm:w-6 sm:h-6" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse xs:flex-row gap-2 sm:gap-3 mt-5 sm:mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 sm:py-3 rounded-lg transition font-semibold text-xs sm:text-sm"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-2.5 sm:py-3 rounded-lg transition font-semibold text-xs sm:text-sm ${
                isDangerous
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-[#1DB954] hover:bg-[#1ed760] text-white"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}