"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Building, User, Phone, Mail, FileText, Briefcase, LayoutGrid, CheckCircle2, ArrowUpRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import JobManagementView from "@/components/recruitment/JobManagementView";
import OnboardingSuccessModal from "@/components/recruitment/OnboardingSuccessModal";

const COLUMNS = [
  { id: "APPLIED", label: "Mới ứng tuyển", dotColor: "bg-blue-600" },
  { id: "REVIEWING", label: "Đang lọc CV", dotColor: "bg-zinc-500" },
  { id: "INTERVIEWING", label: "Phỏng vấn", dotColor: "bg-amber-500" },
  { id: "OFFERED", label: "Gửi Offer", dotColor: "bg-purple-600" },
  { id: "HIRED", label: "Đã tuyển", dotColor: "bg-emerald-600" },
  { id: "REJECTED", label: "Loại hồ sơ", dotColor: "bg-red-600" },
];

export default function RecruitmentDashboard() {
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.roleName;
  const canManageJobs = userRole === "SYSTEM_ADMIN" || userRole === "HR";

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"KANBAN" | "JOBS">("KANBAN");

  // Onboarding Success Modal State
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [hiredCandidate, setHiredCandidate] = useState<any>(null);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/recruitment/applications");
      const data = await res.json();
      if (Array.isArray(data)) {
        setApplications(data);
      } else {
        console.error("API Error:", data);
        setApplications([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    const targetApp = applications.find(a => a.id === appId);

    try {
      // Optimistic update
      setApplications(apps => apps.map(app => app.id === appId ? { ...app, status: newStatus } : app));
      
      const res = await fetch(`/api/recruitment/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error(await res.text());

      if (newStatus === "HIRED" && targetApp) {
        setHiredCandidate({ ...targetApp, status: "HIRED" });
        setIsOnboardingModalOpen(true);
      }
    } catch (error) {
      console.error(error);
      fetchApplications(); // revert on fail
    }
  };

  if (loading || status === "loading") {
    return <div className="p-12 text-center text-zinc-500 text-xs">Đang tải dữ liệu tuyển dụng...</div>;
  }

  return (
    <div className="space-y-6 h-full flex flex-col animate-swiss-in pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60">
              <Briefcase className="w-3.5 h-3.5" />
              Thu Hút Nhân Tài & Tuyển Dụng
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
            Quy Trình Tuyển Dụng & Ứng Viên
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Theo dõi trạng thái ứng viên qua từng vòng phỏng vấn và quản trị tin tuyển dụng
          </p>
        </div>
        {canManageJobs && (
          <div className="flex bg-zinc-100/80 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
            <button 
              onClick={() => setActiveTab("KANBAN")} 
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'KANBAN' ? 'bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-2xs' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> <span>Bảng ứng viên</span>
            </button>
            <button 
              onClick={() => setActiveTab("JOBS")} 
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'JOBS' ? 'bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-2xs' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
            >
              <Briefcase className="w-3.5 h-3.5" /> <span>Tin tuyển dụng</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      {activeTab === "KANBAN" ? (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max h-full">
          {COLUMNS.map(col => {
            const columnApps = applications.filter(app => app.status === col.id);
            return (
              <div key={col.id} className="w-[320px] bento-card rounded-2xl flex flex-col bg-zinc-50/70 dark:bg-zinc-900/40 overflow-hidden shrink-0 shadow-xs border border-zinc-200/80 dark:border-zinc-800">
                <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`}></span>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{col.label}</h3>
                  </div>
                  <span className="text-[11px] font-bold font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-200/60 dark:border-zinc-700/60">
                    {columnApps.length}
                  </span>
                </div>
                
                <div className="p-3 flex-1 space-y-3 overflow-y-auto min-h-[480px]">
                  {columnApps.map(app => (
                    <div key={app.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{app.candidateName}</h4>
                        <a href={app.cvUrl} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-blue-600 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Xem CV">
                          <FileText className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-3 line-clamp-1">{app.jobPosting.title}</div>
                      
                      <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-3 border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
                        <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-zinc-400" /> <span className="truncate">{app.candidateEmail}</span></div>
                        <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-zinc-400" /> <span>{app.candidatePhone || 'N/A'}</span></div>
                      </div>

                      {app.status === "HIRED" && (
                        <div className="mb-2.5 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-md text-emerald-700 dark:text-emerald-300 text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đã tiếp nhận nhân sự</span>
                          </div>
                          <div className="flex items-center gap-2 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40 text-[11px]">
                            <Link 
                              href={`/dashboard/employees?search=${encodeURIComponent(app.candidateName)}`}
                              className="text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-0.5"
                            >
                              Hồ sơ nhân viên <ArrowUpRight className="w-3 h-3" />
                            </Link>
                            <span className="text-emerald-300 dark:text-emerald-700">•</span>
                            <Link 
                              href="/dashboard/personnel-changes"
                              className="text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-0.5"
                            >
                              Quyết định <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      )}

                      {canManageJobs && (
                        <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                          <span className="text-xs text-zinc-400 font-medium">Chuyển:</span>
                          <select 
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="text-xs border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-800/60 py-1 px-2 text-zinc-700 dark:text-zinc-300 outline-none focus:border-blue-500"
                          >
                            {COLUMNS.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">{c.label}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                  {columnApps.length === 0 && (
                    <div className="text-center text-xs text-zinc-400 py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                      Chưa có ứng viên
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
          <JobManagementView />
        </div>
      )}

      {/* Onboarding Success Modal */}
      <OnboardingSuccessModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        candidate={hiredCandidate}
      />
    </div>
  );
}
