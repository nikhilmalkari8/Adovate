# Project Overview

## Vision

Build the most trusted legal research assistant for Indian advocates - simple enough for non-technical users, accurate enough for court submissions.

## Target Users

**Primary:** Practicing advocates in India
- Age: 30-60 years
- Tech comfort: Low to medium
- Need: Quick, accurate legal research
- Pain point: Time spent on manual research, risk of citing wrong sections

## MVP Scope

### Core Features

1. **Legal Q&A (Ask Tab)**
   - Answer questions about Indian law
   - Cite specific sections/articles
   - Support Constitution, IPC, CrPC, CPC, Evidence Act
   - Case law search (Supreme Court judgments)

2. **Case Management (My Case Tab)**
   - Create and organize client cases
   - Integrated research within case context
   - Save citations and notes

3. **Document Drafting**
   - Pre-built legal templates
   - User-uploaded templates
   - Guided wizard for filling details
   - Export as Word document

4. **User Profile**
   - Professional details
   - Saved research history
   - Preferences (language, etc.)

### Non-Goals for MVP

- Community/social features (deferred)
- Mobile app (web-only for now)
- Payment/subscription (free MVP)
- Multi-language content (English only, Hindi UI later)

## Success Metrics

1. User can get accurate answer with citation in < 30 seconds
2. Zero hallucinated case citations
3. Document generation in < 2 minutes
4. Non-technical user can use without training

## Anti-Hallucination Strategy

This is CRITICAL. The app must NEVER hallucinate legal citations.

**Rules:**
1. Only cite sections/articles from our verified database
2. For case law, use RAG with verified Supreme Court judgments
3. If not found, say "I couldn't find this" - never make up citations
4. Add disclaimer: "Verify from official sources"

See `ARCHITECTURE.md` for technical implementation.
