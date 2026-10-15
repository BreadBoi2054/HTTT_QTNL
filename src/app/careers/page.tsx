"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useConfirm, CardGridSkeleton } from "@/components/providers/ToastProvider";

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const confirm = useConfirm();

  const { data: session } = useSession();
  const userRole = (session?.user as any)?.roleName;
  const canManageJobs = userRole === "SYSTEM_ADMIN" || userRole === "HR";

  const fetchJobs = () => {
    fetch("/api/careers/jobs")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setJobs(data);
        } else {
          console.error("API Error:", data);
          setJobs([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setJobs([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("vi");
    if (!query) return jobs;
    return jobs.filter((job) => [job.title, job.department?.name, job.description].filter(Boolean).join(" ").toLocaleLowerCase("vi").includes(query));
  }, [jobs, searchQuery]);

  const handleDelete = async (id: string, title: string) => {
    if (!(await confirm(`Bạn có chắc muốn xóa tin tuyển dụng "${title}"?`))) return;
    try {
      const res = await fetch(`/api/recruitment/jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchJobs();
      } else {
        alert("Lỗi khi xóa tin tuyển dụng.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối.");
    }
  };

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      
      {/* Top Corporate Nav */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              N
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                NEXUSTECH
              </span>
              <span className="text-[11px] text-zinc-400 block -mt-0.5">
                Cổng Tuyển dụng Doanh nghiệp
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link 
              href="/login" 
              className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 active:scale-[0.98] dark:text-zinc-300 font-medium transition-colors"
            >
              <span>Cổng Nhân viên Nội bộ →</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Enterprise Portal Hero */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-8 sm:py-10 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            Công ty Cổ phần Công nghệ Nexustech • Mã số thuế: 0108992341
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Cơ Hội Nghề Nghiệp & Tuyển Dụng Nhân Tài
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Trụ sở chính: Hà Nội (Khu công nghệ cao Cầu Giấy) & Chi nhánh TP.HCM (Quận 1). Chính sách đãi ngộ minh bạch, tuân thủ Luật Lao động và chế độ phát triển nhân tài dài hạn.
          </p>

          {/* Benefits strip - Clean Typographic Badges */}
          <div className="flex flex-wrap justify-center gap-2 pt-3 max-w-4xl mx-auto text-xs font-medium">
            <span className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">
              Lương thưởng cạnh tranh (13-15 tháng lương/năm)
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">
              Đóng đầy đủ BHXH, BHYT, BHTN theo luật định
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">
              Lộ trình quy hoạch cán bộ kế nhiệm minh bạch
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">
              Trợ cấp thiết bị & Đào tạo chuyên môn nội bộ
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">Vị trí đang tuyển</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Khám phá các cơ hội nghề nghiệp và nộp hồ sơ trực tuyến</p>
          </div>
          <span className="text-xs font-bold font-mono px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200/60 dark:border-blue-800/60">
            {filteredJobs.length} Vị trí {searchQuery ? "phù hợp" : "mở"}
          </span>
        </div>

        <div className="mb-6">
          <label htmlFor="career-search" className="sr-only">Tìm vị trí tuyển dụng</label>
          <input id="career-search" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tìm theo chức danh, phòng ban hoặc mô tả..." className="w-full sm:max-w-md px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>

        {loading ? (
          <CardGridSkeleton count={4} />
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 bento-card rounded-xl p-8 border border-zinc-200/80 dark:border-zinc-800">
            Hiện tại không có vị trí nào đang mở tuyển. Vui lòng quay lại sau!
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 bento-card rounded-xl p-8 border border-zinc-200/80 dark:border-zinc-800">
            Không tìm thấy vị trí phù hợp. <button type="button" onClick={() => setSearchQuery("")} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Xóa từ khóa tìm kiếm</button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredJobs.map((job) => (
              <div 
                key={job.id} 
                className="bento-card p-5.5 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> Đang mở tuyển
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {job.department?.name || 'Công nghệ'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {job.title}
                  </h3>

                  <div className="flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    <div>Đơn vị: <strong className="text-zinc-800 dark:text-zinc-200">{job.department?.name || 'Nexustech'}</strong></div>
                    <div>Chỉ tiêu: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{job.headcount}</strong></div>
                    {job.dueDate && (
                      <div className="font-mono text-zinc-400">
                        Hạn nộp: {new Date(job.dueDate).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 line-clamp-3 text-xs leading-relaxed">{job.description}</p>
                </div>
                
                <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Nộp hồ sơ trực tuyến</span>
                  <Link 
                    href={`/careers/${job.id}`} 
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <span>Xem chi tiết & Ứng tuyển →</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
