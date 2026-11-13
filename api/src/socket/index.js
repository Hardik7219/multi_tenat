/**
 * Socket.IO handler for the real-time chat system.
 *
 * Room strategy:
 *   Each ticket has its own Socket.IO room: "ticket:<ticketId>"
 *   Clients join on mount, leave on unmount.
 *
 * Authentication:
 *   The JWT is validated in the `connection` handshake via auth.token.
 *   This mirrors the HTTP middleware but runs server-side during the
 *   WebSocket upgrade, preventing unauthenticated connections.
 *
 * AI_HOOK:
 *   When an AI pipeline is added, the AI service emits "new_message"
 *   to the room with senderType "ai" after processing.
 *   No changes to this file are needed — just emit from the AI worker.
 */

import jwt from "jsonwebtoken";

export function initSocket(io) {
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || "development-secret"
            );

            socket.user = { id: decoded.id };
            next();
        } catch {
            next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`[Socket] Connected: ${socket.user.id}`);

        socket.on("join_ticket", ({ ticketId }) => {
            if (!ticketId) return;
            const room = `ticket:${ticketId}`;
            socket.join(room);
            console.log(`[Socket] ${socket.user.id} joined room ${room}`);
        });

        socket.on("leave_ticket", ({ ticketId }) => {
            if (!ticketId) return;
            const room = `ticket:${ticketId}`;
            socket.leave(room);
            console.log(`[Socket] ${socket.user.id} left room ${room}`);
        });

        socket.on("typing", ({ ticketId, isTyping }) => {
            if (!ticketId) return;
            socket
                .to(`ticket:${ticketId}`)
                .emit("user_typing", { userId: socket.user.id, isTyping });
        });

        socket.on("disconnect", () => {
            console.log(`[Socket] Disconnected: ${socket.user.id}`);
        });
    });
}
