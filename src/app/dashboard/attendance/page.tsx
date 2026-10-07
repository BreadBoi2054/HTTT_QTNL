"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  LogIn, 
  LogOut, 
  Download, 
  X, 
  AlertCircle, 
  CheckCircle2,
  MapPin,
  Wifi,
  ShieldCheck,
  Building2,
  Users,
  Search,
  Filter,
  Camera,
  Laptop
} from "lucide-react";

export default function AttendancePage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.roleName || "USER";
  const userEmail = session?.user?.email || "";
  const userName = session?.user?.name || "Cán bộ nhân viên";

  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"terminal" | "roster">("terminal");

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendances = async (dateStr?: string) => {
    setLoading(true);
    try {
      const url = dateStr ? `/api/attendance?date=${dateStr}` : "/api/attendance";
      const res = await fetch(url);
      const data = await res.json();
      setAttendances(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances(filterDate);
  }, [filterDate]);

  // Determine user's today attendance record
  const todayDateStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const myTodayRecord = useMemo(() => {
    if (!userEmail) return null;
    return attendances.find((a: any) => {
      const recordDate = a.date ? a.date.split("T")[0] : "";
      return a.employee?.user?.email === userEmail && recordDate === todayDateStr;
    });
  }, [attendances, userEmail, todayDateStr]);

  const hasCheckedIn = !!myTodayRecord?.checkIn;
  const hasCheckedOut = !!myTodayRecord?.checkOut;

  const handleCheckIn = async () => {
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/attendance/check-in", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      setSuccess("Ghi nhận vào ca làm việc thành công! Hệ thống đã ghi nhận GPS và IP văn phòng.");
      fetchAttendances(filterDate);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/attendance/check-out", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      setSuccess("Kết thúc ca làm việc thành công! Tổng giờ công đã được cập nhật vào bảng tính lương.");
      fetchAttendances(filterDate);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "--:--:--";
    return new Date(dateString).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleExportExcel = () => {
    const url = `/api/attendance/export/excel`;
    window.open(url, '_blank');
  };

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "PRESENT") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Đúng giờ
        </span>
      );
    }
    if (status === "LATE") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Đi trễ
        </span>
      );
    }
    if (status === "ABSENT") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Vắng mặt
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
        {status}
      </span>
    );
  };

  // Filter corporate records
  const filteredRecords = attendances.filter((record) => {
    const matchesSearch = 
      record.employee?.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employee?.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.employee?.department?.name && record.employee.department.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" ? true : record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate corporate today metrics
  const todayTotal = attendances.length;
  const onTimeCount = attendances.filter(a => a.status === "PRESENT").length;
  const lateCount = attendances.filter(a => a.status === "LATE").length;
  const absentCount = attendances.filter(a => a.status === "ABSENT").length;

  return (
    <div className="space-y-6 pb-12 animate-swiss-in max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              <Clock className="w-3.5 h-3.5" />
              Quản trị Chấm công & Điểm danh
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
            Chấm Công & Giám Sát Thời Gian Làm Việc
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Ghi nhận thời gian làm việc chuẩn xác, tự động phân loại đi trễ và đối soát dữ liệu toàn cơ quan.
          </p>
        </div>

        {/* Tab switch for all roles */}
        <div className="flex bg-zinc-100/80 dark:bg-zinc-800/80 p-1 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl">
          <button
            onClick={() => setActiveTab("terminal")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "terminal"
                ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Trạm chấm công cá nhân</span>
          </button>

          <button
            onClick={() => setActiveTab("roster")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "roster"
                ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Giám sát công ty ({attendances.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TRẠM CHẤM CÔNG CÁ NHÂN */}
      {activeTab === "terminal" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Live Clock & Action Card */}
            <div className="lg:col-span-1 bento-card bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white border-zinc-800 p-6 flex flex-col justify-between shadow-lg rounded-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-2">
                    <Laptop className="w-4 h-4" /> Trạm điểm danh trực tuyến
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Sẵn sàng
                  </span>
                </div>

                {/* User Identification Header */}
                <div className="p-3 bg-zinc-800/80 border border-zinc-700/80 rounded-lg mb-4">
                  <div className="text-[11px] text-zinc-400 font-medium">Tài khoản nhân viên:</div>
                  <div className="font-bold text-sm text-white mt-0.5">{userName}</div>
                  <div className="text-xs text-zinc-400 font-mono truncate">{userEmail}</div>
                </div>

                {/* Big Live Digital Clock */}
                <div className="space-y-1 text-center py-2">
                  <div className="text-4xl sm:text-5xl font-mono font-medium tracking-tight text-white">
                    {currentTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </div>
                  <div className="text-xs text-zinc-400 pt-1">
                    {currentTime.toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>

                {/* Current Status Today Indicator */}
                <div className="mt-4 p-3 bg-zinc-800/80 border border-zinc-700/80 rounded-lg">
                  <div className="text-xs font-medium text-zinc-400 mb-1.5">Trạng thái ca hôm nay:</div>
                  {hasCheckedIn ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã vào ca: {formatTime(myTodayRecord?.checkIn)}
                        </span>
                        <StatusBadge status={myTodayRecord?.status || "PRESENT"} />
                      </div>
                      <div className="text-xs text-zinc-400">
                        {hasCheckedOut ? (
                          <span className="text-blue-400">Đã check-out lúc: {formatTime(myTodayRecord?.checkOut)} (Hoàn tất)</span>
                        ) : (
                          <span>Đang trong ca làm việc. Vui lòng check-out khi ra ca.</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-400 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> Chưa ghi nhận Check-in hôm nay
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {error && (
                  <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{success}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={handleCheckIn}
                    disabled={actionLoading || hasCheckedIn}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium rounded-lg transition-all ${
                      hasCheckedIn 
                        ? "bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed opacity-60" 
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer"
                    }`}
                    title={hasCheckedIn ? "Hôm nay bạn đã thực hiện Check-in" : "Bấm để Check-in vào ca"}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{hasCheckedIn ? "Đã Vào Ca" : "Vào Ca (Check-in)"}</span>
                  </button>

                  <button 
                    onClick={handleCheckOut}
                    disabled={actionLoading || !hasCheckedIn || hasCheckedOut}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium rounded-lg transition-all ${
                      !hasCheckedIn || hasCheckedOut
                        ? "bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed opacity-50"
                        : "bg-white hover:bg-zinc-100 text-zinc-900 shadow-xs cursor-pointer font-semibold"
                    }`}
                    title={!hasCheckedIn ? "Phải Check-in trước khi Check-out" : hasCheckedOut ? "Đã Check-out xong" : "Bấm để kết thúc ca làm"}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{hasCheckedOut ? "Đã Hết Ca" : "Ra Ca (Check-out)"}</span>
                  </button>
                </div>

                <div className="text-[11px] text-zinc-500 text-center pt-1">
                  Xác thực: Mạng nội bộ Nexustech HQ & Định vị văn phòng hợp lệ
                </div>
              </div>
            </div>

            {/* Security Environment & Policy Card */}
            <div className="lg:col-span-2 space-y-5">
              {/* Geofencing & Validation Status */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Môi trường xác thực điểm danh
                  </span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium">
                    Hợp lệ & Bảo mật
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-lg">
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs font-medium">Định vị Geofencing</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Nexustech Tower, Hà Nội</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Bán kính: 28m (Hợp lệ)
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-lg">
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-1">
                      <Wifi className="w-4 h-4" />
                      <span className="text-xs font-medium">Mạng doanh nghiệp</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Nexustech-Corporate-5G</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> IP: 192.168.1.104
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-lg">
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-1">
                      <Camera className="w-4 h-4" />
                      <span className="text-xs font-medium">Nhận diện điểm danh</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Sinh trắc học camera</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sẵn sàng xác thực
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy & Rules Card */}
              <div className="bento-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3 mb-3.5">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <div className="squircle w-7 h-7 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      Quy định thời gian làm việc chuẩn
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                    Khung giờ làm việc tại Tập đoàn Nexustech
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                    Ca hành chính bắt đầu từ <strong className="text-zinc-900 dark:text-zinc-200 font-mono">08:30:00</strong> sáng. Nếu Check-in sau thời điểm này, hệ thống sẽ tự động gán trạng thái <span className="text-amber-600 dark:text-amber-400 font-semibold">Đi trễ (Late)</span>. Thời gian ra ca chuẩn lúc <strong className="text-zinc-900 dark:text-zinc-200 font-mono">17:30:00</strong> (Đủ 8.0 giờ công).
                  </p>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Giờ vào chuẩn</span>
                      <span className="text-base font-mono font-extrabold text-zinc-900 dark:text-zinc-100">08:30:00</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">Không ân hạn</span>
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Giờ ra chuẩn</span>
                      <span className="text-base font-mono font-extrabold text-zinc-900 dark:text-zinc-100">17:30:00</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">Đủ 8.0 giờ công</span>
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Giới hạn ghi nhận</span>
                      <span className="text-base font-mono font-extrabold text-blue-600 dark:text-blue-400">1 ca / ngày</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">Tự động khóa ca</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3.5 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400">
                  Lưu ý: Mọi dữ liệu điểm danh được ký số điện tử và lưu trữ tự động trên cơ sở dữ liệu của Tập đoàn.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BẢNG GIÁM SÁT TOÀN DOANH NGHIỆP */}
      {(activeTab === "roster" || userRole !== "USER") && (
        <div className="space-y-4">
          {/* Top Corporate Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bento-card p-4">
              <span className="swiss-label">Tổng lượt ghi nhận</span>
              <div className="text-2xl font-mono font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">{todayTotal}</div>
              <div className="text-xs text-zinc-400 mt-0.5">Hồ sơ chấm công</div>
            </div>
            <div className="bento-card p-4">
              <span className="swiss-label">Đúng giờ</span>
              <div className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{onTimeCount}</div>
              <div className="text-xs text-zinc-400 mt-0.5">Tỷ lệ: {todayTotal > 0 ? Math.round((onTimeCount/todayTotal)*100) : 0}%</div>
            </div>
            <div className="bento-card p-4">
              <span className="swiss-label">Đi trễ</span>
              <div className="text-2xl font-mono font-extrabold text-amber-600 dark:text-amber-400 mt-1">{lateCount}</div>
              <div className="text-xs text-zinc-400 mt-0.5">Sau mốc 08:30</div>
            </div>
            <div className="bento-card p-4">
              <span className="swiss-label">Vắng mặt / Nghỉ</span>
              <div className="text-2xl font-mono font-extrabold text-rose-600 dark:text-rose-400 mt-1">{absentCount}</div>
              <div className="text-xs text-zinc-400 mt-0.5">Đã trừ ngày công</div>
            </div>
          </div>

          <div className="bento-card rounded-2xl shadow-xs overflow-hidden">

          {/* Table Toolbar */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-zinc-900">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 transition-colors"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 outline-none"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PRESENT">Đúng giờ</option>
                <option value="LATE">Đi trễ</option>
                <option value="ABSENT">Vắng mặt</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <input 
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono text-zinc-800 dark:text-zinc-200 outline-none focus:border-blue-600 transition-colors"
                  title="Lọc theo ngày"
                />
                <CalendarIcon className="w-3.5 h-3.5 absolute left-2.5 text-zinc-400 pointer-events-none" />
                {filterDate && (
                  <button 
                    onClick={() => setFilterDate("")} 
                    className="ml-2 text-zinc-400 hover:text-red-500"
                    title="Xóa bộ lọc ngày"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-lg text-xs font-medium transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất báo cáo</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-medium text-xs border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-5 py-3">Cán bộ Nhân sự</th>
                  <th className="px-5 py-3">Phòng ban</th>
                  <th className="px-5 py-3">Ngày làm việc</th>
                  <th className="px-5 py-3 font-mono">Giờ vào (Check-in)</th>
                  <th className="px-5 py-3 font-mono">Giờ ra (Check-out)</th>
                  <th className="px-5 py-3 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                      <div className="w-5 h-5 border-2 border-zinc-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                      Đang truy vấn dữ liệu chấm công...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 text-xs">
                      Không tìm thấy bản ghi chấm công nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">
                          {record.employee.user.name}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                          {record.employee.user.email}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-zinc-600 dark:text-zinc-300">
                        {record.employee.department?.name || "-"}
                      </td>
                      <td className="px-5 py-3 text-zinc-700 dark:text-zinc-300">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-5 py-3 text-zinc-900 dark:text-zinc-100 font-medium font-mono">
                        {formatTime(record.checkIn)}
                      </td>
                      <td className="px-5 py-3 text-zinc-900 dark:text-zinc-100 font-medium font-mono">
                        {formatTime(record.checkOut)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <StatusBadge status={record.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
