import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string;
    tenantId?: string | null;
    accessToken?: string;
  }
  
  interface Session {
    user: {
      id?: string;
      username?: string;
      role?: string;
      tenantId?: string | null;
      accessToken?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: string;
    tenantId?: string | null;
    accessToken?: string;
  }
}
