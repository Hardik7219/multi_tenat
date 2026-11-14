
"use client";

import { useEffect, useState } from "react";
import { Building2, Bot, Clock, FileText, Save, Settings2 } from "lucide-react";

import { useTenants } from "../../features/tenants/hooks/useTenants";
import { useTenantSettings } from "../../features/tenantSettings/hooks/useTenantSettings";
import { SettingsSection } from "../../features/tenantSettings/components/SettingsSection";
import { DocumentList } from "../../features/tenantSettings/components/DocumentList";

import type { TenantSettings } from "@/shared/types/tenantSetting.types"

const inputClass =
    "w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-blue-500";

const labelClass = "block text-sm text-white/70 mb-2";

export default function SettingsPage() {
    const {
        myTenants,
        loading: tenantsLoading,
        error: tenantsError,
        loadMyTenants,
        updateTenant,
    } = useTenants();

    const [selectedTenantId, setSelectedTenantId] = useState("");
    const [organizationName, setOrganizationName] = useState("");
    const [organizationSlug, setOrganizationSlug] = useState("");
    const [organizationSaving, setOrganizationSaving] = useState(false);

    const {
        settings,
        documents,
        loading,
        saving,
        error,
        setError,
        saveSettings,
        removeDocument,
    } = useTenantSettings(selectedTenantId);

    const [success, setSuccess] = useState("");
    const [localSettings, setLocalSettings] =
        useState<TenantSettings | null>(null);

    const selectedTenant = myTenants.find(
        (tenant) => tenant._id === selectedTenantId
    );

    useEffect(() => {
        loadMyTenants();
    }, [loadMyTenants]);

    useEffect(() => {
        if (!selectedTenantId && myTenants.length > 0) {
            setSelectedTenantId(myTenants[0]._id);
        }
    }, [myTenants, selectedTenantId]);

    useEffect(() => {
        if (selectedTenant) {
            setOrganizationName(selectedTenant.name);
            setOrganizationSlug(selectedTenant.slug);
        }
    }, [selectedTenant]);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const updateSection = (
        section: "profile" | "ai" | "support" | "policies",
        field: string,
        value: string | boolean
    ) => {
        setLocalSettings((current) => {
            if (!current) return current;

            return {
                ...current,
                [section]: {
                    ...current[section],
                    [field]: value,
                },
            } as TenantSettings;
        });
    };

    const handleOrganizationSave = async () => {
        if (!selectedTenantId) return;

        setOrganizationSaving(true);
        setError("");
        setSuccess("");

        const result = await updateTenant(
            {
                name: organizationName,
                slug: organizationSlug,
            },
            selectedTenantId
        );

        if (result.success) {
            setSuccess("Organization details updated successfully.");
            await loadMyTenants();
        } else {
            setError(result.error || "Failed to update organization.");
        }

        setOrganizationSaving(false);
    };

    const handleSaveSection = async (
        section: "profile" | "ai" | "support" | "policies"
    ) => {
        if (!localSettings) return;

        setSuccess("");
        setError("");

        const result = await saveSettings({
            [section]: localSettings[section],
        });

        if (result.success) {
            setSuccess("Settings saved successfully.");
        } else {
            setError(result.error || "Failed to save settings.");
        }
    };

    const handleDeleteDocument = async (documentId: string) => {
        const confirmed = window.confirm(
            "Delete this document record?"
        );

        if (!confirmed) return;

        const result = await removeDocument(documentId);

        if (result.success) {
            setSuccess("Document record deleted.");
        }
    };

    if (tenantsLoading && myTenants.length === 0) {
        return (
            <main className="flex min-h-screen items-center justify-center text-white">
                Loading organizations...
            </main>
        );
    }

    if (tenantsError) {
        return (
            <main className="p-8 text-red-400">
                {tenantsError}
            </main>
        );
    }

    if (myTenants.length === 0) {
        return (
            <main className="min-h-screen p-6 md:p-10 text-white">
                <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 p-8">
                    <Building2 size={32} className="text-blue-400 mb-4" />
                    <h1 className="text-2xl font-bold">
                        No organization found
                    </h1>
                    <p className="text-white/50 mt-2">
                        Create an organization before configuring its settings.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-5 md:p-10 text-white">
            <div className="max-w-5xl mx-auto space-y-8">

                <header>
                    <h1 className="text-3xl font-bold">
                        Organization Settings
                    </h1>
                    <p className="text-white/50 mt-2">
                        Manage your organization, AI support and policies.
                    </p>
                </header>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <label className={labelClass}>
                        Select organization
                    </label>

                    <select
                        className={inputClass}
                        value={selectedTenantId}
                        onChange={(event) =>
                            setSelectedTenantId(event.target.value)
                        }
                    >
                        {myTenants.map((tenant) => (
                            <option
                                key={tenant._id}
                                value={tenant._id}
                                className="bg-gray-900"
                            >
                                {tenant.name}
                            </option>
                        ))}
                    </select>
                </div>

                {(error || success) && (
                    <div
                        className={`rounded-xl px-4 py-3 text-sm ${error
                                ? "border border-red-500/20 bg-red-500/10 text-red-400"
                                : "border border-green-500/20 bg-green-500/10 text-green-400"
                            }`}
                    >
                        {error || success}
                    </div>
                )}

                {loading && !localSettings ? (
                    <div className="py-16 text-center text-white/50">
                        Loading organization settings...
                    </div>
                ) : localSettings && (
                    <>
                        <SettingsSection
                            title="Organization Profile"
                            description="Basic information about your organization."
                        >
                            <div>
                                <label className={labelClass}>
                                    Organization name
                                </label>
                                <input
                                    className={inputClass}
                                    value={organizationName}
                                    onChange={(e) =>
                                        setOrganizationName(e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Organization slug
                                </label>
                                <input
                                    className={inputClass}
                                    value={organizationSlug}
                                    onChange={(e) =>
                                        setOrganizationSlug(e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Business description
                                </label>
                                <textarea
                                    rows={3}
                                    className={inputClass}
                                    value={localSettings.profile.description}
                                    onChange={(e) =>
                                        updateSection(
                                            "profile",
                                            "description",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>
                                        Business category
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={localSettings.profile.category}
                                        onChange={(e) =>
                                            updateSection(
                                                "profile",
                                                "category",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Website
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={localSettings.profile.website}
                                        onChange={(e) =>
                                            updateSection(
                                                "profile",
                                                "website",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Contact email
                                    </label>
                                    <input
                                        type="email"
                                        className={inputClass}
                                        value={localSettings.profile.contactEmail}
                                        onChange={(e) =>
                                            updateSection(
                                                "profile",
                                                "contactEmail",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Contact phone
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={localSettings.profile.contactPhone}
                                        onChange={(e) =>
                                            updateSection(
                                                "profile",
                                                "contactPhone",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleOrganizationSave}
                                disabled={organizationSaving}
                                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
                            >
                                <Save size={16} className="inline mr-2" />
                                {organizationSaving
                                    ? "Saving..."
                                    : "Save organization"}
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSaveSection("profile")}
                                disabled={saving}
                                className="ml-2 rounded-xl border border-white/10 px-5 py-3 text-sm hover:bg-white/5 disabled:opacity-50"
                            >
                                Save profile details
                            </button>
                        </SettingsSection>

                        <SettingsSection
                            title="AI Support Configuration"
                            description="Control how the AI communicates with your customers."
                        >
                            <label className="flex items-center justify-between gap-4">
                                <span>
                                    <span className="block text-sm text-white">
                                        Enable AI support
                                    </span>
                                    <span className="text-xs text-white/40">
                                        Allow the AI support engine to process tickets.
                                    </span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={localSettings.ai.enabled}
                                    onChange={(e) =>
                                        updateSection(
                                            "ai",
                                            "enabled",
                                            e.target.checked
                                        )
                                    }
                                    className="size-5 accent-blue-500"
                                />
                            </label>

                            <label className="flex items-center justify-between gap-4">
                                <span>
                                    <span className="block text-sm text-white">
                                        Automatic responses
                                    </span>
                                    <span className="text-xs text-white/40">
                                        Allow AI to send responses without manual approval.
                                    </span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={localSettings.ai.autoRespond}
                                    onChange={(e) =>
                                        updateSection(
                                            "ai",
                                            "autoRespond",
                                            e.target.checked
                                        )
                                    }
                                    className="size-5 accent-blue-500"
                                />
                            </label>

                            <label className="flex items-center justify-between gap-4">
                                <span>
                                    <span className="block text-sm text-white">
                                        Require review for uncertain answers
                                    </span>
                                    <span className="text-xs text-white/40">
                                        Prefer review instead of guessing.
                                    </span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={
                                        localSettings.ai.requireReviewForUncertain
                                    }
                                    onChange={(e) =>
                                        updateSection(
                                            "ai",
                                            "requireReviewForUncertain",
                                            e.target.checked
                                        )
                                    }
                                    className="size-5 accent-blue-500"
                                />
                            </label>

                            <div>
                                <label className={labelClass}>
                                    Response tone
                                </label>
                                <select
                                    className={inputClass}
                                    value={localSettings.ai.tone}
                                    onChange={(e) =>
                                        updateSection(
                                            "ai",
                                            "tone",
                                            e.target.value as
                                            | "professional"
                                            | "friendly"
                                            | "concise"
                                        )
                                    }
                                >
                                    <option value="professional">
                                        Professional
                                    </option>
                                    <option value="friendly">Friendly</option>
                                    <option value="concise">Concise</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Additional AI instructions
                                </label>
                                <textarea
                                    rows={5}
                                    className={inputClass}
                                    placeholder="Describe how your AI should communicate and support customers..."
                                    value={localSettings.ai.instructions}
                                    onChange={(e) =>
                                        updateSection(
                                            "ai",
                                            "instructions",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => handleSaveSection("ai")}
                                disabled={saving}
                                className="rounded-xl bg-blue-600 px-5 py-3 text-sm hover:bg-blue-500 disabled:opacity-50"
                            >
                                <Bot size={16} className="inline mr-2" />
                                Save AI settings
                            </button>
                        </SettingsSection>

                        <SettingsSection
                            title="Support Preferences"
                            description="Configure support contact details and working hours."
                        >
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>
                                        Support email
                                    </label>
                                    <input
                                        type="email"
                                        className={inputClass}
                                        value={localSettings.support.supportEmail}
                                        onChange={(e) =>
                                            updateSection(
                                                "support",
                                                "supportEmail",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Timezone
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={localSettings.support.timezone}
                                        onChange={(e) =>
                                            updateSection(
                                                "support",
                                                "timezone",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Business hours
                                </label>
                                <textarea
                                    rows={3}
                                    className={inputClass}
                                    placeholder="Monday-Friday, 9 AM to 6 PM"
                                    value={localSettings.support.businessHours}
                                    onChange={(e) =>
                                        updateSection(
                                            "support",
                                            "businessHours",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => handleSaveSection("support")}
                                disabled={saving}
                                className="rounded-xl bg-blue-600 px-5 py-3 text-sm hover:bg-blue-500 disabled:opacity-50"
                            >
                                <Clock size={16} className="inline mr-2" />
                                Save support preferences
                            </button>
                        </SettingsSection>

                        <SettingsSection
                            title="Policies and Terms"
                            description="Provide the rules and policies that your AI will use when answering customer questions."
                        >
                            {([
                                ["termsAndConditions", "Terms and conditions"],
                                ["refundPolicy", "Refund policy"],
                                ["cancellationPolicy", "Cancellation policy"],
                                ["returnPolicy", "Return policy"],
                                ["warrantyPolicy", "Warranty policy"],
                                ["additionalRules", "Additional support rules"],
                            ] as const).map(([field, title]) => (
                                <div key={field}>
                                    <label className={labelClass}>
                                        {title}
                                    </label>
                                    <textarea
                                        rows={4}
                                        className={inputClass}
                                        value={localSettings.policies[field]}
                                        onChange={(e) =>
                                            updateSection(
                                                "policies",
                                                field,
                                                e.target.value
                                            )
                                        }
                                        placeholder={`Enter your ${title.toLowerCase()}...`}
                                    />
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => handleSaveSection("policies")}
                                disabled={saving}
                                className="rounded-xl bg-blue-600 px-5 py-3 text-sm hover:bg-blue-500 disabled:opacity-50"
                            >
                                <FileText size={16} className="inline mr-2" />
                                Save policies
                            </button>
                        </SettingsSection>

                        <SettingsSection
                            title="Knowledge Base"
                            description="Documents associated with this organization."
                        >
                            <DocumentList
                                documents={documents}
                                onDelete={handleDeleteDocument}
                            />

                            <p className="text-xs text-white/40">
                                File upload, text extraction, and AI indexing
                                are not connected yet. This section currently
                                displays and manages existing document records.
                            </p>
                        </SettingsSection>
                    </>
                )}
            </div>
        </main>
    );
}
