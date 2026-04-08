# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build (TypeScript and ESLint errors are suppressed in build)
npm run lint     # Run ESLint
```

There are no automated tests in this project.

## Architecture Overview

**Connecta Skills** is a Next.js 14 (App Router) skills assessment platform for companies. It has two main user surfaces:

1. **Admin panel** (`/admin`, `/empresas`, `/cadastros`, `/pesquisas`, `/formularios`, `/respostas`) — authenticated area for HR/managers to manage surveys, forms, respondents, and PDI data.
2. **Collaborator portal** (`/portal-colaborador`) — for employees to access their own data.
3. **Public form response** (`/respostas/formulario/[slug]`) — unauthenticated page where respondents fill in survey forms via a URL+token.

### Authentication

- **Admin users**: JWT token stored in `localStorage` under the key `token`. The `AuthContext` (`app/context/AuthContext.tsx`) handles login/logout/session and wraps the entire app via `app/layout.tsx`. The `withAuth` HOC (`app/HOC/withAuth.tsx`) guards protected routes.
- **Collaborators**: separate auth flow via `app/store/authColabStore.ts`.
- **Public respondents**: no auth; identified by a `token` query param in the survey URL.

### API Communication

- Base URL: `NEXT_PUBLIC_API_BASE_URL` env variable (points to the Laravel backend).
- Two patterns are used:
  - `app/services/api.tsx`: a shared axios instance with the bearer token pre-configured. Used for general authenticated requests.
  - `app/hooks/useCRUD.tsx`: a `useCrud<T>(path)` hook that auto-prefixes `/empresas` to the base URL and injects auth headers. Used throughout the admin panel hooks.
- Domain-specific hooks in `app/hooks/` (e.g., `usePesquisasHook`, `useFormulariosHook`, `useRespostasHook`) wrap `useCrud` or direct axios calls.

### State Management

Zustand stores in `app/store/`:
- `userStore.ts`: admin user data and their company (`empresa`).
- `authColabStore.ts`: collaborator session state.

### Key Components

- `components/DynamicCrudComponent.tsx`: reusable CRUD table+form component. Accepts `fields` (form config), `columns` (table display), `fetchData`, `saveData`, `deleteData`, and `permissoes`. Most admin list/edit pages use this.
- `components/form-builder/`: drag-and-drop form builder (`FormBuilder.tsx`, `ConstrutorPergunta.tsx`, `FormPreview.tsx`) used in `/formularios/builder`.
- `components/ui/`: shadcn/ui components (Radix UI based).

### Naming Conventions

- Variables, components, props, and functions must use **Portuguese names without abbreviations** (per project conventions in `agents.md`).
- Do not add new external dependencies; reuse the existing stack (axios, react-hook-form, zod, zustand, shadcn/ui, react-toastify).

### Backend API Context

The backend is a separate Laravel API. Key endpoints (all prefixed with `NEXT_PUBLIC_API_BASE_URL`):
- `POST /login`, `GET /me`, `POST /logout` — auth
- `/empresas/*` — all authenticated company-scoped resources (pesquisas, formularios, respondentes, competencias, livros-pdi, videos-pdi, envios, PDI)
- `POST /api/externo-respostas` — public endpoint for submitting survey responses (no auth)
- `GET /api/externo-respostas/status` — check if a respondent already submitted

Survey response submission payload and PDI generation flow are documented in `docs.md`.
