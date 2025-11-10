import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation"
import { Music, TrendingUp, Zap } from "lucide-react"

export default async function LoginPage() {
  const session = await auth()
  
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center">
              <Music size={24} className="text-white sm:w-7 sm:h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              AI Playlist Generator
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative">
        {/* Main Content */}
        <div className="flex flex-col items-center justify-center px-4 py-16 sm:py-20 lg:py-24">
          {/* Icon */}
          <div className="mb-8 sm:mb-12">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center shadow-2xl shadow-[#1DB954]/50">
              <Music size={64} className="text-white sm:w-20 sm:h-20" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-center max-w-4xl">
            Create Perfect Playlists with AI
          </h2>

          {/* Description */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-10 sm:mb-12 text-center max-w-3xl px-4">
            Select your favorite tracks and let our AI analyze your music taste to generate personalized playlists with perfect energy flow and emotional progression.
          </p>

          {/* CTA Button */}
          <form
            action={async () => {
              "use server"
              await signIn("spotify", { redirectTo: "/dashboard" })
            }}
          >
            <button
              type="submit"
              className="bg-[#1DB954] hover:bg-[#1ed760] text-white text-lg sm:text-xl px-10 sm:px-12 py-4 sm:py-5 rounded-full font-bold transition-all transform hover:scale-105 shadow-xl shadow-[#1DB954]/30"
            >
              Get Started with Spotify
            </button>
          </form>
        </div>

        {/* Feature Cards */}
        <div className="px-4 pb-16 sm:pb-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* AI-Powered Analysis */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-800 hover:border-[#1DB954]/50 transition-all">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-[#1DB954]/20 flex items-center justify-center mb-4 sm:mb-6">
                <Music className="text-[#1DB954]" size={28} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">AI-Powered Analysis</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Advanced AI analyzes audio features, tempo, energy, and emotional characteristics to create perfectly balanced playlists.
              </p>
            </div>

            {/* Smart Transitions */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-800 hover:border-[#1DB954]/50 transition-all">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-[#1DB954]/20 flex items-center justify-center mb-4 sm:mb-6">
                <TrendingUp className="text-[#1DB954]" size={28} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Smart Transitions</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Intelligent track ordering with smooth tempo and key transitions for an optimal listening experience.
              </p>
            </div>

            {/* Instant Save */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-800 hover:border-[#1DB954]/50 transition-all sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-[#1DB954]/20 flex items-center justify-center mb-4 sm:mb-6">
                <Zap className="text-[#1DB954]" size={28} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Instant Save</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Save generated playlists directly to your Spotify account with one click and access them anywhere.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 sm:py-20 lg:py-24 px-4 bg-gradient-to-b from-black via-gray-900/50 to-black">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-12 sm:mb-16">How It Works</h2>
          
          <div className="space-y-8 sm:space-y-12">
            {/* Step 1 */}
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#1DB954] flex items-center justify-center flex-shrink-0 text-2xl sm:text-3xl font-bold shadow-lg shadow-[#1DB954]/30">
                1
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Connect Your Spotify</h3>
                <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                  Securely log in with your Spotify account to access your music library.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#1DB954] flex items-center justify-center flex-shrink-0 text-2xl sm:text-3xl font-bold shadow-lg shadow-[#1DB954]/30">
                2
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Select Seed Tracks</h3>
                <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                  Choose 3-5 tracks that represent your desired vibe and mood.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#1DB954] flex items-center justify-center flex-shrink-0 text-2xl sm:text-3xl font-bold shadow-lg shadow-[#1DB954]/30">
                3
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">AI Generates Your Playlist</h3>
                <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                  Our AI analyzes audio features and creates a perfectly curated playlist.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#1DB954] flex items-center justify-center flex-shrink-0 text-2xl sm:text-3xl font-bold shadow-lg shadow-[#1DB954]/30">
                4
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Save &amp; Enjoy</h3>
                <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                  Save your new playlist to Spotify and start listening immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="py-16 sm:py-20 px-4 text-center border-t border-gray-800">
        <h3 className="text-3xl sm:text-4xl font-bold mb-4">Ready to discover new music?</h3>
        <p className="text-gray-400 mb-8 text-base sm:text-lg">Join thousands creating AI-powered playlists</p>
        <form
          action={async () => {
            "use server"
            await signIn("spotify", { redirectTo: "/dashboard" })
          }}
        >
          <button
            type="submit"
            className="bg-[#1DB954] hover:bg-[#1ed760] text-white text-lg px-10 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-xl shadow-[#1DB954]/30"
          >
            Get Started Now
          </button>
        </form>
      </div>
    </div>
  )
}