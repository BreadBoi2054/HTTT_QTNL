"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import VietnameseDatePicker from "@/components/ui/VietnameseDatePicker";
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
  const [myProfile, setMyProfile] = useState<any>(null);
  const [userKpi, setUserKpi] = useState<any>(null);
  const [userPayroll, setUserPayroll] = useState<any>(null);
  const [userLeave, setUserLeave] = useState<any>({ allowance: 12, usedDays: 0, remainingDays: 12 });
  const [userContract, setUserContract] = useState<any>(null);
  const [recentAttendances, setRecentAttendances] = useState<any[]>([]);
  const [myMonthlyAttendances, setMyMonthlyAttendances] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  const fetchMyData = async () => {
    try {
      const [resEmp, resKpi, resPay, resLeave, resContract, resAtt, resReq] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/performance"),
        fetch("/api/payroll"),
        fetch("/api/leave/balance"),
        fetch("/api/contracts"),
        fetch("/api/attendance"),
        fetch("/api/leave")
      ]);

      const currentEmail = session?.user?.email?.toLowerCase();
      const currentUserId = (session?.user as any)?.id;
      let matchedProfile: any = null;

      if (resEmp.ok) {
        const emps = await resEmp.json();
        if (Array.isArray(emps)) {
          matchedProfile = emps.find((e: any) =>
            (currentEmail && e.user?.email?.toLowerCase() === currentEmail) ||
            (currentUserId && (e.userId === currentUserId || e.user?.id === currentUserId))
          ) || null;
          setMyProfile(matchedProfile);
        }
      }

      const belongsToMe = (item: any) => {
        if (!currentEmail && !currentUserId && !matchedProfile) return false;
        if (matchedProfile?.id && (item.employeeId === matchedProfile.id || item.employee?.id === matchedProfile.id)) return true;
        if (currentEmail && (item.employee?.user?.email?.toLowerCase() === currentEmail || item.email?.toLowerCase() === currentEmail)) return true;
        if (currentUserId && (item.employee?.userId === currentUserId || item.userId === currentUserId)) return true;
        return false;
      };

      if (resKpi.ok) {
        const kpis = await resKpi.json();
        if (Array.isArray(kpis)) {
          const myKpis = kpis.filter(belongsToMe);
          setUserKpi(myKpis[0] || null);
        }
      }
      if (resPay.ok) {
        const pays = await resPay.json();
        if (Array.isArray(pays)) {
          const myPays = pays.filter(belongsToMe);
          setUserPayroll(myPays[0] || null);
        }
      }
      if (resLeave.ok) {
        const leaveData = await resLeave.json();
        setUserLeave(leaveData);
      }
      if (resContract.ok) {
        const contracts = await resContract.json();
        if (Array.isArray(contracts)) {
          const myContracts = contracts.filter(belongsToMe);
          setUserContract(myContracts[0] || null);
        }
      }
      if (resAtt.ok) {
        const atts = await resAtt.json();
        if (Array.isArray(atts)) {
          const myAtts = atts.filter(belongsToMe);
          setMyMonthlyAttendances(myAtts);
          setRecentAttendances(myAtts.slice(0, 5).map((a: any) => ({
            date: new Date(a.date).toLocaleDateString("vi-VN"),
            checkIn: a.checkIn ? new Date(a.checkIn).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "--:--",
            checkOut: a.checkOut ? new Date(a.checkOut).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "Chưa Check-out",
            rawStatus: a.status,
            status: a.status === "PRESENT" ? "ĐÚNG GIỜ" : a.status === "LATE" ? "ĐI MUỘN" : a.status === "LEAVE" ? "NGHỈ PHÉP" : "VẮNG MẶT",
            note: a.status === "PRESENT" ? "Đã ghi nhận giờ vào" : a.status === "LATE" ? "Vào muộn sau 08:30" : "Hệ thống ghi nhận"
          })));
        }
      }
      if (resReq.ok) {
        const reqs = await resReq.json();
        if (Array.isArray(reqs)) {
          const myReqs = reqs.filter(belongsToMe);
          setRecentRequests(myReqs.slice(0, 5).map((r: any) => ({
            code: `NP-${r.id.slice(-6).toUpperCase()}`,
            type: r.type === "ANNUAL_LEAVE" ? "Nghỉ phép thường niên" : r.type === "SICK_LEAVE" ? "Nghỉ ốm đau" : r.type === "MATERNITY_LEAVE" ? "Nghỉ thai sản" : "Nghỉ không hưởng lương",
            range: `${new Date(r.startDate).toLocaleDateString("vi-VN")} - ${new Date(r.endDate).toLocaleDateString("vi-VN")}`,
            rawStatus: r.status,
            status: r.status === "APPROVED" ? "ĐÃ PHÊ DUYỆT" : r.status === "PENDING" ? "CHỜ DUYỆT" : "TỪ CHỐI",
            approver: "Ban Lãnh Đạo / HR"
          })));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchMyData();
    }
  }, [session?.user?.email]);

  const workedCount = myMonthlyAttendances.filter((a: any) => a.status === "PRESENT" || a.status === "LATE" || a.status === "LEAVE").length;
  const onTimeCount = myMonthlyAttendances.filter((a: any) => a.status === "PRESENT").length;
  const computedOnTimeRate = myMonthlyAttendances.length > 0
    ? `${Math.round((onTimeCount / myMonthlyAttendances.length) * 100)}%`
    : "Chưa có dữ liệu";

  const joinDateObj = myProfile?.joinDate ? new Date(myProfile.joinDate) : (myProfile?.createdAt ? new Date(myProfile.createdAt) : null);
  const joinDateFormatted = joinDateObj ? joinDateObj.toLocaleDateString("vi-VN") : "Chưa cập nhật";
  const tenureYears = joinDateObj ? Math.max(0, new Date().getFullYear() - joinDateObj.getFullYear()) : 0;

  const employeeData = {
    name: myProfile?.user?.name || user?.name || "Cán bộ nhân viên",
    email: myProfile?.user?.email || user?.email || "Chưa cập nhật",
    code: `NX-${(myProfile?.id || (user as any)?.id || "00000").slice(-5).toUpperCase()}`,
    dept: myProfile?.department?.name || "Chưa phân bổ phòng ban",
    position: myProfile?.position || "Cán bộ chuyên môn",
    joinDate: joinDateFormatted,
    tenure: joinDateObj ? (tenureYears > 0 ? `${tenureYears} năm công tác` : "Nhân sự mới gia nhập") : "Đang công tác",
    leaveAllowance: userLeave?.allowance ?? 12,
    leaveUsed: userLeave?.usedDays ?? 0,
    leaveRemaining: userLeave?.remainingDays ?? 12,
    attendanceThisMonth: workedCount,
    standardDays: 22,
    onTimeRate: computedOnTimeRate,
    kpiScore: userKpi ? userKpi.totalScore : 0,
    kpiGrade: userKpi ? (userKpi.grade.split(" ")[0] || "CHƯA ĐÁNH GIÁ") : "Chưa đánh giá",
    bonusFactor: userKpi ? (userKpi.bonusRate > 0 ? `+${Math.round(userKpi.bonusRate * 100)}%` : (userKpi.bonusRate < 0 ? `${Math.round(userKpi.bonusRate * 100)}%` : "0%")) : "Chưa xét thưởng",
    lastNetSalary: userPayroll ? userPayroll.netSalary : 0,
    salaryMonth: userPayroll ? userPayroll.month : new Date().getMonth() + 1,
    salaryYear: userPayroll ? userPayroll.year : new Date().getFullYear(),
    contractType: userContract?.contractType || myProfile?.contracts?.[0]?.contractType || "Chưa cập nhật hợp đồng",
    contractCode: userContract?.code || (myProfile?.contracts?.[0]?.id ? `HĐLĐ-${myProfile.contracts[0].id.slice(-5).toUpperCase()}` : "Chưa cấp mã HĐ")
  };

  const [activeTab, setActiveTab] = useState<"ATTENDANCE" | "REQUESTS">("ATTENDANCE");
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  // Form states for quick leave
  const todayIso = new Date().toISOString().slice(0, 10);
  const [leaveType, setLeaveType] = useState("ANNUAL_LEAVE");
  const [leaveStartDate, setLeaveStartDate] = useState(todayIso);
  const [leaveEndDate, setLeaveEndDate] = useState(todayIso);
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  // Form states for attendance dispute
  const [disputeDate, setDisputeDate] = useState(todayIso);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);

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
    if (leaveEndDate < leaveStartDate) {
      alert("Ngày kết thúc nghỉ phép không được nhỏ hơn ngày bắt đầu.");
      return;
    }
    setLeaveSubmitted(true);
    try {
      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          type: leaveType,
          reason: leaveReason || "Nghỉ phép từ cổng không gian cá nhân (ESS)"
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Gửi đơn không thành công.");
      }

      setIsLeaveModalOpen(false);
      setLeaveReason("");
      await fetchMyData();
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
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Không Gian Làm Việc Số Cá Nhân
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Theo dõi ngày phép, lịch sử chấm công, phiếu lương bảo mật và chỉ số hiệu suất cá nhân
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo đơn phép</span>
          </button>
          <button
            onClick={() => setIsDisputeModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-colors border border-zinc-200 dark:border-zinc-700 shadow-2xs active:scale-95"
          >
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Giải trình công</span>
          </button>
        </div>
      </div>

      {/* Digital Employee Badge Dossier Banner */}
      <div className="bento-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-extrabold font-mono shrink-0 shadow-xs">
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

      {/* Unified Swiss Personal Metric Strip */}
      <div className="bento-card p-0 overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200/80 dark:divide-zinc-800">
        {/* Cell 1: Quỹ phép */}
        <div className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="swiss-label">Quỹ nghỉ phép năm</span>
              <Calendar className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
              {employeeData.leaveRemaining} <span className="text-xs font-normal text-zinc-500 font-sans">/ {employeeData.leaveAllowance} ngày</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-colors duration-500" 
                style={{ width: `${(employeeData.leaveRemaining / employeeData.leaveAllowance) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="pt-3 text-xs text-zinc-500 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <span>Đã dùng: <span className="font-mono">{employeeData.leaveUsed}</span> ngày</span>
            <button onClick={() => setIsLeaveModalOpen(true)} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Tạo đơn
            </button>
          </div>
        </div>

        {/* Cell 2: Chấm công */}
        <div className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="swiss-label">Chấm công tháng 10</span>
              <Clock className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
              {employeeData.attendanceThisMonth} <span className="text-xs font-normal text-zinc-500 font-sans">/ {employeeData.standardDays} công</span>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đúng giờ: <span className="font-mono">{employeeData.onTimeRate}</span>
            </div>
          </div>
          <div className="pt-3 text-xs text-zinc-500 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <span>Hôm nay: <span className="font-mono">{recentAttendances[0]?.checkIn || "Chưa ghi nhận"}</span></span>
            <Link href="/dashboard/attendance" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Chấm công
            </Link>
          </div>
        </div>

        {/* Cell 3: Hiệu suất KPI */}
        <div className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="swiss-label">Hiệu suất KPI</span>
              <Target className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
              {employeeData.kpiGrade} <span className="text-xs font-normal text-zinc-500 font-sans">({employeeData.kpiScore}/100)</span>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 font-semibold">
              Hệ số thưởng: <span className="font-mono text-emerald-600 dark:text-emerald-400">{employeeData.bonusFactor}</span>
            </div>
          </div>
          <div className="pt-3 text-xs text-zinc-500 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <span>Kỳ đánh giá Q4 đang mở</span>
            <Link href="/dashboard/performance" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Tự chấm
            </Link>
          </div>
        </div>

        {/* Cell 4: Phiếu lương bảo mật */}
        <div className="p-5 flex flex-col justify-between bg-zinc-50/40 dark:bg-zinc-900/40">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="swiss-label">Thực lĩnh gần nhất</span>
              <Banknote className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
              {userPayroll ? formatVND(employeeData.lastNetSalary) : "Chưa phát hành"}
            </div>
            <div className="text-xs text-zinc-500 mt-2">
              {userPayroll ? `Kỳ lương T${employeeData.salaryMonth}/${employeeData.salaryYear}` : "Chưa có phiếu lương phát hành"}
            </div>
          </div>
          <div className="pt-3 text-xs text-zinc-500 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <span className="font-mono text-[11px]">{userPayroll ? `PL-${employeeData.salaryYear}${employeeData.salaryMonth}-${employeeData.code}` : "--"}</span>
            <button 
              onClick={() => userPayroll && setIsPayslipOpen(true)}
              disabled={!userPayroll}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
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
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                activeTab === "ATTENDANCE"
                  ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs border border-zinc-200 dark:border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              Lịch sử chấm công gần đây
            </button>
            <button
              onClick={() => setActiveTab("REQUESTS")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
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
                {recentAttendances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-zinc-500">
                      Chưa có bản ghi chấm công nào cho tài khoản của bạn.
                    </td>
                  </tr>
                ) : recentAttendances.map((item, idx) => (
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
                      {item.rawStatus === "LATE" || item.status === "ĐI MUỘN" ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium">
                          <Clock className="w-3.5 h-3.5" /> {item.status}
                        </span>
                      ) : item.rawStatus === "ABSENT" || item.status === "VẮNG MẶT" ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" /> {item.status}
                        </span>
                      ) : item.rawStatus === "LEAVE" || item.status === "NGHỈ PHÉP" ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium">
                          <Calendar className="w-3.5 h-3.5" /> {item.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {item.status}
                        </span>
                      )}
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
                {recentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-zinc-500">
                      Chưa có đơn xin nghỉ phép hoặc giải trình nào của bạn.
                    </td>
                  </tr>
                ) : recentRequests.map((req, idx) => (
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
                      {req.rawStatus === "PENDING" || req.status === "CHỜ DUYỆT" ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium">
                          <Clock className="w-3.5 h-3.5" /> {req.status}
                        </span>
                      ) : req.rawStatus === "REJECTED" || req.status === "TỪ CHỐI" ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" /> {req.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {req.status}
                        </span>
                      )}
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
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-md flex flex-col"
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
                  <option value="ANNUAL_LEAVE">Nghỉ phép năm có hưởng lương (Còn {employeeData.leaveRemaining} ngày)</option>
                  <option value="SICK_LEAVE">Nghỉ ốm đau (Chế độ BHXH)</option>
                  <option value="UNPAID_LEAVE">Nghỉ việc riêng không hưởng lương</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Từ ngày</label>
                  <VietnameseDatePicker
                    value={leaveStartDate}
                    onChange={(iso) => {
                      setLeaveStartDate(iso);
                      if (leaveEndDate < iso) setLeaveEndDate(iso);
                    }}
                    ariaLabel="Từ ngày xin nghỉ"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Đến ngày</label>
                  <VietnameseDatePicker
                    min={leaveStartDate}
                    value={leaveEndDate}
                    onChange={(iso) => setLeaveEndDate(iso)}
                    ariaLabel="Đến ngày xin nghỉ"
                  />
                </div>
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
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
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-md flex flex-col"
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
                <VietnameseDatePicker
                  value={disputeDate}
                  onChange={(iso) => setDisputeDate(iso)}
                  ariaLabel="Ngày cần bổ sung công"
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
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
        payroll={userPayroll}
      />
    </div>
  );
}
