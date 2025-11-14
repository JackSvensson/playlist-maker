import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import TrackSearch from "@/components/spotify/TrackSearch"
import Header from "@/components/Header"

export default async function CreatePage() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header 
        user={session.user} 
        onLogout={async () => {
          "use server"
          await signOut({ redirectTo: "/login" })
        }}
      />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <TrackSearch />
      </div>
    </div>
  )
}