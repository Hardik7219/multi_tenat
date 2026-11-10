import { useSession } from "next-auth/react";

export function useAuth() {
    const { data: session, status } = useSession();
    const loading = status === "loading";
    const userData = session?.user ?? null;

    return {
        userData,
        loading,
        session,
    };
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