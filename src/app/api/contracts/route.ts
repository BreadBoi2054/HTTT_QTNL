import { NextResponse } from "next/server";
import { getContracts, createContract } from "@/services/contract.service";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any).roleName || "USER";
    const userEmail = session.user.email || undefined;
    const userId = session.user.id || undefined;

    const records = await getContracts({ roleName, userEmail, userId });
    return NextResponse.json(records);
  } catch (error: any) {
    console.error("[CONTRACTS_GET]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) return new NextResponse("Unauthorized", { status: 401 });

    const roleName = (session.user as any).roleName || "USER";
    if (!["SYSTEM_ADMIN", "BOD", "HR"].includes(roleName)) {
      return new NextResponse("Chỉ Quản trị viên, Ban Giám Đốc hoặc Nhân sự (HR) mới có quyền tạo mới Hợp đồng lao động.", { status: 403 });
    }

    const body = await req.json();
    const actor = {
      name: session.user.name || "HR",
      roleName,
      userId: session.user.id || undefined,
    };
    const result = await createContract(body, actor);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("[CONTRACTS_POST]", error);
    return new NextResponse(error.message || "Lỗi tạo hợp đồng", { status: 400 });
  }
}