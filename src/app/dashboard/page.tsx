"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, FileText } from "lucide-react";

type DashboardData = {
  totalEmployees: number | null;
  attendanceToday: { PRESENT: number; LATE: number; ABSENT: number; LEAVE: number } | null;
  headcountByDept: { name: string; value: number }[] | null;
  activeJobs: number | null;
  recentApplications: { id: string; candidateName: string; jobTitle: string; status: string; createdAt: string }[] | null;
};

const statusNames: Record<string, string> = {
  APPLIED: "Mới tiếp nhận",
  REVIEWING: "Đang sàng lọc",
  INTERVIEWING: "Phỏng vấn",
  OFFERED: "Đã đề nghị",
  HIRED: "Đã tuyển",
  REJECTED: "Đã từ chối",
};

const statusPillStyles: Record<string, string> = {
  APPLIED: "bg-[#ebedee] text-[#353736] dark:bg-[#1e2328] dark:text-[#cfd3d8]",
  REVIEWING: "bg-[#eef7f9] text-[#1b6c80] dark:bg-[#1b6c80]/20 dark:text-[#76bfd0]",
  INTERVIEWING: "bg-[#fffbeb] text-[#92400e] dark:bg-amber-950/40 dark:text-amber-300",
  OFFERED: "bg-[#dcfae5] text-[#04250e] dark:bg-emerald-950/40 dark:text-emerald-300",
  HIRED: "bg-[#dcfae5] text-[#04250e] dark:bg-emerald-950/40 dark:text-emerald-300",
  REJECTED: "bg-[#ffedea] text-[#831c1e] dark:bg-rose-950/40 dark:text-rose-300",
};

const personalLinks = [
  { title: "Cổng thông tin cá nhân", scope: "Hồ sơ, hợp đồng và lịch sử thu nhập", href: "/dashboard/my-workspace" },
  { title: "Chấm công trong ngày", scope: "Ghi nhận giờ vào/ra và đối soát ca", href: "/dashboard/attendance" },
  { title: "Quỹ phép & Đơn từ", scope: "Đăng ký nghỉ phép và theo dõi phê duyệt", href: "/dashboard/leave" },
  { title: "Phiếu lương định kỳ", scope: "Chi tiết lương Gross, BHXH, thuế TNCN và Net", href: "/dashboard/payroll" },
  { title: "Đánh giá hiệu suất KPI", scope: "Mục tiêu cá nhân và kết quả nghiệm thu quý", href: "/dashboard/performance" },
];

