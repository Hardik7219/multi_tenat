import { TenantSettings, TenantDocument } from "../types/tenantSetting.types";
const API_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:2000";



async function request<T>(
    path: string,
    accessToken: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_URL}/api/tenant-settings${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            ...options.headers,
        },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(result.message || "Request failed");
    }

    return result as T;
}

export async function getTenantSettings(
    tenantId: string,
    accessToken: string
): Promise<TenantSettings> {
    const result = await request<{ settings: TenantSettings }>(
        `/${tenantId}`,
        accessToken
    );

    return result.settings;
}

export async function updateTenantSettings(
    tenantId: string,
    data: Partial<
        Pick<TenantSettings, "profile" | "ai" | "support" | "policies">
    >,
    accessToken: string
): Promise<TenantSettings> {
    const result = await request<{ settings: TenantSettings }>(
        `/${tenantId}`,
        accessToken,
        {
            method: "PATCH",
            body: JSON.stringify(data),
        }
    );

    return result.settings;
}

export async function getTenantDocuments(
    tenantId: string,
    accessToken: string
): Promise<TenantDocument[]> {
    const result = await request<{ documents: TenantDocument[] }>(
        `/${tenantId}/documents`,
        accessToken
    );

    return result.documents;
}

export async function createTenantDocument(
    tenantId: string,
    data: {
        originalName: string;
        storageKey: string;
        fileUrl?: string;
        mimeType: string;
        size: number;
    },
    accessToken: string
): Promise<TenantDocument> {
    const result = await request<{ document: TenantDocument }>(
        `/${tenantId}/documents`,
        accessToken,
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );

    return result.document;
}

export async function deleteTenantDocument(
    tenantId: string,
    documentId: string,
    accessToken: string
): Promise<void> {
    await request(
        `/${tenantId}/documents/${documentId}`,
        accessToken,
        { method: "DELETE" }
    );
}
