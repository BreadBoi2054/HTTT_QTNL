"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Plus,
  Search,
  Building2,
  Network,
  Users,
  UserCheck,
  X,
  ArrowUpRight,
  Mail,
  Crown,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Edit2,
} from "lucide-react";
import DepartmentModal from "@/components/departments/DepartmentModal";
import { useConfirm, CardGridSkeleton, TableSkeleton } from "@/components/providers/ToastProvider";

const RIPPLING_AVATAR_TONES = [
  "bg-[#f3e8ee] text-[#611f4c] border-[#e2cada] dark:bg-[#38192e] dark:text-[#f0c6e2] dark:border-[#542846]",
  "bg-[#e6f3f5] text-[#155666] border-[#c4e2e8] dark:bg-[#113640] dark:text-[#9ddce9] dark:border-[#1d5260]",
  "bg-[#faefe4] text-[#7c3a11] border-[#edd5bc] dark:bg-[#3d2210] dark:text-[#f5cfa8] dark:border-[#5c351a]",
  "bg-[#e8f3ec] text-[#185936] border-[#c6e1d0] dark:bg-[#123623] dark:text-[#a6e3bf] dark:border-[#1d5437]",
  "bg-[#ececf6] text-[#353273] border-[#d1d1e8] dark:bg-[#201f42] dark:text-[#c7c6f0] dark:border-[#343266]",
  "bg-[#f2ece4] text-[#4d4132] border-[#dfd3c3] dark:bg-[#2c261e] dark:text-[#dfd4c5] dark:border-[#473d31]",
];

