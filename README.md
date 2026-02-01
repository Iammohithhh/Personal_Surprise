# Love Story Surprise

Create beautiful, interactive romantic surprises for your loved ones. Transform your cherished memories into an unforgettable emotional experience.

## Features

- **Memory Collection**: Upload photos, write notes, add dates and locations for your special moments together
- **AI-Powered Storytelling**: Your memories are transformed into beautifully crafted narrative chapters (supports Groq FREE API or OpenAI)
- **Immersive Experience**: Recipients experience the story with:
  - Paced reveals (no skipping!)
  - Typing animations for emotional impact
  - Inner monologue reveals showing unspoken feelings
  - Starry night backgrounds with falling petals
  - Beautiful transitions between chapters
- **The Big Question**: End with your special question (Valentine's, proposal, anniversary, etc.)
- **Emotional Response**: Beautiful "Yes" celebration or gentle "Not yet" acknowledgment

## Perfect For

- Valentine's Day
- Proposals
- Anniversaries
- Birthdays
- Wedding gifts
- Any special occasion

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Personal_Surprise
```

2. Install dependencies:
```bash
npm install
```

3. Set up AI for story generation (Groq is FREE!):
```bash
cp .env.example .env.local
```
Then get your FREE Groq API key at https://console.groq.com/keys and add it to `.env.local`:
```
GROQ_API_KEY=your_groq_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Landing Page**: Click "Begin Your Story"
2. **Names**: Enter your name and your partner's name
3. **Occasion**: Select the special occasion
4. **Memories**: Add your memories with photos, notes, dates, and locations
5. **Final Message**: Write your special question/message
6. **Preview**: Review and preview the experience
7. **Share**: Send the experience to your loved one

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **State Management**: Zustand
- **AI**: Groq Llama 3.3 70B (FREE!) or OpenAI GPT-4o-mini
- **Icons**: Lucide React

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for AI narratives (FREE!) | No* |
| `OPENAI_API_KEY` | OpenAI API key (paid alternative) | No* |

*At least one AI key recommended for best experience. Without any key, beautiful fallback narratives are used.

## Project Structure

```
src/
├── app/
│   ├── api/generate/   # Story generation API
│   ├── globals.css     # Global styles & romantic theme
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page
├── components/
│   ├── Landing.tsx     # Landing page hero
│   ├── CreateStory.tsx # Memory input wizard
│   ├── Preview.tsx     # Story preview
│   ├── Experience.tsx  # The immersive experience
│   ├── FallingPetals.tsx
│   ├── StarryBackground.tsx
│   └── HeartIcon.tsx
├── store/
│   └── useStore.ts     # Zustand state management
└── types/
    └── index.ts        # TypeScript types
```

## Deployment

Deploy easily on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/love-story-surprise)

Or build for production:

```bash
npm run build
npm start
```

## License

MIT
