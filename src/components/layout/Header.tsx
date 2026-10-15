"use client";

import { 
  LogOut, Bell, Search, Moon, Sun, AlertTriangle, FileText, 
  Banknote, Target, ArrowRight, Menu, User, Sparkles, KeyRound, X, Phone, ShieldCheck 
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  time: string;
  icon: any;
  href: string;
  read: boolean;
}

const fallbackNotifications: NotificationItem[] = [
  {
    id: 101,
    title: "Hợp đồng lao động cần rà soát",
    desc: "Kiểm tra danh sách hợp đồng sắp đến hạn gia hạn trong 30 ngày tới.",
    time: "Cảnh báo pháp lý",
    icon: AlertTriangle,
    href: "/dashboard/contracts",
    read: false
  },
  {
    id: 102,
    title: "Bảng tính lương & Quyết toán",
    desc: "Theo dõi trạng thái khóa sổ lương và phiếu lương tháng hiện hành.",
    time: "Kỳ lương hiện hành",
    icon: Banknote,
    href: "/dashboard/payroll",
    read: false
  },
  {
    id: 103,
    title: "Đánh giá hiệu suất & Cổng ESS",
    desc: "Hoàn thành đánh giá KPI quý và kiểm tra ngày công tại Cổng cá nhân.",
    time: "Hệ thống trực tuyến",
    icon: Target,
    href: "/dashboard/my-workspace",
    read: false
  }
];

