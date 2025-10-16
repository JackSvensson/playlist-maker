import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with logout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold mb-2">
              Welcome, {session.user?.name}
            </h1>
            <p className="text-gray-400 text-xl">
              Create AI-powered playlists based on your music taste
            </p>
          </div>
          
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <button
              type="submit"
              className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg transition"
            >
              Logout
            </button>
          </form>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/create"
            className="bg-gradient-to-br from-[#1DB954] to-[#1ed760] p-8 rounded-xl hover:scale-105 transition"
          >
            <h2 className="text-3xl font-bold mb-2">Create Playlist</h2>
            <p className="text-white/90">
              Generate a new AI-powered playlist
            </p>
          </Link>

          <Link
            href="/history"
            className="bg-gray-900 p-8 rounded-xl hover:bg-gray-800 transition"
          >
            <h2 className="text-3xl font-bold mb-2">History</h2>
            <p className="text-gray-400">
              View your previously created playlists
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}