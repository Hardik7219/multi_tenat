import { useState, useEffect, useCallback, useMemo } from "react";
import { Ticket, TicketStatus, CreateTicketData, UpdateTicketData } from "../../../shared/types";
import { getTickets, createTicket as apiCreateTicket, updateTicket as apiUpdateTicket, deleteTicket as apiDeleteTicket, fetchTenantTickets, getTenantTicket } from "../../../shared/services/tickets.service";
import { useSession } from "next-auth/react";

export function useTickets(tenantId :string) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");

    const { data: session } = useSession();
    const accessToken = session?.user?.accessToken as string | undefined;

    const loadTickets = useCallback(async () => {
        if (!accessToken) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);

            setError("");
            if (!tenantId) {

                const data = await getTickets(accessToken);

                if (!Array.isArray(data)) {
                    throw new Error("Invalid tickets response from server");
                }

                setTickets(data);;
            }
            else {
                console.log("hello load ticker");
                
                const data = await getTenantTicket(tenantId, accessToken)
                if (!Array.isArray(data)) {
                    throw new Error("Invalid tickets response from server");
                }
                setTickets(data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load tickets");
        } finally {
            setLoading(false);
        }
    }, [accessToken,tenantId]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const createTicket = async (data: CreateTicketData) => {
        if (!accessToken) return { success: false, error: "Not authenticated" };
        try {
            setError("");
            const newTicket = await apiCreateTicket(data, accessToken);
            setTickets((current) => [newTicket, ...current]);
            return { success: true, ticket: newTicket };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to create ticket";
            setError(msg);
            return { success: false, error: msg };
        }
    };

    const updateTicket = async (id: string, data: UpdateTicketData) => {
        if (!accessToken) return { success: false, error: "Not authenticated" };
        try {
            setError("");
            const updated = await apiUpdateTicket(id, data, accessToken);
            setTickets((current) => current.map((t) => (t._id === id ? updated : t)));
            return { success: true, ticket: updated };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to update ticket";
            setError(msg);
            return { success: false, error: msg };
        }
    };

    const deleteTicket = async (id: string) => {
        if (!accessToken) return { success: false, error: "Not authenticated" };
        try {
            setError("");

            await apiDeleteTicket(id, accessToken);
            setTickets((current) => current.filter((t) => t._id !== id));
            return { success: true };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to delete ticket";
            setError(msg);
            return { success: false, error: msg };
        }
    };
    const fetchTenantTickets = async (tenantId: string) => {
        if (!accessToken) return { success: false, error: "Not authenticated" };
        try {
            const data = await getTenantTicket(tenantId, accessToken)
            if (!Array.isArray(data)) {
                throw new Error("Invalid tickets response from server");
            }
            setTickets(data);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to delete ticket";
            setError(msg);
            return { success: false, error: msg };
        }

    }
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
        fetchTenantTickets,
        reload: loadTickets,
    };
}
