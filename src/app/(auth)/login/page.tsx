import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          AI Playlist Generator
        </h1>
        <p className="text-gray-400 text-xl mb-8">
          Create intelligent playlists powered by AI
        </p>
        <Button
          onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
          className="bg-[#1DB954] hover:bg-[#1ed760] text-white px-8 py-6 text-lg"
        >
          Login with Spotify
        </Button>
      </div>
    </div>
  )
}