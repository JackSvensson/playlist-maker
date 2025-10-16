import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"

const scopes = [
  "user-read-email",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-top-read",
  "user-read-recently-played",
].join(",")

const params = {
  scope: scopes,
}

const LOGIN_URL = "https://accounts.spotify.com/authorize?" + 
  new URLSearchParams(params).toString()

async function refreshAccessToken(token: any) {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: token.refreshToken,
  })

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: params,
  })

  const data = await response.json()

  return {
    ...token,
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? token.refreshToken,
    accessTokenExpires: Date.now() + data.expires_in * 1000,
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: LOGIN_URL,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at! * 1000,
          user,
        }
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      return await refreshAccessToken(token)
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.user = token.user as any
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  useSecureCookies: false, // <-- LÄGG TILL DENNA!
  secret: process.env.NEXTAUTH_SECRET,
})