# Architecture

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS |
| Auth | Clerk (email/phone OTP) |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage (documents) |
| AI/LLM | OpenAI GPT-4o-mini |
| Vector Search | OpenAI Vector Store (for case law) |
| Document Gen | docx npm package |
| Hosting | Vercel |

## Folder Structure

```
/
├── knowledge-base/         # This documentation (not deployed)
├── src/
│   ├── app/
│   │   ├── (main)/        # Auth-protected routes
│   │   │   ├── ask/       # Legal Q&A chat
│   │   │   ├── my-case/   # Case management
│   │   │   └── profile/   # User profile
│   │   ├── api/
│   │   │   ├── research/  # Q&A endpoint
│   │   │   ├── cases/     # Case CRUD (TODO)
│   │   │   └── drafts/    # Document drafting (TODO)
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── components/        # Shared UI components
│   ├── lib/
│   │   ├── acts/          # Legal lookup functions
│   │   ├── openai.ts      # OpenAI client
│   │   └── supabase/      # DB clients
│   └── data/
│       └── acts/          # JSON files for Constitution, IPC, etc.
├── public/                # Static assets
└── .env.local             # Environment variables (not in git)
```

## Data Flow

### Q&A Flow
```
User Question
    ↓
[API: /api/research]
    ↓
1. Parse question for section/article references
2. Lookup in local JSON (acts/constitution.json, acts/ipc.json)
3. If found → Include as context
4. Send to OpenAI with system prompt + context
5. Return answer with citations
    ↓
Display in Chat UI
```

### Legal Data Sources

| Source | Format | Status |
|--------|--------|--------|
| Constitution of India | JSON (local) | Partial (8 articles) |
| Indian Penal Code | JSON (local) | Partial (8 sections) |
| CrPC | JSON (local) | TODO |
| CPC | JSON (local) | TODO |
| Evidence Act | JSON (local) | TODO |
| Supreme Court Judgments | PDF → Vector Store | TODO |

## Authentication Flow

```
User visits app
    ↓
[Clerk Middleware - src/proxy.ts]
    ↓
Not authenticated? → Redirect to /sign-in
Authenticated? → Allow access to (main)/* routes
```

## Database Schema (Planned)

```sql
-- profiles (synced from Clerk)
profiles (id, clerk_id, name, email, phone, bar_council_id, ...)

-- cases
cases (id, user_id, title, client_name, court, status, ...)

-- research sessions
ask_sessions (id, user_id, case_id, created_at)
research_messages (id, session_id, role, content, citations, ...)

-- drafts
drafts (id, case_id, template_id, content, status, ...)
```

## API Design Principles

1. All APIs under `/api/*`
2. Use Zod for request validation
3. Return consistent JSON: `{ data, error }`
4. Include proper error codes
5. Rate limit sensitive endpoints
