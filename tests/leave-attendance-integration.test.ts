import assert from "node:assert/strict";
import test from "node:test";
import { prisma } from "../src/lib/prisma";
import { deleteLeaveRequest, updateLeaveRequestStatus } from "../src/services/leave.service";

const isolated = /\/hrmis_codex_test_[a-z0-9]+(?:\?|$)/.test(process.env.DATABASE_URL || "");

test("rút và xóa đơn chỉ hoàn tác ngày công do chính đơn tạo", { skip: !isolated }, async () => {
  const role = await prisma.role.create({ data: { name: "USER" } });
  const user = await prisma.user.create({ data: { email: "leave@test.invalid", password: "test", name: "Nhân viên thử phép", roleId: role.id } });
  const employee = await prisma.employeeProfile.create({ data: { userId: user.id, position: "Nhân viên", status: "ACTIVE" } });
  const manualLeave = await prisma.attendance.create({ data: { employeeId: employee.id, date: new Date("2026-04-21"), status: "LEAVE" } });
  const absence = await prisma.attendance.create({ data: { employeeId: employee.id, date: new Date("2026-04-22"), status: "ABSENT" } });
  const request = await prisma.leaveRequest.create({ data: {
    employeeId: employee.id, startDate: new Date("2026-04-21"), endDate: new Date("2026-04-23"),
    type: "SICK_LEAVE", status: "PENDING",
  } });

  await updateLeaveRequestStatus(request.id, "APPROVED", "HR", "HR thử nghiệm");
  assert.equal((await prisma.attendance.findUniqueOrThrow({ where: { id: manualLeave.id } })).leaveRequestId, null);
  const converted = await prisma.attendance.findUniqueOrThrow({ where: { id: absence.id } });
  assert.equal(converted.status, "LEAVE");
  assert.equal(converted.statusBeforeLeave, "ABSENT");
  assert.equal(converted.leaveRequestId, request.id);
  const created = await prisma.attendance.findUniqueOrThrow({ where: { employeeId_date: { employeeId: employee.id, date: new Date("2026-04-23") } } });
  assert.equal(created.status, "LEAVE");
  assert.equal(created.leaveRequestId, request.id);
  assert.equal(created.statusBeforeLeave, null);

  await updateLeaveRequestStatus(request.id, "PENDING", "HR", "HR thử nghiệm");
  assert.equal((await prisma.attendance.findUniqueOrThrow({ where: { id: manualLeave.id } })).status, "LEAVE");
  const restored = await prisma.attendance.findUniqueOrThrow({ where: { id: absence.id } });
  assert.equal(restored.status, "ABSENT");
  assert.equal(restored.leaveRequestId, null);
  assert.equal(await prisma.attendance.findUnique({ where: { id: created.id } }), null);

  await updateLeaveRequestStatus(request.id, "APPROVED", "HR", "HR thử nghiệm");
  await deleteLeaveRequest(request.id, user.id, "HR");
  assert.equal((await prisma.attendance.findUniqueOrThrow({ where: { id: manualLeave.id } })).status, "LEAVE");
  assert.equal((await prisma.attendance.findUniqueOrThrow({ where: { id: absence.id } })).status, "ABSENT");
  assert.equal(await prisma.attendance.findUnique({ where: { employeeId_date: { employeeId: employee.id, date: new Date("2026-04-23") } } }), null);
  await prisma.$disconnect();
});
