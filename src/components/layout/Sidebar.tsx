"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Target
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
      { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard, roles: ["SYSTEM_ADMIN", "MANAGER", "HR", "USER"] },
      { name: "Cổng cá nhân (ESS)", href: "/dashboard/my-workspace", icon: UserCheck, roles: ["SYSTEM_ADMIN", "MANAGER", "HR", "USER"], badge: "Cá nhân", badgeColor: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60" },
      { name: "Sổ tay nghiệp vụ", href: "/dashboard/guide", icon: BookOpen, roles: ["SYSTEM_ADMIN", "MANAGER", "HR", "USER"], badge: "HDSD", badgeColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60" },
    ]
  },
  {
    title: "Danh mục phân hệ",
    items: [
      { name: "Cơ cấu tổ chức", href: "/dashboard/departments", icon: Network, roles: ["SYSTEM_ADMIN", "MANAGER", "HR"] },
      { name: "Tuyển dụng", href: "/dashboard/recruitment", icon: Briefcase, roles: ["SYSTEM_ADMIN", "HR", "MANAGER"] },
      { name: "Hồ sơ nhân sự", href: "/dashboard/employees", icon: Users, roles: ["SYSTEM_ADMIN", "MANAGER", "HR"] },
      { name: "Hợp đồng lao động", href: "/dashboard/contracts", icon: FileSignature, roles: ["SYSTEM_ADMIN", "HR", "MANAGER"], badge: "Pháp lý" },
      { name: "Bảng tính lương", href: "/dashboard/payroll", icon: Banknote, roles: ["SYSTEM_ADMIN", "HR", "MANAGER", "USER"] },
      { name: "Đánh giá hiệu suất", href: "/dashboard/performance", icon: Target, roles: ["SYSTEM_ADMIN", "HR", "MANAGER", "USER"] },
      { name: "Biến động nhân sự", href: "/dashboard/personnel-changes", icon: ArrowLeftRight, roles: ["SYSTEM_ADMIN", "HR", "MANAGER"] },
      { name: "Đào tạo & Khảo sát", href: "/dashboard/training-surveys", icon: GraduationCap, roles: ["SYSTEM_ADMIN", "HR", "MANAGER", "USER"] },
      { name: "Quy hoạch cán bộ", href: "/dashboard/cadre-planning", icon: Award, roles: ["SYSTEM_ADMIN", "HR", "MANAGER"] },
      { name: "Quy trình & Kiểm toán", href: "/dashboard/audit-workflow", icon: ShieldCheck, roles: ["SYSTEM_ADMIN", "HR", "MANAGER"] },
    ]
  },
  {
    title: "Cá nhân & Đơn từ",
    items: [
      { name: "Chấm công", href: "/dashboard/attendance", icon: Clock, roles: ["SYSTEM_ADMIN", "MANAGER", "HR", "USER"] },
      { name: "Nghỉ phép", href: "/dashboard/leave", icon: FileText, roles: ["SYSTEM_ADMIN", "MANAGER", "HR", "USER"] },
    ]
  },
  {
    title: "Quản trị hệ thống",
    items: [
      { name: "Vai trò & Phân quyền", href: "/dashboard/roles", icon: ShieldCheck, roles: ["SYSTEM_ADMIN"] },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.roleName || "USER";

  return (
    <aside className="w-64 h-screen bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-r border-zinc-200/80 dark:border-zinc-800/80 flex flex-col transition-all duration-200 select-none z-20">
      
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Fingerprint className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                NEXUSTECH
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            </div>
            <span className="text-[10px] block text-zinc-500 dark:text-zinc-400 font-medium">
              Quản trị Nguồn nhân lực
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {menuSections.map((section) => {
          const visibleItems = section.items.filter(item => item.roles.includes(userRole));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-3 mb-1.5">
                {section.title}
              </div>

              {visibleItems.map((item) => {
                const isActive = item.href === '/dashboard' 
                  ? pathname === '/dashboard' 
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors group relative",
                      isActive 
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border-l-2 border-blue-600 dark:border-blue-500 shadow-2xs" 
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-zinc-100"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon 
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive 
                            ? "text-blue-600 dark:text-blue-400" 
                            : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                        )} 
                      />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                        isActive
                          ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                          : item.badgeColor || "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800"
                      )}>
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

      {/* Admin Quick Settings & System Status Footer */}
      <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-1.5 bg-zinc-50/50 dark:bg-zinc-900/40">
        {userRole === "SYSTEM_ADMIN" && (
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 shadow-2xs group"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-600 transition-colors" />
            <span>Cài đặt hệ thống</span>
          </Link>
        )}
        
        <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            Hệ thống trực tuyến
          </span>
          <span className="text-[10px] font-mono bg-zinc-200/60 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400 font-semibold">
            HRMIS 2026
          </span>
        </div>
      </div>
    </aside>
  );
}
