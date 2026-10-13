import { getCurrentUserSession, isAuthenticated } from "@/lib/auth/session";
import { useCallback, useEffect, useState } from "react";
import { UserData } from "@/shared/types";
import { signupUser } from "@/shared/services/auth.service";
import { useRouter } from "next/router";
export function useAuth() {
    const [userData, setUserData] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const checkUserLogin = useCallback(async () => {
        try {
            setLoading(true);
            setError("")
            const data = await getCurrentUserSession();
            setUserData(data)
            console.log("hello", data);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to check");
        } finally {
            setLoading(false);
        }
    }, [])
    useEffect(() => {
        checkUserLogin();
    }
        , [checkUserLogin])
    const isAuthenticate = async () => {
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


// export function useSignup(username:string,email: string, password: string,role:string) {
//     const router = useRouter();
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);
//     const createUser = async () => {
//         setError("");
//         setLoading(true);
//         try {
//             await signupUser({ username, email, password, role: role || "customer" });

//             if (role === "organization") {
//                 // If org, they need to log in and create a tenant
//                 router.push("/login?setup=true");
//             } else {
//                 router.push("/login");
//             }
//         } catch (err) {
//             setError(err instanceof Error ? err.message : "Signup failed");
//         } finally {
//             setLoading(false);
//         }
//     }
// }