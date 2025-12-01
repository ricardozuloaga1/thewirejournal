# The Wire Journal

**The Wire Journal** is an AI-powered newsroom platform that automatically generates professional news articles across multiple categories using specialized AI agents. Built with Next.js, TypeScript, and Supabase.

## 🌟 Features

- **Specialized AI Agents**: 6 dedicated agents for Politics, Economics, World, Business, Tech, and Opinion
- **Research-Powered**: Integrates Perplexity API for deep research with built-in citations
- **Image Pipeline**: 3-tier image generation (extraction → Gemini Imagen → DALL-E)
- **Editorial Dashboard**: Full admin interface for reviewing, editing, and publishing articles
- **Real-time Market Ticker**: Live market data integration with Finnhub
- **WSJ-Style Design**: Premium, professional newspaper aesthetic
- **Dynamic Routing**: Section pages and individual article pages

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Supabase account
- API keys for: OpenAI, Perplexity, Gemini, Finnhub

### Installation

```bash
# Clone the repository
git clone https://github.com/ricardozuloaga1/thewirejournal.git
cd thewirejournal

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `src/lib/supabase/schema.sql` in the SQL editor
3. Add your Supabase credentials to `.env.local`

## 📁 Project Structure

```
wsj-clone/
├── src/
│   ├── app/
│   │   ├── admin/          # Editorial dashboard
│   │   ├── api/            # API routes
│   │   ├── article/        # Article pages
│   │   └── section/        # Section pages
│   ├── components/         # React components
│   └── lib/
│       ├── agents/         # AI agent logic
│       ├── research/       # Perplexity integration
│       ├── images/         # Image generation
│       └── supabase/       # Database client
├── docs/                   # Documentation
└── public/                 # Static assets
```

## 🤖 AI Agents

Each agent has a unique byline and specialization:

- **Washington Bureau**: Politics coverage
- **Markets & Economics Desk**: Economic analysis
- **Foreign Correspondents**: World news
- **Corporate Affairs**: Business reporting
- **Innovation & Technology**: Tech industry
- **Editorial Board**: Opinion pieces

## 🎨 Key Technologies

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4, Gemini Imagen, DALL-E 3
- **Research**: Perplexity API
- **Styling**: Tailwind CSS v4
- **Deployment**: Netlify

## 📖 Documentation

- [Product Requirements Document](docs/PRD.md)
- [System Requirements Specification](docs/SRS.md)
- [Task Breakdown](TASKS.md)
- [Finnhub Setup](docs/FINNHUB_SETUP.md)

## 🔧 Environment Variables

```env
# LLM
OPENAI_API_KEY=your_openai_key
PERPLEXITY_API_KEY=your_perplexity_key
GEMINI_API_KEY=your_gemini_key

# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Market Data
FINNHUB_API_KEY=your_finnhub_key
```

## 🎯 Usage

### Run AI Agents

1. Go to `/admin`
2. Click "Run All Agents" or select a specific category
3. Review generated articles
4. Generate images for each article
5. Select lead story
6. Publish articles

### Edit Articles

Use the built-in AI editing tools:
- Punch Up Headline
- Shorten/Expand
- Strengthen Lead
- Add Data/Quotes
- Balance Perspectives
- Tone Adjustments

## 📝 License

MIT

## 🙏 Acknowledgments

Built with Next.js, powered by AI, inspired by quality journalism.

---

**The Wire Journal** - Where AI Meets Newsroom Excellence
