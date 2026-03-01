# Jira Clone

A full-stack project and task management application inspired by Jira. Supports workspaces, projects, tasks with multiple views (Kanban, table, calendar), member management, invite codes, and OAuth (Google/GitHub). Built with Next.js and deployed on Vercel.

**Live application:** [https://jira-clone-chi.vercel.app/sign-in](https://jira-clone-chi.vercel.app/sign-in)

---

## Table of Contents

- [Technologies](#technologies)
- [Architecture](#architecture)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)

---

## Technologies

### Core

| Technology | Role | Why it fits |
|------------|------|-------------|
| **Next.js 14** | React framework, App Router, SSR/API | File-based routing, server components, and API routes in one codebase. Optimized builds and deployment on Vercel. |
| **React 18** | UI layer | Component model, hooks, and ecosystem used across features and shared components. |
| **TypeScript** | Typing | End-to-end type safety from API responses to UI, fewer runtime errors. |

### Backend and data

| Technology | Role | Why it fits |
|------------|------|-------------|
| **Hono** | API layer | Lightweight, type-safe API with middleware. Composable routes and clean handler signatures. Runs on Vercel via `hono/vercel`. |
| **Appwrite** | Auth and database | Managed auth (email/password, OAuth), databases, and storage. No custom auth or DB hosting. |
| **Zod** | Validation | Request validation (e.g. `@hono/zod-validator`) and shared schemas for forms and API contracts. |

### Client state and data fetching

| Technology | Role | Why it fits |
|------------|------|-------------|
| **TanStack Query (React Query)** | Server state | Caching, refetching, and optimistic updates for workspaces, projects, tasks, and members. |
| **React Hook Form** | Forms | Controlled forms with less re-renders and easy integration with Zod resolvers. |

### UI and styling

| Technology | Role | Why it fits |
|------------|------|-------------|
| **Tailwind CSS** | Styling | Utility-first CSS, design tokens (e.g. `hsl(var(--primary))`), responsive layout. |
| **Radix UI** | Primitives | Accessible dialogs, dropdowns, selects, tabs, etc., with unstyled components for consistent behavior. |
| **shadcn-style components** | UI layer | Button, badge, date-picker, and other components built on Radix and Tailwind in `src/components/ui`. |
| **Lucide React** | Icons | Consistent icon set used across the app. |
| **Recharts** | Charts | Analytics and dashboard visualizations. |
| **next-themes** | Themes | Optional dark/light mode via CSS variables. |

### Task management UX

| Technology | Role | Why it fits |
|------------|------|-------------|
| **@hello-pangea/dnd** | Drag and drop | Accessible Kanban board with column and card reordering. |
| **TanStack Table** | Tables | Sortable, filterable task list with column control. |
| **react-big-calendar** | Calendar | Calendar view for tasks and due dates. |
| **date-fns** | Dates | Parsing, formatting, and date logic for filters and analytics. |
| **nuqs** | URL state | Filters (status, assignee, project, etc.) encoded in the URL for shareable and bookmarkable views. |

### Other

| Technology | Role | Why it fits |
|------------|------|-------------|
| **Sonner** | Toasts | Lightweight toast notifications for success and error feedback. |
| **Vaul** | Drawers | Slide-out panels for secondary UI. |
| **server-only** | Boundaries | Ensures server-only modules (e.g. Appwrite server client) are not bundled on the client. |

---

## Architecture

### High-level flow

- **Browser** talks to **Next.js** (App Router).
- **Next.js** serves React UI and forwards `/api/*` to **Hono**.
- **Hono** validates input (Zod), runs **session middleware** (cookie-based Appwrite session), then calls **Appwrite** (auth, database, storage).
- **React** uses **TanStack Query** to call `/api/*` and keeps server state in sync with the backend.

### Route groups and layouts

- **`(auth)`** — Sign-in and sign-up pages (standalone, no dashboard chrome).
- **`(dashboard)`** — Authenticated app: sidebar (workspace switcher, navigation, projects), navbar, and main content. Layout wraps children with modals (create workspace, project, task, edit task) and `QueryProvider`.
- **`(standalone)`** — Standalone pages such as workspace settings, project settings, and join-by-invite, which may use a minimal or different layout.

Routing is file-based under `src/app`; dynamic segments include `[workspaceId]`, `[projectId]`, `[taskId]`, and `[inviteCode]`.

### API design

All REST-style API handlers live under **Hono** in `src/app/api/[[...route]]/route.ts`, mounted at `/api` and split by domain:

- **`/api/auth`** — Login, register, logout, current user. Uses admin client for session creation; session stored in an httpOnly cookie.
- **`/api/workspaces`** — CRUD, membership, invite code, analytics (e.g. task counts by status).
- **`/api/members`** — List/add/update/remove workspace members and roles.
- **`/api/projects`** — CRUD and analytics per project.
- **`/api/tasks`** — CRUD, list with filters (workspace, project, status, assignee, search, due date), and bulk update for Kanban reordering.

Protected routes use **session middleware**: it reads the auth cookie, creates an Appwrite client with that session, attaches `account`, `databases`, `storage`, and `user` to the context, and returns 401 when unauthenticated. Validation is done with **Zod** and **@hono/zod-validator**.

### Data and auth

- **Appwrite** holds: users (auth), database collections (workspaces, members, projects, tasks), and an images bucket (e.g. workspace avatars).
- **Session**: On login/register/OAuth callback, the app creates an Appwrite session and stores the session secret in an httpOnly, secure, same-site cookie. The Hono middleware and server-side `createSessionClient()` use this cookie to talk to Appwrite as the current user.
- **Authorization**: Feature logic checks membership (e.g. `getMember(workspaceId, userId)`) before allowing access to workspaces, projects, or tasks.

### Frontend structure

- **Features** — Domain-specific modules under `src/features` (auth, workspaces, projects, tasks, members). Each typically includes:
  - **`api/`** — TanStack Query hooks that call `/api/*`.
  - **`components/`** — Feature-specific UI (forms, modals, Kanban, table, calendar, filters).
  - **`server/route.ts`** — Hono sub-app for that domain.
  - **`schemas.ts`** — Zod schemas.
  - **`types.ts`** — Shared types where needed.
- **Shared** — `src/components` (navbar, sidebar, analytics, UI primitives), `src/lib` (Appwrite clients, session middleware, utils), `src/hooks`, and `src/config` (e.g. Appwrite IDs from env).

This keeps the app modular: each feature owns its API surface, validation, and UI.

---

## Running Locally

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- An [Appwrite](https://appwrite.io) project (cloud or self-hosted) with:
  - Auth enabled (email/password and OAuth providers if you use Google/GitHub).
  - A database with collections for workspaces, members, projects, and tasks (and an images bucket if you use workspace avatars).
  - API keys and IDs for the project and collections.

### Setup

1. Clone the repository and install dependencies:

   ```bash
   git clone <repository-url>
   cd jira-clone
   npm install
   ```

2. Create a `.env.local` in the project root and set the required variables (see [Environment Variables](#environment-variables)).

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser. Use the sign-in or sign-up flow; for OAuth, ensure your Appwrite OAuth redirect URLs include `http://localhost:3000/oauth` (and your production URL for the live app).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js in development mode. |
| `npm run build` | Production build. |
| `npm run start` | Run production server (after `build`). |
| `npm run lint` | Run ESLint. |

---

## Project Structure

```
src/
  app/                    # Next.js App Router
    (auth)/               # Sign-in, sign-up
    (dashboard)/          # Main app: workspaces, projects, tasks
    (standalone)/         # Settings, join by invite
    api/[[...route]]/     # Hono API entry
    oauth/                # OAuth callback handler
  components/             # Shared UI (navbar, sidebar, analytics, ui primitives)
  features/               # Domain modules
    auth/
    workspaces/
    projects/
    tasks/
    members/
  lib/                    # Appwrite clients, session middleware, utils
  hooks/                  # Shared hooks (e.g. useConfirm)
  config.ts               # Appwrite DB/collection IDs from env
```

---

## Environment Variables

Configure these in `.env.local` (and in your Vercel project for production). Names follow the existing usage in `src/config.ts` and `src/lib/appwrite.ts`.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Appwrite API endpoint (e.g. `https://cloud.appwrite.io/v1`). |
| `NEXT_PUBLIC_APPWRITE_PROJECT` | Appwrite project ID. |
| `NEXT_APPWRITE_KEY` | Server-side API key (admin) for creating sessions and accessing Users. |
| `NEXT_PUBLIC_APPWRITE_DATABASE_ID` | Database ID. |
| `NEXT_PUBLIC_APPWRITE_WORKSPACES_ID` | Workspaces collection ID. |
| `NEXT_PUBLIC_APPWRITE_MEMBERS_ID` | Members collection ID. |
| `NEXT_PUBLIC_APPWRITE_PROJECTS_ID` | Projects collection ID. |
| `NEXT_PUBLIC_APPWRITE_TASKS_ID` | Tasks collection ID. |
| `NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID` | Storage bucket ID for images (e.g. workspace avatars). |

OAuth providers (Google, GitHub) are configured in the Appwrite console; redirect URL must include `https://your-domain/oauth` (and `http://localhost:3000/oauth` for local dev).

---

## License

Private. All rights reserved.
