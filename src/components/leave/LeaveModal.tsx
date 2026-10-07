"use client";

import { useState, useEffect } from "react";
import { X, Calendar, FileText, CheckCircle, Clock } from "lucide-react";

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leaveRequest?: any;
  isAdmin?: boolean;
}

export default function LeaveModal({ isOpen, onClose, onSuccess, leaveRequest, isAdmin }: LeaveModalProps) {
  const [formData, setFormData] = useState({
    employeeId: "",
    startDate: "",
    endDate: "",
    type: "ANNUAL_LEAVE",
    reason: "",
    status: "PENDING"
  });
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
        .then(data => {
          if (Array.isArray(data)) setEmployees(data);
        })
        .catch(console.error);

      if (leaveRequest) {
        setFormData({
          employeeId: leaveRequest.employeeId || "",
          startDate: leaveRequest.startDate ? new Date(leaveRequest.startDate).toISOString().split('T')[0] : "",
          endDate: leaveRequest.endDate ? new Date(leaveRequest.endDate).toISOString().split('T')[0] : "",
          type: leaveRequest.type || "ANNUAL_LEAVE",
          reason: leaveRequest.reason || "",
          status: leaveRequest.status || "PENDING"
        });
      } else {
        setFormData({
          employeeId: "",
          startDate: "",
          endDate: "",
          type: "ANNUAL_LEAVE",
          reason: "",
          status: "PENDING"
        });
      }
      setError("");
    }
  }, [leaveRequest, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = leaveRequest ? `/api/leave/${leaveRequest.id}` : "/api/leave";
      const method = leaveRequest ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Thao tác thất bại.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isViewOnly = leaveRequest && !isAdmin;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {leaveRequest ? (isAdmin ? "Xét Duyệt Đơn Nghỉ Phép" : "Chi Tiết Đơn Nghỉ") : "Tạo Đơn Xin Nghỉ Phép"}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {leaveRequest ? "Kiểm tra thông tin và tiến độ phê duyệt" : "Điền thời gian và lý do xin nghỉ phép"}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans text-xs">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {leaveRequest && isAdmin && (
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                Thông tin người làm đơn
              </span>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                {leaveRequest.employee?.user?.name}
              </p>
              <p className="text-zinc-500 text-xs mt-0.5">
                Phòng ban: {leaveRequest.employee?.department?.name || "Chưa phân phòng"}
              </p>
            </div>
          )}

          {!leaveRequest && isAdmin && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nhân viên làm đơn (Tạo hộ) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 outline-none transition-colors"
                required={isAdmin}
              >
                <option value="">-- Chọn nhân viên --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user.name} ({emp.user.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Từ ngày <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                disabled={isViewOnly}
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 outline-none transition-colors disabled:opacity-60"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Đến ngày <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                disabled={isViewOnly}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 outline-none transition-colors disabled:opacity-60"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Loại hình nghỉ phép
            </label>
            <select
              disabled={isViewOnly}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 outline-none transition-colors disabled:opacity-60"
            >
              <option value="ANNUAL_LEAVE">Nghỉ phép năm (hưởng lương)</option>
              <option value="SICK_LEAVE">Nghỉ ốm đau / Khám bệnh</option>
              <option value="UNPAID_LEAVE">Nghỉ không lương</option>
              <option value="MATERNITY_LEAVE">Nghỉ thai sản</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Lý do xin nghỉ <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              disabled={isViewOnly}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Ghi rõ lý do nghỉ phép..."
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 outline-none transition-colors disabled:opacity-60 resize-none"
            />
          </div>

          {leaveRequest && isAdmin && (
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Quyết định phê duyệt
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="PENDING">Chờ phê duyệt</option>
                <option value="APPROVED">Chấp thuận (Duyệt đơn)</option>
                <option value="REJECTED">Từ chối đơn</option>
              </select>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors"
            >
              Thoát
            </button>
            {!isViewOnly && (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : leaveRequest ? "Lưu quyết định" : "Gửi yêu cầu"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
