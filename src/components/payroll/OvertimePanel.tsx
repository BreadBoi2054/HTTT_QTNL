"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock3, Plus, Check, X } from "lucide-react";

type RequestRecord = {
  id: string;
  employeeId: string;
  employee: { userId: string; user: { name: string }; department: { name: string } | null };
  date: string;
  hours: number;
  reason: string | null;
  status: string;
};

export default function OvertimePanel({ userId, roleName, onApproved }: { userId?: string; roleName: string; onApproved: () => void }) {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [employees, setEmployees] = useState<Array<{ id: string; user: { name: string } }>>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState(1);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const canCreateForOthers = ["SYSTEM_ADMIN", "BOD", "HR"].includes(roleName);
  const canApprove = ["SYSTEM_ADMIN", "BOD", "HR", "MANAGER"].includes(roleName);

  const reload = useCallback(async () => {
    const res = await fetch("/api/overtime");
    if (!res.ok) throw new Error("Không tải được đơn OT.");
    setRequests(await res.json());
  }, []);

  useEffect(() => {
    fetch("/api/overtime")
      .then((res) => { if (!res.ok) throw new Error("Không tải được đơn OT."); return res.json(); })
      .then((data) => setRequests(data))
      .catch((err) => setError(err.message));
    if (canCreateForOthers) fetch("/api/employees").then((res) => res.json()).then((data) => setEmployees(Array.isArray(data) ? data : [])).catch(() => {});
  }, [canCreateForOthers]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(""); setBusy(true);
    try {
      const res = await fetch("/api/overtime", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ employeeId: canCreateForOthers && employeeId ? employeeId : undefined, date, hours, reason }) });
      if (!res.ok) throw new Error(await res.text());
      setReason(""); await reload();
    } catch (err) { setError(err instanceof Error ? err.message : "Không tạo được đơn OT."); }
    finally { setBusy(false); }
  }

  async function decide(id: string, status: "APPROVED" | "REJECTED") {
    setError(""); setBusy(true);
    try {
      const res = await fetch(`/api/overtime/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error(await res.text());
      await reload(); onApproved();
    } catch (err) { setError(err instanceof Error ? err.message : "Không duyệt được đơn OT."); }
    finally { setBusy(false); }
  }

  return <section className="bento-card p-5 space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div><h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><Clock3 className="w-4 h-4 text-blue-600" /> Đề nghị & duyệt OT</h2><p className="text-xs text-zinc-500 mt-1">Chỉ đơn đã duyệt mới vào bảng lương tự động. Ngày thường 150%, cuối tuần 200%, ngày lễ 300%.</p></div>
      <span className="text-[11px] font-mono text-zinc-500">{requests.filter((item) => item.status === "PENDING").length} chờ duyệt</span>
    </div>
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2 text-xs">
      {canCreateForOthers && <label className="min-w-44 flex-1 space-y-1"><span className="text-zinc-500">Nhân viên (để trống = tôi)</span><select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2"><option value="">Bản thân</option>{employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.user.name}</option>)}</select></label>}
      <label className="space-y-1"><span className="text-zinc-500">Ngày OT</span><input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="block rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2" /></label>
      <label className="space-y-1"><span className="text-zinc-500">Số giờ</span><input required type="number" min="0.5" max="12" step="0.5" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="block w-20 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2" /></label>
      <label className="min-w-36 flex-1 space-y-1"><span className="text-zinc-500">Lý do</span><input value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} className="block w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2" /></label>
      <button disabled={busy} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 text-white px-3 py-2 font-semibold disabled:opacity-50"><Plus className="w-3.5 h-3.5" /> Gửi đề nghị</button>
    </form>
    {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
    <div className="max-h-56 overflow-auto divide-y divide-zinc-100 dark:divide-zinc-800">
      {requests.length === 0 && <p className="text-xs text-zinc-500 py-2">Chưa có đơn OT.</p>}
      {requests.map((item) => <div key={item.id} className="py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div><strong className="text-zinc-900 dark:text-zinc-100">{item.employee.user.name}</strong><span className="text-zinc-500"> · {new Date(item.date).toLocaleDateString("vi-VN")} · {item.hours} giờ{item.reason ? ` · ${item.reason}` : ""}</span></div>
        <div className="flex items-center gap-2"><span className={item.status === "APPROVED" ? "text-emerald-600" : item.status === "REJECTED" ? "text-rose-600" : "text-amber-600"}>{item.status === "APPROVED" ? "Đã duyệt" : item.status === "REJECTED" ? "Từ chối" : "Chờ duyệt"}</span>{canApprove && item.status === "PENDING" && item.employee.userId !== userId && <><button disabled={busy} onClick={() => decide(item.id, "APPROVED")} title="Duyệt" className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 disabled:opacity-50"><Check className="w-4 h-4" /></button><button disabled={busy} onClick={() => decide(item.id, "REJECTED")} title="Từ chối" className="p-1.5 rounded-md bg-rose-50 text-rose-700 disabled:opacity-50"><X className="w-4 h-4" /></button></>}</div>
      </div>)}
    </div>
  </section>;
}
