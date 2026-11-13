
import mongoose from "mongoose";

const tenantDocumentSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenancy",
            required: true,
            index: true,
        },

        kind: {
            type: String,
            enum: ["settings", "knowledge"],
            required: true,
        },

        // Used only when kind === "settings"
        profile: {
            description: { type: String, default: "", trim: true },
            category: { type: String, default: "", trim: true },
            website: { type: String, default: "", trim: true },
            contactEmail: { type: String, default: "", trim: true },
            contactPhone: { type: String, default: "", trim: true },
        },

        ai: {
            enabled: { type: Boolean, default: true },
            autoRespond: { type: Boolean, default: true },
            tone: {
                type: String,
                enum: ["professional", "friendly", "concise"],
                default: "professional",
            },
            instructions: { type: String, default: "", trim: true },
            requireReviewForUncertain: { type: Boolean, default: true },
        },

        support: {
            timezone: { type: String, default: "Asia/Kolkata" },
            businessHours: { type: String, default: "" },
            supportEmail: { type: String, default: "", trim: true },
        },

        policies: {
            termsAndConditions: { type: String, default: "" },
            refundPolicy: { type: String, default: "" },
            cancellationPolicy: { type: String, default: "" },
            returnPolicy: { type: String, default: "" },
            warrantyPolicy: { type: String, default: "" },
            additionalRules: { type: String, default: "" },
        },

        // Used only when kind === "knowledge"
        document: {
            originalName: { type: String, default: "" },
            storageKey: { type: String, default: "" },
            fileUrl: { type: String, default: "" },
            mimeType: { type: String, default: "" },
            size: { type: Number, default: 0 },
            processingStatus: {
                type: String,
                enum: ["pending", "processing", "completed", "failed"],
                default: "pending",
            },
            extractedText: { type: String, default: "" },
            errorMessage: { type: String, default: "" },
        },
    },
    { timestamps: true }
);

// One settings record per organization.
// Knowledge records can have multiple documents.
tenantDocumentSchema.index(
    { tenantId: 1, kind: 1 },
    {
        unique: true,
        partialFilterExpression: { kind: "settings" },
    }
);

tenantDocumentSchema.index({ tenantId: 1, createdAt: -1 });

export const TenantDocument = mongoose.model(
    "TenantDocument",
    tenantDocumentSchema
);
