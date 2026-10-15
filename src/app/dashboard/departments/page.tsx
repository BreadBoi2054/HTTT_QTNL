"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, Search, Building2, Network, Users, UserCheck, X, ArrowUpRight, Mail } from "lucide-react";
import DepartmentModal from "@/components/departments/DepartmentModal";
import { useConfirm, CardGridSkeleton, TableSkeleton } from "@/components/providers/ToastProvider";

export default function DepartmentsPage() {
  const { data: session } = useSession();
  const confirm = useConfirm();
  const userRole = (session?.user as any)?.roleName || "USER";
  const canManageDepts = ["SYSTEM_ADMIN", "BOD", "HR"].includes(userRole);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"chart" | "list">("chart");
  const [viewingDept, setViewingDept] = useState<any>(null);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/employees")
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (Array.isArray(d)) setAllEmployees(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!viewingDept) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewingDept(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewingDept]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/departments");
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!(await confirm("Bạn có chắc chắn muốn xóa phòng ban này?"))) return;
    try {
      const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorText = await res.text();
        alert(errorText || "Không thể xóa phòng ban.");
        return;
      }
      fetchDepartments();
    } catch (error: any) {
      alert(error.message || "Lỗi khi xóa phòng ban");
    }
  };

  const openAddModal = () => {
    setSelectedDept(null);
    setIsModalOpen(true);
  };

  const openEditModal = (dept: any) => {
    setSelectedDept(dept);
    setIsModalOpen(true);
  };

  const filteredData = departments.filter((d) => 
    d.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-swiss-in pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Cơ Cấu Tổ Chức Doanh Nghiệp
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Sơ đồ tổ chức, quản trị phòng ban và phân nhiệm lãnh đạo
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented Control Tabs */}
          <div className="flex bg-zinc-100/80 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
            <button
              onClick={() => setActiveTab("chart")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "chart"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Sơ đồ cây</span>
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "list"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Danh sách</span>
            </button>
          </div>

          {canManageDepts && (
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm phòng ban</span>
            </button>
          )}
        </div>
      </div>

      {/* Sơ đồ Cây Tổ chức */}
      {activeTab === "chart" && (
        <div className="space-y-6">
          {/* Level 1: Ban Giám Đốc */}
          <div className="flex justify-center">
            <div className="bento-card p-6 w-full max-w-md text-center shadow-xs border border-zinc-200/90 dark:border-zinc-800/90">
              <div className="squircle w-12 h-12 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 mx-auto mb-3 shadow-xs group-hover:scale-105 transition-transform">
                <Network className="w-6 h-6" />
              </div>
              <div className="swiss-label mb-1">
                Ban Lãnh Đạo
              </div>
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Ban Giám Đốc (BOD)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Hoạch định chiến lược và điều hành tổng thể hệ thống
              </p>
              <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-around text-xs text-zinc-500">
                <span>Trực thuộc: <strong className="text-zinc-800 dark:text-zinc-200 font-mono font-bold">{departments.length} phòng ban</strong></span>
                <span>·</span>
                <span>Quyền hạn: <strong className="text-blue-600 dark:text-blue-400 font-semibold">Toàn quyền điều hành</strong></span>
              </div>
            </div>
          </div>

          {/* Connection Divider */}
          <div className="flex justify-center">
            <div className="w-0.5 h-8 bg-blue-400/50 dark:bg-blue-600/50" />
          </div>

          {/* Search filter on chart view */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-sm">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs focus:outline-none focus:border-blue-600 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 shadow-2xs"
                placeholder="Lọc nhanh phòng ban trên sơ đồ..."
              />
            </div>
          </div>

          {/* Level 2: Các Phòng ban trực thuộc */}
          {loading ? (
            <CardGridSkeleton count={3} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map((dept) => (
                <div
                  key={dept.id}
                  className="bento-card p-5 hover:border-blue-400/60 dark:hover:border-blue-600/60 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="squircle w-9 h-9 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shadow-2xs">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/80 font-semibold font-mono">
                        <Users className="w-3 h-3 text-zinc-400" />
                        {dept._count?.employees || 0} nhân sự
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1 tracking-tight">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {dept.description || "Chưa có mô tả chức năng nhiệm vụ phòng ban."}
                    </p>
                  </div>

                  <div className="pt-3.5 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                      <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-xs">Trưởng phòng: <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">{dept.manager?.user?.name || "Đang bổ nhiệm"}</strong></span>
                    </div>
                    {canManageDepts && (
                      <button 
                        onClick={() => openEditModal(dept)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                      >
                        Sửa
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area - Table List */}
      {activeTab === "list" && (
        <div className="bento-card rounded-2xl overflow-hidden shadow-xs">
          {/* Toolbar */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-900/40">
            <div className="relative w-full max-w-sm">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs focus:outline-none focus:border-blue-600 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 shadow-2xs"
                placeholder="Tìm kiếm phòng ban..."
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-5 py-3 font-semibold">Phòng ban</th>
                  <th className="px-5 py-3 font-semibold">Mô tả nhiệm vụ</th>
                  <th className="px-5 py-3 font-semibold text-center">Định biên</th>
                  <th className="px-5 py-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-4">
                      <TableSkeleton rows={5} cols={4} />
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-zinc-500 text-xs">
                      Không tìm thấy phòng ban nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((dept) => (
                    <tr key={dept.id} onClick={() => setViewingDept(dept)} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">{dept.name}</div>
                            <div className="text-[11px] text-zinc-500 font-mono">Mã: {dept.id.substring(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400 max-w-xs truncate text-xs">
                        {dept.description || "Không có mô tả"}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="text-xs px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                          <span className="font-mono">{dept._count?.employees ?? dept.employees?.length ?? 0}</span> nhân sự
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 text-xs">
                          <button
                            type="button"
                            onClick={() => setViewingDept(dept)}
                            className="px-2.5 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded font-medium transition-colors"
                          >
                            Xem nhân sự
                          </button>
                          {canManageDepts && (
                            <>
                              <button 
                                onClick={() => openEditModal(dept)}
                                className="px-2.5 py-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded font-medium transition-colors"
                                title="Chỉnh sửa phòng ban"
                              >
                                Sửa
                              </button>
                              <button 
                                onClick={() => handleDelete(dept.id)}
                                className="px-2.5 py-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded font-medium transition-colors"
                                title="Xóa phòng ban"
                              >
                                Xóa
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Right Slide-Over Drawer for Department Personnel */}
      {viewingDept && (() => {
        const deptEmployees = Array.isArray(viewingDept.employees)
          ? viewingDept.employees
          : allEmployees.filter((e: any) => e.departmentId === viewingDept.id || e.department?.id === viewingDept.id);
        return (
          <div
            className="fixed inset-0 z-50 flex justify-end bg-zinc-950/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setViewingDept(null)}
          >
            <div
              className="w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 h-full shadow-2xl flex flex-col justify-between overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{viewingDept.name}</h3>
                    <p className="text-[11px] text-zinc-500 font-mono">Mã đơn vị: {viewingDept.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingDept(null)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                  title="Đóng (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">Chức năng & Nhiệm vụ</span>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {viewingDept.description || "Chưa có mô tả chức năng nhiệm vụ phòng ban."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 text-zinc-500" />
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">Trưởng bộ phận</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{viewingDept.manager?.user?.name || "Đang bổ nhiệm"}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Quản lý
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      Nhân sự trực thuộc (<span className="font-mono">{deptEmployees.length}</span>)
                    </span>
                  </div>

                  {deptEmployees.length === 0 ? (
                    <div className="p-6 text-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                      Chưa có nhân sự nào thuộc phòng ban này.
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
                      {deptEmployees.map((emp: any) => {
                        const empName = emp.user?.name || emp.name || "Nhân viên";
                        const empEmail = emp.user?.email || emp.email || "";
                        return (
                          <div key={emp.id} className="p-3 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center font-mono text-[11px] font-bold shrink-0">
                                {empName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{empName}</div>
                                <div className="text-[11px] text-zinc-500 truncate">{emp.position || "Chuyên viên"}</div>
                                {empEmail && (
                                  <div className="text-[10px] text-zinc-400 font-mono truncate flex items-center gap-1">
                                    <Mail className="w-2.5 h-2.5" /> {empEmail}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                              {emp.status === "RESIGNED" ? "Thôi việc" : "Đang làm"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 flex items-center justify-between gap-2">
                <Link
                  href={`/dashboard/employees?search=${encodeURIComponent(viewingDept.name)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>Mở trong Danh bạ Nhân sự</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setViewingDept(null)}
                  className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-medium transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <DepartmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDepartments}
        department={selectedDept}
      />
    </div>
  );
}
