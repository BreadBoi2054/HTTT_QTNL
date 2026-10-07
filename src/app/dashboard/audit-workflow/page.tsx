"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  GitBranch, 
  History, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Layers,
  Lock,
  Plus,
  Settings,
  Eye
} from "lucide-react";
import CreateWorkflowModal from "@/components/audit-workflow/CreateWorkflowModal";
import WorkflowConfigModal from "@/components/audit-workflow/WorkflowConfigModal";
import AuditLogDetailModal from "@/components/audit-workflow/AuditLogDetailModal";

interface Workflow {
  id: string;
  name: string;
  category: string;
  stepsCount: number;
  sla: string;
  activeRequests: number;
  steps: string[];
  status: string;
}

interface AuditLog {
  id: string;
  createdAt: string;
  userName: string;
  userRole: string;
  action: string;
  target: string;
  ip: string;
  status: string;
}

const initialWorkflows: Workflow[] = [
  {
    id: "1",
    name: "Quy trình Duyệt Tuyển dụng & Onboarding mới",
    category: "Nhân sự & Tuyển dụng",
    stepsCount: 4,
    sla: "48 giờ",
    activeRequests: 3,
    steps: ["Trưởng Bộ phận đề xuất", "HR Sàng lọc & Phỏng vấn", "CFO Duyệt Ngân sách", "CEO Ký hợp đồng"],
    status: "ACTIVE"
  },
  {
    id: "2",
    name: "Quy trình Điều chỉnh Lương & Bổ nhiệm chức vụ",
    category: "Lương thưởng & Đãi ngộ",
    stepsCount: 3,
    sla: "72 giờ",
    activeRequests: 2,
    steps: ["Quản lý đánh giá hiệu suất", "C&B Thẩm định ngạch bậc", "Ban Giám Đốc phê duyệt"],
    status: "ACTIVE"
  },
  {
    id: "3",
    name: "Quy trình Phê duyệt Nghỉ phép đặc biệt (> 3 ngày)",
    category: "Chấm công & Nghỉ phép",
    stepsCount: 2,
    sla: "24 giờ",
    activeRequests: 5,
    steps: ["Quản lý trực tiếp xác nhận", "Chuyên viên Nhân sự lưu hồ sơ"],
    status: "ACTIVE"
  }
];

