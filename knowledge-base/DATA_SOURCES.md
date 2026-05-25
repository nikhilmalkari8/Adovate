# Data Sources

## Overview

The app uses two types of legal data:

1. **Structured Acts** (JSON) - Constitution, IPC, CrPC, etc.
2. **Case Law** (Vector Store) - Supreme Court judgments

---

## Acts Data (JSON)

### Location
```
src/data/acts/
├── constitution.json    # Constitution of India
├── ipc.json            # Indian Penal Code
├── crpc.json           # Code of Criminal Procedure (TODO)
├── cpc.json            # Code of Civil Procedure (TODO)
└── evidence.json       # Indian Evidence Act (TODO)
```

### Format
```json
{
  "name": "Constitution of India",
  "shortName": "Constitution",
  "sections": [
    {
      "section": "21",
      "title": "Protection of life and personal liberty",
      "text": "No person shall be deprived of his life or personal liberty except according to procedure established by law.",
      "citation": "Article 21, Constitution of India"
    }
  ]
}
```

### Adding New Sections

1. Edit the appropriate JSON file in `src/data/acts/`
2. Follow the exact format above
3. Ensure `section` field matches how users will ask (e.g., "21" for Article 21)
4. Include full text in `text` field
5. Provide proper citation format

### Current Coverage

| Act | Sections Included | Total Sections |
|-----|-------------------|----------------|
| Constitution | 8 | 395+ |
| IPC | 8 | 511 |
| CrPC | 0 | 484 |
| CPC | 0 | 158 |
| Evidence Act | 0 | 167 |

---

## Case Law (Vector Store) - TODO

### Planned Source

**AWS Open Data - Indian Legal Documents Corpus**
- URL: https://registry.opendata.aws/indian-legal-documents/
- Contains: Supreme Court judgments (PDFs)
- Size: ~50,000 cases

### Implementation Plan

1. Download PDFs from AWS Open Data
2. Create OpenAI Vector Store
3. Upload PDFs with metadata (case name, year, citation)
4. Implement RAG search in `/api/research`
5. Add citation verification to prevent hallucination

### Anti-Hallucination for Case Law

**CRITICAL:** Never let the model make up case citations.

Rules:
1. Only cite cases returned by Vector Store search
2. Include case citation in exact format: "Case Name vs Opponent (Year) Court"
3. If Vector Store returns no results, say "I couldn't find relevant case law"
4. Always add disclaimer about verification

---

## Official Sources (for reference)

| Resource | URL |
|----------|-----|
| India Code (Acts) | https://www.indiacode.nic.in/ |
| Supreme Court | https://www.sci.gov.in/ |
| Indian Kanoon | https://indiankanoon.org/ |
| Constitution | https://legislative.gov.in/constitution-of-india |

---

## Data Update Process

When adding new legal data:

1. **Verify source** - Use official government sources only
2. **Format correctly** - Follow JSON structure exactly
3. **Test locally** - Ask questions to verify lookup works
4. **Update this doc** - Update coverage table above
5. **Commit and deploy** - Push to main for production
