# Frontend Data Flow Architecture

To ensure the frontend remains strictly modular, scalable, and entirely free of inline code comments, this document serves as the single source of truth for tracking data flow across the multi-tenant frontend architecture.

## Domain-Driven (Feature-Sliced) Design

The architecture is split into distinct layers. Data always flows in a unidirectional pattern from the lowest layer (API Services) up to the UI (Pages).

```
[ Backend Express API ]
          |
          v
[ web/shared/services (API Callers) ]
          |
          v
[ web/features/*/hooks (State & Query Managers) ]
          |
          v
[ web/features/*/components (Smart Components) ]
          |
          v
[ web/app/* (Pages / Entry Points) ]
```

## Module Responsibilities

### 1. `web/shared/services`
Responsible strictly for fetching and mutating data over HTTP.
- Receives: Raw parameters (e.g., credentials, ticket payloads).
- Returns: Strongly typed TypeScript promises defined in `web/shared/types`.
- Rule: No React code or state exists here.

### 2. `web/features/[featureName]/hooks`
Custom React hooks that manage local state, loading indicators, error handling, and orchestration of service calls.
- Examples: `useTickets`, `useTenants`, `useAuth`.
- Receives: Nothing, or simple IDs (e.g., `ticketId`).
- Returns: Extracted data states (`tickets`, `tenant`), loading flags (`loading`), and mutation functions (`createTicket`, `deleteTenant`).

### 3. `web/features/[featureName]/components`
React components mapped directly to business domains (Auth, Tickets, Tenants, AI).
- Receives: Data and callbacks directly from hooks, or as props from the Page layer.
- Returns: JSX combining `web/shared/ui` components with business logic.

### 4. `web/shared/ui`
Dumb, purely presentational components (Buttons, Inputs, Cards).
- Receives: Raw data primitives (`string`, `boolean`) and standard React event handlers (`onClick`, `onChange`).
- Returns: Styled JSX (TailwindCSS).

### 5. `web/app` (Pages)
The Next.js App Router boundary. Pages act solely as orchestrators. They call the hooks, handle URL params/routing, and render the feature components. They should contain minimal business logic.

## Specific Data Flows

### Authentication Flow (Dual Signup)
1. **User Action**: Fills out `/signup` form. Chooses "Organization" or "Customer".
2. **Hook**: Calls `signupUser` from `auth.service.ts`, passing the `role`.
3. **API**: `POST /api/auth/signup` creates the user.
4. **Redirection**: 
   - If Organization: Prompted to create a Tenant.
   - If Customer: Sent directly to Dashboard (or asked to join a tenant).
5. **Login**: `signIn("credentials")` from NextAuth securely stores the `accessToken` and `tenantId` in the JWT session.

### AI Features Flow
1. **User Action**: Navigates to `/ai`.
2. **Hook**: Calls `useAiAssistant` (to be implemented).
3. **Data**: Streams responses or fetches static AI-generated insights via `web/shared/services/ai.service.ts`.
4. **UI**: Rendered securely using `web/features/ai/components/AiChat.tsx`.
