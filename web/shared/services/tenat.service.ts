
import { Tenant, CreateTenantData } from "../types";

const url =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:2000";

function authHeaders(token: string) {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

export async function createTenant(
    { name, slug }: CreateTenantData,
    accessToken: string
): Promise<Tenant> {
    const response = await fetch(`${url}/api/tenants`, {
        method: "POST",
        headers: authHeaders(accessToken),
        body: JSON.stringify({ name, slug }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to create organization");
    }

    return result.tenancy;
}

export async function getTenant(accessToken: string,id:string): Promise<Tenant> {    
    const response = await fetch(`${url}/api/tenants/${id}`, {
        method: "GET",
        cache: "no-store",
        headers: authHeaders(accessToken),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch organization");
    }

    return result.tenancy;
}

// Discover organizations created by other users
export async function getTenants(
    accessToken: string,
    search: string = ""
): Promise<{ tenants: Tenant[]; total: number }> {
    const params = new URLSearchParams();

    if (search.trim()) {
        params.set("search", search.trim());
    }

    const response = await fetch(
        `${url}/api/tenants/discover?${params.toString()}`,
        {
            method: "GET",
            cache: "no-store",
            headers: authHeaders(accessToken),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch organizations");
    }

    return {
        tenants: result.tenants,
        total: result.total,
    };
}

export async function updateTenant(
    data: Partial<CreateTenantData>,
    accessToken: string
): Promise<Tenant> {
    const response = await fetch(`${url}/api/tenants`, {
        method: "PATCH",
        headers: authHeaders(accessToken),
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to update organization");
    }

    return result.tenancy;
}

export async function deleteTenant(accessToken: string): Promise<void> {
    const response = await fetch(`${url}/api/tenants`, {
        method: "DELETE",
        headers: authHeaders(accessToken),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to delete organization");
    }
}
