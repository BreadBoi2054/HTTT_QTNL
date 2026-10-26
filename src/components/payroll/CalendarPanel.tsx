"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Plus, Trash2, Save, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import VietnameseDatePicker, { formatIsoShortChip, formatIsoToVi } from "@/components/ui/VietnameseDatePicker";

type CalendarSummary = {
  year: number;
  source: "configured" | "default";
  holidays: string[];
  extraWorkdays: string[];
  months: number[];
};

const DEFAULT_VN_HOLIDAYS_2026 = [
  "2026-01-01",
  "2026-02-16",
  "2026-02-17",
  "2026-02-18",
  "2026-02-19",
  "2026-02-20",
  "2026-04-27",
  "2026-04-30",
  "2026-05-01",
  "2026-09-01",
  "2026-09-02",
  "2026-11-24",
];

function computeMonthlyWorkdaysClient(year: number, holidays: string[], extraWorkdays: string[]): number[] {
  const holidaySet = new Set(holidays);
  const extraSet = new Set(extraWorkdays);
  return Array.from({ length: 12 }, (_, idx) => {
    const month = idx + 1;
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    let count = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dt = new Date(Date.UTC(year, month - 1, day));
      const iso = dt.toISOString().slice(0, 10);
      if (extraSet.has(iso)) {
        count++;
        continue;
      }
      const dow = dt.getUTCDay();
      if (dow !== 0 && dow !== 6 && !holidaySet.has(iso)) {
        count++;
      }
    }
    return count;
  });
}

