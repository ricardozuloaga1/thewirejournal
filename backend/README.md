# The Wire Journal - Flask Backend

Python Flask backend for The Wire Journal AI newsroom platform.

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon key
- `OPENAI_API_KEY` - OpenAI API key
- `PERPLEXITY_API_KEY` - Perplexity API key
- `GEMINI_API_KEY` - Google Gemini API key (optional)
- `FINNHUB_API_KEY` - Finnhub API key for market data
- `SECRET_KEY` - Flask secret key (generate random string)
- `JWT_SECRET_KEY` - JWT secret key (generate random string)

### 4. Database Setup

Run the SQL schema update in your Supabase SQL editor:

```bash
cat database/schema_update.sql
```

This creates the `users`, `user_bookmarks`, and `user_reading_history` tables.

### 5. Run Development Server

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires JWT)
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user account
- `GET /api/users/:id/preferences` - Get user preferences
- `PUT /api/users/:id/preferences` - Update preferences
- `GET /api/users/:id/bookmarks` - Get bookmarked articles
- `POST /api/users/:id/bookmarks/:article_id` - Bookmark article
- `DELETE /api/users/:id/bookmarks/:article_id` - Remove bookmark

### Articles
- `GET /api/articles` - List published articles
- `GET /api/articles/personalized` - Get personalized feed (requires JWT)
- `GET /api/articles/:id` - Get article by ID
- `GET /api/articles/slug/:slug` - Get article by slug
- `GET /api/articles/lead` - Get lead/hero article
- `GET /api/articles/sections/:section` - Get articles by section
- `POST /api/articles` - Create article (requires JWT)
- `PUT /api/articles/:id` - Update article (requires JWT)
- `DELETE /api/articles/:id` - Delete article (requires JWT)
- `POST /api/articles/:id/publish` - Publish article (requires JWT)
- `POST /api/articles/:id/read` - Track reading (requires JWT)

### AI Agents
- `POST /api/agents/run` - Run single agent (requires JWT)
- `POST /api/agents/run-all` - Run all agents (requires JWT)
- `GET /api/agents/status` - Get agent run history (requires JWT)

### Images
- `POST /api/images/generate` - Generate images for article (requires JWT)
- `POST /api/images/:id/select` - Select image for article (requires JWT)

### Health
- `GET /api/health` - Health check

## Project Structure

```
backend/
├── app.py                    # Flask application entry point
├── config.py                 # Configuration
├── requirements.txt          # Python dependencies
├── agents/                   # AI agents
│   ├── base_agent.py         # Base agent class
│   ├── politics_agent.py     # Politics agent
│   ├── economics_agent.py    # Economics agent
│   ├── world_agent.py        # World news agent
│   ├── business_agent.py     # Business agent
│   ├── tech_agent.py         # Tech agent
│   ├── opinion_agent.py      # Opinion agent
│   ├── writing_styles.py     # Writing style definitions
│   └── orchestrator.py       # Agent orchestration
├── routes/                   # API routes
│   ├── auth.py               # Authentication routes
│   ├── users.py              # User management routes
│   ├── articles.py           # Article CRUD routes
│   ├── agents.py             # Agent execution routes
│   └── images.py             # Image generation routes
├── services/                 # Business logic services
│   ├── openai_service.py     # OpenAI integration
│   ├── perplexity_service.py # Perplexity research API
│   └── image_service.py      # Image generation
├── models/                   # Data models
│   └── user.py               # User model
└── database/                 # Database
    ├── supabase_client.py    # Supabase client
    └── schema_update.sql     # Database schema updates
```

## Development

### Testing Authentication

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Running Agents

```bash
# Run all agents
curl -X POST http://localhost:5000/api/agents/run-all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"word_count":800,"writing_style":"standard"}'
```

## Deployment

### Heroku

```bash
# Install Heroku CLI
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_KEY=your_key
# ... set all other env vars

# Deploy
git push heroku main
```

### Railway

1. Connect your GitHub repository
2. Add environment variables in Railway dashboard
3. Deploy automatically on push

## License

MIT

