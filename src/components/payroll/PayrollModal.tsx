"use client";

import { X, Calculator, Sparkles, UserCheck, Building2, Briefcase, RefreshCw, ShieldCheck, Clock } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  payroll?: any;
}

function calculatePIT(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 10000000) return Math.round(taxableIncome * 0.05);
  if (taxableIncome <= 30000000) return Math.round(taxableIncome * 0.1 - 500000);
  if (taxableIncome <= 60000000) return Math.round(taxableIncome * 0.2 - 3500000);
  if (taxableIncome <= 100000000) return Math.round(taxableIncome * 0.3 - 9500000);
  return Math.round(taxableIncome * 0.35 - 14500000);
}

export default function PayrollModal({ isOpen, onClose, onSuccess, payroll }: PayrollModalProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [empSearch, setEmpSearch] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [contractBase, setContractBase] = useState<number>(0);
  const [workedDays, setWorkedDays] = useState<number>(0);
  const [standardDays, setStandardDays] = useState<number>(0);
  const [calendarError, setCalendarError] = useState("");
  const [dependents, setDependents] = useState<number>(0);
  const [autoStatutory, setAutoStatutory] = useState<boolean>(true);

  const [baseSalary, setBaseSalary] = useState<string>("0");
  const [bonus, setBonus] = useState<string>("0");
  const [deductions, setDeductions] = useState<string>("0");

  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/employees")
        .then((res) => res.json())
        .then((data) => setEmployees(Array.isArray(data) ? data : []))
        .catch(console.error);

      if (payroll) {
        setEmployeeId(payroll.employeeId);
        setMonth(payroll.month);
        setYear(payroll.year);
        setBaseSalary(String(Math.round(payroll.baseSalary || 0)));
        setBonus(String(Math.round(payroll.bonus || 0)));
        setDeductions(String(Math.round(payroll.deductions || 0)));
        setContractBase(Math.round(payroll.baseSalary || 0));
        const dayItem = Array.isArray(payroll.details)
          ? payroll.details.find(
              (d: any) =>
                d?.amountType === "DAYS" &&
                (d?.name?.includes("thực tế") || d?.name?.includes("th?c t?"))
            )
          : null;
        setWorkedDays(dayItem ? Number(dayItem.amount) : 0);
        setAutoStatutory(false);
      } else {
        setEmployeeId("");
        setEmpSearch("");
        setMonth(new Date().getMonth() + 1);
        setYear(new Date().getFullYear());
        setContractBase(0);
        setWorkedDays(0);
        setDependents(0);
        setAutoStatutory(true);
        setBaseSalary("0");
        setBonus("0");
        setDeductions("0");
      }
      setError("");
    }
  }, [payroll, isOpen]);

  useEffect(() => {
    if (!isOpen || !Number.isInteger(month) || !Number.isInteger(year)) return;
    let cancelled = false;
    fetch(`/api/payroll/calendar?month=${month}&year=${year}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setStandardDays(data.workingDays);
        setCalendarError("");
        if (!payroll) setWorkedDays(data.workingDays);
      })
      .catch((err) => {
        if (cancelled) return;
        setStandardDays(0);
        setCalendarError(err.message || "Chưa có lịch công cho kỳ này.");
      });
    return () => { cancelled = true; };
  }, [isOpen, month, year, payroll]);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === employeeId),
    [employees, employeeId]
  );

  const filteredEmployees = useMemo(() => {
    const activeList = employees.filter((e) => e.status !== "RESIGNED");
    if (!empSearch.trim()) return activeList;
    const q = empSearch.toLowerCase();
    return activeList.filter(
      (e) =>
        e.user?.name?.toLowerCase().includes(q) ||
        e.user?.email?.toLowerCase().includes(q) ||
        e.department?.name?.toLowerCase().includes(q) ||
        e.position?.toLowerCase().includes(q)
    );
  }, [employees, empSearch]);

  const handleSelectEmployee = (empId: string) => {
    setEmployeeId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;

    const configuredSalary =
      Number(emp.salaryConfig?.baseSalary) > 0
        ? Number(emp.salaryConfig.baseSalary)
        : Number(emp.contracts?.[0]?.salary) > 0
        ? Number(emp.contracts[0].salary)
        : 12000000;

    setContractBase(configuredSalary);
    setWorkedDays(standardDays);
    setDependents(Number(emp.dependentCount) || 0);

    const proRated = configuredSalary;
    setBaseSalary(String(proRated));
    setBonus("0");

    if (autoStatutory) {
      const bhxh = Math.round(proRated * 0.105);
      const taxable = Math.max(0, proRated - bhxh - 15500000 - (Number(emp.dependentCount) || 0) * 6200000);
      const pit = calculatePIT(taxable);
      setDeductions(String(bhxh + pit));
    }
  };

  useEffect(() => {
    if (!employeeId || payroll) return;
    if (contractBase <= 0) return;
    if (standardDays <= 0) return;
    const proRated = Math.round((contractBase / standardDays) * Math.max(0, Math.min(standardDays, workedDays)));
    setBaseSalary(String(proRated));
  }, [workedDays, standardDays, contractBase, employeeId, payroll]);

  const statutoryBreakdown = useMemo(() => {
    const baseNum = Number(baseSalary) || 0;
    const bonusNum = Number(bonus) || 0;
    const bhxh = Math.round(baseNum * 0.08);
    const bhyt = Math.round(baseNum * 0.015);
    const bhtn = Math.round(baseNum * 0.01);
    const totalInsurance = bhxh + bhyt + bhtn;
    const personalRelief = 15500000 + dependents * 6200000;
    const taxableIncome = Math.max(0, baseNum + bonusNum - totalInsurance - personalRelief);
    const pit = calculatePIT(taxableIncome);
    return {
      bhxh,
      bhyt,
      bhtn,
      totalInsurance,
      pit,
      totalStatutory: totalInsurance + pit,
    };
  }, [baseSalary, bonus, dependents]);

  useEffect(() => {
    if (autoStatutory && (Number(baseSalary) > 0 || Number(bonus) > 0)) {
      setDeductions(String(statutoryBreakdown.totalStatutory));
    }
  }, [autoStatutory, statutoryBreakdown.totalStatutory, baseSalary, bonus]);

  if (!isOpen) return null;

  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);

  const totalBonusWithOt = Number(bonus) || 0;
  const netSalary = Math.max(0, (Number(baseSalary) || 0) + totalBonusWithOt - (Number(deductions) || 0));

  const applyQuickBonus = (amountToAdd: number) => {
    const current = Number(bonus) || 0;
    setBonus(String(Math.max(0, current + amountToAdd)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = payroll ? `/api/payroll/${payroll.id}` : "/api/payroll";
      const method = payroll ? "PUT" : "POST";

      const baseNum = Number(baseSalary) || 0;
      const finalBonus = totalBonusWithOt;
      const finalDed = Number(deductions) || 0;

      const details: any[] = [
        {
          name: "Ngày công thực tế",
          type: "INFO",
          amount: workedDays,
          amountType: "DAYS",
        },
        {
          name: "Lương cơ bản theo ngày công",
          type: "EARNING",
          amount: baseNum,
          amountType: "FIXED",
        },
      ];

      if (Number(bonus) > 0) {
        details.push({
          name: "Phụ cấp & Thưởng hiệu suất",
          type: "EARNING",
          amount: Number(bonus),
          amountType: "FIXED",
        });
      }

      if (finalDed > 0) {
        if (autoStatutory && baseNum > 0) {
          details.push({
            name: "Bảo hiểm Xã hội (BHXH 8%)",
            type: "DEDUCTION",
            amount: statutoryBreakdown.bhxh,
            amountType: "FIXED",
          });
          details.push({
            name: "Bảo hiểm Y tế (BHYT 1.5%)",
            type: "DEDUCTION",
            amount: statutoryBreakdown.bhyt,
            amountType: "FIXED",
          });
          details.push({
            name: "Bảo hiểm Thất nghiệp (BHTN 1.0%)",
            type: "DEDUCTION",
            amount: statutoryBreakdown.bhtn,
            amountType: "FIXED",
          });
          if (statutoryBreakdown.pit > 0) {
            details.push({
              name: `Thuế TNCN lũy tiến (${dependents} người phụ thuộc)`,
              type: "DEDUCTION",
              amount: statutoryBreakdown.pit,
              amountType: "FIXED",
            });
          }
        } else {
          details.push({
            name: "Tổng khoản khấu trừ & BHXH",
            type: "DEDUCTION",
            amount: finalDed,
            amountType: "FIXED",
          });
        }
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          month: Number(month),
          year: Number(year),
          baseSalary: baseNum,
          bonus: finalBonus,
          deductions: finalDed,
          details,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Lỗi hệ thống");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl transition-colors overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Calculator className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {payroll ? "Điều Chỉnh Phiếu Lương Nhân Sự" : "Khởi Tạo Phiếu Lương Thông Minh"}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Công chuẩn theo từng tháng sau khi trừ ngày lễ; OT chỉ tính trong bảng lương tự động khi đã duyệt.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title="Đóng (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 text-xs space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl font-medium">
              {error}
            </div>
          )}
          {calendarError && <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-xs">{calendarError}</div>}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  1. Chọn cán bộ nhân viên <span className="text-rose-500">*</span>
                </label>
                {!payroll && (
                  <input
                    type="text"
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    placeholder="Gõ tên / phòng ban để lọc nhanh..."
                    className="px-2.5 py-0.5 text-[11px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 outline-none focus:border-blue-500 w-48"
                  />
                )}
              </div>
              <select
                required
                disabled={!!payroll}
                value={employeeId}
                onChange={(e) => handleSelectEmployee(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 disabled:opacity-60 focus:border-blue-500 outline-none transition-colors font-medium"
              >
                <option value="">-- Chọn nhân sự để tự động nạp mức lương hợp đồng --</option>
                {filteredEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user?.name} · {emp.position || "Chuyên viên"} ({emp.department?.name || "Chưa phân phòng"})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Tháng quyết toán <span className="text-rose-500">*</span>
              </label>
              <select
                required
                disabled={!!payroll}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 disabled:opacity-60 focus:border-blue-500 outline-none transition-colors font-medium"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m < 10 ? `0${m}` : m}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Năm <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                disabled={!!payroll}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 disabled:opacity-60 focus:border-blue-500 outline-none transition-colors font-mono font-semibold"
              />
            </div>
          </div>

          {selectedEmployee && (
            <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/25 border border-blue-200/70 dark:border-blue-900/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>{selectedEmployee.user?.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                      {selectedEmployee.user?.email}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-3 mt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {selectedEmployee.department?.name || "Chưa phân bổ"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> {selectedEmployee.position || "Nhân viên"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                    Lương chuẩn Hợp đồng
                  </div>
                  <div className="font-mono font-bold text-blue-700 dark:text-blue-300 text-sm">
                    {formatVND(
                      Number(selectedEmployee.salaryConfig?.baseSalary) ||
                        Number(selectedEmployee.contracts?.[0]?.salary) ||
                        contractBase ||
                        12000000
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectEmployee(selectedEmployee.id)}
                  className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-blue-500 text-zinc-600 dark:text-zinc-300 transition-colors"
                  title="Khôi phục mức lương gốc theo Hợp đồng"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                2. Ngày công hưởng lương và giảm trừ gia cảnh
              </span>
              <span className="text-[11px] text-zinc-500">
                Công chuẩn: <strong className="font-mono">{standardDays || "-"} ngày/tháng</strong> (8h/ngày)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Số ngày công hưởng lương (0 - {standardDays || "-"})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={standardDays || undefined}
                    step="0.5"
                    value={workedDays}
                    onChange={(e) => setWorkedDays(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono font-bold text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
                  />
                  <span className="text-xs font-mono text-zinc-400 shrink-0">/ {standardDays || "-"} công</span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Làm thêm giờ
                </label>
                <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">Tạo và duyệt đơn OT trong mục “Duyệt OT” của trang lương, rồi chạy tính lương tự động để lấy đúng mức 150%, 200% hoặc 300%.</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  Số người phụ thuộc (6,2tr/người)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={dependents}
                    onChange={(e) => setDependents(Math.max(0, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono font-bold text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
                  />
                  <span className="text-[11px] text-zinc-400 shrink-0">Người</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Lương theo ngày công (VNĐ) <span className="text-rose-500">*</span>
                </label>
              </div>
              <input
                type="number"
                required
                min="0"
                step="10000"
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:border-blue-500 outline-none transition-colors font-mono font-bold text-sm"
              />
              <div className="text-[11px] text-zinc-400 font-mono">
                Hiển thị: {formatVND(Number(baseSalary) || 0)}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Thưởng & Phụ cấp khác
                </label>
              </div>
              <input
                type="number"
                min="0"
                step="10000"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-emerald-600 dark:text-emerald-400 focus:border-blue-500 outline-none transition-colors font-mono font-bold text-sm"
              />
              <div className="flex flex-wrap gap-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => applyQuickBonus(1000000)}
                  className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                >
                  +1 Tr
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickBonus(2000000)}
                  className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                >
                  +2 Tr
                </button>
                <button
                  type="button"
                  onClick={() => setBonus(String(Math.round((Number(baseSalary) || 0) * 0.1)))}
                  className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100"
                >
                  KPI B (+10%)
                </button>
                <button
                  type="button"
                  onClick={() => setBonus(String(Math.round((Number(baseSalary) || 0) * 0.25)))}
                  className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100"
                >
                  KPI A (+25%)
                </button>
                <button
                  type="button"
                  onClick={() => setBonus("0")}
                  className="px-2 py-0.5 text-[10px] rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800"
                >
                  Xóa
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Khấu trừ (BHXH + Thuế)
                </label>
                <label className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={autoStatutory}
                    onChange={(e) => setAutoStatutory(e.target.checked)}
                    className="rounded border-zinc-300"
                  />
                  <span>Tự động 10.5% + TNCN</span>
                </label>
              </div>
              <input
                type="number"
                min="0"
                step="1000"
                value={deductions}
                onChange={(e) => {
                  setAutoStatutory(false);
                  setDeductions(e.target.value);
                }}
                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-rose-600 dark:text-rose-400 focus:border-blue-500 outline-none transition-colors font-mono font-bold text-sm"
              />
              <div className="text-[10px] text-zinc-500 font-mono flex items-center justify-between">
                <span>BHXH 10.5%: {formatVND(statutoryBreakdown.totalInsurance)}</span>
                <span>Thuế TNCN: {formatVND(statutoryBreakdown.pit)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs">
              <div>
                <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">Lương ngày công ({workedDays} công)</div>
                <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{formatVND(Number(baseSalary) || 0)}</div>
              </div>
              <div>
                <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">Thưởng / phụ cấp</div>
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">+{formatVND(totalBonusWithOt)}</div>
              </div>
              <div>
                <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">BHXH (10.5%) & Thuế TNCN</div>
                <div className="font-mono font-bold text-rose-600 dark:text-rose-400 mt-0.5">-{formatVND(Number(deductions) || 0)}</div>
              </div>
              <div className="sm:text-right">
                <div className="text-blue-600 dark:text-blue-400 text-[11px] font-semibold uppercase tracking-wider">Thực lĩnh dự kiến (Net)</div>
                <div className="font-mono font-extrabold text-lg text-zinc-900 dark:text-white mt-0.5">{formatVND(netSalary)}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Phiếu lương khi lưu sẽ ở trạng thái <strong className="text-amber-600 dark:text-amber-400">Bản nháp (DRAFT)</strong> chờ Ban Giám đốc duyệt chi.
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading || !employeeId}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm active:scale-95"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{payroll ? "Lưu cập nhật phiếu lương" : "Phát hành phiếu lương nháp"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