function getInitials(fullName: string): string {
  if (!fullName) return "NV";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getPeopleAvatarTone(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return RIPPLING_AVATAR_TONES[hash % RIPPLING_AVATAR_TONES.length];
}

function isSubLeadPosition(position: string = ""): boolean {
  const p = position.toLowerCase();
  return p.includes("phó") || p.includes("lead") || p.includes("trưởng nhóm");
}

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
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({});
  const [expandAllTree, setExpandAllTree] = useState<boolean>(true);

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
      const list = Array.isArray(data) ? data : [];
      setDepartments(list);
      const initExpanded: Record<string, boolean> = {};
      list.forEach((d: any) => {
        initExpanded[d.id] = true;
      });
      setExpandedDepts(initExpanded);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleToggleAllBranches = () => {
    const nextState = !expandAllTree;
    setExpandAllTree(nextState);
    const nextMap: Record<string, boolean> = {};
    departments.forEach((d) => {
      nextMap[d.id] = nextState;
    });
    setExpandedDepts(nextMap);
  };

  const toggleDeptBranch = (deptId: string) => {
    setExpandedDepts((prev) => ({
      ...prev,
      [deptId]: !prev[deptId],
    }));
  };

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

  // Phân tách Cấp 1 (Ban Tổng Giám Đốc - BOD) và Cấp 2 (Các Khối / Phòng ban Chuyên môn trực thuộc)
  const { bodDepartment, functionalDepartments, totalEmployeesCount } = useMemo(() => {
    const bod = departments.find(
      (d) =>
        d.name?.toLowerCase().includes("ban tổng giám đốc") ||
        d.name?.toLowerCase().includes("bod") ||
        d.name?.toLowerCase().includes("ban giám đốc")
    );
    const functional = departments.filter((d) => d.id !== bod?.id);
    const totalEmp = departments.reduce(
      (sum, d) => sum + (d._count?.employees ?? d.employees?.length ?? 0),
      0
    );
    return {
      bodDepartment: bod || null,
      functionalDepartments: functional,
      totalEmployeesCount: totalEmp,
    };
  }, [departments]);

  const filteredData = useMemo(() => {
    if (!search.trim()) return departments;
    const q = search.toLowerCase();
    return departments.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.manager?.user?.name?.toLowerCase().includes(q) ||
        (d.employees || []).some(
          (e: any) =>
            e.user?.name?.toLowerCase().includes(q) ||
            e.position?.toLowerCase().includes(q)
        )
    );
  }, [departments, search]);

  const searchQuery = search.trim().toLowerCase();

  return (
    <div className="space-y-5 animate-swiss-in pb-12 max-w-[1440px] mx-auto">
      {/* Header & Unified Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Cơ Cấu Tổ Chức & Cây Phân Cấp Nhân Sự
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0f4c5c]/10 text-[#0f4c5c] dark:bg-teal-950/60 dark:text-teal-300 border border-[#0f4c5c]/20">
              4 Cấp quản trị · {totalEmployeesCount} Nhân sự
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Sơ đồ cây phân cấp trực quan từ Ban Tổng Giám Đốc (Cấp 1) → Khối/Phòng ban & Trưởng đơn vị (Cấp 2) → Phó phòng/Lead (Cấp 3) → Chuyên viên (Cấp 4)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Ô tìm kiếm đặt gọn trên thanh công cụ thay vì cắt ngang thân cây */}
          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-2 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-700/80 rounded-xl text-xs focus:outline-none focus:border-[#0f4c5c] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 shadow-2xs"
              placeholder="Tìm người, chức danh, phòng ban..."
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {activeTab === "chart" && (
            <button
              type="button"
              onClick={handleToggleAllBranches}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200/90 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
            >
              {expandAllTree ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-[#0f4c5c] dark:text-teal-400" />
                  <span>Thu gọn nhánh Cấp 3–4</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-[#0f4c5c] dark:text-teal-400" />
                  <span>Mở toàn bộ cây ({totalEmployeesCount} NS)</span>
                </>
              )}
            </button>
          )}

          {/* Segmented Control Tabs */}
          <div className="flex bg-zinc-100/90 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
            <button
              onClick={() => setActiveTab("chart")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "chart"
                  ? "bg-white dark:bg-zinc-900 text-[#0f4c5c] dark:text-teal-400 shadow-2xs"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Sơ đồ cây</span>
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "list"
                  ? "bg-white dark:bg-zinc-900 text-[#0f4c5c] dark:text-teal-400 shadow-2xs"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Bảng danh sách</span>
            </button>
          </div>

          {canManageDepts && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0f4c5c] hover:bg-[#0b3b47] text-white rounded-xl text-xs font-bold transition-colors shadow-xs active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm phòng ban</span>
            </button>
          )}
        </div>
      </div>

      {/* =====================================================================
          SƠ ĐỒ CÂY TỔ CHỨC 4 CẤP CHUẨN DOANH NGHIỆP (ORTHOGONAL ORG CHART)
         ===================================================================== */}
      {activeTab === "chart" && (
        <div className="bento-card p-5 sm:p-7 overflow-x-auto">
          {loading ? (
            <CardGridSkeleton count={5} />
          ) : (
            <div className="min-w-[1120px] flex flex-col items-center">
              {/* Chú giải 4 Tầng Phân cấp Sơ đồ Cây */}
              <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-5 mb-6 border-b border-zinc-200/70 dark:border-zinc-800/80 text-[11px]">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0f4c5c] inline-block" />
                    Cấp 1: Hội đồng & Ban Tổng Giám Đốc (BOD)
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-700">→</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
                    Cấp 2: {functionalDepartments.length} Khối Phòng ban & Trưởng đơn vị
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-700">→</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    Cấp 3: Phó phòng / Trưởng nhóm / Tech Lead
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-700">→</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 inline-block" />
                    Cấp 4: Chuyên viên & Kỹ sư nghiệp vụ
                  </span>
                </div>
                <span className="text-zinc-500 dark:text-zinc-400">
                  Mẹo: Bấm vào từng phòng ban để xem Hồ sơ đơn vị hoặc thu/mở nhánh cây
                </span>
              </div>

              {/* ===============================================================
                  TẦNG 1: BAN TỔNG GIÁM ĐỐC (BOD ROOT TREE NODE)
                 =============================================================== */}
              {(() => {
                const bodEmployees: any[] = bodDepartment?.employees || [];
                const ceoEmp =
                  bodEmployees.find(
                    (e) =>
                      e.id === bodDepartment?.managerId ||
                      e.position?.toLowerCase().includes("tổng giám đốc (ceo")
                  ) || bodEmployees[0];
                const cSuiteMembers = bodEmployees.filter((e) => e.id !== ceoEmp?.id);
                const ceoName =
                  ceoEmp?.user?.name ||
                  bodDepartment?.manager?.user?.name ||
                  "Đỗ Minh Hiếu";
                const ceoPos =
                  ceoEmp?.position || "Tổng Giám Đốc (CEO & Ban Điều Hành)";
                const isBodMatched =
                  searchQuery &&
                  (bodDepartment?.name?.toLowerCase().includes(searchQuery) ||
                    ceoName.toLowerCase().includes(searchQuery) ||
                    cSuiteMembers.some(
                      (m) =>
                        m.user?.name?.toLowerCase().includes(searchQuery) ||
                        m.position?.toLowerCase().includes(searchQuery)
                    ));

                return (
                  <div className="flex flex-col items-center w-full">
                    {/* Cấp 1A: Đỉnh Cây — Tổng Giám Đốc (CEO) & Khối Điều hành BOD */}
                    <div
                      onClick={() => bodDepartment && setViewingDept(bodDepartment)}
                      className={`relative w-full max-w-3xl rounded-2xl border-2 transition-all cursor-pointer p-4 bg-gradient-to-b from-[#0f4c5c]/[0.06] to-white dark:from-[#0f4c5c]/25 dark:to-zinc-900 shadow-sm ${
                        isBodMatched
                          ? "border-amber-500 ring-2 ring-amber-400/40"
                          : "border-[#0f4c5c]/45 dark:border-teal-500/50 hover:border-[#0f4c5c]"
                      }`}
                    >
                      {/* Header Cấp 1 */}
                      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-zinc-200/80 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#0f4c5c] text-white">
                            <Crown className="w-3 h-3 text-amber-300" />
                            Cấp 1 · Đỉnh Cây Điều Hành
                          </span>
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {bodDepartment?.name || "Ban Tổng Giám Đốc (BOD)"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                            {bodEmployees.length || 4} lãnh đạo cấp cao
                          </span>
                          {canManageDepts && bodDepartment && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(bodDepartment);
                              }}
                              className="p-1 rounded-md text-zinc-500 hover:text-[#0f4c5c] hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              title="Chỉnh sửa Ban Tổng Giám Đốc"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Node CEO (Đỉnh cao nhất) */}
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border-2 border-[#0f4c5c] dark:border-teal-500 shadow-xs">
                          <div
                            className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${getPeopleAvatarTone(
                              ceoName
                            )}`}
                          >
                            {getInitials(ceoName)}
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                                {ceoName}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/70">
                                CEO
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
                              {ceoPos}
                            </div>
                          </div>
                        </div>

                        {/* Nhánh con nội bộ trong Ban Tổng Giám Đốc: Phó TGĐ (CTO, COO) & Thư ký HĐQT */}
                        {cSuiteMembers.length > 0 && (
                          <>
                            {/* Đường thẳng đứng từ CEO xuống thanh ngang Phó TGĐ */}
                            <div className="w-0.5 h-4 bg-[#0f4c5c]/50 dark:bg-teal-500/50" />
                            <div className="grid grid-cols-3 w-full pt-0">
                              {cSuiteMembers.map((member: any, idx: number) => {
                                const mName = member.user?.name || "Lãnh đạo";
                                const isFirst = idx === 0;
                                const isLast = idx === cSuiteMembers.length - 1;
                                const isMemberMatch =
                                  searchQuery &&
                                  (mName.toLowerCase().includes(searchQuery) ||
                                    member.position?.toLowerCase().includes(searchQuery));
                                return (
                                  <div
                                    key={member.id}
                                    className="relative flex flex-col items-center pt-3 px-1.5"
                                  >
                                    {/* Thanh ngang nối các Phó TGĐ / Trợ lý BOD */}
                                    {cSuiteMembers.length > 1 && (
                                      <div
                                        className={`absolute top-0 h-0.5 bg-[#0f4c5c]/45 dark:bg-teal-500/45 ${
                                          isFirst
                                            ? "left-1/2 right-0"
                                            : isLast
                                            ? "left-0 right-1/2"
                                            : "left-0 right-0"
                                        }`}
                                      />
                                    )}
                                    {/* Đường dọc từ thanh ngang xuống thẻ Phó TGĐ */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-[#0f4c5c]/45 dark:bg-teal-500/45" />

                                    <div
                                      className={`w-full rounded-xl p-2.5 border bg-white/95 dark:bg-zinc-900/95 flex items-center gap-2.5 shadow-2xs ${
                                        isMemberMatch
                                          ? "border-amber-500 bg-amber-50/40"
                                          : "border-zinc-200/90 dark:border-zinc-800"
                                      }`}
                                    >
                                      <div
                                        className={`w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${getPeopleAvatarTone(
                                          mName
                                        )}`}
                                      >
                                        {getInitials(mName)}
                                      </div>
                                      <div className="min-w-0 text-left">
                                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                          {mName}
                                        </div>
                                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                                          {member.position}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* ĐƯỜNG TRỤC CHÍNH TỪ BAN TỔNG GIÁM ĐỐC XUỐNG 5 KHỐI PHÒNG BAN CHUYÊN MÔN */}
                    <div className="relative flex flex-col items-center">
                      <div className="w-0.5 h-8 bg-[#0f4c5c] dark:bg-teal-500" />
                      <div className="px-3 py-0.5 rounded-full bg-[#0f4c5c] text-white text-[10px] font-bold tracking-wider uppercase shadow-2xs">
                        Trực thuộc điều hành ({functionalDepartments.length} Khối Chuyên môn)
                      </div>
                      <div className="w-0.5 h-5 bg-[#0f4c5c] dark:bg-teal-500" />
                    </div>
                  </div>
                );
              })()}

              {/* ===============================================================
                  TẦNG 2, 3, 4: CÁC KHỐI PHÒNG BAN CHUYÊN MÔN & NHÁNH CÂY NHÂN SỰ
                 =============================================================== */}
              <div
                className="w-full grid gap-0"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(
                    functionalDepartments.length,
                    1
                  )}, minmax(215px, 1fr))`,
                }}
              >
                {functionalDepartments.map((dept, colIdx) => {
                  const isFirstCol = colIdx === 0;
                  const isLastCol = colIdx === functionalDepartments.length - 1;
                  const deptEmployees: any[] = Array.isArray(dept.employees)
                    ? dept.employees
                    : [];
                  const managerName =
                    dept.manager?.user?.name || "Đang bổ nhiệm";
                  const managerPos =
                    dept.manager?.position || "Trưởng bộ phận";
                  const managerId = dept.managerId || dept.manager?.id;

                  // Tách nhân sự cấp dưới (không trùng Trưởng phòng đang đứng ở Cấp 2)
                  const subordinates = deptEmployees.filter(
                    (e) => e.id !== managerId
                  );
                  const level3Leads = subordinates.filter((e) =>
                    isSubLeadPosition(e.position)
                  );
                  const level4Members = subordinates.filter(
                    (e) => !isSubLeadPosition(e.position)
                  );

                  const isExpanded = expandedDepts[dept.id] ?? true;
                  const isDeptMatched =
                    searchQuery &&
                    (dept.name?.toLowerCase().includes(searchQuery) ||
                      managerName.toLowerCase().includes(searchQuery) ||
                      subordinates.some(
                        (s) =>
                          s.user?.name?.toLowerCase().includes(searchQuery) ||
                          s.position?.toLowerCase().includes(searchQuery)
                      ));

                  return (
                    <div
                      key={dept.id}
                      className="relative flex flex-col items-center pt-6 px-2"
                    >
                      {/* ĐƯỜNG NGANG PHÂN NHÁNH CÂY (HORIZONTAL TREE BUS) */}
                      {functionalDepartments.length > 1 && (
                        <div
                          className={`absolute top-0 h-0.5 bg-[#0f4c5c] dark:bg-teal-500 ${
                            isFirstCol
                              ? "left-1/2 right-0"
                              : isLastCol
                              ? "left-0 right-1/2"
                              : "left-0 right-0"
                          }`}
                        />
                      )}
                      {/* ĐƯỜNG DỌC NỐI TỪ THANH NGANG XUỐNG NODE PHÒNG BAN */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-[#0f4c5c] dark:bg-teal-500" />
                      {/* Chấm tròn khớp nối trên đầu mỗi phòng ban */}
                      <div className="absolute top-[20px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#0f4c5c] dark:bg-teal-400 border-2 border-white dark:border-zinc-900 z-10" />

                      {/* =================================================
                          NODE CẤP 2: ĐƠN VỊ PHÒNG BAN & TRƯỞNG BỘ PHẬN
                         ================================================= */}
                      <div
                        className={`w-full rounded-2xl border-2 bg-white dark:bg-zinc-900 shadow-xs transition-all overflow-hidden ${
                          isDeptMatched
                            ? "border-amber-500 ring-2 ring-amber-400/30"
                            : "border-[#0f4c5c]/35 dark:border-teal-600/40 hover:border-[#0f4c5c]"
                        }`}
                      >
                        {/* Phần đầu: Tên Phòng ban */}
                        <div
                          onClick={() => setViewingDept(dept)}
                          className="p-3 bg-[#f8f7f4] dark:bg-zinc-800/70 border-b border-zinc-200/80 dark:border-zinc-800 cursor-pointer hover:bg-[#efede8]/70 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0f4c5c] dark:text-teal-400">
                              Cấp 2 · Phòng ban
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                                {dept._count?.employees ?? deptEmployees.length} NS
                              </span>
                              {canManageDepts && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(dept);
                                  }}
                                  className="p-1 text-zinc-400 hover:text-[#0f4c5c] rounded"
                                  title="Sửa phòng ban"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <h3 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 leading-snug">
                            {dept.name}
                          </h3>
                        </div>

                        {/* Phần thân: Trưởng bộ phận (Head of Department) */}
                        <div
                          onClick={() => setViewingDept(dept)}
                          className="p-3 bg-white dark:bg-zinc-900 cursor-pointer"
                        >
                          <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
                            <span>Trưởng đơn vị</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                              Quản lý trực tiếp
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0 ${getPeopleAvatarTone(
                                managerName
                              )}`}
                            >
                              {getInitials(managerName)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                {managerName}
                              </div>
                              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                                {managerPos}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Nút đóng/mở nhánh cây Cấp 3 & Cấp 4 */}
                        <button
                          type="button"
                          onClick={() => toggleDeptBranch(dept.id)}
                          className="w-full py-1.5 px-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-[#0f4c5c] dark:hover:text-teal-300 transition-colors"
                        >
                          <span>
                            Nhánh trực thuộc ({subordinates.length} thành viên)
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* =================================================
                          NHÁNH CÂY DỌC CẤP 3 (PHÓ PHÒNG/LEAD) & CẤP 4 (CHUYÊN VIÊN)
                         ================================================= */}
                      {isExpanded && subordinates.length > 0 && (
                        <div className="w-full pl-4 pt-1 flex flex-col">
                          {/* Trục dọc xương sống của phòng ban (Vertical Tree Spine) */}
                          <div className="relative border-l-2 border-[#0f4c5c]/40 dark:border-teal-500/40 pl-3.5 py-2 space-y-2.5">
                            {/* Nhóm Cấp 3: Phó phòng / Trưởng nhóm / Tech Lead */}
                            {level3Leads.map((emp: any) => {
                              const empName = emp.user?.name || "Nhân sự";
                              const isHighlighted =
                                searchQuery &&
                                (empName.toLowerCase().includes(searchQuery) ||
                                  emp.position?.toLowerCase().includes(searchQuery));
                              return (
                                <div
                                  key={emp.id}
                                  onClick={() => setViewingDept(dept)}
                                  className={`relative rounded-xl border p-2.5 bg-[#f8f7f4]/90 dark:bg-zinc-900/90 hover:border-[#0f4c5c] transition-all cursor-pointer shadow-2xs ${
                                    isHighlighted
                                      ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30"
                                      : "border-amber-300/80 dark:border-amber-800/70"
                                  }`}
                                >
                                  {/* Đường ngang nối từ trục dọc vào thẻ Cấp 3 (├──) */}
                                  <div className="absolute -left-[15px] top-1/2 -translate-y-1/2 w-3.5 h-0.5 bg-[#0f4c5c]/45 dark:bg-teal-500/45" />
                                  <div className="absolute -left-[18px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-500 border border-white dark:border-zinc-900" />

                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100/90 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                      Cấp 3 · Phó phòng / Lead
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${getPeopleAvatarTone(
                                        empName
                                      )}`}
                                    >
                                      {getInitials(empName)}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                        {empName}
                                      </div>
                                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                                        {emp.position}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Nhóm Cấp 4: Chuyên viên & Kỹ sư thực thi (Nhánh con lồng dưới Cấp 3) */}
                            {level4Members.length > 0 && (
                              <div className="ml-3 border-l-2 border-dashed border-zinc-300 dark:border-zinc-700 pl-3 pt-1 space-y-2">
                                <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 pl-0.5">
                                  Cấp 4 · Chuyên viên ({level4Members.length})
                                </div>
                                {level4Members.map((emp: any) => {
                                  const empName = emp.user?.name || "Chuyên viên";
                                  const isHighlighted =
                                    searchQuery &&
                                    (empName.toLowerCase().includes(searchQuery) ||
                                      emp.position?.toLowerCase().includes(searchQuery));
                                  return (
                                    <div
                                      key={emp.id}
                                      onClick={() => setViewingDept(dept)}
                                      className={`relative rounded-xl border p-2 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer ${
                                        isHighlighted
                                          ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30"
                                          : "border-zinc-200/85 dark:border-zinc-800"
                                      }`}
                                    >
                                      {/* Đường ngang nối từ nhánh Cấp 3 vào thẻ Cấp 4 (├── / └──) */}
                                      <div className="absolute -left-[13px] top-1/2 -translate-y-1/2 w-3 h-0.5 bg-zinc-300 dark:bg-zinc-700" />
                                      <div className="absolute -left-[15px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />

                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`w-6 h-6 rounded-full border flex items-center justify-center text-[9px] font-bold shrink-0 ${getPeopleAvatarTone(
                                            empName
                                          )}`}
                                        >
                                          {getInitials(empName)}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                                            {empName}
                                          </div>
                                          <div className="text-[9.5px] text-zinc-500 dark:text-zinc-400 truncate">
                                            {emp.position}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          CHẾ ĐỘ BẢNG DANH SÁCH PHÒNG BAN (TABLE LIST VIEW)
         ===================================================================== */}
      {activeTab === "list" && (
        <div className="bento-card rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-5 py-3 font-semibold">Đơn vị / Phòng ban</th>
                  <th className="px-5 py-3 font-semibold">Trưởng đơn vị</th>
                  <th className="px-5 py-3 font-semibold">Chức năng & Nhiệm vụ</th>
                  <th className="px-5 py-3 font-semibold text-center">Định biên</th>
                  <th className="px-5 py-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-4">
                      <TableSkeleton rows={5} cols={5} />
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-zinc-500 text-xs">
                      Không tìm thấy phòng ban nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((dept) => {
                    const mgrName = dept.manager?.user?.name || "Đang bổ nhiệm";
                    return (
                      <tr
                        key={dept.id}
                        onClick={() => setViewingDept(dept)}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-[#0f4c5c] dark:text-teal-400">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {dept.name}
                              </div>
                              <div className="text-[11px] text-zinc-500 font-mono">
                                Mã: {dept.id.substring(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${getPeopleAvatarTone(
                                mgrName
                              )}`}
                            >
                              {getInitials(mgrName)}
                            </div>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                              {mgrName}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400 max-w-xs truncate text-xs">
                          {dept.description || "Không có mô tả"}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="text-xs px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                            <span className="font-mono font-bold">
                              {dept._count?.employees ?? dept.employees?.length ?? 0}
                            </span>{" "}
                            nhân sự
                          </span>
                        </td>
                        <td
                          className="px-5 py-3.5 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1 text-xs">
                            <button
                              type="button"
                              onClick={() => setViewingDept(dept)}
                              className="px-2.5 py-1 text-[#0f4c5c] dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded font-medium transition-colors"
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
                    );
                  })
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
          : [];
        const mgrName = viewingDept.manager?.user?.name || "Đang bổ nhiệm";
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
                  <div className="w-9 h-9 rounded-lg bg-[#0f4c5c]/10 dark:bg-teal-950/60 text-[#0f4c5c] dark:text-teal-400 border border-[#0f4c5c]/20 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {viewingDept.name}
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-mono">
                      Mã đơn vị: {viewingDept.id.substring(0, 8).toUpperCase()}
                    </p>
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
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                    Chức năng & Nhiệm vụ
                  </span>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {viewingDept.description ||
                      "Chưa có mô tả chức năng nhiệm vụ phòng ban."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0 ${getPeopleAvatarTone(
                        mgrName
                      )}`}
                    >
                      {getInitials(mgrName)}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                        Trưởng bộ phận
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {mgrName}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Quản lý
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      Nhân sự trực thuộc (
                      <span className="font-mono">{deptEmployees.length}</span>)
                    </span>
                  </div>

                  {deptEmployees.length === 0 ? (
                    <div className="p-6 text-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                      Chưa có nhân sự nào thuộc phòng ban này.
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
                      {deptEmployees.map((emp: any) => {
                        const empName =
                          emp.user?.name || emp.name || "Nhân viên";
                        const empEmail = emp.user?.email || emp.email || "";
                        return (
                          <div
                            key={emp.id}
                            className="p-3 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${getPeopleAvatarTone(
                                  empName
                                )}`}
                              >
                                {getInitials(empName)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                  {empName}
                                </div>
                                <div className="text-[11px] text-zinc-500 truncate">
                                  {emp.position || "Chuyên viên"}
                                </div>
                                {empEmail && (
                                  <div className="text-[10px] text-zinc-400 font-mono truncate flex items-center gap-1">
                                    <Mail className="w-2.5 h-2.5" /> {empEmail}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                              {emp.status === "RESIGNED"
                                ? "Thôi việc"
                                : "Đang làm"}
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
                  href={`/dashboard/employees?search=${encodeURIComponent(
                    viewingDept.name
                  )}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f4c5c] dark:text-teal-400 hover:underline"
                >
                  <span>Mở trong Danh bạ Nhân sự</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setViewingDept(null)}
                  className="px-4 py-1.5 rounded-lg bg-[#0f4c5c] hover:bg-[#0b3b47] text-white text-xs font-medium transition-colors"
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