const managementLinks = [
  { title: "Hồ sơ nhân sự & Định biên", scope: "Danh bạ lao động, chức danh và phòng ban", href: "/dashboard/employees" },
  { title: "Sổ chấm công thời gian thực", scope: "Đối soát hiện diện, đi muộn và tăng ca", href: "/dashboard/attendance" },
  { title: "Duyệt đơn nghỉ phép", scope: "Rà soát hạn mức phép và phê duyệt đơn chờ", href: "/dashboard/leave" },
  { title: "Quyết toán bảng lương", scope: "Tính lương, trích nộp BHXH 10.5% và thuế TNCN", href: "/dashboard/payroll" },
  { title: "Hợp đồng lao động", scope: "Theo dõi hiệu lực pháp lý và phụ lục gia hạn", href: "/dashboard/contracts" },
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
      .catch((cause) => {
        if (cause.name !== "AbortError") setError(true);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const today = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());
  const period = new Intl.DateTimeFormat("en-GB", {
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());

  const attendance = data?.attendanceToday;
  const onTimeCount = attendance?.PRESENT || 0;
  const lateCount = attendance?.LATE || 0;
  const leaveCount = attendance?.LEAVE || 0;
  const absentCount = attendance?.ABSENT || 0;
  const present = onTimeCount + lateCount;
  const recorded = present + absentCount + leaveCount;
  const totalHeadcount = data?.totalEmployees ?? 0;
  const punctuality = present > 0 ? Math.round((onTimeCount / present) * 100) : 0;
  const departments = data?.headcountByDept || [];
  const totalDeptHeadcount = departments.reduce((sum, item) => sum + item.value, 0) || 1;
  const maxDepartment = Math.max(1, ...departments.map((item) => item.value));
  const links = isUser ? personalLinks : managementLinks;

  return (
    <div className="folio-page animate-swiss-in space-y-6">
      {/* Title Row (Framed Sheet Standard: 22px title, 14px finding subline, 1 primary action on the right) */}
      <header className="flex flex-col gap-4 pb-5 border-b border-[#e6e8eb] dark:border-[#22262b] lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5d5f60] dark:text-[#9ba3b0] mb-1.5">
            <span>Nexustech HRIS</span>
            <span>/</span>
            <span>Kỳ quyết toán {period}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-[#1b6c80] dark:text-[#2ba3be]" />
              {today}
            </span>
          </div>
          <h1 className="text-[22px] font-semibold text-[#131416] dark:text-white tracking-tight">
            {isUser ? `Không gian làm việc · ${session?.user?.name || "Nhân viên"}` : "Tổng quan điều hành nhân lực"}
          </h1>
          <p className="mt-1 text-sm text-[#5d5f60] dark:text-[#9ba3b0]">
            {isUser
              ? "Theo dõi bảng chấm công, quỹ phép năm, phiếu lương và mục tiêu KPI cá nhân trong kỳ."
              : loading
              ? "Đang đồng bộ số liệu biên chế, chuyên cần và tuyển dụng từ cơ sở dữ liệu..."
              : `Hệ thống ghi nhận ${totalHeadcount} nhân sự biên chế tại ${departments.length} phòng ban; hôm nay có ${present} nhân sự hiện diện (${punctuality}% đúng giờ).`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href={isUser ? "/dashboard/attendance" : "/dashboard/payroll"}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-[#cfd3d8] dark:border-[#2c3138] bg-white dark:bg-[#171b1f] px-3.5 text-[13px] font-medium text-[#131416] dark:text-white hover:bg-[#f4f6f8] dark:hover:bg-[#1e2328] transition-colors"
          >
            <span>{isUser ? "Chấm công hôm nay" : "Mở sổ lương kỳ này"}</span>
          </Link>
          <Link
            href={isUser ? "/dashboard/my-workspace" : "/dashboard/employees"}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-[#1b6c80] hover:bg-[#155666] px-3.5 text-[13px] font-medium text-white transition-colors"
          >
            <span>{isUser ? "Hồ sơ cá nhân" : "Danh bạ nhân sự"}</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {error && (
        <div role="alert" className="rounded-lg border border-[#ffedea] bg-[#ffedea]/60 dark:border-rose-900/50 dark:bg-rose-950/30 p-4 text-[13px] text-[#831c1e] dark:text-rose-300">
          Chưa thể tải số liệu tổng hợp. Vui lòng kiểm tra kết nối cơ sở dữ liệu và tải lại trang.
        </div>
      )}

      {/* Unified KPI Strip (1 container split by 1px dividers into 4 equal cells, 28px regular weight values) */}
      {!isUser && (
        <section
          aria-label="Chỉ số điều hành trọng tâm"
          className="kpi-strip grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#e6e8eb] dark:divide-[#22262b]"
        >
          <div className="p-5 flex flex-col justify-between gap-2">
            <span className="text-[13px] font-medium text-[#5d5f60] dark:text-[#9ba3b0]">
              Tổng biên chế hoạt động
            </span>
            <div className="flex items-baseline gap-2 tabular-nums">
              <span className="text-[28px] font-normal tracking-tight text-[#131416] dark:text-white leading-none">
                {loading ? "-" : totalHeadcount}
              </span>
              <span className="text-xs text-[#5d5f60] dark:text-[#9ba3b0]">nhân sự</span>
            </div>
            <span className="text-xs text-[#5d5f60] dark:text-[#9ba3b0] tabular-nums">
              Phân bổ trên {departments.length} đơn vị chuyên môn
            </span>
          </div>

          <div className="p-5 flex flex-col justify-between gap-2">
            <span className="text-[13px] font-medium text-[#5d5f60] dark:text-[#9ba3b0]">
              Hiện diện trong ca hôm nay
            </span>
            <div className="flex items-baseline gap-2 tabular-nums">
              <span className="text-[28px] font-normal tracking-tight text-[#131416] dark:text-white leading-none">
                {loading ? "-" : present}
              </span>
              <span className="text-xs text-[#5d5f60] dark:text-[#9ba3b0]">
                / {recorded} bản ghi công
              </span>
            </div>
            <span className="text-xs text-[#1e7b4f] dark:text-emerald-400 tabular-nums">
              {onTimeCount} đúng giờ · {lateCount} đi muộn
            </span>
          </div>

          <div className="p-5 flex flex-col justify-between gap-2">
            <span className="text-[13px] font-medium text-[#5d5f60] dark:text-[#9ba3b0]">
              Tỷ lệ tuân thủ giờ công
            </span>
            <div className="flex items-baseline gap-2 tabular-nums">
              <span className="text-[28px] font-normal tracking-tight text-[#1b6c80] dark:text-[#2ba3be] leading-none">
                {loading ? "-" : `${punctuality}%`}
              </span>
              <span className="text-xs text-[#5d5f60] dark:text-[#9ba3b0]">đúng chuẩn 08:00</span>
            </div>
            <span className="text-xs text-[#5d5f60] dark:text-[#9ba3b0] tabular-nums">
              Nghỉ phép: {leaveCount} · Vắng mặt: {absentCount}
            </span>
          </div>

          <div className="p-5 flex flex-col justify-between gap-2">
            <span className="text-[13px] font-medium text-[#5d5f60] dark:text-[#9ba3b0]">
              Định biên tuyển dụng mở
            </span>
            <div className="flex items-baseline gap-2 tabular-nums">
              <span className="text-[28px] font-normal tracking-tight text-[#131416] dark:text-white leading-none">
                {loading ? "-" : (data?.activeJobs ?? 0)}
              </span>
              <span className="text-xs text-[#5d5f60] dark:text-[#9ba3b0]">vị trí đang tuyển</span>
            </div>
            <span className="text-xs text-[#5d5f60] dark:text-[#9ba3b0] tabular-nums">
              {data?.recentApplications?.length ?? 0} hồ sơ ứng viên mới nhất
            </span>
          </div>
        </section>
      )}

      {/* Framed Sheet Main Grid: 1fr Main Column + 360px Right Rail */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] items-start">
        {/* Main Column */}
        <div className="space-y-6 min-w-0">
          {!isUser && (
            <section className="rounded-lg border border-[#e6e8eb] dark:border-[#22262b] bg-white dark:bg-[#121518] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#e6e8eb] dark:border-[#22262b]">
                <div>
                  <h2 className="text-base font-semibold text-[#131416] dark:text-white">
                    Cơ cấu biên chế theo phòng ban
                  </h2>
                  <p className="text-xs text-[#5d5f60] dark:text-[#9ba3b0] mt-0.5">
                    Số lượng nhân sự chính thức và tỷ trọng định biên tại từng đơn vị
                  </p>
                </div>
                <Link
                  href="/dashboard/departments"
                  className="text-xs font-medium text-[#1b6c80] dark:text-[#2ba3be] hover:underline inline-flex items-center gap-1"
                >
                  <span>Cơ cấu tổ chức</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {departments.length === 0 ? (
                <p className="py-10 text-[13px] text-[#5d5f60] dark:text-[#9ba3b0]">
                  Chưa có dữ liệu phân bổ phòng ban.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-[#e6e8eb] dark:border-[#22262b] text-xs text-[#5d5f60] dark:text-[#9ba3b0]">
                        <th className="py-2.5 pr-4 font-medium">Đơn vị chuyên môn</th>
                        <th className="py-2.5 px-4 font-medium w-48 sm:w-64">Mật độ định biên</th>
                        <th className="py-2.5 px-4 font-medium text-right">Tỷ trọng</th>
                        <th className="py-2.5 pl-4 font-medium text-right">Nhân sự</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eef0f2] dark:divide-[#1b1f24] tabular-nums">
                      {departments.map((item) => {
                        const share = Math.round((item.value / totalDeptHeadcount) * 100);
                        return (
                          <tr key={item.name} className="h-11">
                            <td className="py-2.5 pr-4 font-medium text-[#131416] dark:text-white">
                              {item.name}
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="folio-progress">
                                <span style={{ width: `${Math.max(6, (item.value / maxDepartment) * 100)}%` }} />
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-right text-[#5d5f60] dark:text-[#9ba3b0]">
                              {share}%
                            </td>
                            <td className="py-2.5 pl-4 text-right font-medium text-[#131416] dark:text-white">
                              {item.value} <span className="text-xs font-normal text-[#5d5f60]">người</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Sheet-Native Table for Recent Applications */}
          {!isUser && canSeeRecruitment && (
            <section className="rounded-lg border border-[#e6e8eb] dark:border-[#22262b] bg-white dark:bg-[#121518] p-5 sm:p-6">
              <div className="flex flex-col gap-2 pb-4 border-b border-[#e6e8eb] dark:border-[#22262b] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[#131416] dark:text-white">
                    Hồ sơ ứng viên mới tiếp nhận
                  </h2>
                  <p className="text-xs text-[#5d5f60] dark:text-[#9ba3b0] mt-0.5">
                    Ứng viên nộp hồ sơ trực tuyến qua cổng tuyển dụng của tập đoàn
                  </p>
                </div>
                <Link
                  href="/dashboard/recruitment"
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#cfd3d8] dark:border-[#2c3138] px-3 text-xs font-medium text-[#131416] dark:text-white hover:bg-[#f4f6f8] dark:hover:bg-[#1e2328] transition-colors w-fit"
                >
                  <span>Quản lý tuyển dụng</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {!data?.recentApplications?.length ? (
                <p className="py-8 text-[13px] text-[#5d5f60] dark:text-[#9ba3b0]">
                  Chưa có hồ sơ ứng tuyển mới trong kỳ này.
                </p>
              ) : (
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-[#e6e8eb] dark:border-[#22262b] text-xs text-[#5d5f60] dark:text-[#9ba3b0]">
                        <th className="py-2.5 pr-4 font-medium">Họ và tên ứng viên</th>
                        <th className="py-2.5 px-4 font-medium">Vị trí ứng tuyển</th>
                        <th className="py-2.5 pl-4 font-medium text-right">Trạng thái xét duyệt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eef0f2] dark:divide-[#1b1f24]">
                      {data.recentApplications.map((item) => (
                        <tr key={item.id} className="h-12">
                          <td className="py-2.5 pr-4 font-medium text-[#131416] dark:text-white">
                            {item.candidateName}
                          </td>
                          <td className="py-2.5 px-4 text-[#5d5f60] dark:text-[#9ba3b0]">
                            {item.jobTitle}
                          </td>
                          <td className="py-2.5 pl-4 text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                                statusPillStyles[item.status] || statusPillStyles.APPLIED
                              }`}
                            >
                              {statusNames[item.status] || item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {isUser && (
            <section className="rounded-lg border border-[#e6e8eb] dark:border-[#22262b] bg-white dark:bg-[#121518] p-5 sm:p-6">
              <h2 className="text-base font-semibold text-[#131416] dark:text-white">
                Hướng dẫn tra cứu nhanh dành cho cán bộ nhân viên
              </h2>
              <p className="mt-1 text-[13px] text-[#5d5f60] dark:text-[#9ba3b0]">
                Mọi dữ liệu chấm công, hợp đồng lao động và phiếu lương cá nhân được bảo mật theo phân quyền tài khoản.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[13px] text-[#5d5f60] dark:text-[#9ba3b0]">
                <FileText className="h-4 w-4 text-[#1b6c80]" />
                <span>
                  Xem chi tiết quy trình nghỉ phép, BHXH và thuế TNCN tại{" "}
                  <Link href="/dashboard/guide" className="font-semibold text-[#1b6c80] dark:text-[#2ba3be] underline underline-offset-4">
                    Sổ tay nghiệp vụ nội bộ
                  </Link>
                  .
                </span>
              </div>
            </section>
          )}
        </div>

        {/* Fixed 360px Right Rail (Headings outside cards per Framed Sheet spec) */}
        <aside className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-[#131416] dark:text-white mb-2">
              Phân hệ tác nghiệp trọng tâm
            </h2>
            <div className="rounded-lg border border-[#e6e8eb] dark:border-[#22262b] bg-white dark:bg-[#121518] divide-y divide-[#eef0f2] dark:divide-[#1b1f24]">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#f8f9fb] dark:hover:bg-[#171b1f] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-[#131416] dark:text-white group-hover:text-[#1b6c80] dark:group-hover:text-[#2ba3be] transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs text-[#5d5f60] dark:text-[#9ba3b0] truncate mt-0.5">
                      {item.scope}
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-[#878c92] group-hover:text-[#1b6c80] dark:group-hover:text-[#2ba3be] transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {!isUser && (
            <div className="pt-2">
              <h2 className="text-base font-semibold text-[#131416] dark:text-white mb-2">
                Đối soát quân số ca hiện hành
              </h2>
              <div className="rounded-lg border border-[#e6e8eb] dark:border-[#22262b] bg-white dark:bg-[#121518] p-4 space-y-3">
                <div className="divide-y divide-[#eef0f2] dark:divide-[#1b1f24] text-[13px] tabular-nums">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#5d5f60] dark:text-[#9ba3b0]">Đúng giờ qui định</span>
                    <span className="font-medium text-[#1e7b4f] dark:text-emerald-400">{onTimeCount} người</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#5d5f60] dark:text-[#9ba3b0]">Đi muộn sau 08:00</span>
                    <span className="font-medium text-[#92400e] dark:text-amber-400">{lateCount} người</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#5d5f60] dark:text-[#9ba3b0]">Nghỉ phép có đơn duyệt</span>
                    <span className="font-medium text-[#131416] dark:text-white">{leaveCount} người</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#5d5f60] dark:text-[#9ba3b0]">Vắng mặt chưa rõ lý do</span>
                    <span className="font-medium text-[#c4242a] dark:text-rose-400">{absentCount} người</span>
                  </div>
                  <div className="flex items-center justify-between pt-2.5 font-semibold text-[#131416] dark:text-white">
                    <span>Tổng bản ghi chấm công</span>
                    <span>{recorded} bản ghi</span>
                  </div>
                </div>

                <Link
                  href="/dashboard/attendance"
                  className="flex h-8 w-full items-center justify-center rounded-md border border-[#cfd3d8] dark:border-[#2c3138] text-xs font-medium text-[#131416] dark:text-white hover:bg-[#f4f6f8] dark:hover:bg-[#1e2328] transition-colors"
                >
                  Xem toàn bộ sổ chấm công
                </Link>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
