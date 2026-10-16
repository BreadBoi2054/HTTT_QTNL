// Lịch mặc định 2026: 1/1, Tết 16–20/2, nghỉ bù Giỗ Tổ 27/4,
// 30/4–1/5, Quốc khánh 1–2/9 và Ngày Văn hóa Việt Nam 24/11.
// Doanh nghiệp có thể ghi đè toàn bộ danh sách qua PAYROLL_HOLIDAYS_YYYY
// (các ngày YYYY-MM-DD, phân tách bằng dấu phẩy) theo lịch nghỉ đã công bố.
const DEFAULT_HOLIDAYS: Record<number, string[]> = {
  2026: [
    "2026-01-01",
    "2026-02-16", "2026-02-17", "2026-02-18", "2026-02-19", "2026-02-20",
    "2026-04-27", "2026-04-30", "2026-05-01",
    "2026-09-01", "2026-09-02", "2026-11-24",
  ],
};

export type WorkCalendar = { holidays: Set<string>; extraWorkdays: Set<string> };

function parseYearDates(value: string | undefined, year: number, setting: string): Set<string> {
  const dates = value?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  for (const date of dates) {
    const parsed = new Date(`${date}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !date.startsWith(`${year}-`) ||
        !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
      throw new Error(`Ngày không hợp lệ trong ${setting}: ${date}`);
    }
  }
  return new Set(dates);
}

export function holidayDatesForYear(year: number): Set<string> {
  const custom = process.env[`PAYROLL_HOLIDAYS_${year}`];
  const dates = custom !== undefined ? custom : DEFAULT_HOLIDAYS[year]?.join(",");
  if (dates === undefined) throw new Error(`Chưa cấu hình lịch nghỉ lễ năm ${year}; không thể tính công chuẩn chính xác.`);
  return parseYearDates(dates, year, `PAYROLL_HOLIDAYS_${year}`);
}

export function defaultWorkCalendar(year: number): WorkCalendar {
  const holidays = holidayDatesForYear(year);
  const extraWorkdays = parseYearDates(process.env[`PAYROLL_EXTRA_WORKDAYS_${year}`], year, `PAYROLL_EXTRA_WORKDAYS_${year}`);
  for (const date of extraWorkdays) if (holidays.has(date)) throw new Error(`Ngày ${date} vừa là ngày nghỉ vừa là ngày làm bù.`);
  for (const date of extraWorkdays) {
    const day = new Date(`${date}T00:00:00.000Z`).getUTCDay();
    if (day !== 0 && day !== 6) throw new Error(`Ngày làm bù ${date} phải là thứ Bảy hoặc Chủ nhật.`);
  }
  return { holidays, extraWorkdays };
}

export function isScheduledWorkday(date: Date, holidays: Set<string>, extraWorkdays: Set<string> = new Set()): boolean {
  const dateKey = date.toISOString().slice(0, 10);
  if (extraWorkdays.has(dateKey)) return true;
  const day = date.getUTCDay();
  return day !== 0 && day !== 6 && !holidays.has(dateKey);
}

export function monthlyWorkdays(year: number, month: number, holidays = holidayDatesForYear(year), extraWorkdays: Set<string> = new Set()): number {
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new Error("Tháng không hợp lệ.");
  let count = 0;
  for (let day = 1; day <= new Date(Date.UTC(year, month, 0)).getUTCDate(); day++) {
    if (isScheduledWorkday(new Date(Date.UTC(year, month - 1, day)), holidays, extraWorkdays)) count++;
  }
  return count;
}
