"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Banknote, 
  Settings,
  Fingerprint,
  ShieldCheck,
  Briefcase,
  FileText,
  Network,
  ArrowLeftRight,
  GraduationCap,
  Award,
  BookOpen,
  UserCheck,
  FileSignature,
  Target,
  PanelLeftClose,
  PanelLeftOpen,
  X
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  roles: string[];
  badge?: string;
  badgeColor?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "Không gian làm việc",
    items: [
      { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard, roles: ["BOD", "SYSTEM_ADMIN", "ACCOUNTANT", "HR", "MANAGER", "USER"] },
      { name: "Cổng cá nhân (ESS)", href: "/dashboard/my-workspace", icon: UserCheck, roles: ["BOD", "SYSTEM_ADMIN", "ACCOUNTANT", "HR", "MANAGER", "USER"], badge: "Cá nhân", badgeColor: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60" },
      { name: "Sổ tay nghiệp vụ", href: "/dashboard/guide", icon: BookOpen, roles: ["BOD", "SYSTEM_ADMIN", "ACCOUNTANT", "HR", "MANAGER", "USER"], badge: "HDSD", badgeColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60" },
    ]
  },
  {
    title: "Danh mục phân hệ",
    items: [
      { name: "Cơ cấu tổ chức", href: "/dashboard/departments", icon: Network, roles: ["BOD", "SYSTEM_ADMIN", "HR", "MANAGER"] },
      { name: "Tuyển dụng", href: "/dashboard/recruitment", icon: Briefcase, roles: ["BOD", "SYSTEM_ADMIN", "HR", "MANAGER"] },
      { name: "Hồ sơ nhân sự", href: "/dashboard/employees", icon: Users, roles: ["BOD", "SYSTEM_ADMIN", "HR", "MANAGER"] },
      { name: "Hợp đồng lao động", href: "/dashboard/contracts", icon: FileSignature, roles: ["BOD", "SYSTEM_ADMIN", "ACCOUNTANT", "HR", "MANAGER"], badge: "Pháp lý" },
      { name: "Bảng tính lương", href: "/dashboard/payroll", icon: Banknote, roles: ["BOD", "SYSTEM_ADMIN", "ACCOUNTANT", "HR", "MANAGER", "USER"] },
      { name: "Đánh giá hiệu suất", href: "/dashboard/performance", icon: Target, roles: ["BOD", "SYSTEM_ADMIN", "HR", "MANAGER", "USER"] },
      { name: "Biến động nhân sự", href: "/dashboard/personnel-changes", icon: ArrowLeftRight, roles: ["BOD", "SYSTEM_ADMIN", "HR", "MANAGER"] },
      { name: "Đào tạo & Khảo sát", href: "/dashboard/training-surveys", icon: GraduationCap, roles: ["BOD", "SYSTEM_ADMIN", "HR", "MANAGER", "USER"] },
      { name: "Quy hoạch cán bộ", href: "/dashboard/cadre-planning", icon: Award, roles: ["BOD", "SYSTEM_ADMIN", "HR", "MANAGER"] },
      { name: "Quy trình & Kiểm toán", href: "/dashboard/audit-workflow", icon: ShieldCheck, roles: ["BOD", "SYSTEM_ADMIN", "ACCOUNTANT", "HR", "MANAGER"] },
    ]
  },
  {
    title: "Cá nhân & Đơn từ",
    items: [
      { name: "Chấm công", href: "/dashboard/attendance", icon: Clock, roles: ["BOD", "SYSTEM_ADMIN", "ACCOUNTANT", "HR", "MANAGER", "USER"] },
      { name: "Nghỉ phép", href: "/dashboard/leave", icon: FileText, roles: ["BOD", "SYSTEM_ADMIN", "ACCOUNTANT", "HR", "MANAGER", "USER"] },
    ]
  },
  {
    title: "Quản trị hệ thống",
    items: [
      { name: "Vai trò & Phân quyền", href: "/dashboard/roles", icon: ShieldCheck, roles: ["SYSTEM_ADMIN", "BOD"] },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.roleName || "USER";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hrmis_sidebar_collapsed");
      if (saved === "true") {
        setIsCollapsed(true);
      }
    } catch {}

    const handleToggleMobile = () => {
      setMobileOpen((prev) => !prev);
    };

    window.addEventListener("hrmis:toggle-mobile-sidebar", handleToggleMobile);
    return () => {
      window.removeEventListener("hrmis:toggle-mobile-sidebar", handleToggleMobile);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("hrmis_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const compact = isCollapsed && !mobileOpen;

  return (
    <>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden no-print transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "folio-sidebar h-dvh bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800/80 flex-col transition-all duration-200 select-none no-print shrink-0",
          mobileOpen
            ? "fixed inset-y-0 left-0 z-50 w-64 flex shadow-2xl"
            : "hidden lg:flex z-20",
          !mobileOpen && (isCollapsed ? "w-16" : "w-64")
        )}
      >
        <div
          className={cn(
            "h-16 flex items-center border-b border-zinc-200/80 dark:border-zinc-800/80",
            compact ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group min-w-0"
            title="Trang chủ điều hành NEXUSTECH"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Fingerprint className="w-4.5 h-4.5" />
            </div>
            {!compact && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                    NEXUSTECH
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                </div>
                <span className="text-[10px] block text-zinc-500 dark:text-zinc-400 font-medium truncate">
                  Quản trị Nguồn nhân lực
                </span>
              </div>
            )}
          </Link>

          {!compact && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleCollapse}
                className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Thu gọn thanh điều hướng"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Đóng menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className={cn("flex-1 overflow-y-auto py-4", compact ? "px-2 space-y-3" : "px-3 space-y-5")}>
          {menuSections.map((section) => {
            const visibleItems = section.items.filter((item) => item.roles.includes(userRole));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                {!compact ? (
                  <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-3 mb-1.5">
                    {section.title}
                  </div>
                ) : (
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800/80 mx-2 my-1.5" />
                )}

                {visibleItems.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      title={item.name}
                      data-active={isActive}
                      className={cn(
                        "flex items-center rounded-lg text-xs font-medium transition-colors group relative",
                        compact ? "justify-center p-2.5" : "justify-between px-3 py-2",
                        isActive
                          ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-l-2 border-blue-600 dark:border-blue-500 shadow-2xs"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-zinc-100"
                      )}
                    >
                      <div className={cn("flex items-center truncate", compact ? "justify-center" : "gap-2.5")}>
                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0",
                            isActive
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                          )}
                        />
                        {!compact && <span className="truncate">{item.name}</span>}
                      </div>

                      {!compact && item.badge && (
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                            isActive
                              ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                              : item.badgeColor ||
                                  "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="p-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-1.5 bg-zinc-50/50 dark:bg-zinc-900/40">
          {compact && (
            <button
              type="button"
              onClick={toggleCollapse}
              className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
              title="Mở rộng thanh điều hướng"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}

          {userRole === "SYSTEM_ADMIN" && (
            <Link
              href="/dashboard/settings"
              title="Cài đặt hệ thống"
              className={cn(
                "flex items-center rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 shadow-2xs group",
                compact ? "justify-center p-2" : "gap-2.5 px-3 py-1.5"
              )}
            >
              <Settings className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-600 transition-colors shrink-0" />
              {!compact && <span>Cài đặt hệ thống</span>}
            </Link>
          )}

          {!compact ? (
            <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Hệ thống trực tuyến
              </span>
              <span className="text-[10px] font-mono bg-zinc-200/60 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400 font-semibold">
                HRMIS 2026
              </span>
            </div>
          ) : (
            <div className="flex justify-center py-1" title="Hệ thống trực tuyến • HRMIS 2026">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
