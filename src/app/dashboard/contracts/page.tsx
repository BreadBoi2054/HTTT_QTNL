"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { 
  FileText, 
  Search, 
  Plus, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Building2, 
  User, 
  Printer, 
  Eye,
  Calendar,
  Send,
  ArrowRight,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

type ContractSortKey = "code" | "employeeName" | "startDate" | "salary";
type SortOrder = "asc" | "desc";
import ContractDetailModal from "@/components/contracts/ContractDetailModal";
import CreateContractModal from "@/components/contracts/CreateContractModal";
import { useConfirm, CardGridSkeleton, TableSkeleton } from "@/components/providers/ToastProvider";

interface ContractItem {
  id: string;
  code: string;
  employeeName: string;
  employeeCode: string;
  employeeEmail?: string;
  department: string;
  position: string;
  type: string;
  startDate: string;
  endDate: string;
  salary: number;
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "TERMINATED";
  daysLeft?: number;
}

const initialContracts: ContractItem[] = [
  {
    id: "ct_001",
    code: "HĐLĐ-2026/NX-0001",
    employeeName: "Trần Văn An",
    employeeCode: "NX-0001",
    employeeEmail: "an.tv@nexustech.vn",
    department: "Phòng Công nghệ (IT)",
    position: "Senior Frontend Lead & Tech Lead",
    type: "Hợp đồng Không xác định thời hạn",
    startDate: "15/01/2026",
    endDate: "Không xác định",
    salary: 28000000,
    status: "ACTIVE"
  },
  {
    id: "ct_002",
    code: "HĐLĐ-2026/NX-0002",
    employeeName: "Lê Thị Bích",
    employeeCode: "NX-0002",
    employeeEmail: "bich.lt@nexustech.vn",
    department: "Phòng Kinh doanh (Sales)",
    position: "Trưởng Nhóm Khách Hàng Doanh Nghiệp",
    type: "Hợp đồng Không xác định thời hạn",
    startDate: "01/03/2026",
    endDate: "Không xác định",
    salary: 24000000,
    status: "ACTIVE"
  },
  {
    id: "ct_003",
    code: "HĐLĐ-2025/NX-0003",
    employeeName: "Bùi Quốc Khánh",
    employeeCode: "NX-0003",
    employeeEmail: "khanh.bq@nexustech.vn",
    department: "Phòng Kinh doanh (Sales)",
    position: "Chuyên Viên Phát Triển Thị Trường",
    type: "Hợp đồng Xác định thời hạn 12 tháng",
    startDate: "25/10/2025",
    endDate: "25/10/2026",
    salary: 18000000,
    status: "EXPIRING_SOON",
    daysLeft: 11
  },
  {
    id: "ct_004",
    code: "HĐLĐ-2025/NX-0004",
    employeeName: "Vũ Hải Đăng",
    employeeCode: "NX-0004",
    employeeEmail: "dang.vh@nexustech.vn",
    department: "Phòng Công nghệ (IT)",
    position: "Kỹ Sư DevOps & Cloud Security",
    type: "Hợp đồng Xác định thời hạn 12 tháng",
    startDate: "01/11/2025",
    endDate: "01/11/2026",
    salary: 26000000,
    status: "EXPIRING_SOON",
    daysLeft: 18
  },
  {
    id: "ct_005",
    code: "HĐLĐ-2026/NX-0005",
    employeeName: "Trịnh Bá Phúc",
    employeeCode: "NX-0005",
    employeeEmail: "phuc.tb@nexustech.vn",
    department: "Phòng Công nghệ (IT)",
    position: "Kỹ Sư Backend Node.js",
    type: "Hợp đồng Thử việc (02 tháng)",
    startDate: "01/09/2026",
    endDate: "31/10/2026",
    salary: 18500000,
    status: "EXPIRING_SOON",
    daysLeft: 17
  }
];

