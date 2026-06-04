# IdeasVault Rules

## 1. Project Overview

- **Stack**: Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, Prisma 7 + PostgreSQL
- **Package manager**: pnpm (enforced, no npm/yarn)
- **Linter/Formatter**: Biome 2.x with React & Next.js rules
- **Auth**: Better Auth 1.4.x (email/password, Google OAuth, magic link)
- **AI**: Multi-agent pipeline with triple-model fallback (GPT-4o → Mistral → Gemini)
- **Background jobs**: Inngest 3.x (event-driven + cron)
- **Billing**: Polar SDK via `@polar-sh/better-auth` plugin
- **Rate limiting**: Arcjet (beta 1.0.0-beta.16 — exact pin)
- **File uploads**: UploadThing 7.x (images, audio, PDF)
- **Email**: Nodemailer + SMTP (NOT Resend SDK)

---

## 2. Naming Conventions

### Files

| Context | Convention | Examples |
|---|---|---|
| React components | `PascalCase.tsx` | `AnalyticsCards.tsx`, `ConfirmDialog.tsx` |
| UI primitives | `kebab-case.tsx` | `button.tsx`, `dropdown-menu.tsx`, `input.tsx` |
| Pages | `page.tsx` (always) | `page.tsx` |
| Layouts | `layout.tsx` (always) | `layout.tsx` |
| API routes | `route.ts` (always) | `route.ts` |
| Hooks | `camelCase.ts` with `use` prefix | `useAnalytics.ts`, `useInfiniteIdeas.ts` |
| Lib/utility files | `kebab-case.ts` | `api-client.ts`, `auth-utils.ts` |
| Scripts | `kebab-case.ts` | `bootstrap-accelerator.ts` |
| Config files | `kebab-case` | `next.config.ts`, `postcss.config.mjs` |

### Code

- **Components**: PascalCase named after their Radix primitive or feature domain
- **Functions/variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE for exported constants
- **Environment variables**: UPPER_SNAKE_CASE, `NEXT_PUBLIC_` prefix for client-side
- **API route segments**: kebab-case, `[param]` for dynamic, `(group)` for route groups

### Database (Prisma)

- **Models**: PascalCase singular (e.g., `User`, `Idea`, `Startup`)
- **Table names**: `@@map("snake_case_plural")` (e.g., `"users"`, `"startup_members"`)
- **Fields**: camelCase (e.g., `emailVerified`, `accountStatus`)
- **Enums**: PascalCase (e.g., `UserRole`, `IdeaStatus`, `ResearchAgentType`)
- **Primary keys**: CUIDs via `@id @default(cuid())`
- **Timestamps**: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`

---

## 3. Architecture Rules

### Server-in-Client Barrier

Server-only code MUST NEVER be imported in client components (`"use client"`) or the `hooks/` directory.

**Server-only modules:**
- `@/lib/db` (Prisma client)
- `@/lib/auth` (Better Auth server instance)
- `@/lib/arcjet` (Arcjet rate limit instances)
- `@prisma/client` (never import types or runtime in client code)

**Allowed client-side auth import:** `@/lib/auth-client` only.

### `"use client"` Discipline

- Server components by default. Only add `"use client"` when the component uses:
  - React hooks (`useState`, `useEffect`, `useContext`, etc.)
  - Browser APIs (`window`, `document`, `localStorage`)
  - Event handlers (`onClick`, `onSubmit`, etc.)
  - React Query hooks or custom hooks from `hooks/index.ts`

### Data Fetching

- **Client components**: Use React Query hooks from `hooks/index.ts`. Never call `fetch()` or `axios` directly in components.
- **API routes**: The ONLY layer that calls Prisma for mutating operations. All business logic + DB access goes here.
- **Server components**: May use `db` directly for read-only data (server rendering), but prefer routing through API routes for consistency.

### API Route Structure

Every API route follows this pattern:

```
session check → Arcjet protect (if applicable) → validation → business logic → response
```

Auth check is the **first thing** after the function signature.

### Route Groups

Use Next.js route groups `(group)` for logical URL-free organization:

- `(auth)` — sign-in, sign-up, forgot-password, reset-password, verify-email, magic-link
- `(dashboard)` — dashboard, ideas, startups, settings, billing, onboarding, admin, chat, my-accelerators
- `(marketing)` — landing, about, faq, how-it-works, pricing
- `(public)` — public ideas listing
- `(startup)` — startup-specific routes

### Component Directory Structure

- `components/ui/` — shadcn/Radix primitive components only
- `components/<domain>/` — feature components grouped by domain
- `components/layout/` — Header, Sidebar, Footer, Navbar, UserNav

---

## 4. API Route Conventions

### Handler Signatures

```typescript
export async function GET(request: NextRequest) { ... }
export async function POST(request: NextRequest) { ... }
```

For dynamic routes:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) { ... }
```

### Response Format

