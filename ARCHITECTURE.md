# PM Dashboard - Architecture

## Project Overview

A production-quality Project Management Dashboard built with React 19, TypeScript, and Vite.

## Folder Structure

```
src/
  api/            -> Axios instance with interceptors (auth token, 401 handling)
  components/     -> Reusable, presentational components (UI wrappers, Layout, ErrorBoundary)
    ui/           -> MUI theme configuration, ThemeProvider
  features/       -> Feature-based modules (domain-driven organization)
    auth/         -> Login page, auth-related components
    tasks/        -> Task list, task form, task detail, filters
  hooks/          -> Shared custom hooks (useAuth, useTasks, useDebounce)
  mocks/          -> MSW handlers, seed data, browser/server setup
    handlers/     -> API endpoint handlers (auth, tasks)
  pages/          -> Route-level page components
  routes/         -> Route definitions, ProtectedRoute wrapper
  services/       -> API service functions (authService, taskService, clientMock)
  store/          -> Zustand stores (authStore)
  test/           -> Test setup file (MSW server config)
  types/          -> Shared TypeScript types/interfaces
```

## Key Technical Decisions

### State Management
- **Zustand** for client-side state (auth, UI) - lightweight, no boilerplate
- **TanStack Query** for server state (tasks API) - caching, loading/error states

### API Layer
- Service functions in `src/services/` use `clientMock.ts` (localStorage-based)
- `src/api/axios.ts` Axios instance with 401 interceptor (ready for real backend)
- No API calls scattered in UI components
- MSW intercepts requests in development/test
- `clientMock.ts` performs auth checks and throws 401 on unauthorized access

### Form Validation
- **React Hook Form** for form state management
- **Zod** for schema validation via `@hookform/resolvers`

### Routing
- React Router v7 with lazy-loaded pages
- ProtectedRoute wrapper for authenticated routes
- Layout component with sidebar navigation

### Testing
- Vitest as test runner
- React Testing Library for component tests
- MSW for API mocking in tests

### Performance
- React.lazy for page-level code splitting
- React.memo for expensive components
- useMemo/useCallback for computed values and event handlers
- Debounced search to prevent unnecessary API calls

### Environment Variables
- `.env` / `.env.example` for configuration
- Never hardcode URLs - use `import.meta.env.VITE_*`
