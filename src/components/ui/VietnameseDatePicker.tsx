"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from "lucide-react";

const WEEKDAYS_VI = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const DAY_NAMES_FULL_VI = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

export function formatIsoToVi(iso: string, includeWeekday = true): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (!Number.isFinite(dt.getTime())) return iso;
  const dd = String(d).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  if (!includeWeekday) return `${dd}/${mm}/${y}`;
  const dow = DAY_NAMES_FULL_VI[dt.getUTCDay()];
  return `${dd}/${mm}/${y} (${dow})`;
}

export function formatIsoShortChip(iso: string): { dateText: string; dowText: string } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return { dateText: iso, dowText: "" };
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dowIdx = dt.getUTCDay();
  const dowShort = dowIdx === 0 ? "CN" : `T${dowIdx + 1}`;
  return {
    dateText: `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`,
    dowText: dowShort,
  };
}

interface VietnameseDatePickerProps {
  value: string;
  onChange: (isoDate: string) => void;
  onSelectImmediate?: (isoDate: string) => void;
  lockedYear?: number;
  onlyWeekends?: boolean;
  highlightedHolidays?: string[];
  highlightedWorkdays?: string[];
  placeholder?: string;
  ariaLabel?: string;
  accentTone?: "teal" | "rose" | "emerald";
  openRef?: React.MutableRefObject<(() => void) | null>;
  disabled?: boolean;
  min?: string;
}

