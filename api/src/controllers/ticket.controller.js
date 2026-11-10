import { Ticket } from "../models/ticket.model.js";

export async function createTicket(req, res) {
    try {
        const { title, description, priority } = req.body;

        const userId = req.user.id;
        const tenantId = req.user.tenantId;

        if (!tenantId) {
            return res.status(400).json({
                message: "You don't belong to any organization",
            });
        }

        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required",
            });
        }

        const ticket = await Ticket.create({
            title,
            description,
            priority,
            createdBy: userId,
            tenantId,
        });

        return res.status(201).json({
            message: "Ticket created successfully",
            ticket,
        });

    } catch (error) {
        console.error("CREATE TICKET ERROR:", error);

        return res.status(500).json({
            message: "Failed to create ticket",
        });
    }
}


export async function fetchTicket(req, res) {
    try {

        const { ticketId } = req.params;
        const tenantId = req.user.tenantId;

        if (!tenantId) {
            return res.status(400).json({
                message: "You don't belong to any organization",
            });
        }

        const ticket = await Ticket.findOne({
            _id: ticketId,
            tenantId,
        });

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found",
            });
        }

        return res.status(200).json({
            ticket,
        });

    } catch (error) {
        console.error("FETCH TICKET ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch ticket",
        });
    }
}


export async function fetchAllTickets(req, res) {
    try {
        
        const tenantId = req.user.tenantId;
        const userId = req.user.id;

        let tickets;

        if (tenantId) {
            tickets = await Ticket.find({ tenantId }).sort({ createdAt: -1 });
        } else {
            tickets = await Ticket.find({ createdBy: userId }).sort({ createdAt: -1 });
        }

        return res.status(200).json({ tickets });
    } catch (error) {
        console.error("FETCH ALL TICKETS ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch tickets" });
    }
}


export async function deleteTicket(req, res) {
    try {
        const { ticketId } = req.params;
        const tenantId = req.user.tenantId;

        if (!tenantId) {
            return res.status(400).json({
                message: "You don't belong to any organization",
            });
        }

        const ticket = await Ticket.findOneAndDelete({
            _id: ticketId,
            tenantId,
        });

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found",
            });
        }

        return res.status(200).json({
            message: "Ticket deleted successfully",
        });

    } catch (error) {
        console.error("DELETE TICKET ERROR:", error);

        return res.status(500).json({
            message: "Failed to delete ticket",
        });
    }
}


export async function updateTicket(req, res) {
    try {
        const { ticketId } = req.params;
        const { title, description, priority, status } = req.body;

        const tenantId = req.user.tenantId;

        if (!tenantId) {
            return res.status(400).json({
                message: "You don't belong to any organization",
            });
        }

        const ticket = await Ticket.findOneAndUpdate(
            {
                _id: ticketId,
                tenantId,
            },
            {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(priority !== undefined && { priority }),
                ...(status !== undefined && { status }),
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found",
            });
        }

        return res.status(200).json({
            message: "Ticket updated successfully",
            ticket,
        });

    } catch (error) {
        console.error("UPDATE TICKET ERROR:", error);

        return res.status(500).json({
            message: "Failed to update ticket",
        });
    }
}