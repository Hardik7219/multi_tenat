"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { Card } from "../../shared/ui/Card";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });
            if (res?.error) {
                setError("Invalid credentials");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("Something went wrong during login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-white/50">Enter your credentials to access your workspace</p>
                </div>
                <Card>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                            Sign In
                        </Button>
                        <div className="text-center mt-4 text-sm text-white/50">
                            Don't have an account?{" "}
                            <Link href="/signup" className="text-white hover:underline">
                                Sign up
                            </Link>
                        </div>
                    </form>
                </Card>
            </div>
        </main>
    );
}
