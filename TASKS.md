# TASKS.md

## AI WSJ Newsroom — Engineering Task Breakdown

### Version: MVP

---

## 1. Project Setup

- [ ] Create Next.js codebase
- [ ] Set up TypeScript config
- [ ] Install dependencies (LLM SDK, axios, supabase client, etc.)
- [ ] Initialize Supabase / Neon Postgres database
- [ ] Configure environment variables

---

## 2. Database Implementation

- [ ] Create `articles` table
- [ ] Create `images` table
- [ ] Create `agent_runs` table
- [ ] Add indexes for `status`, `section`

---

## 3. Research Layer

- [ ] Build `/lib/research/getNews.ts`
- [ ] Integrate News API
- [ ] Integrate web search API
- [ ] Implement deduplication logic
- [ ] Implement summarization (LLM)
- [ ] Format final "research packet" JSON

---

## 4. Agents Implementation

### 4.1 Base Agent
- [ ] Create base agent class
- [ ] Add helper functions (writing pipeline, critique, rewrite)
- [ ] Add quality scoring

### 4.2 Politics Agent
- [ ] Create prompt template
- [ ] Implement article generator logic

### 4.3 Economics Agent
- [ ] Prompt + generator logic

### 4.4 Opinion Agent
- [ ] Prompt + long-form generator logic

---

## 5. Image Pipeline

- [ ] Implement OG:image extraction
- [ ] Implement open-licensed image search
- [ ] AI image generation fallback
- [ ] Store image metadata in DB

---

## 6. API Routes

- [ ] `POST /api/run-agents`
- [ ] `POST /api/revise-article`
- [ ] `POST /api/publish-article`
- [ ] `GET /api/list-drafts`

---

## 7. Admin Dashboard (Next.js)

- [ ] Dashboard layout
- [ ] Draft list view
- [ ] Draft detail view
- [ ] Action buttons (publish / revise / discard)
- [ ] Revision presets modal

---

## 8. Public Frontend (Next.js)

- [ ] Homepage layout (WSJ style)
- [ ] Section page templates
- [ ] Article page template
- [ ] Opinion section template

---

## 9. Cron / Scheduler

- [ ] Set up Vercel cron job hitting `/api/run-agents` daily at 8AM
- [ ] Add logging to `agent_runs`

---

## 10. QA & Testing

- [ ] Test writing pipeline end-to-end
- [ ] Test image fallback logic
- [ ] Test admin revision requests
- [ ] Load-test agent run (5–6 articles at once)
- [ ] Fix any drift or hallucination issues

---

## 11. Deployment

- [ ] Deploy to Vercel
- [ ] Connect to Supabase production DB
- [ ] Secure environment variables
- [ ] Final smoke test

---

## 12. Optional (Post-MVP)

- [ ] Add breaking news agent
- [ ] Add analytics dashboard
- [ ] Add user accounts + subscriptions


