"use client";

import { useState, useEffect, useMemo } from "react";
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
  Clock
} from "lucide-react";
import PayrollModal from "@/components/payroll/PayrollModal";
import AutoCalculateModal from "@/components/payroll/AutoCalculateModal";
import PayslipDetailModal from "@/components/payroll/PayslipDetailModal";

export default function PayrollPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.roleName || "USER";
  const userEmail = session?.user?.email || "";
  const userName = session?.user?.name || "Người dùng";

  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");
  const [showRbacMatrix, setShowRbacMatrix] = useState(false);

  // New Interactive Modals
  const [isAutoCalcOpen, setIsAutoCalcOpen] = useState(false);
  const [viewingPayroll, setViewingPayroll] = useState<any>(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);

  // Role permissions
  const canDisburse = userRole === "SYSTEM_ADMIN";
  const canManage = userRole === "SYSTEM_ADMIN" || userRole === "HR";
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
    if (!confirm(`Bạn có chắc chắn muốn xóa phiếu lương nháp của "${empName}"?`)) return;
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
    if (!confirm(`Bạn xác nhận Duyệt chi Thanh toán lương cho "${empName}"? Thao tác này sẽ chính thức khóa phiếu lương và ghi nhận vào ngân sách.`)) return;
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
  }, [payrolls, isRegularUser, userEmail, selectedRoleFilter, search]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
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

  const getRoleBadge = (roleName?: string) => {
    switch (roleName) {
      case "SYSTEM_ADMIN":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Crown className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Lãnh đạo (Admin)
          </span>
        );
      case "MANAGER":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Trưởng phòng (Manager)
          </span>
        );
      case "HR":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Briefcase className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            Nhân sự (HR)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            <Users className="w-3 h-3 text-zinc-500" />
            Nhân viên (User)
          </span>
        );
    }
  };

  return (
    <>
      <div className="space-y-6 animate-swiss-in pb-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                <Banknote className="w-3.5 h-3.5" />
                Phân hệ Tiền lương & Đãi ngộ (C&B)
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
              Bảng Tính Lương & Quyết Toán Thu Nhập
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Tính toán 22 công chuẩn, khấu trừ bảo hiểm bắt buộc 10.5% và phân cấp trách nhiệm theo vai trò
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button 
              onClick={() => setShowRbacMatrix(!showRbacMatrix)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition-all border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs active:scale-95"
              title="Xem ma trận phân quyền tiền lương cho 4 vai trò"
            >
              <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Phân quyền 4 vai trò</span>
              {showRbacMatrix ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs active:scale-95"
              title="Xuất bảng lương ra file CSV"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Xuất CSV</span>
            </button>

            {canManage && (
              <>
                <button 
                  onClick={() => setIsAutoCalcOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold transition-all border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs active:scale-95"
                >
                  <Banknote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Tính tự động</span>
                </button>
                <button 
                  onClick={openAddModal}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo phiếu lương</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ACTIVE ROLE AUTHORIZATION BANNER */}
        <div className="bento-card p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 group">
          <div className="flex items-start sm:items-center gap-4">
            <div className={`squircle w-11 h-11 shrink-0 ${
              canDisburse ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800" :
              userRole === "HR" ? "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800" :
              isManager ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800" :
              "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
            }`}>
              {canDisburse ? <Crown className="w-5 h-5" /> :
               userRole === "HR" ? <Briefcase className="w-5 h-5" /> :
               isManager ? <ShieldCheck className="w-5 h-5" /> :
               <Lock className="w-5 h-5" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Vai trò đang xác thực:
                </span>
                {getRoleBadge(userRole)}
              </div>
              <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {canDisburse && (
                  <span>
                    <strong>Quản trị viên (BOD / CEO):</strong> Toàn quyền phê duyệt chi thanh toán, đóng sổ kỳ lương, tạo/chỉnh sửa phiếu và kiểm toán toàn bộ quỹ lương 6 phòng ban.
                  </span>
                )}
                {userRole === "HR" && (
                  <span>
                    <strong>Chuyên viên Nhân sự & C&B:</strong> Soạn thảo bảng lương, tính công - bảo hiểm tự động, điều chỉnh phụ cấp/thưởng và gửi trình duyệt chi lên Ban Giám đốc.
                  </span>
                )}
                {isManager && (
                  <span>
                    <strong>Trưởng phòng ban (Manager):</strong> Đối soát danh sách, kiểm tra ngày công thực tế và hệ số thưởng KPI của nhân sự trực thuộc phòng ban trước khi kế toán chốt sổ.
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

        {/* EXPANDABLE 4-ROLE RBAC SPECIFICATION MATRIX */}
        {showRbacMatrix && (
          <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Ma Trận Phân Định Trách Nhiệm Tiền Lương Theo 4 Vai Trò (Payroll RBAC Matrix)
                </h3>
              </div>
              <button 
                onClick={() => setShowRbacMatrix(false)}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                Thu gọn
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Role 1: SYSTEM_ADMIN */}
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-blue-200 dark:border-blue-900/60 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-600 text-white">
                    <Crown className="w-3 h-3" /> SYSTEM_ADMIN
                  </span>
                  <span className="text-[10px] text-zinc-400">Ban Lãnh Đạo</span>
                </div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Tổng Giám Đốc / HĐQT</h4>
                <ul className="text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc list-inside">
                  <li><strong>Phê duyệt chi (PAID):</strong> Khóa sổ tài chính, không ai được sửa sau duyệt.</li>
                  <li>Xem 100% bảng lương cán bộ toàn tập đoàn.</li>
                  <li>Xuất báo cáo tài chính & danh sách chi lương ngân hàng.</li>
                  <li>Xóa phiếu lương nháp lập sai sót.</li>
                </ul>
              </div>

              {/* Role 2: HR */}
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-purple-200 dark:border-purple-900/60 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-600 text-white">
                    <Briefcase className="w-3 h-3" /> HR (C&B)
                  </span>
                  <span className="text-[10px] text-zinc-400">Nhân Sự & Đãi Ngộ</span>
                </div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Chuyên viên C&B / Trưởng phòng HR</h4>
                <ul className="text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc list-inside">
                  <li><strong>Tính lương tự động:</strong> Quét dữ liệu chấm công đối chiếu 22 ngày công chuẩn.</li>
                  <li>Khởi tạo phiếu lương mới cho nhân viên.</li>
                  <li>Điều chỉnh khoản thưởng, phụ cấp và khấu trừ BHXH (10.5%).</li>
                  <li>Gửi bảng lương trình Lãnh đạo phê duyệt chi.</li>
                </ul>
              </div>

              {/* Role 3: MANAGER */}
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-amber-200 dark:border-amber-900/60 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500 text-white">
                    <ShieldCheck className="w-3 h-3" /> MANAGER
                  </span>
                  <span className="text-[10px] text-zinc-400">Trưởng Đơn Vị</span>
                </div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Trưởng Phòng Ban Chuyên Môn</h4>
                <ul className="text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc list-inside">
                  <li><strong>Đối soát phòng ban:</strong> Kiểm tra công và thưởng KPI nhân sự cấp dưới.</li>
                  <li>Thẩm định các trường hợp nghỉ phép có lương/không lương.</li>
                  <li>Không được tự ý duyệt chi ngân sách doanh nghiệp.</li>
                  <li>Xem phiếu lương của toàn thể nhân sự thuộc phòng ban.</li>
                </ul>
              </div>

              {/* Role 4: USER */}
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-950">
                    <Users className="w-3 h-3" /> USER (NHÂN VIÊN)
                  </span>
                  <span className="text-[10px] text-zinc-400">Toàn Thể Cán Bộ</span>
                </div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Cán bộ, Kỹ sư, Chuyên viên</h4>
                <ul className="text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc list-inside">
                  <li><strong>Bảo mật thông tin:</strong> Chỉ truy cập xem phiếu lương của chính mình.</li>
                  <li>Tra cứu chi tiết lương cơ bản theo ngày công, phụ cấp, thưởng KPI.</li>
                  <li>Xem cụ thể số tiền trích nộp BHXH (8%), BHYT (1.5%), BHTN (1%).</li>
                  <li>In phiếu lương chuẩn mẫu A4 hoặc phản hồi giải trình công.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Table Container */}
        <div className="bento-card rounded-2xl overflow-hidden shadow-xs flex flex-col">
          {/* Table Toolbar */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50/60 dark:bg-zinc-900/40">
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-3.5 w-3.5 text-zinc-400" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all shadow-2xs font-mono"
                  placeholder="Tìm theo tên nhân viên, email, phòng ban..."
                />
              </div>

              {!isRegularUser && (
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-zinc-500 hidden sm:inline">Lọc vai trò:</label>
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 outline-none shadow-2xs font-mono"
                  >
                    <option value="ALL">Tất cả vai trò</option>
                    <option value="SYSTEM_ADMIN">Lãnh đạo (Admin)</option>
                    <option value="MANAGER">Trưởng phòng (Manager)</option>
                    <option value="HR">Nhân sự (HR)</option>
                    <option value="USER">Nhân viên (User)</option>
                  </select>
                </div>
              )}
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-medium text-xs border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-5 py-3">Cán bộ nhân sự</th>
                  <th className="px-5 py-3">Vai trò & Vị trí</th>
                  <th className="px-5 py-3">Kỳ lương</th>
                  <th className="px-5 py-3 text-right">Lương cơ bản</th>
                  <th className="px-5 py-3 text-right font-mono">Thực lĩnh (Net)</th>
                  <th className="px-5 py-3 text-center">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-zinc-500 text-xs">
                      <div className="w-5 h-5 border-2 border-zinc-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                      Đang tải dữ liệu bảng lương...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-zinc-500 text-xs">
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
                  filteredData.map((payroll) => {
                    const empRole = payroll.employee?.user?.role?.name || "USER";
                    return (
                      <tr key={payroll.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">
                            {payroll.employee?.user?.name}
                          </div>
                          <div className="text-xs text-zinc-500 font-mono">
                            {payroll.employee?.user?.email} · NV-{(payroll.employee?.id || "").slice(-5).toUpperCase()}
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="space-y-1">
                            <div>{getRoleBadge(empRole)}</div>
                            <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                              {payroll.employee?.position || "Chuyên viên"} · {payroll.employee?.department?.name || "Công ty"}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                            Tháng {payroll.month < 10 ? `0${payroll.month}` : payroll.month}/{payroll.year}
                          </div>
                          <div className="text-[10px] text-zinc-400">22 ngày công chuẩn</div>
                        </td>

                        <td className="px-5 py-3.5 text-right font-mono text-xs text-zinc-600 dark:text-zinc-400">
                          {formatVND(payroll.baseSalary)}
                        </td>

                        <td className="px-5 py-3.5 text-right font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatVND(payroll.netSalary)}
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          {payroll.status === "DRAFT" ? (
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 font-medium">
                              <Clock className="w-3 h-3" /> Bản nháp
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Đã thanh toán
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-right text-xs">
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
                                    title="Duyệt chi thanh toán (Khóa sổ)"
                                  >
                                    Duyệt chi
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
