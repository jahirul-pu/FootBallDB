# FootballDB Frontend

This is the frontend application for FootballDB, built with Next.js 15 (App Router), React, TypeScript, Tailwind CSS v4, and shadcn/ui.

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- npm 10+
- The FootballDB Backend running locally (or available remotely).

### Installation

```bash
# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env.local

# Start the development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result. (The dev server defaults to port 3001 if using the docker setup or if configured in package.json, otherwise 3000).

## 🏗️ Architecture

The frontend follows a strict feature-first architecture, detailed in the `13-frontend-architecture.md` document at the project root.

### Directory Structure

- `app/` - Next.js App Router root (layouts, pages).
- `components/` - Domain-agnostic UI components (shadcn/ui, base components).
- `features/` - Domain-specific feature modules (e.g., persons, teams).
- `hooks/` - Global, domain-agnostic custom hooks.
- `lib/` - Third-party library configuration and wrappers (Axios, Motion).
- `providers/` - React context providers.
- `services/` - Typed Axios service functions.
- `stores/` - Zustand stores for client-only UI state.
- `styles/` - Global CSS and Tailwind variables.
- `types/` - Global TypeScript types.
- `utils/` - Pure utility functions.
- `config/` - Static configuration constants.

## 🛠️ Scripts

- `npm run dev` - Start development server.
- `npm run build` - Build for production.
- `npm run start` - Start production server.
- `npm run lint` - Run ESLint.
- `npm run format` - Format code with Prettier.
- `npm run typecheck` - Run TypeScript compiler check.

## 🎨 Design System

This project uses Tailwind CSS v4 with custom CSS variables for theming, enabling instant light/dark mode switching and white-labeling. Ensure all UI components follow the design system specifications defined in the architecture guide.

## 🌐 API Integration

API calls are handled via a configured Axios instance in `lib/axios.ts` which manages:

- Automatic token refresh (Silent refresh).
- Standardized error handling and toasts.
- Correlation IDs for tracing.

State management for server data uses TanStack Query v5. Do not store server data in Zustand.
