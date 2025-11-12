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
        <TrackSearch />
      </div>
    </div>
  )
}