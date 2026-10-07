import { useState, useEffect, useCallback, useMemo } from "react";
import { Ticket, TicketStatus, CreateTicketData, UpdateTicketData } from "../../../shared/types";
import { getTickets, createTicket as apiCreateTicket, updateTicket as apiUpdateTicket, deleteTicket as apiDeleteTicket } from "../../../shared/services/tickets.service";

export function useTickets() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");

    const loadTickets = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getTickets();
            setTickets(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load tickets");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const createTicket = async (data: CreateTicketData) => {
        try {
            setError("");
            const newTicket = await apiCreateTicket(data);
            setTickets((current) => [newTicket, ...current]);
            return { success: true, ticket: newTicket };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to create ticket";
            setError(msg);
            return { success: false, error: msg };
        }
    };

    const updateTicket = async (id: string, data: UpdateTicketData) => {
        try {
            setError("");
            const updated = await apiUpdateTicket(id, data);
            setTickets((current) => current.map((t) => (t._id === id ? updated : t)));
            return { success: true, ticket: updated };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to update ticket";
            setError(msg);
            return { success: false, error: msg };
        }
    };

    const deleteTicket = async (id: string) => {
        try {
            setError("");
            await apiDeleteTicket(id);
            setTickets((current) => current.filter((t) => t._id !== id));
            return { success: true };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to delete ticket";
            setError(msg);
            return { success: false, error: msg };
        }
    };

    const filteredTickets = useMemo(() => {
        return tickets.filter((ticket) => {
            const matchesSearch =
                ticket.title.toLowerCase().includes(search.toLowerCase()) ||
                ticket.description.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [tickets, search, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: tickets.length,
            open: tickets.filter((t) => t.status === "open").length,
            inProgress: tickets.filter((t) => t.status === "in_progress").length,
            resolved: tickets.filter((t) => t.status === "resolved").length,
        };
    }, [tickets]);

    return {
        tickets,
        filteredTickets,
        stats,
        loading,
        error,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        createTicket,
        updateTicket,
        deleteTicket,
        reload: loadTickets,
    };
}
