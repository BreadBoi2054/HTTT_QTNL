"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Clock3, FileText, UsersRound } from "lucide-react";

type DashboardData = {
  totalEmployees: number | null;
  attendanceToday: { PRESENT: number; LATE: number; ABSENT: number; LEAVE: number } | null;
  headcountByDept: { name: string; value: number }[] | null;
  activeJobs: number | null;
  recentApplications: { id: string; candidateName: string; jobTitle: string; status: string; createdAt: string }[] | null;
};

const statusNames: Record<string, string> = {
  APPLIED: "Mới tiếp nhận", REVIEWING: "Đang sàng lọc", INTERVIEWING: "Phỏng vấn",
  OFFERED: "Đã đề nghị", HIRED: "Đã tuyển", REJECTED: "Đã từ chối",
};

const personalLinks = [
  { title: "Không gian của tôi", note: "Hồ sơ và hoạt động cá nhân", href: "/dashboard/my-workspace" },
  { title: "Chấm công", note: "Ghi nhận và xem ngày làm việc", href: "/dashboard/attendance" },
  { title: "Nghỉ phép", note: "Quỹ phép và đơn chờ xét duyệt", href: "/dashboard/leave" },
  { title: "Phiếu lương", note: "Thu nhập theo từng kỳ", href: "/dashboard/payroll" },
  { title: "Đánh giá", note: "Tiến độ và kết quả hiệu suất", href: "/dashboard/performance" },
];

