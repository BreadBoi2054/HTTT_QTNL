"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Plus, Trash2, Save } from "lucide-react";

type CalendarSummary = {
  year: number;
  source: "configured" | "default";
  holidays: string[];
  extraWorkdays: string[];
  months: number[];
};

export default function CalendarPanel() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [holidays, setHolidays] = useState<string[]>([]);
  const [extraWorkdays, setExtraWorkdays] = useState<string[]>([]);
  const [newHoliday, setNewHoliday] = useState("");
  const [newWorkday, setNewWorkday] = useState("");
  const [summary, setSummary] = useState<CalendarSummary | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/work-calendar?year=${year}`)
      .then(async (res) => { if (!res.ok) throw new Error(await res.text()); return res.json(); })
      .then((data: CalendarSummary) => {
        if (!active) return;
        setSummary(data);
        setHolidays(data.holidays);
        setExtraWorkdays(data.extraWorkdays);
        setMessage("");
      })
      .catch((err) => {
        if (!active) return;
        setSummary(null);
        setHolidays([]);
        setExtraWorkdays([]);
        setMessage(err.message || "Chưa có lịch cho năm này.");
      });
    return () => { active = false; };
  }, [year]);

  function addDate(date: string, current: string[], update: (dates: string[]) => void, clear: (value: string) => void) {
    if (!date || !date.startsWith(`${year}-`) || current.includes(date)) return;
    update([...current, date].sort());
    clear("");
    setMessage("");
  }

  async function save() {
    setSaving(true); setMessage("");
    try {
      const res = await fetch("/api/work-calendar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, holidays, extraWorkdays }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: CalendarSummary = await res.json();
      setSummary(data); setHolidays(data.holidays); setExtraWorkdays(data.extraWorkdays);
      setMessage("Đã lưu lịch công. Hãy chạy lại bảng lương nháp để cập nhật số ngày công.");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Không lưu được lịch công."); }
    finally { setSaving(false); }
  }

  return <section className="bento-card p-5 space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-blue-600" /> Lịch công & ngày nghỉ</h2><p className="text-xs text-zinc-500 mt-1">Lịch này dùng chung cho công chuẩn, phép năm và hệ số OT ngày lễ. Tháng đã có phiếu PAID sẽ không cho đổi lịch.</p></div>
      <div className="flex items-center gap-2 text-xs"><label htmlFor="calendar-year" className="text-zinc-500">Năm</label><input id="calendar-year" type="number" min="2000" max="2100" value={year} onChange={(event) => setYear(Number(event.target.value))} className="w-20 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 font-mono" /><span className="text-zinc-500">{summary?.source === "configured" ? "Đã cấu hình" : summary ? "Lịch mặc định" : "Chưa cấu hình"}</span></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 space-y-2">
        <div className="font-semibold text-zinc-900 dark:text-zinc-100">Ngày nghỉ lễ / nghỉ bù ({holidays.length})</div>
        <div className="flex gap-2"><input aria-label="Thêm ngày nghỉ" type="date" value={newHoliday} onChange={(event) => setNewHoliday(event.target.value)} className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2" /><button onClick={() => addDate(newHoliday, holidays, setHolidays, setNewHoliday)} className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-2" aria-label="Thêm ngày nghỉ"><Plus className="w-4 h-4" /></button></div>
        <div className="max-h-44 overflow-auto flex flex-wrap gap-1.5">{holidays.map((date) => <span key={date} className="inline-flex items-center gap-1 rounded-md bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 px-2 py-1 font-mono">{date}<button aria-label={`Xóa ngày nghỉ ${date}`} onClick={() => setHolidays(holidays.filter((item) => item !== date))}><Trash2 className="w-3 h-3" /></button></span>)}</div>
      </div>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 space-y-2">
        <div className="font-semibold text-zinc-900 dark:text-zinc-100">Ngày làm bù cuối tuần ({extraWorkdays.length})</div>
        <div className="flex gap-2"><input aria-label="Thêm ngày làm bù" type="date" value={newWorkday} onChange={(event) => setNewWorkday(event.target.value)} className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2" /><button onClick={() => addDate(newWorkday, extraWorkdays, setExtraWorkdays, setNewWorkday)} className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-2" aria-label="Thêm ngày làm bù"><Plus className="w-4 h-4" /></button></div>
        <div className="max-h-44 overflow-auto flex flex-wrap gap-1.5">{extraWorkdays.map((date) => <span key={date} className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 font-mono">{date}<button aria-label={`Xóa ngày làm bù ${date}`} onClick={() => setExtraWorkdays(extraWorkdays.filter((item) => item !== date))}><Trash2 className="w-3 h-3" /></button></span>)}</div>
      </div>
    </div>
    {summary && <div><p className="mb-1.5 text-[11px] text-zinc-500">Số ngày công chuẩn theo lịch đã lưu</p><div className="grid grid-cols-6 md:grid-cols-12 gap-1.5">{summary.months.map((days, index) => <div key={index} className="rounded-md bg-zinc-50 dark:bg-zinc-900 p-2 text-center"><div className="text-[10px] text-zinc-500">T{index + 1}</div><div className="font-mono text-xs font-bold">{days}</div></div>)}</div></div>}
    <div className="flex flex-wrap items-center justify-between gap-2"><p role="status" className="text-xs text-zinc-600 dark:text-zinc-300">{message || "Kiểm tra đủ các ngày nghỉ của năm trước khi lưu; công chuẩn sẽ được tính lại khi chạy lương."}</p><button disabled={saving || !Number.isInteger(year) || year < 2000 || year > 2100} onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><Save className="w-3.5 h-3.5" /> Lưu lịch công</button></div>
  </section>;
}
