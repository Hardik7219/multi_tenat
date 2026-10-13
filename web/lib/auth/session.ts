import { auth } from "@/auth";


export async function getCurrentUserSession() {
    const session = await auth();

    console.log("========== SESSION ==========");
    console.log(session);
    console.log("USER:", session?.user);
    console.log("=============================");

    return session?.user ?? null;
}

export async function isAuthenticated() {
    const session = await auth();
    if(!session) return false
    return !!session?.user;
}