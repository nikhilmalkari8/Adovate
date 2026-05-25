# Coding Standards

## General Principles

1. **Keep it simple** - This app is for non-technical users, code should be maintainable
2. **Type everything** - Use TypeScript strictly, no `any` types
3. **Fail gracefully** - Always handle errors, never crash the app
4. **Document intent** - Comment WHY, not WHAT

## File Naming

```
components/         # PascalCase: ChatMessage.tsx, UserButton.tsx
lib/                # camelCase: openai.ts, supabase/client.ts
app/api/            # Route handlers: route.ts
data/               # lowercase: constitution.json, ipc.json
```

## Component Structure

```tsx
// 1. Imports (external first, then internal)
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Types/interfaces
interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

// 3. Component
export function MyComponent({ title, onSubmit }: Props) {
  // Hooks first
  const [loading, setLoading] = useState(false);
  
  // Handlers
  const handleSubmit = async () => {
    setLoading(true);
    // ...
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

## API Routes

```tsx
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// 1. Define schema
const RequestSchema = z.object({
  field: z.string().min(1),
});

// 2. Handler
export async function POST(request: NextRequest) {
  try {
    // Parse and validate
    const body = await request.json();
    const data = RequestSchema.parse(body);
    
    // Business logic
    const result = await doSomething(data);
    
    // Success response
    return NextResponse.json({ data: result });
    
  } catch (error) {
    // Error response
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
```

## State Management

- Use React `useState` for local state
- Use URL params for shareable state
- Use Supabase for persistent state
- NO Redux/Zustand unless absolutely necessary

## Styling

- Use Tailwind CSS classes
- Mobile-first responsive design
- Use consistent spacing (p-4, gap-2, etc.)
- Color palette: blue-600 (primary), gray-* (neutral)

## Error Handling

```tsx
// Always wrap async operations
try {
  const data = await fetchSomething();
  return data;
} catch (error) {
  console.error("Context:", error);
  // Return safe fallback or throw user-friendly error
  return null;
}
```

## Git Workflow

1. Create feature branch from `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/my-feature
   ```

2. Make commits with clear messages:
   ```bash
   git commit -m "Add: user profile API endpoint"
   git commit -m "Fix: section lookup for Article 21A"
   git commit -m "Update: increase chat message limit"
   ```

3. Push and merge to dev:
   ```bash
   git push origin feature/my-feature
   # Create PR to dev, review, merge
   ```

4. Deploy to production:
   ```bash
   git checkout main
   git merge dev
   git push origin main
   # Vercel auto-deploys
   ```

## Legal Data Format

When adding new acts/sections:

```json
{
  "name": "Full Act Name",
  "shortName": "Abbreviation",
  "sections": [
    {
      "section": "21",
      "title": "Section Title",
      "text": "Full text of the section...",
      "citation": "Article 21, Constitution of India"
    }
  ]
}
```

## Testing Checklist

Before marking a feature complete:

- [ ] Works on mobile viewport
- [ ] Handles loading states
- [ ] Handles error states
- [ ] No console errors
- [ ] TypeScript has no errors
- [ ] Tested with real user flow