export default function AuditWorkflowPage() {
  const [activeTab, setActiveTab] = useState<"workflow" | "audit">("workflow");
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals state
  const [isCreateWfOpen, setIsCreateWfOpen] = useState(false);
  const [selectedWfForConfig, setSelectedWfForConfig] = useState<Workflow | null>(null);
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit-workflow");
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleWorkflowCreated = (newWf: Workflow) => {
    setWorkflows([newWf, ...workflows]);
  };

  const handleWorkflowSaved = (updatedWf: Workflow) => {
    setWorkflows(workflows.map(wf => wf.id === updatedWf.id ? updatedWf : wf));
  };

  const handleExportAuditCSV = () => {
    if (filteredLogs.length === 0) {
      alert("Không có dữ liệu nhật ký kiểm toán để xuất.");
      return;
    }

    const headers = [
      "Mã Sự Kiện (UUID)",
      "Thời Gian Ghi Nhận",
      "Người Thực Hiện",
      "Vai Trò Phân Quyền",
      "Hành Động Chi Tiết",
      "Đối Tượng Tác Động",
      "Địa Chỉ IP",
      "Trạng Thái"
    ];

    const rows = filteredLogs.map((log) => [
      `"${log.id}"`,
      `"${new Date(log.createdAt).toLocaleString("vi-VN")}"`,
      `"${(log.userName || "").replace(/"/g, '""')}"`,
      `"${log.userRole || ""}"`,
      `"${(log.action || "").replace(/"/g, '""')}"`,
      `"${(log.target || "").replace(/"/g, '""')}"`,
      `"${log.ip || "127.0.0.1"}"`,
      `"${log.status || "SUCCESS"}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Nhat_Ky_Kiem_Toan_Nexustech_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter(l => 
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.userName?.toLowerCase().includes(search.toLowerCase()) ||
    l.target?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedLogForDetail) setSelectedLogForDetail(null);
        else if (selectedWfForConfig) setSelectedWfForConfig(null);
        else if (isCreateWfOpen) setIsCreateWfOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedLogForDetail, selectedWfForConfig, isCreateWfOpen]);

  return (
    <>
      <div className="space-y-6 animate-swiss-in pb-12 max-w-7xl mx-auto">
        {/* Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                Kiểm Toán & Luồng Phê Duyệt
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
              Quy Trình Chuẩn (SOP) & Nhật Ký Kiểm Toán
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Chuẩn hóa luồng phê duyệt đa cấp và lưu trữ nhật ký kiểm toán hệ thống bất biến
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex bg-zinc-100/80 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
              <button
                onClick={() => setActiveTab("workflow")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "workflow"
                    ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Luồng quy trình ({workflows.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("audit")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "audit"
                    ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Nhật ký kiểm toán ({logs.length})</span>
              </button>
            </div>

            {activeTab === "audit" ? (
              <button 
                onClick={handleExportAuditCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-semibold border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs transition-all active:scale-95"
                title="Xuất nhật ký kiểm toán ra file CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất Báo cáo CSV</span>
              </button>
            ) : (
              <button 
                onClick={() => setIsCreateWfOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo luồng mới</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Stat Bento Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bento-card p-5 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Quy trình (SOP)</span>
              <div className="squircle w-9 h-9 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-all">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-blue-600 dark:text-blue-400">{workflows.length} <span className="text-sm font-sans font-medium text-zinc-500">Luồng</span></div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Phê duyệt tự động đa cấp</div>
          </div>

          <div className="bento-card p-5 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Đang xử lý</span>
              <div className="squircle w-9 h-9 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-all">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-purple-600 dark:text-purple-400">
              {workflows.reduce((acc, curr) => acc + (curr.activeRequests || 0), 0)}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Hồ sơ trong hạn mức SLA</div>
          </div>

          <div className="bento-card p-5 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Đúng hạn SLA</span>
              <div className="squircle w-9 h-9 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-all">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">98.2%</div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Thời gian trung bình: 14h</div>
          </div>

          <div className="bento-card p-5 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Nhật ký bảo mật</span>
              <div className="squircle w-9 h-9 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-all">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-teal-600 dark:text-teal-400">{logs.length} <span className="text-sm font-sans font-medium text-zinc-500">Bản ghi</span></div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Audit log hệ thống bảo mật</div>
          </div>
        </div>

        {/* Tab 1: Workflows */}
        {activeTab === "workflow" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                className="bento-card rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/60 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold">
                      {wf.category}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono font-medium">
                      SLA: <strong className="font-bold text-zinc-800 dark:text-zinc-200">{wf.sla}</strong>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {wf.name}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                      Các bước duyệt ({wf.stepsCount} cấp):
                    </div>
                    {wf.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                        <span className="w-5 h-5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-center font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 shrink-0">
                          0{idx + 1}
                        </span>
                        <span className="truncate">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3.5 mt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-medium">Đang xử lý: <strong className="text-zinc-800 dark:text-zinc-200 font-mono font-bold">{wf.activeRequests} hồ sơ</strong></span>
                  <button 
                    onClick={() => setSelectedWfForConfig(wf)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl font-semibold transition-all shadow-2xs border border-blue-200/60 dark:border-blue-800/60"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Cấu hình</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Audit Logs */}
        {activeTab === "audit" && (
          <div className="bento-card rounded-2xl overflow-hidden shadow-xs">
            {/* Search bar */}
            <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-900/40">
              <div className="relative w-full max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Tìm theo hành động hoặc người thực hiện..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs focus:outline-none focus:border-blue-600 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
                />
              </div>
              <div className="text-xs text-zinc-500 hidden sm:flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Lưu trữ nhật ký kiểm toán bất biến</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 text-xs font-semibold border-b border-zinc-100 dark:border-zinc-800 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Thời gian</th>
                    <th className="px-5 py-3.5">Người thực hiện</th>
                    <th className="px-5 py-3.5">Hành động ghi nhận</th>
                    <th className="px-5 py-3.5">Đối tượng tác động</th>
                    <th className="px-5 py-3.5 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-zinc-500 text-xs">
                        Đang tải nhật ký kiểm toán...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-zinc-500 text-xs">
                        Không có bản ghi nhật ký nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr 
                        key={log.id} 
                        onClick={() => setSelectedLogForDetail(log)}
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3.5 font-mono text-zinc-500 text-xs">
                          {new Date(log.createdAt).toLocaleString("vi-VN")}
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">{log.userName}</div>
                          <span className="text-[11px] text-zinc-500 font-mono">{log.userRole}</span>
                        </td>

                        <td className="px-5 py-3.5 font-medium text-zinc-800 dark:text-zinc-200 text-xs max-w-md truncate">
                          {log.action}
                        </td>

                        <td className="px-5 py-3.5 text-zinc-500 font-mono text-xs">
                          {log.target}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLogForDetail(log);
                            }}
                            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 font-semibold transition-all shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" /> <span>Chi tiết</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateWorkflowModal
        isOpen={isCreateWfOpen}
        onClose={() => setIsCreateWfOpen(false)}
        onCreated={handleWorkflowCreated}
      />

      <WorkflowConfigModal
        isOpen={Boolean(selectedWfForConfig)}
        onClose={() => setSelectedWfForConfig(null)}
        workflow={selectedWfForConfig}
        onSave={handleWorkflowSaved}
      />

      <AuditLogDetailModal
        isOpen={Boolean(selectedLogForDetail)}
        onClose={() => setSelectedLogForDetail(null)}
        log={selectedLogForDetail}
      />
    </>
  );
}
