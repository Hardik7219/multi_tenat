
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import {
    TenantSettings,
    TenantDocument,
    getTenantSettings,
    updateTenantSettings,
    getTenantDocuments,
    deleteTenantDocument,
} from "../../../shared/services/tenantSettings.service";

const DEFAULT_SETTINGS: Omit<TenantSettings, "_id" | "tenantId"> = {
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

export function useTenantSettings(tenantId: string) {
    const { data: session } = useSession();

    const accessToken = session?.user?.accessToken as string | undefined;

    const [settings, setSettings] = useState<TenantSettings | null>(null);
    const [documents, setDocuments] = useState<TenantDocument[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadSettings = useCallback(async () => {
        if (!accessToken || !tenantId) return;

        try {
            setLoading(true);
            setError("");

            const [settingsResult, documentsResult] = await Promise.all([
                getTenantSettings(tenantId, accessToken),
                getTenantDocuments(tenantId, accessToken),
            ]);

            setSettings({
                ...DEFAULT_SETTINGS,
                ...settingsResult,
                profile: {
                    ...DEFAULT_SETTINGS.profile,
                    ...settingsResult.profile,
                },
                ai: {
                    ...DEFAULT_SETTINGS.ai,
                    ...settingsResult.ai,
                },
                support: {
                    ...DEFAULT_SETTINGS.support,
                    ...settingsResult.support,
                },
                policies: {
                    ...DEFAULT_SETTINGS.policies,
                    ...settingsResult.policies,
                },
            });

            setDocuments(documentsResult);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load settings"
            );
        } finally {
            setLoading(false);
        }
    }, [accessToken, tenantId]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const saveSettings = async (data: Partial<
        Pick<TenantSettings, "profile" | "ai" | "support" | "policies">
    >) => {
        if (!accessToken || !tenantId) {
            return { success: false, error: "Organization or session missing" };
        }

        try {
            setSaving(true);
            setError("");

            const updated = await updateTenantSettings(
                tenantId,
                data,
                accessToken
            );

            setSettings((current) => ({
                ...DEFAULT_SETTINGS,
                ...current,
                ...updated,
                profile: { ...current?.profile, ...updated.profile },
                ai: { ...current?.ai, ...updated.ai },
                support: { ...current?.support, ...updated.support },
                policies: { ...current?.policies, ...updated.policies },
            }));

            return { success: true };
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to save settings";

            setError(message);
            return { success: false, error: message };
        } finally {
            setSaving(false);
        }
    };

    const removeDocument = async (documentId: string) => {
        if (!accessToken || !tenantId) {
            return { success: false, error: "Organization or session missing" };
        }

        try {
            await deleteTenantDocument(tenantId, documentId, accessToken);

            setDocuments((current) =>
                current.filter((document) => document._id !== documentId)
            );

            return { success: true };
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to delete document";

            setError(message);
            return { success: false, error: message };
        }
    };

    return {
        settings,
        documents,
        loading,
        saving,
        error,
        setError,
        loadSettings,
        saveSettings,
        removeDocument,
    };
}
