## Project overview

This repository is a pnpm-powered monorepo for **Echo**, a comprehensive B2B SaaS customer support platform with three applications and shared packages. It uses Turborepo for task orchestration, a Convex backend for realtime data and serverless functions, shared UI built on shadcn/ui and Radix primitives, and modern auth and AI integrations.

### Monorepo layout

```
apps/
  web/       # Main dashboard app (Next.js 15) - Admin interface
  widget/    # Embeddable support widget (Next.js 15) - Customer-facing widget
  embed/     # Embeddable script (Vite) - JavaScript widget for external sites
packages/
  backend/   # Convex backend (functions, schema, AI agents, RAG)
  ui/        # Shared UI components (shadcn/ui-based)
  eslint-config/ # Shared ESLint configurations
  typescript-config/ # Shared TypeScript configurations
  math/      # Example shared utility package
```

### Tech stack

- **Runtime/build**: pnpm workspaces, Turborepo, TypeScript 5.x
- **Apps**: Next.js 15, React 19, App Router, Vite (for embed)
- **Styling/UI**: Tailwind CSS 4.x, shadcn/ui components, Radix UI primitives, `lucide-react`
- **State**: Jotai in apps; local atoms per module
- **Backend**: Convex 1.25.4 (functions, schema, realtime), `convex-helpers`
- **Auth**: Clerk (`@clerk/nextjs` in `web`, `@clerk/backend` in `backend`)
- **AI**: `@convex-dev/agent`, `@convex-dev/rag`, `ai`, `@ai-sdk/google` (Gemini 2.5 Flash/Pro)
- **Voice**: VAPI Web SDK (`@vapi-ai/web`, `@vapi-ai/server-sdk`)
- **Forms/validation**: `react-hook-form`, `zod`, `@hookform/resolvers`
- **Tooling**: ESLint (shared config), Prettier, TypeScript project refs

### High-level architecture

- The **`web` app** is the authenticated admin dashboard. It integrates with Clerk for auth and consumes Convex functions from `packages/backend`. UI is composed from `packages/ui`.
- The **`widget` app** is an embeddable customer support widget that provides chat, voice, and contact functionality. It integrates with Convex and VAPI for live AI-assisted conversations.
- The **`embed` app** is a lightweight JavaScript widget that can be embedded on external websites. It creates an iframe to the widget app and handles positioning and messaging.
- The **`backend` package** (Convex) defines schema, public/private functions, system workflows, and AI agents/RAG utilities. It powers all three applications.
- Turborepo manages build, dev, and lint pipelines across the workspace. Shared code is versioned as workspace packages.

## Applications and features

### apps/web (Admin Dashboard)

The main admin interface for managing customer support operations:

- **Authentication & Organization Management**
  - Clerk-based authentication with organization switching
  - Route guards and organization-based access control
  - Multi-tenant architecture with organization isolation

- **Dashboard Features**
  - **Conversations Management**: View, manage, and respond to customer conversations
  - **Knowledge Base**: Upload and manage support documents (PDF, images, HTML)
  - **Widget Customization**: Configure widget appearance, greetings, and suggestions
  - **Integrations**: Manage external service integrations
  - **Voice Assistant**: Configure VAPI settings for voice support
  - **Billing & Plans**: Manage subscriptions and usage (Pro plan features)

- **AI-Powered Support**
  - RAG-based knowledge search using uploaded documents
  - AI message enhancement for operator responses
  - Conversation escalation and resolution workflows

- **Premium Features**
  - Pro plan required for knowledge base management
  - Advanced customization options

Dev server: `pnpm -C apps/web dev` (port 3000)

### apps/widget (Customer Support Widget)

The embeddable customer-facing support widget:

- **Multi-Modal Support**
  - **Text Chat**: AI-powered chat with knowledge base search
  - **Voice Calls**: Web-based voice conversations via VAPI
  - **Phone Calls**: Direct calling to business phone numbers

- **Widget Screens**
  - **Selection**: Choose between chat, voice, or phone support
  - **Auth**: Contact information collection and session management
  - **Chat**: Real-time messaging with AI assistant
  - **Voice**: Voice conversation interface
  - **Contact**: Phone call initiation
  - **Inbox**: Conversation history and management

- **AI Integration**
  - Intelligent conversation routing
  - Knowledge base search for instant answers
  - Automatic escalation to human agents when needed
  - Conversation resolution tracking

- **State Management**
  - Jotai-based state management with persistent sessions
  - Contact session tracking with metadata collection
  - Real-time conversation updates

Dev server: `pnpm -C apps/widget dev` (port 3001)

### apps/embed (Embeddable Script)

A lightweight JavaScript widget for embedding on external websites:

- **Embeddable Widget**
  - IIFE (Immediately Invoked Function Expression) for easy integration
  - Configurable positioning (bottom-right, bottom-left)
  - Responsive iframe integration with the widget app

- **Features**
  - Floating action button with smooth animations
  - Cross-origin messaging for widget communication
  - Automatic resizing based on widget content
  - Organization-specific configuration via data attributes

- **Integration**
  - Simple script tag integration: `<script src="embed.js" data-organization-id="org_xxx"></script>`
  - Configurable positioning and organization targeting
  - Built with Vite for optimized bundle size

Dev server: `pnpm -C apps/embed dev` (port 3002)

## Backend (packages/backend)

A comprehensive Convex backend powering the entire Echo platform:

