import SpotifyWebApi from "spotify-web-api-node"

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
})

interface SpotifyError {
  statusCode?: number
  message?: string
  body?: {
    error?: {
      message?: string
    }
  }
}

export async function getSpotifyClient(accessToken: string) {
  spotifyApi.setAccessToken(accessToken)
  
  // Test if token works
  try {
    await spotifyApi.getMe()
    console.log("✅ Spotify token is valid!")
  } catch (error: unknown) {
    const spotifyError = error as SpotifyError
    console.error("❌ Spotify token error:", {
      status: spotifyError.statusCode,
      message: spotifyError.message,
      body: spotifyError.body
    })
  }
  
  return spotifyApi
}

export default spotifyApi