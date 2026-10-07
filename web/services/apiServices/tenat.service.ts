export interface Tenant {
    _id: string;
    name: string;
    slug: string;
    email?: string;
    status: "active" | "suspended" | "deleted";
    plan: "free" | "pro" | "enterprise";
    createdAt: string;
    updatedAt: string;
}

export interface CreateTenantData {
    name: string;
    slug: string;
}

export async function createTenant({name,slug}:CreateTenantData
): Promise<Tenant> {
    const url=process.env.BACKEND_URL || "http://localhost:2000";    

    const response = await fetch(`${url}/api/tenats`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({name,slug}),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to create organization"
        );
    }

    return result.tenancy;

}


export async function getTenant(): Promise<Tenant> {

    const response = await fetch("/api/tenants", {
        method: "GET",
        cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to fetch organization"
        );
    }

    return result.tenancy;
}


export async function updateTenant(
    data: Partial<CreateTenantData>
): Promise<Tenant> {

    const response = await fetch("/api/tenants", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to update organization"
        );
    }

    return result.tenancy;
}


export async function deleteTenant(): Promise<void> {

    const response = await fetch("/api/tenants", {
        method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to delete organization"
        );
    }
}