export default function CalendarPanel() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [holidays, setHolidays] = useState<string[]>([]);
  const [extraWorkdays, setExtraWorkdays] = useState<string[]>([]);
  const [newHoliday, setNewHoliday] = useState("");
  const [newWorkday, setNewWorkday] = useState("");
  const [summary, setSummary] = useState<CalendarSummary | null>(null);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"neutral" | "success" | "warning" | "error">("neutral");
  const [saving, setSaving] = useState(false);

  const openHolidayPickerRef = useRef<(() => void) | null>(null);
  const openWorkdayPickerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let active = true;
    setNewHoliday("");
    setNewWorkday("");
    fetch(`/api/work-calendar?year=${year}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data: CalendarSummary) => {
        if (!active) return;
        setSummary(data);
        setHolidays(data.holidays);
        setExtraWorkdays(data.extraWorkdays);
        setMessage("");
        setMessageTone("neutral");
      })
      .catch((err) => {
        if (!active) return;
        const fallbackHolidays = [
          `${year}-01-01`,
          `${year}-04-30`,
          `${year}-05-01`,
          `${year}-09-02`,
        ];
        setSummary(null);
        setHolidays(fallbackHolidays);
        setExtraWorkdays([]);
        setMessage(err.message || `Năm ${year} chưa lưu lịch riêng; đang gợi ý các ngày lễ cố định để bạn cấu hình.`);
        setMessageTone("warning");
      });
    return () => {
      active = false;
    };
  }, [year]);

  const isDirty = useMemo(() => {
    if (!summary) return holidays.length > 0 || extraWorkdays.length > 0;
    return (
      JSON.stringify([...holidays].sort()) !== JSON.stringify([...summary.holidays].sort()) ||
      JSON.stringify([...extraWorkdays].sort()) !== JSON.stringify([...summary.extraWorkdays].sort())
    );
  }, [summary, holidays, extraWorkdays]);

  const liveMonths = useMemo(
    () => computeMonthlyWorkdaysClient(year, holidays, extraWorkdays),
    [year, holidays, extraWorkdays]
  );

  const totalAnnualDays = useMemo(
    () => liveMonths.reduce((acc, d) => acc + d, 0),
    [liveMonths]
  );

  function handleSelectHoliday(isoDate: string) {
    if (!isoDate) return;
    const pickedYear = Number(isoDate.slice(0, 4));
    if (pickedYear !== year) {
      setMessage(`Ngày ${formatIsoToVi(isoDate, false)} thuộc năm ${pickedYear}. Hệ thống đang khóa lịch theo năm ${year}.`);
      setMessageTone("warning");
      return;
    }
    if (holidays.includes(isoDate)) {
      setHolidays((prev) => prev.filter((item) => item !== isoDate));
      setMessage(`Đã gỡ ngày nghỉ ${formatIsoToVi(isoDate)}. Bấm "Lưu lịch công" để lưu thay đổi.`);
      setMessageTone("neutral");
      return;
    }
    // Remove from extraWorkdays if it was there to prevent conflict
    if (extraWorkdays.includes(isoDate)) {
      setExtraWorkdays((prev) => prev.filter((item) => item !== isoDate));
    }
    setHolidays((prev) => [...prev, isoDate].sort());
    setNewHoliday(isoDate);
    setMessage(`Đã thêm ngày nghỉ ${formatIsoToVi(isoDate)}. Bấm "Lưu lịch công" để lưu thay đổi.`);
    setMessageTone("success");
  }

  function handleSelectWorkday(isoDate: string) {
    if (!isoDate) return;
    const pickedYear = Number(isoDate.slice(0, 4));
    if (pickedYear !== year) {
      setMessage(`Ngày ${formatIsoToVi(isoDate, false)} thuộc năm ${pickedYear}. Hệ thống đang khóa lịch theo năm ${year}.`);
      setMessageTone("warning");
      return;
    }
    const dow = new Date(`${isoDate}T00:00:00.000Z`).getUTCDay();
    if (dow !== 0 && dow !== 6) {
      setMessage(`Ngày ${formatIsoToVi(isoDate)} là ngày trong tuần. Ngày làm bù chỉ áp dụng cho Thứ Bảy hoặc Chủ nhật.`);
      setMessageTone("error");
      return;
    }
    if (extraWorkdays.includes(isoDate)) {
      setExtraWorkdays((prev) => prev.filter((item) => item !== isoDate));
      setMessage(`Đã gỡ ngày làm bù ${formatIsoToVi(isoDate)}. Bấm "Lưu lịch công" để lưu thay đổi.`);
      setMessageTone("neutral");
      return;
    }
    if (holidays.includes(isoDate)) {
      setHolidays((prev) => prev.filter((item) => item !== isoDate));
    }
    setExtraWorkdays((prev) => [...prev, isoDate].sort());
    setNewWorkday(isoDate);
    setMessage(`Đã thêm ngày làm bù ${formatIsoToVi(isoDate)}. Bấm "Lưu lịch công" để lưu thay đổi.`);
    setMessageTone("success");
  }

  function handleHolidayButtonClick() {
    if (newHoliday && !holidays.includes(newHoliday) && newHoliday.startsWith(`${year}-`)) {
      handleSelectHoliday(newHoliday);
    } else if (openHolidayPickerRef.current) {
      openHolidayPickerRef.current();
    }
  }

  function handleWorkdayButtonClick() {
    if (newWorkday && !extraWorkdays.includes(newWorkday) && newWorkday.startsWith(`${year}-`)) {
      handleSelectWorkday(newWorkday);
    } else if (openWorkdayPickerRef.current) {
      openWorkdayPickerRef.current();
    }
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/work-calendar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, holidays, extraWorkdays }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: CalendarSummary = await res.json();
      setSummary(data);
      setHolidays(data.holidays);
      setExtraWorkdays(data.extraWorkdays);
      setMessage(`Đã lưu lịch công năm ${year} (${data.holidays.length} ngày nghỉ lễ, ${data.extraWorkdays.length} ngày làm bù).`);
      setMessageTone("success");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Không lưu được lịch công.");
      setMessageTone("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bento-card p-5 space-y-4 overflow-visible">
      {/* Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Lịch công & ngày nghỉ</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Lịch này dùng chung cho công chuẩn, phép năm và hệ số OT ngày lễ. Tháng đã có phiếu PAID sẽ không cho đổi lịch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">Năm cấu hình:</span>
          <div className="inline-flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-0.5">
            <button
              type="button"
              onClick={() => setYear((y) => Math.max(2000, y - 1))}
              className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Năm trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <input
              id="calendar-year"
              aria-label="Năm"
              type="number"
              min="2000"
              max="2100"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="w-16 text-center bg-transparent font-mono font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setYear((y) => Math.min(2100, y + 1))}
              className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Năm sau"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border ${
              isDirty
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                : summary?.source === "configured"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
            }`}
          >
            {isDirty
              ? "Có thay đổi chưa lưu"
              : summary?.source === "configured"
              ? "Đã cấu hình"
              : summary
              ? "Lịch mặc định"
              : "Chưa cấu hình"}
          </span>
        </div>
      </div>

      {/* Two Interactive Columns: Holidays & Weekend Extra Workdays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Left Box: Holidays */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 p-3.5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Ngày nghỉ lễ / nghỉ bù</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-rose-100/80 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300">
                {holidays.length} ngày
              </span>
            </div>
            {year === 2026 && (
              <button
                type="button"
                onClick={() => {
                  setHolidays(DEFAULT_VN_HOLIDAYS_2026);
                  setMessage("Đã nạp danh sách 12 ngày nghỉ lễ chuẩn năm 2026. Bấm 'Lưu lịch công' để áp dụng.");
                  setMessageTone("neutral");
                }}
                className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                title="Khôi phục 12 ngày lễ chuẩn năm 2026"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Mặc định 2026</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <VietnameseDatePicker
              value={newHoliday}
              onChange={setNewHoliday}
              onSelectImmediate={handleSelectHoliday}
              lockedYear={year}
              highlightedHolidays={holidays}
              highlightedWorkdays={extraWorkdays}
              accentTone="rose"
              ariaLabel="Thêm ngày nghỉ"
              placeholder={`Chọn ngày nghỉ lễ năm ${year}...`}
              openRef={openHolidayPickerRef}
            />
            <button
              type="button"
              onClick={handleHolidayButtonClick}
              aria-label="Thêm ngày nghỉ"
              className="h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium inline-flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm ngày</span>
            </button>
          </div>

          <div className="max-h-44 overflow-auto flex flex-wrap gap-1.5 pt-0.5">
            {holidays.length === 0 ? (
              <span className="text-zinc-400 text-xs py-2">
                Chưa có ngày nghỉ lễ nào. Bấm vào ô lịch phía trên để chọn ngày.
              </span>
            ) : (
              holidays.map((date) => {
                const { dateText, dowText } = formatIsoShortChip(date);
                return (
                  <span
                    key={date}
                    className="inline-flex items-center gap-1.5 rounded-md border border-rose-200/80 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 px-2.5 py-1 font-mono text-[11px]"
                  >
                    <span>{dateText}</span>
                    <span className="text-[10px] opacity-75 font-sans">({dowText})</span>
                    <button
                      type="button"
                      aria-label={`Xóa ngày nghỉ ${date}`}
                      onClick={() => {
                        setHolidays(holidays.filter((item) => item !== date));
                        setMessage(`Đã xóa ngày nghỉ ${formatIsoToVi(date, false)}. Bấm "Lưu lịch công" để lưu.`);
                        setMessageTone("neutral");
                      }}
                      className="ml-0.5 text-rose-500 hover:text-rose-800 dark:hover:text-rose-200"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                );
              })
            )}
          </div>
        </div>

        {/* Right Box: Weekend Extra Workdays */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 p-3.5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Ngày làm bù cuối tuần</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                {extraWorkdays.length} ngày
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Chỉ áp dụng Thứ Bảy & CN
            </span>
          </div>

          <div className="flex items-center gap-2">
            <VietnameseDatePicker
              value={newWorkday}
              onChange={setNewWorkday}
              onSelectImmediate={handleSelectWorkday}
              lockedYear={year}
              onlyWeekends={true}
              highlightedHolidays={holidays}
              highlightedWorkdays={extraWorkdays}
              accentTone="emerald"
              ariaLabel="Thêm ngày làm bù"
              placeholder={`Chọn T7/CN làm bù năm ${year}...`}
              openRef={openWorkdayPickerRef}
            />
            <button
              type="button"
              onClick={handleWorkdayButtonClick}
              aria-label="Thêm ngày làm bù"
              className="h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium inline-flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm ngày</span>
            </button>
          </div>

          <div className="max-h-44 overflow-auto flex flex-wrap gap-1.5 pt-0.5">
            {extraWorkdays.length === 0 ? (
              <span className="text-zinc-400 text-xs py-2">
                Chưa có ngày làm bù cuối tuần nào trong năm {year}.
              </span>
            ) : (
              extraWorkdays.map((date) => {
                const { dateText, dowText } = formatIsoShortChip(date);
                return (
                  <span
                    key={date}
                    className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 font-mono text-[11px]"
                  >
                    <span>{dateText}</span>
                    <span className="text-[10px] opacity-75 font-sans">({dowText})</span>
                    <button
                      type="button"
                      aria-label={`Xóa ngày làm bù ${date}`}
                      onClick={() => {
                        setExtraWorkdays(extraWorkdays.filter((item) => item !== date));
                        setMessage(`Đã xóa ngày làm bù ${formatIsoToVi(date, false)}. Bấm "Lưu lịch công" để lưu.`);
                        setMessageTone("neutral");
                      }}
                      className="ml-0.5 text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Live 12-Month Standard Workdays Strip */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <span>Số ngày công chuẩn theo lịch ({isDirty ? "đang xem trước thay đổi" : "đã lưu"})</span>
          <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
            Tổng năm {year}: {totalAnnualDays} ngày công
          </span>
        </div>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-1.5">
          {liveMonths.map((days, index) => (
            <div
              key={index}
              className="rounded-lg border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2 text-center"
            >
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">T{index + 1}</div>
              <div className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{days}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Status & Save Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p
          role="status"
          className={`text-xs flex items-center gap-1.5 ${
            messageTone === "success"
              ? "text-emerald-600 dark:text-emerald-400 font-medium"
              : messageTone === "error"
              ? "text-rose-600 dark:text-rose-400 font-medium"
              : messageTone === "warning"
              ? "text-amber-600 dark:text-amber-400 font-medium"
              : "text-zinc-600 dark:text-zinc-300"
          }`}
        >
          {messageTone === "success" && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
          {(messageTone === "error" || messageTone === "warning") && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
          <span>
            {message ||
              "Bấm chọn ngày trên bảng lịch để thêm/gỡ trực tiếp; sau đó bấm 'Lưu lịch công' để cập nhật công chuẩn."}
          </span>
        </p>

        <button
          type="button"
          disabled={saving || !Number.isInteger(year) || year < 2000 || year > 2100}
          onClick={save}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? "Đang lưu..." : "Lưu lịch công"}</span>
        </button>
      </div>
    </section>
  );
}
