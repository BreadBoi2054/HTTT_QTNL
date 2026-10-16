import assert from "node:assert/strict";
import test from "node:test";
import { calculateWorkingDays, workingDaysInYear } from "../src/services/leave.service";
import { bulkDisbursePayrolls, calculateVietnamesePIT, getPayrolls } from "../src/services/payroll.service";
import { holidayDatesForYear, monthlyWorkdays } from "../src/lib/work-calendar";
import { createOvertimeRequest } from "../src/services/overtime.service";

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
