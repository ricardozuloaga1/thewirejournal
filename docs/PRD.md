# Product Requirements Document (PRD)

**Project:** AI-Powered WSJ-Style Automated Newsroom  
**Owner:** Ricardo  
**Version:** v1.0 (MVP)  
**Goal:** Ship a functioning daily AI newsroom with high-quality writing and minimal manual work.

---

## 1. Overview

Build an AI-driven digital newspaper modeled after the WSJ.

The system uses domain-specific AI agents to research, write, and draft articles automatically every morning at 8 AM, which the editor (Ricardo) quickly reviews and publishes.

The MVP focuses on:
- High-quality writing
- Minimal manual review
- Fast-to-build, modular architecture
- WSJ-style front page already designed

---

## 2. Users

### 2.1 Primary User: Editor-in-Chief
- Reviews drafts
- Approves, rejects, or requests revisions
- Adds optional feedback

### 2.2 Secondary User: Reader (public website visitor)
- Views published articles
- Navigates by section (Politics, Economics, etc.)

---

## 3. Product Goals

### 3.1 MVP Goals
- Automated daily article generation
- High editorial quality (WSJ tone)
- Fast and simple admin dashboard
- Fully functioning WSJ-style homepage

### 3.2 Non-Goals (for MVP)
- User login system
- Breaking news alerts
- Monetization
- Video or audio generation
- Multi-language support

---

## 4. Core Features (MVP)

### 4.1 AI Agents

Agents to include in MVP:
- **Politics Agent**
- **Economics Agent**
- **Opinion Agent**

Each produces:
- 2 articles per day (Opinion: 1 long-form)
- Runs at 8:00 AM automatically

### 4.2 Research System
- Web search + news API aggregation
- Summaries & topic scoring
- Delivered as a "research packet" to agents
- Sources stored internally (not shown publicly)

### 4.3 Writing Pipeline

Each article is produced via:
1. Draft
2. Self-critique
3. Improved final version
4. Automatic quality scoring

### 4.4 Image Pipeline

Order of attempts:
1. Extract hero image
2. Open-licensed image search
3. AI-generated news-style photo

### 4.5 Admin Editor Dashboard

Functions:
- Display daily drafts
- Preview article + image + metadata
- Actions:
  - Publish
  - Request Revision (preset buttons)
  - Discard

### 4.6 WSJ-Style Public Website
- Homepage
- Section pages
- Article pages
- Opinion page

---

## 5. Success Metrics

### 5.1 Core Metrics
- ≥ 80% of drafts require no manual edit
- Editor review time < 20 min per day
- ≥ 90% articles pass internal quality score ≥ 7/10
- System uptime > 99%

---

## 6. Risks
- API rate limits
- Incorrect fact extraction
- Style drift
- Image copyright risk (mitigated via image hierarchy)

---

## 7. Timeline

**Weeks 1–4 MVP**
- Week 1: Backend scaffold + DB
- Week 2: Agents + research layer
- Week 3: Admin dashboard
- Week 4: UI integration and polishing

---

*END OF PRD*


