import { auth } from "@/auth";


export async function getCurrentUserSession() {
    const session = await auth();
    return session?.user ?? null;
}

export async function isAuthenticated() {
    const session = await auth();
    if(!session) return false
    return !!session?.user;
}