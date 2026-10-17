import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { applyDuePersonnelChanges } from "@/services/personnel-change.service";

interface SessionUserWithRole {
  id?: string;
  email?: string | null;
  name?: string | null;
  roleName?: string;
}

function verifyCronSecret(req: Request): boolean {
  const configuredSecret = process.env.CRON_SECRET?.trim();
  if (!configuredSecret) return false;

  const headerSecret = req.headers.get("x-cron-secret")?.trim();
  const authHeader = req.headers.get("authorization")?.trim();
  const bearerSecret = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  return (
    headerSecret === configuredSecret || bearerSecret === configuredSecret
  );
}

export async function POST(req: Request) {
  try {
    const isCronAuthorized = verifyCronSecret(req);
    let actorName = "Hệ thống / Tác vụ định kỳ (Cron)";
    let actorRole = "SYSTEM_ADMIN";

    if (!isCronAuthorized) {
      const session = await auth();
      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const user = session.user as SessionUserWithRole;
      const roleName = user.roleName || "USER";
      if (!["SYSTEM_ADMIN", "BOD", "HR"].includes(roleName)) {
        return NextResponse.json(
          {
            error:
              "Chỉ Quản trị hệ thống, Ban Giám Đốc hoặc Nhân sự mới có quyền chạy đồng bộ quyết định đến hạn.",
          },
          { status: 403 }
        );
      }
      actorName = user.name || user.email || "Quản trị viên / HR";
      actorRole = roleName;
    }

    const result = await applyDuePersonnelChanges(new Date(), {
      actorName,
      actorRole,
    });

    return NextResponse.json({
      success: true,
      referenceDateIso: result.referenceDateIso,
      appliedCount: result.appliedIds.length,
      appliedIds: result.appliedIds,
      skippedUnverifiedCount: result.skippedUnverified.length,
      skippedUnverified: result.skippedUnverified,
      failedCount: result.failed.length,
      failed: result.failed,
    });
  } catch (error) {
    console.error("POST /api/personnel-changes/apply-due error:", error);
    return NextResponse.json(
      { error: "Lỗi khi chạy thi hành các quyết định biến động đến hạn." },
      { status: 500 }
    );
  }
}
