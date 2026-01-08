# IdeasVault

IdeasVault is an AI-powered platform that helps founders validate their startup ideas instantly. It uses a multi-agent AI pipeline to conduct market research, analyze trends, assess execution risks, and provide a comprehensive validation report.

## Features

- **Instant Validation**: Submit an idea (text, voice, or image) and get a report in minutes.
- **AI Research Agents**:
  - **Interpreter**: Understands your idea from vague inputs.
  - **Market Research**: Analyzes TAM, competitors, and growth rates.
  - **Trend Analysis**: Checks "Why now?" and technology readiness.
  - **Execution Friction**: Identifies technical and operational risks.
  - **Synthesis**: Combines all data into a final score and verdict.
- **Billing & Entitlements**: Free and Pro plans managed via Polar.
- **PDF Export**: Download professional research reports.
- **Email Notifications**: Get notified when research is complete.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (with Prisma ORM)
- **Auth**: Better Auth (Google OAuth)
- **AI**: Google Gemini 2.0 Flash (via Vercel AI SDK)
- **Background Jobs**: Inngest
- **Styling**: Tailwind CSS + shadcn/ui
- **Storage**: DigitalOcean Spaces (S3 compatible)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Docker (for local database)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/ideasvault.git
    cd ideasvault
    ```

2.  **Install dependencies**:
    ```bash
    pnpm install
    ```

3.  **Set up environment variables**:
    Copy `.env.example` to `.env` and fill in the required values.
    ```bash
    cp .env.example .env
    ```

4.  **Start the database**:
    ```bash
    docker-compose up -d
    ```

5.  **Initialize the database**:
    ```bash
    pnpm prisma db push
    pnpm prisma db seed
    ```

6.  **Start the development server**:
    ```bash
    pnpm dev
    ```

7.  **Start Inngest dev server** (in a separate terminal):
    ```bash
    npx inngest-cli@latest dev
    ```

## Deployment

The project is designed to be deployed on Vercel.

1.  Push code to GitHub.
2.  Import project in Vercel.
3.  Configure environment variables in Vercel dashboard.
4.  Set up a managed PostgreSQL database (e.g., Neon, Supabase, or DigitalOcean).
5.  Deploy!

## License

MIT
