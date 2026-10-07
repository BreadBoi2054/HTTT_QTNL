"use client";

import { useState, useEffect } from "react";
import { X, FileText, CheckCircle2 } from "lucide-react";

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newContract: any) => void;
}

export default function CreateContractModal({ isOpen, onClose, onCreated }: CreateContractModalProps) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeeCode, setEmployeeCode] = useState("NX-" + Math.floor(1000 + Math.random() * 9000));
  const [department, setDepartment] = useState("Khối Công Nghệ & Phần Mềm");
  const [position, setPosition] = useState("Kỹ Sư Phần Mềm");
  const [type, setType] = useState("Hợp đồng Xác định thời hạn 12 tháng");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("2027-10-05");
  const [salary, setSalary] = useState(22000000);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEmployees(data);
      })
      .catch((err) => console.error("Error loading employees:", err));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmpId(empId);
    setError("");
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setEmployeeName(emp.user?.name || "");
      setEmployeeEmail(emp.user?.email || "");
      setEmployeeCode(emp.employeeCode || `NX-${emp.id.slice(-5).toUpperCase()}`);
      if (emp.department?.name) setDepartment(emp.department.name);
      if (emp.position) setPosition(emp.position);
    }
  };

  if (!isOpen) return null;

  const handleTypeChange = (newType: string) => {
    setType(newType);
    if (newType === "Hợp đồng Không xác định thời hạn") {
      setEndDate("");
    } else if (newType === "Hợp đồng Thử việc (02 tháng)") {
      setEndDate("2026-12-05");
    } else if (newType === "Hợp đồng Xác định thời hạn 12 tháng") {
      setEndDate("2027-10-05");
    } else if (newType === "Hợp đồng Xác định thời hạn 36 tháng") {
      setEndDate("2029-10-05");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName.trim()) {
      setError("Vui lòng chọn hoặc nhập họ và tên nhân viên.");
      return;
    }

    const newContract = {
      id: "contract_" + Date.now(),
      code: `HĐLĐ-2026/${employeeCode}`,
      employeeName: employeeName.trim(),
      employeeCode,
      employeeEmail: employeeEmail || undefined,
      department,
      position,
      type,
      startDate,
      endDate: endDate || "Không xác định",
      salary: Number(salary),
      status: "ACTIVE"
    };

    onCreated(newContract);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Tạo Mới Hợp Đồng Lao Động
              </h2>
              <p className="text-[11px] text-zinc-500">
                Thiết lập thông tin pháp lý và chế độ đãi ngộ
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Đóng (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Select From Employees */}
          {employees.length > 0 && (
            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                Chọn cán bộ nhân sự từ hệ thống
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => handleSelectEmployee(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Chọn nhân viên có sẵn trong hệ thống ({employees.length} cán bộ) --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user?.name} - {emp.position} ({emp.department?.name || 'Chưa phân phòng'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                Họ và tên nhân viên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                Mã nhân viên
              </label>
              <input
                type="text"
                readOnly
                value={employeeCode}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                Phòng ban
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="Khối Công Nghệ & Phần Mềm">Khối Công Nghệ & Phần Mềm</option>
                <option value="Khối Kinh Doanh & Bán Hàng">Khối Kinh Doanh & Bán Hàng</option>
                <option value="Phòng Tài Chính - Kế Toán">Phòng Tài Chính - Kế Toán</option>
                <option value="Phòng Nhân Sự & Đào Tạo">Phòng Nhân Sự & Đào Tạo</option>
                <option value="Phòng Marketing & Truyền Thông">Phòng Marketing & Truyền Thông</option>
                <option value="Ban Giám Đốc">Ban Giám Đốc</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                Vị trí công tác
              </label>
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
              Loại hình hợp đồng
            </label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="Hợp đồng Thử việc (02 tháng)">Hợp đồng Thử việc (02 tháng)</option>
              <option value="Hợp đồng Xác định thời hạn 12 tháng">Hợp đồng Xác định thời hạn 12 tháng</option>
              <option value="Hợp đồng Xác định thời hạn 36 tháng">Hợp đồng Xác định thời hạn 36 tháng</option>
              <option value="Hợp đồng Không xác định thời hạn">Hợp đồng Không xác định thời hạn (Vô thời hạn)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                Ngày hết hạn
              </label>
              <input
                type="date"
                disabled={type === "Hợp đồng Không xác định thời hạn"}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
              Mức lương cơ bản thỏa thuận (VNĐ)
            </label>
            <input
              type="number"
              step={500000}
              required
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none font-mono"
            />
          </div>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors"
            >
              Thoát
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-lg text-xs font-medium transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Lưu hợp đồng
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
