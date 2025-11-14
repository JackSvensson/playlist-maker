import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Music, History, Sparkles } from "lucide-react"
import Header from "@/components/Header"

export default async function DashboardPage() {
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Welcome back, {session.user?.name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400">
            Ready to discover your next favorite playlist?
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Create Playlist Card */}
          <Link
            href="/create"
            className="group relative overflow-hidden bg-gradient-to-br from-[#1DB954] via-[#1ed760] to-emerald-400 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-[#1DB954]/20"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <Sparkles size={24} className="text-white sm:w-8 sm:h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">Create New Playlist</h2>
              <p className="text-white/90 text-sm sm:text-base lg:text-lg">
                Generate a personalized playlist based on your favorite tracks
              </p>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/5 rounded-full -ml-8 -mb-8 sm:-ml-12 sm:-mb-12"></div>
          </Link>

          {/* History Card */}
          <Link
            href="/history"
            className="group relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-gray-700 hover:border-gray-600"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform border border-purple-500/30">
                <History size={24} className="text-purple-400 sm:w-8 sm:h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">View History</h2>
              <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
                Browse all your previously generated playlists
              </p>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-purple-500/5 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-pink-500/5 rounded-full -ml-8 -mb-8 sm:-ml-12 sm:-mb-12"></div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-800">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3 sm:mb-4">
              <Music size={20} className="text-blue-400 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold mb-2">Smart Analysis</h3>
            <p className="text-gray-400 text-xs sm:text-sm">
              AI analyzes your seed tracks to understand your musical taste and mood
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-800">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3 sm:mb-4">
              <Sparkles size={20} className="text-purple-400 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold mb-2">Diverse Discovery</h3>
            <p className="text-gray-400 text-xs sm:text-sm">
              Find new artists and deeper cuts, not just the obvious popular tracks
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-800 sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"/>
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-bold mb-2">Save to Spotify</h3>
            <p className="text-gray-400 text-xs sm:text-sm">
              One-click save your AI playlists directly to your Spotify account
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}