import assert from "node:assert/strict";
import test from "node:test";
import { prisma } from "../src/lib/prisma";
import { deleteLeaveRequest, getLeaveBalance, updateLeaveRequestStatus } from "../src/services/leave.service";

const isolated = /\/hrmis_codex_test_[a-z0-9]+(?:\?|$)/.test(process.env.DATABASE_URL || "");

test("rút và xóa đơn chỉ hoàn tác ngày công do chính đơn tạo, đồng bộ quỹ phép và khóa sổ lương PAID", { skip: !isolated }, async () => {
  const role = await prisma.role.create({ data: { name: "USER" } });
  const user = await prisma.user.create({ data: { email: "leave@test.invalid", password: "test", name: "Nhân viên thử phép", roleId: role.id } });
  const employee = await prisma.employeeProfile.create({ data: { userId: user.id, position: "Nhân viên", status: "ACTIVE", annualLeaveDays: 12 } });
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

  // Kiểm tra quỹ phép năm không trừ ngày thực tế đi làm (PRESENT)
  await prisma.attendance.create({
    data: { employeeId: employee.id, date: new Date("2026-05-04T00:00:00.000Z"), status: "PRESENT" },
  });
  const annualLeave = await prisma.leaveRequest.create({
    data: {
      employeeId: employee.id,
      startDate: new Date("2026-05-04T00:00:00.000Z"),
      endDate: new Date("2026-05-05T00:00:00.000Z"),
      type: "ANNUAL_LEAVE",
      status: "APPROVED",
    },
  });
  const balance = await getLeaveBalance(employee.id, 2026);
  assert.equal(balance.usedDays, 1);

  // Khóa sổ lương tháng 5/2026 (PAID) -> chặn hủy duyệt hoặc xóa đơn phép thuộc tháng 5/2026
  await prisma.payroll.create({
    data: {
      employeeId: employee.id,
      month: 5,
      year: 2026,
      baseSalary: 12_000_000,
      bonus: 0,
      deductions: 0,
      netSalary: 12_000_000,
      status: "PAID",
    },
  });
  await assert.rejects(
    updateLeaveRequestStatus(annualLeave.id, "REJECTED", "HR", "HR thử nghiệm"),
    /đã khóa sổ \(PAID\)/
  );
  await assert.rejects(
    deleteLeaveRequest(annualLeave.id, user.id, "HR"),
    /đã khóa sổ \(PAID\)/
  );

  await prisma.$disconnect();
});
