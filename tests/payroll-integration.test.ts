import assert from "node:assert/strict";
import test from "node:test";
import { prisma } from "../src/lib/prisma";
import { saveWorkCalendar, getCalendarSummary } from "../src/services/work-calendar.service";
import { createOvertimeRequest, decideOvertimeRequest } from "../src/services/overtime.service";
import { calculateMonthlyPayroll } from "../src/services/payroll.service";

const isolated = /\/hrmis_codex_test_[a-z0-9]+(?:\?|$)/.test(process.env.DATABASE_URL || "");

test("lịch công, duyệt OT, chặn OT ngày nghỉ phép, lương nghỉ việc giữa tháng, KPI quý và rollback lô lương", { skip: !isolated }, async () => {
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

  // Chặn đăng ký OT vào ngày đang nghỉ phép đã duyệt (2026-09-08)
  await assert.rejects(
    createOvertimeRequest(
      { userId: employeeUser.id, roleName: "USER", actorName: employeeUser.name },
      { date: "2026-09-08", hours: 2, reason: "OT trùng ngày nghỉ phép" }
    ),
    /nghỉ phép đã duyệt/
  );

  // OT vào ngày làm bù thứ Bảy (2026-09-05) phải được tính hệ số 150% như ngày làm việc thường
  const request = await createOvertimeRequest({ userId: employeeUser.id, roleName: "USER", actorName: employeeUser.name }, { date: "2026-09-05", hours: 2, reason: "Đơn hàng ngày làm bù" });
  assert.equal(request.status, "PENDING");
  await decideOvertimeRequest({ userId: hrUser.id, roleName: "HR", actorName: hrUser.name }, request.id, "APPROVED");

  // KPI của Q2-2026 không được áp lặp lại vào tháng 9 (Q3-2026)
  await prisma.performanceEvaluation.create({
    data: {
      employeeId: employee.id,
      period: "Q2-2026",
      year: 2026,
      selfScore: 95,
      managerScore: 95,
      criterion1: 95,
      criterion2: 95,
      criterion3: 95,
      totalScore: 95,
      grade: "HẠNG A (XUẤT SẮC)",
      bonusRate: 0.25,
      status: "APPROVED",
    },
  });

  // Nhân sự nghỉ việc giữa tháng 9/2026 nhưng có 3 ngày công thực tế vẫn phải được tính lương tháng 9
  const resignedUser = await prisma.user.create({ data: { email: "resigned@test.invalid", password: "test", name: "Nhân sự nghỉ giữa tháng", roleId: roleUser.id } });
  const resignedEmp = await prisma.employeeProfile.create({ data: { userId: resignedUser.id, position: "Chuyên viên", status: "RESIGNED" } });
  await prisma.employeeSalaryConfig.create({ data: { employeeId: resignedEmp.id, baseSalary: 21_000_000 } });
  await prisma.attendance.createMany({
    data: [
      { employeeId: resignedEmp.id, date: new Date("2026-09-03"), status: "PRESENT" },
      { employeeId: resignedEmp.id, date: new Date("2026-09-04"), status: "PRESENT" },
      { employeeId: resignedEmp.id, date: new Date("2026-09-05"), status: "PRESENT" },
    ],
  });

  await calculateMonthlyPayroll(9, 2026);
  const original = await prisma.payroll.findUniqueOrThrow({ where: { employeeId_month_year: { employeeId: employee.id, month: 9, year: 2026 } } });
  const details = original.details as Array<{ name: string; amount: number }>;
  assert.equal(original.baseSalary, Math.round(16_000_000 * 2 / 21));
  assert.ok(details.some((item) => item.name.includes("OT đã duyệt 2h × 150%") && item.amount > 0));
  assert.ok(!details.some((item) => item.name.includes("Thưởng hiệu suất KPI")));
  assert.ok(details.some((item) => item.name.includes("Nghỉ ốm") && item.amount === 1));

  const resignedPayroll = await prisma.payroll.findUniqueOrThrow({ where: { employeeId_month_year: { employeeId: resignedEmp.id, month: 9, year: 2026 } } });
  assert.equal(resignedPayroll.baseSalary, 3_000_000);

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
  assert.equal(await prisma.payroll.count({ where: { month: 9, year: 2026 } }), 2);
  await prisma.$executeRawUnsafe('DROP TRIGGER fail_payroll_insert_trigger ON "Payroll"');
  await prisma.$executeRawUnsafe('DROP FUNCTION fail_payroll_insert()');
  await prisma.payroll.update({ where: { id: original.id }, data: { status: "PAID" } });
  await assert.rejects(
    saveWorkCalendar(2026, calendar.holidays, [], "HR thử nghiệm", "HR"),
    /tháng đã có phiếu lương PAID/
  );
  await prisma.$disconnect();
});
