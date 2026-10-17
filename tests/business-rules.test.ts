import assert from "node:assert/strict";
import test from "node:test";
import { calculateWorkingDays, normalizeLeaveDate, workingDaysInYear } from "../src/services/leave.service";
import {
  buildManualPayrollDetails,
  bulkDisbursePayrolls,
  calculateStatutoryInsurance,
  calculateVietnamesePIT,
  createPayroll,
  getPayrolls,
  overtimeMultiplier,
} from "../src/services/payroll.service";
import { holidayDatesForYear, monthlyWorkdays } from "../src/lib/work-calendar";
import { createOvertimeRequest, evaluateOvertimeThresholds } from "../src/services/overtime.service";
import { saveWorkCalendar } from "../src/services/work-calendar.service";
import { computeGradeAndBonus } from "../src/services/performance.service";
import {
  formatVietnamDate,
  normalizeEffectiveDateString,
} from "../src/services/personnel-change.service";

test("phép năm vắt qua năm được tính riêng theo từng năm, kể cả ngày cuối tuần", () => {
  process.env.PAYROLL_HOLIDAYS_2027 = "2027-01-01";
  const start = new Date("2026-12-31T00:00:00.000Z");
  const end = new Date("2027-01-04T00:00:00.000Z");
  assert.equal(calculateWorkingDays(start, end), 2);
  assert.equal(workingDaysInYear(start, end, 2026), 1);
  assert.equal(workingDaysInYear(start, end, 2027), 1);
  assert.equal(workingDaysInYear(start, end, 2028), 0);
  delete process.env.PAYROLL_HOLIDAYS_2027;
});

test("công chuẩn tháng thay đổi theo thứ cuối tuần và lễ 2026", () => {
  const holidays = holidayDatesForYear(2026);
  assert.equal(monthlyWorkdays(2026, 2, holidays), 15);
  assert.equal(monthlyWorkdays(2026, 4, holidays), 20);
  assert.equal(monthlyWorkdays(2026, 9, holidays), 20);
  assert.equal(calculateWorkingDays(new Date("2026-04-26"), new Date("2026-04-30")), 2);
});

test("không tự tính lương khi chưa cấu hình lịch lễ năm mới", () => {
  assert.throws(() => monthlyWorkdays(2028, 1), /Chưa cấu hình lịch nghỉ lễ/);
});

test("ngày làm bù cuối tuần được tính vào công chuẩn và OT tính hệ số 150%", () => {
  const holidays = holidayDatesForYear(2026);
  const extraWorkdays = new Set(["2026-01-10"]);
  assert.equal(monthlyWorkdays(2026, 1, holidays, extraWorkdays), 22);
  assert.equal(overtimeMultiplier(new Date("2026-01-09T00:00:00.000Z"), holidays, extraWorkdays), 1.5);
  assert.equal(overtimeMultiplier(new Date("2026-01-10T00:00:00.000Z"), holidays, extraWorkdays), 1.5);
  assert.equal(overtimeMultiplier(new Date("2026-01-17T00:00:00.000Z"), holidays, extraWorkdays), 2);
  assert.equal(overtimeMultiplier(new Date("2026-01-01T00:00:00.000Z"), holidays, extraWorkdays), 3);
});

test("chuẩn hóa ngày nghỉ phép về đầu ngày UTC 00:00:00.000Z", () => {
  assert.equal(normalizeLeaveDate("2026-10-16").toISOString(), "2026-10-16T00:00:00.000Z");
  assert.equal(normalizeLeaveDate("2026-10-16T00:00:00.000Z").toISOString(), "2026-10-16T00:00:00.000Z");
});

