
import mongoose from "mongoose";
import { Tenancy } from "../models/tenancy.model.js";
import { TenantDocument } from "../models/tenantDocument.model.js";

const DEFAULT_SETTINGS = {
    kind: "settings",
    profile: {
        description: "",
        category: "",
        website: "",
        contactEmail: "",
        contactPhone: "",
    },
    ai: {
        enabled: true,
        autoRespond: true,
        tone: "professional",
        instructions: "",
        requireReviewForUncertain: true,
    },
    support: {
        timezone: "Asia/Kolkata",
        businessHours: "",
        supportEmail: "",
    },
    policies: {
        termsAndConditions: "",
        refundPolicy: "",
        cancellationPolicy: "",
        returnPolicy: "",
        warrantyPolicy: "",
        additionalRules: "",
    },
};

const allowedSettings = ["profile", "ai", "support", "policies"];

function validId(id) {
    return mongoose.isValidObjectId(id);
}

async function verifyOwner(tenantId, userId) {
    if (!validId(tenantId)) {
        return { error: "Invalid organization ID", status: 400 };
    }

    const tenant = await Tenancy.findOne({
        _id: tenantId,
        createdBy: userId,
        status: "active",
    }).lean();

    if (!tenant) {
        return { error: "Organization not found or access denied", status: 404 };
    }

    return { tenant };
}

function validateSettingsPayload(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return "Invalid settings payload";
    }

    const keys = Object.keys(body);
    const invalidKey = keys.find((key) => !allowedSettings.includes(key));

    if (invalidKey) {
        return `Unsupported settings section: ${invalidKey}`;
    }

    for (const section of keys) {
        if (
            !body[section] ||
            typeof body[section] !== "object" ||
            Array.isArray(body[section])
        ) {
            return `Invalid ${section} settings`;
        }
    }

    return null;
}

// GET /api/tenant-settings/:tenantId
export async function getTenantSettings(req, res) {
    try {
        const result = await verifyOwner(req.params.tenantId, req.user.id);

        if (result.error) {
            return res.status(result.status).json({ message: result.error });
        }

        let settings = await TenantDocument.findOne({
            tenantId: req.params.tenantId,
            kind: "settings",
        }).lean();

        if (!settings) {
            settings = await TenantDocument.create({
                tenantId: req.params.tenantId,
                ...DEFAULT_SETTINGS,
            });
            settings = settings.toObject();
        }

        return res.status(200).json({ settings });
    } catch (error) {
        console.error("GET TENANT SETTINGS ERROR:", error);
        return res.status(500).json({
            message: "Failed to fetch organization settings",
        });
    }
}

// PATCH /api/tenant-settings/:tenantId
export async function updateTenantSettings(req, res) {
    try {
        const result = await verifyOwner(req.params.tenantId, req.user.id);

        if (result.error) {
            return res.status(result.status).json({ message: result.error });
        }

        const validationError = validateSettingsPayload(req.body);

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const update = {};

        for (const section of allowedSettings) {
            if (req.body[section] !== undefined) {
                for (const [key, value] of Object.entries(req.body[section])) {
                    update[`${section}.${key}`] = value;
                }
            }
        }

        // Whitelist nested fields to prevent arbitrary schema updates.
        const allowedFields = {
            profile: [
                "description", "category", "website",
                "contactEmail", "contactPhone",
            ],
            ai: [
                "enabled", "autoRespond", "tone",
                "instructions", "requireReviewForUncertain",
            ],
            support: [
                "timezone", "businessHours", "supportEmail",
            ],
            policies: [
                "termsAndConditions", "refundPolicy",
                "cancellationPolicy", "returnPolicy",
                "warrantyPolicy", "additionalRules",
            ],
        };

        for (const [path, value] of Object.entries(update)) {
            const [section, field] = path.split(".");
            if (!allowedFields[section]?.includes(field)) {
                return res.status(400).json({
                    message: `Unsupported setting: ${path}`,
                });
            }

            if (typeof value !== "string" && typeof value !== "boolean") {
                return res.status(400).json({
                    message: `Invalid value for ${path}`,
                });
            }
        }

        const settings = await TenantDocument.findOneAndUpdate(
            {
                tenantId: req.params.tenantId,
                kind: "settings",
            },
            {
                $set: update,
                $setOnInsert: {
                    tenantId: req.params.tenantId,
                    kind: "settings",
                },
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        return res.status(200).json({
            message: "Organization settings updated",
            settings,
        });
    } catch (error) {
        console.error("UPDATE TENANT SETTINGS ERROR:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Settings already exist. Please retry.",
            });
        }

        return res.status(500).json({
            message: "Failed to update organization settings",
        });
    }
}

