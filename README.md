# 🎵 AI Playlist Generator

An intelligent Spotify playlist generator that uses AI to analyze your favorite tracks and create perfectly curated playlists tailored to your musical taste.

## 📖 About

AI Playlist Generator is a web application that leverages artificial intelligence and Spotify's API to create personalized playlists. By analyzing 3-5 seed tracks selected by the user, the AI understands your musical preferences and generates a cohesive playlist with similar vibes, energy levels, and mood.

### ✨ Key Features

- 🤖 **AI-Powered Analysis** - Uses OpenAI to analyze musical characteristics and mood
- 🎯 **Smart Recommendations** - Intelligent fallback algorithm with genre-based diversity
- 🎛️ **Advanced Filters** - Control energy, danceability, mood, tempo, acousticness, and more
- 📊 **Visual Analytics** - See energy flow and emotional arc of your playlist
- 💾 **Save to Spotify** - One-click save directly to your Spotify account
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile
- 🔐 **Secure Authentication** - OAuth 2.0 integration with Spotify
- 📈 **Playlist History** - Browse and manage all your generated playlists

## 🚀 Demo

[Live Demo](https://playlist-maker-ruby.vercel.app/) *(Add your deployment URL here)*



## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, Lucide Icons
- **Charts**: Recharts
- **State Management**: React Hooks

### Backend
- **API Routes**: Next.js API Routes
- **Database**: PostgreSQL (via Railway)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **AI/ML**: OpenAI GPT-4o-mini

### External APIs
- **Spotify Web API**: Track search, recommendations, playlist creation
- **OpenAI API**: Playlist analysis and curation strategies

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.x or higher
- npm or yarn
- PostgreSQL database (or Railway account)
- Spotify Developer Account
- OpenAI API Key
- **ngrok** or similar tunneling service (required for local development with Spotify)

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/spotify-ai-playlist.git
cd spotify-ai-playlist
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Spotify API Credentials
# Get these from: https://developer.spotify.com/dashboard
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# NextAuth Configuration
# ⚠️ IMPORTANT: Use your ngrok URL for local development
# Example: https://abc123.ngrok.io
NEXTAUTH_URL=https://your-ngrok-url.ngrok.io
# For production: https://yourdomain.com

NEXTAUTH_SECRET=your_nextauth_secret_here
# Generate a secret with: openssl rand -base64 32

# Database
# Get this from Railway or your PostgreSQL provider
DATABASE_URL=postgresql://user:password@host:port/database

# OpenAI API
# Get this from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key
```

> 💡 **Remember**: Update `NEXTAUTH_URL` with your new ngrok URL each time you restart ngrok!

### 4. Set up ngrok for Local Development

**⚠️ IMPORTANT**: Spotify does not accept `localhost` URLs in production apps. You must use a public HTTPS URL for local development.

> 📖 **Need detailed help?** See our [Complete ngrok Setup Guide](NGROK_GUIDE.md) for troubleshooting and best practices.

#### Install ngrok

**Option 1: Download from website**
1. Go to [ngrok.com](https://ngrok.com/)
2. Sign up for a free account
3. Download ngrok for your OS
4. Follow installation instructions

**Option 2: Install via package manager**

```bash
# macOS (Homebrew)
brew install ngrok/ngrok/ngrok

# Windows (Chocolatey)
choco install ngrok

# Linux (Snap)
snap install ngrok
```

#### Start ngrok tunnel

```bash
# Start ngrok on port 3000 (before starting your dev server)
ngrok http 3000
```

You'll see output like:
```
Forwarding   https://abc123.ngrok.io -> http://localhost:3000
```

**Copy the `https://abc123.ngrok.io` URL** - you'll need it for the next step!

> 💡 **Tip**: Keep this terminal window open while developing. The ngrok URL changes each time you restart it (unless you have a paid plan with custom domains).

### 5. Set up Spotify Developer Account

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. In **Redirect URIs**, add your ngrok URL:
   ```
   https://your-ngrok-url.ngrok.io/api/auth/callback/spotify
   ```
   Example:
   ```
   https://abc123.ngrok.io/api/auth/callback/spotify
   ```
   
4. **For production**, also add your deployment URL:
   ```
   https://yourdomain.com/api/auth/callback/spotify
   ```

5. Copy your **Client ID** and **Client Secret** to `.env.local`

> ⚠️ **Important**: Every time you restart ngrok, you'll get a new URL. You'll need to update the Redirect URI in Spotify Dashboard each time (unless you use a paid ngrok plan with a static domain).

### 5. Set up Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 7. Run the development server

**Make sure ngrok is running first!**

```bash
# Terminal 1: Start ngrok
ngrok http 3000

# Terminal 2: Start Next.js dev server
npm run dev
# or
yarn dev
```

Open your **ngrok URL** (e.g., `https://abc123.ngrok.io`) in your browser - **NOT** `http://localhost:3000`

> ⚠️ **Important**: Always use the ngrok URL when testing Spotify authentication, not localhost!

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM. Here's the schema:

```prisma
model User {
  id         String     @id @default(cuid())
  email      String     @unique
  name       String?
  spotifyId  String?
  image      String?
  playlists  Playlist[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}

model Playlist {
  id                String   @id @default(cuid())
  name              String
  description       String?
  seedTracks        Json
  generatedTracks   Json
  audioFeatures     Json?
  aiReasoning       Json?
  spotifyPlaylistId String?
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

## 🎨 Project Structure

```
spotify-ai-playlist/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/           # Login page
│   │   ├── (main)/
│   │   │   ├── dashboard/       # Dashboard
│   │   │   ├── create/          # Playlist creation
│   │   │   ├── history/         # Playlist history
│   │   │   └── playlist/[id]/   # Playlist detail view
│   │   ├── api/                 # API routes
│   │   │   ├── auth/            # NextAuth endpoints
│   │   │   ├── playlist/        # Playlist operations
│   │   │   └── spotify/         # Spotify API proxy
│   │   ├── globals.css          # Global styles
│   │   └── layout.tsx           # Root layout
│   ├── components/
│   │   ├── dialogs/             # Modal components
│   │   ├── spotify/             # Spotify-related components
│   │   ├── ui/                  # Reusable UI components
│   │   └── visualizations/      # Chart components
│   ├── lib/
│   │   ├── openai.ts            # OpenAI integration
│   │   ├── spotify.ts           # Spotify API client
│   │   ├── prisma.ts            # Prisma client
│   │   └── utils.ts             # Utility functions
│   ├── types/                   # TypeScript type definitions
│   ├── auth.ts                  # NextAuth configuration
│   └── middleware.ts            # Route protection
├── prisma/
│   └── schema.prisma            # Database schema
├── public/                      # Static assets
├── .env.local                   # Environment variables (not in git)
├── package.json
├── tsconfig.json
└── next.config.ts
```

## 🎯 Core Features Explained

### AI-Powered Playlist Generation

The app uses a sophisticated algorithm that:

1. **Analyzes Seed Tracks**: Examines audio features (energy, danceability, valence, tempo)
2. **AI Strategy Generation**: Uses OpenAI to determine musical characteristics and genres
3. **Smart Discovery**: 
   - **Primary Method**: Spotify Recommendations API with custom parameters
   - **Fallback Algorithm**: Multi-strategy approach using:
     - AI-suggested artists
     - Genre-based searches
     - Related artist discovery
     - Diversity controls (max 2 tracks per artist)
4. **AI Analysis**: Post-generation analysis for playlist naming and insights

### Advanced Filters

Users can fine-tune their playlists with:
- **Energy Level**: Calm to Intense (0-100%)
- **Danceability**: How suitable for dancing (0-100%)
- **Mood (Valence)**: Sad to Happy (0-100%)
- **Tempo**: BPM range (60-200)
- **Acousticness**: Electronic to Acoustic (0-100%)
- **Year Range**: Filter by release date
- **Playlist Size**: 10-50 tracks

### Visualizations

Each playlist includes:
- **Energy Flow Chart**: Shows intensity progression
- **Emotional Arc**: Tracks mood changes
- **Genre Distribution**: Visual breakdown of genres
- **AI Insights**: Key moments and transitions

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Update Spotify Redirect URI to include your Vercel domain
5. Deploy!


Make sure to:
1. Set all environment variables
2. Update Spotify redirect URIs
3. Configure your database connection

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SPOTIFY_CLIENT_ID` | Spotify API Client ID | ✅ |
| `SPOTIFY_CLIENT_SECRET` | Spotify API Client Secret | ✅ |
| `NEXTAUTH_URL` | Full URL of your app | ✅ |
| `NEXTAUTH_SECRET` | Random secret for NextAuth | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | ✅ |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues

- Spotify Recommendations API is not available in Development Mode - the app uses an intelligent fallback algorithm
- Audio features are estimated based on genre when Spotify API access is limited



## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Your Name**
- GitHub: [@JackSvensson](https://github.com/JackSvensson)
- LinkedIn: [Jack Svensson](https://www.linkedin.com/in/jack-svensson/)

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api) for music data
- [OpenAI](https://openai.com) for AI capabilities
- [Next.js](https://nextjs.org) for the amazing framework
- [Vercel](https://vercel.com) for hosting
- [Railway](https://railway.app) for database hosting

## 📧 Support

If you have any questions or run into issues, please open an issue on GitHub or contact me at your.email@example.com

---

⭐️ If you found this project helpful, please give it a star on GitHub!

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# playlist-maker
