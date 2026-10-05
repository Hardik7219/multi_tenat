import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"


export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const response = await fetch(`${process.env.BACKEND_URL}/api/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          }
        );
        if (!response.ok) {
          return null;
        }

        const user = await response.json();

        return {
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId
        };
      }
    }),
  ],
  pages: {
    signIn: "/login", // Tells NextAuth to use your custom login page
  },
  session: {
    strategy: "jwt",
  },
})