
import mongoose from "mongoose";

const ticketMessageSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenancy",
            required: true,
            index: true,
        },

        ticketId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket",
            required: true,
            index: true,
        },

        senderType: {
            type: String,
            enum: ["customer", "ai", "agent"],
            required: true,
        },

        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 10000,
        },

        attachments: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

ticketMessageSchema.index({
    ticketId: 1,
    createdAt: 1,
});

ticketMessageSchema.index({
    tenantId: 1,
    ticketId: 1,
    createdAt: 1,
});

export const TicketMessage = mongoose.model(
    "TicketMessage",
    ticketMessageSchema
);
