import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      roleName?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    roleName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roleName?: string;
  }
}
