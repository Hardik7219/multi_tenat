import { signIn } from "next-auth/react";

interface UserDetail {
    username: string,
    email: string,
    password: string
}
export async function signupUser({ username, email, password }: UserDetail) {
    const response = await fetch(
        `${process.env.BACKEND_URL}}/api/auth/signup`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                email,
                password,
            }),
        }
    );

    if (!response.ok) {
        const error = await response.json();

        throw new Error(
            error.message || "Signup failed"
        );
    }

    return response.json();
}


export async function signInUser(email: string,
    password: string
) {
    return signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard",
    });
}