- **Success**: `NextResponse.json(data, { status: 200 })` or `NextResponse.json(data, { status: 201 })`
- **Error**: `NextResponse.json({ error: "Human-readable message" }, { status: 4XX })`

### Auth Pattern (required in every protected route)

```typescript
const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Validation

Use Zod schemas from `lib/validators/` for form/input validation. Inline checks for simple cases.

---

## 5. Rate Limiting (Arcjet)

Arcjet is pinned to `1.0.0-beta.16` (exact). Do NOT upgrade without testing every AI endpoint.

### Arcjet Instances

| Instance | Rules | Used By |
|---|---|---|
| `aj` (proxy.ts) | Shield + bot detection | All non-static routes (middleware) |
| `ajRateLimit` | Token bucket: 10 req/60s, burst 100 | General purpose |
| `ajAuth` | Token bucket: 5 req/60s, burst 20 | Auth endpoints |
| `ajAI` | Token bucket: 2 req/60s, burst 10 | POST /api/ideas, research, export |

### Signup Protection (`protect()`)

Dynamic per-request rules:
- `/api/auth/custom/sign-up` with email: 5 req/2min + email validation (blocks disposable/invalid/no-MX) + bot detection
- `/api/auth/custom/sign-up` without email: 5 req/2min + bot detection
- Other auth routes: bot detection only

### Rate Limiting Gap

The following endpoints have NO rate limiting and are potential abuse vectors:
- `POST /api/auth/custom/verify-email`
- `POST /api/auth/custom/verify-email/token`
- `PUT /api/auth/custom/resend-verification-email`
- `POST /api/auth/custom/sign-up/social`

Add rate limiting before exposing these to production traffic at scale.

---

## 6. Webhooks

### Polar Billing Webhooks

Handled internally by `@polar-sh/better-auth` plugin in `lib/auth.ts`. No separate webhook endpoint.

**Events handled:**
- `onSubscriptionCreated` → `handleSubscriptionChange()` → upsert entitlement + audit log
- `onSubscriptionUpdated` → `handleSubscriptionChange()`
- `onSubscriptionActive` → `handleSubscriptionChange()`
- `onSubscriptionCanceled` → `handleSubscriptionCanceled()` (downgrade to FREE)
- `onSubscriptionRevoked` → `handleSubscriptionRevoked()` (downgrade to FREE + EXPIRED)

**Critical coupling:** Polar's `customerId` = the app's `userId`. If Polar's ID format changes, entitlement sync breaks.

**Known bug:** `onCustomerStateChanged` uses `forEach` + `await` (`lib/auth.ts:97`) — `forEach` does not respect `await`. Replace with `for...of`.

### Inngest Event Ingestion

Served at `POST /api/inngest`. Event naming: `dot.notation.camelCase` (e.g., `"idea.submitted"`, `"email.send.passwordReset"`).

---

## 7. AI Agent Pipeline

### Model Fallback Chain

```
Primary:   GPT-4o     (@ai-sdk/openai)
Secondary: Mistral    (@ai-sdk/mistral, model: "open-mixtral-8x7b")
Tertiary:  Gemini     (@ai-sdk/google, model: "gemini-2.5-flash")
```

**Known issue:** `"open-mixtral-8x7b"` is a legacy/deprecated Mistral model name. It should be updated to `"mistral-small-latest"` or `"mistral-medium-latest"` when Mistral sunsets the old naming.

### Fallback Mechanism (`lib/ai/fallback.ts`)

1. Try `generateObject()` with primary model
2. On schema complexity error ("too many states"), fall back to `generateText()` + JSON parsing (for all 3)
3. On other errors, try secondary, then tertiary
4. If all fail, throws `All AI generation strategies failed`

**Missing:** No retry-with-backoff in the fallback chain. If all 3 models rate-limit, the request fails immediately.

### Agent Pipeline

6 agents + 1 advisor run sequentially on `idea.submitted` event:

```
interpreter → market-research → trend-analysis → execution-friction → deep-research → synthesis
```

Then optionally: `strategic-advisory` for startup ideas.

---

## 8. Database (Prisma)

### Connection

- Single shared Prisma Client instance in `lib/db.ts`
- Uses `@prisma/adapter-pg` (adapter-based approach)
- **PgBouncer NOT configured** — if using PgBouncer in transaction mode, add `?pgbouncer=true` to `DATABASE_URL` or configure the adapter

### Schema Conventions

- All models use CUIDs (`@id @default(cuid())`)
- `@updatedAt` on all models with timestamps
- Cascade deletes (`onDelete: Cascade`) for owned-child relations
- `onDelete: SetNull` for optional relations (e.g., `AuditLog.user`)
- Indexes (`@@index`) on foreign keys and frequently-queried fields
- Many-to-many via explicit join models (e.g., `StartupMember`, `AcceleratorMember`)

### Query Patterns

- `findUnique` with `include` chaining for detail views
- `Promise.all` for parallel queries (e.g., `findMany` + `count`)
- Audit logging with `db.auditLog.create` after every mutating operation

---

## 9. Code Conventions

### JSDoc

Add JSDoc to ALL exported functions describing:
- What the function does
- Parameters (type and purpose)
- Return value
- Side effects (audit logs, events dispatched, etc.)

### Imports

Order: external packages → CSS → `@/` absolute imports. Use `import type` for type-only imports.

**Never** import `@prisma/client` types in client components — even with `import type`. If you need types, define them locally or in `lib/api-client.ts`.

### TypeScript

- `interface` for public API types, component props, and exported types
- `type` for unions, utility types, and `z.infer` results
- Prisma-generated types imported as `import type { Idea, User } from "@prisma/client"` (server-side only)
- Avoid `any` — use `unknown` + type guards

### Component Patterns

- **asChild prop** from Radix Slot pattern for polymorphic components
- **Skeleton** for loading states
- **Empty states** with descriptive messages and CTAs
- **cn()** utility (clsx + tailwind-merge) for conditional classes

---

## 10. Anti-Patterns to Fix

| Priority | Anti-pattern | Location | Fix |
|---|---|---|---|
| High | `provders/` typo directory | `components/provders/` | Rename to `components/providers/` |
| High | `Math.random()` not crypto-secure | `lib/auth-utils.ts` | Replace with `crypto.randomBytes()` or `crypto.randomUUID()` |
| Medium | Dual constants locations | `constants/` + `lib/constants/` | Unify in `constants/` |
| Medium | `lib/email/send.ts` is 1797 lines | `lib/email/send.ts` | Split into `emails/` directory with one file per template |
| Medium | Dual data access pattern | Server pages use `db` directly bypassing API routes | Consider service layer or consistent API route usage |
| Medium | `AssetTab.tsx` imports `@prisma/client` types | `components/ideas/AssetTab.tsx` | Define types locally instead |
| Medium | No centralized API auth middleware | All API routes repeat session check | Create auth wrapper/HOF |
| Low | Barrel files with no added value | `lib/location/index.ts`, `lib/scraping/index.ts` | Remove or use selective re-exports |
| Low | Root `types.d.ts` with single interface | `types.d.ts` | Move `IResearchProgress` inline |
| Low | Inconsistent pluralization | `components/ideas/` vs `components/idea/` | Standardize on plural for feature dirs |

---

## 11. Git & Deployment

### Git Conventions

- **Conventional commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`, `ci:`
- Keep commits focused on a single concern
- Do NOT commit secrets, API keys, or `.env` files — `.env*` in `.gitignore`

