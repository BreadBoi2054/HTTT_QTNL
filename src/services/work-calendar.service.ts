import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { defaultWorkCalendar, monthlyWorkdays, type WorkCalendar } from "@/lib/work-calendar";

type DatabaseClient = Prisma.TransactionClient | typeof prisma;

function validateDates(year: number, input: unknown, field: string): string[] {
  if (!Array.isArray(input) || input.length > 366 || input.some((item) => typeof item !== "string")) {
    throw new Error(`Danh sách ${field} không hợp lệ.`);
  }
  const dates = input.map((date: string) => date.trim());
  if (new Set(dates).size !== dates.length) throw new Error(`Danh sách ${field} có ngày trùng.`);
  for (const date of dates) {
    const parsed = new Date(`${date}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !date.startsWith(`${year}-`) ||
        !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
      throw new Error(`Ngày ${date} trong ${field} không hợp lệ.`);
    }
  }
  return dates.sort();
}

export async function getWorkCalendar(year: number, client: DatabaseClient = prisma): Promise<WorkCalendar & { source: "configured" | "default" }> {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new Error("Năm không hợp lệ.");
  const configured = await client.workCalendarYear.findUnique({ where: { year } });
  if (configured) {
    return {
      holidays: new Set(configured.holidays as string[]),
      extraWorkdays: new Set(configured.extraWorkdays as string[]),
      source: "configured",
    };
  }
  return { ...defaultWorkCalendar(year), source: "default" };
}

export async function getCalendarSummary(year: number) {
  const calendar = await getWorkCalendar(year);
  return {
    year,
    source: calendar.source,
    holidays: [...calendar.holidays].sort(),
    extraWorkdays: [...calendar.extraWorkdays].sort(),
    months: Array.from({ length: 12 }, (_, index) => monthlyWorkdays(year, index + 1, calendar.holidays, calendar.extraWorkdays)),
  };
}

export async function saveWorkCalendar(year: number, holidaysInput: unknown, extraWorkdaysInput: unknown, actorName: string, actorRole: string) {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new Error("Năm không hợp lệ.");
  const holidays = validateDates(year, holidaysInput, "ngày nghỉ");
  const extraWorkdays = validateDates(year, extraWorkdaysInput, "ngày làm bù");
  if (extraWorkdays.some((date) => holidays.includes(date))) throw new Error("Một ngày không thể vừa nghỉ vừa làm bù.");
  if (extraWorkdays.some((date) => {
    const day = new Date(`${date}T00:00:00.000Z`).getUTCDay();
    return day !== 0 && day !== 6;
  })) throw new Error("Ngày làm bù phải là thứ Bảy hoặc Chủ nhật.");
  if (Array.from({ length: 12 }, (_, index) => monthlyWorkdays(year, index + 1, new Set(holidays), new Set(extraWorkdays))).some((days) => days === 0)) {
    throw new Error("Lịch có tháng không còn ngày làm việc.");
  }

  return prisma.$transaction(async (tx) => {
    const current = await getWorkCalendar(year, tx).catch((error) => {
      if (error instanceof Error && error.message.includes("Chưa cấu hình lịch nghỉ lễ")) {
        return { holidays: new Set<string>(), extraWorkdays: new Set<string>(), source: "default" as const };
      }
      throw error;
    });
    const paidPayrolls = await tx.payroll.findMany({ where: { year, status: "PAID" }, select: { month: true }, distinct: ["month"] });
    const paidMonths = new Set(paidPayrolls.map((item) => item.month));
    const changedDates = [
      ...[...current.holidays].filter((date) => !holidays.includes(date)),
      ...holidays.filter((date) => !current.holidays.has(date)),
      ...[...current.extraWorkdays].filter((date) => !extraWorkdays.includes(date)),
      ...extraWorkdays.filter((date) => !current.extraWorkdays.has(date)),
    ];
    if (changedDates.some((date) => paidMonths.has(Number(date.slice(5, 7))))) {
      throw new Error("Không thể đổi ngày nghỉ hoặc ngày làm bù của tháng đã có phiếu lương PAID.");
    }
    const saved = await tx.workCalendarYear.upsert({
      where: { year },
      update: { holidays, extraWorkdays, updatedBy: actorName },
      create: { year, holidays, extraWorkdays, updatedBy: actorName },
    });
    await tx.auditLog.create({ data: {
      userName: actorName,
      userRole: actorRole,
      action: `Cập nhật lịch công ${year}: ${holidays.length} ngày nghỉ, ${extraWorkdays.length} ngày làm bù`,
      target: "WorkCalendarYear", ip: "127.0.0.1", status: "SUCCESS",
    } });
    return saved;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000 });
}