// GET /api/tenant-settings/:tenantId/documents
export async function getTenantDocuments(req, res) {
    try {
        const result = await verifyOwner(req.params.tenantId, req.user.id);

        if (result.error) {
            return res.status(result.status).json({ message: result.error });
        }

        const documents = await TenantDocument.find({
            tenantId: req.params.tenantId,
            kind: "knowledge",
        })
            .select("document createdAt updatedAt")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({ documents });
    } catch (error) {
        console.error("GET TENANT DOCUMENTS ERROR:", error);
        return res.status(500).json({
            message: "Failed to fetch organization documents",
        });
    }
}

// POST /api/tenant-settings/:tenantId/documents
// Creates metadata for a file that has already been uploaded to trusted storage.
export async function createTenantDocument(req, res) {
    try {
        const result = await verifyOwner(req.params.tenantId, req.user.id);

        if (result.error) {
            return res.status(result.status).json({ message: result.error });
        }

        const {
            originalName,
            storageKey,
            fileUrl,
            mimeType,
            size,
        } = req.body;

        if (
            typeof originalName !== "string" ||
            !originalName.trim() ||
            typeof storageKey !== "string" ||
            !storageKey.trim() ||
            typeof mimeType !== "string" ||
            !Number.isFinite(size) ||
            size <= 0
        ) {
            return res.status(400).json({
                message: "Valid document metadata is required",
            });
        }

        const allowedMimeTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ];

        if (!allowedMimeTypes.includes(mimeType)) {
            return res.status(400).json({
                message: "Unsupported document type",
            });
        }

        const document = await TenantDocument.create({
            tenantId: req.params.tenantId,
            kind: "knowledge",
            document: {
                originalName: originalName.trim().slice(0, 255),
                storageKey: storageKey.trim(),
                fileUrl: typeof fileUrl === "string" ? fileUrl : "",
                mimeType,
                size,
                processingStatus: "pending",
            },
        });

        return res.status(201).json({
            message: "Document metadata saved",
            document,
        });
    } catch (error) {
        console.error("CREATE TENANT DOCUMENT ERROR:", error);
        return res.status(500).json({
            message: "Failed to save document metadata",
        });
    }
}

// DELETE /api/tenant-settings/:tenantId/documents/:documentId
export async function deleteTenantDocument(req, res) {
    try {
        const result = await verifyOwner(req.params.tenantId, req.user.id);

        if (result.error) {
            return res.status(result.status).json({ message: result.error });
        }

        if (!validId(req.params.documentId)) {
            return res.status(400).json({ message: "Invalid document ID" });
        }

        const document = await TenantDocument.findOneAndDelete({
            _id: req.params.documentId,
            tenantId: req.params.tenantId,
            kind: "knowledge",
        });

        if (!document) {
            return res.status(404).json({
                message: "Document not found",
            });
        }

        // TODO: Delete the physical file from the configured storage provider.
        return res.status(200).json({
            message: "Document metadata deleted",
        });
    } catch (error) {
        console.error("DELETE TENANT DOCUMENT ERROR:", error);
        return res.status(500).json({
            message: "Failed to delete document",
        });
    }
}
