"use client";

import { X, Calculator } from "lucide-react";
import { useState, useEffect } from "react";

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  payroll?: any;
}

export default function PayrollModal({ isOpen, onClose, onSuccess, payroll }: PayrollModalProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
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
        .then(res => res.json())
        .then(data => setEmployees(data))
        .catch(console.error);

      if (payroll) {
        setEmployeeId(payroll.employeeId);
        setMonth(payroll.month);
        setYear(payroll.year);
        setBaseSalary(payroll.baseSalary.toString());
        setBonus(payroll.bonus.toString());
        setDeductions(payroll.deductions.toString());
      } else {
        setEmployeeId("");
        setMonth(new Date().getMonth() + 1);
        setYear(new Date().getFullYear());
        setBaseSalary("0");
        setBonus("0");
        setDeductions("0");
      }
      setError("");
    }
  }, [payroll, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = payroll ? `/api/payroll/${payroll.id}` : "/api/payroll";
      const method = payroll ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          month: Number(month),
          year: Number(year),
          baseSalary: Number(baseSalary),
          bonus: Number(bonus),
          deductions: Number(deductions)
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

  const netSalary = (Number(baseSalary) || 0) + (Number(bonus) || 0) - (Number(deductions) || 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl transition-colors overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {payroll ? "Cập Nhật Phiếu Lương" : "Tạo Phiếu Lương Mới"}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Phiếu tạo mới sẽ lưu dưới dạng <span className="font-medium text-amber-600 dark:text-amber-400">Bản nháp</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
            title="Đóng (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 text-xs">
          {error && (
            <div className="p-3 mb-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nhân viên <span className="text-red-500">*</span>
              </label>
              <select 
                required 
                disabled={!!payroll} 
                value={employeeId} 
                onChange={(e) => setEmployeeId(e.target.value)} 
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 disabled:opacity-50 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="">-- Chọn nhân viên --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user.name} ({emp.user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Tháng <span className="text-red-500">*</span>
              </label>
              <select 
                required 
                disabled={!!payroll} 
                value={month} 
                onChange={(e) => setMonth(Number(e.target.value))} 
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 disabled:opacity-50 focus:border-blue-500 outline-none transition-colors"
              >
                {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>Tháng {m < 10 ? `0${m}` : m}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Năm <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                required 
                disabled={!!payroll} 
                value={year} 
                onChange={(e) => setYear(Number(e.target.value))} 
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 disabled:opacity-50 focus:border-blue-500 outline-none transition-colors" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Lương cơ bản (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                required 
                min="0" 
                value={baseSalary} 
                onChange={(e) => setBaseSalary(e.target.value)} 
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:border-blue-500 outline-none transition-colors font-mono" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Phụ cấp & Thưởng (VNĐ)
              </label>
              <input 
                type="number" 
                min="0" 
                value={bonus} 
                onChange={(e) => setBonus(e.target.value)} 
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:border-blue-500 outline-none transition-colors font-mono" 
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Các khoản khấu trừ (VNĐ)
              </label>
              <input 
                type="number" 
                min="0" 
                value={deductions} 
                onChange={(e) => setDeductions(e.target.value)} 
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:border-blue-500 outline-none transition-colors font-mono" 
              />
            </div>
          </div>

          <div className="mb-5 p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold">
                Thực lĩnh dự kiến (Net):
              </span>
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(netSalary)}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors"
            >
              Thoát
            </button>
            <button 
              type="submit" 
              disabled={loading || !employeeId} 
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {payroll ? "Cập nhật phiếu lương" : "Lưu phiếu lương"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