### Code Review

- Manual review required for all PRs
- CodeRabbit AI review as supplementary automated pass
- Check for: auth leaks, rate-limit gaps, Prisma query N+1, `"use client"` misuse, server-in-client imports

### Deployment

- **Platform**: Vercel
- **CI**: Vercel build hooks + GitHub Actions (configured)
- Environment variables managed via Vercel dashboard (not committed)
- Prisma migrations: run via `prisma migrate deploy` during build

---

## 12. Documentation

- **README.md** must stay in sync with API changes, new features, and dependency updates
- **RULES.md** (this file) updated when new conventions or anti-patterns are identified
- **TODO.md** tracks pending work — update as items are completed or discovered
- Keep `docs/` directory up to date with domain docs and architecture reference
- When renaming/restructuring directories, update all imports and document the change

---

## 13. Dependency Constraints

| Package | Version | Notes |
|---|---|---|
| `next` | `16.1.1` (exact) | Very new — verify plugin compatibility |
| `react`/`react-dom` | `19.2.3` (exact) | Latest stable |
| `@arcjet/next` | `1.0.0-beta.16` (exact) | Beta — do not upgrade without full testing |
| `@arcjet/ip` | `1.0.0-beta.16` (exact) | Beta — do not upgrade without full testing |
| `@polar-sh/sdk` | `^0.42.1` | Watch for breaking minor versions |
| `@polar-sh/better-auth` | `^1.6.3` | Check compatibility with `better-auth` upgrades |
| `@ai-sdk/openai` | `^3.0.7` | Model `"gpt-4o"` — monitor for deprecation |
| `@ai-sdk/mistral` | `^3.0.5` | Model `"open-mixtral-8x7b"` is legacy — plan migration |
| `@ai-sdk/google` | `^3.0.6` | Model `"gemini-2.5-flash"` |
| `zod` | `^4.3.5` | **Zod v4** — breaking changes from v3, verify community libs |
| `@prisma/client` | `^7.3.0` | Adapter-based — PgBouncer not configured |

| `recharts` | `2.15.4` (exact) | Exact pin |
| `framer-motion` | `^12.24.10` | Compatible with React 19 |
| `tailwindcss` | `^4` | v4 — CSS-first config, no JS config file |
