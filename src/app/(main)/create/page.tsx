import { auth } from "@/auth"
import { redirect } from "next/navigation"
import TrackSearch from "@/components/spotify/TrackSearch"

export default async function CreatePage() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-5xl font-bold mb-4">Create AI Playlist</h1>
        <p className="text-gray-400 text-xl mb-8">
          Select 3-5 tracks to generate your personalized playlist
        </p>
        
        <TrackSearch />
      </div>
    </div>
  )
}