# Software Requirements Specification (SRS)

**Project:** AI WSJ-Style Automated Newsroom  
**Version:** v1.0

---

## 1. System Architecture

### 1.1 High-Level Diagram

```
[Scheduler (Cron @ 8 AM)]
       |
       v
[Agent Orchestrator] -----> [Research Layer]
       |                            |
       v                            v
[Agents (Politics, Econ, Opinion)] -> [LLM Writing Pipeline]
                                       |
                                       v
                                  [Image Pipeline]
                                       |
                                       v
                           [Database: Postgres/Supabase]
                                       |
                                       v
                             [Admin Dashboard UI]
                                       |
                                       v
                             [Public Next.js Website]
```

---

## 2. Functional Requirements

### 2.1 Scheduler
- Trigger URL `/api/run-agents` at 8:00 AM daily
- Executes all enabled agents sequentially or in parallel

---

### 2.2 Agents

#### 2.2.1 Required Agents (MVP)
- Politics Agent
- Economics Agent
- Opinion Agent

#### 2.2.2 Agent Input

Each agent must receive:
- Section name (politics, economics, opinion)
- Target number of articles
- Research packet
- Tone settings

#### 2.2.3 Agent Processing Steps
1. Topic selection
2. Deep research summarization
3. Draft writing
4. Self-critique
5. Improved draft
6. Image selection
7. Save to DB as draft

#### 2.2.4 Agent Output (DB fields)
- `title`
- `excerpt`
- `body`
- `section`
- `sources` (JSON)
- `image` metadata
- `quality_score`
- `status` = "draft"

---

### 2.3 Research Layer

**Requirements:**
- Input: section/keywords
- Output: JSON packet including:
  - `top_headlines[]`
  - `summaries[]`
  - `key_points[]`
  - `source_urls[]`
- Must integrate:
  - News API
  - Web search API
- Must deduplicate articles
- Must avoid hallucinated facts

---

### 2.4 Image Pipeline

**Step 1: Extraction**
- Scrape OG:image from each URL
- Validation rules:
  - Min resolution 600x400
  - Acceptable extensions: jpg, png, webp

**Step 2: Open-License Search**
- Query:
  - Unsplash
  - Pexels
  - Wikimedia CC0

**Step 3: AI-Generated Image**
- Prompt template:
  ```
  "Realistic news photo showing {topic description}, neutral lighting, no text."
  ```

---

## 3. Database Schema (Postgres)

### 3.1 articles

| field         | type      | notes                          |
|---------------|-----------|--------------------------------|
| id            | uuid      | PK                             |
| title         | text      | required                       |
| excerpt       | text      | short summary                  |
| body          | text      | markdown or html               |
| section       | text      | politics/econ/opinion          |
| image_id      | uuid      | FK to images                   |
| sources       | jsonb     | research origins               |
| quality_score | int       | 1–10                           |
| status        | text      | draft/published/discarded      |
| created_at    | timestamp |                                |
| updated_at    | timestamp |                                |

### 3.2 images

| field       | type      | notes                    |
|-------------|-----------|--------------------------|
| id          | uuid      | PK                       |
| article_id  | uuid      | FK                       |
| image_type  | text      | extracted/licensed/ai    |
| url         | text      | final URL                |
| origin_url  | text      | if extracted or licensed |
| prompt      | text      | if AI generated          |
| created_at  | timestamp |                          |

### 3.3 agent_runs

Tracks agent executions.

| field            | type      |
|------------------|-----------|
| id               | uuid      |
| agent_name       | text      |
| run_time         | timestamp |
| articles_created | int       |
| status           | success/error |
| error_message    | text      |

---

## 4. Backend API Endpoints

### 4.1 POST /api/run-agents
- Validates schedule
- Triggers all enabled agents
- Returns summary report

### 4.2 POST /api/revise-article

**Input:**
```json
{
  "article_id": "uuid",
  "revision_type": "shorten | neutralize | context | analysis | lede",
  "custom_notes": "optional"
}
```

### 4.3 POST /api/publish-article
- Changes status to published

### 4.4 GET /api/list-drafts
- Returns all drafts grouped by section

---

## 5. Frontend Requirements

### 5.1 Admin Dashboard
- Next.js protected route
- Components:
  - List of drafts
  - Article preview panel
  - Action buttons
  - Revision presets

### 5.2 Public Site
- Homepage (WSJ layout)
- Section pages
- Article pages
- Opinion page

---

## 6. Non-Functional Requirements

- **Uptime:** 99%
- All operations must complete within 5–10 min at 8 AM
- Generate 5–6 articles without timeout
- SEO-optimized pages
- Prevent hallucinated facts (via grounding in research packet)

---

*END OF SRS*


