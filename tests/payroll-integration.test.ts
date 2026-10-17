import assert from "node:assert/strict";
import test from "node:test";
import { prisma } from "../src/lib/prisma";
import { saveWorkCalendar, getCalendarSummary } from "../src/services/work-calendar.service";
import { createOvertimeRequest, decideOvertimeRequest } from "../src/services/overtime.service";
import { calculateMonthlyPayroll } from "../src/services/payroll.service";
import {
  applyDuePersonnelChanges,
  createPersonnelChangeDecision,
  decidePersonnelChangeDecision,
  enrichPersonnelChangesWithLifecycle,
  reconcileHistoricalPersonnelChange,
} from "../src/services/personnel-change.service";

const isolated = /\/hrmis_codex_test_[a-z0-9]+(?:\?|$)/.test(process.env.DATABASE_URL || "");

test("lịch công, duyệt OT, chặn OT ngày nghỉ phép, lương nghỉ việc giữa tháng, KPI quý và rollback lô lương", { skip: !isolated }, async () => {
  const roleUser = await prisma.role.create({ data: { name: "USER" } });
  const roleHr = await prisma.role.create({ data: { name: "HR" } });
  const roleBod = await prisma.role.create({ data: { name: "BOD" } });
  const employeeUser = await prisma.user.create({ data: { email: "employee@test.invalid", password: "test", name: "Nhân viên thử nghiệm", roleId: roleUser.id } });
  const hrUser = await prisma.user.create({ data: { email: "hr@test.invalid", password: "test", name: "HR thử nghiệm", roleId: roleHr.id } });
  const bodUser = await prisma.user.create({ data: { email: "bod@test.invalid", password: "test", name: "CEO thử nghiệm", roleId: roleBod.id } });
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
  // Nhân viên chỉ có 2 ngày hưởng lương + 1 ngày nghỉ ốm + 18 ngày thiếu dữ liệu công -> KHÔNG tự động miễn đóng BHXH mà gắn cờ đối chiếu HR
  assert.ok(details.some((item) => item.name.includes("Cần HR đối chiếu chấm công/bảo hiểm")));
  assert.ok(details.some((item) => item.name.includes("Bảo hiểm Xã hội") && item.amount === Math.round(16_000_000 * 0.08)));

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

  // --- KIỂM THỬ ƯU TIÊN 1: LƯƠNG HỢP ĐỒNG KHÁC LƯƠNG CẤU HÌNH (12.000.000đ) & COMPONENT BẢO HIỂM RIÊNG & MIỄN ĐÓNG ≥ 14 NGÀY XÁC NHẬN ---
  // Tháng 8/2026: kiểm tra nhân viên có baseSalary = 12.000.000đ và Contract.salary = 20.000.000đ
  const diffUser = await prisma.user.create({ data: { email: "diff-salary@test.invalid", password: "test", name: "Nhân sự lương HĐ khác cấu hình", roleId: roleUser.id } });
  const diffEmp = await prisma.employeeProfile.create({ data: { userId: diffUser.id, position: "Kỹ sư", status: "ACTIVE" } });
  const diffConfig = await prisma.employeeSalaryConfig.create({ data: { employeeId: diffEmp.id, baseSalary: 12_000_000 } });
  await prisma.contract.create({
    data: {
      code: "HD-DIFF-2026-001",
      employeeId: diffEmp.id,
      contractType: "Hợp đồng Xác định thời hạn 12 tháng",
      startDate: new Date("2026-01-01"),
      salary: 20_000_000,
      status: "ACTIVE",
    },
  });
  // Nghỉ không lương 13 ngày làm việc trong tháng 8/2026 (2026-08-03 đến 2026-08-19 = 13 ngày làm việc, chưa đủ 14 ngày)
  await prisma.leaveRequest.create({
    data: {
      employeeId: diffEmp.id,
      startDate: new Date("2026-08-03"),
      endDate: new Date("2026-08-19"),
      type: "UNPAID_LEAVE",
      status: "APPROVED",
    },
  });
  await prisma.attendance.create({
    data: { employeeId: diffEmp.id, date: new Date("2026-08-20"), status: "PRESENT" },
  });

  // Nhân sự có SalaryComponent khấu trừ bảo hiểm cấu hình riêng nhưng nghỉ không lương đã xác nhận ≥ 14 ngày công trong tháng 8/2026
  const customInsUser = await prisma.user.create({ data: { email: "custom-ins@test.invalid", password: "test", name: "Nhân sự BHXH cấu hình riêng", roleId: roleUser.id } });
  const customInsEmp = await prisma.employeeProfile.create({ data: { userId: customInsUser.id, position: "Chuyên viên", status: "ACTIVE" } });
  const customInsConfig = await prisma.employeeSalaryConfig.create({ data: { employeeId: customInsEmp.id, baseSalary: 15_000_000 } });
  const insCompDef = await prisma.salaryComponent.create({
    data: { name: "Khấu trừ BHXH bắt buộc cấu hình riêng", type: "DEDUCTION", amountType: "PERCENTAGE", defaultVal: 10.5 },
  });
  await prisma.employeeSalaryComponent.create({
    data: { configId: customInsConfig.id, componentId: insCompDef.id, customAmount: 10.5 },
  });
  // Nghỉ không lương 14 ngày làm việc (2026-08-03 đến 2026-08-20 = 14 ngày làm việc) + 1 ngày đi làm (2026-08-21)
  await prisma.leaveRequest.create({
    data: {
      employeeId: customInsEmp.id,
      startDate: new Date("2026-08-03"),
      endDate: new Date("2026-08-20"),
      type: "UNPAID_LEAVE",
      status: "APPROVED",
    },
  });
  await prisma.attendance.create({
    data: { employeeId: customInsEmp.id, date: new Date("2026-08-21"), status: "PRESENT" },
  });

  await calculateMonthlyPayroll(8, 2026);

  // Kiểm tra 1: config.baseSalary = 12.000.000đ KHÔNG bị ghi đè thành 20.000.000đ
  const reloadedDiffConfig = await prisma.employeeSalaryConfig.findUniqueOrThrow({ where: { id: diffConfig.id } });
  assert.equal(reloadedDiffConfig.baseSalary, 12_000_000);
  const diffPayroll = await prisma.payroll.findUniqueOrThrow({
    where: { employeeId_month_year: { employeeId: diffEmp.id, month: 8, year: 2026 } },
  });
  const diffDetails = diffPayroll.details as Array<{ name: string; amount: number; type: string }>;
  // Lương ngày công tính trên 12.000.000đ (1 ngày công / 21 ngày công chuẩn tháng 8/2026), còn BHXH 8% tính trên lương hợp đồng 20.000.000đ (= 1.600.000đ)
  assert.equal(diffPayroll.baseSalary, Math.round(12_000_000 / 21));
  assert.ok(diffDetails.some((d) => d.name.includes("Bảo hiểm Xã hội") && d.amount === 1_600_000));
  assert.equal(diffPayroll.deductions, 2_100_000);

  // Kiểm tra 2: Nhân sự có SalaryComponent bảo hiểm riêng nhưng nghỉ không lương xác nhận 14 ngày (>= 14) được miễn đóng hoàn toàn, deductions = 0
  const customInsPayroll = await prisma.payroll.findUniqueOrThrow({
    where: { employeeId_month_year: { employeeId: customInsEmp.id, month: 8, year: 2026 } },
  });
  const customInsDetails = customInsPayroll.details as Array<{ name: string; amount: number; type: string }>;
  assert.equal(customInsPayroll.deductions, 0);
  assert.ok(customInsDetails.some((d) => d.name.includes("Miễn trích đóng BHXH/BHYT/BHTN")));
  assert.ok(!customInsDetails.some((d) => d.name === "Khấu trừ BHXH bắt buộc cấu hình riêng"));

  // --- KIỂM THỬ ƯU TIÊN 2: QUYẾT ĐỊNH BIẾN ĐỘNG NHÂN SỰ ---
  const deptIt = await prisma.department.create({ data: { name: "Phòng Công nghệ (IT)" } });
  const deptProduct = await prisma.department.create({ data: { name: "Phòng Sản phẩm" } });
  await prisma.employeeProfile.update({
    where: { id: diffEmp.id },
    data: { departmentId: deptIt.id, position: "Kỹ sư" },
  });

  // 1. Chặn tạo quyết định khi phòng ban đích không tồn tại
  await assert.rejects(
    createPersonnelChangeDecision(
      { userId: hrUser.id, userEmail: hrUser.email, userName: hrUser.name, roleName: "HR" },
      {
        employeeId: diffEmp.id,
        type: "TRANSFER",
        toDept: "Phòng Không Tồn Tại XYZ",
        toPosition: "Kỹ sư chính",
        effectiveDate: "2026-10-15",
      },
      new Date("2026-10-17T00:00:00.000Z")
    ),
    /Phòng ban tiếp nhận .* không tồn tại/
  );

  // 2. Tạo đề xuất nâng lương PENDING -> APPROVED (UI chỉ gửi { id, status: "APPROVED" }, vẫn áp dụng đúng newSalary đã lưu)
  const pendingPromotion = await createPersonnelChangeDecision(
    { userId: hrUser.id, userEmail: hrUser.email, userName: hrUser.name, roleName: "HR" },
    {
      employeeId: diffEmp.id,
      type: "PROMOTION",
      toDeptId: deptProduct.id,
      toPosition: "Trưởng nhóm Kỹ thuật",
      newSalary: 28_000_000,
      status: "PENDING",
      effectiveDate: "2026-10-16",
    },
    new Date("2026-10-17T00:00:00.000Z")
  );
  assert.equal(pendingPromotion.status, "PENDING");
  assert.equal(pendingPromotion.newSalary, 28_000_000);
  assert.match(pendingPromotion.code, /^QĐ-2026-\d{3}$/);

  // Trước khi duyệt, lương cấu hình vẫn là 12.000.000đ và lương hợp đồng vẫn là 20.000.000đ
  assert.equal((await prisma.employeeSalaryConfig.findUniqueOrThrow({ where: { id: diffConfig.id } })).baseSalary, 12_000_000);

  // Phê duyệt chỉ gửi { id, status: "APPROVED" } như thao tác trên UI
  const approvedPromotion = await decidePersonnelChangeDecision(
    { userId: bodUser.id, userEmail: bodUser.email, userName: bodUser.name, roleName: "BOD" },
    { id: pendingPromotion.id, status: "APPROVED" },
    new Date("2026-10-17T00:00:00.000Z")
  );
  assert.equal(approvedPromotion.status, "APPROVED");
  assert.ok(approvedPromotion.appliedAt !== null);

  const syncedEmp = await prisma.employeeProfile.findUniqueOrThrow({ where: { id: diffEmp.id } });
  const syncedConfig = await prisma.employeeSalaryConfig.findUniqueOrThrow({ where: { id: diffConfig.id } });
  const syncedContract = await prisma.contract.findFirstOrThrow({ where: { employeeId: diffEmp.id, status: "ACTIVE" } });
  assert.equal(syncedEmp.departmentId, deptProduct.id);
  assert.equal(syncedEmp.position, "Trưởng nhóm Kỹ thuật");
  assert.equal(syncedConfig.baseSalary, 28_000_000);
  assert.equal(syncedContract.salary, 28_000_000);

  // 3. Chặn đổi quyết định đã APPROVED sang REJECTED hoặc sửa lại
  await assert.rejects(
    decidePersonnelChangeDecision(
      { userId: bodUser.id, userEmail: bodUser.email, userName: bodUser.name, roleName: "BOD" },
      { id: pendingPromotion.id, status: "REJECTED" },
      new Date("2026-10-17T00:00:00.000Z")
    ),
    /đã ban hành hoặc đã xử lý/
  );

  // 4. Quyết định có ngày hiệu lực tương lai (năm 2027 -> tiền tố mã QĐ-2027-001): chưa tự động ghi đè hồ sơ trước ngày hiệu lực
  const futureDecision = await createPersonnelChangeDecision(
    { userId: bodUser.id, userEmail: bodUser.email, userName: bodUser.name, roleName: "BOD" },
    {
      employeeId: diffEmp.id,
      type: "PROMOTION",
      toDeptId: deptIt.id,
      toPosition: "Kiến trúc sư trưởng",
      newSalary: 35_000_000,
      status: "APPROVED",
      effectiveDate: "2027-01-15",
    },
    new Date("2026-10-17T00:00:00.000Z")
  );
  assert.equal(futureDecision.code, "QĐ-2027-001");
  assert.equal(futureDecision.status, "APPROVED");
  assert.equal(futureDecision.appliedAt, null);

  // Hồ sơ tại ngày 2026-10-17 vẫn giữ nguyên vị trí "Trưởng nhóm Kỹ thuật" và lương 28.000.000đ
  assert.equal((await prisma.employeeProfile.findUniqueOrThrow({ where: { id: diffEmp.id } })).position, "Trưởng nhóm Kỹ thuật");
  assert.equal((await prisma.employeeSalaryConfig.findUniqueOrThrow({ where: { id: diffConfig.id } })).baseSalary, 28_000_000);

  // 5. Kiểm thử phân biệt ngày thiếu chấm công với ngày nghỉ việc thực tế:
  // Nhân viên resignedEmp có status = RESIGNED và mới chỉ có 2 ngày chấm công (03/09 và 04/09, thêm 05/09 làm bù = 3 ngày công) trong tháng 9/2026,
  // nhưng CHƯA có quyết định RESIGNATION xác nhận ngày thôi việc -> 18 ngày làm việc còn lại phải nằm trong missingAttendanceDays (Cần HR đối chiếu), KHÔNG tự suy diễn từ ngày chấm công cuối!
  const resignedSepBeforeDecision = await prisma.payroll.findUniqueOrThrow({
    where: { employeeId_month_year: { employeeId: resignedEmp.id, month: 9, year: 2026 } },
  });
  const resignedSepBeforeDetails = resignedSepBeforeDecision.details as Array<{
    name: string;
    amount: number;
  }>;
  assert.ok(
    resignedSepBeforeDetails.some(
      (d) => d.name.includes("Ngày chưa có dữ liệu chấm công") && d.amount === 18
    )
  );
  assert.ok(
    resignedSepBeforeDetails.some((d) =>
      d.name.includes("Cần HR đối chiếu chấm công/bảo hiểm")
    )
  );

  // Khi có quyết định RESIGNATION đã APPROVED với effectiveDate = "2026-09-07", các ngày làm việc từ 07/09 trở đi (18 ngày) mới được ghi nhận là midMonthUnworkedDays
  await prisma.personnelChange.create({
    data: {
      code: "QĐ-2026-899",
      employeeId: resignedEmp.id,
      employeeName: resignedUser.name,
      employeeEmail: resignedUser.email,
      type: "RESIGNATION",
      fromDept: "Phòng Công nghệ (IT)",
      toDept: "Lưu trữ hồ sơ thôi việc",
      fromPosition: "Chuyên viên",
      toPosition: "Thôi việc",
      effectiveDate: "2026-09-07",
      appliedAt: new Date("2026-09-07T00:00:00.000Z"),
      signer: "CEO thử nghiệm",
      status: "APPROVED",
    },
  });
  await prisma.payroll.update({ where: { id: original.id }, data: { status: "DRAFT" } });
  await calculateMonthlyPayroll(9, 2026);
  const resignedSepAfterDecision = await prisma.payroll.findUniqueOrThrow({
    where: { employeeId_month_year: { employeeId: resignedEmp.id, month: 9, year: 2026 } },
  });
  const resignedSepAfterDetails = resignedSepAfterDecision.details as Array<{
    name: string;
    amount: number;
  }>;
  assert.ok(
    resignedSepAfterDetails.some(
      (d) =>
        d.name.includes("Ngày ngoài thời gian làm việc (Vào/nghỉ việc giữa tháng)") &&
        d.amount === 18
    )
  );

  // 6. Kiểm thử quyết định lịch sử chưa xác minh (employeeId = null, toDeptId = null, appliedAt = null):
  // KHÔNG được tự động chạy lại làm ghi đè vị trí "Trưởng nhóm Kỹ thuật" về vị trí cũ!
  const legacyUnverified = await prisma.personnelChange.create({
    data: {
      code: "QĐ-2026-041-LEGACY",
      employeeName: diffUser.name,
      employeeEmail: diffUser.email,
      type: "PROMOTION",
      fromDept: "Phòng Công nghệ (IT)",
      toDept: "Phòng Công nghệ (IT)",
      fromPosition: "Thực tập sinh",
      toPosition: "Chức danh lịch sử cũ",
      effectiveDate: "01/10/2026",
      signer: "CEO thử nghiệm",
      status: "APPROVED",
      employeeId: null,
      toDeptId: null,
      appliedAt: null,
    },
  });

  const enrichedCheck = await enrichPersonnelChangesWithLifecycle([legacyUnverified]);
  assert.equal(enrichedCheck[0].lifecycleState, "HISTORICAL_NEEDS_REVIEW");

  // 7. Kiểm thử quyết định có phòng ban đích bị xóa trước ngày hiệu lực (cô lập lỗi, không làm gãy quyết định hợp lệ khác)
  const tempDept = await prisma.department.create({ data: { name: "Phòng Tạm Thời" } });
  const brokenDecision = await createPersonnelChangeDecision(
    { userId: bodUser.id, userEmail: bodUser.email, userName: bodUser.name, roleName: "BOD" },
    {
      employeeId: customInsEmp.id,
      type: "TRANSFER",
      toDeptId: tempDept.id,
      toPosition: "Chuyên viên Điều phối",
      status: "APPROVED",
      effectiveDate: "2027-01-10",
    },
    new Date("2026-10-17T00:00:00.000Z")
  );
  await prisma.department.delete({ where: { id: tempDept.id } });
  await prisma.personnelChange.update({
    where: { id: brokenDecision.id },
    data: { toDeptId: "deleted-dept-id", toDept: "Phòng Đã Giải Thể" },
  });

  // 8. Chạy đồng thời 2 tiến trình applyDuePersonnelChanges tại ngày 2027-01-15:
  // - futureDecision được thi hành đúng 1 lần (chống chạy trùng)
  // - legacyUnverified được đưa vào skippedUnverified (không ghi đè hồ sơ!)
  // - brokenDecision bị lỗi được cô lập vào failed (không làm gãy futureDecision!)
  const [runA, runB] = await Promise.all([
    applyDuePersonnelChanges(new Date("2027-01-15T00:00:00.000Z")),
    applyDuePersonnelChanges(new Date("2027-01-15T00:00:00.000Z")),
  ]);
  const combinedApplied = [...new Set([...runA.appliedIds, ...runB.appliedIds])];
  assert.ok(combinedApplied.includes(futureDecision.id));
  assert.equal(runA.appliedIds.length + runB.appliedIds.length, 1);
  assert.ok(
    runA.skippedUnverified.some((s) => s.id === legacyUnverified.id) ||
      runB.skippedUnverified.some((s) => s.id === legacyUnverified.id)
  );
  assert.ok(
    runA.failed.some((f) => f.id === brokenDecision.id) ||
      runB.failed.some((f) => f.id === brokenDecision.id)
  );

  // Hồ sơ của diffEmp được nâng lên "Kiến trúc sư trưởng" (35.000.000đ) và KHÔNG bị legacyUnverified ghi đè thành "Chức danh lịch sử cũ"
  assert.equal((await prisma.employeeProfile.findUniqueOrThrow({ where: { id: diffEmp.id } })).position, "Kiến trúc sư trưởng");
  assert.equal((await prisma.employeeSalaryConfig.findUniqueOrThrow({ where: { id: diffConfig.id } })).baseSalary, 35_000_000);

  // 9. Chạy lại sau khi khắc phục lỗi phòng ban đích cho brokenDecision -> thành công, và futureDecision đã áp dụng không bị chạy lại!
  await prisma.personnelChange.update({
    where: { id: brokenDecision.id },
    data: { toDeptId: deptProduct.id, toDept: deptProduct.name },
  });
  const retryRun = await applyDuePersonnelChanges(new Date("2027-01-15T00:00:00.000Z"));
  assert.ok(retryRun.appliedIds.includes(brokenDecision.id));
  assert.ok(!retryRun.appliedIds.includes(futureDecision.id));
  assert.equal(retryRun.failed.length, 0);
  assert.equal(
    (await prisma.employeeProfile.findUniqueOrThrow({ where: { id: customInsEmp.id } })).position,
    "Chuyên viên Điều phối"
  );

  // 10. HR xác nhận đối chiếu lịch sử (MARK_HISTORICAL_APPLIED) cho legacyUnverified: đóng dấu appliedAt mà giữ nguyên vị trí "Kiến trúc sư trưởng"
  const reconciledLegacy = await reconcileHistoricalPersonnelChange(
    { userId: hrUser.id, userEmail: hrUser.email, userName: hrUser.name, roleName: "HR" },
    { id: legacyUnverified.id, reconcileAction: "MARK_HISTORICAL_APPLIED" }
  );
  assert.ok(reconciledLegacy.appliedAt !== null);
  assert.equal(reconciledLegacy.effectiveDate, "2026-10-01");
  assert.equal((await prisma.employeeProfile.findUniqueOrThrow({ where: { id: diffEmp.id } })).position, "Kiến trúc sư trưởng");

  await prisma.$disconnect();
});

