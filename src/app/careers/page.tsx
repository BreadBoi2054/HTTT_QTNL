"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TableSkeleton } from "@/components/providers/ToastProvider";

interface CareerJob {
  id: string;
  title: string;
  description: string;
  headcount: number;
  dueDate?: string | null;
  department?: {
    name?: string;
  } | null;
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/careers/jobs")
      .then((res) => res.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          setJobs(data as CareerJob[]);
        } else {
          setJobs([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setJobs([]);
        setLoading(false);
      });
  }, []);

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("vi");
    if (!query) return jobs;
    return jobs.filter((job) =>
      [job.title, job.department?.name, job.description]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(query)
    );
  }, [jobs, searchQuery]);

  const totalOpenHeadcount = useMemo(
    () => filteredJobs.reduce((sum, item) => sum + (Number(item.headcount) || 0), 0),
    [filteredJobs]
  );

  return (
    <div className="career-page min-h-dvh bg-[#f4f6f8] dark:bg-[#0c0e10] text-[#131416] dark:text-[#f2f4f7] p-2 sm:p-3">
      {/* Top Slate Frame Header */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#1b6c80] text-white flex items-center justify-center font-semibold text-xs">
            NX
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-[#131416] dark:text-white">
              Nexustech
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#e6e8eb] dark:bg-[#1e2328] text-[#434648] dark:text-[#9ba3b0]">
              Cổng tuyển dụng
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="px-3.5 py-1.5 rounded-md bg-[#1b6c80] hover:bg-[#155666] text-white text-[13px] font-medium transition-colors"
        >
          <span>Đăng nhập nội bộ →</span>
        </Link>
      </header>

      {/* Inset White Sheet */}
      <main className="max-w-6xl mx-auto rounded-2xl border border-[#e6e8eb] dark:border-[#22262b] bg-white dark:bg-[#121518] p-6 sm:p-10">
        <div className="flex flex-col gap-6 pb-8 border-b border-[#e6e8eb] dark:border-[#22262b] lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-[#131416] dark:text-white leading-[1.2]">
              Định biên tuyển dụng tại Nexustech.
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-[#5d5f60] dark:text-[#9ba3b0]">
              Danh sách các vị trí chuyên môn đang mở tuyển chính thức. Hồ sơ ứng viên được tiếp nhận và phản hồi trực tiếp từ Ban Quản trị Nhân sự.
            </p>
          </div>

          <div className="flex items-center gap-6 border border-[#e6e8eb] dark:border-[#22262b] rounded-lg px-5 py-3 bg-[#f8f9fb] dark:bg-[#171b1f] tabular-nums shrink-0">
            <div>
              <div className="text-xs text-[#5d5f60] dark:text-[#9ba3b0]">Vị trí đang mở</div>
              <div className="text-xl font-normal text-[#131416] dark:text-white mt-0.5">{filteredJobs.length} vị trí</div>
            </div>
            <div className="h-8 w-px bg-[#e6e8eb] dark:bg-[#22262b]" />
            <div>
              <div className="text-xs text-[#5d5f60] dark:text-[#9ba3b0]">Tổng chỉ tiêu</div>
              <div className="text-xl font-normal text-[#1b6c80] dark:text-[#2ba3be] mt-0.5">{totalOpenHeadcount} nhân sự</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full sm:max-w-sm">
            <label htmlFor="career-search" className="sr-only">
              Tìm vị trí tuyển dụng
            </label>
            <input
              id="career-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm theo chức danh hoặc đơn vị..."
              className="w-full h-9 px-3.5 rounded-md border border-[#cfd3d8] dark:border-[#2c3138] bg-white dark:bg-[#171b1f] text-[13px] text-[#131416] dark:text-white placeholder:text-[#5d5f60] focus:outline-none focus:border-[#1b6c80]"
            />
          </div>
          <span className="text-[13px] text-[#5d5f60] dark:text-[#9ba3b0] tabular-nums">
            Hiển thị {filteredJobs.length} vị trí tuyển dụng
          </span>
        </div>

        {/* Sheet-Native Table List */}
        {loading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : jobs.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-[#5d5f60] border-t border-[#e6e8eb] dark:border-[#22262b]">
            Hiện tại chưa có đợt tuyển dụng mới. Vui lòng quay lại sau.
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-[#5d5f60] border-t border-[#e6e8eb] dark:border-[#22262b]">
            Không tìm thấy vị trí phù hợp với từ khóa.{" "}
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-[#1b6c80] font-medium hover:underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-[#e6e8eb] dark:border-[#22262b]">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#e6e8eb] dark:border-[#22262b] text-[13px] text-[#5d5f60] dark:text-[#9ba3b0]">
                  <th className="py-3 pr-4 font-medium">Chức danh & Mô tả công việc</th>
                  <th className="py-3 px-4 font-medium">Đơn vị tiếp nhận</th>
                  <th className="py-3 px-4 font-medium text-right">Chỉ tiêu</th>
                  <th className="py-3 px-4 font-medium text-right">Hạn nhận hồ sơ</th>
                  <th className="py-3 pl-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0f2] dark:divide-[#1b1f24] tabular-nums">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="group hover:bg-[#f8f9fb] dark:hover:bg-[#171b1f] transition-colors">
                    <td className="py-4 pr-4 max-w-md">
                      <Link
                        href={`/careers/${job.id}`}
                        className="font-semibold text-sm text-[#131416] dark:text-white group-hover:text-[#1b6c80] dark:group-hover:text-[#2ba3be] transition-colors block"
                      >
                        {job.title}
                      </Link>
                      <p className="text-[13px] text-[#5d5f60] dark:text-[#9ba3b0] line-clamp-1 mt-1">
                        {job.description}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-[#434648] dark:text-[#cfd3d8]">
                      {job.department?.name || "Khối Công nghệ"}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-[#131416] dark:text-white">
                      {job.headcount} <span className="text-[13px] font-normal text-[#5d5f60]">người</span>
                    </td>
                    <td className="py-4 px-4 text-right text-[#5d5f60] dark:text-[#9ba3b0]">
                      {job.dueDate ? new Date(job.dueDate).toLocaleDateString("vi-VN") : "Tuyển liên tục"}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <Link
                        href={`/careers/${job.id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-[#cfd3d8] dark:border-[#2c3138] bg-white dark:bg-[#121518] px-3 py-1.5 text-[13px] font-medium text-[#131416] dark:text-white hover:border-[#1b6c80] hover:text-[#1b6c80] transition-colors"
                      >
                        <span>Ứng tuyển</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
