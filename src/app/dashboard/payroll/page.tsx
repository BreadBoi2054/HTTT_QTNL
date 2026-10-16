"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Banknote, 
  CheckCircle, 
  FileText, 
  Download, 
  Eye, 
  ShieldCheck, 
  Crown, 
  Briefcase, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Lock,
  Building2,
  CheckCircle2,
  Clock,
  Calculator,
  Target,
  ArrowUpDown
} from "lucide-react";
import PayrollModal from "@/components/payroll/PayrollModal";
import AutoCalculateModal from "@/components/payroll/AutoCalculateModal";
import PayslipDetailModal from "@/components/payroll/PayslipDetailModal";
import OvertimePanel from "@/components/payroll/OvertimePanel";
import CalendarPanel from "@/components/payroll/CalendarPanel";
import { useConfirm, TableSkeleton } from "@/components/providers/ToastProvider";

export default function PayrollPage() {
  const { data: session } = useSession();
  const confirm = useConfirm();
  const userRole = (session?.user as any)?.roleName || "USER";
  const userEmail = session?.user?.email || "";
  const userName = session?.user?.name || "Người dùng";

  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>("ALL");
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>("ALL");
  const [showRbacGuide, setShowRbacGuide] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: "baseSalary" | "bonus" | "deductions" | "netSalary" | null; direction: "asc" | "desc" }>({ key: null, direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // New Interactive Modals
  const [isAutoCalcOpen, setIsAutoCalcOpen] = useState(false);
  const [viewingPayroll, setViewingPayroll] = useState<any>(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);

  // Role permissions theo 6 vai trò RBAC
  const isBOD = userRole === "BOD";
  const canDisburse = userRole === "SYSTEM_ADMIN" || isBOD;
  const canManage = userRole === "SYSTEM_ADMIN" || isBOD || userRole === "HR" || userRole === "ACCOUNTANT";
  const isAccountant = userRole === "ACCOUNTANT";
  const isManager = userRole === "MANAGER";
  const isRegularUser = userRole === "USER";

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payroll");
      const data = await res.json();
      setPayrolls(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const handleDelete = async (id: string, empName: string, status: string) => {
    if (status === "PAID") {
      alert("Sổ sách kế toán đã khóa. Không thể xóa phiếu lương đã Thanh toán.");
      return;
    }
    if (!canManage) {
      alert("Bạn không có quyền xóa phiếu lương. Chỉ HR hoặc Quản trị viên mới được thao tác.");
      return;
    }
    if (!(await confirm(`Bạn có chắc chắn muốn xóa phiếu lương nháp của "${empName}"?`))) return;
    try {
      const res = await fetch(`/api/payroll/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      fetchPayrolls();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handlePay = async (id: string, empName: string) => {
    if (!canDisburse && userRole !== "HR") {
      alert("Chỉ Quản trị viên / Ban Giám Đốc mới có thẩm quyền Duyệt chi thanh toán ngân sách lương.");
      return;
    }
    if (!(await confirm(`Ghi nhận phiếu lương của "${empName}" là đã chi trả? Thao tác sẽ khóa phiếu trong hệ thống; ứng dụng không thực hiện chuyển tiền.`))) return;
    try {
      const res = await fetch(`/api/payroll/${id}`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" })
      });
      if (!res.ok) throw new Error(await res.text());
      fetchPayrolls();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const openAddModal = () => {
    if (!canManage) {
      alert("Bạn không có quyền tạo phiếu lương thủ công.");
      return;
    }
    setSelectedPayroll(null);
    setIsModalOpen(true);
  };

  const openEditModal = (payroll: any) => {
    if (payroll.status === "PAID") {
      alert("Không thể chỉnh sửa phiếu lương đã được thanh toán.");
      return;
    }
    if (!canManage) {
      alert("Bạn không có quyền chỉnh sửa phiếu lương.");
      return;
    }
    setSelectedPayroll(payroll);
    setIsModalOpen(true);
  };

  const openPayslipModal = (payroll: any) => {
    setViewingPayroll(payroll);
    setIsPayslipOpen(true);
  };

  // Filtered dataset considering User Role Privacy & UI Search
  const filteredData = useMemo(() => {
    let list = payrolls;

    // USER role privacy: Regular users only see their own payslips
    if (isRegularUser) {
      list = list.filter((p) => p.employee?.user?.email === userEmail);
    }

    // Role filter
    if (selectedRoleFilter !== "ALL") {
      list = list.filter((p) => {
        const role = p.employee?.user?.role?.name || "USER";
        return role === selectedRoleFilter;
      });
    }

    if (selectedMonthFilter !== "ALL") {
      list = list.filter((p) => String(p.month) === selectedMonthFilter);
    }

    if (selectedYearFilter !== "ALL") {
      list = list.filter((p) => String(p.year) === selectedYearFilter);
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => 
        p.employee?.user?.name?.toLowerCase().includes(q) || 
        p.employee?.user?.email?.toLowerCase().includes(q) ||
        p.employee?.department?.name?.toLowerCase().includes(q) ||
        p.employee?.position?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [payrolls, isRegularUser, userEmail, selectedRoleFilter, selectedMonthFilter, selectedYearFilter, search]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
  };

  const payrollTotals = filteredData.reduce((totals, payroll) => ({
    base: totals.base + (payroll.baseSalary || 0),
    net: totals.net + (payroll.netSalary || 0),
    bonus: totals.bonus + (payroll.bonus || 0),
    deductions: totals.deductions + (payroll.deductions || 0),
  }), { base: 0, net: 0, bonus: 0, deductions: 0 });
  const examplePayroll = filteredData[0];

  const draftPayrollsInView = useMemo(
    () => filteredData.filter((p) => p.status === "DRAFT"),
    [filteredData]
  );

  const handleBulkDisburse = async () => {
    if (!canDisburse) {
      alert("Chỉ Quản trị viên hoặc Ban Giám Đốc (BOD) mới có thẩm quyền Duyệt chi toàn bộ.");
      return;
    }
    if (draftPayrollsInView.length === 0) {
      alert("Không có phiếu lương nháp nào trong danh sách đang lọc để duyệt chi.");
      return;
    }
    if (!(await confirm(`Ghi nhận ${draftPayrollsInView.length} phiếu lương nháp đang hiển thị là đã chi trả? Thao tác sẽ khóa các phiếu trong hệ thống; ứng dụng không thực hiện chuyển tiền.`))) return;
    try {
      const res = await fetch("/api/payroll", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: draftPayrollsInView.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      alert(`Đã duyệt chi thành công ${result.count} phiếu lương!`);
      fetchPayrolls();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const key = sortConfig.key;
    return [...filteredData].sort((a, b) => {
      const valA = Number(a[key] || 0);
      const valB = Number(b[key] || 0);
      return sortConfig.direction === "asc" ? valA - valB : valB - valA;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, safeCurrentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedRoleFilter, selectedMonthFilter, selectedYearFilter, pageSize]);

  const handleSort = (key: "baseSalary" | "bonus" | "deductions" | "netSalary") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert("Không có dữ liệu phiếu lương nào để xuất.");
      return;
    }

    const headers = [
      "Mã Phiếu",
      "Mã Nhân Viên",
      "Họ và Tên",
      "Email",
      "Vai Trò (Role)",
      "Vị Trí Công Tác",
      "Phòng Ban",
      "Kỳ Lương",
      "Lương Cơ Bản (VND)",
      "Thưởng & Phụ Cấp (VND)",
      "Khấu Trừ BH (VND)",
      "Thực Lãnh Net (VND)",
      "Trạng Thái"
    ];

    const rows = filteredData.map((p) => [
      `PL-${p.year}${p.month < 10 ? '0' + p.month : p.month}-${p.id.slice(-6).toUpperCase()}`,
      `"NX-${(p.employee?.id || '').slice(-5).toUpperCase()}"`,
      `"${(p.employee?.user?.name || '').replace(/"/g, '""')}"`,
      `"${p.employee?.user?.email || ''}"`,
      `"${p.employee?.user?.role?.name || 'USER'}"`,
      `"${(p.employee?.position || 'Chuyên viên').replace(/"/g, '""')}"`,
      `"${(p.employee?.department?.name || 'N/A').replace(/"/g, '""')}"`,
      `"Tháng ${p.month}/${p.year}"`,
      Math.round(p.baseSalary || 0),
      Math.round(p.bonus || 0),
      Math.round(p.deductions || 0),
      Math.round(p.netSalary || 0),
      p.status === "PAID" ? "ĐÃ DUYỆT CHI" : "BẢN NHÁP"
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bang_Luong_Nexustech_T${new Date().getMonth() + 1}_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = async () => {
    if (filteredData.length === 0) {
      alert("Không có dữ liệu phiếu lương nào để xuất.");
      return;
    }

    try {
      const XLSX = await import("xlsx");

      const summaryRows = filteredData.map((p, idx) => ({
        "STT": idx + 1,
        "Mã Phiếu": `PL-${p.year}${p.month < 10 ? "0" + p.month : p.month}-${p.id.slice(-6).toUpperCase()}`,
        "Mã Nhân Viên": `NX-${(p.employee?.id || "").slice(-5).toUpperCase()}`,
        "Họ và Tên": p.employee?.user?.name || "",
        "Email": p.employee?.user?.email || "",
        "Phòng Ban": p.employee?.department?.name || "Chưa phân bổ",
        "Chức Danh": p.employee?.position || "Chuyên viên",
        "Vai Trò RBAC": p.employee?.user?.role?.name || "USER",
        "Kỳ Lương": `Tháng ${p.month}/${p.year}`,
        "Lương Cơ Bản (VNĐ)": Math.round(p.baseSalary || 0),
        "Thưởng & Phụ Cấp (VNĐ)": Math.round(p.bonus || 0),
        "Khấu Trừ BHXH & Thuế (VNĐ)": Math.round(p.deductions || 0),
        "Thực Lĩnh Net (VNĐ)": Math.round(p.netSalary || 0),
        "Trạng Thái": p.status === "PAID" ? "ĐÃ DUYỆT CHI" : "BẢN NHÁP",
      }));

      summaryRows.push({
        "STT": "" as any,
        "Mã Phiếu": "TỔNG CỘNG",
        "Mã Nhân Viên": "",
        "Họ và Tên": `${filteredData.length} nhân sự`,
        "Email": "",
        "Phòng Ban": "",
        "Chức Danh": "",
        "Vai Trò RBAC": "",
        "Kỳ Lương": "",
        "Lương Cơ Bản (VNĐ)": Math.round(payrollTotals.base),
        "Thưởng & Phụ Cấp (VNĐ)": Math.round(payrollTotals.bonus),
        "Khấu Trừ BHXH & Thuế (VNĐ)": Math.round(payrollTotals.deductions),
        "Thực Lĩnh Net (VNĐ)": Math.round(payrollTotals.net),
        "Trạng Thái": "",
      });

      const detailRows: Record<string, any>[] = [];
      filteredData.forEach((p) => {
        const items = Array.isArray(p.details) ? p.details : [];
        items.forEach((item: any) => {
          detailRows.push({
            "Mã Phiếu": `PL-${p.year}${p.month < 10 ? "0" + p.month : p.month}-${p.id.slice(-6).toUpperCase()}`,
            "Họ và Tên": p.employee?.user?.name || "",
            "Phòng Ban": p.employee?.department?.name || "Chưa phân bổ",
            "Kỳ Lương": `Tháng ${p.month}/${p.year}`,
            "Khoản Mục": String(item.name || "").replace(/th\?c t\?/gi, "thực tế"),
            "Phân Loại": item.type === "EARNING" ? "Thu nhập (+)" : item.type === "DEDUCTION" ? "Khấu trừ (-)" : "Chấm công",
            "Giá Trị": Math.round(Number(item.amount || 0)),
            "Đơn Vị": item.amountType === "DAYS" ? "Ngày công" : "VNĐ",
          });
        });
      });

      const wb = XLSX.utils.book_new();
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, wsSummary, "So_Cai_Bang_Luong");

      if (detailRows.length > 0) {
        const wsDetails = XLSX.utils.json_to_sheet(detailRows);
        XLSX.utils.book_append_sheet(wb, wsDetails, "Chi_Tiet_Khoan_Muc");
      }

      XLSX.writeFile(
        wb,
        `So_Luong_Ke_Toan_Nexustech_T${new Date().getMonth() + 1}_${new Date().getFullYear()}.xlsx`
      );
      alert("Đã xuất Sổ lương Excel (.xlsx) đa sheet thành công!");
    } catch (err) {
      console.error("Export Excel error:", err);
      alert("Không thể xuất file Excel. Vui lòng thử lại.");
    }
  };

  const getRoleBadge = (roleName?: string) => {
    switch (roleName) {
      case "BOD":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-900 dark:border-zinc-200">
            Ban Giám Đốc (BOD)
          </span>
        );
      case "ACCOUNTANT":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Kế toán trưởng (KT)
          </span>
        );
      case "SYSTEM_ADMIN":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Quản trị Admin (IT)
          </span>
        );
      case "MANAGER":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Trưởng phòng (Manager)
          </span>
        );
      case "HR":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            Nhân sự (HR)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Nhân viên (User)
          </span>
        );
    }
  };

  return (
    <>
      <div className="space-y-6 animate-swiss-in pb-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <div className="folio-kicker mb-3">Sổ điều hành / Thu nhập</div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Sổ lương theo kỳ
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Theo dõi phiếu nháp, các khoản thu nhập và trạng thái duyệt chi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button 
              onClick={() => setShowRbacGuide(!showRbacGuide)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition-all border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs active:scale-95"
              title="Xem quy chế phân quyền & kiểm soát nội bộ cho 6 vai trò"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
              <span>Quy chế Phân quyền & Kiểm soát (6 Vai trò)</span>
              {showRbacGuide ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
            </button>

            <button 
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-xl text-xs font-semibold transition-all border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs active:scale-95"
              title="Xuất Sổ cái bảng lương & Chi tiết khoản mục ra file Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Xuất Excel (.xlsx)</span>
            </button>

            <button 
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs active:scale-95"
              title="Xuất bảng lương ra file CSV"
            >
              <span>Xuất CSV</span>
            </button>

            {canManage && (
              <>
                <Link
                  href="/dashboard/payroll/components"
                  className="px-3.5 py-2 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs active:scale-95"
                >
                  Danh mục Phụ cấp & Khấu trừ
                </Link>
                <button 
                  onClick={() => setIsAutoCalcOpen(true)}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold transition-all border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs active:scale-95"
                >
                  <span>Tính tự động</span>
                </button>
                <button 
                  onClick={openAddModal}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
                >
                  <span>+ Tạo phiếu lương</span>
                </button>
              </>
            )}
          </div>
        </div>

        {canManage && (
          <div className="folio-panel border-l-4 border-l-amber-600 px-5 py-4 text-sm text-zinc-700 dark:text-zinc-200">
            <strong className="block font-semibold text-zinc-900 dark:text-zinc-100">Kiểm tra trước khi duyệt chi</strong>
            <span>Ngày công chuẩn lấy theo lịch làm việc tháng, đã trừ ngày nghỉ lễ; OT chỉ tính từ đơn đã duyệt. Nghỉ ốm theo chế độ BHXH được tách khỏi lương công ty. Đối chiếu bảo hiểm và thuế trước khi chốt. Chuyển phiếu sang PAID chỉ ghi nhận trạng thái trong ứng dụng, không thực hiện chuyển tiền.</span>
          </div>
        )}

        <OvertimePanel userId={session?.user?.id} roleName={userRole} onApproved={fetchPayrolls} />
        {["SYSTEM_ADMIN", "BOD", "HR"].includes(userRole) && <CalendarPanel />}

        {/* Asymmetric Financial Ledger Strip (Swiss Treasury Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Primary Net Disbursement Treasury Block */}
          <div className="lg:col-span-5 folio-panel-dark text-white p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                  Tổng thực lĩnh theo bộ lọc
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight mt-2 text-white">
                  {formatVND(payrollTotals.net)}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-800/90 border border-zinc-700 flex items-center justify-center text-blue-400 shrink-0">
                <Banknote className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-zinc-400">
                Đã ghi nhận chi trả: <strong className="text-white font-mono">{filteredData.filter((p) => p.status === "PAID").length}/{filteredData.length}</strong> phiếu
                {draftPayrollsInView.length > 0 && (
                  <span className="ml-2 text-amber-400 font-medium">
                    ({draftPayrollsInView.length} bản nháp)
                  </span>
                )}
              </div>
              {canDisburse && draftPayrollsInView.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDisburse}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Ghi nhận chi trả ({draftPayrollsInView.length})
                </button>
              )}
            </div>
          </div>

          {/* Right 3-Column Unified Ledger Breakdown */}
          <div className="lg:col-span-7 bento-card p-0 overflow-hidden flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200/80 dark:divide-zinc-800 flex-1">
              <div className="p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <span>Quỹ lương cơ bản</span>
                  <Calculator className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <div className="mt-3">
                  <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {formatVND(payrollTotals.base)}
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-500">
                    Quy đổi theo ngày công chuẩn từng tháng
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <span>Thưởng & Phụ cấp (+)</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mt-3">
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                    +{formatVND(payrollTotals.bonus)}
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-500">
                    Thưởng KPI & phụ cấp chức vụ
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <span>Khấu trừ & BHXH (-)</span>
                  <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="mt-3">
                  <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 tracking-tight">
                    -{formatVND(payrollTotals.deductions)}
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-500">
                    Bảo hiểm, thuế và các khoản khác
                  </div>
                </div>
              </div>
            </div>

            {/* Settlement Progress Footer */}
            <div className="px-5 py-3 bg-zinc-50/80 dark:bg-zinc-900/60 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Tiến độ khóa sổ kỳ lọc</span>
              </div>
              <div className="flex items-center gap-3 w-48 sm:w-64">
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${filteredData.length > 0 ? Math.round((filteredData.filter((p) => p.status === "PAID").length / filteredData.length) * 100) : 0}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 shrink-0">
                  {filteredData.length > 0 ? Math.round((filteredData.filter((p) => p.status === "PAID").length / filteredData.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* DISTILLED COLLAPSIBLE RBAC & ROLE AUTHORIZATION GUIDE */}
        {showRbacGuide && (
          <div className="space-y-4 animate-in fade-in">
        {/* ACTIVE ROLE AUTHORIZATION BANNER */}
        <div className="bento-card p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 group">
          <div className="flex items-start sm:items-center gap-4">
            <div className={`squircle w-11 h-11 shrink-0 font-mono font-bold text-xs flex items-center justify-center ${
              isBOD ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-900 dark:border-zinc-200" :
              isAccountant ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800" :
              userRole === "HR" ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700" :
              isManager ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800" :
              userRole === "SYSTEM_ADMIN" ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800" :
              "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800"
            }`}>
              {isBOD ? "BOD" :
               isAccountant ? "KT" :
               userRole === "HR" ? "HR" :
               isManager ? "TP" :
               userRole === "SYSTEM_ADMIN" ? "IT" :
               "NV"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Vai trò đang xác thực:
                </span>
                {getRoleBadge(userRole)}
              </div>
              <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {isBOD && (
                  <span>
                    <strong>Ban Giám Đốc (BOD / CEO):</strong> Thẩm quyền cao nhất phê duyệt chi thanh toán (PAID), kiểm soát công cấp Trưởng phòng, quyết định chính sách lương thưởng toàn tập đoàn.
                  </span>
                )}
                {isAccountant && (
                  <span>
                    <strong>Kế toán trưởng & Khối Tài chính:</strong> Thẩm định đối soát quỹ lương, thuế TNCN lũy tiến, kiểm toán trích nộp BHXH 10.5% trước khi chuyển BOD duyệt chi.
                  </span>
                )}
                {userRole === "SYSTEM_ADMIN" && (
                  <span>
                    <strong>Quản trị Kỹ thuật (IT SysAdmin):</strong> Quản lý bảo mật, phân quyền tài khoản, cấu hình tham số hệ thống và audit trail.
                  </span>
                )}
                {userRole === "HR" && (
                  <span>
                    <strong>Chuyên viên Nhân sự & C&B:</strong> Soạn thảo bảng lương, tính công - bảo hiểm tự động, điều chỉnh phụ cấp/thưởng và gửi trình đối soát tài chính.
                  </span>
                )}
                {isManager && (
                  <span>
                    <strong>Trưởng phòng ban (Manager):</strong> Đối soát danh sách, kiểm tra ngày công thực tế và đánh giá KPI nhân sự cấp dưới trực tiếp (không tự kiểm soát chính mình).
                  </span>
                )}
                {isRegularUser && (
                  <span>
                    <strong>Cán bộ nhân viên (User):</strong> Chế độ bảo mật thu nhập. Bạn chỉ được xem và in chi tiết phiếu lương của chính mình.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 text-xs pt-3 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
            <span className="text-zinc-500">Đăng nhập bởi:</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{userName}</span>
            <span className="text-zinc-400 font-mono">({userEmail})</span>
          </div>
        </div>

        {/* EXPANDABLE 6-ROLE RBAC SPECIFICATION MATRIX */}
        {showRbacGuide && (
          <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Ma Trận Phân Định Trách Nhiệm Tiền Lương Theo 6 Vai Trò (Payroll RBAC Matrix)
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Phân tách nhiệm vụ (Segregation of Duties - SoD) theo chuẩn kiểm soát nội bộ và kiểm toán doanh nghiệp
                </p>
              </div>
              <button 
                onClick={() => setShowRbacGuide(false)}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-medium"
              >
                Thu gọn
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              {/* Role 1: BOD */}
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-700 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                    BOD
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">HĐQT & Ban Giám Đốc</span>
                </div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Tổng Giám Đốc (CEO)</h4>
                <ul className="text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc list-inside text-[11px]">
                  <li><strong>Phê duyệt chi (PAID):</strong> Quyết định giải ngân quỹ lương toàn doanh nghiệp.</li>
                  <li><strong>Kiểm soát công Trưởng phòng:</strong> Trực tiếp phê duyệt công/phép của các Trưởng phòng.</li>
                  <li>Xem 100% bảng lương cán bộ toàn tập đoàn.</li>
                </ul>
              </div>

              {/* Role 2: ACCOUNTANT */}
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-200 dark:border-emerald-900/60 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    KT
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">Tài Chính - Kế Toán</span>
                </div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Kế toán trưởng (Chief Accountant)</h4>
                <ul className="text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc list-inside text-[11px]">
                  <li><strong>Đối soát tài chính:</strong> Kiểm tra quỹ lương, thuế TNCN và trích nộp BHXH 10.5%.</li>
                  <li>Thẩm định số liệu bảng lương trước khi trình BOD duyệt chi.</li>
                  <li>Xuất file UNC và danh sách chi trả gửi ngân hàng.</li>
                </ul>
              </div>

              {/* Role 3: HR */}
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                    HR
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">Nhân Sự & Đãi Ngộ</span>
                </div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Chuyên viên C&B / Trưởng phòng HR</h4>
                <ul className="text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc list-inside text-[11px]">
                  <li><strong>Tính lương tự động:</strong> Tổng hợp chấm công, phép và OT đã duyệt theo lịch từng tháng.</li>
                  <li>Khởi tạo phiếu lương mới, điều chỉnh phụ cấp và thưởng định kỳ.</li>
                  <li>Kiểm soát phép năm và các chế độ bảo hiểm theo luật lao động.</li>
                </ul>
              </div>

              {/* Role 4: MANAGER */}
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-amber-200 dark:border-amber-900/60 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    TP
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">Trưởng Phòng Ban</span>
                </div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Trưởng Đơn Vị Chuyên Môn</h4>
                <ul className="text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc list-inside text-[11px]">
                  <li><strong>Kiểm soát công nhân viên cấp dưới:</strong> Xác nhận ngày công thực tế phòng mình.</li>
                  <li><strong>Không tự kiểm soát chính mình:</strong> Ngày công của Trưởng phòng do BOD/HR kiểm tra.</li>
                  <li>Xem bảng lương nhân sự thuộc phạm vi quản lý của phòng ban.</li>
                </ul>
              </div>

              {/* Role 5: SYSTEM_ADMIN */}
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-rose-200 dark:border-rose-900/60 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                    IT
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">Quản Trị Hệ Thống</span>
                </div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">IT SysAdmin & Security</h4>
                <ul className="text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc list-inside text-[11px]">
                  <li>Quản lý hạ tầng, tài khoản truy cập và vai trò hệ thống.</li>
                  <li>Giám sát nhật ký kiểm toán (Audit Trail) chống gian lận.</li>
                  <li>Tách biệt hoàn toàn khỏi quyền duyệt chi ngân sách tiền tệ.</li>
                </ul>
              </div>

              {/* Role 6: USER */}
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
                    NV
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">Toàn Thể Nhân Sự</span>
                </div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Cán Bộ & Nhân Viên (ESS)</h4>
                <ul className="text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc list-inside text-[11px]">
                  <li><strong>Bảo mật thông tin:</strong> Chỉ xem phiếu lương cá nhân của chính mình.</li>
                  <li>Tra cứu chi tiết ngày công, phụ cấp, thưởng KPI và trích nộp bảo hiểm.</li>
                  <li>In phiếu lương chuẩn mẫu A4 hoặc phản hồi giải trình ngày công.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
          </div>
        )}

        <div className="space-y-5">
        {/* Table Container */}
        <div className="bento-card rounded-2xl overflow-hidden shadow-xs flex flex-col">
          {/* Table Toolbar */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50/60 dark:bg-zinc-900/40">
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative w-full sm:w-80 lg:w-96">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all shadow-2xs"
                  placeholder="Tìm theo tên nhân viên, email, phòng ban..."
                />
              </div>

              {!isRegularUser && (
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-zinc-500 hidden sm:inline">Lọc vai trò:</label>
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 outline-none shadow-2xs"
                  >
                    <option value="ALL">Tất cả vai trò</option>
                    <option value="BOD">Ban Giám Đốc (BOD)</option>
                    <option value="ACCOUNTANT">Kế toán trưởng (KT)</option>
                    <option value="HR">Nhân sự (HR)</option>
                    <option value="MANAGER">Trưởng phòng (Manager)</option>
                    <option value="SYSTEM_ADMIN">Quản trị Admin (IT)</option>
                    <option value="USER">Nhân viên (User)</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <select
                  value={selectedMonthFilter}
                  onChange={(e) => setSelectedMonthFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 outline-none shadow-2xs"
                >
                  <option value="ALL">Tất cả tháng</option>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <option key={m} value={String(m)}>Tháng {m}</option>
                  ))}
                </select>
                <select
                  value={selectedYearFilter}
                  onChange={(e) => setSelectedYearFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 outline-none shadow-2xs"
                >
                  <option value="ALL">Tất cả năm</option>
                  <option value="2026">Năm 2026</option>
                  <option value="2025">Năm 2025</option>
                  <option value="2024">Năm 2024</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-zinc-500 w-full sm:w-auto text-right">
              {isRegularUser ? (
                <span>Phiếu lương cá nhân: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{filteredData.length}</strong> kỳ</span>
              ) : (
                <span>Tổng số: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{filteredData.length}</strong> phiếu lương</span>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="min-w-[1120px] w-full table-auto text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-medium text-xs border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3">Cán bộ nhân sự</th>
                  <th className="px-3.5 py-3">Vai trò & Vị trí</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Kỳ lương</th>
                  <th className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort("baseSalary")}
                      className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      <span>Lương cơ bản</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort("bonus")}
                      className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      <span>Thưởng</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort("deductions")}
                      className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      <span>Khấu trừ</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right font-mono">
                    <button
                      type="button"
                      onClick={() => handleSort("netSalary")}
                      className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      <span>Thực lĩnh (Net)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-3.5 py-3 text-center whitespace-nowrap">Trạng thái</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-4">
                      <TableSkeleton rows={6} cols={9} />
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-zinc-500 text-xs">
                      {isRegularUser ? (
                        <div className="space-y-1">
                          <p className="font-medium text-zinc-700 dark:text-zinc-300">Chưa có phiếu lương cá nhân nào cho tài khoản của bạn.</p>
                          <p className="text-zinc-400">Phòng Nhân sự sẽ thông báo khi kỳ lương tháng mới nhất được tính toán và duyệt chi.</p>
                        </div>
                      ) : (
                        <span>Không tìm thấy phiếu lương nào phù hợp với bộ lọc.</span>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((payroll) => {
                    const empRole = payroll.employee?.user?.role?.name || "USER";
                    return (
                      <tr key={payroll.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                            {payroll.employee?.user?.name}
                          </div>
                          <div className="text-xs text-zinc-500 font-mono">
                            {payroll.employee?.user?.email} · NV-{(payroll.employee?.id || "").slice(-5).toUpperCase()}
                          </div>
                        </td>

                        <td className="px-3.5 py-3 min-w-[220px] max-w-[260px]">
                          <div className="space-y-1">
                            <div>{getRoleBadge(empRole)}</div>
                            <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                              {payroll.employee?.position || "Chuyên viên"} · {payroll.employee?.department?.name || "Công ty"}
                            </div>
                          </div>
                        </td>

                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <div className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                            Tháng {payroll.month < 10 ? `0${payroll.month}` : payroll.month}/{payroll.year}
                          </div>
                          <div className="text-[10px] text-zinc-400">Công chuẩn theo lịch tháng</div>
                        </td>

                        <td className="px-3.5 py-3 text-right font-mono text-xs text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {formatVND(payroll.baseSalary)}
                        </td>

                        <td className="px-3.5 py-3 text-right font-mono text-xs text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          +{formatVND(payroll.bonus)}
                        </td>

                        <td className="px-3.5 py-3 text-right font-mono text-xs text-rose-600 dark:text-rose-400 whitespace-nowrap">
                          -{formatVND(payroll.deductions)}
                        </td>

                        <td className="px-3.5 py-3 text-right font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                          {formatVND(payroll.netSalary)}
                        </td>

                        <td className="px-3.5 py-3 text-center whitespace-nowrap">
                          {payroll.status === "DRAFT" ? (
                            <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 font-medium">
                              Bản nháp
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 font-medium">
                              Đã ghi nhận chi trả
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right text-xs whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openPayslipModal(payroll)}
                              className="px-2.5 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md font-medium transition-colors"
                              title="Xem chi tiết phiếu lương và in ấn"
                            >
                              Xem phiếu
                            </button>
                            
                            {payroll.status === "DRAFT" ? (
                              <>
                                {canDisburse && (
                                  <button 
                                    onClick={() => handlePay(payroll.id, payroll.employee?.user?.name)} 
                                    className="px-2.5 py-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-md font-medium transition-colors" 
                                    title="Ghi nhận đã chi trả và khóa phiếu trong ứng dụng"
                                  >
                                    Ghi nhận chi trả
                                  </button>
                                )}

                                {canManage && (
                                  <>
                                    <button 
                                      onClick={() => openEditModal(payroll)} 
                                      className="px-2.5 py-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md font-medium transition-colors" 
                                      title="Chỉnh sửa phiếu lương"
                                    >
                                      Sửa
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(payroll.id, payroll.employee?.user?.name, payroll.status)} 
                                      className="px-2.5 py-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md font-medium transition-colors" 
                                      title="Xóa phiếu lương nháp"
                                    >
                                      Xóa
                                    </button>
                                  </>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-zinc-400 italic px-2">Đã chốt sổ</span>
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

          {/* Client-side Pagination Bar */}
          {!loading && sortedData.length > 0 && (
            <div className="px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <span>Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 font-mono outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={500}>Tất cả</option>
                </select>
                <span>dòng / trang · Trang <strong className="font-mono text-zinc-800 dark:text-zinc-200">{safeCurrentPage}</strong> / <strong className="font-mono text-zinc-800 dark:text-zinc-200">{totalPages}</strong></span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          <section className="bento-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="squircle w-9 h-9 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center"><Calculator className="w-4 h-4" /></div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Kết quả kỳ đang lọc</h2>
                <p className="text-[11px] text-zinc-500">{filteredData.length} phiếu lương</p>
              </div>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 p-3">
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300">Tổng thực lĩnh</div>
              <div className="mt-1 text-lg font-extrabold font-mono text-emerald-700 dark:text-emerald-300">{formatVND(payrollTotals.net)}</div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between gap-2"><span className="text-zinc-500">Tổng thưởng / phụ cấp</span><strong className="text-zinc-800 dark:text-zinc-200">{formatVND(payrollTotals.bonus)}</strong></div>
              <div className="flex justify-between gap-2"><span className="text-zinc-500">Tổng khấu trừ</span><strong className="text-rose-600 dark:text-rose-400">{formatVND(payrollTotals.deductions)}</strong></div>
            </div>
            {examplePayroll && <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2 text-xs">
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">Ví dụ: {examplePayroll.employee?.user?.name || "Nhân viên"}</div>
              <div className="text-zinc-500">Lương cơ bản theo công: <strong className="text-zinc-700 dark:text-zinc-300">{formatVND(examplePayroll.baseSalary)}</strong></div>
              <div className="text-zinc-500">+ Thưởng / phụ cấp: <strong className="text-emerald-600">{formatVND(examplePayroll.bonus)}</strong></div>
              <div className="text-zinc-500">− Khấu trừ: <strong className="text-rose-600">{formatVND(examplePayroll.deductions)}</strong></div>
              <div className="text-zinc-500">= Thực lĩnh: <strong className="text-zinc-900 dark:text-zinc-100">{formatVND(examplePayroll.netSalary)}</strong></div>
            </div>}
          </section>

          <section className="bento-card p-5 space-y-3">
            <div className="flex items-center gap-2"><Target className="w-4 h-4 text-zinc-500 dark:text-zinc-400" /><h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Cách tính KPI</h2></div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">Điểm tổng = Công việc chính × 50% + Kỷ luật & văn hóa × 25% + Đổi mới & phát triển × 25%.</p>
            <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900/60 p-3 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">Ví dụ: 90×0,5 + 80×0,25 + 88×0,25 = <strong className="text-blue-600">87 điểm</strong></div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span>≥ 90 · Hạng A</span><strong className="text-emerald-600">Thưởng 25%</strong></div>
              <div className="flex justify-between"><span>75–89,9 · Hạng B</span><strong className="text-blue-600">Thưởng 10%</strong></div>
              <div className="flex justify-between"><span>60–74,9 · Hạng C</span><strong className="text-amber-600">0%</strong></div>
              <div className="flex justify-between"><span>&lt; 60 · Hạng D</span><strong className="text-rose-600">Khấu trừ 10%</strong></div>
            </div>
            <p className="border-t border-zinc-100 dark:border-zinc-800 pt-3 text-[11px] leading-relaxed text-zinc-500">Thưởng/phạt KPI được tính trên lương cơ bản đã quy đổi theo ngày công và chỉ liên thông khi đánh giá được phê duyệt.</p>
          </section>

          <section className="rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/20 p-4 text-[11px] leading-relaxed text-blue-800 dark:text-blue-200">
            <strong>Công thức tự động hiện tại:</strong> lương cơ bản × ngày công hưởng lương ÷ công chuẩn tháng (đã trừ lễ), cộng OT đã duyệt và thưởng/phụ cấp, trừ bảo hiểm, thuế và các khoản khác. Phép năm đã duyệt được hưởng lương; nghỉ ốm theo BHXH được tách khỏi lương công ty. Cần đối chiếu chính sách của kỳ trước khi ghi nhận chi trả.
          </section>
        </aside>
        </div>
      </div>

      {/* Modals */}
      <PayrollModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchPayrolls} 
        payroll={selectedPayroll} 
      />

      <AutoCalculateModal 
        isOpen={isAutoCalcOpen} 
        onClose={() => setIsAutoCalcOpen(false)} 
        onSuccess={fetchPayrolls} 
      />

      <PayslipDetailModal 
        isOpen={isPayslipOpen} 
        onClose={() => setIsPayslipOpen(false)} 
        payroll={viewingPayroll} 
      />
    </>
  );
}
