import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenancy",
            required: true,
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: [
                "open",
                "in_progress",
                "resolved",
                "closed"
            ],
            default: "open",
            index: true,
        },

        priority: {
            type: String,
            enum: [
                "low",
                "medium",
                "high",
                "urgent"
            ],
            default: "medium",
        },

        category: {
            type: String,
            trim: true,
            default: null,
        },

        tags: {
            type: [String],
            default: [],
        },

        resolvedAt: {
            type: Date,
            default: null,
        },

        closedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);
ticketSchema.index({ tenantId: 1, createdAt: -1 });
ticketSchema.index({ tenantId: 1, createdBy: 1, createdAt: -1 });
ticketSchema.index({ tenantId: 1, status: 1, createdAt: -1 });

export const Ticket = mongoose.model("Ticket", ticketSchema);