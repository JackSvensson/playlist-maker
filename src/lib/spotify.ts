import SpotifyWebApi from "spotify-web-api-node"

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
})

export async function getSpotifyClient(accessToken: string) {
  spotifyApi.setAccessToken(accessToken)
  return spotifyApi
}

export default spotifyApi