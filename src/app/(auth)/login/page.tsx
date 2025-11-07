import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await auth()
  
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          AI Playlist Generator
        </h1>
        <p className="text-gray-400 text-xl mb-8">
          Create intelligent playlists powered by AI
        </p>
        <form
          action={async () => {
            "use server"
            await signIn("spotify", { redirectTo: "/dashboard" })
          }}
        >
          <button
            type="submit"
            className="bg-[#1DB954] hover:bg-[#1ed760] text-white px-8 py-4 text-lg rounded-full font-semibold transition"
          >
            Login with Spotify
          </button>
        </form>
      </div>
    </div>
  )
}