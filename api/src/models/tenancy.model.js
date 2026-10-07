import mongoose from "mongoose";

const tenancySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        status: {
            type: String,
            enum: ["active", "suspended", "deleted"],
            default: "active",
        },

        plan: {
            type: String,
            enum: ["free", "pro", "enterprise"],
            default: "free",
        },
    },
    {
        timestamps: true,
    }
);

export const Tenancy = mongoose.model("Tenancy", tenancySchema);