export default function VietnameseDatePicker({
  value,
  onChange,
  onSelectImmediate,
  lockedYear,
  onlyWeekends = false,
  highlightedHolidays = [],
  highlightedWorkdays = [],
  placeholder = "Chọn ngày (DD/MM/YYYY)...",
  ariaLabel = "Chọn ngày",
  accentTone = "teal",
  openRef,
  disabled = false,
  min,
}: VietnameseDatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const initialYear = useMemo(() => {
    if (lockedYear && Number.isInteger(lockedYear)) return lockedYear;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return Number(value.slice(0, 4));
    return new Date().getFullYear();
  }, [lockedYear, value]);

  const initialMonth = useMemo(() => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return Number(value.slice(5, 7));
    return new Date().getMonth() + 1;
  }, [value]);

  const [viewYear, setViewYear] = useState<number>(initialYear);
  const [viewMonth, setViewMonth] = useState<number>(initialMonth);

  useEffect(() => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      setViewYear(Number(value.slice(0, 4)));
      setViewMonth(Number(value.slice(5, 7)));
    }
  }, [value]);

  useEffect(() => {
    if (lockedYear && Number.isInteger(lockedYear)) {
      setViewYear(lockedYear);
    }
  }, [lockedYear]);

  useEffect(() => {
    if (openRef) {
      openRef.current = () => setOpen(true);
    }
  }, [openRef]);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const holidaySet = useMemo(() => new Set(highlightedHolidays), [highlightedHolidays]);
  const workdaySet = useMemo(() => new Set(highlightedWorkdays), [highlightedWorkdays]);

  const calendarCells = useMemo(() => {
    const firstDayUtc = new Date(Date.UTC(viewYear, viewMonth - 1, 1));
    // Convert Sunday (0) .. Saturday (6) into Monday-first index (0..6)
    const startOffset = (firstDayUtc.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(viewYear, viewMonth, 0)).getUTCDate();

    const cells: Array<{
      iso: string;
      day: number;
      inCurrentMonth: boolean;
      isWeekend: boolean;
      isHoliday: boolean;
      isExtraWorkday: boolean;
    }> = [];

    // Previous month trailing days
    const prevMonthDays = new Date(Date.UTC(viewYear, viewMonth - 1, 0)).getUTCDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const dt = new Date(Date.UTC(viewYear, viewMonth - 2, d));
      const iso = dt.toISOString().slice(0, 10);
      const dow = dt.getUTCDay();
      cells.push({
        iso,
        day: d,
        inCurrentMonth: false,
        isWeekend: dow === 0 || dow === 6,
        isHoliday: holidaySet.has(iso),
        isExtraWorkday: workdaySet.has(iso),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(Date.UTC(viewYear, viewMonth - 1, d));
      const iso = dt.toISOString().slice(0, 10);
      const dow = dt.getUTCDay();
      cells.push({
        iso,
        day: d,
        inCurrentMonth: true,
        isWeekend: dow === 0 || dow === 6,
        isHoliday: holidaySet.has(iso),
        isExtraWorkday: workdaySet.has(iso),
      });
    }

    // Next month leading days to fill 42 cells (6 rows)
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const dt = new Date(Date.UTC(viewYear, viewMonth, d));
      const iso = dt.toISOString().slice(0, 10);
      const dow = dt.getUTCDay();
      cells.push({
        iso,
        day: d,
        inCurrentMonth: false,
        isWeekend: dow === 0 || dow === 6,
        isHoliday: holidaySet.has(iso),
        isExtraWorkday: workdaySet.has(iso),
      });
    }

    return cells;
  }, [viewYear, viewMonth, holidaySet, workdaySet]);

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      if (!lockedYear) {
        setViewYear((y) => y - 1);
        setViewMonth(12);
      } else {
        setViewMonth(12);
      }
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      if (!lockedYear) {
        setViewYear((y) => y + 1);
        setViewMonth(1);
      } else {
        setViewMonth(1);
      }
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handlePickDay = (iso: string, inCurrentMonth: boolean, isWeekend: boolean) => {
    if (!inCurrentMonth && lockedYear && !iso.startsWith(`${lockedYear}-`)) {
      return;
    }
    if (onlyWeekends && !isWeekend) {
      return;
    }
    onChange(iso);
    if (onSelectImmediate) {
      onSelectImmediate(iso);
    }
    setOpen(false);
  };

  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-[210px]">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`w-full h-9 px-3 rounded-lg border text-left text-xs flex items-center justify-between gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          open
            ? "border-[#1b6c80] ring-2 ring-[#1b6c80]/15 bg-white dark:bg-zinc-900"
            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-600"
        }`}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          <CalendarIcon className="w-3.5 h-3.5 text-[#1b6c80] dark:text-[#2ba3be] shrink-0" />
          {value ? (
            <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {formatIsoToVi(value)}
            </span>
          ) : (
            <span className="text-zinc-500 dark:text-zinc-400 truncate">{placeholder}</span>
          )}
        </span>
        <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0">
          Lịch {viewYear}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={`Bảng chọn lịch năm ${viewYear}`}
          className="absolute left-0 top-full mt-1.5 z-50 w-[316px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#121518] p-3.5 shadow-xl space-y-3 select-none"
        >
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-7 h-7 rounded-md border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Tháng {String(viewMonth).padStart(2, "0")} / {viewYear}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-7 h-7 rounded-md border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 12-Month Quick Jump Strip */}
          <div className="grid grid-cols-6 gap-1 pt-0.5">
            {Array.from({ length: 12 }, (_, idx) => {
              const m = idx + 1;
              const isCurrent = m === viewMonth;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setViewMonth(m)}
                  className={`py-1 rounded text-[11px] font-medium transition-colors ${
                    isCurrent
                      ? "bg-[#1b6c80] text-white"
                      : "bg-zinc-50 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  T{m}
                </button>
              );
            })}
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center border-t border-zinc-100 dark:border-zinc-800 pt-2">
            {WEEKDAYS_VI.map((dayName, i) => (
              <div
                key={dayName}
                className={`text-[11px] font-semibold py-0.5 ${
                  i >= 5 ? "text-[#1b6c80] dark:text-[#2ba3be]" : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar Day Matrix */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell) => {
              const disabledByYear = Boolean(lockedYear && !cell.iso.startsWith(`${lockedYear}-`));
              const disabledByRule = onlyWeekends && !cell.isWeekend;
              const disabledByMin = Boolean(min && cell.iso < min);
              const isDisabled = disabledByYear || disabledByRule || disabledByMin || !cell.inCurrentMonth;
              const isSelected = value === cell.iso;
              const isAlreadyMarked =
                (accentTone === "rose" && cell.isHoliday) ||
                (accentTone === "emerald" && cell.isExtraWorkday);

              return (
                <button
                  key={cell.iso}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handlePickDay(cell.iso, cell.inCurrentMonth, cell.isWeekend)}
                  title={
                    disabledByRule
                      ? "Ngày làm bù chỉ áp dụng cho Thứ Bảy hoặc Chủ nhật"
                      : cell.isHoliday
                      ? `${formatIsoToVi(cell.iso, false)} · Đã có trong danh sách nghỉ lễ`
                      : cell.isExtraWorkday
                      ? `${formatIsoToVi(cell.iso, false)} · Đã có trong danh sách làm bù`
                      : formatIsoToVi(cell.iso)
                  }
                  className={`relative h-8 rounded-md text-xs font-mono flex items-center justify-center transition-colors ${
                    !cell.inCurrentMonth
                      ? "text-zinc-300 dark:text-zinc-700 cursor-default"
                      : disabledByRule
                      ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed line-through"
                      : isSelected
                      ? "bg-[#1b6c80] text-white font-semibold"
                      : isAlreadyMarked
                      ? accentTone === "rose"
                        ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold border border-rose-300 dark:border-rose-800"
                        : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800"
                      : cell.isHoliday
                      ? "bg-rose-50/70 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                      : cell.isExtraWorkday
                      ? "bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                      : cell.isWeekend
                      ? "text-[#1b6c80] dark:text-[#2ba3be] font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      : "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span>{cell.day}</span>
                  {cell.iso === todayIso && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#1b6c80]" />
                  )}
                  {isAlreadyMarked && !isSelected && (
                    <Check className="w-2.5 h-2.5 absolute top-0.5 right-0.5 opacity-80" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer helper */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>
              {onlyWeekends
                ? "Chỉ chọn được Thứ Bảy (T7) & Chủ nhật (CN)"
                : onSelectImmediate
                ? "Bấm vào ngày bất kỳ để thêm/bỏ chọn ngay"
                : "Bấm vào ngày để chọn"}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
