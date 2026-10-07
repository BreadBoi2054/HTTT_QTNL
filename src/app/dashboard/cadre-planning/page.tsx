"use client";

import { useState, useEffect } from "react";
import { 
  Award, 
  ShieldCheck, 
  Target, 
  Grid3X3, 
  ListTree, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Briefcase,
  X,
  Printer,
  ChevronRight,
  Sparkles,
  Building2
} from "lucide-react";

interface SuccessionPlan {
  id: string;
  position: string;
  department: string;
  currentHolder: string;
  successorName: string;
  successorEmail: string;
  readiness: string;
  potentialScore: string;
  mentor: string;
  plannedYear: string;
  status: string;
}

export default function CadrePlanningPage() {
  const [activeView, setActiveView] = useState<"pipeline" | "nineBox">("pipeline");
  const [plans, setPlans] = useState<SuccessionPlan[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoadmapItem, setSelectedRoadmapItem] = useState<SuccessionPlan | null>(null);

  // Form State
  const [form, setForm] = useState({
    position: "",
    department: "Phòng Công nghệ (IT)",
    currentHolder: "",
    successorName: "",
    successorEmail: "",
    readiness: "READY_1_2_YEARS",
    potentialScore: "HIGH",
    mentor: "",
    plannedYear: "2026 - 2028",
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const [plansRes, empRes, deptRes] = await Promise.all([
        fetch("/api/cadre-planning"),
        fetch("/api/employees"),
        fetch("/api/departments")
      ]);
      const [plansData, empData, deptData] = await Promise.all([
        plansRes.json(),
        empRes.json(),
        deptRes.json()
      ]);
      setPlans(Array.isArray(plansData) ? plansData : []);
      if (Array.isArray(empData)) setEmployees(empData);
      if (Array.isArray(deptData)) {
        setDepartments(deptData);
        if (deptData.length > 0 && !form.department) {
          setForm(prev => ({ ...prev, department: deptData[0].name }));
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/cadre-planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        fetchPlans();
        setIsModalOpen(false);
        setForm({
          position: "",
          department: "Phòng Công nghệ (IT)",
          currentHolder: "",
          successorName: "",
          successorEmail: "",
          readiness: "READY_1_2_YEARS",
          potentialScore: "HIGH",
          mentor: "",
          plannedYear: "2026 - 2028",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getReadinessLabel = (r: string) => {
    switch (r) {
      case "READY_NOW": return "Sẵn sàng ngay (< 6 tháng)";
      case "READY_1_2_YEARS": return "Dự nguồn ngắn hạn (1-2 năm)";
      case "DEVELOPING": return "Đang bồi dưỡng (> 2 năm)";
      default: return r;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedRoadmapItem) setSelectedRoadmapItem(null);
        else if (isModalOpen) setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRoadmapItem, isModalOpen]);

  return (
    <div className="space-y-6 animate-swiss-in pb-12 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              <Sparkles className="w-3.5 h-3.5" />
              Chiến Lược Nhân Tài & Kế Nhiệm
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
            Quy Hoạch Cán Bộ & Lãnh Đạo Dự Nguồn
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Xây dựng bản đồ kế nhiệm cho các vị trí trọng yếu, lộ trình bồi dưỡng và ma trận 9-Box
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-zinc-100/80 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
            <button
              onClick={() => setActiveView("pipeline")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeView === "pipeline"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <ListTree className="w-3.5 h-3.5" />
              <span>Lộ trình kế nhiệm</span>
            </button>
            <button
              onClick={() => setActiveView("nineBox")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeView === "nineBox"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Ma trận 9-Box</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Đề xuất quy hoạch</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Bento Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-card p-5 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Độ bao phủ quy hoạch</span>
            <div className="squircle w-9 h-9 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-all">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono tracking-tight text-blue-600 dark:text-blue-400">92%</div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">11/12 vị trí trọng yếu có nguồn</div>
        </div>

        <div className="bento-card p-5 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Cán bộ quy hoạch nguồn</span>
            <div className="squircle w-9 h-9 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-all">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">{plans.length || 18}</div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Lãnh đạo dự nguồn tiềm năng</div>
        </div>

        <div className="bento-card p-5 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Chỉ số sẵn sàng</span>
            <div className="squircle w-9 h-9 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-all">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono tracking-tight text-purple-600 dark:text-purple-400">85.4%</div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Sẵn sàng tiếp quản công việc</div>
        </div>

        <div className="bento-card p-5 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tỷ lệ giữ chân</span>
            <div className="squircle w-9 h-9 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-all">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono tracking-tight text-teal-600 dark:text-teal-400">98%</div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Chế độ đãi ngộ & thăng tiến</div>
        </div>
      </div>

      {/* View 1: Pipeline List */}
      {activeView === "pipeline" && (
        <div className="space-y-3">
          {loading ? (
            <div className="p-16 text-center text-zinc-500 text-xs">
              Đang tải danh sách quy hoạch...
            </div>
          ) : (
            plans.map((item) => (
              <div
                key={item.id}
                className="bento-card rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:shadow-md transition-all group"
              >
                {/* Left: Position Info */}
                <div className="lg:w-1/3">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1.5 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                    <span>{item.department}</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.position}
                  </h3>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Đương nhiệm: <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{item.currentHolder}</span>
                  </div>
                </div>

                {/* Middle: Successor Target */}
                <div className="lg:w-1/3 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                    Cán bộ quy hoạch nguồn
                  </div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.successorName}</div>
                  <div className="text-xs text-zinc-500 mb-2 font-mono">{item.successorEmail}</div>
                  <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-700/80 text-xs text-zinc-500">
                    Cố vấn (Mentor): <span className="text-zinc-800 dark:text-zinc-200 font-medium">{item.mentor}</span>
                  </div>
                </div>

                {/* Right: Readiness & Actions */}
                <div className="lg:w-1/3 flex flex-col lg:items-end justify-between gap-3">
                  <div className="space-y-1.5 lg:text-right">
                    <div className="text-xs text-zinc-500">Kỳ quy hoạch: <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">{item.plannedYear}</span></div>
                    <div>
                      <span className="inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/60 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold">
                        {getReadinessLabel(item.readiness)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã phê duyệt
                    </span>
                    <button 
                      onClick={() => setSelectedRoadmapItem(item)}
                      className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <span>Lộ trình chi tiết</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* View 2: Ma trận 9-Box Grid */}
      {activeView === "nineBox" && (
        <div className="bento-card rounded-2xl p-6 shadow-xs">
          <div className="mb-5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Ma trận Đánh giá Năng lực 9-Box Grid</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Phân loại cán bộ dựa trên Tiềm năng phát triển và Hiệu suất công việc</p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {/* Row 1: High Potential */}
            <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30 text-left">
              <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-0.5">Enigma / Hạt giống thô</div>
              <p className="text-[11px] text-zinc-500 mb-3">Tiềm năng Cao - Hiệu suất TB</p>
              <div className="text-xs bg-white dark:bg-zinc-900 p-2.5 rounded-xl font-semibold border border-zinc-200 dark:border-zinc-800 shadow-2xs">Lê Quốc Bảo</div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30 text-left">
              <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-0.5">Ngôi sao đang lên (Growth Star)</div>
              <p className="text-[11px] text-zinc-500 mb-3">Tiềm năng Cao - Hiệu suất Khá</p>
              <div className="text-xs bg-white dark:bg-zinc-900 p-2.5 rounded-xl font-semibold border border-zinc-200 dark:border-zinc-800 shadow-2xs">Trần Thị Mai</div>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/30 text-left">
              <div className="text-xs font-extrabold text-blue-700 dark:text-blue-400 mb-0.5">Nhân sự hạt giống (Top Talent)</div>
              <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mb-3">Tiềm năng Xuất sắc - Hiệu suất Cao</p>
              <div className="text-xs bg-white dark:bg-zinc-900 p-2.5 rounded-xl font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-2xs">
                Nguyễn Văn An (Lead)
              </div>
            </div>

            {/* Row 2: Medium Potential */}
            <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/20 text-left">
              <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-0.5">Dilemma</div>
              <p className="text-[11px] text-zinc-500">Tiềm năng TB - Hiệu suất TB</p>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/20 text-left">
              <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-0.5">Thành viên nòng cốt (Core Contributor)</div>
              <p className="text-[11px] text-zinc-500">Tiềm năng TB - Hiệu suất Khá</p>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/20 text-left">
              <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-0.5">Hiệu suất cao (High Impact)</div>
              <p className="text-[11px] text-zinc-500">Tiềm năng TB - Hiệu suất Cao</p>
            </div>

            {/* Row 3: Low Potential */}
            <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-800/10 text-left">
              <div className="text-xs font-medium text-zinc-500 mb-0.5">Cần cải thiện (Underperformer)</div>
              <p className="text-[11px] text-zinc-400">Cần kế hoạch cải thiện</p>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-800/10 text-left">
              <div className="text-xs font-medium text-zinc-500 mb-0.5">Chuyên môn ổn định (Effective Player)</div>
              <p className="text-[11px] text-zinc-400">Chuyên môn ổn định</p>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-800/10 text-left">
              <div className="text-xs font-medium text-zinc-500 mb-0.5">Chuyên gia tin cậy (Trusted Expert)</div>
              <p className="font-mono text-[10px] text-zinc-400">Chuyên gia cốt cán</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Đề xuất quy hoạch */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full p-6 shadow-xl border border-zinc-200 dark:border-zinc-800"
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Đề xuất Quy hoạch Cán bộ Kế nhiệm</h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Thoát</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  1. Vị trí chức danh quy hoạch <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="leadership-positions"
                  placeholder="Ví dụ: Giám đốc Kỹ thuật (CTO), Giám đốc Tài chính (CFO)..."
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 text-zinc-900 dark:text-zinc-100"
                />
                <datalist id="leadership-positions">
                  <option value="Giám đốc Công nghệ (CTO)" />
                  <option value="Giám đốc Tài chính (CFO)" />
                  <option value="Giám đốc Nhân sự Tập đoàn (CHRO)" />
                  <option value="Giám đốc Kinh doanh Toàn quốc" />
                  <option value="Giám đốc Marketing & Thương hiệu" />
                  <option value="Phó Giám đốc Kỹ thuật" />
                  <option value="Phó Giám đốc Kinh doanh" />
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    2. Phòng ban đơn vị <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 text-zinc-900 dark:text-zinc-100"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    3. Đương nhiệm hiện tại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="current-holders-list"
                    placeholder="Chọn hoặc nhập tên..."
                    value={form.currentHolder}
                    onChange={(e) => setForm({ ...form, currentHolder: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 text-zinc-900 dark:text-zinc-100"
                  />
                  <datalist id="current-holders-list">
                    {employees.map(e => (
                      <option key={e.id} value={`${e.user.name} (${e.position})`} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Successor Selection from Employees List */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  4. Chọn cán bộ quy hoạch nguồn từ danh sách <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={employees.find(e => e.user.name === form.successorName)?.id || ""}
                  onChange={(e) => {
                    const empId = e.target.value;
                    const selected = employees.find(emp => emp.id === empId);
                    if (selected) {
                      setForm(prev => ({
                        ...prev,
                        successorName: selected.user.name,
                        successorEmail: selected.user.email,
                      }));
                    }
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 text-zinc-900 dark:text-zinc-100 font-sans"
                >
                  <option value="">-- Chọn cán bộ nguồn tiềm năng --</option>
                  {employees
                    .filter(e => e.status !== "RESIGNED")
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.user.name} - {emp.position} ({emp.department?.name || "Chưa xếp phòng"})
                      </option>
                    ))}
                </select>

                {form.successorName && (
                  <div className="mt-2 p-2.5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg text-xs flex items-center justify-between">
                    <div>
                      <span className="text-blue-700 dark:text-blue-300 font-semibold">Cán bộ nguồn: {form.successorName}</span>
                      <div className="text-zinc-500 dark:text-zinc-400">{form.successorEmail}</div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium">
                      Đã liên kết hồ sơ
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    5. Mức độ sẵn sàng tiếp quản <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.readiness}
                    onChange={(e) => setForm({ ...form, readiness: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="READY_NOW">Sẵn sàng ngay (&lt; 6 tháng)</option>
                    <option value="READY_1_2_YEARS">Dự nguồn ngắn hạn (1-2 năm)</option>
                    <option value="DEVELOPING">Đang bồi dưỡng (&gt; 2 năm)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    6. Cố vấn (Mentor) kèm cặp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="mentors-list"
                    placeholder="Chọn cố vấn..."
                    value={form.mentor}
                    onChange={(e) => setForm({ ...form, mentor: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 text-zinc-900 dark:text-zinc-100"
                  />
                  <datalist id="mentors-list">
                    <option value="Quản trị viên (Tổng Giám Đốc / CEO)" />
                    <option value="Lê Tuấn Anh (IT Manager)" />
                    <option value="Trần Thị Mai (HR Manager)" />
                    <option value="Đặng Thu Hòa (Kế toán trưởng)" />
                    <option value="Nguyễn Hoàng Nam (Sales Director)" />
                    <option value="Vũ Thu Trang (Marketing Manager)" />
                    {employees.map(e => <option key={e.id} value={`${e.user.name} (${e.position})`} />)}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  7. Kỳ quy hoạch dự kiến <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="years-list"
                  placeholder="2026 - 2028"
                  value={form.plannedYear}
                  onChange={(e) => setForm({ ...form, plannedYear: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 text-zinc-900 dark:text-zinc-100"
                />
                <datalist id="years-list">
                  <option value="2026 - 2027" />
                  <option value="2026 - 2028" />
                  <option value="2027 - 2029" />
                  <option value="2028 - 2030" />
                </datalist>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Thoát</span>
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-medium shadow-xs transition-colors"
                >
                  Lưu hồ sơ quy hoạch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lộ trình Kế nhiệm Chi tiết */}
      {selectedRoadmapItem && (
        <div 
          onClick={() => setSelectedRoadmapItem(null)}
          className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 inline-flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Lộ trình bồi dưỡng & Kế nhiệm cán bộ nguồn
                  </span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                  Kế hoạch Kế nhiệm: {selectedRoadmapItem.position}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Đơn vị: {selectedRoadmapItem.department} • Kỳ quy hoạch: {selectedRoadmapItem.plannedYear}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedRoadmapItem(null)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Thoát</span>
              </button>
            </div>

            {/* Personnel Summary Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
              <div>
                <div className="text-[11px] font-medium text-zinc-500">Cán bộ kế nhiệm</div>
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">{selectedRoadmapItem.successorName}</div>
                <div className="text-xs text-zinc-500 truncate">{selectedRoadmapItem.successorEmail}</div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-zinc-500">Đương nhiệm hiện tại</div>
                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{selectedRoadmapItem.currentHolder}</div>
                <div className="text-[11px] text-zinc-400">Chuyển giao quyền</div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-zinc-500">Cố vấn kèm cặp</div>
                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{selectedRoadmapItem.mentor}</div>
                <div className="text-[11px] text-zinc-400">Cố vấn chuyên môn</div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-zinc-500">Mức độ sẵn sàng</div>
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{getReadinessLabel(selectedRoadmapItem.readiness)}</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Tiềm năng: {selectedRoadmapItem.potentialScore}</div>
              </div>
            </div>

            {/* Detailed Roadmap Milestones */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Lộ trình 4 giai đoạn đào tạo & thử thách năng lực
              </h4>

              <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
                {/* Stage 1 */}
                <div className="flex gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 z-10 bg-white dark:bg-zinc-900">
                    01
                  </div>
                  <div className="flex-1 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        Giai đoạn 1: Nâng cao năng lực Lãnh đạo & Quản trị mục tiêu (Tháng 1 - 6)
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-medium">
                        Hoàn thành 100%
                      </span>
                    </div>
                    <ul className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 space-y-1 list-disc list-inside">
                      <li>Hoàn thành khóa học Quản trị Chiến lược & Thiết lập OKR/KPI cấp phòng ban.</li>
                      <li>Kèm cặp 1-on-1 hàng tháng cùng Cố vấn trưởng: {selectedRoadmapItem.mentor}.</li>
                      <li>Đạt chứng chỉ Năng lực Quản lý Nội bộ Nexus Leadership Level 2.</li>
                    </ul>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="flex gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 border-2 border-blue-500 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 z-10 bg-white dark:bg-zinc-900">
                    02
                  </div>
                  <div className="flex-1 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        Giai đoạn 2: Luân chuyển thực chiến & Chủ trì dự án trọng điểm (Tháng 7 - 12)
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium">
                        Đang triển khai (75%)
                      </span>
                    </div>
                    <ul className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 space-y-1 list-disc list-inside">
                      <li>Đảm nhiệm vị trí Phó ban Điều phối Dự án Chuyển đổi số liên phòng ban.</li>
                      <li>Thực hành ra quyết định phân bổ ngân sách và quản trị rủi ro vận hành.</li>
                      <li>Báo cáo tiến độ trực tiếp trước Ban Tổng Giám Đốc định kỳ mỗi quý.</li>
                    </ul>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="flex gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-zinc-400 text-zinc-600 dark:text-zinc-400 flex items-center justify-center font-bold text-xs shrink-0 z-10 bg-white dark:bg-zinc-900">
                    03
                  </div>
                  <div className="flex-1 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        Giai đoạn 3: Đánh giá Năng lực Toàn diện 360 độ (Tháng 13 - 18)
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-medium">
                        Dự kiến kỳ tới
                      </span>
                    </div>
                    <ul className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 space-y-1 list-disc list-inside">
                      <li>Khảo sát mức độ tín nhiệm từ Ban Lãnh đạo, Trưởng bộ phận và các nhân viên trực thuộc.</li>
                      <li>Thực hiện buổi thuyết trình bảo vệ Chiến lược Hành động 3 năm trước Hội đồng Thẩm định.</li>
                    </ul>
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="flex gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-zinc-400 text-zinc-600 dark:text-zinc-400 flex items-center justify-center font-bold text-xs shrink-0 z-10 bg-white dark:bg-zinc-900">
                    04
                  </div>
                  <div className="flex-1 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        Giai đoạn 4: Bàn giao toàn diện & Bổ nhiệm chính thức (Tháng 19 - 24)
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-medium">
                        Giai đoạn đích
                      </span>
                    </div>
                    <ul className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 space-y-1 list-disc list-inside">
                      <li>Tiếp nhận toàn bộ thẩm quyền, nhân sự và tài sản từ đương nhiệm: {selectedRoadmapItem.currentHolder}.</li>
                      <li>Ban Tổng Giám Đốc ban hành Quyết định Bổ nhiệm chính thức vị trí {selectedRoadmapItem.position}.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment Note */}
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 rounded-xl">
              <strong className="font-semibold">Nhận xét Hội đồng Cán bộ:</strong> Cán bộ thể hiện tư duy chiến lược tốt, tinh thần trách nhiệm cao và nhận được sự tín nhiệm lớn từ đơn vị. Khuyến nghị duy trì tiến độ hoàn thành các chỉ tiêu thử thách ở Giai đoạn 2.
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> In Lộ Trình / Xuất PDF
              </button>

              <button
                type="button"
                onClick={() => setSelectedRoadmapItem(null)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Thoát</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