export default function ContractsPage() {
  const { data: session } = useSession();
  const confirm = useConfirm();
  const userRole = (session?.user as any)?.roleName || "USER";
  const canManageContracts = ["SYSTEM_ADMIN", "BOD", "HR"].includes(userRole);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [showAllExpiring, setShowAllExpiring] = useState(false);

  // Modals state
  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sortKey, setSortKey] = useState<ContractSortKey>("code");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDept, selectedStatus, pageSize]);

  const handleSort = (key: ContractSortKey) => {
    if (sortKey === key) setSortOrder(p => (p === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortOrder("asc"); }
  };

  const parseVNDate = (dStr: string): number => {
    if (!dStr) return 0;
    const parts = dStr.split("/");
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`).getTime() || 0;
    }
    return new Date(dStr).getTime() || 0;
  };

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contracts");
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped: ContractItem[] = data.map((c: any) => ({
          id: c.id,
          code: c.code,
          employeeName: c.employee?.user?.name || "Cán bộ nhân viên",
          employeeCode: `NX-${c.employee?.id?.slice(-5).toUpperCase() || "00000"}`,
          employeeEmail: c.employee?.user?.email,
          department: c.employee?.department?.name || "Văn phòng Tập đoàn",
          position: c.employee?.position || "Chuyên viên",
          type: c.contractType,
          startDate: new Date(c.startDate).toLocaleDateString("vi-VN"),
          endDate: c.endDate ? new Date(c.endDate).toLocaleDateString("vi-VN") : "Không xác định",
          salary: c.salary,
          status: c.status,
          daysLeft: c.daysLeft
        }));
        setContracts(mapped);
      }
    } catch (err) {
      console.error("Lỗi nạp hợp đồng nhân sự:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleContractCreated = () => {
    fetchContracts();
  };

  const handleTerminateContract = async (contract: ContractItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!(await confirm(`Xác nhận chấm dứt hợp đồng "${contract.code}" của nhân sự ${contract.employeeName}?`))) return;
    try {
      const res = await fetch(`/api/contracts/${contract.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "TERMINATED" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Không thể chấm dứt hợp đồng.");
        return;
      }
      fetchContracts();
    } catch (err: any) {
      alert(err?.message || "Lỗi kết nối khi chấm dứt hợp đồng.");
    }
  };

  const uniqueDepartments = Array.from(new Set(contracts.map(c => c.department).filter(Boolean)));

  const filteredData = useMemo(() => {
    const list = contracts.filter(c => {
      const matchSearch = c.employeeName.toLowerCase().includes(search.toLowerCase()) ||
                          c.code.toLowerCase().includes(search.toLowerCase()) ||
                          c.employeeCode.toLowerCase().includes(search.toLowerCase());
      const matchDept = selectedDept === "ALL" || c.department === selectedDept;
      const matchStatus = selectedStatus === "ALL" || c.status === selectedStatus;
      return matchSearch && matchDept && matchStatus;
    });

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "code") cmp = a.code.localeCompare(b.code, "vi");
      else if (sortKey === "employeeName") cmp = a.employeeName.localeCompare(b.employeeName, "vi");
      else if (sortKey === "startDate") cmp = parseVNDate(a.startDate) - parseVNDate(b.startDate);
      else if (sortKey === "salary") cmp = (a.salary || 0) - (b.salary || 0);
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [contracts, search, selectedDept, selectedStatus, sortKey, sortOrder]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIndex = Math.min(safePage * pageSize, totalItems);
  const paginatedData = filteredData.slice((safePage - 1) * pageSize, safePage * pageSize);

  const expiringList = contracts.filter(c => c.status === "EXPIRING_SOON");
  const visibleExpiringList = showAllExpiring ? expiringList : expiringList.slice(0, 3);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
  };

  const handleExportCSV = () => {
    const headers = [
      "Mã Hợp Đồng",
      "Mã Cán Bộ",
      "Họ Và Tên",
      "Đơn Vị / Phòng Ban",
      "Vị Trí Công Tác",
      "Loại Hợp Đồng",
      "Ngày Hiệu Lực",
      "Ngày Hết Hạn",
      "Mức Lương (VND)",
      "Trạng Thái"
    ];

    const rows = filteredData.map(c => [
      `"${c.code}"`,
      `"${c.employeeCode}"`,
      `"${c.employeeName.replace(/"/g, '""')}"`,
      `"${c.department.replace(/"/g, '""')}"`,
      `"${c.position.replace(/"/g, '""')}"`,
      `"${c.type}"`,
      `"${c.startDate}"`,
      `"${c.endDate}"`,
      c.salary,
      `"${c.status === 'EXPIRING_SOON' ? 'SẮP HẾT HẠN' : c.status === 'EXPIRED' ? 'ĐÃ HẾT HẠN' : c.status === 'TERMINATED' ? 'ĐÃ CHẤM DỨT' : 'CÒN HIỆU LỰC'}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `So_Theo_Doi_HDLD_Nexustech_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        <CardGridSkeleton count={4} />
        <div className="bento-card p-5">
          <TableSkeleton rows={6} cols={7} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-swiss-in pb-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Quản Trị Hợp Đồng Lao Động
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Quản lý danh sách hợp đồng, theo dõi thời hạn và cảnh báo tự động trước 30 ngày
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs active:scale-95"
              title="Xuất danh sách ra CSV"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Xuất CSV</span>
            </button>
            {canManageContracts && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo hợp đồng</span>
              </button>
            )}
          </div>
        </div>

        {/* Compliance Alert Banner */}
        {expiringList.length > 0 && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                    Cảnh báo: Có {expiringList.length} hợp đồng lao động sẽ hết hạn trong 30 ngày tới
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    Bộ phận nhân sự cần gửi thông báo bằng văn bản để tiến hành tái ký hoặc thanh lý hợp đồng kịp thời.
                  </p>
                </div>
              </div>
              {expiringList.length > 3 && (
                <button type="button" onClick={() => setShowAllExpiring(value => !value)} aria-expanded={showAllExpiring} className="shrink-0 text-xs font-semibold text-amber-800 dark:text-amber-200 hover:underline">
                  {showAllExpiring ? "Thu gọn" : `Xem tất cả ${expiringList.length}`}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {visibleExpiringList.map(c => (
                <div key={c.id} className="p-3 bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-center justify-between text-xs shadow-xs">
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">{c.employeeName}</div>
                    <div className="text-[11px] text-zinc-500">Hết hạn: {c.endDate} (Còn {c.daysLeft} ngày)</div>
                  </div>
                  <button 
                    onClick={() => setSelectedContract(c)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stat Bento Tiles (Swiss Monochromatic) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bento-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Tổng số hợp đồng</span>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight mt-1">{contracts.length}</div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 flex items-center justify-center border border-zinc-200/60 dark:border-zinc-700/60">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-[11px] text-zinc-500 mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800">Đang lưu trữ pháp lý</div>
          </div>

          <div className="bento-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Vô thời hạn (Dài hạn)</span>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight mt-1">
                  {contracts.filter(c => c.type.includes("Không xác định")).length}
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 flex items-center justify-center border border-zinc-200/60 dark:border-zinc-700/60">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-[11px] text-zinc-500 mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800">Nhân sự gắn bó cốt lõi</div>
          </div>

          <div className="bento-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Có thời hạn (1–3 năm)</span>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight mt-1">
                  {contracts.filter(c => c.type.includes("Xác định thời hạn")).length}
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 flex items-center justify-center border border-zinc-200/60 dark:border-zinc-700/60">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-[11px] text-zinc-500 mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800">Hợp đồng có kỳ hạn</div>
          </div>

          <div className="bento-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Cần tái ký (≤ 30 ngày)</span>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight mt-1">
                  {expiringList.length}
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 flex items-center justify-center border border-zinc-200/60 dark:border-zinc-700/60">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 font-semibold">Ưu tiên xử lý tuần này</div>
          </div>
        </div>

        {/* Filter and Table */}
        <div className="bento-card rounded-2xl overflow-hidden flex flex-col shadow-xs">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-zinc-50/60 dark:bg-zinc-900/40">
            <div className="relative w-full max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo số HĐ, tên cán bộ hoặc mã NX..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none shadow-2xs"
              >
                <option value="ALL">Tất cả phòng ban</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none shadow-2xs"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Còn hiệu lực</option>
                <option value="EXPIRING_SOON">Sắp hết hạn (≤ 30 ngày)</option>
                <option value="EXPIRED">Đã hết hạn</option>
                <option value="TERMINATED">Đã chấm dứt</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                  <th onClick={() => handleSort("code")} className="px-5 py-3 font-semibold cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none">
                    <span className="inline-flex items-center gap-1.5">Mã HĐ <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" /></span>
                  </th>
                  <th onClick={() => handleSort("employeeName")} className="px-5 py-3 font-semibold cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none">
                    <span className="inline-flex items-center gap-1.5">Nhân sự <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" /></span>
                  </th>
                  <th className="px-5 py-3 font-semibold">Loại hợp đồng</th>
                  <th onClick={() => handleSort("startDate")} className="px-5 py-3 font-semibold cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none">
                    <span className="inline-flex items-center gap-1.5">Ngày hiệu lực <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" /></span>
                  </th>
                  <th onClick={() => handleSort("salary")} className="px-5 py-3 font-semibold text-right cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none">
                    <span className="inline-flex items-center justify-end gap-1.5">Mức lương <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" /></span>
                  </th>
                  <th className="px-5 py-3 font-semibold text-center">Trạng thái</th>
                  <th className="px-5 py-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-zinc-500 text-xs">
                      Không có hợp đồng lao động nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((contract) => (
                    <tr 
                      key={contract.id}
                      onClick={() => setSelectedContract(contract)}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {contract.code}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">{contract.employeeName}</div>
                        <div className="text-[11px] text-zinc-400">{contract.position} • {contract.department}</div>
                      </td>

                      <td className="px-5 py-3.5 text-zinc-700 dark:text-zinc-300">
                        {contract.type}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                        {contract.startDate} → {contract.endDate}
                      </td>

                      <td className="px-5 py-3.5 text-right font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {formatVND(contract.salary)}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        {contract.status === "EXPIRING_SOON" ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold">
                            <Clock className="w-3 h-3" /> CÒN {contract.daysLeft} NGÀY
                          </span>
                        ) : contract.status === "EXPIRED" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 font-medium">
                            <AlertTriangle className="w-3 h-3" /> Đã hết hạn
                          </span>
                        ) : contract.status === "TERMINATED" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 font-medium">
                            Đã chấm dứt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Có hiệu lực
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right text-xs">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedContract(contract);
                            }}
                            className="px-2.5 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg font-medium inline-flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Xem HĐ
                          </button>
                          {canManageContracts && (contract.status === "ACTIVE" || contract.status === "EXPIRING_SOON") && (
                            <button
                              onClick={(e) => handleTerminateContract(contract, e)}
                              className="px-2.5 py-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg font-medium transition-colors"
                              title="Chấm dứt hợp đồng lao động"
                            >
                              Chấm dứt HĐ
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3.5 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
              <span>Hiển thị <strong className="font-mono text-zinc-900 dark:text-zinc-100">{startIndex}–{endIndex}</strong> trên tổng <strong className="font-mono text-zinc-900 dark:text-zinc-100">{totalItems}</strong> hợp đồng</span>
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

      {/* Modals */}
      <ContractDetailModal
        isOpen={Boolean(selectedContract)}
        onClose={() => setSelectedContract(null)}
        contract={selectedContract}
      />

      <CreateContractModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleContractCreated}
      />
    </>
  );
}
