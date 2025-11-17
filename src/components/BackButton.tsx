"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1 sm:gap-2 text-gray-400 hover:text-white mb-2 sm:mb-4 lg:mb-6 transition text-xs sm:text-sm"
    >
      <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
      <span>Back</span>
    </button>
  )
}