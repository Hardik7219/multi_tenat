import { signIn } from "next-auth/react";

interface UserDetail {
    username: string,
    email: string,
    password: string
}
export async function signupUser(formData:UserDetail) {
    const url=process.env.BACKEND_URL || "http://localhost:2000";    
    const response = await fetch(
        `${url}/api/auth/signup`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username:formData.username,
                email:formData.email,
                password:formData.password
            }),
        }
    );
    console.log(response);

    if (!response.ok) {
        const error = await response.json();

        throw new Error(
            error.message || "Signup failed"
        );
    }
    console.log(response)
    return response.json();
}


export async function signInUser(email: string,
    password: string
) {    
    return signIn("credentials", {
        email,
        password,
        redirect: false,
    });
}