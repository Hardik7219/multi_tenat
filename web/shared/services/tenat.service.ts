
import { Tenant, CreateTenantData } from "../types";

const url =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:2000";

function authHeaders(token: string) {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

async function parseResponse<T>(response: Response): Promise<T> {
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(result.message || "Organization request failed");
    }

    return result as T;
}

export async function createTenant(
    data: CreateTenantData,
    accessToken: string
): Promise<Tenant> {
    const response = await fetch(`${url}/api/tenants`, {
        method: "POST",
        headers: authHeaders(accessToken),
        body: JSON.stringify(data),
    });

    const result = await parseResponse<{ tenancy: Tenant }>(response);
    return result.tenancy;
}

export async function getTenant(
    accessToken: string,
    id: string
): Promise<Tenant> {
    const response = await fetch(`${url}/api/tenants/${id}`, {
        cache: "no-store",
        headers: authHeaders(accessToken),
    });

    const result = await parseResponse<{ tenancy: Tenant }>(response);
    return result.tenancy;
}

export async function getMyTenants(
    accessToken: string
): Promise<{ tenants: Tenant[]; total: number }> {
    const response = await fetch(`${url}/api/tenants/mine`, {
        cache: "no-store",
        headers: authHeaders(accessToken),
    });

    const result = await parseResponse<{
        tenants: Tenant[];
        total: number;
    }>(response);

    return result;
}

export async function getTenants(
    accessToken: string,
    search = ""
): Promise<{ tenants: Tenant[]; total: number }> {
    const params = new URLSearchParams();

    if (search.trim()) {
        params.set("search", search.trim());
    }

    const response = await fetch(
        `${url}/api/tenants/discover?${params.toString()}`,
        {
            cache: "no-store",
            headers: authHeaders(accessToken),
        }
    );

    return parseResponse(response);
}

export async function updateTenant(
    data: Partial<CreateTenantData>,
    accessToken: string,
    tenantId: string
): Promise<Tenant> {
    const response = await fetch(`${url}/api/tenants`, {
        method: "PATCH",
        headers: authHeaders(accessToken),
        body: JSON.stringify({ ...data, tenantId }),
    });

    const result = await parseResponse<{ tenancy: Tenant }>(response);
    return result.tenancy;
}

export async function deleteTenant(
    accessToken: string,
    tenantId: string
): Promise<void> {
    const response = await fetch(`${url}/api/tenants`, {
        method: "DELETE",
        headers: authHeaders(accessToken),
        body: JSON.stringify({ tenantId }),
    });

    await parseResponse(response);
}
