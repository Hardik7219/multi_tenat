import { Ticket, CreateTicketData, UpdateTicketData } from "../types";

const url = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:2000";

export async function createTicket(data: CreateTicketData): Promise<Ticket> {
    const response = await fetch(`${url}/api/tickets`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: data.title, description: data.description, priority: data.priority }),
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to create ticket");
    }
    return result.ticket;
}

export async function getTickets(): Promise<Ticket[]> {
    console.log("hello");

    const response = await fetch(`${url}/api/tickets`, {
        method: "GET",
        cache: "no-store",
    });
    const result = await response.json();
    
    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch tickets");
    }
    return result.tickets;
}

export async function getTicket(ticketId: string): Promise<Ticket> {
    const response = await fetch(`${url}/api/tickets/${ticketId}`, {
        method: "GET",
        cache: "no-store",
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch ticket");
    }
    return result.ticket;
}

export async function updateTicket(ticketId: string, data: UpdateTicketData): Promise<Ticket> {
    const response = await fetch(`${url}/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to update ticket");
    }
    return result.ticket;
}

export async function deleteTicket(ticketId: string): Promise<void> {
    const response = await fetch(`${url}/api/tickets/${ticketId}`, {
        method: "DELETE",
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to delete ticket");
    }
}