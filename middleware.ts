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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
