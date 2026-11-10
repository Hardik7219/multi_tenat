"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupUser } from "@/shared/services/auth.service";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Card } from "@/shared/ui/Card";
import { Building2, User } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
    const router = useRouter();
    const [role, setRole] = useState<"organization" | "customer" | null>(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await signupUser({ username, email, password,});
            
                router.push("/login");

        } catch (err) {
            setError(err instanceof Error ? err.message : "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    // if (!role) {
    //     return (
    //         <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-white">
    //             <div className="text-center mb-10">
    //                 <h1 className="text-4xl font-bold tracking-tight mb-2">Join MultiTenant</h1>
    //                 <p className="text-white/50">How would you like to use the platform?</p>
    //             </div>
    //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
    //                 <Card onClick={() => setRole("organization")} className="flex flex-col items-center text-center gap-4 py-10 cursor-pointer border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition">
    //                     <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
    //                         <Building2 size={32} />
    //                     </div>
    //                     <div>
    //                         <h3 className="text-xl font-semibold">I am an Organization</h3>
    //                         <p className="mt-2 text-sm text-white/50 px-4">I want to create a workspace and manage customer support tickets.</p>
    //                     </div>
    //                 </Card>
    //                 <Card onClick={() => setRole("customer")} className="flex flex-col items-center text-center gap-4 py-10 cursor-pointer border-white/10 hover:border-green-500/50 hover:bg-green-500/5 transition">
    //                     <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
    //                         <User size={32} />
    //                     </div>
    //                     <div>
    //                         <h3 className="text-xl font-semibold">I am a Customer</h3>
    //                         <p className="mt-2 text-sm text-white/50 px-4">I want to join an existing workspace to submit and track tickets.</p>
    //                     </div>
    //                 </Card>
    //             </div>
    //             <div className="mt-8 text-sm text-white/50">
    //                 Already have an account? <Link href="/login" className="text-white hover:underline">Log in</Link>
    //             </div>
    //         </main>
    //     );
    // }

    return (
        <main className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Create Account</h1>
                    <p className="text-white/50">
                        Joining as {role === "organization" ? "an Organization" : "a Customer"}
                        <button onClick={() => setRole(null)} className="ml-2 text-blue-400 hover:underline">Change</button>
                    </p>
                </div>
                <Card>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <Input
                            label="Username"
                            type="text"
                            placeholder="johndoe"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                            required
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                        {error && <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">{error}</div>}
                        <Button type="submit" isLoading={loading} className="w-full mt-2" size="lg">
                            Sign Up
                        </Button>
                    </form>
                </Card>
            </div>
        </main>
    );
}
