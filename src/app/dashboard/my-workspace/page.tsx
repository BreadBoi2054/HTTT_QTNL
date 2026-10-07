"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  User, 
  Calendar, 
  Clock, 
  Banknote, 
  Target, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Plus, 
  ShieldCheck, 
  Briefcase, 
  Building2, 
  Flame, 
  ChevronRight,
  ExternalLink,
  Printer,
  X
} from "lucide-react";
import Link from "next/link";
import PayslipDetailModal from "@/components/payroll/PayslipDetailModal";

export default function MyWorkspacePage() {
  const { data: session } = useSession();
  const user = session?.user;

  // Mocked rich personal dataset for logged in employee
  const employeeData = {
    name: user?.name || "Kỹ sư Phần mềm",
    email: user?.email || "employee@nexustech.vn",
    code: "NX-08942",
    dept: "Khối Công Nghệ & Phần Mềm (Software Engineering)",
    position: "Kỹ Sư Phần Mềm Cao Cấp (Senior Full-Stack)",
    joinDate: "15/03/2022",
    tenure: "4 năm 7 tháng cống hiến",
    leaveAllowance: 12,
    leaveUsed: 1.5,
    leaveRemaining: 10.5,
    attendanceThisMonth: 21.5,
    standardDays: 22,
    onTimeRate: "98.5%",
    kpiScore: 94.2,
    kpiGrade: "HẠNG A",
    bonusFactor: "x1.15",
    lastNetSalary: 28450000,
    salaryMonth: 10,
    salaryYear: 2026,
    contractType: "Hợp đồng Không xác định thời hạn",
    contractCode: "HĐLĐ-2024/NX-08942"
  };

  const [activeTab, setActiveTab] = useState<"ATTENDANCE" | "REQUESTS">("ATTENDANCE");
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  // Form states for quick leave
  const [leaveType, setLeaveType] = useState("ANNUAL_LEAVE");
  const [leaveDays, setLeaveDays] = useState(1);
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  // Form states for attendance dispute
  const [disputeDate, setDisputeDate] = useState(new Date().toISOString().slice(0, 10));
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);

  const samplePayrollRecord = {
    id: "sample_pay_08942",
    month: employeeData.salaryMonth,
    year: employeeData.salaryYear,
    baseSalary: 25000000,
    bonus: 6075000,
    deductions: 2625000,
    netSalary: employeeData.lastNetSalary,
    status: "PAID",
    createdAt: new Date().toISOString(),
    employee: {
      id: "emp_08942",
      position: employeeData.position,
      user: { name: employeeData.name, email: employeeData.email },
      department: { name: employeeData.dept }
    },
    details: [
      { name: "Ngày công thực tế", type: "INFO", amount: 21.5, amountType: "DAYS" },
      { name: "Nghỉ phép hưởng lương", type: "INFO", amount: 0.5, amountType: "DAYS" },
      { name: "Phụ cấp ăn trưa & đi lại", type: "EARNING", amount: 1500000, amountType: "FIXED" },
      { name: "Thưởng hiệu suất KPI (Hạng A)", type: "EARNING", amount: 4575000, amountType: "FIXED" },
      { name: "Bảo hiểm Xã hội (BHXH 8%)", type: "DEDUCTION", amount: 2000000, amountType: "PERCENTAGE" },
      { name: "Bảo hiểm Y tế (BHYT 1.5%)", type: "DEDUCTION", amount: 375000, amountType: "PERCENTAGE" },
      { name: "Bảo hiểm Thất nghiệp (BHTN 1%)", type: "DEDUCTION", amount: 250000, amountType: "PERCENTAGE" }
    ]
  };

  const recentAttendances = [
    { date: "05/10/2026 (Hôm nay)", checkIn: "08:24", checkOut: "17:30 (Dự kiến)", status: "ĐÚNG GIỜ", note: "Smart Terminal GPS" },
    { date: "04/10/2026", checkIn: "08:15", checkOut: "17:35", status: "ĐÚNG GIỜ", note: "Smart Terminal GPS" },
    { date: "03/10/2026", checkIn: "08:29", checkOut: "17:42", status: "ĐÚNG GIỜ", note: "Smart Terminal GPS" },
    { date: "02/10/2026", checkIn: "08:18", checkOut: "17:31", status: "ĐÚNG GIỜ", note: "Smart Terminal GPS" },
    { date: "01/10/2026", checkIn: "08:20", checkOut: "17:30", status: "ĐÚNG GIỜ", note: "Smart Terminal GPS" }
  ];

  const recentRequests = [
    { code: "NP-2026-081", type: "Nghỉ phép thường niên", range: "24/09/2026 (1 ngày)", status: "ĐÃ PHÊ DUYỆT", approver: "Trưởng Bộ Phận" },
    { code: "BS-2026-012", type: "Giải trình bổ sung công", range: "12/09/2026", status: "ĐÃ PHÊ DUYỆT", approver: "Chuyên viên Nhân sự" }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isLeaveModalOpen) setIsLeaveModalOpen(false);
        else if (isDisputeModalOpen) setIsDisputeModalOpen(false);
        else if (isPayslipOpen) setIsPayslipOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLeaveModalOpen, isDisputeModalOpen, isPayslipOpen]);

  const handleSendLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveSubmitted(true);
    try {
      const today = new Date();
      const startDate = today.toISOString().split("T")[0];
      const end = new Date(today);
      end.setDate(today.getDate() + (leaveDays > 1 ? leaveDays - 1 : 0));
      const endDate = end.toISOString().split("T")[0];

      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          type: leaveType,
          reason: leaveReason || "Nghỉ phép từ cổng không gian cá nhân (ESS)"
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Gửi đơn không thành công.");
      }

      setIsLeaveModalOpen(false);
      setLeaveReason("");
      alert("Đơn xin nghỉ phép đã được tạo thành công và chuyển tới Quản lý phê duyệt.");
    } catch (err: any) {
      alert(err.message || "Lỗi khi gửi đơn xin nghỉ phép.");
    } finally {
      setLeaveSubmitted(false);
    }
  };

  const handleSendDispute = (e: React.FormEvent) => {
    e.preventDefault();
    setDisputeSubmitted(true);
    setTimeout(() => {
      setDisputeSubmitted(false);
      setIsDisputeModalOpen(false);
      alert("Giải trình bổ sung công đã được gửi tới Ban Nhân sự.");
    }, 800);
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
  };

  return (
    <div className="space-y-6 animate-swiss-in pb-10 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              <User className="w-3.5 h-3.5" />
              Cổng thông tin nhân sự cá nhân (ESS)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
            Không Gian Làm Việc Số Cá Nhân
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Theo dõi ngày phép, lịch sử chấm công, phiếu lương bảo mật và chỉ số hiệu suất cá nhân
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo đơn phép</span>
          </button>
          <button
            onClick={() => setIsDisputeModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all border border-zinc-200 dark:border-zinc-700 shadow-2xs active:scale-95"
          >
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Giải trình công</span>
          </button>
        </div>
      </div>

      {/* Digital Employee Badge Dossier Banner */}
      <div className="bento-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-extrabold font-mono shrink-0 shadow-md glow-blue group-hover:scale-105 transition-transform">
            {employeeData.name?.[0] || "N"}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {employeeData.name}
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                Biên chế chính thức
              </span>
            </div>

            <div className="text-xs text-zinc-600 dark:text-zinc-400 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Mã định danh: <strong className="font-mono text-zinc-900 dark:text-zinc-100 font-bold">{employeeData.code}</strong></span>
              <span>•</span>
              <span>Chức vụ: <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{employeeData.position}</strong></span>
              <span>•</span>
              <span>Đơn vị: <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{employeeData.dept}</strong></span>
            </div>

            <div className="text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
              Ngày gia nhập: {employeeData.joinDate} ({employeeData.tenure}) • {employeeData.contractType}
            </div>
          </div>
        </div>

        <div className="flex md:flex-col items-end gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
          <div className="text-right">
            <span className="text-[11px] text-zinc-400 font-medium block">Hợp đồng hiện hành</span>
            <div className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">{employeeData.contractCode}</div>
          </div>
          <Link
            href="/dashboard/contracts"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
          >
            Hồ sơ hợp đồng <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Metric Bento Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Quỹ phép */}
        <div className="bento-card p-5 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="swiss-label">Quỹ nghỉ phép năm</span>
              <div className="squircle w-9 h-9 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
              {employeeData.leaveRemaining} <span className="text-xs font-normal text-zinc-500 font-sans">/ {employeeData.leaveAllowance} ngày</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(employeeData.leaveRemaining / employeeData.leaveAllowance) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="pt-3 text-xs text-zinc-500 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <span>Đã dùng: {employeeData.leaveUsed} ngày</span>
            <button onClick={() => setIsLeaveModalOpen(true)} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Tạo đơn
            </button>
          </div>
        </div>

        {/* Tile 2: Chấm công */}
        <div className="bento-card p-5 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="swiss-label">Chấm công tháng 10</span>
              <div className="squircle w-9 h-9 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
              {employeeData.attendanceThisMonth} <span className="text-xs font-normal text-zinc-500 font-sans">/ {employeeData.standardDays} công</span>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đúng giờ: {employeeData.onTimeRate}
            </div>
          </div>
          <div className="pt-3 text-xs text-zinc-500 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <span>Hôm nay: Check-in 08:24</span>
            <Link href="/dashboard/attendance" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              Chấm công
            </Link>
          </div>
        </div>

        {/* Tile 3: Hiệu suất KPI */}
        <div className="bento-card p-5 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="swiss-label">Hiệu suất KPI</span>
              <div className="squircle w-9 h-9 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
              {employeeData.kpiGrade} <span className="text-xs font-normal text-zinc-500 font-sans">({employeeData.kpiScore}/100)</span>
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1.5 font-semibold">
              Hệ số thưởng: {employeeData.bonusFactor}
            </div>
          </div>
          <div className="pt-3 text-xs text-zinc-500 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <span>Kỳ đánh giá Q4 đang mở</span>
            <Link href="/dashboard/performance" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
              Tự chấm
            </Link>
          </div>
        </div>

        {/* Tile 4: Phiếu lương bí mật */}
        <div className="bento-card p-5 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="swiss-label">Thực lĩnh gần nhất</span>
              <div className="squircle w-9 h-9 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Banknote className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              {formatVND(employeeData.lastNetSalary)}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Đã chi trả qua Techcombank
            </div>
          </div>
          <div className="pt-3 text-xs text-zinc-500 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <span className="font-mono text-[11px]">PL-202610-08942</span>
            <button 
              onClick={() => setIsPayslipOpen(true)}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Xem phiếu lương
            </button>
          </div>
        </div>
      </div>

      {/* Tabs & Tab Details */}
      <div className="bento-card overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("ATTENDANCE")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activeTab === "ATTENDANCE"
                  ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs border border-zinc-200 dark:border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              Lịch sử chấm công gần đây
            </button>
            <button
              onClick={() => setActiveTab("REQUESTS")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activeTab === "REQUESTS"
                  ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs border border-zinc-200 dark:border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              Đơn từ & Giải trình cá nhân
            </button>
          </div>

          <span className="text-xs text-zinc-500 hidden sm:flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            Bảo mật dữ liệu cá nhân
          </span>
        </div>

        {activeTab === "ATTENDANCE" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 text-xs font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-5 py-3.5">Ngày làm việc</th>
                  <th className="px-5 py-3.5">Giờ Check-in</th>
                  <th className="px-5 py-3.5">Giờ Check-out</th>
                  <th className="px-5 py-3.5">Thiết bị / Phương thức</th>
                  <th className="px-5 py-3.5 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recentAttendances.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.date}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-zinc-700 dark:text-zinc-300">
                      {item.checkIn}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-zinc-700 dark:text-zinc-300">
                      {item.checkOut}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 text-xs">
                      {item.note}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 text-xs font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-5 py-3.5">Mã đơn</th>
                  <th className="px-5 py-3.5">Loại thủ tục</th>
                  <th className="px-5 py-3.5">Thời gian áp dụng</th>
                  <th className="px-5 py-3.5">Cấp phê duyệt</th>
                  <th className="px-5 py-3.5 text-right">Tình trạng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recentRequests.map((req, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {req.code}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-800 dark:text-zinc-200">
                      {req.type}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                      {req.range}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                      {req.approver}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Quick Leave Request */}
      {isLeaveModalOpen && (
        <div 
          onClick={() => setIsLeaveModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
          >
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Gửi Đơn Xin Nghỉ Phép Nhanh</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsLeaveModalOpen(false)} 
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Thoát</span>
              </button>
            </div>

            <form onSubmit={handleSendLeave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Loại nghỉ phép</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
                >
                  <option value="ANNUAL_LEAVE">Nghỉ phép năm có hưởng lương (Còn 10.5 ngày)</option>
                  <option value="SICK_LEAVE">Nghỉ ốm đau / Khám bệnh có bảo hiểm</option>
                  <option value="UNPAID_LEAVE">Nghỉ việc riêng không hưởng lương</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Số ngày đăng ký nghỉ</label>
                <input
                  type="number"
                  min={0.5}
                  max={10.5}
                  step={0.5}
                  value={leaveDays}
                  onChange={(e) => setLeaveDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Lý do xin nghỉ</label>
                <textarea
                  required
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Ghi rõ lý do và người bàn giao công việc tạm thời..."
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="flex items-center gap-1 px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Thoát</span>
                </button>
                <button
                  type="submit"
                  disabled={leaveSubmitted}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-lg text-xs font-medium transition-colors shadow-xs"
                >
                  {leaveSubmitted ? "Đang gửi..." : "Gửi đơn phê duyệt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Quick Dispute Request */}
      {isDisputeModalOpen && (
        <div 
          onClick={() => setIsDisputeModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
          >
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Giải Trình Quên Chấm Công</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsDisputeModalOpen(false)} 
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Thoát</span>
              </button>
            </div>

            <form onSubmit={handleSendDispute} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Ngày cần bổ sung công</label>
                <input
                  type="date"
                  required
                  value={disputeDate}
                  onChange={(e) => setDisputeDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Lý do giải trình</label>
                <textarea
                  required
                  rows={3}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Ví dụ: Quên check-in do đi họp đối tác bên ngoài, thiết bị smart terminal lỗi kết nối..."
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDisputeModalOpen(false)}
                  className="flex items-center gap-1 px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Thoát</span>
                </button>
                <button
                  type="submit"
                  disabled={disputeSubmitted}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-lg text-xs font-medium transition-colors shadow-xs"
                >
                  {disputeSubmitted ? "Đang gửi..." : "Gửi giải trình"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      <PayslipDetailModal
        isOpen={isPayslipOpen}
        onClose={() => setIsPayslipOpen(false)}
        payroll={samplePayrollRecord}
      />
    </div>
  );
}
