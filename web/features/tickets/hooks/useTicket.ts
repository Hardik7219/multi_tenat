
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import {
    Ticket,
    UpdateTicketData,
} from "../../../shared/types";

import {
    getTicket,
    updateTicket as apiUpdateTicket,
    deleteTicket as apiDeleteTicket,
} from "../../../shared/services/tickets.service";

export function useTicket(ticketId: string) {
    const { data: session, status: sessionStatus } = useSession();
    const accessToken = session?.user?.accessToken as string | undefined;

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadTicket = useCallback(async () => {
        if (sessionStatus === "loading") return;

        if (!accessToken) {
            setTicket(null);
            setError("You must be logged in to view this ticket.");
            setLoading(false);
            return;
        }

        if (!ticketId) {
            setError("Invalid ticket ID.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const data = await getTicket(ticketId, accessToken);
            setTicket(data);
        } catch (err) {
            setTicket(null);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load ticket."
            );
        } finally {
            setLoading(false);
        }
    }, [ticketId, accessToken, sessionStatus]);

    useEffect(() => {
        loadTicket();
    }, [loadTicket]);

    const updateTicket = async (data: UpdateTicketData) => {
        if (!accessToken || !ticket) {
            return { success: false, error: "Not authenticated." };
        }

        try {
            setError("");

            const updated = await apiUpdateTicket(
                ticket._id,
                data,
                accessToken
            );

            setTicket(updated);

            return { success: true, ticket: updated };
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to update ticket.";

            setError(message);
            return { success: false, error: message };
        }
    };

    const deleteTicket = async () => {
        if (!accessToken || !ticket) {
            return { success: false, error: "Not authenticated." };
        }

        try {
            await apiDeleteTicket(ticket._id, accessToken);
            return { success: true };
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to delete ticket.";

            setError(message);
            return { success: false, error: message };
        }
    };

    return {
        ticket,
        loading: loading || sessionStatus === "loading",
        error,
        updateTicket,
        deleteTicket,
        reload: loadTicket,
    };
}
