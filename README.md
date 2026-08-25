# PM Dashboard

A production-quality Project Management Dashboard built with React.js, TypeScript, and Vite.

## Features

- Authentication (Login/Logout with session management)
- Dashboard with task statistics (5 cards: Total, Pending, In Progress, Completed, High Priority)
- Task Management (CRUD operations with form validation)
- Search, Filter, Sorting & Pagination with debouncing
- Responsive design (Desktop, Tablet, Mobile)
- Dark/Light theme toggle
- State management with Zustand + TanStack Query
- MSW mock backend for development

## Tech Stack

| Library | Purpose |
|---------|---------|
| React 19 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| MUI v9 | Component library |
| Zustand | Auth state management |
| TanStack Query | Server state / API caching |
| React Hook Form + Zod | Form validation |
| React Router DOM v7 | Routing |
| Axios | HTTP client |
| MSW | Mock API for development/testing |
| Vitest + React Testing Library | Testing |

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The dev server runs on `http://localhost:3000` with MSW mock API enabled.

**Demo credentials:** `lokesh@example.com` / `password123`

## Build

```bash
npm run build
```

## Test

```bash
npm run test
```

## Lint

```bash
npm run lint
```

## Docker

```bash
docker build -t pm-dashboard .
docker run -p 80:80 pm-dashboard
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed folder structure and technical decisions.

## Performance Optimizations

- **React.lazy** — Routes are code-split (LoginPage, DashboardPage, TasksPage load on demand)
- **React.memo** — StatCard and TaskCard prevent unnecessary re-renders
- **useMemo / useCallback** — Filter objects and event handlers are memoized
- **TanStack Query caching** — 2-minute staleTime reduces redundant API calls
- **Vite manual chunks** — MUI core, MUI date pickers, and vendor libs split into separate bundles
- **Inline critical CSS** — Initial loading spinner rendered via inline styles in index.html

## Known Limitations

- **No real backend** — Uses MSW for mocking; all data is in-memory and resets on page refresh
- **No persistent data** — Created/edited tasks are stored in MSW seed data, not a real database
- **No role-based access** — All authenticated users have identical permissions
- **No optimistic updates** — Mutations refetch from server after completion instead of updating local cache immediately
- **No request cancellation** — AbortController not implemented for in-flight requests
- **No e2e tests** — Only unit/integration tests with Vitest + React Testing Library
- **No i18n** — English only, no internationalization support
- **Limited accessibility** — Relies on MUI's built-in a11y; no custom ARIA attributes or keyboard navigation enhancements
