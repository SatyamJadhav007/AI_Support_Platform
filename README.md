## Project overview

This repository is a pnpm-powered monorepo for a B2B SaaS with two Next.js applications and shared packages. It uses Turborepo for task orchestration, a Convex backend for realtime data and serverless functions, shared UI built on shadcn/ui and Radix primitives, and modern auth and AI integrations.

### Monorepo layout

```
apps/
  web/       # Main dashboard app (Next.js)
  widget/    # Embeddable support widget (Next.js)
packages/
  backend/   # Convex backend (functions, schema, agents, RAG)
  ui/        # Shared UI components (shadcn/ui-based)
  math/      # Example shared util package
```

### Tech stack

- **Runtime/build**: pnpm workspaces, Turborepo, TypeScript
- **Apps**: Next.js 15, React 19, App Router
- **Styling/UI**: Tailwind CSS (via `packages/ui/styles/globals.css`), shadcn/ui components, Radix UI primitives, `lucide-react`
- **State**: Jotai in apps; local atoms per module
- **Backend**: Convex 1.x (functions, schema, realtime), `convex-helpers`
- **Auth**: Clerk (`@clerk/nextjs` in `web`, `@clerk/backend` in `backend`)
- **AI**: `@convex-dev/agent`, `@convex-dev/rag`, `ai`, `@ai-sdk/google`; VAPI Web SDK in `widget`
- **Forms/validation**: `react-hook-form`, `zod`, `@hookform/resolvers`
- **Tooling**: ESLint (shared config), Prettier, TypeScript project refs

### High-level architecture

- The **`web` app** is the authenticated dashboard. It integrates with Clerk for auth and consumes Convex functions from `packages/backend`. UI is composed from `packages/ui`.
- The **`widget` app** is an embeddable customer support widget. It integrates with Convex and VAPI for live AI-assisted chat and uses the same shared UI system.
- The **`backend` package** (Convex) defines schema, public/private functions, system workflows, and AI agents/RAG utilities. It is imported by both apps.
- Turborepo manages build, dev, and lint pipelines across the workspace. Shared code is versioned as workspace packages.

## Applications and features

### apps/web (Dashboard)

Implemented structure and capabilities (based on current modules and routes):

- **Authentication**
  - Clerk-based routes under `app/(auth)`: sign-in, sign-up, organization selection
  - Route guards/components in `modules/auth/ui`
- **Dashboard shell**
  - Layouts and navigation under `app/(dashboard)` and `modules/dashboard/ui`
  - Sidebar, conversations layout, panels, and status controls
- **Conversations**
  - Pages: list, detail (`/Conversations/[conversationId]`)
  - Components: conversation status button, panels, views for list/detail
- **Files**
  - Upload and delete dialogs; files list view
- **Integrations**
  - Placeholder page for external integrations management
- **Billing**
  - Placeholder page for plan/usage/billing settings
- **Customization**
  - Placeholder page for branding and UI customization
- **Plugins**
  - VAPI plugin page under `app/(dashboard)/plugins/vapi`

Dev server: `pnpm -C apps/web dev` (port 3000)

### apps/widget (Embeddable Widget)

Implemented structure and capabilities:

- **Widget UI**
  - Header, footer, and main view composition in `modules/widget/ui`
  - Screens: auth, selection, chat, inbox, loading, error
- **State and hooks**
  - Atoms for widget session/state
  - `use-vapi` hook for VAPI Web SDK integration
- **Backend integration**
  - Uses shared Convex backend client and types from `@workspace/backend`

Dev server: `pnpm -C apps/widget dev` (port 3001)

## Backend (packages/backend)

- **Convex schema**: `convex/schema.ts`
- **Auth config**: `convex/auth.config.ts`
- **Public functions**: `convex/public/*` (conversations, messages, organizations, contact sessions)
- **Private functions**: `convex/private/*` (conversations, files, messages)
- **System workflows**: `convex/system/*` (contact sessions, conversations)
- **AI**: `convex/system/ai/*` with agents, RAG utilities, and tools (search, resolve, escalate)

## Shared UI (packages/ui)

- Centralized shadcn/ui components and primitives used by both apps
- Global styles and Tailwind configuration exported for app consumption

## Development

- Install: `pnpm install`
- Run all dev servers: `pnpm dev` (via Turborepo) or per app using the scripts above
- Lint: `pnpm lint`; Type-check: `pnpm -C apps/web typecheck` / `pnpm -C apps/widget typecheck`

## Current status

- Core app scaffolding, navigation, and module structure are in place for both apps
- Authentication and organization flows implemented in `web`
- Conversations/files modules and placeholder settings pages present in `web`
- Widget screens and VAPI integration hooks exist in `widget`
- Convex backend contains schema, public/private functions, and AI agent/RAG utilities

This document reflects the current repository structure and implemented features discovered from the codebase.
