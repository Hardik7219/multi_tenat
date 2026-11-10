export async function signupUser(formData: { username?: string, email?: string, password?: string }) {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:2000";    
    const response = await fetch(`${url}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Signup failed");
    }
    return response.json();
}