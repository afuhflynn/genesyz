# Unused Dependencies Analysis

This document lists dependencies where actual codebase usage is unconfirmed. Some may be false positives (used indirectly or at build time), while others are safe to remove.

## To Verify Before Removing

| Package | Reason for Caution |
|---------|-------------------|
| `@tailwindcss/postcss` | Listed as unused but IS used in `postcss.config.mjs` - false positive |
| `@types/nodemailer` | Listed as unused but `nodemailer` IS imported in `lib/email/client.ts` |
| `babel-plugin-react-compiler` | Listed as unused but IS required by `next.config.ts` `reactCompiler: true` |
| `sharp` | Listed as unused but is required by Next.js image optimization in production |
| `tw-animate-css` | Listed as unused but IS imported in `app/globals.css` |
| `@types/pdfkit` | May be needed for type-checking even if not directly imported |

## Likely Unused (Safe to Remove)

### Production Dependencies

| Package | Version | Notes |
|---------|---------|-------|
| `@ai-sdk/openai` | 3.0.7 | OpenAI accessed via provider string; direct import may not exist |
| `@ai-sdk/xai` | 3.0.10 | xAI provider - no usage found |
| `@ai-sdk/mistral` | 3.0.5 | Mistral accessed via `@ai-sdk/openai` with OpenRouter, not this SDK |
| `@openrouter/ai-sdk-provider` | 1.5.4 | OpenRouter SDK - no direct import found |
| `@pinecone-database/pinecone` | 6.1.3 | Vector search SDK - no usage found (platform not wired up) |
| `@react-pdf/renderer` | 4.3.2 | Dual PDF library; `pdfkit` is the active one |
| `ai-sdk-ollama` | 3.0.1 | Ollama provider - no usage found |
| `list` | 2.0.19 | Unknown utility - no import found |
| `mprocs` | 0.8.2 | Process manager - no import found (used via CLI only) |
| `streamdown` | 2.0.1 | Stream markdown utility - verify if used in ai-elements |
| `tokenlens` | 1.3.1 | Token cost calculator - verify if used in ai-elements/context.tsx |
| `vitest` | 4.0.16 | Test runner - listed in deps instead of devDeps; note tests exist |

### Dev Dependencies

| Package | Version | Notes |
|---------|---------|-------|
| `@types/bcryptjs` | 3.0.0 | **Not in actual package.json** - phantom entry |

## Verification Method

Analysis performed by searching import statements and usage patterns across `.ts`, `.tsx`, `.js`, `.mjs`, `.css` files. False positives are possible for:
- Packages used via CLI (not imported in code)
- Build-time only packages
- Packages required by Next.js at runtime indirectly
- CSS-only packages imported via `@import` or `@tailwind` directives (v4 handles this differently)

## Recommendations

1. **Safe to remove**: `@ai-sdk/xai`, `@ai-sdk/mistral`, `@openrouter/ai-sdk-provider`, `@pinecone-database/pinecone`, `@react-pdf/renderer`, `ai-sdk-ollama`, `list`, `mprocs`, `streamdown`
2. **Move to devDeps**: `vitest`, `mprocs`
3. **Needs manual check**: `tokenlens` (check context.tsx), `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@radix-ui/react-navigation-menu`, `country-state-city`
4. **Keep (false positives)**: `@tailwindcss/postcss`, `@types/nodemailer`, `babel-plugin-react-compiler`, `sharp`, `tw-animate-css`, `@types/pdfkit`
