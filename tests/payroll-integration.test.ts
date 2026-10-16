import assert from "node:assert/strict";
import test from "node:test";
import { prisma } from "../src/lib/prisma";
import { saveWorkCalendar, getCalendarSummary } from "../src/services/work-calendar.service";
import { createOvertimeRequest, decideOvertimeRequest } from "../src/services/overtime.service";
import { calculateMonthlyPayroll } from "../src/services/payroll.service";

const isolated = /\/hrmis_codex_test_[a-z0-9]+(?:\?|$)/.test(process.env.DATABASE_URL || "");

test("lịch công, duyệt OT, nghỉ ốm và rollback lô lương", { skip: !isolated }, async () => {
  const roleUser = await prisma.role.create({ data: { name: "USER" } });
  const roleHr = await prisma.role.create({ data: { name: "HR" } });
  const employeeUser = await prisma.user.create({ data: { email: "employee@test.invalid", password: "test", name: "Nhân viên thử nghiệm", roleId: roleUser.id } });
  const hrUser = await prisma.user.create({ data: { email: "hr@test.invalid", password: "test", name: "HR thử nghiệm", roleId: roleHr.id } });
  const employee = await prisma.employeeProfile.create({ data: { userId: employeeUser.id, position: "Nhân viên", status: "ACTIVE" } });
  await prisma.employeeSalaryConfig.create({ data: { employeeId: employee.id, baseSalary: 16_000_000 } });

  const calendar = await getCalendarSummary(2026);
  await saveWorkCalendar(2026, calendar.holidays, ["2026-09-05"], "HR thử nghiệm", "HR");
  assert.equal((await getCalendarSummary(2026)).months[8], 21);

  await prisma.attendance.create({ data: { employeeId: employee.id, date: new Date("2026-09-04"), status: "PRESENT" } });
  await prisma.leaveRequest.create({ data: { employeeId: employee.id, startDate: new Date("2026-09-07"), endDate: new Date("2026-09-07"), type: "SICK_LEAVE", status: "APPROVED" } });
  await prisma.leaveRequest.create({ data: { employeeId: employee.id, startDate: new Date("2026-09-08"), endDate: new Date("2026-09-08"), type: "ANNUAL_LEAVE", status: "APPROVED" } });
  const request = await createOvertimeRequest({ userId: employeeUser.id, roleName: "USER", actorName: employeeUser.name }, { date: "2026-09-04", hours: 2, reason: "Đơn hàng cuối ngày" });
  assert.equal(request.status, "PENDING");
  await decideOvertimeRequest({ userId: hrUser.id, roleName: "HR", actorName: hrUser.name }, request.id, "APPROVED");

  await calculateMonthlyPayroll(9, 2026);
  const original = await prisma.payroll.findUniqueOrThrow({ where: { employeeId_month_year: { employeeId: employee.id, month: 9, year: 2026 } } });
  const details = original.details as Array<{ name: string; amount: number }>;
  assert.equal(original.baseSalary, Math.round(16_000_000 * 2 / 21));
  assert.ok(details.some((item) => item.name.includes("OT đã duyệt") && item.amount > 0));
  assert.ok(details.some((item) => item.name.includes("Nghỉ ốm") && item.amount === 1));

  // Một phiếu hợp lệ được cập nhật trước, phiếu mới phía sau bị trigger từ chối.
  // Giao dịch của cả lô phải khôi phục phiếu đầu tiên.
  await prisma.attendance.create({ data: { employeeId: employee.id, date: new Date("2026-09-09"), status: "PRESENT" } });
  const secondUser = await prisma.user.create({ data: { email: "second@test.invalid", password: "test", name: "Nhân viên thứ hai", roleId: roleUser.id } });
  const secondEmployee = await prisma.employeeProfile.create({ data: { userId: secondUser.id, position: "Nhân viên", status: "ACTIVE" } });
  await prisma.employeeSalaryConfig.create({ data: { employeeId: secondEmployee.id, baseSalary: 12_000_000 } });
  await prisma.$executeRawUnsafe('CREATE FUNCTION fail_payroll_insert() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION \'isolated rollback test\'; END; $$ LANGUAGE plpgsql');
  await prisma.$executeRawUnsafe('CREATE TRIGGER fail_payroll_insert_trigger BEFORE INSERT ON "Payroll" FOR EACH ROW EXECUTE FUNCTION fail_payroll_insert()');
  await assert.rejects(calculateMonthlyPayroll(9, 2026), /isolated rollback test/);
  const afterFailure = await prisma.payroll.findUniqueOrThrow({ where: { id: original.id } });
  assert.equal(afterFailure.baseSalary, original.baseSalary);
  assert.equal(await prisma.payroll.count({ where: { month: 9, year: 2026 } }), 1);
  await prisma.$executeRawUnsafe('DROP TRIGGER fail_payroll_insert_trigger ON "Payroll"');
  await prisma.$executeRawUnsafe('DROP FUNCTION fail_payroll_insert()');
  await prisma.payroll.update({ where: { id: original.id }, data: { status: "PAID" } });
  await assert.rejects(
    saveWorkCalendar(2026, calendar.holidays, [], "HR thử nghiệm", "HR"),
    /tháng đã có phiếu lương PAID/
  );
  await prisma.$disconnect();
});
