import { Ticket, CreateTicketData, UpdateTicketData } from "../types";
const url = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:2000";


function authHeaders(token: string) {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };
}
export async function createTicket(data: CreateTicketData,accessToken:string): Promise<Ticket> {
    const response = await fetch(`${url}/api/tickets`, {
        method: "POST",
        headers: authHeaders(accessToken),
        body: JSON.stringify({ title: data.title, description: data.description, priority: data.priority,tenantId:data.tenantId }),
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to create ticket");
    }
    return result.ticket;
}
export async function getTickets(accessToken: string): Promise<Ticket[]> {

    const response = await fetch(`${url}/api/tickets`, {
        method: "GET",
        cache: "no-store",
        headers : authHeaders(accessToken),
    });
    const result = await response.json();
    
    if (!response.ok) {
        throw new Error(result.message  || "Failed to fetch tickets");
    }
    return result.tickets;
}

export async function getTicket(ticketId: string,accessToken: string): Promise<Ticket> {
    
    const response = await fetch(`${url}/api/tickets/${ticketId}`, {
        method: "GET",
        headers: authHeaders(accessToken),
        cache: "no-store",
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch ticket");
    }
    return result.ticket;
}
export async function getTenantTicket(tenantId: string,accessToken: string): Promise<Ticket> {
    console.log("get ticket",tenantId);
    
    const response = await fetch(`${url}/api/tickets/tenanttickets/${tenantId}`, {
        method: "GET",
        headers: authHeaders(accessToken),
        cache: "no-store",
    });
    const result = await response.json();
    console.log(result);
    
    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch ticket");
    }
    return result.tickets;
}
export async function updateTicket(ticketId: string, data: UpdateTicketData,accessToken:string): Promise<Ticket> {
    console.log("update ticket");
    
    const response = await fetch(`${url}/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: authHeaders(accessToken),
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to update ticket");
    }
    return result.ticket;
}

export async function deleteTicket(ticketId: string,accessToken:string): Promise<void> {
    const response = await fetch(`${url}/api/tickets/${ticketId}`, {
        method: "DELETE",
        headers: authHeaders(accessToken),
    });
    console.log("delete ticket");
    
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Failed to delete ticket");
    }
}