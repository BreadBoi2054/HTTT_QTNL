import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/login");
  const isProtectedPage = pathname.startsWith("/dashboard");

  // Ngăn user chưa đăng nhập vào dashboard
  if (isProtectedPage && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Ngăn user đã đăng nhập vào lại trang login
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Phân quyền truy cập đa tầng theo vai trò (Role-Based Route Protection)
  if (isProtectedPage && session) {
    const userRole = (session.user as any)?.roleName || "USER";

    // Phân hệ Quản trị vai trò & Phân quyền: Độc quyền cho SYSTEM_ADMIN
    if (pathname.startsWith("/dashboard/roles") && userRole !== "SYSTEM_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Các phân hệ quản trị dành riêng cho cấp Quản lý / Điều hành (SYSTEM_ADMIN, HR, MANAGER)
    const adminManagementOnlyPaths = [
      "/dashboard/departments",
      "/dashboard/employees",
      "/dashboard/contracts",
      "/dashboard/recruitment",
      "/dashboard/personnel-changes",
      "/dashboard/cadre-planning",
      "/dashboard/audit-workflow"
    ];

    if (userRole === "USER" && adminManagementOnlyPaths.some(p => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
