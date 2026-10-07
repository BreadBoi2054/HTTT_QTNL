"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee?: any;
}

export default function EmployeeModal({ isOpen, onClose, onSuccess, employee }: EmployeeModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isManager, setIsManager] = useState(false);

  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: session } = useSession();
  const currentUserRole = (session?.user as any)?.roleName || "USER";

  const filteredRoles = roles.filter(r => {
    if (currentUserRole === "SYSTEM_ADMIN") return true;
    if (currentUserRole === "MANAGER") return r.name === "USER";
    if (currentUserRole === "HR") return r.name !== "SYSTEM_ADMIN";
    return false;
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch dependencies
      Promise.all([
        fetch("/api/roles").then(res => res.json()),
        fetch("/api/departments").then(res => res.json())
      ]).then(([rolesData, deptsData]) => {
        setRoles(rolesData);
        setDepartments(deptsData);
      }).catch(console.error);

      if (employee) {
        setEmail(employee.user.email);
        setName(employee.user.name);
        setRoleId(employee.user.roleId);
        setDepartmentId(employee.departmentId || "");
        setPosition(employee.position || "");
        setPhone(employee.phone || "");
        setAddress(employee.address || "");
        setIsManager(!!(employee.managedDept || (employee.department && employee.department.managerId === employee.id)));
      } else {
        setEmail("");
        setName("");
        setRoleId("");
        setDepartmentId("");
        setPosition("");
        setPhone("");
        setAddress("");
        setIsManager(false);
      }
      setError("");
    }
  }, [isOpen, employee]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = employee ? `/api/employees/${employee.id}` : "/api/employees";
      const method = employee ? "PUT" : "POST";

      const bodyData = {
        email: !employee ? email : undefined,
        name,
        roleId,
        departmentId: departmentId || null,
        position,
        phone,
        address,
        isManager
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
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
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl transition-colors overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {employee ? "Cập Nhật Hồ Sơ Nhân Viên" : "Thêm Nhân Viên Mới"}
            </h2>
            {!employee && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Mật khẩu khởi tạo: <span className="text-blue-600 dark:text-blue-400 font-mono font-medium">Hrmis@123</span>
              </p>
            )}
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
            <div className="p-3 mb-4 bg-red-950/40 border border-red-800 text-red-300 font-mono">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-blue-600 outline-none transition-colors" 
                placeholder="VD: Nguyễn Văn An" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Email doanh nghiệp <span className="text-red-500">*</span>
              </label>
              <input 
                type="email" 
                required 
                disabled={!!employee} 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 disabled:opacity-50 focus:border-blue-600 outline-none transition-colors" 
                placeholder="VD: an.nguyen@nexustech.vn" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Phòng ban trực thuộc
              </label>
              <select 
                value={departmentId} 
                onChange={(e) => setDepartmentId(e.target.value)} 
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-blue-600 outline-none transition-colors"
              >
                <option value="">-- Lựa chọn phòng ban --</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Vai trò hệ thống <span className="text-red-500">*</span>
              </label>
              <select 
                required 
                value={roleId} 
                onChange={(e) => setRoleId(e.target.value)} 
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 focus:border-blue-600 outline-none transition-colors"
              >
                <option value="">-- Lựa chọn vai trò --</option>
                {filteredRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Chức vụ / Vị trí đảm nhiệm <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required 
                list="positions-datalist"
                value={position} 
                onChange={(e) => setPosition(e.target.value)} 
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-blue-600 outline-none transition-colors" 
                placeholder="VD: Senior Backend Engineer hoặc chọn gợi ý..." 
              />
              <datalist id="positions-datalist">
                <option value="Tổng Giám Đốc (CEO)" />
                <option value="Giám đốc Kỹ thuật / IT Manager" />
                <option value="Trưởng phòng Nhân sự (HR Manager)" />
                <option value="Kế toán trưởng (Chief Accountant)" />
                <option value="Giám đốc Kinh doanh (Sales Director)" />
                <option value="Trưởng phòng Marketing" />
                <option value="Phó Giám đốc Kỹ thuật" />
                <option value="Phó phòng Nhân sự" />
                <option value="Phó phòng Kế toán" />
                <option value="Senior Frontend Lead" />
                <option value="Backend Architect" />
                <option value="DevOps & Cloud Engineer" />
                <option value="UI/UX Product Designer" />
                <option value="QA/QC Lead Engineer" />
                <option value="Chuyên viên Tuyển dụng (TA)" />
                <option value="Chuyên viên C&B (Tiền lương)" />
                <option value="Chuyên viên L&D (Đào tạo)" />
                <option value="Kế toán viên Tổng hợp" />
                <option value="Chuyên viên Phân tích Tài chính" />
                <option value="Trưởng nhóm Khách hàng B2B" />
                <option value="Senior Account Executive" />
                <option value="Chuyên viên Tư vấn Giải pháp B2B" />
                <option value="Chuyên viên Performance Marketing" />
                <option value="Content & Brand Lead" />
              </datalist>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Số điện thoại liên hệ
              </label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 focus:border-blue-600 outline-none transition-colors" 
                placeholder="VD: 0901234567" 
              />
            </div>
          </div>

          <div className="space-y-1 mb-4">
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Địa chỉ cư trú
            </label>
            <input 
              type="text" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-blue-600 outline-none transition-colors" 
              placeholder="Nhập địa chỉ cư trú thường trú..." 
            />
          </div>

          {/* Bổ nhiệm Trưởng phòng Checkbox */}
          <div className="p-3 mb-5 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300 text-xs">
                <span>⭐ BỔ NHIỆM LÀM TRƯỞNG PHÒNG / TRƯỞNG BỘ PHẬN</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                Nhân sự sẽ được gán làm người đứng đầu phòng ban đã chọn và hiển thị biểu tượng Lãnh đạo
              </p>
            </div>
            <input
              type="checkbox"
              id="isManagerCheckbox"
              checked={isManager}
              onChange={(e) => setIsManager(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-zinc-300 dark:border-zinc-700 cursor-pointer"
            />
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
              disabled={loading} 
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {employee ? "Lưu hồ sơ" : "Tạo nhân viên"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
