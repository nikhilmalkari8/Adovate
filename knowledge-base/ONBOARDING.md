# Onboarding Guide

**Read time: 2 minutes**

## What is Advocate?

An AI-powered legal assistant for Indian advocates. Users can:
1. **Ask legal questions** - Get answers about Constitution, IPC, CrPC, case law with accurate citations
2. **Manage cases** - Organize client cases, research, and documents
3. **Draft documents** - Generate legal documents from templates

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Auth:** Clerk (email/phone OTP)
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI GPT-4o-mini
- **Hosting:** Vercel
- **Styling:** Tailwind CSS

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (main)/            # Authenticated pages (Ask, My Case, Profile)
│   ├── api/               # API routes
│   ├── sign-in/           # Clerk sign-in
│   └── sign-up/           # Clerk sign-up
├── components/            # Reusable React components
├── lib/                   # Utilities and clients
│   ├── acts/              # Legal acts lookup functions
│   ├── openai.ts          # OpenAI client
│   └── supabase/          # Supabase clients
└── data/                  # Static JSON data
    └── acts/              # Constitution, IPC, etc.
```

## Key Files to Know

- `src/app/api/research/route.ts` - Main Q&A API endpoint
- `src/lib/acts/lookup.ts` - Legal section lookup logic
- `src/data/acts/*.json` - Legal acts data
- `src/proxy.ts` - Auth middleware (Clerk)

## Running Locally

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Environment Variables

See `.env.local` for required keys:
- Supabase (URL, anon key, service key)
- OpenAI (API key, model)
- Clerk (publishable key, secret key)

## Current State

**Skeleton v0.1 is live.** See `COMPLETED.md` for what's built and `TODO.md` for what's pending.
