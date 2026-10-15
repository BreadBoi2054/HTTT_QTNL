"use client";

import { useState, useEffect } from "react";
import { 
  Target, 
  Award, 
  Search, 
  Download, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  BarChart3, 
  Filter,
  Eye,
  TrendingUp
} from "lucide-react";
import EvaluationModal from "@/components/performance/EvaluationModal";

interface EvaluationItem {
  id: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  position: string;
  selfScore: number;
  managerScore: number;
  criterion1: number;
  criterion2: number;
  criterion3: number;
  totalScore: number;
  grade: string;
  bonus: string;
  status: "APPROVED" | "PENDING_REVIEW" | "SELF_ASSESSED";
  managerNotes?: string;
}

const initialEvaluations: EvaluationItem[] = [
  {
    id: "eval_001",
    employeeName: "Trần Văn An",
    employeeCode: "NX-08942",
    department: "Khối Công Nghệ & Phần Mềm",
    position: "Kỹ Sư Phần Mềm Cao Cấp",
    selfScore: 92,
    managerScore: 95,
    criterion1: 96,
    criterion2: 92,
    criterion3: 94,
    totalScore: 94.5,
    grade: "HẠNG A (XUẤT SẮC)",
    bonus: "+25% Lương CB",
    status: "APPROVED",
    managerNotes: "Chủ trì kiến trúc hạ tầng Cloud Microservices vượt tiến độ 2 tuần. Tinh thần trách nhiệm và dẫn dắt đội ngũ tuyệt vời."
  },
  {
    id: "eval_002",
    employeeName: "Lê Thị Bích",
    employeeCode: "NX-07211",
    department: "Khối Kinh Doanh & Tiếp Thị",
    position: "Trưởng Nhóm Khách Hàng Doanh Nghiệp",
    selfScore: 88,
    managerScore: 90,
    criterion1: 92,
    criterion2: 88,
    criterion3: 86,
    totalScore: 89.5,
    grade: "HẠNG B (HOÀN THÀNH TỐT)",
    bonus: "+10% Lương CB",
    status: "APPROVED",
    managerNotes: "Đạt 115% chỉ tiêu doanh số giải pháp phần mềm B2B cho khách hàng khối Tài chính - Ngân hàng."
  },
  {
    id: "eval_003",
    employeeName: "Phạm Minh Cường",
    employeeCode: "NX-09102",
    department: "Khối Quản Trị Nhân Lực & Đào Tạo",
    position: "Chuyên Viên Tuyển Dụng & Đãi Ngộ",
    selfScore: 82,
    managerScore: 85,
    criterion1: 85,
    criterion2: 84,
    criterion3: 82,
    totalScore: 84.0,
    grade: "HẠNG B (HOÀN THÀNH TỐT)",
    bonus: "+10% Lương CB",
    status: "APPROVED",
    managerNotes: "Rút ngắn thời gian tuyển dụng ứng viên kỹ thuật cao từ 30 ngày xuống 18 ngày."
  },
  {
    id: "eval_004",
    employeeName: "Ngô Đức Dũng",
    employeeCode: "NX-06433",
    department: "Khối R&D & Trí Tuệ Nhân Tạo",
    position: "Chuyên Gia Nghiên Cứu AI",
    selfScore: 95,
    managerScore: 96,
    criterion1: 98,
    criterion2: 94,
    criterion3: 96,
    totalScore: 96.5,
    grade: "HẠNG A (XUẤT SẮC)",
    bonus: "+25% Lương CB",
    status: "APPROVED",
    managerNotes: "Công bố thành công mô hình AI chuyên dụng nhận diện tài liệu doanh nghiệp độ chính xác 99.4%."
  },
  {
    id: "eval_005",
    employeeName: "Hoàng Thị Mai",
    employeeCode: "NX-05189",
    department: "Khối Tài Chính & Kế Toán",
    position: "Kế Toán Trưởng Bộ Phận",
    selfScore: 86,
    managerScore: 88,
    criterion1: 90,
    criterion2: 88,
    criterion3: 82,
    totalScore: 87.5,
    grade: "HẠNG B (HOÀN THÀNH TỐT)",
    bonus: "+10% Lương CB",
    status: "APPROVED",
    managerNotes: "Hoàn tất kiểm toán nội bộ và đối soát chi phí Q3 chính xác 100%, không phát sinh sai lệch."
  },
  {
    id: "eval_006",
    employeeName: "Vũ Hải Đăng",
    employeeCode: "NX-09811",
    department: "Khối Công Nghệ & Phần Mềm",
    position: "Kỹ Sư DevOps & SRE",
    selfScore: 80,
    managerScore: 82,
    criterion1: 84,
    criterion2: 80,
    criterion3: 78,
    totalScore: 81.5,
    grade: "HẠNG B (HOÀN THÀNH TỐT)",
    bonus: "+10% Lương CB",
    status: "APPROVED"
  },
  {
    id: "eval_007",
    employeeName: "Đỗ Thu Hương",
    employeeCode: "NX-07340",
    department: "Khối Dịch Vụ Khách Hàng",
    position: "Chuyên Viên Chăm Sóc Khách Hàng VIP",
    selfScore: 78,
    managerScore: 75,
    criterion1: 76,
    criterion2: 80,
    criterion3: 70,
    totalScore: 75.5,
    grade: "HẠNG B (HOÀN THÀNH TỐT)",
    bonus: "+10% Lương CB",
    status: "APPROVED"
  },
  {
    id: "eval_008",
    employeeName: "Bùi Quốc Khánh",
    employeeCode: "NX-10294",
    department: "Khối Kinh Doanh & Tiếp Thị",
    position: "Chuyên Viên Phát Triển Thị Trường",
    selfScore: 68,
    managerScore: 65,
    criterion1: 65,
    criterion2: 70,
    criterion3: 62,
    totalScore: 65.5,
    grade: "HẠNG C (ĐẠT YÊU CẦU)",
    bonus: "0% Lương CB",
    status: "APPROVED",
    managerNotes: "Cần cải thiện kỹ năng đàm phán hợp đồng quy mô lớn và bám sát tiến độ phễu khách hàng."
  }
];

