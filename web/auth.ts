import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const url =
          process.env.BACKEND_URL || "http://localhost:2000";

        const response = await fetch(
          `${url}/api/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          }
        );

        if (!response.ok) {
         return null
        }

        const user = await response.json();

        return {
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          accessToken: user.accessToken,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      // This runs when the user first logs in
      if (user) {
        token.id = user.id;
        token.username = user.name as string;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.accessToken = user.accessToken;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.username = token.username;
      session.user.role = token.role;
      session.user.tenantId = token.tenantId;

      return session;
    },
  },
});