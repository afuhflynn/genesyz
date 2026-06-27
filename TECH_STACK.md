# IdeasVault — Tech Stack (Corrected)

## Active Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Framework** | Next.js 16.1.1 (App Router) | React Compiler enabled (`reactCompiler: true`) |
| **Language** | TypeScript 5.x | Strict mode, `@/*` path alias |
| **Database** | PostgreSQL 15 (Docker, port 5446) | Health-checked, persistent volume |
| **ORM** | Prisma 7 | `prisma.config.ts` format, 45 models, 17 enums |
| **Auth** | Better Auth 1.4 | Email/password, Google OAuth, Magic Link + Arcjet rate limiting |
| **AI Model** | Google Gemini 2.5 Flash via `@ai-sdk/google` | Single model for all agents |
| **AI SDK** | Vercel AI SDK v6 | `generateObject`, `generateText`, `streamText`, `useChat` |
| **Background Jobs** | Inngest 3.48 | 14 functions (6 cron, 8 event-driven) with Realtime middleware |
| **Rate Limiting** | Arcjet | Shield + Bot detection + per-endpoint AI rate limits |
| **File Storage** | UploadThing 7.x | File uploads, PDF export storage |
| **Billing** | Polar SDK + @polar-sh/better-auth plugin | Free (3 ideas) / Pro ($20/mo, unlimited) |
| **Styling** | Tailwind CSS v4 + tw-animate-css | CSS-based config (no tailwind.config) |
| **UI Components** | shadcn/ui (New York style, neutral base) | ~35 Radix primitives |
| **Charts** | Recharts 2.15 | Area charts, line charts |
| **Drag & Drop** | @dnd-kit/core 6.3 | Task board Kanban |
| **Forms** | React Hook Form 7 + Zod 4 | @hookform/resolvers |
| **State Management** | TanStack React Query v5 | 5-min stale time, 10-min GC |
| **URL State** | nuqs 2.8 | Search params, conversation IDs |
| **Animations** | Framer Motion 12 | Page transitions, hero animations |
| **Icons** | Lucide React | UI icons |
| **Email** | Nodemailer 7 (Gmail SMTP) | Adapter-ready for Postmark/SendGrid |
| **Web Search** | Tavily (`@tavily/core`) | Deep research, opportunity discovery |
| **Linting/Formatting** | Biome 2.2 | Recommended rules, organize imports on save |
| **PDF Generation** | pdfkit 0.17 | Server-side research report PDFs |
| **Syntax Highlighting** | Shiki 3.21 | Code blocks in AI responses |
| **Toasts** | Sonner 2.0 | Toast notifications |
| **Fonts** | Inter + IBM Plex Mono (next/font/google) | Sans-serif + monospace |

## Environment Variables

**43 variables across 9 categories:**

| Category | Variables | Required for Dev? |
|----------|-----------|-------------------|
| Database | `DATABASE_URL` | Yes |
| App | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME` | Yes |
| Auth | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Partial (secret + URL required) |
| AI | `GOOGLE_GENERATIVE_AI_API_KEY`, `TAVILY_API_KEY` | Partial (Gemini key needed) |
| Vector | `PINECONE_API_KEY`, `PINECONE_INDEX`, `PINECONE_ENVIRONMENT` | No (unused) |
| Storage | `UPLOADTHING_TOKEN` | Partial (for file uploads) |
| Email | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | No (graceful fallback) |
| Jobs | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | Dev defaults provided |
| Security | `ARCJET_KEY` | No (rate limiting only) |
| Billing | `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_ORGANIZATION_ID`, `POLAR_FREE_PRODUCT_ID`, `POLAR_PRO_PRODUCT_ID` | No (billing only) |

## Key Corrections from Previous Documentation

| What Changed | Old (README) | New (Actual) |
|-------------|-------------|--------------|
| AI Models | Triple (GPT-4o primary + Mistral secondary + Gemini tertiary) | **Single** (Gemini 2.5 Flash only) |
| File Storage | DigitalOcean Spaces | **UploadThing** (DO Spaces not configured) |
| Rate Limiting | Not mentioned | **Arcjet** (Shield + Bot detection + AI endpoint limits) |
| Background Jobs | Mentioned generically | **14 Inngest functions** (6 crons, 8 event-driven) |
| State Management | Not mentioned | **TanStack React Query v5** |
| URL State | Not mentioned | **nuqs** |
| Missing middleware | Not mentioned | `proxy.ts` exists but no `middleware.ts` at root |
| Vector Search | "Pinecone OR Supabase" | Pinecone installed but **unused** |

## Installed but Not Used (Candidate Removal)

See `UNUSED_DEPENDENCIES.md` for full analysis. Notable:
- `@ai-sdk/xai`, `ai-sdk-ollama`, `@openrouter/ai-sdk-provider` — Alternative AI providers not yet integrated
- `@pinecone-database/pinecone` — Vector search installed but not wired
- `@react-pdf/renderer` — Dual PDF library, `pdfkit` is the active one
- `vitest` — Listed in production deps instead of devDeps
- `mprocs`, `list`, `streamdown`, `tokenlens` — Developer utilities in production deps

## Migrations & Changes

### v0.1 → Current
- Single-model → Dual-model → Triple-model fallback → **Single-model: Gemini 2.5 Flash**
- Idea validator → **Full Startup OS** (tracker, accelerator hub, opportunities, strategic advisory)
- Basic auth → **Better Auth** with social login and magic link
- Simple scoring → **6-agent pipeline** with real-time streaming
- No background jobs → **14 Inngest functions** with complex orchestration
