
import mongoose from "mongoose";

const organizationMemberSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenancy",
            required: true,
            index: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        role: {
            type: String,
            enum: ["owner", "admin", "agent"],
            required: true,
        },

        status: {
            type: String,
            enum: ["active", "pending", "suspended"],
            default: "pending",
            index: true,
        },

        joinedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

organizationMemberSchema.index(
    { tenantId: 1, userId: 1 },
    { unique: true }
);

export const OrganizationMember = mongoose.model(
    "OrganizationMember",
    organizationMemberSchema
);
