
import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";

import { Tenant, CreateTenantData } from "../../../shared/types";

import {
    createTenant as apiCreateTenant,
    getTenant as apiGetTenant,
    getTenants as apiGetTenants,
    updateTenant as apiUpdateTenant,
    deleteTenant as apiDeleteTenant,
} from "../../../shared/services/tenat.service";

export function useTenants() {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [tenants, setTenants] = useState<Tenant[]>([]);

    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { data: session } = useSession();

    const accessToken = session?.user?.accessToken as
        | string
        | undefined;

    // Fetch current user's organization
    const loadTenant = useCallback(async (id:string) => {
        if (!accessToken) return;
        
        try {
            setLoading(true);
            setError("");

            const data = await apiGetTenant(accessToken,id);
            console.log("hello");
            setTenant(data);
            
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load tenant"
            );
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    // Fetch organizations created by other users
    const loadTenants = useCallback(
        async (search: string = "") => {
            if (!accessToken) return;

            try {
                setLoading(true);
                setError("");

                const data = await apiGetTenants(
                    accessToken,
                    search
                );

                setTenants(data.tenants);
                setTotal(data.total);

            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to load organizations";

                setError(message);
            } finally {
                setLoading(false);
            }
        },
        [accessToken]
    );

    // Create organization
    const createTenant = async (data: CreateTenantData) => {
        if (!accessToken) {
            return {
                success: false,
                error: "Not authenticated",
            };
        }

        try {
            setLoading(true);
            setError("");

            const newTenant = await apiCreateTenant(
                data,
                accessToken
            );

            setTenant(newTenant);

            return {
                success: true,
                tenant: newTenant,
            };
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to create tenant";

            setError(message);

            return {
                success: false,
                error: message,
            };
        } finally {
            setLoading(false);
        }
    };

    // Update organization
    const updateTenant = async (
        data: Partial<CreateTenantData>
    ) => {
        if (!accessToken) {
            return {
                success: false,
                error: "Not authenticated",
            };
        }

        try {
            setLoading(true);
            setError("");

            const updated = await apiUpdateTenant(
                data,
                accessToken
            );

            setTenant(updated);

            return {
                success: true,
                tenant: updated,
            };
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to update tenant";

            setError(message);

            return {
                success: false,
                error: message,
            };
        } finally {
            setLoading(false);
        }
    };

    // Delete organization
    const deleteTenant = async () => {
        if (!accessToken) {
            return {
                success: false,
                error: "Not authenticated",
            };
        }

        try {
            setLoading(true);
            setError("");

            await apiDeleteTenant(accessToken);

            setTenant(null);

            return { success: true };
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to delete tenant";

            setError(message);

            return {
                success: false,
                error: message,
            };
        } finally {
            setLoading(false);
        }
    };

    return {
        tenant,
        tenants,
        total,
        loading,
        error,

        createTenant,
        loadTenant,
        loadTenants,
        updateTenant,
        deleteTenant,
    };
}
