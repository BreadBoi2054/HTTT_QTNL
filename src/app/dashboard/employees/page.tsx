"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Building2, CheckCircle2, UserCheck, X, Printer, Users, ArrowUpDown, ChevronLeft, ChevronRight, Download } from "lucide-react";

type SortKey = "name" | "department" | "joinDate" | "baseSalary";
type SortOrder = "asc" | "desc";
import EmployeeModal from "@/components/employees/EmployeeModal";
import { useConfirm } from "@/components/providers/ToastProvider";

export default function EmployeesPage() {
  const confirm = useConfirm();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "MANAGERS" | "STAFF">("ALL");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [viewingEmp, setViewingEmp] = useState<any>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, selectedDeptId, pageSize]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder(p => (p === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortOrder("asc"); }
  };

  const getEmpJoinDate = (emp: any): number => {
    const raw = emp.joinDate || emp.createdAt || emp.user?.createdAt;
    const t = raw ? new Date(raw).getTime() : 0;
    return isNaN(t) ? 0 : t;
  };

  const getEmpBaseSalary = (emp: any): number => Number(emp.salaryConfig?.baseSalary ?? emp.baseSalary ?? 0);

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
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("search");
      if (q) setSearch(q);
    }
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!viewingEmp) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewingEmp(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewingEmp]);

  const handleDelete = async (id: string, name: string) => {
    if (!(await confirm(`Xác nhận xử lý nhân sự "${name}"?\n(Lưu ý: Nếu nhân viên đã có lịch sử bảng lương hoặc chấm công, hệ thống sẽ tự động chuyển sang chế độ THÔI VIỆC / LƯU TRỮ HỒ SƠ để bảo lưu chứng từ kiểm toán).`))) return;
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

  const filteredData = useMemo(() => {
    const list = employees.filter((e) => {
      const matchesSearch =
        e.user.name.toLowerCase().includes(search.toLowerCase()) ||
        e.user.email.toLowerCase().includes(search.toLowerCase()) ||
        (e.position && e.position.toLowerCase().includes(search.toLowerCase())) ||
        (e.department?.name && e.department.name.toLowerCase().includes(search.toLowerCase()));
      const isMgr = checkIsManager(e);
      const matchesRole = roleFilter === "ALL" ? true : roleFilter === "MANAGERS" ? isMgr : !isMgr;
      const matchesDept = selectedDeptId === "ALL" ? true : e.departmentId === selectedDeptId;
      return matchesSearch && matchesRole && matchesDept;
    });

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = (a.user?.name || "").localeCompare(b.user?.name || "", "vi");
      else if (sortKey === "department") cmp = (a.managedDept?.name || a.department?.name || "").localeCompare(b.managedDept?.name || b.department?.name || "", "vi");
      else if (sortKey === "joinDate") cmp = getEmpJoinDate(a) - getEmpJoinDate(b);
      else if (sortKey === "baseSalary") cmp = getEmpBaseSalary(a) - getEmpBaseSalary(b);
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [employees, search, roleFilter, selectedDeptId, sortKey, sortOrder]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIndex = Math.min(safePage * pageSize, totalItems);
  const paginatedData = filteredData.slice((safePage - 1) * pageSize, safePage * pageSize);

  const departmentManagers = employees.filter(e => checkIsManager(e) && e.status !== "RESIGNED");
  const activeCount = employees.filter(e => e.status !== "RESIGNED").length;

  const handleExportEmployeesExcel = async () => {
    if (filteredData.length === 0) {
      alert("Không có dữ liệu nhân sự phù hợp để xuất Excel.");
      return;
    }

    try {
      const XLSX = await import("xlsx");
      const rows = filteredData.map((emp, idx) => ({
        "STT": idx + 1,
        "Mã Nhân Viên": `NX-${(emp.id || "").slice(-5).toUpperCase()}`,
        "Họ và Tên": emp.user?.name || "",
        "Email Công Vụ": emp.user?.email || "",
        "Số Điện Thoại": emp.phone || "",
        "Phòng Ban": emp.managedDept?.name || emp.department?.name || "Chưa phân bổ",
        "Chức Danh": emp.position || "Chuyên viên",
        "Cấp Bậc": checkIsManager(emp) ? "Trưởng bộ phận" : "Nhân viên",
        "Vai Trò RBAC": emp.user?.role?.name || "USER",
        "Ngày Vào Làm": getEmpJoinDate(emp) ? new Date(getEmpJoinDate(emp)).toLocaleDateString("vi-VN") : "",
        "Lương Cơ Bản (VNĐ)": Math.round(getEmpBaseSalary(emp)),
        "Trạng Thái": emp.status === "ACTIVE" ? "Đang công tác" : emp.status === "PROBATION" ? "Thử việc" : "Đã thôi việc",
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "Danh_Ba_Nhan_Su");
      XLSX.writeFile(wb, `Danh_Ba_Nhan_Su_Nexustech_${new Date().toISOString().slice(0, 10)}.xlsx`);
      alert("Đã xuất Danh bạ Nhân sự Excel (.xlsx) thành công!");
    } catch (err) {
      console.error("Export employees Excel error:", err);
      alert("Không thể xuất file Excel. Vui lòng thử lại.");
    }
  };

  return (
    <>
      <div className="space-y-6 animate-swiss-in pb-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Quản Trị Hồ Sơ Nhân Lực
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Quản lý danh sách nhân viên, trưởng bộ phận, phân quyền và chức vụ chuyên môn
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportEmployeesExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-xl text-xs font-semibold transition-all border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs active:scale-95"
              title="Xuất danh bạ nhân sự đang lọc ra file Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Xuất Excel (.xlsx)</span>
            </button>
            <button 
              onClick={() => { setSelectedEmp(null); setIsModalOpen(true); }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
            >
              <span>+ Thêm nhân sự</span>
            </button>
          </div>
        </div>

        {/* Unified Swiss Employee Metric Strip */}
        <div className="bento-card rounded-2xl overflow-hidden grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Tổng nhân sự</span>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight mt-1">{employees.length}</p>
              </div>
              <Users className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">Toàn bộ danh bạ nhân sự</div>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Đang công tác</span>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight mt-1">{activeCount}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Biên chế đang hoạt động</div>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Trưởng bộ phận</span>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight mt-1">{departmentManagers.length}</p>
              </div>
              <UserCheck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">Quản lý cấp trung & lãnh đạo</div>
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Khối phòng ban</span>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight mt-1">{departmentsList.length}</p>
              </div>
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">Đơn vị chuyên môn trực thuộc</div>
          </div>
        </div>

        {/* Executive Leadership & Heads Overview */}
        <div className="bento-card p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                LÃNH ĐẠO
              </span>
              <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Ban điều hành & Trưởng bộ phận ({departmentManagers.length} vị trí)
              </h2>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">
              Đầy đủ 5 vị trí phụ trách
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-3">
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
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      TRƯỞNG PHÒNG
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                    {mgr.user.name}
                  </div>
                  <div className="text-[11px] font-medium text-amber-900 dark:text-amber-300 line-clamp-2 mt-1 leading-snug">
                    {mgr.position}
                  </div>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-amber-200/50 dark:border-amber-900/40 text-[11px] text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Đơn vị: </span>
                  <span>{mgr.managedDept?.name || mgr.department?.name}</span>
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
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700/80 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-blue-600 transition-all rounded-xl shadow-2xs"
                  placeholder="Tìm tên, chức vụ, email..."
                />
              </div>

              {/* Segmented Filter: All vs Managers vs Staff */}
              <div className="flex bg-zinc-200/60 dark:bg-zinc-800 p-1 rounded-xl text-xs">
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
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    roleFilter === "MANAGERS" 
                      ? "bg-amber-500 text-white font-bold shadow-2xs" 
                      : "text-amber-600 dark:text-amber-400 hover:text-amber-700"
                  }`}
                >
                  TRƯỞNG PHÒNG ({departmentManagers.length})
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
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none shadow-2xs"
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

          <div className="overflow-x-auto min-w-full">
            <table className="w-full min-w-[960px] text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                  <th onClick={() => handleSort("name")} className="px-5 py-3 font-semibold cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none">
                    <span className="inline-flex items-center gap-1.5">Họ và tên <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" /></span>
                  </th>
                  <th className="px-5 py-3 font-semibold">Liên hệ</th>
                  <th onClick={() => handleSort("department")} className="px-5 py-3 font-semibold cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none">
                    <span className="inline-flex items-center gap-1.5">Phòng ban <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" /></span>
                  </th>
                  <th onClick={() => handleSort("joinDate")} className="px-5 py-3 font-semibold cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none">
                    <span className="inline-flex items-center gap-1.5">Ngày vào làm <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" /></span>
                  </th>
                  <th onClick={() => handleSort("baseSalary")} className="px-5 py-3 font-semibold text-right cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none">
                    <span className="inline-flex items-center justify-end gap-1.5">Lương cơ bản <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" /></span>
                  </th>
                  <th className="px-5 py-3 font-semibold text-center">Trạng thái</th>
                  <th className="px-5 py-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded bg-zinc-200 dark:bg-zinc-800" /><div className="space-y-1.5"><div className="h-3.5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" /><div className="h-2.5 w-16 bg-zinc-100 dark:bg-zinc-800/60 rounded" /></div></div></td>
                      <td className="px-5 py-3.5"><div className="space-y-1.5"><div className="h-3 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" /><div className="h-2.5 w-24 bg-zinc-100 dark:bg-zinc-800/60 rounded" /></div></td>
                      <td className="px-5 py-3.5"><div className="space-y-1.5"><div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" /><div className="h-2.5 w-24 bg-zinc-100 dark:bg-zinc-800/60 rounded" /></div></td>
                      <td className="px-5 py-3.5"><div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" /></td>
                      <td className="px-5 py-3.5 text-right"><div className="h-3.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded ml-auto" /></td>
                      <td className="px-5 py-3.5 text-center"><div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto" /></td>
                      <td className="px-5 py-3.5 text-right"><div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-zinc-500 text-xs">
                      Không tìm thấy nhân sự phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((emp) => {
                    const isMgr = checkIsManager(emp);
                    const deptManagerName = emp.department?.manager?.user?.name;
                    const joinDateVal = getEmpJoinDate(emp);
                    const baseSal = getEmpBaseSalary(emp);

                    return (
                      <tr key={emp.id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${isMgr ? "bg-amber-50/20 dark:bg-amber-950/5" : ""}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded border flex items-center justify-center font-mono text-[11px] font-bold ${isMgr ? "border-amber-400 bg-amber-500 text-white shadow-xs" : "border-zinc-300 dark:border-zinc-700 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"}`}>
                              {isMgr ? "TP" : emp.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                <span>{emp.user.name}</span>
                                {isMgr && <span className="inline-flex items-center text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">LEADER</span>}
                              </div>
                              <div className="font-mono text-[10px] text-zinc-400">ID: {emp.id.substring(0, 6).toUpperCase()} • {emp.user.role?.name || "N/A"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="space-y-0.5">
                            <div className="text-zinc-700 dark:text-zinc-300 font-mono text-xs">{emp.user.email}</div>
                            {emp.phone && <div className="font-mono text-[11px] text-zinc-400">{emp.phone}</div>}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {isMgr ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">TRƯỞNG PHÒNG</span>
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">{emp.position}</span>
                              </div>
                              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Phụ trách: {emp.managedDept?.name || emp.department?.name}</div>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <div className="font-medium text-zinc-900 dark:text-zinc-100">{emp.position}</div>
                              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{emp.department?.name || "Chưa xếp phòng"}</div>
                              <div className="text-[10px] text-zinc-400 mt-0.5">Trực thuộc TP: <strong className="text-zinc-700 dark:text-zinc-300 font-medium">{deptManagerName || "Đang bổ nhiệm"}</strong></div>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-zinc-600 dark:text-zinc-400">
                          {joinDateVal > 0 ? new Date(joinDateVal).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                          {baseSal > 0 ? `${baseSal.toLocaleString("vi-VN")} ₫` : "--"}
                        </td>
                        <td className="px-5 py-3.5 text-center font-mono">
                          {emp.status === "RESIGNED" ? (
                            <span className="inline-flex items-center px-2 py-0.5 text-[10px] rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-semibold">THÔI VIỆC</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 text-[10px] rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">HOẠT ĐỘNG</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right text-xs">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setViewingEmp(emp)} className="px-2.5 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded font-medium transition-colors" title="Xem hồ sơ chi tiết">Xem</button>
                            {emp.user.email !== "admin@nexustech.vn" && emp.user.email !== "admin@hrmis.com" && emp.user.email !== "ceo@nexustech.vn" && emp.user.role?.name !== "SYSTEM_ADMIN" && emp.user.role?.name !== "BOD" && (
                              <>
                                <button onClick={() => { setSelectedEmp(emp); setIsModalOpen(true); }} className="px-2.5 py-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded font-medium transition-colors" title="Sửa hồ sơ">Sửa</button>
                                <button onClick={() => handleDelete(emp.id, emp.user.name)} className="px-2.5 py-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded font-medium transition-colors" title="Xử lý hồ sơ">Xóa</button>
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

          <div className="px-5 py-3.5 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
              <span>Hiển thị <strong className="font-mono text-zinc-900 dark:text-zinc-100">{startIndex}–{endIndex}</strong> trên tổng <strong className="font-mono text-zinc-900 dark:text-zinc-100">{totalItems}</strong> nhân sự</span>
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none">
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 dark:text-zinc-400 mr-1">Trang <strong className="font-mono text-zinc-900 dark:text-zinc-100">{safePage}</strong> / <span className="font-mono">{totalPages}</span></span>
              <button type="button" disabled={safePage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all active:scale-[0.98]"><ChevronLeft className="w-3.5 h-3.5" /> Trước</button>
              <button type="button" disabled={safePage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all active:scale-[0.98]">Sau <ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
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
                  <div className="text-xs text-zinc-500">{viewingEmp.contracts?.[0]?.contractType || "Chưa cập nhật hợp đồng"}</div>
                  <div className="text-xs text-emerald-600 font-medium">Bảo hiểm: Đã tham gia đầy đủ 10.5%</div>
                </div>

                <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1.5 shadow-xs">
                  <div className="text-xs text-zinc-500 font-medium">Mức lương cơ bản</div>
                  <div className="font-mono font-bold text-base text-zinc-900 dark:text-zinc-100">
                    {(viewingEmp.salaryConfig?.baseSalary ?? viewingEmp.baseSalary)
                      ? `${Number(viewingEmp.salaryConfig?.baseSalary ?? viewingEmp.baseSalary).toLocaleString("vi-VN")} VNĐ / tháng`
                      : "Chưa cấu hình lương"}
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
                {viewingEmp.user.email !== "admin@nexustech.vn" && viewingEmp.user.email !== "admin@hrmis.com" && viewingEmp.user.email !== "ceo@nexustech.vn" && viewingEmp.user.role?.name !== "SYSTEM_ADMIN" && viewingEmp.user.role?.name !== "BOD" && (
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
                )}
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