### Core Schema & Data Models
- **Organizations**: Multi-tenant organization management
- **Users**: User management with Clerk integration
- **Subscriptions**: Billing and plan management
- **Conversations**: Customer support conversation tracking
- **Contact Sessions**: Customer session management with metadata
- **Messages**: Real-time messaging system
- **Files**: Knowledge base document storage and processing
- **Widget Settings**: Organization-specific widget configuration
- **Plugins**: External service integrations (VAPI, etc.)

### AI & RAG System
- **Support Agent**: AI-powered customer support with Gemini 2.5 Flash
- **RAG Implementation**: Knowledge base search using `@convex-dev/rag`
- **Document Processing**: PDF, image, and HTML text extraction
- **Search Tools**: Intelligent knowledge base search with context interpretation
- **Conversation Tools**: Escalation and resolution workflow management

### Key Features
- **Real-time Updates**: Live conversation and message synchronization
- **File Processing**: AI-powered text extraction from various document types
- **Voice Integration**: VAPI server SDK integration for voice support
- **Message Enhancement**: AI-powered response enhancement for operators
- **Subscription Management**: Plan-based feature access control

### API Structure
- **Public Functions**: Customer-facing APIs (conversations, messages, contact sessions)
- **Private Functions**: Admin-only operations (file management, message enhancement)
- **System Functions**: Internal workflows and AI agent operations

## Shared Packages

### packages/ui
- **Component Library**: Comprehensive shadcn/ui-based component system
- **Design System**: Consistent styling with Tailwind CSS 4.x
- **Radix Primitives**: Accessible UI components
- **Custom Components**: Specialized components for the Echo platform
- **Global Styles**: Shared CSS and theme configuration

### packages/eslint-config
- **Base Configuration**: Core ESLint rules for TypeScript projects
- **Next.js Configuration**: Optimized rules for Next.js applications
- **React Configuration**: React-specific linting rules
- **Workspace Integration**: Shared configurations across all apps

### packages/typescript-config
- **Base Configuration**: Core TypeScript settings
- **Next.js Configuration**: Next.js-specific TypeScript settings
- **React Library Configuration**: Settings for React component libraries

### packages/math
- **Utility Package**: Example shared utility functions
- **TypeScript Exports**: Proper type definitions and exports
- **Build System**: TypeScript compilation with proper module exports

## Development

### Prerequisites
- **Node.js**: >= 20 (specified in package.json engines)
- **pnpm**: 10.4.1 (specified in packageManager)
- **Convex Account**: For backend functionality
- **Clerk Account**: For authentication
- **VAPI Account**: For voice features (optional)

### Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   - Configure Convex, Clerk, and VAPI credentials

3. **Start development servers**:
   ```bash
   # Start all apps (recommended)
   pnpm dev
   
   # Or start individual apps
   pnpm -C apps/web dev      # Admin dashboard (port 3000)
   pnpm -C apps/widget dev   # Support widget (port 3001)
   pnpm -C apps/embed dev    # Embed script (port 3002)
   pnpm -C packages/backend dev  # Convex backend
   ```

### Available Scripts

- **Build**: `pnpm build` - Build all applications
- **Lint**: `pnpm lint` - Lint all packages
- **Format**: `pnpm format` - Format code with Prettier
- **Type Check**: `pnpm -C <app> typecheck` - Type check specific app

### Workspace Structure

The monorepo uses:
- **pnpm workspaces** for dependency management
- **Turborepo** for build orchestration and caching
- **TypeScript project references** for type checking
- **Shared ESLint/TypeScript configs** for consistency

## Current Status

### ✅ Implemented Features

**Admin Dashboard (web)**
- Complete authentication system with Clerk
- Organization-based multi-tenancy
- Conversation management interface
- Knowledge base file upload and management
- Widget customization settings
- VAPI voice assistant configuration
- Billing and subscription management
- Premium feature access control

**Support Widget (widget)**
- Multi-modal support (chat, voice, phone)
- AI-powered conversation handling
- Real-time messaging with Convex
- Contact session management
- VAPI voice integration
- Conversation history and inbox
- Responsive design for embedding

**Embed Script (embed)**
- Lightweight JavaScript widget
- Configurable positioning and styling
- Cross-origin messaging
- Organization-specific targeting
- Optimized bundle size with Vite

**Backend (Convex)**
- Complete data schema with all entities
- AI-powered support agent with Gemini
- RAG-based knowledge search
- Document processing (PDF, images, HTML)
- Real-time messaging system
- Voice integration with VAPI
- Subscription and billing management

**Shared Infrastructure**
- Comprehensive UI component library
- Shared ESLint and TypeScript configs
- Workspace package management
- Build and development tooling

### 🚀 Key Capabilities

- **AI-Powered Support**: Intelligent responses using knowledge base
- **Multi-Modal Communication**: Text, voice, and phone support
- **Real-Time Updates**: Live conversation synchronization
- **Document Processing**: AI extraction from various file types
- **Multi-Tenant Architecture**: Organization-based isolation
- **Embeddable Widget**: Easy integration on external websites
- **Voice Integration**: Web and phone-based voice support
- **Subscription Management**: Plan-based feature access

### 📋 Architecture Highlights

- **Modern Tech Stack**: Next.js 15, React 19, TypeScript 5.x
- **Real-Time Backend**: Convex with live data synchronization
- **AI Integration**: Gemini 2.5 Flash/Pro for intelligent responses
- **Voice Technology**: VAPI for web and phone voice support
- **Design System**: shadcn/ui with Tailwind CSS 4.x
- **State Management**: Jotai for client-side state
- **Monorepo**: Turborepo with pnpm workspaces

This document reflects the current repository structure and implemented features as of the latest analysis.
