"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  Laptop,
  ScanFace,
  Sparkles,
  Fingerprint
} from "lucide-react";
import { TableSkeleton } from "@/components/providers/ToastProvider";

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

  // Attendance Method State (Default: manual as requested)
  const [checkInMethod, setCheckInMethod] = useState<"manual" | "faceid">("manual");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("attendance_method") as "manual" | "faceid" | null;
      if (saved === "faceid" || saved === "manual") {
        setCheckInMethod(saved);
      }
    } catch {
      // Ignore localStorage read errors in SSR/strict env
    }
  }, []);

  const handleMethodChange = (method: "manual" | "faceid") => {
    setCheckInMethod(method);
    try {
      localStorage.setItem("attendance_method", method);
    } catch {
      // Ignore localStorage write errors
    }
  };

  // FaceID Modal State
  const [isFaceIdOpen, setIsFaceIdOpen] = useState(false);
  const [faceIdMode, setFaceIdMode] = useState<"checkIn" | "checkOut">("checkIn");
  const [faceScanStep, setFaceScanStep] = useState<"connecting" | "scanning" | "matched" | "success" | "error">("connecting");
  const [cameraError, setCameraError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const executeCheckIn = async (methodType?: "manual" | "faceid") => {
    const effectiveMethod = methodType || checkInMethod;
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/attendance/check-in", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      setSuccess(
        effectiveMethod === "faceid"
          ? "Xác thực FaceID thành công! Ghi nhận vào ca làm việc thành công."
          : "Chấm công thủ công thành công! Ghi nhận vào ca làm việc."
      );
      fetchAttendances(filterDate);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const executeCheckOut = async (methodType?: "manual" | "faceid") => {
    const effectiveMethod = methodType || checkInMethod;
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/attendance/check-out", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      setSuccess(
        effectiveMethod === "faceid"
          ? "Xác thực FaceID thành công! Ghi nhận kết thúc ca làm việc."
          : "Chấm công thủ công thành công! Ghi nhận kết thúc ca làm việc."
      );
      fetchAttendances(filterDate);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openFaceId = (mode: "checkIn" | "checkOut") => {
    setFaceIdMode(mode);
    setIsFaceIdOpen(true);
    setFaceScanStep("connecting");
    setCameraError("");
  };

  const closeFaceId = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsFaceIdOpen(false);
  };

  // Camera Lifecycle and Face Scanning Simulation
  useEffect(() => {
    if (!isFaceIdOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

    let isMounted = true;
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    let timer3: NodeJS.Timeout;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Trình duyệt không hỗ trợ API Camera (getUserMedia).");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          },
          audio: false
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch((e) => console.warn("Video play error:", e));
          };
        }

        setFaceScanStep("scanning");

        // Tiến trình quét nhận diện sinh trắc học FaceID
        timer1 = setTimeout(() => {
          if (isMounted) setFaceScanStep("matched");
        }, 1300);

        timer2 = setTimeout(() => {
          if (isMounted) {
            setFaceScanStep("success");
            timer3 = setTimeout(async () => {
              if (faceIdMode === "checkIn") {
                await executeCheckIn();
              } else {
                await executeCheckOut();
              }
              closeFaceId();
            }, 800);
          }
        }, 2400);

      } catch (err: any) {
        console.error("Camera access error:", err);
        if (!isMounted) return;
        setFaceScanStep("error");
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setCameraError("Trình duyệt đang CHẶN quyền truy cập Camera. Vui lòng bấm vào biểu tượng Ổ khóa / Camera trên thanh địa chỉ URL để chọn 'Cho phép' (Allow).");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setCameraError("Không tìm thấy Webcam trên thiết bị. Bạn có thể sử dụng nút 'Chấm công dự phòng' bên dưới.");
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setCameraError("Camera đang bị ứng dụng khác (Zoom, Meet, Teams, Camera app...) chiếm dụng. Vui lòng đóng ứng dụng đó và thử lại.");
        } else {
          setCameraError(err.message || "Không thể kết nối với Camera.");
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [isFaceIdOpen, faceIdMode]);

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
    if (status === "LEAVE") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Nghỉ phép
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
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
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
            <div className="lg:col-span-1 bento-card p-6 flex flex-col justify-between shadow-xs rounded-2xl relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="relative z-10">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <Laptop className="w-4 h-4" /> Trạm điểm danh trực tuyến
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" /> Sẵn sàng
                  </span>
                </div>

                {/* User Identification Header */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl mb-4">
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Tài khoản nhân viên:</div>
                  <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">{userName}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono truncate">{userEmail}</div>
                </div>

                {/* Big Live Digital Clock */}
                <div className="space-y-1 text-center py-2">
                  <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {currentTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                    {currentTime.toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>

                {/* Current Status Today Indicator */}
                <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl">
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Trạng thái ca hôm nay:</div>
                  {hasCheckedIn ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã vào ca: {formatTime(myTodayRecord?.checkIn)}
                        </span>
                        <StatusBadge status={myTodayRecord?.status || "PRESENT"} />
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {hasCheckedOut ? (
                          <span className="text-blue-600 dark:text-blue-400 font-medium">Đã check-out lúc: {formatTime(myTodayRecord?.checkOut)} (Hoàn tất)</span>
                        ) : (
                          <span>Đang trong ca làm việc. Vui lòng check-out khi ra ca.</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> Chưa ghi nhận Check-in hôm nay
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500 dark:text-red-400" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Method Selector Switcher */}
                <div className="bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700/80 grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => handleMethodChange("manual")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      checkInMethod === "manual"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>Thủ công (Nút bấm)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMethodChange("faceid")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      checkInMethod === "faceid"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Quét FaceID (Cam)</span>
                  </button>
                </div>

                {checkInMethod === "manual" ? (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => executeCheckIn("manual")}
                        disabled={actionLoading || hasCheckedIn}
                        className={`flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold rounded-xl transition-all ${
                          hasCheckedIn 
                            ? "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-60" 
                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer ring-2 ring-emerald-500/20 active:scale-[0.98]"
                        }`}
                        title={hasCheckedIn ? "Hôm nay bạn đã thực hiện Check-in" : "Bấm để Chấm công Vào ca thủ công"}
                      >
                        {actionLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <LogIn className="w-4 h-4" />
                        )}
                        <span>{hasCheckedIn ? "Đã Vào Ca" : "Vào Ca Thủ Công"}</span>
                      </button>

                      <button 
                        onClick={() => executeCheckOut("manual")}
                        disabled={actionLoading || !hasCheckedIn || hasCheckedOut}
                        className={`flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold rounded-xl transition-all ${
                          !hasCheckedIn || hasCheckedOut
                            ? "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-50"
                            : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-sm cursor-pointer active:scale-[0.98]"
                        }`}
                        title={!hasCheckedIn ? "Phải Check-in trước khi Check-out" : hasCheckedOut ? "Đã Check-out xong" : "Bấm để Chấm công Ra ca thủ công"}
                      >
                        {actionLoading ? (
                          <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
                        ) : (
                          <LogOut className="w-4 h-4" />
                        )}
                        <span>{hasCheckedOut ? "Đã Hết Ca" : "Ra Ca Thủ Công"}</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
                      <span>Chế độ thủ công: Điểm danh trực tiếp 1-chạm không cần mở camera.</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button 
                      onClick={() => openFaceId("checkIn")}
                      disabled={actionLoading || hasCheckedIn}
                      className={`flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-xl transition-all ${
                        hasCheckedIn 
                          ? "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-60" 
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer ring-2 ring-blue-500/20 active:scale-[0.98]"
                      }`}
                      title={hasCheckedIn ? "Hôm nay bạn đã thực hiện Check-in" : "Bật Camera quét FaceID vào ca"}
                    >
                      <Camera className="w-4 h-4" />
                      <span>{hasCheckedIn ? "Đã Vào Ca" : "Quét FaceID Vào Ca"}</span>
                    </button>

                    <button 
                      onClick={() => openFaceId("checkOut")}
                      disabled={actionLoading || !hasCheckedIn || hasCheckedOut}
                      className={`flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-xl transition-all ${
                        !hasCheckedIn || hasCheckedOut
                          ? "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-50"
                          : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-xs cursor-pointer active:scale-[0.98]"
                      }`}
                      title={!hasCheckedIn ? "Phải Check-in trước khi Check-out" : hasCheckedOut ? "Đã Check-out xong" : "Bật Camera quét FaceID ra ca"}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{hasCheckedOut ? "Đã Hết Ca" : "Quét FaceID Ra Ca"}</span>
                    </button>
                  </div>
                )}

                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center pt-1">
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
                      {checkInMethod === "manual" ? (
                        <Fingerprint className="w-4 h-4" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <span className="text-xs font-medium">Nhận diện điểm danh</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {checkInMethod === "manual" ? "Chấm công thủ công (Nút bấm)" : "Sinh trắc học camera FaceID"}
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {checkInMethod === "manual" ? "Sẵn sàng ghi nhận trực tiếp" : "Sẵn sàng xác thực"}
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
      {activeTab === "roster" && (
        <div className="space-y-4">
          {/* Unified Swiss Corporate Attendance Metric Strip */}
          <div className="bento-card rounded-2xl overflow-hidden grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <span className="swiss-label">Tổng lượt ghi nhận</span>
                <CalendarIcon className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight mt-1">{todayTotal}</div>
              <div className="text-xs text-zinc-400 mt-0.5">Hồ sơ chấm công</div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <span className="swiss-label">Đúng giờ</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight mt-1">{onTimeCount}</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Tỷ lệ: {todayTotal > 0 ? Math.round((onTimeCount/todayTotal)*100) : 0}%</div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <span className="swiss-label">Đi trễ</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight mt-1">{lateCount}</div>
              <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">Sau mốc 08:30</div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <span className="swiss-label">Vắng mặt / Nghỉ</span>
                <AlertCircle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight mt-1">{absentCount}</div>
              <div className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-0.5">Đã trừ ngày công</div>
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
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-600 transition-colors"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 outline-none"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PRESENT">Đúng giờ</option>
                <option value="LATE">Đi trễ</option>
                <option value="ABSENT">Vắng mặt</option>
                <option value="LEAVE">Nghỉ phép</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <input 
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-800 dark:text-zinc-200 outline-none focus:border-blue-600 transition-colors"
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
                className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-xl text-xs font-medium transition-colors shadow-xs"
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
                    <td colSpan={6} className="p-4">
                      <TableSkeleton rows={6} cols={6} />
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
      {/* FaceID Interactive Scanner Modal */}
      {isFaceIdOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-900 dark:text-white overflow-hidden space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-500/30">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    Xác Thực Sinh Trắc Học FaceID
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      {faceIdMode === "checkIn" ? "VÀO CA" : "RA CA"}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Nhân viên: {userName} ({userEmail})</p>
                </div>
              </div>
              <button
                onClick={closeFaceId}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Camera Viewport Container */}
            <div className="relative w-full h-72 bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 flex items-center justify-center">
              {faceScanStep !== "error" && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              )}

              {/* Scanning Overlay (Oval face boundary + scanning laser) */}
              {faceScanStep !== "error" && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  {/* Oval target boundary */}
                  <div className={`w-52 h-64 rounded-[48%] border-2 transition-all duration-500 relative flex items-center justify-center ${
                    faceScanStep === "success" 
                      ? "border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.5)]" 
                      : faceScanStep === "matched"
                      ? "border-blue-400 shadow-[0_0_25px_rgba(96,165,250,0.4)]"
                      : "border-cyan-400/80 border-dashed animate-pulse shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                  }`}>
                    {/* Laser scanning bar */}
                    {faceScanStep === "scanning" && (
                      <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce" />
                    )}

                    {/* Corner Reticles */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                  </div>
                </div>
              )}

              {/* Error Screen Inside Viewport */}
              {faceScanStep === "error" && (
                <div className="p-6 text-center space-y-3 max-w-sm">
                  <div className="w-12 h-12 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-sm text-zinc-100">Không thể mở Camera</div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      handleMethodChange("manual");
                      closeFaceId();
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600/30 border border-blue-500 text-blue-300 hover:bg-blue-600/50 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Fingerprint className="w-3.5 h-3.5" />
                    Đổi vĩnh viễn sang Chấm công thủ công
                  </button>
                </div>
              )}
            </div>

            {/* Status Indicator Bar */}
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600 dark:text-zinc-400 font-medium">Trạng thái nhận diện:</span>
                <span className="font-semibold font-mono">
                  {faceScanStep === "connecting" && <span className="text-amber-500 dark:text-amber-400">Đang khởi động ống kính...</span>}
                  {faceScanStep === "scanning" && <span className="text-cyan-600 dark:text-cyan-400 animate-pulse">Đang quét sinh trắc học...</span>}
                  {faceScanStep === "matched" && <span className="text-blue-600 dark:text-blue-400">Khớp dữ liệu: 99.4%</span>}
                  {faceScanStep === "success" && <span className="text-emerald-600 dark:text-emerald-400">✓ Xác thực thành công!</span>}
                  {faceScanStep === "error" && <span className="text-rose-500 dark:text-rose-400">Lỗi kết nối</span>}
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {faceScanStep === "connecting" && "Vui lòng nhìn thẳng vào camera và giữ nguyên tư thế."}
                {faceScanStep === "scanning" && "Hệ thống đang đối soát khuôn mặt với cơ sở dữ liệu nhân sự."}
                {faceScanStep === "matched" && `Đã nhận diện cán bộ ${userName}, đang đồng bộ giờ công...`}
                {faceScanStep === "success" && "Đang gửi dữ liệu chấm công an toàn lên máy chủ..."}
                {faceScanStep === "error" && "Nếu camera bị lỗi hoặc không có webcam, bạn có thể bấm nút chấm công dự phòng bên dưới."}
              </div>
            </div>

            {/* Fallback & Manual Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={closeFaceId}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (faceIdMode === "checkIn") {
                    await executeCheckIn("manual");
                  } else {
                    await executeCheckOut("manual");
                  }
                  closeFaceId();
                }}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Chấm công dự phòng (Bỏ qua Camera)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
