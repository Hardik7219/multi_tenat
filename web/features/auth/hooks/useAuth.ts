import { getCurrentUserSession, isAuthenticated } from "@/lib/auth/session";
import { useCallback, useEffect, useState } from "react";
import { UserData } from "@/shared/types";
export function useAuth() {
    const [userData, setUserData] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    const checkUserLogin = useCallback(async ()=>{
        try {
            setLoading(true);
            setError("")
            const data = await getCurrentUserSession();
            setUserData(data)
            console.log("hello",data);
            
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to check");
        } finally {
            setLoading(false);
        }
    },[])
    useEffect(()=>{
        checkUserLogin();
    },[checkUserLogin])
    const isAuthenticate= async ()=>{
        try {
            setLoading(true);
            setError("")
            return isAuthenticated();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to check");
        } finally {
            setLoading(false);
        }
    }
    return {
        userData,
        loading,
        isAuthenticate
    }
}