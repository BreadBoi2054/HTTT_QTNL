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

  // 3. Phân quyền truy cập đa tầng theo 6 vai trò (Role-Based Route Protection)
  if (isProtectedPage && session) {
    const userRole = (session.user as any)?.roleName || "USER";

    // Phân hệ Quản trị vai trò & Phân quyền: Độc quyền cho SYSTEM_ADMIN và BOD
    if (pathname.startsWith("/dashboard/roles") && !["SYSTEM_ADMIN", "BOD"].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Phân hệ cấu hình hệ thống: SYSTEM_ADMIN và BOD
    if (pathname.startsWith("/dashboard/settings") && !["SYSTEM_ADMIN", "BOD"].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Các phân hệ quản trị dành riêng cho cấp Quản lý / Điều hành (chặn USER)
    const adminManagementOnlyPaths = [
      "/dashboard/roles",
      "/dashboard/settings",
      "/dashboard/departments",
      "/dashboard/employees",
      "/dashboard/contracts",
      "/dashboard/recruitment",
      "/dashboard/personnel-changes",
      "/dashboard/cadre-planning",
      "/dashboard/audit-workflow",
      "/dashboard/payroll/components"
    ];

    if (userRole === "USER" && adminManagementOnlyPaths.some(p => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Kế toán (ACCOUNTANT) không can thiệp tuyển dụng, biến động nhân sự, quy hoạch cán bộ hay vai trò/cài đặt hệ thống
    const accountantBlockedPaths = [
      "/dashboard/roles",
      "/dashboard/settings",
      "/dashboard/recruitment",
      "/dashboard/personnel-changes",
      "/dashboard/cadre-planning"
    ];

    if (userRole === "ACCOUNTANT" && accountantBlockedPaths.some(p => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
