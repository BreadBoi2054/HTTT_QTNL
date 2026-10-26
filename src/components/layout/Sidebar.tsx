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
  X,
  type LucideIcon
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getChicletStyle(href: string, isActive: boolean): string {
  if (isActive) {
    return "bg-[#1b6c80] dark:bg-[#0ea5e9] text-white dark:text-[#081018] border-[#1b6c80] dark:border-[#38bdf8] shadow-2xs";
  }
  if (href === "/dashboard" || href.includes("my-workspace") || href.includes("guide")) {
    return "bg-[#e5e2dc]/80 dark:bg-[#1e2b40] text-[#3d3a35] dark:text-[#e2e8f0] border-[#d6d2c9] dark:border-[#364966]";
  }
  if (href.includes("payroll") || href.includes("contracts")) {
    return "bg-teal-50/90 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-200/80 dark:border-teal-700/80";
  }
  if (href.includes("employees") || href.includes("departments") || href.includes("recruitment") || href.includes("personnel-changes")) {
    return "bg-amber-50/90 dark:bg-amber-950/75 text-amber-900 dark:text-amber-300 border-amber-200/80 dark:border-amber-700/75";
  }
  if (href.includes("performance") || href.includes("training") || href.includes("cadre")) {
    return "bg-stone-200/75 dark:bg-indigo-950/75 text-stone-800 dark:text-indigo-200 border-stone-300/80 dark:border-indigo-700/75";
  }
  return "bg-emerald-50/80 dark:bg-emerald-950/75 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-700/75";
}

interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
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
      { name: "Cổng cá nhân", href: "/dashboard/my-workspace", icon: UserCheck, roles: ["BOD", "SYSTEM_ADMIN", "ACCOUNTANT", "HR", "MANAGER", "USER"], badge: "ESS" },
      { name: "Sổ tay nghiệp vụ", href: "/dashboard/guide", icon: BookOpen, roles: ["BOD", "SYSTEM_ADMIN", "ACCOUNTANT", "HR", "MANAGER", "USER"], badge: "HDSD" },
    ]
  },
  {
    title: "Danh mục phân hệ",
    items: [
      { name: "Cơ cấu tổ chức", href: "/dashboard/departments", icon: Network, roles: ["BOD", "SYSTEM_ADMIN", "HR", "MANAGER"] },
      { name: "Tuyển dụng", href: "/dashboard/recruitment", icon: Briefcase, roles: ["BOD", "SYSTEM_ADMIN", "HR", "MANAGER"] },
      { name: "Hồ sơ nhân sự", href: "/dashboard/employees", icon: Users, roles: ["BOD", "SYSTEM_ADMIN", "HR", "MANAGER"] },
      { name: "Hợp đồng lao động", href: "/dashboard/contracts", icon: FileSignature, roles: ["BOD", "SYSTEM_ADMIN", "ACCOUNTANT", "HR", "MANAGER"] },
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
  const userRole = (session?.user as { roleName?: string } | undefined)?.roleName || "USER";

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("hrmis_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);
  const mobileOpen = mobileOpenPath === pathname;

  useEffect(() => {
    const handleToggleMobile = () => {
      setMobileOpenPath((prev) => (prev === pathname ? null : pathname));
    };

    window.addEventListener("hrmis:toggle-mobile-sidebar", handleToggleMobile);
    return () => {
      window.removeEventListener("hrmis:toggle-mobile-sidebar", handleToggleMobile);
    };
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
          onClick={() => setMobileOpenPath(null)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden no-print transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "folio-sidebar h-dvh bg-[#efede8] dark:bg-[#0b0f17] flex-col transition-[width] duration-200 select-none no-print shrink-0",
          mobileOpen
            ? "fixed inset-y-0 left-0 z-50 w-[236px] flex border-r border-[#e6e8eb] dark:border-[#263447]"
            : "hidden lg:flex z-20",
          !mobileOpen && (isCollapsed ? "w-16" : "w-[232px]")
        )}
      >
        <div
          className={cn(
            "h-12 flex items-center",
            compact ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group min-w-0"
            title="Hệ thống Quản trị Nhân lực & Tiền lương Nexustech"
          >
            <div className="w-7 h-7 rounded-md bg-[#1b6c80] dark:bg-[#0ea5e9] text-white dark:text-[#081018] flex items-center justify-center shrink-0 font-bold text-xs tracking-tight">
              NX
            </div>
            {!compact && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold tracking-tight text-[#131416] dark:text-[#f8fafc] truncate">
                    Nexustech
                  </span>
                  <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded bg-[#e6e8eb]/80 dark:bg-[#1e2b40] text-[#434648] dark:text-[#38bdf8] border border-transparent dark:border-[#334663]">
                    HRIS
                  </span>
                </div>
              </div>
            )}
          </Link>

          {!compact && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleCollapse}
                className="hidden lg:flex w-7 h-7 rounded-md items-center justify-center text-[#5d5f60] dark:text-[#94a3b8] hover:text-[#131416] dark:hover:text-white hover:bg-[#ebedef] dark:hover:bg-[#1e2b40] transition-colors"
                title="Thu gọn thanh điều hướng"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setMobileOpenPath(null)}
                className="lg:hidden w-7 h-7 rounded-md flex items-center justify-center text-[#5d5f60] dark:text-[#94a3b8] hover:text-[#131416] dark:hover:text-white hover:bg-[#ebedef] dark:hover:bg-[#1e2b40] transition-colors"
                title="Đóng menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className={cn("flex-1 overflow-y-auto py-3", compact ? "px-2 space-y-3" : "px-3 space-y-5")}>
          {menuSections.map((section) => {
            const visibleItems = section.items.filter((item) => item.roles.includes(userRole));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-0.5">
                {!compact ? (
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5d5f60] dark:text-[#94a3b8] px-2.5 mb-1.5">
                    {section.title}
                  </div>
                ) : (
                  <div className="h-px bg-[#e6e8eb] dark:bg-[#263447] mx-2 my-1.5" />
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
                        "flex items-center rounded-lg text-[13px] transition-colors group relative",
                        compact ? "justify-center p-2" : "justify-between px-2.5 py-1.5",
                        isActive
                          ? "bg-[#e3e0d8] dark:bg-[#1e2d44] text-[#131416] dark:text-[#f8fafc] font-semibold border border-transparent dark:border-[#364d6e]"
                          : "text-[#434648] dark:text-[#cbd5e1] font-normal hover:bg-[#e5e2da]/70 dark:hover:bg-[#172234] hover:text-[#131416] dark:hover:text-white"
                      )}
                    >
                      <div className={cn("flex items-center truncate", compact ? "justify-center" : "gap-2.5")}>
                        <span
                          className={cn(
                            "w-6 h-6 rounded-[6px] border flex items-center justify-center shrink-0 transition-colors",
                            getChicletStyle(item.href, isActive)
                          )}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                        </span>
                        {!compact && <span className="truncate">{item.name}</span>}
                      </div>

                      {!compact && item.badge && (
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.2 rounded border",
                            isActive
                              ? "bg-[#1b6c80]/12 dark:bg-[#0ea5e9]/20 text-[#1b6c80] dark:text-[#38bdf8] border-[#1b6c80]/20 dark:border-[#38bdf8]/40"
                              : "text-[#5d5f60] dark:text-[#cbd5e1] bg-[#e6e8eb]/70 dark:bg-[#1e2b40] border-transparent dark:border-[#334663]"
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

        <div className="p-3 space-y-1.5">
          {compact && (
            <button
              type="button"
              onClick={toggleCollapse}
              className="hidden lg:flex w-full items-center justify-center p-2 rounded-md text-[#5d5f60] dark:text-[#94a3b8] hover:text-[#131416] dark:hover:text-white hover:bg-[#ebedef] dark:hover:bg-[#1e2b40] transition-colors"
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
                "flex items-center rounded-md text-[13px] font-medium text-[#434648] dark:text-[#cbd5e1] hover:bg-[#ebedef] dark:hover:bg-[#172234] hover:text-[#131416] dark:hover:text-white transition-colors group",
                compact ? "justify-center p-2" : "gap-2.5 px-2.5 py-1.5"
              )}
            >
              <Settings className="w-4 h-4 text-[#5d5f60] dark:text-[#94a3b8] group-hover:text-[#131416] dark:group-hover:text-white transition-colors shrink-0" />
              {!compact && <span>Cài đặt hệ thống</span>}
            </Link>
          )}

          {!compact ? (
            <div className="flex items-center justify-between px-2.5 pt-2 border-t border-[#e6e8eb] dark:border-[#263447] text-xs text-[#5d5f60] dark:text-[#94a3b8]">
              <span>Bộ luật LĐ 2019</span>
              <span className="font-mono text-[11px] dark:text-[#cbd5e1]">Kỳ 2026</span>
            </div>
          ) : (
            <div className="flex justify-center py-1" title="Chuẩn Bộ luật Lao động 2019">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1e7b4f] inline-block"></span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
