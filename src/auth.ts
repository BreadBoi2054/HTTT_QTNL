import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const rawEmail = (credentials.email as string).trim().toLowerCase();
        // Cho phép đăng nhập linh hoạt bằng cả tên miền @nexustech.vn và @hrmis.com
        const candidateEmails = [
          rawEmail,
          rawEmail.replace(/@nexustech\.vn$/, "@hrmis.com"),
          rawEmail.replace(/@hrmis\.com$/, "@nexustech.vn")
        ];

        const user = await prisma.user.findFirst({
          where: {
            email: { in: candidateEmails }
          },
          include: { role: true },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.roleId,
          roleName: user.role?.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roleId = (user as any).roleId;
        token.roleName = (user as any).roleName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).roleId = token.roleId;
        (session.user as any).roleName = token.roleName;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET || "SUPER_SECRET_KEY_FOR_DEVELOPMENT_ONLY_DO_NOT_USE_IN_PROD",
});
