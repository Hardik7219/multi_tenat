# Backend Changelog & Security Fixes

This document tracks all optimizations and security patches applied to the backend logic.

## 1. Tenancy Controller (`api/src/controllers/tenancy.controller.js`)
- **[Security Fix] `updateTenancy`**: Added strict role validation `if (req.user.role !== "owner" && req.user.role !== "organization")` to ensure regular customers cannot rename or modify the organization settings.
- **[Security Fix] `deleteTenancy`**: Added strict role validation `if (req.user.role !== "owner" && req.user.role !== "organization")` to prevent unauthorized deletion of the workspace.
- **[Logic Optimization] `createTenancy`**: Added a check `if (req.user.tenantId)` to prevent users from creating a new organization if they already belong to one. This fixes the issue where an organization could become "orphaned".
- **[Logic Optimization] `deleteTenancy`**: Updated the cascade delete query. When a tenancy is deleted, all associated users now have their `role` reset to `"customer"` (in addition to unsetting their `tenantId`).
- **[Logic Optimization] `fetchTenancy`**: Added a check to block the request if `req.user.tenantId` is missing, preventing crashes.

## 2. Ticket Controller (`api/src/controllers/ticket.controller.js`)
- **[Logic Fix] `createTicket`**: Added a check `if (!tenantId)` to immediately reject the ticket creation if the user does not belong to a tenant. This prevents MongoDB from throwing validation crashes due to the `required: true` rule on `tenantId`.
- **[Logic Fix] `fetchTicket`, `fetchAllTickets`, `updateTicket`, `deleteTicket`**: Added missing `if (!tenantId)` checks across all routes to prevent cross-tenant leakage or MongoDB errors if a non-tenant user tries to access tickets.
