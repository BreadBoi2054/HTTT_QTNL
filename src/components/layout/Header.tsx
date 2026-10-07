"use client";

import { 
  LogOut, Bell, Search, Moon, Sun, X, CheckCircle2, MessageSquare, 
  AlertTriangle, FileText, Banknote, Target, ArrowRight, Sparkles 
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  time: string;
  icon: any;
  href: string;
  read: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "Hợp đồng lao động sắp hết hạn",
    desc: "03 nhân sự phòng Kỹ thuật sắp đến hạn hợp đồng trong 30 ngày tới.",
    time: "10 phút trước",
    icon: AlertTriangle,
    href: "/dashboard/contracts",
    read: false
  },
  {
    id: 2,
    title: "Kỳ tính lương mới đã tạo",
    desc: "Bảng tính lương tháng 10 đã hoàn tất duyệt chi.",
    time: "1 giờ trước",
    icon: Banknote,
    href: "/dashboard/payroll",
    read: false
  },
  {
    id: 3,
    title: "Đợt đánh giá hiệu suất Q4",
    desc: "Vui lòng hoàn thành tự đánh giá KPI trước ngày 15.",
    time: "3 giờ trước",
    icon: Target,
    href: "/dashboard/performance",
    read: false
  },
  {
    id: 4,
    title: "Ứng viên tiếp nhận nhân sự",
    desc: "02 ứng viên mới đã hoàn tất tiếp nhận nhân sự.",
    time: "Hôm qua",
    icon: MessageSquare,
    href: "/dashboard/recruitment",
    read: true
  }
];

export default function Header({ session }: { session: any }) {
  const user = session?.user;
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications(notifications.map(n => n.id === item.id ? { ...n, read: true } : n));
    setShowNotif(false);
    router.push(item.href);
  };

  // Màu sắc phân biệt vai trò
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "SYSTEM_ADMIN":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900";
      case "MANAGER":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900";
      case "HR":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900";
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : "U";

  return (
    <header className="h-16 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-200">
      
      {/* Search Input Bar */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          </div>
          <input
            type="text"
            className="w-full pl-9 pr-12 py-1.5 bg-zinc-100/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all shadow-2xs"
            placeholder="Tìm kiếm nhân viên, phòng ban, phân hệ..."
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <span className="font-mono text-[10px] text-zinc-400 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded-md shadow-2xs">⌘K</span>
          </div>
        </div>
      </div>

      {/* Right Action Icons & User Monogram */}
      <div className="flex items-center gap-2.5">
        
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 transition-all shadow-2xs"
          title={isDark ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
        </button>

        {/* Notifications Hub */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotif(!showNotif)}
            className={`w-9 h-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center transition-all shadow-2xs relative ${showNotif ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300'}`}
            title="Thông báo hệ thống"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute top-full right-0 mt-2.5 w-88 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xl overflow-hidden animate-swiss-in origin-top-right z-50">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Thông báo tác nghiệp</span>
                </div>
                {unreadCount > 0 ? (
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full font-semibold border border-blue-200/60 dark:border-blue-900/60">
                    {unreadCount} chưa đọc
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-400 font-medium">Đã cập nhật hết</span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors flex gap-3 cursor-pointer ${!n.read ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''}`}
                  >
                    <div className="mt-0.5 w-8 h-8 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 shadow-2xs">
                      <n.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{n.title}</h4>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{n.desc}</p>
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
        
        <div className="h-5 w-px bg-zinc-200 dark:border-zinc-800 mx-1"></div>
        
        {/* User Monogram & Info */}
        <Link 
          href="/dashboard/my-workspace" 
          className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition-all" 
          title="Không gian cá nhân"
        >
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">
              {user?.name || "Người dùng"}
            </span>
            <span className={`text-[10px] font-semibold mt-1 px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(user?.roleName)}`}>
              {user?.roleName || "Nhân viên"}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold uppercase shadow-xs">
            {initials}
          </div>
        </Link>

        {/* Logout Button */}
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-9 h-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all shadow-2xs"
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
