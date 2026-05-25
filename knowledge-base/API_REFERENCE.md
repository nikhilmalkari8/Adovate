# API Reference

## Base URL

- **Local:** `http://localhost:3000/api`
- **Production:** `https://adovate.vercel.app/api`

---

## Research API

### POST /api/research

Ask a legal question and get an AI-generated answer with citations.

**Request:**
```json
{
  "question": "What does Article 21 of the Constitution say?"
}
```

**Response:**
```json
{
  "answer": "Article 21 of the Constitution of India provides protection of life and personal liberty. It states: 'No person shall be deprived of his life or personal liberty except according to procedure established by law.' This is one of the most important fundamental rights...",
  "citations": [
    "Article 21, Constitution of India"
  ]
}
```

**Error Response:**
```json
{
  "error": "Failed to process question"
}
```

**Notes:**
- Currently supports Constitution and IPC lookups
- Falls back to OpenAI general knowledge if no specific section found
- Add disclaimer: citations should be verified from official sources

---

## Planned APIs

### Cases

```
POST   /api/cases          - Create new case
GET    /api/cases          - List user's cases
GET    /api/cases/[id]     - Get case details
PATCH  /api/cases/[id]     - Update case
DELETE /api/cases/[id]     - Delete case
```

### Drafts

```
GET    /api/templates              - List available templates
POST   /api/drafts                 - Create draft from template
GET    /api/drafts/[id]            - Get draft
PATCH  /api/drafts/[id]            - Update draft content
POST   /api/drafts/[id]/export     - Export as .docx
```

### Profile

```
GET    /api/profile        - Get user profile
PATCH  /api/profile        - Update profile
```

### Webhooks

```
POST   /api/webhooks/clerk - Clerk webhook for user sync
```

---

## Authentication

All APIs (except webhooks) require authentication via Clerk.

The `src/proxy.ts` middleware automatically:
1. Checks for valid Clerk session
2. Redirects unauthenticated users to /sign-in
3. Makes user ID available via `auth()`

**In API routes:**
```tsx
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // User is authenticated, proceed...
}
```

---

## Rate Limits (Planned)

| Endpoint | Limit |
|----------|-------|
| /api/research | 30 requests/minute |
| /api/drafts/*/export | 10 requests/minute |
| Others | 60 requests/minute |