const managementLinks = [
  { title: "Hồ sơ nhân sự", note: "Danh sách và tình trạng lao động", href: "/dashboard/employees" },
  { title: "Chấm công", note: "Sổ công trong ngày", href: "/dashboard/attendance" },
  { title: "Nghỉ phép", note: "Đơn cần theo dõi", href: "/dashboard/leave" },
  { title: "Bảng lương", note: "Kỳ lương và phiếu chi", href: "/dashboard/payroll" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const roleName = (session?.user as { roleName?: string } | undefined)?.roleName || "USER";
  const isUser = roleName === "USER";
  const canSeeRecruitment = ["BOD", "SYSTEM_ADMIN", "HR", "MANAGER"].includes(roleName);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/dashboard", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Không tải được dữ liệu tổng quan");
        return response.json();
      })
      .then((result: DashboardData) => setData(result))
      .catch((cause) => { if (cause.name !== "AbortError") setError(true); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const today = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
  const period = new Intl.DateTimeFormat("en-GB", { month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
  const attendance = data?.attendanceToday;
  const present = (attendance?.PRESENT || 0) + (attendance?.LATE || 0);
  const recorded = present + (attendance?.ABSENT || 0) + (attendance?.LEAVE || 0);
  const punctuality = present > 0 ? Math.round(((attendance?.PRESENT || 0) / present) * 100) : null;
  const departments = data?.headcountByDept || [];
  const maxDepartment = Math.max(1, ...departments.map((item) => item.value));
  const links = isUser ? personalLinks : managementLinks;

  return (
    <div className="folio-page animate-swiss-in space-y-8">
      <section className="folio-rule grid gap-6 pb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <div className="folio-kicker mb-4 flex items-center gap-3"><span className="inline-block h-px w-8 bg-[#ba7146]" /> Sổ điều hành / {isUser ? "Cá nhân" : "Toàn doanh nghiệp"}</div>
          <h1 className="text-zinc-900 dark:text-zinc-100">{isUser ? "Một nơi cho công việc của bạn." : "Nhân sự, trong một góc nhìn."}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {isUser ? "Theo dõi ngày công, đơn nghỉ, thu nhập và các việc cần hoàn tất." : "Bức tranh vận hành của kỳ làm việc hiện tại, từ quân số đến chuyên cần và tuyển dụng."}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 lg:justify-end">
          <CalendarDays className="h-4 w-4 text-[#ba7146]" /><span>{today}</span><span className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" /><span className="font-mono">KỲ {period}</span>
        </div>
      </section>

      {error && <div role="alert" className="folio-panel border-red-300 p-5 text-sm text-red-700">Chưa thể tải số liệu. Hãy thử tải lại trang sau khi kiểm tra kết nối dữ liệu.</div>}

      <div className="grid gap-5 xl:grid-cols-12">
        <section className="folio-panel-dark relative overflow-hidden p-6 sm:p-8 xl:col-span-5">
          <div className="absolute -right-14 -top-16 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -right-4 -top-5 h-44 w-44 rounded-full border border-white/10" />
          <div className="relative flex h-full min-h-64 flex-col justify-between">
            <div className="flex items-center justify-between gap-4"><span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c9dfd0]">{isUser ? "Bàn làm việc" : "Quân số hiện tại"}</span><span className="font-mono text-xs text-[#d59b70]">NT / HR 01</span></div>
            <div className="py-7">
              {isUser ? <><p className="folio-display text-3xl leading-tight sm:text-4xl">Xin chào,<br />{session?.user?.name || "đồng nghiệp"}.</p><p className="mt-4 max-w-xs text-sm leading-relaxed text-[#c9dfd0]">Các công cụ và thông tin dành riêng cho bạn nằm ngay bên dưới.</p></> : <><div className="folio-number text-7xl sm:text-8xl">{loading ? "—" : (data?.totalEmployees ?? "—")}</div><p className="mt-4 text-sm text-[#c9dfd0]">nhân sự đang làm việc</p></>}
            </div>
            <Link href={isUser ? "/dashboard/my-workspace" : "/dashboard/employees"} className="relative flex items-center justify-between border-t border-white/20 pt-4 text-sm font-medium hover:text-[#e4aa7d]">{isUser ? "Vào không gian cá nhân" : "Mở danh sách nhân sự"}<ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        </section>

        <section className="folio-panel p-6 sm:p-8 xl:col-span-7">
          <div className="mb-7 flex items-start justify-between gap-4"><div><span className="folio-kicker">Chỉ mục / 02</span><h2 className="mt-2 folio-display text-2xl text-zinc-900 dark:text-zinc-100">Đi thẳng đến công việc</h2></div><ArrowRight className="h-5 w-5 text-[#ba7146]" /></div>
          <div>{links.map((item, index) => <Link key={item.href} href={item.href} className="folio-link-row group flex items-center gap-4 py-3.5"><span className="folio-index w-8 shrink-0">{String(index + 1).padStart(2, "0")}</span><span className="min-w-0 flex-1"><strong className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</strong><span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">{item.note}</span></span><ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-600" /></Link>)}</div>
        </section>
      </div>

      {!isUser && <div className="grid gap-5 xl:grid-cols-12">
        <section className="folio-panel p-6 sm:p-8 xl:col-span-5">
          <div className="mb-6 flex items-end justify-between gap-4"><div><span className="folio-kicker">Chuyên cần / hôm nay</span><h2 className="mt-2 folio-display text-2xl">Nhịp làm việc</h2></div><Clock3 className="h-5 w-5 text-[#ba7146]" /></div>
          <div className="grid grid-cols-2 border-y border-zinc-200 py-5 dark:border-zinc-700"><div className="border-r border-zinc-200 pr-4 dark:border-zinc-700"><div className="folio-number text-5xl">{loading ? "—" : present}</div><p className="mt-2 text-xs text-zinc-500">Đã chấm công</p></div><div className="pl-5"><div className="folio-number text-5xl">{loading ? "—" : (punctuality === null ? "—" : `${punctuality}%`)}</div><p className="mt-2 text-xs text-zinc-500">Đúng giờ trong số đã chấm</p></div></div>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-600 dark:text-zinc-400"><span>Đúng giờ <b className="font-mono text-zinc-900 dark:text-zinc-100">{attendance?.PRESENT ?? 0}</b></span><span>Đi muộn <b className="font-mono text-zinc-900 dark:text-zinc-100">{attendance?.LATE ?? 0}</b></span><span>Ghi nhận <b className="font-mono text-zinc-900 dark:text-zinc-100">{recorded}</b></span></div>
          <Link href="/dashboard/attendance" className="mt-7 flex items-center justify-between border-t border-zinc-200 pt-4 text-xs font-semibold text-blue-600 dark:border-zinc-700">Xem sổ công <ArrowRight className="h-4 w-4" /></Link>
        </section>

        <section className="folio-panel p-6 sm:p-8 xl:col-span-7">
          <div className="mb-6 flex items-end justify-between gap-4"><div><span className="folio-kicker">Cơ cấu / phòng ban</span><h2 className="mt-2 folio-display text-2xl">Phân bố nhân sự</h2></div><UsersRound className="h-5 w-5 text-[#ba7146]" /></div>
          {departments.length === 0 ? <p className="py-12 text-sm text-zinc-500">Chưa có dữ liệu phòng ban.</p> : <div className="space-y-5">{departments.slice(0, 6).map((item, index) => <div key={item.name} className="grid grid-cols-[1.5rem_minmax(0,1fr)_2rem] items-center gap-3"><span className="folio-index">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><div className="mb-1.5 truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">{item.name}</div><div className="folio-progress"><span style={{ width: `${Math.max(4, (item.value / maxDepartment) * 100)}%` }} /></div></div><span className="text-right font-mono text-sm font-semibold">{item.value}</span></div>)}</div>}
          <Link href="/dashboard/departments" className="mt-7 flex items-center justify-between border-t border-zinc-200 pt-4 text-xs font-semibold text-blue-600 dark:border-zinc-700">Xem cơ cấu tổ chức <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </div>}

      {!isUser && canSeeRecruitment && <section className="folio-panel overflow-hidden"><div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8"><div><span className="folio-kicker">Tuyển dụng / cập nhật</span><h2 className="mt-2 folio-display text-2xl">Hồ sơ mới tiếp nhận</h2><p className="mt-1 text-xs text-zinc-500">{data?.activeJobs ?? 0} vị trí đang mở</p></div><Link href="/dashboard/recruitment" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600">Đến phân hệ tuyển dụng <ArrowUpRight className="h-4 w-4" /></Link></div>{!data?.recentApplications?.length ? <div className="border-t border-zinc-200 p-8 text-sm text-zinc-500 dark:border-zinc-700">Chưa có hồ sơ ứng tuyển mới.</div> : <div className="divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">{data.recentApplications.map((item, index) => <div key={item.id} className="grid gap-2 px-6 py-4 sm:grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)_8rem] sm:items-center sm:gap-4 sm:px-8"><span className="folio-index">{String(index + 1).padStart(2, "0")}</span><strong className="truncate text-sm">{item.candidateName}</strong><span className="truncate text-xs text-zinc-600 dark:text-zinc-400">{item.jobTitle}</span><span className="text-xs font-medium text-blue-700 dark:text-blue-300">{statusNames[item.status] || item.status}</span></div>)}</div>}</section>}

      {isUser && <div className="flex flex-wrap gap-3 border-t border-zinc-200 pt-5 text-xs text-zinc-500 dark:border-zinc-700"><FileText className="h-4 w-4" /><span>Cần hỗ trợ? Xem <Link href="/dashboard/guide" className="font-semibold text-blue-600 underline underline-offset-2">sổ tay nghiệp vụ</Link>.</span></div>}
    </div>
  );
}
