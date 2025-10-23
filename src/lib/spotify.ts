import SpotifyWebApi from "spotify-web-api-node"

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
})

export async function getSpotifyClient(accessToken: string) {
  spotifyApi.setAccessToken(accessToken)
  
  // Test if token works
  try {
    await spotifyApi.getMe()
    console.log("✅ Spotify token is valid!")
  } catch (error: any) {
    console.error("❌ Spotify token error:", {
      status: error.statusCode,
      message: error.message,
      body: error.body
    })
  }
  
  return spotifyApi
}

export default spotifyApi