import { request } from "express";
import { Ticket } from "../models/ticket.model.js";
import mongoose from "mongoose";

export async function createTicket(req, res) {
    try {
        const { title, description, priority, tenantId } = req.body;

        const userId = req.user.id;


        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required",
            });
        }

        const ticket = await Ticket.create({
            tenantId,
            title,
            description,
            priority,
            createdBy: userId,
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
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(ticketId)) {
            return res.status(400).json({ message: "Invalid ticket ID" });
        }

        const ticket = await Ticket.findOne({
            _id: ticketId,
            createdBy: userId,
        });

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        return res.status(200).json({ ticket });
    } catch (error) {
        console.error("FETCH TICKET ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch ticket" });
    }
}


export async function fetchAllTickets(req, res) {
    try {

        const userId = req.user.id;

        const tickets = await Ticket.find({
            createdBy: userId
        })
        return res.status(200).json({ tickets });
    } catch (error) {
        console.error("FETCH ALL TICKETS ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch tickets" });
    }
}


export async function fetchTenantTickets(req, res) {
    try {

        const { tenantId } = req.params;        
        if (!tenantId) {
            return res.status(400).json({
                message: "There is no Tenant",
            });
        }
        const tickets = await Ticket.find({
            tenantId
        })

        if (!tickets) {
            return res.status(404).json({
                message: "Ticket not found",
            });
        }

        return res.status(200).json({
            tickets,
        });
    } catch (error) {
        console.log(error);
        
    }
}

export async function updateTicket(req, res) {
    try {
        const { ticketId } = req.params;
        const userId = req.user.id;
        const { title, description, priority, status } = req.body;

        if (!mongoose.isValidObjectId(ticketId)) {
            return res.status(400).json({ message: "Invalid ticket ID" });
        }

        const allowedUpdates = {};

        if (title !== undefined) allowedUpdates.title = title;
        if (description !== undefined) allowedUpdates.description = description;
        if (priority !== undefined) allowedUpdates.priority = priority;
        if (status !== undefined) allowedUpdates.status = status;

        if (Object.keys(allowedUpdates).length === 0) {
            return res.status(400).json({ message: "No valid updates provided" });
        }

        const ticket = await Ticket.findOneAndUpdate(
            {
                _id: ticketId,
                createdBy: userId,
            },
            {
                $set: allowedUpdates,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        return res.status(200).json({
            message: "Ticket updated successfully",
            ticket,
        });
    } catch (error) {
        console.error("UPDATE TICKET ERROR:", error);
        return res.status(500).json({ message: "Failed to update ticket" });
    }
}

export async function deleteTicket(req, res) {
    try {
        const { ticketId } = req.params;
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(ticketId)) {
            return res.status(400).json({ message: "Invalid ticket ID" });
        }

        const ticket = await Ticket.findOneAndDelete({
            _id: ticketId,
            createdBy: userId,
        });

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        return res.status(200).json({
            message: "Ticket deleted successfully",
        });
    } catch (error) {
        console.error("DELETE TICKET ERROR:", error);
        return res.status(500).json({ message: "Failed to delete ticket" });
    }
}