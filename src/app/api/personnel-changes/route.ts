import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  createPersonnelChangeDecision,
  decidePersonnelChangeDecision,
  enrichPersonnelChangesWithLifecycle,
  PersonnelChangeError,
  reconcileHistoricalPersonnelChange,
} from "@/services/personnel-change.service";

interface SessionUserWithRole {
  id?: string;
  email?: string | null;
  name?: string | null;
  roleName?: string;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUserWithRole;
    const roleName = user.roleName || "USER";
    if (!["SYSTEM_ADMIN", "BOD", "HR", "MANAGER"].includes(roleName)) {
      return NextResponse.json(
        { error: "Bạn không có quyền truy cập dữ liệu biến động nhân sự." },
        { status: 403 }
      );
    }

    // Tuyệt đối không tự động ghi/cập nhật hồ sơ trong thao tác GET đọc danh sách
    if (roleName === "MANAGER") {
      const managerProfile = await prisma.employeeProfile.findUnique({
        where: { userId: user.id },
        include: {
          managedDept: {
            include: {
              employees: { include: { user: { select: { email: true } } } },
            },
          },
        },
      });

      const deptId = managerProfile?.managedDept?.id;
      const deptName = managerProfile?.managedDept?.name;
      const deptEmployeeIds = (managerProfile?.managedDept?.employees || []).map(
        (e) => e.id
      );
      if (managerProfile?.id && !deptEmployeeIds.includes(managerProfile.id)) {
        deptEmployeeIds.push(managerProfile.id);
      }
      const deptEmails = (managerProfile?.managedDept?.employees || [])
        .map((e) => e.user?.email)
        .filter((email): email is string => Boolean(email));
      if (user.email && !deptEmails.includes(user.email)) {
        deptEmails.push(user.email);
      }

      const orConditions: Prisma.PersonnelChangeWhereInput[] = [
        { employeeEmail: { in: deptEmails } },
      ];
      if (deptEmployeeIds.length > 0) {
        orConditions.push({ employeeId: { in: deptEmployeeIds } });
      }
      if (deptId) {
        orConditions.push({ fromDeptId: deptId }, { toDeptId: deptId });
      }
      if (deptName) {
        orConditions.push(
          { fromDept: { equals: deptName, mode: "insensitive" } },
          { toDept: { equals: deptName, mode: "insensitive" } }
        );
      }

      const scopedChanges = await prisma.personnelChange.findMany({
        where: { OR: orConditions },
        orderBy: { createdAt: "desc" },
      });
      const enrichedScoped = await enrichPersonnelChangesWithLifecycle(scopedChanges);
      return NextResponse.json(enrichedScoped);
    }

    const changes = await prisma.personnelChange.findMany({
      orderBy: { createdAt: "desc" },
    });
    const enriched = await enrichPersonnelChangesWithLifecycle(changes);

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("GET personnel-changes error:", error);
    return NextResponse.json(
      { error: "Lỗi tải dữ liệu biến động nhân sự" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUserWithRole;
    const roleName = user.roleName || "USER";
    const body = (await req.json()) as Record<string, unknown>;

    const newChange = await createPersonnelChangeDecision(
      {
        userId: user.id,
        userEmail: user.email || undefined,
        userName: user.name || undefined,
        roleName,
      },
      body
    );

    return NextResponse.json(newChange, { status: 201 });
  } catch (error) {
    if (error instanceof PersonnelChangeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST personnel-changes error:", error);
    return NextResponse.json(
      { error: "Lỗi tạo quyết định biến động" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUserWithRole;
    const roleName = user.roleName || "USER";
    const body = (await req.json()) as Record<string, unknown>;

    const actor = {
      userId: user.id,
      userEmail: user.email || undefined,
      userName: user.name || undefined,
      roleName,
    };

    const updated = body.reconcileAction
      ? await reconcileHistoricalPersonnelChange(actor, body)
      : await decidePersonnelChangeDecision(actor, body);

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof PersonnelChangeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("PATCH personnel-changes error:", error);
    return NextResponse.json(
      { error: "Lỗi cập nhật trạng thái quyết định" },
      { status: 500 }
    );
  }
}

