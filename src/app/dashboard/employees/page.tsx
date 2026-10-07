"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Building2, Mail, Phone, Shield, Crown, Filter, CheckCircle2, UserCheck, X, Printer, FileText, Calendar, DollarSign, Award, Users } from "lucide-react";
import EmployeeModal from "@/components/employees/EmployeeModal";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "MANAGERS" | "STAFF">("ALL");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [viewingEmp, setViewingEmp] = useState<any>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xác nhận xử lý nhân sự "${name}"?\n(Lưu ý: Nếu nhân viên đã có lịch sử bảng lương hoặc chấm công, hệ thống sẽ tự động chuyển sang chế độ THÔI VIỆC / LƯU TRỮ HỒ SƠ để bảo lưu chứng từ kiểm toán).`)) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data?.message) alert(data.message);
      fetchEmployees();
    } catch (error) {
      console.error(error);
    }
  };

  // Helper check manager
  const checkIsManager = (emp: any) => {
    return !!(emp.managedDept || (emp.department && emp.department.managerId === emp.id));
  };

  // Filter departments for dropdown
  const departmentsList = Array.from(
    new Map(
      employees
        .filter(e => e.department)
        .map(e => [e.department.id, e.department.name])
    ).entries()
  );

  const filteredData = employees.filter((e) => {
    const matchesSearch = 
      e.user.name.toLowerCase().includes(search.toLowerCase()) || 
      e.user.email.toLowerCase().includes(search.toLowerCase()) ||
      (e.position && e.position.toLowerCase().includes(search.toLowerCase())) ||
      (e.department?.name && e.department.name.toLowerCase().includes(search.toLowerCase()));

    const isMgr = checkIsManager(e);
    const matchesRole = 
      roleFilter === "ALL" ? true :
      roleFilter === "MANAGERS" ? isMgr : !isMgr;

    const matchesDept = selectedDeptId === "ALL" ? true : e.departmentId === selectedDeptId;

    return matchesSearch && matchesRole && matchesDept;
  });

  const departmentManagers = employees.filter(e => checkIsManager(e) && e.status !== "RESIGNED");

  return (
    <>
      <div className="space-y-6 animate-swiss-in pb-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                <Users className="w-3.5 h-3.5" />
                Hồ Sơ & Danh Bộ Nhân Sự
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
              Quản Trị Hồ Sơ Nhân Lực
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Quản lý danh sách nhân viên, trưởng bộ phận, phân quyền và chức vụ chuyên môn
            </p>
          </div>
          <button 
            onClick={() => { setSelectedEmp(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm nhân sự</span>
          </button>
        </div>

        {/* Executive Leadership & Heads Overview */}
        <div className="bento-card p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="squircle w-8 h-8 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Crown className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Ban điều hành & Trưởng bộ phận ({departmentManagers.length} vị trí)
              </h2>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">
              Đầy đủ các vị trí phụ trách
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {departmentManagers.map((mgr) => (
              <div 
                key={mgr.id}
                onClick={() => {
                  setSearch(mgr.user.name);
                }}
                className="cursor-pointer p-3.5 rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      TRƯỞNG PHÒNG
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors truncate">
                    {mgr.user.name}
                  </div>
                  <div className="text-[10px] font-medium text-amber-800 dark:text-amber-400 line-clamp-1 mt-0.5">
                    {mgr.position}
                  </div>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-amber-200/50 dark:border-amber-900/40 text-[10px] text-zinc-500 truncate flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span className="truncate">{mgr.managedDept?.name || mgr.department?.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Employee Table */}
        <div className="bento-card rounded-2xl overflow-hidden shadow-xs">
          {/* Controls & Filter Bar */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50/60 dark:bg-zinc-900/40">
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700/80 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-blue-600 transition-all rounded-xl shadow-2xs font-mono"
                  placeholder="Tìm tên, chức vụ, email..."
                />
              </div>

              {/* Segmented Filter: All vs Managers vs Staff */}
              <div className="flex bg-zinc-200/60 dark:bg-zinc-800 p-1 rounded-xl text-xs font-mono">
                <button
                  onClick={() => setRoleFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    roleFilter === "ALL" 
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-2xs" 
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  TẤT CẢ ({employees.length})
                </button>
                <button
                  onClick={() => setRoleFilter("MANAGERS")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    roleFilter === "MANAGERS" 
                      ? "bg-amber-500 text-white font-bold shadow-2xs" 
                      : "text-amber-600 dark:text-amber-400 hover:text-amber-700"
                  }`}
                >
                  ⭐ TRƯỞNG PHÒNG ({departmentManagers.length})
                </button>
                <button
                  onClick={() => setRoleFilter("STAFF")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    roleFilter === "STAFF" 
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-2xs" 
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  NHÂN VIÊN ({employees.length - departmentManagers.length})
                </button>
              </div>

              {/* Filter by Department */}
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs font-mono text-zinc-700 dark:text-zinc-300 focus:outline-none shadow-2xs"
              >
                <option value="ALL">-- Tất cả phòng ban --</option>
                {departmentsList.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>

            <span className="text-xs text-zinc-500 shrink-0">
              Đang làm việc: <strong className="text-zinc-800 dark:text-zinc-200 font-mono font-bold">{employees.filter(e => e.status !== "RESIGNED").length}</strong> · Đã thôi việc: <strong className="text-zinc-800 dark:text-zinc-200 font-mono font-bold">{employees.filter(e => e.status === "RESIGNED").length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 font-mono text-[10px] uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-5 py-3 font-semibold">Nhân viên</th>
                  <th className="px-5 py-3 font-semibold">Liên hệ</th>
                  <th className="px-5 py-3 font-semibold">Chức vụ & Đơn vị (Trưởng phòng)</th>
                  <th className="px-5 py-3 font-semibold text-center">Trạng thái</th>
                  <th className="px-5 py-3 font-semibold text-center">Vai trò</th>
                  <th className="px-5 py-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-zinc-500 font-mono text-xs">
                      [LOADING EMPLOYEE DIRECTORY...]
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-zinc-500 font-mono text-xs">
                      Không tìm thấy nhân sự phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((emp) => {
                    const isMgr = checkIsManager(emp);
                    const deptManagerName = emp.department?.manager?.user?.name;

                    return (
                      <tr 
                        key={emp.id} 
                        className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                          isMgr ? "bg-amber-50/20 dark:bg-amber-950/5" : ""
                        }`}
                      >
                        {/* Employee Name */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded border flex items-center justify-center font-mono text-[11px] font-bold ${
                              isMgr 
                                ? "border-amber-400 bg-amber-500 text-white shadow-xs" 
                                : "border-zinc-300 dark:border-zinc-700 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                            }`}>
                              {isMgr ? "⭐" : emp.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                <span>{emp.user.name}</span>
                                {isMgr && (
                                  <span className="inline-flex items-center text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                                    LEADER
                                  </span>
                                )}
                              </div>
                              <div className="font-mono text-[10px] text-zinc-400">ID: {emp.id.substring(0, 6).toUpperCase()}</div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-3.5">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                              <Mail className="w-3 h-3 text-zinc-400" />
                              <span>{emp.user.email}</span>
                            </div>
                            {emp.phone && (
                              <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
                                <Phone className="w-3 h-3 text-zinc-400" />
                                <span>{emp.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Department, Position & Manager Info */}
                        <td className="px-5 py-3.5">
                          {isMgr ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                  ⭐ TRƯỞNG PHÒNG
                                </span>
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                                  {emp.position}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                                <Building2 className="w-3 h-3" />
                                <span>Đơn vị phụ trách: {emp.managedDept?.name || emp.department?.name}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <div className="font-medium text-zinc-900 dark:text-zinc-100">{emp.position}</div>
                              <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                                <Building2 className="w-3 h-3" />
                                <span>{emp.department?.name || "Chưa xếp phòng"}</span>
                              </div>
                              <div className="text-[10px] text-zinc-400 font-mono mt-0.5 flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-zinc-400" />
                                <span>
                                  Trực thuộc Trưởng phòng: <strong className="text-zinc-700 dark:text-zinc-300 font-sans font-medium">{deptManagerName || "Đang bổ nhiệm"}</strong>
                                </span>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5 text-center font-mono">
                          {emp.status === "RESIGNED" ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              THÔI VIỆC
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              HOẠT ĐỘNG
                            </span>
                          )}
                        </td>

                        {/* System Role */}
                        <td className="px-5 py-3.5 text-center">
                          <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                            {emp.user.role?.name || "N/A"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right text-xs">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setViewingEmp(emp)} className="px-2.5 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded font-medium transition-colors" title="Xem hồ sơ chi tiết">
                              Xem
                            </button>
                            {emp.user.email !== "admin@nexustech.vn" && emp.user.email !== "admin@hrmis.com" && emp.user.role?.name !== "SYSTEM_ADMIN" && (
                              <>
                                <button onClick={() => { setSelectedEmp(emp); setIsModalOpen(true); }} className="px-2.5 py-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded font-medium transition-colors" title="Sửa hồ sơ">
                                  Sửa
                                </button>
                                <button onClick={() => handleDelete(emp.id, emp.user.name)} className="px-2.5 py-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded font-medium transition-colors" title="Xử lý hồ sơ">
                                  Xóa
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <EmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchEmployees} employee={selectedEmp} />

      {/* Modal Hồ sơ nhân sự Chi tiết */}
      {viewingEmp && (
        <div 
          className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setViewingEmp(null)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  {viewingEmp.user.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {viewingEmp.user.name}
                    </h3>
                    {checkIsManager(viewingEmp) && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        Trưởng bộ phận
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Mã nhân viên: NV-{viewingEmp.id.slice(0, 6).toUpperCase()} · {viewingEmp.position}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setViewingEmp(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Đóng (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* General Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
              <div>
                <span className="text-zinc-400 uppercase text-[10px] font-medium tracking-wider block">Phòng ban</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block">{viewingEmp.department?.name || "Chưa phân bổ"}</span>
              </div>
              <div>
                <span className="text-zinc-400 uppercase text-[10px] font-medium tracking-wider block">Trưởng bộ phận</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
                  {viewingEmp.department?.manager?.user?.name || (checkIsManager(viewingEmp) ? "Ban Giám Đốc" : "Đang cập nhật")}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 uppercase text-[10px] font-medium tracking-wider block">Trạng thái</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {viewingEmp.status === "RESIGNED" ? "Đã thôi việc" : "Đang làm việc"}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 uppercase text-[10px] font-medium tracking-wider block">Email</span>
                <span className="text-zinc-700 dark:text-zinc-300 mt-0.5 block truncate">{viewingEmp.user.email}</span>
              </div>
              <div>
                <span className="text-zinc-400 uppercase text-[10px] font-medium tracking-wider block">Số điện thoại</span>
                <span className="text-zinc-700 dark:text-zinc-300 mt-0.5 block">{viewingEmp.phone || "Chưa cập nhật"}</span>
              </div>
              <div>
                <span className="text-zinc-400 uppercase text-[10px] font-medium tracking-wider block">Vai trò</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold mt-0.5 block">{viewingEmp.user.role?.name}</span>
              </div>
            </div>

            {/* Compensation & Contract Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Hợp đồng & Chế độ đãi ngộ
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1.5 shadow-xs">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Hợp đồng lao động</div>
                  <div className="text-xs text-zinc-500">Hợp đồng không xác định thời hạn</div>
                  <div className="text-xs text-emerald-600 font-medium">Bảo hiểm: Đã tham gia đầy đủ 10.5%</div>
                </div>

                <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1.5 shadow-xs">
                  <div className="text-xs text-zinc-500 font-medium">Mức lương cơ bản</div>
                  <div className="font-mono font-bold text-base text-zinc-900 dark:text-zinc-100">
                    {viewingEmp.baseSalary ? viewingEmp.baseSalary.toLocaleString("vi-VN") : "25,000,000"} VNĐ / tháng
                  </div>
                  <div className="text-xs text-zinc-500">Phụ cấp chức vụ, ăn trưa & thiết bị đầy đủ</div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> In hồ sơ (PDF)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = viewingEmp;
                    setViewingEmp(null);
                    setSelectedEmp(toEdit);
                    setIsModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
                >
                  Chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={() => setViewingEmp(null)}
                  className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-medium transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
