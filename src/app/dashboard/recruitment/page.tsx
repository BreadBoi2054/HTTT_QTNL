"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Building, User, Phone, Mail, FileText, Briefcase, LayoutGrid, CheckCircle2, ArrowUpRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import JobManagementView from "@/components/recruitment/JobManagementView";
import OnboardingSuccessModal from "@/components/recruitment/OnboardingSuccessModal";
import ScheduleInterviewModal from "@/components/recruitment/ScheduleInterviewModal";
import { Calendar as CalendarIcon } from "lucide-react";
import { CardGridSkeleton } from "@/components/providers/ToastProvider";

const COLUMNS = [
  { id: "APPLIED", label: "Mới ứng tuyển", dotColor: "bg-blue-600" },
  { id: "REVIEWING", label: "Đang lọc CV", dotColor: "bg-zinc-500" },
  { id: "INTERVIEWING", label: "Phỏng vấn", dotColor: "bg-amber-500" },
  { id: "OFFERED", label: "Gửi Offer", dotColor: "bg-blue-500" },
  { id: "HIRED", label: "Đã tuyển", dotColor: "bg-emerald-600" },
  { id: "REJECTED", label: "Loại hồ sơ", dotColor: "bg-rose-600" },
];

export default function RecruitmentDashboard() {
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.roleName;
  const canManageJobs = ["SYSTEM_ADMIN", "BOD", "HR"].includes(userRole);
  const canReviewCandidates = ["SYSTEM_ADMIN", "BOD", "HR", "MANAGER"].includes(userRole);

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"KANBAN" | "JOBS">("KANBAN");

  // Onboarding Success Modal State
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [hiredCandidate, setHiredCandidate] = useState<any>(null);

  // Schedule Interview Modal State
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [selectedAppForInterview, setSelectedAppForInterview] = useState<any>(null);

  // Drag & Drop State
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  const formatDDMMYYYY = (dateVal: any) => {
    if (!dateVal) return "";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchApplications = async () => {
    try {
      const [resApps, resIv] = await Promise.all([
        fetch("/api/recruitment/applications"),
        fetch("/api/recruitment/interviews").catch(() => null)
      ]);
      const data = await resApps.json();
      const ivList = resIv && resIv.ok ? await resIv.json().catch(() => []) : [];
      if (Array.isArray(data)) {
        const enriched = data.map((app: any) => {
          if (Array.isArray(app.interviews) && app.interviews.length > 0) return app;
          const matchedIv = Array.isArray(ivList) ? ivList.filter((iv: any) => iv.applicationId === app.id) : [];
          return { ...app, interviews: matchedIv };
        });
        setApplications(enriched);
      } else {
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
    return (
      <div className="max-w-7xl mx-auto py-6">
        <CardGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col animate-swiss-in pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
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
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'KANBAN' ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> <span>Bảng ứng viên</span>
            </button>
            <button 
              onClick={() => setActiveTab("JOBS")} 
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'JOBS' ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
            >
              <Briefcase className="w-3.5 h-3.5" /> <span>Tin tuyển dụng</span>
            </button>
          </div>
        )}
      </div>

      {/* Recruitment Pipeline Funnel Strip (Swiss Conversion Bar) */}
      <div className="bento-card p-0 overflow-hidden grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200/80 dark:divide-zinc-800">
        {COLUMNS.map((stage, idx) => {
          const count = applications.filter((a) => a.status === stage.id).length;
          const pct = applications.length > 0 ? Math.round((count / applications.length) * 100) : 0;
          return (
            <div key={stage.id} className="p-4 flex flex-col justify-between bg-white dark:bg-zinc-900">
              <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                  {stage.label}
                </span>
                <span className="font-mono text-[10px] text-zinc-400">0{idx + 1}</span>
              </div>
              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">{count}</span>
                <span className="text-[11px] font-mono text-zinc-500">{pct}%</span>
              </div>
              <div className="mt-2 w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full ${stage.dotColor} transition-all duration-300`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      {activeTab === "KANBAN" ? (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max h-full">
          {COLUMNS.map(col => {
            const columnApps = applications.filter(app => app.status === col.id);
            const isDragOver = dragOverColId === col.id;
            return (
              <div
                key={col.id}
                onDragOver={(e) => {
                  if (!canReviewCandidates) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragOverColId !== col.id) setDragOverColId(col.id);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverColId(prev => (prev === col.id ? null : prev));
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverColId(null);
                  if (!canReviewCandidates) return;
                  const appId = e.dataTransfer.getData("text/plain") || draggedAppId;
                  setDraggedAppId(null);
                  if (appId) {
                    const targetApp = applications.find(a => a.id === appId);
                    if (targetApp && targetApp.status !== col.id) {
                      handleStatusChange(appId, col.id);
                    }
                  }
                }}
                className={`w-[320px] bento-card rounded-2xl flex flex-col overflow-hidden shrink-0 shadow-xs border transition-colors ${
                  isDragOver
                    ? "border-blue-500 bg-blue-50/30 dark:bg-blue-950/20"
                    : "bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800"
                }`}
              >
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
                  {columnApps.map(app => {
                    const latestInterview = app.interviews?.length > 0
                      ? [...app.interviews].sort((a: any, b: any) => new Date(b.scheduledAt || b.createdAt || 0).getTime() - new Date(a.scheduledAt || a.createdAt || 0).getTime())[0]
                      : null;

                    return (
                      <div
                        key={app.id}
                        draggable={canReviewCandidates}
                        onDragStart={(e) => {
                          if (!canReviewCandidates) return;
                          setDraggedAppId(app.id);
                          e.dataTransfer.setData("text/plain", app.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => {
                          setDraggedAppId(null);
                          setDragOverColId(null);
                        }}
                        className={`bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all ${
                          canReviewCandidates ? "cursor-grab active:cursor-grabbing" : ""
                        } ${draggedAppId === app.id ? "opacity-50 scale-[0.98]" : ""}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{app.candidateName}</h4>
                          <a href={app.cvUrl} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-blue-600 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Xem CV">
                            <FileText className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2.5 line-clamp-1">{app.jobPosting?.title}</div>

                        {app.interviews?.length > 0 && latestInterview && (
                          <div className="mb-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-[11px] font-medium text-amber-700 dark:text-amber-300 font-mono">
                            <CalendarIcon className="w-3 h-3 shrink-0" />
                            <span>PV: {formatDDMMYYYY(latestInterview.scheduledAt || latestInterview.createdAt)}</span>
                          </div>
                        )}
                        
                        <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-3 border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
                          <div className="flex items-center gap-1.5 font-mono"><Mail className="w-3 h-3 text-zinc-400 shrink-0" /> <span className="truncate">{app.candidateEmail}</span></div>
                          <div className="flex items-center gap-1.5 font-mono"><Phone className="w-3 h-3 text-zinc-400 shrink-0" /> <span>{app.candidatePhone || "N/A"}</span></div>
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

                        {canReviewCandidates && (
                          <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                            {["APPLIED", "REVIEWING", "INTERVIEWING"].includes(app.status) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAppForInterview(app);
                                  setIsInterviewModalOpen(true);
                                }}
                                className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 px-2 py-1 rounded-md flex items-center gap-1 border border-amber-200/60 dark:border-amber-800/60 transition-colors"
                                title="Lên lịch phỏng vấn"
                              >
                                <CalendarIcon className="w-3 h-3" />
                                <span>Lịch PV</span>
                              </button>
                            )}
                            <div className="flex items-center gap-1.5 ml-auto">
                              <span className="text-xs text-zinc-400 font-medium">Chuyển:</span>
                              <select 
                                value={app.status}
                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                className="text-xs border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50 dark:bg-zinc-800/60 py-1 px-2 text-zinc-700 dark:text-zinc-300 outline-none focus:border-blue-500"
                              >
                                {COLUMNS.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">{c.label}</option>)}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {columnApps.length === 0 && (
                    <div className="text-center text-xs text-zinc-400 py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                      Chưa có ứng viên
                    </div>
                  )}
                </div>
              </div>
            );
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

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        candidate={selectedAppForInterview}
        onSuccess={fetchApplications}
      />
    </div>
  );
}
