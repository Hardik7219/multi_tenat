export type TicketStatus =
    | "open"
    | "in_progress"
    | "resolved"
    | "closed";

export type TicketPriority =
    | "low"
    | "medium"
    | "high"
    | "urgent";


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



export async function createTicket(
    data: CreateTicketData
): Promise<Ticket> {
    const url = process.env.BACKEND_URL || "http://localhost:2000";

    const response = await fetch(`${url}/api/tickets`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: data.title, description: data.description, priority: data.priority }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to create ticket"
        );
    }

    return result.ticket;
}



export async function getTickets(): Promise<Ticket[]> {

    const response = await fetch("/api/tickets", {
        method: "GET",
        cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to fetch tickets"
        );
    }

    return result.tickets;
}



export async function getTicket(
    ticketId: string
): Promise<Ticket> {

    const response = await fetch(
        `/api/tickets/${ticketId}`,
        {
            method: "GET",
            cache: "no-store",
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to fetch ticket"
        );
    }

    return result.ticket;
}



export async function updateTicket(
    ticketId: string,
    data: UpdateTicketData
): Promise<Ticket> {

    const response = await fetch(
        `/api/tickets/${ticketId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to update ticket"
        );
    }

    return result.ticket;
}



export async function deleteTicket(
    ticketId: string
): Promise<void> {

    const response = await fetch(
        `/api/tickets/${ticketId}`,
        {
            method: "DELETE",
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to delete ticket"
        );
    }
}