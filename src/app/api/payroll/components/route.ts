import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const components = await prisma.salaryComponent.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(components);
  } catch (error) {
    console.error("[SALARY_COMPONENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.roleName;
    if (!session || (role !== 'SYSTEM_ADMIN' && role !== 'HR')) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const { name, type, amountType, defaultVal } = body;

    if (!name || !type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const component = await prisma.salaryComponent.create({
      data: {
        name,
        type,
        amountType: amountType || "FIXED",
        defaultVal: parseFloat(defaultVal) || 0
      }
    });

    return NextResponse.json(component);
  } catch (error) {
    console.error("[SALARY_COMPONENT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
