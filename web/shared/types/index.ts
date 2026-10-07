export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface Ticket {
    _id: string;
    tenantId: string;
    createdBy: string;
    assignedTo?: string | null;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    category?: string | null;
    tags: string[];
    resolvedAt?: string | null;
    closedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTicketData {
    title: string;
    description: string;
    priority?: TicketPriority;
}

export interface UpdateTicketData {
    title?: string;
    description?: string;
    priority?: TicketPriority;
    status?: TicketStatus;
}

export interface Tenant {
    _id: string;
    name: string;
    slug: string;
    email?: string;
    status: "active" | "suspended" | "deleted";
    plan: "free" | "pro" | "enterprise";
    createdAt: string;
    updatedAt: string;
}

export interface CreateTenantData {
    name: string;
    slug: string;
}
