import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (process.env.NODE_ENV === "production" && !authSecret) {
  throw new Error("Thiếu AUTH_SECRET hoặc NEXTAUTH_SECRET trong môi trường production.");
}

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

        const users = await prisma.user.findMany({
          where: {
            email: { in: candidateEmails }
          },
          include: { role: true, employee: true },
          orderBy: { createdAt: "asc" },
        });

        const user =
          users.find((u) => u.email.toLowerCase() === rawEmail) || users[0];

        if (!user) {
          return null;
        }

        if (user.employee && (user.employee.status === "RESIGNED" || user.employee.status === "SUSPENDED")) {
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
          employeeId: user.employee?.id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sub = user.id;
        token.roleId = (user as any).roleId;
        token.roleName = (user as any).roleName;
        token.employeeId = (user as any).employeeId;
        token.revoked = false;
        return token;
      }

      if (token?.id || token?.email) {
        try {
          const selectFields = {
            id: true,
            name: true,
            email: true,
            roleId: true,
            role: { select: { name: true } },
            employee: { select: { id: true, status: true } },
          };

          let freshUser = token?.id
            ? await prisma.user.findUnique({
                where: { id: token.id as string },
                select: selectFields,
              })
            : null;

          // Tự động phục hồi phiên (Self-healing session) theo email nếu CSDL vừa được seed lại làm đổi cuid
          if (!freshUser && token?.email) {
            const rawEmail = String(token.email).trim().toLowerCase();
            freshUser = await prisma.user.findFirst({
              where: {
                email: {
                  in: [
                    rawEmail,
                    rawEmail.replace(/@nexustech\.vn$/, "@hrmis.com"),
                    rawEmail.replace(/@hrmis\.com$/, "@nexustech.vn"),
                  ],
                },
              },
              select: selectFields,
            });
          }

          if (
            !freshUser ||
            (freshUser.employee &&
              (freshUser.employee.status === "RESIGNED" ||
                freshUser.employee.status === "SUSPENDED"))
          ) {
            token.revoked = true;
            return token;
          }

          token.id = freshUser.id;
          token.sub = freshUser.id;
          token.name = freshUser.name;
          token.email = freshUser.email;
          token.roleId = freshUser.roleId;
          token.roleName = freshUser.role?.name || "USER";
          token.employeeId = freshUser.employee?.id;
          token.revoked = false;
        } catch {
          // Giữ nguyên token hiện tại nếu kết nối DB tạm thời gián đoạn ở tầng edge/proxy
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.revoked) {
        if (session?.user) {
          (session.user as any).id = "";
          (session.user as any).revoked = true;
        }
        return null as any;
      }
      if (token && session.user) {
        session.user.id = (token.id || token.sub || "") as string;
        (session.user as any).roleId = token.roleId;
        (session.user as any).roleName = token.roleName || "USER";
        (session.user as any).employeeId = token.employeeId;
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
  secret: authSecret || "local-development-only-secret-change-before-deployment",
});
