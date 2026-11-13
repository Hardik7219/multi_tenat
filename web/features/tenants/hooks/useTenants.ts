
import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";

import { Tenant, CreateTenantData } from "../../../shared/types";

import {
    createTenant as apiCreateTenant,
    getTenant as apiGetTenant,
    getTenants as apiGetTenants,
    getMyTenants as apiGetMyTenants,
    updateTenant as apiUpdateTenant,
    deleteTenant as apiDeleteTenant,
} from "../../../shared/services/tenat.service";

export function useTenants() {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [myTenants, setMyTenants] = useState<Tenant[]>([]);

    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { data: session } = useSession();

    const accessToken = session?.user?.accessToken as
        | string
        | undefined;

    const loadTenant = useCallback(async (id: string) => {
        if (!accessToken || !id) return;

        try {
            setLoading(true);
            setError("");

            const data = await apiGetTenant(accessToken, id);
            setTenant(data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load organization"
            );
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    const loadMyTenants = useCallback(async () => {
        if (!accessToken) return;

        try {
            setLoading(true);
            setError("");

            const data = await apiGetMyTenants(accessToken);
            setMyTenants(data.tenants);

            return data.tenants;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to load organizations";

            setError(message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    const loadTenants = useCallback(async (search = "") => {
        if (!accessToken) return;

        try {
            setLoading(true);
            setError("");

            const data = await apiGetTenants(accessToken, search);
            setTenants(data.tenants);
            setTotal(data.total);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to discover organizations"
            );
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    const createTenant = async (data: CreateTenantData) => {
        if (!accessToken) {
            return { success: false, error: "Not authenticated" };
        }

        try {
            setLoading(true);
            setError("");

            const newTenant = await apiCreateTenant(data, accessToken);

            setTenant(newTenant);
            setMyTenants((current) => [...current, newTenant]);

            return { success: true, tenant: newTenant };
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to create organization";

            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const updateTenant = async (
        data: Partial<CreateTenantData>,
        tenantId: string
    ) => {
        if (!accessToken) {
            return { success: false, error: "Not authenticated" };
        }

        try {
            setLoading(true);
            setError("");

            const updated = await apiUpdateTenant(data, accessToken, tenantId);

            setTenant(updated);
            setMyTenants((current) =>
                current.map((item) =>
                    item._id === tenantId ? updated : item
                )
            );

            return { success: true, tenant: updated };
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to update organization";

            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const deleteTenant = async (tenantId: string) => {
        if (!accessToken) {
            return { success: false, error: "Not authenticated" };
        }

        try {
            setLoading(true);
            setError("");

            await apiDeleteTenant(accessToken, tenantId);

            setTenant((current) =>
                current?._id === tenantId ? null : current
            );
            setMyTenants((current) =>
                current.filter((item) => item._id !== tenantId)
            );

            return { success: true };
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to delete organization";

            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    return {
        tenant,
        tenants,
        myTenants,
        total,
        loading,
        error,
        createTenant,
        loadTenant,
        loadMyTenants,
        loadTenants,
        updateTenant,
        deleteTenant,
    };
}
