# FootballDB — Frontend Architecture Guide
**Version:** 1.0 | **Status:** Official | **Date:** 2026-07-20
**Role:** Principal Frontend Architect & Lead UI/UX Engineer

---

## Table of Contents

1. [Vision & Design Philosophy](#1-vision--design-philosophy)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Application Architecture](#4-application-architecture)
5. [Design System](#5-design-system)
6. [Animation System](#6-animation-system)
7. [Responsive Design Strategy](#7-responsive-design-strategy)
8. [Authentication UX](#8-authentication-ux)
9. [Dashboard Layout](#9-dashboard-layout)
10. [Reusable Component Library](#10-reusable-component-library)
11. [Entity Page Standards](#11-entity-page-standards)
12. [API Integration Layer](#12-api-integration-layer)
13. [Performance Strategy](#13-performance-strategy)
14. [Accessibility Standards](#14-accessibility-standards)
15. [SEO Strategy](#15-seo-strategy)
16. [Coding Standards](#16-coding-standards)
17. [Future Scalability](#17-future-scalability)

---

## 1. Vision & Design Philosophy

### The Goal

FootballDB must feel like a **premium data tool built for experts**, not a generic admin CRUD panel. The benchmark products — Linear, Vercel Dashboard, Stripe, Arc Browser — succeed because they treat UX as a first-class engineering concern. Every pixel, every transition, and every interaction carries intentional weight.

### Core Principles

| Principle | Description |
|---|---|
| **Speed as a feature** | Instant response to every interaction. Perceived performance matters as much as actual performance. |
| **Clarity over decoration** | No gratuitous animations or effects. Every visual element carries information or improves navigability. |
| **Data-first** | Dense, information-rich layouts. No wasted whitespace. Tables are the primary UI primitive. |
| **Consistency** | Every entity page follows the same mental model. Users learn the system once and apply it everywhere. |
| **Craftsmanship** | Micro-interactions, keyboard shortcuts, and subtle animations are not optional — they define the experience. |

### The User Persona

The primary user is a **football data analyst or data curator**. They are power users who:
- Spend 6–8 hours per day inside the tool.
- Navigate primarily via keyboard.
- Need to cross-reference entities rapidly.
- Value data density over aesthetic minimalism.

---

## 2. Technology Stack

### Core Framework

**Next.js 15 (App Router)**
*Why:* The App Router unlocks React Server Components (RSC), which radically changes the performance profile of a data-heavy app. Server Components eliminate the need to ship JavaScript for static/read-heavy UI. Streaming allows progressive hydration. Layouts are persistent — the sidebar never re-renders on navigation.

### Full Stack Decisions

| Technology | Version | Role | Rationale |
|---|---|---|---|
| **Next.js** | 15 | Framework | App Router, RSC, streaming, image optimization, built-in API routes |
| **React** | 19 | UI library | Concurrent features, Suspense, use() hook |
| **TypeScript** | 5.x | Language | Strict typing end-to-end; shared types with backend DTOs |
| **Tailwind CSS** | v4 | Styling | Zero-runtime CSS, excellent dark mode, v4's Lightning CSS engine is faster |
| **shadcn/ui** | latest | Component primitives | Unstyled, copy-pasted components that you own; not a black-box dependency |
| **Motion for React** | 12.x | Animations | Replaces Framer Motion; first-class RSC support; layout animations, gestures |
| **TanStack Query** | v5 | Server state | Declarative caching, background refetching, optimistic updates, stale-while-revalidate |
| **TanStack Table** | v8 | Data tables | Headless, composable, handles 100k rows with virtualization |
| **React Hook Form** | v7 | Forms | Uncontrolled inputs for performance; first-class Zod integration |
| **Zod** | v3 | Validation | Runtime schema validation; share schemas between form and API layer |
| **Axios** | v1 | HTTP client | Interceptors, request cancellation, typed responses; superior to fetch for a complex API layer |
| **Zustand** | v5 | Client state | Minimal footprint; replaces Redux for ephemeral UI state (sidebar, modals, filters) |
| **next-themes** | latest | Theme management | SSR-safe dark mode without flash |
| **Sonner** | latest | Toast notifications | Beautiful, accessible toasts; pairs naturally with Motion |
| **Lucide Icons** | latest | Iconography | Consistent, tree-shakeable, Tailwind-friendly |
| **Recharts** | v2 | Data visualization | Composable chart primitives; integrates naturally with React |

### Additional Recommended Libraries

| Library | Justification |
|---|---|
| **@tanstack/virtual** | Virtual scrolling for tables with 10k+ rows without pagination |
| **nuqs** | URL-based search params state management — critical for shareable filtered views |
| **cmdk** | Command palette (Cmd+K) — a must for a power-user tool |
| **@radix-ui/react-*** | Low-level primitives already bundled via shadcn/ui |
| **date-fns** | Lightweight date utilities; aligned with the backend's date component model |
| **react-intersection-observer** | Efficient scroll-triggered animations and lazy loading |

---

## 3. Project Structure

```
footballdb-frontend/
├── app/                          # Next.js App Router root
│   ├── (auth)/                   # Route group: unauthenticated layouts
│   │   ├── login/
│   │   └── unauthorized/
│   ├── (dashboard)/              # Route group: authenticated, sidebar layout
│   │   ├── layout.tsx            # Persistent sidebar + header shell
│   │   ├── page.tsx              # Dashboard home
│   │   ├── persons/
│   │   │   ├── page.tsx          # Persons list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Person detail
│   │   │   └── new/
│   │   │       └── page.tsx      # Create person form
│   │   ├── teams/
│   │   ├── organizations/
│   │   ├── venues/
│   │   ├── competitions/
│   │   ├── matches/
│   │   ├── careers/
│   │   ├── media/
│   │   ├── awards/
│   │   ├── import/
│   │   ├── search/
│   │   └── settings/
│   ├── api/                      # Next.js API routes (BFF layer if needed)
│   └── layout.tsx                # Root layout: providers, fonts, metadata
│
├── components/                   # Pure, domain-agnostic UI primitives
│   ├── ui/                       # shadcn/ui base components
│   ├── data-display/             # Table, DataGrid, StatCard, MetricCard, Timeline
│   ├── feedback/                 # Toast, Alert, EmptyState, ErrorBoundary, Skeleton
│   ├── forms/                    # FormField, FormSection, UploadZone, EntitySelector
│   ├── layout/                   # Sidebar, Header, Breadcrumbs, PageHeader
│   ├── navigation/               # NavItem, NavGroup, CommandPalette, GlobalSearch
│   └── charts/                   # ChartWrapper, BarChartCard, LineChartCard
│
├── features/                     # Domain-specific feature modules (bounded contexts)
│   ├── persons/
│   │   ├── components/           # PersonCard, PersonAvatar, PersonBadge
│   │   ├── hooks/                # usePersons, usePerson, useCreatePerson
│   │   ├── schemas/              # Zod schemas mirroring backend DTOs
│   │   ├── types/                # PersonResponseDto, CreatePersonDto
│   │   └── utils/                # formatPersonAge, formatBirthDate
│   ├── teams/
│   ├── organizations/
│   ├── venues/
│   ├── competitions/
│   ├── matches/
│   ├── careers/
│   ├── import/
│   └── search/
│
├── hooks/                        # Global, domain-agnostic custom hooks
│   ├── use-auth.ts
│   ├── use-command-palette.ts
│   ├── use-debounce.ts
│   ├── use-pagination.ts
│   ├── use-filters.ts
│   ├── use-sort.ts
│   ├── use-keyboard-shortcut.ts
│   ├── use-media-query.ts
│   └── use-optimistic-update.ts
│
├── lib/                          # Third-party library configuration and wrappers
│   ├── axios.ts                  # Configured Axios instance with interceptors
│   ├── query-client.ts           # TanStack Query client configuration
│   ├── motion.ts                 # Shared Motion variants and springs
│   └── zod-schemas.ts            # Shared Zod utilities
│
├── providers/                    # React context providers
│   ├── auth-provider.tsx
│   ├── query-provider.tsx
│   ├── theme-provider.tsx
│   ├── toaster-provider.tsx
│   └── root-provider.tsx
│
├── services/                     # Typed Axios service functions per entity
│   ├── persons.service.ts
│   ├── teams.service.ts
│   ├── organizations.service.ts
│   ├── auth.service.ts
│   └── index.ts
│
├── stores/                       # Zustand stores for client-only UI state
│   ├── sidebar.store.ts
│   ├── command-palette.store.ts
│   ├── filter.store.ts
│   └── notification.store.ts
│
├── styles/
│   ├── globals.css               # @import tailwindcss, CSS custom properties
│   ├── typography.css
│   └── animations.css
│
├── types/
│   ├── api.types.ts              # ApiResponse<T>, PaginatedResult<T>, ApiError
│   ├── auth.types.ts             # User, Session, Role, Permission
│   ├── navigation.types.ts
│   └── index.ts
│
├── utils/
│   ├── format.ts
│   ├── cn.ts                     # clsx + twMerge
│   ├── error.ts
│   └── url.ts
│
├── config/
│   ├── navigation.config.ts      # Sidebar nav items, icons, roles
│   ├── routes.config.ts
│   ├── api.config.ts
│   └── query-keys.ts             # Centralized TanStack Query key factory
│
└── assets/
    ├── fonts/
    ├── icons/
    └── images/
```

### Folder Responsibility Summary

| Folder | Responsibility |
|---|---|
| `app/` | Next.js pages, layouts, loading/error boundaries. No business logic. |
| `components/` | Fully reusable, domain-agnostic UI atoms and organisms. |
| `features/` | Everything specific to a football entity: components, hooks, types, schemas. |
| `hooks/` | Cross-cutting concerns: auth state, pagination state, keyboard shortcuts. |
| `lib/` | Library initialization only. Never import business logic here. |
| `providers/` | React context tree. Composed once in root layout. |
| `services/` | Typed functions that call the backend. Never used directly by components. |
| `stores/` | Ephemeral UI state that doesn't belong in server state. |
| `types/` | Global TypeScript interfaces. Never mixed with implementation. |
| `config/` | Static, environment-independent configuration values. |

---

## 4. Application Architecture

### 4.1 Feature-Based Architecture

Each domain entity lives in `features/{entity}/` and contains everything it needs to function. This creates a **bounded context** per entity. Refactoring or adding a new domain module requires touching only its feature folder.

### 4.2 Component Architecture

Components follow a strict three-tier hierarchy:

```
ui/          <- Primitive atoms: Button, Input, Badge (shadcn/ui base)
     |
components/  <- Composed organisms: DataTable, StatsCard, EntitySelector
     |
features/    <- Domain organisms: PersonCard, MatchTimeline, TeamRoster
```

Rules:
- `ui/` components have **zero domain knowledge**.
- `components/` may import `ui/` but never `features/`.
- `features/` may import both `ui/` and `components/`.
- No component imports from `services/` directly — only hooks do.

### 4.3 API Layer Flow

```
Page/Feature Component
      |
Feature Hook (usePersons, useCreatePerson)
      |
TanStack Query (useQuery, useMutation)
      |
Service Function (persons.service.ts)
      |
Axios Instance (lib/axios.ts)
      |
Backend REST API
```

### 4.4 Authentication Flow

```
App Load
  -> AuthProvider checks session cookie
  -> If valid: render authenticated layout
  -> If expired: silent token refresh via refresh interceptor
      -> If refresh fails: redirect to /login?returnUrl=...
  -> If no session: redirect to /login

Route Protection:
  -> Middleware checks session on every request (edge runtime)
  -> Role checks in UI via useAuth().hasRole('Administrator')
  -> 403 from API triggers PermissionDeniedBoundary
```

Session tokens are stored in **HttpOnly cookies** (managed by the backend). The frontend never stores JWTs in localStorage.

### 4.5 State Management Strategy

| State Type | Location | Tool |
|---|---|---|
| Server data (persons list, team detail) | TanStack Query cache | `useQuery` / `useMutation` |
| URL state (filters, sort, pagination) | URL search params | `nuqs` |
| Global UI state (sidebar open, theme) | Zustand | `sidebar.store.ts` |
| Form state | React Hook Form | `useForm` |
| Local component state | React state | `useState` / `useReducer` |

> [!IMPORTANT]
> **Never put server data in Zustand.** TanStack Query is the single source of truth for all backend data.

### 4.6 Error Handling — Three Layers

1. **Route-level**: `error.tsx` files in App Router catch unhandled errors per segment.
2. **Component-level**: `<ErrorBoundary>` wrapping individual widgets.
3. **API-level**: Axios response interceptor catches all 4xx/5xx and converts them to typed `ApiError` objects, triggering Sonner toasts for user-visible errors.

### 4.7 Loading Strategy

- **Server Components** stream immediately — no loading state needed for initial data.
- **Client Components** use TanStack Query's `isLoading` / `isFetching` flags.
- **Skeletons** are rendered for every entity list and detail page via `loading.tsx`.
- **Optimistic updates** are used for mutations that affect list UI.

### 4.8 Caching Strategy

| Data Type | Cache Location | TTL | Invalidation |
|---|---|---|---|
| Entity lists | TanStack Query | 5 minutes | On successful mutation |
| Entity detail | TanStack Query | 10 minutes | On successful update/delete |
| User session | Cookie (HttpOnly) | Backend-controlled | On logout / token expiry |
| Autocomplete results | TanStack Query | 30 seconds | N/A |

### 4.9 Routing Strategy

The `(dashboard)` route group uses a **persistent layout**: the sidebar and header never unmount during navigation. This means no sidebar re-render flash on page change, and sidebar scroll position is preserved.

**Route naming convention:** `/entities/[id]/section`

- `/persons` — List
- `/persons/new` — Create form
- `/persons/[id]` — Detail (defaults to Overview tab)
- `/persons/[id]/edit` — Edit form
- `/persons/[id]/appearances` — Sub-resource tab

### 4.10 Form Architecture

1. **Zod schema** defines validation (mirroring the backend DTO).
2. **React Hook Form** manages state with `zodResolver`.
3. **Feature-specific form components** receive `control` from the parent form.
4. Submission calls the feature's **mutation hook**.
5. On success: navigate, invalidate query cache, show toast.
6. On error: display field-level errors from the API response.

---

## 5. Design System

### 5.1 Color Palette

Defined entirely in CSS custom properties for instant theme switching and white-label support.

```css
/* Neutral scale */
--color-neutral-50 through --color-neutral-950

/* Primary — electric indigo (inspired by Linear) */
--color-primary-500: #6366f1;
--color-primary-600: #4f46e5;

/* Accent — emerald (success, positive states) */
--color-accent-500: #10b981;

/* Danger — rose */
--color-danger-500: #f43f5e;

/* Warning — amber */
--color-warning-500: #f59e0b;

/* Semantic tokens (light mode) */
--bg-base:        var(--color-neutral-50);
--bg-surface:     #ffffff;
--border-default: var(--color-neutral-200);
--text-primary:   var(--color-neutral-900);
--text-secondary: var(--color-neutral-600);
--text-muted:     var(--color-neutral-400);

/* Semantic tokens (dark mode override) */
[data-theme="dark"] {
  --bg-base:        var(--color-neutral-950);
  --bg-surface:     var(--color-neutral-900);
  --border-default: var(--color-neutral-800);
  --text-primary:   var(--color-neutral-50);
  --text-secondary: var(--color-neutral-400);
}
```

### 5.2 Typography

```
Font Family:  "Geist" (primary UI)
              "Geist Mono" (IDs, stats, code)
              Fallback: system-ui, -apple-system

Scale:
  text-xs:    12px — captions, timestamps
  text-sm:    14px — default body, table cells
  text-base:  16px — content body
  text-2xl:   24px — section headings
  text-3xl:   30px — page headings
  text-4xl:   36px — hero numbers, metric values

Weights:  400 (body), 500 (labels), 600 (headings), 700 (hero numbers)
```

### 5.3 Spacing & Layout

```
Base unit: 4px (0.25rem)

Content width constraints:
  Sidebar:            240px (collapsed: 56px)
  Content max-width:  1200px
  Form max-width:     720px
  Dialog max-width:   560px
```

### 5.4 Border Radius

```
rounded-sm:   2px  — badges, tags
rounded:      4px  — inputs, buttons
rounded-md:   6px  — cards, dropdowns
rounded-lg:   8px  — modals, sheets
rounded-xl:   12px — large cards
rounded-full: 9999px — avatars, pills
```

### 5.5 Status Color System

| Status | Meaning | Background | Border |
|---|---|---|---|
| Active / Success | emerald-500 | emerald-500/10 | emerald-500/30 |
| Warning / Pending | amber-500 | amber-500/10 | amber-500/30 |
| Error / Danger | rose-500 | rose-500/10 | rose-500/30 |
| Info / Processing | indigo-500 | indigo-500/10 | indigo-500/30 |
| Deleted | neutral-400 | neutral-500/10 | dashed neutral-500/30 |

### 5.6 Data Visualization

All charts use Recharts wrapped in a `<ChartWrapper>` that applies the design system palette, handles dark/light mode, provides skeleton loading, and enforces consistent typography and tooltip styling.

**Chart color sequence (multi-series):**
`#6366f1` → `#10b981` → `#f59e0b` → `#f43f5e` → `#8b5cf6` → `#06b6d4`

### 5.7 Core Component Specifications

**Button:** `default | secondary | outline | ghost | danger | link` variants. Sizes: `sm | md | lg | icon`. Loading state replaces icon with a spinner.

**DataTable (TanStack Table v8):** Column pinning, multi-sort (shift+click), column visibility toggle, row selection, pagination footer, density toggle (compact / comfortable / spacious).

**Empty State:** Illustration + Heading + Subtext + optional CTA. Never show a blank page.

**Skeleton:** CSS shimmer animation matching the exact shape of replaced content.

---

## 6. Animation System

### 6.1 Philosophy

Animations serve **functional purposes only** — they signal state changes, provide spatial context, and make the interface feel alive. They never delay access to content.

### 6.2 Strictly Forbidden Animations

> [!CAUTION]
> The following animations are **banned** in FootballDB:
> - Bounce easing on any functional element
> - Full-page fade transitions (makes navigation feel slow)
> - Parallax scrolling on authenticated pages
> - Rotating loading spinners on inline actions (use skeleton instead)
> - Any animation that delays content access by more than 150ms
> - Continuous looping animations in the content area

### 6.3 Motion Configuration (lib/motion.ts)

```typescript
// Spring presets
export const spring = {
  snappy:  { type: 'spring', stiffness: 400, damping: 30 },
  smooth:  { type: 'spring', stiffness: 260, damping: 26 },
  gentle:  { type: 'spring', stiffness: 150, damping: 20 },
  bouncy:  { type: 'spring', stiffness: 300, damping: 15 }, // Celebrations only
};

// Duration presets
export const duration = {
  instant:  0.05,  // Hover state changes
  fast:     0.15,  // Dropdown, tooltip
  normal:   0.20,  // Modal, sidebar, cards
  slow:     0.30,  // Page transitions
  verySlow: 0.50,  // Hero animations
};

// Shared variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
};

export const slideUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: 8 },
};
```

### 6.4 Animation Specifications

| Component | Animation | Duration |
|---|---|---|
| Page transition | Fade + slide up 8px | 200ms ease-out |
| Sidebar expand/collapse | Width spring + content fade | `spring.snappy` |
| Modal open | Scale 0.96→1 + fade | `spring.smooth` |
| Modal close | Scale 1→0.96 + fade | 150ms ease-in |
| Drawer/Sheet | Slide from edge | `spring.snappy` |
| Dropdown menu | Slide down 4px + fade | 150ms ease-out |
| Tooltip | Fade + shift 4px | 100ms ease-out |
| Table row mount | Stagger fade-in (15ms delay/row) | 150ms |
| Table sort | Motion layout animation | `spring.snappy` |
| Filter panel | Height spring (AnimatePresence) | `spring.smooth` |
| Card hover | Scale 1→1.005 + shadow elevation | 120ms ease-out |
| Form validation error | Shake keyframe | 300ms |
| Sidebar nav active indicator | layoutId slide | `spring.snappy` |
| Tab indicator | layoutId underline slide | `spring.snappy` |
| Stats counter | Number increment | 800ms |
| Command palette open | Scale 0.98→1 + fade | `spring.smooth` |

### 6.5 Reduced Motion Support

> [!IMPORTANT]
> All Motion animations MUST respect `prefers-reduced-motion`. Use `useReducedMotion()` from Motion. When active: remove all `y`, `x`, `scale` transitions; preserve opacity fades (they convey state change); disable layout animations.

### 6.6 Performance Guidelines

- Use `will-change: transform` only on actively animating elements (not persistently).
- Prefer `transform` and `opacity` over layout-triggering properties.
- Limit simultaneous `motion/react` instances on a single page to < 50.
- Use `AnimatePresence` with `mode="wait"` for page transitions; `mode="popLayout"` for list items.
- Do not animate virtualized table rows — only animate the viewport container entrance.

---

## 7. Responsive Design Strategy

### Breakpoints

```
sm:   640px   — Large phone (landscape)
md:   768px   — Tablet portrait
lg:   1024px  — Tablet landscape / small laptop
xl:   1280px  — Standard desktop (PRIMARY TARGET)
2xl:  1536px  — Large desktop
```

### Layout Behavior

| Breakpoint | Sidebar | Tables | Navigation |
|---|---|---|---|
| < sm (Mobile) | Hidden, hamburger → Sheet | Degrades to card list | Hamburger menu |
| md–lg (Tablet) | Icon-only collapsed (56px) | 4–6 columns | Collapsed sidebar |
| xl (Desktop) | Full sidebar (240px) | All columns | Full sidebar |
| 2xl+ (Large) | Full sidebar + pinned detail panel | All columns + extras | Full sidebar |

---

## 8. Authentication UX

### Login Page

- **Layout**: Two-column on desktop (brand left, form right). Single column on mobile.
- **Brand panel**: Dark background, subtle animated gradient, FootballDB wordmark, tagline.
- **Error handling**: Inline form-level error banner (not toast) for invalid credentials.

### Session Expiration

1. 30 seconds before expiry: silent background refresh attempt via Axios interceptor.
2. If refresh fails: save current URL to `sessionStorage`, redirect to `/login?returnUrl=...`.
3. On re-login: redirect back to saved URL.

### Permission-Based Navigation

Nav items are filtered at render time based on roles:

```typescript
type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  requiredRoles?: string[];  // Hidden if user doesn't qualify
};
```

Role hierarchy: `Viewer → Editor → Administrator`. Higher roles inherit all lower permissions.

---

## 9. Dashboard Layout

### Structural Anatomy

```
+------------------------------------------+
|  SIDEBAR (240px)    |  HEADER             |
|  Logo + Workspace   |  Breadcrumbs        |
|  ─────────────────  |  GlobalSearch       |
|  NavGroup: Core     |  Notifications      |
|    Persons          |  ProfileMenu        |
|    Teams            +---------------------+
|    Organizations    |                     |
|    Venues           |  CONTENT AREA       |
|  ─────────────────  |  (PageHeader        |
|  NavGroup: Comps    |   FilterBar         |
|    Competitions     |   DataTable         |
|    Editions         |   Pagination)       |
|  ─────────────────  |                     |
|  NavGroup: Ops      |                     |
|    Import           |                     |
|    Search           |                     |
|    Settings         |                     |
|  ─────────────────  |                     |
|  [User Profile]     |                     |
+------------------------------------------+
```

### Sidebar Details

- **State**: Expanded (240px) ↔ Collapsed (56px). Persisted in `sidebar.store`.
- **Active indicator**: layoutId-based sliding bar (Linear-style).
- **Keyboard shortcut**: `Cmd+B` / `Ctrl+B` toggles.

### Command Palette (Cmd+K)

A core navigation primitive, not optional. Must support:
- Fuzzy search across all entity types.
- Recent items (localStorage).
- Quick actions: *"Create Person"*, *"Import data"*, *"Go to Settings"*.
- Keyboard-first: arrow keys, enter, escape.

### Content Area Standard Layout

```
<PageHeader>
  <PageTitle />
  <PageDescription />
  <PageActions />     <- [Create Entity] button
</PageHeader>

<FilterBar />         <- Search, filter chips, sort, view toggle

<DataTable />

<Pagination />
```

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl + K` | Open Command Palette |
| `Cmd/Ctrl + B` | Toggle sidebar |
| `Cmd/Ctrl + /` | Focus global search |
| `N` | Open Create form (on list pages) |
| `Escape` | Close any modal/sheet/dropdown |

---

## 10. Reusable Component Library

### Primitives (from shadcn/ui)
`Button` | `Input` | `Textarea` | `Select` | `Checkbox` | `Switch` | `Slider` | `Radio` | `Label` | `Badge` | `Avatar` | `Separator` | `Tooltip` | `Popover` | `Dialog` | `Sheet` | `Drawer` | `DropdownMenu` | `ContextMenu` | `Tabs` | `Accordion` | `ScrollArea` | `Progress` | `Skeleton` | `Command`

### Data Display

| Component | Description |
|---|---|
| `DataTable` | TanStack Table v8 with sorting, filtering, pagination, column visibility |
| `DataGrid` | Dense grid with virtual scrolling for 10k+ rows |
| `StatCard` | Single metric with trend indicator and sparkline |
| `MetricCard` | KPI display with icon, value, label, delta |
| `Timeline` | Chronological event list (careers, match events) |
| `ChartWrapper` | Recharts container with dark-mode, loading, empty states |
| `EntityCard` | Standard preview card for Person, Team, Competition |
| `AvatarGroup` | Overlapping avatars for squad previews |
| `KVList` | Key-value pair list for entity attributes |

### Navigation & Interaction

| Component | Description |
|---|---|
| `Breadcrumb` | Auto-generated route breadcrumbs |
| `Pagination` | Offset-based controls with page size selector |
| `EntitySelector` | Searchable dropdown for related entity selection |
| `CommandPalette` | Global `Cmd+K` search and action launcher |
| `FilterBar` | Combined search + filter chip row |
| `SortControl` | Multi-sort field + direction control |
| `ViewToggle` | Table vs. grid view switcher |

### Feedback

| Component | Description |
|---|---|
| `EmptyState` | Illustration + message + optional CTA |
| `ErrorBoundary` | React error boundary with reset and report |
| `PermissionDenied` | Inline 403 state component |
| `SkeletonTable` | Table-shaped skeleton for list pages |
| `SkeletonDetail` | Two-column detail-page skeleton |
| `ConfirmDialog` | Destructive action confirmation modal |

### Forms

| Component | Description |
|---|---|
| `FormField` | Label + Input + Error message wrapper |
| `FormSection` | Titled group of form fields with divider |
| `UploadZone` | Drag-and-drop file upload with progress |
| `DatePartInput` | Year/Month/Day component inputs (aligned with backend model) |
| `EnumSelect` | Typed select pre-configured for Prisma enums |
| `SlugInput` | Auto-generates slug from a source field |

---

## 11. Entity Page Standards

Every entity follows a **consistent five-zone layout**:

```
Zone 1: Entity Header
  Avatar/Logo | Primary Name (h1) | Type Badge | Status Badge
  Secondary metadata row | Action buttons (Edit, Delete, Restore)

Zone 2: Quick Stats Row
  3-5 StatCards with the entity's most important metrics

Zone 3: Tab Navigation
  Overview | Related Data | History | Media | Audit Log

Zone 4: Tab Content (varies per tab)

Zone 5: Related Entities Sidebar (right panel on xl+)
  Quick-links to parent/child entities
```

### Entity-Specific Tab Structures

| Entity | Tabs |
|---|---|
| **Person** | Bio / Career History / Match Appearances / Awards / Media |
| **Team** | Profile / Current Squad / Competition History / Trophy Cabinet / Media |
| **Organization** | Profile / Governed Teams / Competitions / Members |
| **Venue** | Profile / Hosted Matches / Teams / Media |
| **Competition** | Profile / Editions / Records / Award History |
| **Match** | Summary / Timeline / Lineups / Officials / Media |
| **Career** | Timeline / Per-Season Stats |

---

## 12. API Integration Layer

### 12.1 Axios Instance

```typescript
// lib/axios.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15_000,
  withCredentials: true,      // Send HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': process.env.NEXT_PUBLIC_APP_VERSION,
  },
});
```

### 12.2 Interceptors

- **Request**: Attaches `X-Request-ID` correlation header.
- **Response — 401**: Attempt silent token refresh; retry original request once.
- **Response — error**: Normalize all error responses to typed `ApiError`; show Sonner toast on 5xx.

### 12.3 Service Layer Pattern

```typescript
// services/persons.service.ts
export const personsService = {
  getAll:    (params: PersonQueryParams) => api.get('/persons', { params }).then(r => r.data),
  getById:   (id: string)               => api.get(`/persons/${id}`).then(r => r.data),
  getBySlug: (slug: string)             => api.get(`/persons/slug/${slug}`).then(r => r.data),
  create:    (data: CreatePersonDto)    => api.post('/persons', data).then(r => r.data),
  update:    (id: string, data: UpdatePersonDto) => api.patch(`/persons/${id}`, data).then(r => r.data),
  remove:    (id: string)               => api.delete(`/persons/${id}`).then(r => r.data),
  restore:   (id: string)               => api.post(`/persons/${id}/restore`).then(r => r.data),
};
```

### 12.4 Centralized Query Key Factory

```typescript
// config/query-keys.ts
export const queryKeys = {
  persons: {
    all:    () => ['persons'] as const,
    list:   (params: any) => ['persons', 'list', params] as const,
    detail: (id: string)  => ['persons', 'detail', id] as const,
    slug:   (slug: string) => ['persons', 'slug', slug] as const,
  },
  teams:         { /* same pattern */ },
  organizations: { /* same pattern */ },
};
```

### 12.5 URL State for Filters and Pagination

All filter, sort, search, and pagination state lives in the URL via `nuqs`. This ensures:
- Filtered views are **shareable** via URL copy.
- Browser back/forward navigation works correctly.
- No state is lost on refresh.
- No filter state needs Zustand synchronization.

---

## 13. Performance Strategy

### Server vs Client Component Decision

| Scenario | Type |
|---|---|
| Initial entity list render | Server Component + Suspense |
| Interactive table (sort, filter) | Client Component |
| Static entity header | Server Component |
| Edit form | Client Component |
| Dashboard stats | Server Component (streamed) |
| Charts | Client Component (deferred via next/dynamic) |

### Key Performance Techniques

| Technique | Implementation |
|---|---|
| **Streaming** | `<Suspense>` boundaries around each dashboard widget |
| **Partial Prerendering** | Static shell at build time; dynamic content streamed |
| **Image optimization** | `next/image` with WebP/AVIF, responsive `sizes`, `priority` on LCP images |
| **Code splitting** | `next/dynamic` for heavy libraries; each feature folder is a natural split point |
| **Virtual scrolling** | `@tanstack/virtual` for tables with > 100 visible rows |
| **Memoization** | `React.memo` on heavy cell renderers; `useMemo` for derived filter state |
| **Prefetching** | `<Link prefetch>` on sidebar nav; TanStack Query `prefetchQuery` on list row hover |

### Core Web Vitals Targets

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.0s |
| INP (Interaction to Next Paint) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.05 |
| TTFB (Time To First Byte) | < 200ms |

---

## 14. Accessibility Standards

**Target:** WCAG 2.2 Level AA on all authenticated pages.

| Category | Requirement |
|---|---|
| **Color contrast** | Minimum 4.5:1 for normal text; 3:1 for large text and UI components |
| **Keyboard navigation** | All interactive elements reachable via Tab; logical focus order |
| **Focus indicators** | Visible 2px `ring-primary-500` on all focusable elements |
| **ARIA** | Landmark roles; `aria-label` on icon-only buttons; `aria-live` on dynamic regions |
| **Screen readers** | Table `scope` headers; `aria-sort` on sortable columns; `aria-busy` on loading states |
| **Reduced motion** | All Motion animations gated by `useReducedMotion()` |
| **Semantic HTML** | `nav`, `main`, `header`, `aside`, `section`, `article` used correctly |
| **Forms** | Every input has an associated `label`; errors use `aria-describedby` |

---

## 15. SEO Strategy

For an authenticated application, focus on **public surfaces only**:

- **Marketing page** (if exists): Full meta tags, OG tags, structured data, sitemap.
- **Public entity profiles** (if enabled): `generateMetadata()` per entity.
- **Robots.txt**: Disallow `/dashboard`, `/settings`, `/api/`.
- **Authenticated pages**: `noindex` meta tag.

---

## 16. Coding Standards

### TypeScript

- `strict: true` in `tsconfig.json`. No `any` in production code.
- All API responses typed against backend DTO interfaces.
- No `@ts-ignore` without an explaining comment.

### Component Rules

- **Composition over inheritance**: Prefer composing small components.
- **Minimal prop drilling**: > 2 levels → use a hook or context.
- **No logic in JSX**: Extract conditionals into variables before the return statement.
- **No inline styles**: Tailwind classes only.
- **Named exports only**: No default exports.

### File Naming

```
kebab-case for all files and folders.
person-card.tsx          — Component
use-persons.ts           — Hook
persons.service.ts       — Service
create-person.schema.ts  — Zod schema
person.types.ts          — TypeScript interfaces
```

---

## 17. Future Scalability

| Capability | Architecture Decision |
|---|---|
| **Mobile App** | `services/*.service.ts` is pure TypeScript — importable in React Native. Zod schemas are shared. |
| **Multi-Language (i18n)** | Use `next-intl` from day one. Entity names use `LocalizedText` table via `Accept-Language`. RTL via Tailwind `rtl:` variant. |
| **White-Label** | Color palette in CSS custom properties. `/config/theme.ts` per tenant overrides any token. Logo from env vars. |
| **Plugin Architecture** | Feature folders are self-contained. Navigation config is data-driven. An `eventBus` utility allows plugins to react to system events. |
| **Real-Time (WebSocket)** | `useRealtimeConnection` hook manages WS client. Notification store receives pushed events. TanStack Query's `setQueryData` called on incoming events — no refetch needed. |
| **Live Match Updates** | Virtualized timeline list that prepends new events with `slideDown` animation. Backend sends events via WebSocket channel. |

---

*Document maintained by the Frontend Architecture Team. All changes require approval from the Principal Frontend Architect before merging.*