test("lịch công từ chối ngày ngoài năm và ngày vừa nghỉ vừa làm", async () => {
  await assert.rejects(saveWorkCalendar(2026, ["2027-01-01"], [], "HR", "HR"), /không hợp lệ/);
  await assert.rejects(saveWorkCalendar(2026, ["2026-01-01"], ["2026-01-01"], "HR", "HR"), /vừa nghỉ vừa làm/);
  await assert.rejects(saveWorkCalendar(2026, [], ["2026-09-07"], "HR", "HR"), /thứ Bảy hoặc Chủ nhật/);
});

test("đơn OT từ chối số giờ sai trước khi truy cập cơ sở dữ liệu", async () => {
  await assert.rejects(createOvertimeRequest({ userId: "u", roleName: "USER", actorName: "A" }, { date: "2026-10-16", hours: 13 }), /Số giờ OT/);
});

test("thuế TNCN 2026 đúng tại các ngưỡng biểu thuế lũy tiến", () => {
  assert.equal(calculateVietnamesePIT(0), 0);
  assert.equal(calculateVietnamesePIT(10_000_000), 500_000);
  assert.equal(calculateVietnamesePIT(30_000_000), 2_500_000);
  assert.equal(calculateVietnamesePIT(60_000_000), 8_500_000);
  assert.equal(calculateVietnamesePIT(100_000_000), 20_500_000);
});

test("duyệt chi hàng loạt từ chối danh sách trống trước khi truy cập cơ sở dữ liệu", async () => {
  await assert.rejects(bulkDisbursePayrolls([]), /Cần chọn ít nhất một phiếu lương nháp/);
});

test("truy vấn lương nhân viên hoặc quản lý thiếu định danh phải từ chối", async () => {
  await assert.rejects(getPayrolls(undefined, undefined, { roleName: "USER" }), /Thiếu định danh/);
  await assert.rejects(getPayrolls(undefined, undefined, { roleName: "MANAGER" }), /Thiếu định danh/);
});

test("khởi tạo phiếu lương thủ công từ chối kỳ lương tương lai trước khi truy cập cơ sở dữ liệu", async () => {
  await assert.rejects(
    createPayroll({ employeeId: "emp-1", month: 12, year: 2099, baseSalary: 15_000_000 }, "HR", "HR", "u-1"),
    /tương lai/
  );
});

test("xếp hạng KPI và tỷ lệ thưởng/phạt đúng theo thang điểm chuẩn", () => {
  assert.deepEqual(computeGradeAndBonus(92), {
    grade: "HẠNG A (XUẤT SẮC)",
    bonusRate: 0.25,
    bonusLabel: "+25% Lương CB",
  });
  assert.deepEqual(computeGradeAndBonus(80), {
    grade: "HẠNG B (HOÀN THÀNH TỐT)",
    bonusRate: 0.1,
    bonusLabel: "+10% Lương CB",
  });
  assert.deepEqual(computeGradeAndBonus(65), {
    grade: "HẠNG C (ĐẠT YÊU CẦU)",
    bonusRate: 0.0,
    bonusLabel: "0% Lương CB",
  });
  assert.deepEqual(computeGradeAndBonus(50), {
    grade: "HẠNG D (CẦN CẢI THIỆN)",
    bonusRate: -0.1,
    bonusLabel: "-10% Phạt KPI",
  });
});