export default function Header({ session }: { session: any }) {
  const user = session?.user;
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [secForm, setSecForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "", phone: "" });
  const [secLoading, setSecLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(fallbackNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [employeeIndex, setEmployeeIndex] = useState<any[]>([]);
  const [decisionIndex, setDecisionIndex] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const quickNavLinks = [
    { label: "Tổng quan Điều hành", href: "/dashboard", keywords: "dashboard tong quan dieu hanh" },
    { label: "Khu vực cá nhân (ESS)", href: "/dashboard/my-workspace", keywords: "ca nhan ess my workspace phieu luong" },
    { label: "Hồ sơ Nhân sự", href: "/dashboard/employees", keywords: "nhan vien ho so employees danh ba" },
    { label: "Hợp đồng Lao động", href: "/dashboard/contracts", keywords: "hop dong lao dong contracts" },
    { label: "Cơ cấu Tổ chức & Phòng ban", href: "/dashboard/departments", keywords: "phong ban co cau to chuc departments" },
    { label: "Biến động Nhân sự", href: "/dashboard/personnel-changes", keywords: "bien dong bo nhiem dieu chuyen quyet dinh" },
    { label: "Chấm công & Điểm danh", href: "/dashboard/attendance", keywords: "cham cong diem danh attendance" },
    { label: "Đơn từ & Nghỉ phép", href: "/dashboard/leave", keywords: "nghi phep don tu leave" },
    { label: "Bảng lương & Đãi ngộ", href: "/dashboard/payroll", keywords: "bang luong payroll thu nhap" },
    { label: "Danh mục Phụ cấp & Khấu trừ", href: "/dashboard/payroll/components", keywords: "phu cap khau tru thanh phan luong" },
    { label: "Đánh giá Hiệu suất KPI", href: "/dashboard/performance", keywords: "kpi hieu suat danh gia performance" },
    { label: "Tuyển dụng & Ứng viên", href: "/dashboard/recruitment", keywords: "tuyen dung ung vien recruitment" },
    { label: "Đào tạo & Khảo sát", href: "/dashboard/training-surveys", keywords: "dao tao khao sat enps training" },
    { label: "Quy hoạch Cán bộ", href: "/dashboard/cadre-planning", keywords: "quy hoach can bo ke nhiem 9box" },
    { label: "Quy trình SOP & Nhật ký Kiểm toán", href: "/dashboard/audit-workflow", keywords: "kiem toan audit log sop workflow" },
    { label: "Quản lý Vai trò & Phân quyền RBAC", href: "/dashboard/roles", keywords: "vai tro phan quyen rbac roles" },
    { label: "Sổ tay Nghiệp vụ (HDSD)", href: "/dashboard/guide", keywords: "so tay huong dan su dung guide" },
    { label: "Cổng Tuyển dụng Công khai", href: "/careers", keywords: "careers viec lam cong tuyen dung" },
  ];

  const q = searchQuery.trim().toLowerCase();

  const matchedNavLinks = q
    ? quickNavLinks.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.keywords.includes(q)
      )
    : [];

  const matchedEmployees = q
    ? employeeIndex
        .filter((emp) => {
          const name = (emp.user?.name || "").toLowerCase();
          const email = (emp.user?.email || "").toLowerCase();
          const pos = (emp.position || "").toLowerCase();
          const dept = (emp.department?.name || "").toLowerCase();
          return name.includes(q) || email.includes(q) || pos.includes(q) || dept.includes(q);
        })
        .slice(0, 5)
    : [];

  const matchedDecisions = q
    ? decisionIndex
        .filter((dec) => {
          const code = (dec.code || "").toLowerCase();
          const empName = (dec.employeeName || "").toLowerCase();
          return code.includes(q) || empName.includes(q);
        })
        .slice(0, 3)
    : [];

  useEffect(() => {
    setMounted(true);

    let savedReadIds: number[] = [];
    try {
      const raw = localStorage.getItem("hrmis_read_notifications");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) savedReadIds = parsed;
      }
    } catch {}

    const fetchLiveOperationalData = async () => {
      try {
        const [leaveRes, contractRes, payrollRes, empRes, changeRes] = await Promise.allSettled([
          fetch("/api/leave"),
          fetch("/api/contracts"),
          fetch("/api/payroll"),
          fetch("/api/employees"),
          fetch("/api/personnel-changes"),
        ]);

        const liveItems: NotificationItem[] = [];

        if (leaveRes.status === "fulfilled" && leaveRes.value.ok) {
          const leaves = await leaveRes.value.json();
          if (Array.isArray(leaves)) {
            const pendingCount = leaves.filter((l: any) => l.status === "PENDING").length;
            if (pendingCount > 0) {
              liveItems.push({
                id: 201,
                title: "Đơn nghỉ phép chờ phê duyệt",
                desc: `Hiện có ${pendingCount} đơn xin nghỉ phép đang ở trạng thái chờ duyệt.`,
                time: "Dữ liệu thời gian thực",
                icon: FileText,
                href: "/dashboard/leave",
                read: savedReadIds.includes(201),
              });
            }
          }
        }

        if (changeRes.status === "fulfilled" && changeRes.value.ok) {
          const changes = await changeRes.value.json();
          if (Array.isArray(changes)) {
            setDecisionIndex(changes);
            const pendingDecisions = changes.filter((c: any) => c.status === "PENDING").length;
            if (pendingDecisions > 0) {
              liveItems.push({
                id: 206,
                title: "Quyết định nhân sự chờ phê duyệt",
                desc: `Có ${pendingDecisions} tờ trình quyết định bổ nhiệm/điều chuyển đang chờ duyệt.`,
                time: "Trình ký lãnh đạo",
                icon: ShieldCheck,
                href: "/dashboard/personnel-changes",
                read: savedReadIds.includes(206),
              });
            }
          }
        }

        if (contractRes.status === "fulfilled" && contractRes.value.ok) {
          const contracts = await contractRes.value.json();
          if (Array.isArray(contracts)) {
            const expiringCount = contracts.filter(
              (c: any) => c.status === "EXPIRING_SOON" || c.status === "EXPIRED"
            ).length;
            if (expiringCount > 0) {
              liveItems.push({
                id: 202,
                title: "Cảnh báo hạn Hợp đồng lao động",
                desc: `Có ${expiringCount} hợp đồng sắp hết hạn (≤ 30 ngày) hoặc quá hạn cần xử lý.`,
                time: "Cảnh báo pháp lý",
                icon: AlertTriangle,
                href: "/dashboard/contracts",
                read: savedReadIds.includes(202),
              });
            }
          }
        }

        if (payrollRes.status === "fulfilled" && payrollRes.value.ok) {
          const payrolls = await payrollRes.value.json();
          if (Array.isArray(payrolls)) {
            const draftCount = payrolls.filter(
              (p: any) => p.status === "DRAFT" || p.status === "PENDING_APPROVAL"
            ).length;
            if (draftCount > 0) {
              liveItems.push({
                id: 203,
                title: "Phiếu lương chờ duyệt chi",
                desc: `Có ${draftCount} bản ghi lương đang ở trạng thái nháp hoặc chờ phê duyệt.`,
                time: "Kỳ lương hiện hành",
                icon: Banknote,
                href: "/dashboard/payroll",
                read: savedReadIds.includes(203),
              });
            } else if (payrolls.length > 0) {
              liveItems.push({
                id: 204,
                title: "Bảng lương đã cập nhật",
                desc: `Hệ thống đang lưu trữ ${payrolls.length} phiếu lương kỳ hiện hành.`,
                time: "Đã đồng bộ",
                icon: Banknote,
                href: "/dashboard/payroll",
                read: savedReadIds.includes(204),
              });
            }
          }
        }

        liveItems.push({
          id: 205,
          title: "Cổng thông tin cá nhân (ESS)",
          desc: "Tra cứu phiếu lương, chấm công GPS và quỹ phép năm trực tuyến.",
          time: "Hệ thống trực tuyến",
          icon: Target,
          href: "/dashboard/my-workspace",
          read: savedReadIds.includes(205),
        });

        setNotifications(liveItems);

        if (empRes.status === "fulfilled" && empRes.value.ok) {
          const emps = await empRes.value.json();
          if (Array.isArray(emps)) {
            setEmployeeIndex(emps);
          }
        }
      } catch {
        setNotifications((prev) =>
          prev.map((n) => (savedReadIds.includes(n.id) ? { ...n, read: true } : n))
        );
      }
    };

    fetchLiveOperationalData();

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchDropdown(true);
      } else if (event.key === "Escape") {
        setShowSearchDropdown(false);
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const toggleDarkMode = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const persistReadNotifications = (updated: NotificationItem[]) => {
    try {
      const readIds = updated.filter((n) => n.read).map((n) => n.id);
      localStorage.setItem("hrmis_read_notifications", JSON.stringify(readIds));
    } catch {}
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    persistReadNotifications(updated);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    const updated = notifications.map((n) => (n.id === item.id ? { ...n, read: true } : n));
    setNotifications(updated);
    persistReadNotifications(updated);
    setShowNotif(false);
    router.push(item.href);
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (secForm.newPassword && secForm.newPassword !== secForm.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp với mật khẩu mới.");
      return;
    }
    setSecLoading(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: secForm.currentPassword || undefined,
          newPassword: secForm.newPassword || undefined,
          phone: secForm.phone.trim() ? secForm.phone.trim() : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Không thể cập nhật thông tin bảo mật.");
      }
      alert(data.message || "Đã cập nhật mật khẩu & thông tin liên hệ thành công!");
      setShowSecurityModal(false);
      setSecForm({ currentPassword: "", newPassword: "", confirmPassword: "", phone: "" });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSecLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSearchDropdown(false);
    if (matchedNavLinks.length > 0) {
      router.push(matchedNavLinks[0].href);
    } else {
      router.push(`/dashboard/employees?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "BOD":
        return "bg-zinc-900 text-white border-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-300";
      case "ACCOUNTANT":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900";
      case "HR":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900";
      case "MANAGER":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900";
      case "SYSTEM_ADMIN":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header className="h-16 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-colors duration-200 no-print gap-3">
      <div className="flex items-center gap-2.5 flex-1 max-w-md" ref={searchRef}>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("hrmis:toggle-mobile-sidebar"))}
          className="lg:hidden w-9 h-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 transition-all shrink-0"
          title="Mở danh mục điều hướng"
          aria-label="Mở menu điều hướng"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onFocus={() => setShowSearchDropdown(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            className="w-full pl-9 pr-12 py-1.5 bg-zinc-100/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all shadow-2xs"
            placeholder="Tìm nhân sự, phòng ban, phân hệ (⌘K)..."
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 hidden sm:flex items-center pointer-events-none">
            <span className="font-mono text-[10px] text-zinc-400 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded-md shadow-2xs">
              ⌘K
            </span>
          </div>

          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden z-50 text-xs max-h-96 overflow-y-auto animate-swiss-in">
              {searchQuery.trim() ? (
                <>
                  {matchedNavLinks.length > 0 && (
                    <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        Phân hệ chức năng
                      </div>
                      {matchedNavLinks.map((item) => (
                        <button
                          key={item.href}
                          type="button"
                          onClick={() => {
                            setShowSearchDropdown(false);
                            setSearchQuery("");
                            router.push(item.href);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-between"
                        >
                          <span className="font-medium">{item.label}</span>
                          <ArrowRight className="w-3 h-3 text-zinc-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  {matchedEmployees.length > 0 && (
                    <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        Nhân sự khớp từ khóa ({matchedEmployees.length})
                      </div>
                      {matchedEmployees.map((emp) => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => {
                            setShowSearchDropdown(false);
                            const targetName = emp.user?.name || emp.user?.email || "";
                            setSearchQuery("");
                            router.push(`/dashboard/employees?search=${encodeURIComponent(targetName)}`);
                          }}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {emp.user?.name}
                              </div>
                              <div className="text-[10px] text-zinc-500 truncate">
                                {emp.position || "Chuyên viên"} • {emp.department?.name || "Nexustech"}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 shrink-0">
                            Hồ sơ →
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchedDecisions.length > 0 && (
                    <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        Quyết định nhân sự ({matchedDecisions.length})
                      </div>
                      {matchedDecisions.map((dec) => (
                        <button
                          key={dec.id}
                          type="button"
                          onClick={() => {
                            setShowSearchDropdown(false);
                            setSearchQuery("");
                            router.push("/dashboard/personnel-changes");
                          }}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-between gap-2"
                        >
                          <div className="truncate">
                            <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                              {dec.code?.replace("Q?-", "QĐ-")} • {dec.employeeName}
                            </div>
                            <div className="text-[10px] text-zinc-500 truncate">
                              {dec.fromPosition} → {dec.toPosition} ({dec.toDept})
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 shrink-0">
                            Quyết định →
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold flex items-center justify-between"
                  >
                    <span>Tra cứu danh bạ nhân sự: &ldquo;{searchQuery.trim()}&rdquo;</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div className="p-2 space-y-1">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Lệnh điều hành nhanh (Command Palette)
                  </div>
                  {quickNavLinks.slice(0, 5).map((item) => (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => {
                        setShowSearchDropdown(false);
                        router.push(item.href);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="w-3 h-3 text-zinc-400" />
                    </button>
                  ))}
                  <div className="pt-1 mt-1 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        toggleDarkMode();
                        setShowSearchDropdown(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-blue-600 dark:text-blue-400 font-medium flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Chuyển đổi chế độ Sáng / Tối
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">Theme</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 transition-all shadow-2xs"
          title={isDark ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotif(!showNotif)}
            className={`w-9 h-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center transition-all shadow-2xs relative ${
              showNotif
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300"
            }`}
            title="Thông báo tác nghiệp thời gian thực"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute top-full right-0 mt-2.5 w-80 sm:w-88 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xl overflow-hidden animate-swiss-in origin-top-right z-50">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Thông báo tác nghiệp
                  </span>
                </div>
                {unreadCount > 0 ? (
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full font-semibold border border-blue-200/60 dark:border-blue-900/60">
                    {unreadCount} mới
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-400 font-medium">Đã xem hết</span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors flex gap-3 cursor-pointer ${
                      !n.read ? "bg-blue-50/30 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    <div className="mt-0.5 w-8 h-8 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 shadow-2xs">
                      <n.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {n.title}
                        </h4>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {n.desc}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-[10px]">
                        <span className="text-zinc-400 font-mono">{n.time}</span>
                        <span className="text-blue-600 dark:text-blue-400 flex items-center gap-0.5 font-semibold">
                          Xem chi tiết <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-4 bg-zinc-50/70 dark:bg-zinc-900/40">
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium"
                >
                  Đánh dấu đã đọc
                </button>
                <Link
                  href="/dashboard/my-workspace"
                  onClick={() => setShowNotif(false)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Cổng cá nhân →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5 hidden sm:block"></div>

        <Link
          href="/dashboard/my-workspace"
          className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition-all"
          title="Không gian cá nhân (ESS)"
        >
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">
              {user?.name || "Người dùng"}
            </span>
            <span
              className={`text-[10px] font-semibold mt-1 px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(
                user?.roleName
              )}`}
            >
              {user?.roleName || "Nhân viên"}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white text-xs font-extrabold uppercase shadow-xs">
            {initials}
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setShowSecurityModal(true)}
          className="w-9 h-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-950/40 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-2xs"
          title="Đổi mật khẩu & Cập nhật SĐT liên hệ"
        >
          <KeyRound className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-9 h-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all shadow-2xs"
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {showSecurityModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowSecurityModal(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Bảo mật Tài khoản & Liên hệ (ESS)
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono">{user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSecurityModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSecuritySubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Số điện thoại liên hệ mới (Tùy chọn)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="tel"
                    placeholder="VD: 0912 345 678 (Bỏ trống nếu không đổi)"
                    value={secForm.phone}
                    onChange={(e) => setSecForm({ ...secForm, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Thay đổi mật khẩu đăng nhập
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu đang sử dụng..."
                    value={secForm.currentPassword}
                    onChange={(e) => setSecForm({ ...secForm, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Mật khẩu mới (≥ 6 ký tự)
                    </label>
                    <input
                      type="password"
                      placeholder="Mật khẩu mới"
                      value={secForm.newPassword}
                      onChange={(e) => setSecForm({ ...secForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Nhập lại mật khẩu mới
                    </label>
                    <input
                      type="password"
                      placeholder="Xác nhận mật khẩu"
                      value={secForm.confirmPassword}
                      onChange={(e) => setSecForm({ ...secForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSecurityModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={secLoading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50"
                >
                  {secLoading ? "Đang lưu..." : "Lưu bảo mật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}