"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Building, Users, Calendar, ArrowRight, Award, ShieldCheck, TrendingUp, Laptop, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tin tuyển dụng "${title}"?`)) return;
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Cổng Nhân viên Nội bộ</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Enterprise Portal Hero */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-12 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            <Briefcase className="w-3.5 h-3.5" />
            Công ty Cổ phần Công nghệ Nexustech • Mã số thuế: 0108992341
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Cơ Hội Nghề Nghiệp & Tuyển Dụng Nhân Tài
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Trụ sở chính: Hà Nội (Khu công nghệ cao Cầu Giấy) & Chi nhánh TP.HCM (Quận 1). Chính sách đãi ngộ minh bạch, tuân thủ Luật Lao động và chế độ phát triển nhân tài dài hạn.
          </p>

          {/* Benefits strip with Lucide Vector Icons */}
          <div className="flex flex-wrap justify-center gap-2 pt-3 max-w-4xl mx-auto text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">
              <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Lương thưởng cạnh tranh (13-15 tháng lương/năm)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Đóng đầy đủ BHXH, BHYT, BHTN theo luật định
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Lộ trình quy hoạch cán bộ kế nhiệm minh bạch
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">
              <Laptop className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Trợ cấp thiết bị & Đào tạo chuyên môn nội bộ
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">Vị trí đang tuyển</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Khám phá các cơ hội nghề nghiệp và nộp hồ sơ trực tuyến</p>
          </div>
          <span className="text-xs font-bold font-mono px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200/60 dark:border-blue-800/60">
            {jobs.length} Vị trí mở
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-zinc-500 text-xs">Đang tải danh sách việc làm...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 bento-card rounded-xl p-8 border border-zinc-200/80 dark:border-zinc-800">
            Hiện tại không có vị trí nào đang mở tuyển. Vui lòng quay lại sau!
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {jobs.map((job) => (
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
                    <div className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-blue-500" /> {job.department?.name || 'Nexustech'}</div>
                    <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-zinc-400" /> {job.headcount} chỉ tiêu</div>
                    {job.dueDate && (
                      <div className="flex items-center gap-1.5 font-mono text-zinc-400">
                        <Calendar className="w-3.5 h-3.5" /> Hạn: {new Date(job.dueDate).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 line-clamp-3 text-xs leading-relaxed">{job.description}</p>
                </div>
                
                <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Nộp hồ sơ trực tuyến</span>
                  <Link 
                    href={`/careers/${job.id}`} 
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group-hover:gap-2 transition-all"
                  >
                    <span>Xem chi tiết & Ứng tuyển</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