test("BHXH/BHYT/BHTN tính trên lương hợp đồng, áp trần 20 lần mức tham chiếu/vùng và miễn đóng khi nghỉ >= 14 ngày công (1.A)", () => {
  // Đi làm 10/22 ngày công (nghỉ 12 ngày < 14 ngày): vẫn đóng trên 100% lương hợp đồng 20.000.000đ
  const normal = calculateStatutoryInsurance(20_000_000, 22, 10, 10, 2026);
  assert.equal(normal.exempt, false);
  assert.equal(normal.bhxh, 1_600_000);
  assert.equal(normal.bhyt, 300_000);
  assert.equal(normal.bhtn, 200_000);
  assert.equal(normal.total, 2_100_000);

  // Nghỉ không lương 14/22 ngày công (chỉ hưởng lương 8/22 ngày): miễn trích đóng BHXH/BHYT/BHTN tháng đó
  const exempt = calculateStatutoryInsurance(20_000_000, 22, 8, 10, 2026);
  assert.equal(exempt.exempt, true);
  assert.equal(exempt.nonPaidWorkingDays, 14);
  assert.equal(exempt.total, 0);

  // Áp trần từ 01/07/2026: BHXH/BHYT trần 50.600.000đ (20 × 2.530.000đ), BHTN trần 106.200.000đ (20 × 5.310.000đ)
  const capped = calculateStatutoryInsurance(120_000_000, 22, 22, 10, 2026);
  assert.equal(capped.bhxhBhytBase, 50_600_000);
  assert.equal(capped.bhtnBase, 106_200_000);
  assert.equal(capped.bhxh, Math.round(50_600_000 * 0.08));
  assert.equal(capped.bhyt, Math.round(50_600_000 * 0.015));
  assert.equal(capped.bhtn, Math.round(106_200_000 * 0.01));
});

test("cảnh báo mềm ngưỡng giờ OT tháng (>40h) và năm (>200h-300h) theo thỏa thuận hai bên (2.A)", () => {
  const safe = evaluateOvertimeThresholds(32, 120);
  assert.equal(safe.exceedsMonthly40, false);
  assert.equal(safe.exceedsYearly200, false);
  assert.equal(safe.warnings.length, 0);

  const overMonth = evaluateOvertimeThresholds(44, 150);
  assert.equal(overMonth.exceedsMonthly40, true);
  assert.equal(overMonth.exceedsYearly200, false);
  assert.equal(overMonth.warnings.length, 1);

  const overYear = evaluateOvertimeThresholds(45, 240);
  assert.equal(overYear.exceedsMonthly40, true);
  assert.equal(overYear.exceedsYearly200, true);
  assert.equal(overYear.exceedsYearly300, false);
  assert.equal(overYear.warnings.length, 2);
});

test("thiếu dữ liệu chấm công không được tự động miễn đóng BHXH mà phải đánh dấu cần HR đối chiếu", () => {
  // Nhân viên mới chỉ có 5/22 ngày chấm công, nhưng 0 ngày nghỉ không lương/nghỉ ốm xác nhận (17 ngày thiếu dữ liệu công)
  const missingDataCase = calculateStatutoryInsurance(20_000_000, 22, 5, 10, 2026, {
    confirmedUnpaidDays: 0,
    confirmedSickDays: 0,
    midMonthUnworkedDays: 0,
    missingAttendanceDays: 17,
  });
  assert.equal(missingDataCase.exempt, false);
  assert.equal(missingDataCase.needsHrReconciliation, true);
  assert.equal(missingDataCase.total, 2_100_000);

  // Nghỉ không lương 10 ngày + nghỉ ốm 3 ngày = 13 ngày (< 14 ngày): chưa đủ ngưỡng miễn đóng
  const belowThreshold = calculateStatutoryInsurance(20_000_000, 22, 9, 10, 2026, {
    confirmedUnpaidDays: 10,
    confirmedSickDays: 3,
    midMonthUnworkedDays: 0,
    missingAttendanceDays: 0,
  });
  assert.equal(belowThreshold.exempt, false);
  assert.equal(belowThreshold.needsHrReconciliation, false);
  assert.equal(belowThreshold.total, 2_100_000);

  // Nghỉ không lương 10 ngày + nghỉ ốm 4 ngày = 14 ngày (≥ 14 ngày đã xác nhận): miễn đóng hợp lệ
  const confirmedExempt = calculateStatutoryInsurance(20_000_000, 22, 8, 10, 2026, {
    confirmedUnpaidDays: 10,
    confirmedSickDays: 4,
    midMonthUnworkedDays: 0,
    missingAttendanceDays: 0,
  });
  assert.equal(confirmedExempt.exempt, true);
  assert.equal(confirmedExempt.needsHrReconciliation, false);
  assert.equal(confirmedExempt.total, 0);
});