export default function PerformancePage() {
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedGrade, setSelectedGrade] = useState("ALL");
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationItem | null>(null);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/performance");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: EvaluationItem[] = data.map((e: any) => ({
            id: e.id,
            employeeName: e.employee?.user?.name || "Cán bộ nhân viên",
            employeeCode: `NX-${e.employee?.id?.slice(-5).toUpperCase() || "00000"}`,
            department: e.employee?.department?.name || "Khối Công Nghệ",
            position: e.employee?.position || "Chuyên viên",
            selfScore: e.selfScore,
            managerScore: e.managerScore,
            criterion1: e.criterion1,
            criterion2: e.criterion2,
            criterion3: e.criterion3,
            totalScore: e.totalScore,
            grade: e.grade,
            bonus: e.bonusRate > 0 ? `+${Math.round(e.bonusRate * 100)}% Lương CB` : (e.bonusRate < 0 ? `-10% Phạt KPI` : "0% Lương CB"),
            status: e.status,
            managerNotes: e.managerNotes
          }));
          setEvaluations(mapped);
        }
      }
    } catch (err) {
      console.error("Failed to load evaluations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const handleSaveEvaluation = async (updated: EvaluationItem) => {
    try {
      const res = await fetch(`/api/performance/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          criterion1: updated.criterion1,
          criterion2: updated.criterion2,
          criterion3: updated.criterion3,
          selfScore: updated.selfScore,
          managerScore: updated.managerScore,
          status: updated.status,
          managerNotes: updated.managerNotes
        })
      });
      if (res.ok) {
        await fetchEvaluations();
      } else {
        setEvaluations(evaluations.map(e => e.id === updated.id ? updated : e));
      }
    } catch (err) {
      console.error(err);
      setEvaluations(evaluations.map(e => e.id === updated.id ? updated : e));
    }
  };

  const filteredData = evaluations.filter(e => {
    const matchSearch = e.employeeName.toLowerCase().includes(search.toLowerCase()) ||
                        e.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
                        e.position.toLowerCase().includes(search.toLowerCase());
    const matchDept = selectedDept === "ALL" || e.department === selectedDept;
    const matchGrade = selectedGrade === "ALL" || e.grade.includes(selectedGrade);
    return matchSearch && matchDept && matchGrade;
  });

  const handleExportCSV = () => {
    const headers = [
      "Mã Cán Bộ",
      "Họ Và Tên",
      "Đơn Vị / Phòng Ban",
      "Vị Trí Công Tác",
      "Điểm Tự Chấm",
      "Điểm Quản Lý",
      "Điểm Tổng Hợp",
      "Xếp Hạng KPI",
      "Thưởng Hiệu Suất",
      "Trạng Thái"
    ];

    const rows = filteredData.map(e => [
      `"${e.employeeCode}"`,
      `"${e.employeeName.replace(/"/g, '""')}"`,
      `"${e.department.replace(/"/g, '""')}"`,
      `"${e.position.replace(/"/g, '""')}"`,
      e.selfScore,
      e.managerScore,
      e.totalScore,
      `"${e.grade}"`,
      `"${e.bonus}"`,
      `"${e.status === 'APPROVED' ? 'ĐÃ PHÊ DUYỆT' : 'CHỜ DUYỆT'}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Danh_Gia_KPI_Q4_2026_Nexustech.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const countGradeA = evaluations.filter(e => e.grade.includes("HẠNG A")).length;
  const countGradeB = evaluations.filter(e => e.grade.includes("HẠNG B")).length;
  const countGradeC = evaluations.filter(e => e.grade.includes("HẠNG C")).length;
  const avgScore = evaluations.length > 0 ? Math.round(evaluations.reduce((acc, curr) => acc + curr.totalScore, 0) / evaluations.length * 10) / 10 : 0;

  return (
    <>
      <div className="space-y-6 animate-swiss-in pb-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Đánh Giá Hiệu Suất & KPI Định Kỳ
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Quy trình đánh giá hiệu suất nhân sự, xếp loại Bell Curve và tự động tính ngân sách thưởng KPI
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs active:scale-95"
              title="Xuất bảng đánh giá KPI ra file Excel/CSV"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>

        {/* Asymmetric Bell Curve & KPI Distribution Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-5 rounded-2xl bg-zinc-900 dark:bg-zinc-950 text-white p-6 border border-zinc-800 flex flex-col justify-between shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                  Điểm hiệu suất trung bình · Quý 4/2026
                </span>
                <div className="flex items-baseline gap-2.5 mt-2">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
                    {avgScore}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">/ 100 điểm</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-800/90 border border-zinc-700 flex items-center justify-center text-blue-400 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Phân bổ Bell Curve ({evaluations.length} nhân sự)</span>
                <span className="text-emerald-400 font-semibold">Đạt chuẩn kỳ vọng</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${evaluations.length > 0 ? (countGradeA / evaluations.length) * 100 : 0}%` }}
                />
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${evaluations.length > 0 ? (countGradeB / evaluations.length) * 100 : 0}%` }}
                />
                <div
                  className="h-full bg-amber-500"
                  style={{ width: `${evaluations.length > 0 ? (countGradeC / evaluations.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bento-card p-0 overflow-hidden grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200/80 dark:divide-zinc-800">
            <div className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="swiss-label">Hạng A · Xuất sắc</span>
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
                  {countGradeA} <span className="text-xs font-normal text-zinc-500 font-sans">nhân sự</span>
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  Thưởng hiệu suất +25%
                </div>
              </div>
            </div>

            <div className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="swiss-label">Hạng B · Tốt</span>
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
                  {countGradeB} <span className="text-xs font-normal text-zinc-500 font-sans">nhân sự</span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                  Thưởng hiệu suất +10%
                </div>
              </div>
            </div>

            <div className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="swiss-label">Hạng C · Đạt chuẩn</span>
                <Users className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
                  {countGradeC} <span className="text-xs font-normal text-zinc-500 font-sans">nhân sự</span>
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  Hệ số thưởng tiêu chuẩn 0%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Table Container */}
        <div className="bento-card rounded-2xl overflow-hidden shadow-xs flex flex-col">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-zinc-50/60 dark:bg-zinc-900/40">
            <div className="relative w-full max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên cán bộ, mã nhân sự..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="ALL">Tất cả phòng ban</option>
                <option value="Khối Công Nghệ & Phần Mềm">Khối Công Nghệ & Phần Mềm</option>
                <option value="Khối Kinh Doanh & Tiếp Thị">Khối Kinh Doanh & Tiếp Thị</option>
                <option value="Khối Quản Trị Nhân Lực & Đào Tạo">Khối Quản Trị Nhân Lực & Đào Tạo</option>
                <option value="Khối R&D & Trí Tuệ Nhân Tạo">Khối R&D & Trí Tuệ Nhân Tạo</option>
                <option value="Khối Tài Chính & Kế Toán">Khối Tài Chính & Kế Toán</option>
                <option value="Khối Dịch Vụ Khách Hàng">Khối Dịch Vụ Khách Hàng</option>
              </select>

              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="ALL">Tất cả xếp loại</option>
                <option value="HẠNG A">Hạng A (Xuất sắc)</option>
                <option value="HẠNG B">Hạng B (Hoàn thành tốt)</option>
                <option value="HẠNG C">Hạng C (Đạt yêu cầu)</option>
                <option value="HẠNG D">Hạng D (Cần cải thiện)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50/80 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs font-medium border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-5 py-3.5">Cán bộ</th>
                  <th className="px-5 py-3.5">Đơn vị / Vị trí</th>
                  <th className="px-5 py-3.5 text-center">Tự chấm</th>
                  <th className="px-5 py-3.5 text-center">Quản lý</th>
                  <th className="px-5 py-3.5 text-center">Điểm tổng hợp</th>
                  <th className="px-5 py-3.5 text-center">Xếp loại</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-zinc-500 text-xs">
                      Không có hồ sơ đánh giá KPI nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr 
                      key={item.id}
                      onClick={() => setSelectedEvaluation(item)}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">{item.employeeName}</div>
                        <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{item.employeeCode}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="text-zinc-800 dark:text-zinc-200 font-medium">{item.position}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{item.department}</div>
                      </td>

                      <td className="px-5 py-3.5 text-center font-mono text-zinc-600 dark:text-zinc-400">
                        {item.selfScore}
                      </td>

                      <td className="px-5 py-3.5 text-center font-mono font-medium text-zinc-800 dark:text-zinc-200">
                        {item.managerScore}
                      </td>

                      <td className="px-5 py-3.5 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                        {item.totalScore}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        {item.grade.includes("HẠNG A") ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">
                            <Award className="w-3 h-3 text-emerald-600" /> Hạng A
                          </span>
                        ) : item.grade.includes("HẠNG B") ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium">
                            Hạng B
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium">
                            Hạng C
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvaluation(item);
                          }}
                          className="px-2.5 py-1 text-xs rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Đánh giá & In
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <EvaluationModal
        isOpen={Boolean(selectedEvaluation)}
        onClose={() => setSelectedEvaluation(null)}
        evaluation={selectedEvaluation}
        onSave={handleSaveEvaluation}
      />
    </>
  );
}
