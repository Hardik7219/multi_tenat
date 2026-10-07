import { useState, useCallback } from "react";
import { Tenant, CreateTenantData } from "../../../shared/types";
import { 
    createTenant as apiCreateTenant, 
    getTenant as apiGetTenant,
    updateTenant as apiUpdateTenant,
    deleteTenant as apiDeleteTenant
} from "../../../shared/services/tenat.service";

export function useTenants() {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadTenant = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await apiGetTenant();
            setTenant(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load tenant");
        } finally {
            setLoading(false);
        }
    }, []);

    const createTenant = async (data: CreateTenantData) => {
        try {
            setLoading(true);
            setError("");
            const newTenant = await apiCreateTenant(data);
            setTenant(newTenant);
            return { success: true, tenant: newTenant };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to create tenant";
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    const updateTenant = async (data: Partial<CreateTenantData>) => {
        try {
            setLoading(true);
            setError("");
            const updated = await apiUpdateTenant(data);
            setTenant(updated);
            return { success: true, tenant: updated };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to update tenant";
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    const deleteTenant = async () => {
        try {
            setLoading(true);
            setError("");
            await apiDeleteTenant();
            setTenant(null);
            return { success: true };
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to delete tenant";
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    return {
        tenant,
        loading,
        error,
        createTenant,
        loadTenant,
        updateTenant,
        deleteTenant,
    };
}