test("trần BHTN tính đúng theo từng vùng (I, II, III, IV) và không tự suy diễn mức pháp lý cho năm tương lai chưa cấu hình", () => {
  // Năm 2026 (NĐ 293/2025/NĐ-CP): Vùng II = 4.730.000đ -> trần BHTN = 94.600.000đ; Vùng IV = 3.700.000đ -> trần BHTN = 74.000.000đ
  const region2 = calculateStatutoryInsurance(100_000_000, 22, 22, 10, 2026, {
    confirmedUnpaidDays: 0,
    confirmedSickDays: 0,
    missingAttendanceDays: 0,
    region: "II",
    regionConfirmed: true,
  });
  assert.equal(region2.region, "II");
  assert.equal(region2.regionConfirmed, true);
  assert.equal(region2.bhtnBase, 94_600_000);
  assert.equal(region2.bhtn, 946_000);

  const region4 = calculateStatutoryInsurance(100_000_000, 22, 22, 10, 2026, {
    confirmedUnpaidDays: 0,
    confirmedSickDays: 0,
    missingAttendanceDays: 0,
    region: "IV",
  });
  assert.equal(region4.bhtnBase, 74_000_000);
  assert.equal(region4.bhtn, 740_000);

  // Năm 2025 (NĐ 74/2024/NĐ-CP): Vùng III = 3.860.000đ -> trần BHTN = 77.200.000đ
  const region3_2025 = calculateStatutoryInsurance(90_000_000, 22, 22, 12, 2025, {
    confirmedUnpaidDays: 0,
    confirmedSickDays: 0,
    missingAttendanceDays: 0,
    region: "III",
  });
  assert.equal(region3_2025.bhtnBase, 77_200_000);
  assert.equal(region3_2025.bhxhBhytBase, 46_800_000);

  // Năm 2028 chưa cấu hình phải từ chối, không tự áp dụng ngầm mức 2026
  assert.throws(
    () => calculateStatutoryInsurance(20_000_000, 22, 22, 1, 2028),
    /Chưa cấu hình mức tham chiếu BHXH và lương tối thiểu vùng cho năm 2028/
  );
});

test("buildManualPayrollDetails không dùng giả định 22 ngày công và khớp 100% với số tiền thực trừ", () => {
  const manualDetails = buildManualPayrollDetails(15_000_000, 2_000_000, 3_500_000);
  const earningSum = manualDetails
    .filter((d) => d.type === "EARNING")
    .reduce((sum, d) => sum + d.amount, 0);
  const deductionSum = manualDetails
    .filter((d) => d.type === "DEDUCTION" && d.amountType !== "DAYS")
    .reduce((sum, d) => sum + d.amount, 0);

  assert.equal(earningSum, 17_000_000);
  assert.equal(deductionSum, 3_500_000);
  assert.ok(!manualDetails.some((d) => d.name.includes("BHXH 8%")));
});

test("chuẩn hóa ngày hiệu lực quyết định hỗ trợ cả YYYY-MM-DD, DD/MM/YYYY và múi giờ Asia/Ho_Chi_Minh", () => {
  assert.equal(normalizeEffectiveDateString("2026-10-20"), "2026-10-20");
  assert.equal(normalizeEffectiveDateString("20/10/2026"), "2026-10-20");
  // Ngày 01/11/2026 (DD/MM/YYYY) phải là 2026-11-01, tuyệt đối không bị hiểu nhầm thành 2026-01-11
  assert.equal(normalizeEffectiveDateString("01/11/2026"), "2026-11-01");
  // Thời điểm 2026-10-16T18:30:00.000Z theo giờ Việt Nam (UTC+7) là ngày 2026-10-17 (01:30 sáng)
  assert.equal(
    formatVietnamDate(new Date("2026-10-16T18:30:00.000Z")),
    "2026-10-17"
  );
});

