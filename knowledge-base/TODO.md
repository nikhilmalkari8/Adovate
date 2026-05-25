# TODO - Pending Features

**Last Updated:** 2026-05-25

## Priority 1: Complete Legal Data

### Acts Data (JSON files)
- [ ] Constitution of India - Add all 395+ articles
- [ ] Indian Penal Code - Add all 511 sections
- [ ] Code of Criminal Procedure (CrPC) - Full act
- [ ] Code of Civil Procedure (CPC) - Full act
- [ ] Indian Evidence Act - Full act
- [ ] Negotiable Instruments Act - Full act

**Location:** `src/data/acts/`
**Format:** See existing `constitution.json` for structure

### Case Law (Vector Store)
- [ ] Set up OpenAI Vector Store
- [ ] Download Supreme Court judgments (AWS Open Data)
- [ ] Upload PDFs to Vector Store
- [ ] Implement RAG search in /api/research
- [ ] Add citation verification (anti-hallucination)

---

## Priority 2: Case Management

### Database Setup
- [ ] Create Supabase tables (profiles, cases, research_messages, drafts)
- [ ] Set up Row Level Security (RLS)
- [ ] Create Clerk webhook for profile sync

### API Endpoints
- [ ] POST /api/cases - Create case
- [ ] GET /api/cases - List user's cases
- [ ] GET /api/cases/[id] - Get case details
- [ ] PATCH /api/cases/[id] - Update case
- [ ] DELETE /api/cases/[id] - Delete case

### UI
- [ ] Case list view with filters
- [ ] Case detail page
- [ ] Case workspace (research + drafts in context)
- [ ] Save research to case

---

## Priority 3: Document Drafting

### Templates
- [ ] Create 6 built-in templates:
  - Bail Application
  - Writ Petition
  - Legal Notice
  - Vakalatnama
  - Affidavit
  - Written Statement

### API Endpoints
- [ ] GET /api/templates - List templates
- [ ] POST /api/drafts - Create draft from template
- [ ] PATCH /api/drafts/[id] - Update draft
- [ ] POST /api/drafts/[id]/export - Export as .docx

### UI
- [ ] Template selection screen
- [ ] Guided wizard for filling fields
- [ ] Preview panel
- [ ] Revision chat (ask for changes)
- [ ] Download button

---

## Priority 4: Enhancements

### Research History
- [ ] Save research sessions to Supabase
- [ ] Show history in Ask tab
- [ ] Resume previous sessions

### Library
- [ ] Save favorite citations
- [ ] Export research as PDF
- [ ] Organize by case/topic

### Voice Input
- [ ] Add microphone button
- [ ] Integrate Web Speech API
- [ ] Fallback to OpenAI Whisper

### i18n
- [ ] Hindi UI translations
- [ ] Language toggle in profile
- [ ] next-intl setup

---

## Priority 5: Production Hardening

### Security
- [ ] Rate limiting on APIs
- [ ] Input sanitization
- [ ] CORS configuration
- [ ] Audit logging

### Performance
- [ ] Optimize bundle size
- [ ] Add loading skeletons
- [ ] Implement caching

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics (basic usage)
- [ ] Uptime monitoring

---

## How to Pick Up a Task

1. Choose a task from Priority 1 first
2. Create a branch: `git checkout -b feature/task-name`
3. Implement the feature
4. Update `COMPLETED.md` when done
5. Remove from this file or mark with [x]
6. Push and create PR to `dev`, then merge to `main`
