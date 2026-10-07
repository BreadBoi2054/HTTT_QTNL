"use client";

import { useState, useEffect } from "react";
import { X, Target, Award, CheckCircle2, Printer, Star, User, Sparkles, Building2 } from "lucide-react";

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: any;
  onSave: (updated: any) => void;
}

export default function EvaluationModal({ isOpen, onClose, evaluation, onSave }: EvaluationModalProps) {
  const [c1, setC1] = useState(85); // Công việc chính (50%)
  const [c2, setC2] = useState(85); // Kỷ luật & Văn hóa (25%)
  const [c3, setC3] = useState(85); // Đổi mới & Phát triển (25%)
  const [managerNotes, setManagerNotes] = useState("");

  useEffect(() => {
    if (evaluation) {
      setC1(evaluation.criterion1 || 85);
      setC2(evaluation.criterion2 || 85);
      setC3(evaluation.criterion3 || 85);
      setManagerNotes(evaluation.managerNotes || "Cán bộ hoàn thành tốt các chỉ tiêu công việc được giao, phối hợp nhịp nhàng với đội ngũ dự án.");
    }
  }, [evaluation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !evaluation) return null;

  const totalScore = Math.round((c1 * 0.5) + (c2 * 0.25) + (c3 * 0.25) * 10) / 10;
  
  let grade = "Hạng B (Hoàn thành tốt)";
  let gradeBonus = "+10% Lương CB";
  let gradeBadgeColor = "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900";

  if (totalScore >= 90) {
    grade = "Hạng A (Xuất sắc)";
    gradeBonus = "+25% Lương CB";
    gradeBadgeColor = "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800";
  } else if (totalScore >= 75) {
    grade = "Hạng B (Hoàn thành tốt)";
    gradeBonus = "+10% Lương CB";
    gradeBadgeColor = "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900";
  } else if (totalScore >= 60) {
    grade = "Hạng C (Đạt yêu cầu)";
    gradeBonus = "0% Lương CB";
    gradeBadgeColor = "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900";
  } else {
    grade = "Hạng D (Cần cải thiện)";
    gradeBonus = "Trừ phạt KPI";
    gradeBadgeColor = "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900";
  }

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...evaluation,
      criterion1: c1,
      criterion2: c2,
      criterion3: c3,
      totalScore,
      grade,
      bonus: gradeBonus,
      managerNotes,
      status: "APPROVED"
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden flex flex-col print:shadow-none print:border-none print:w-full print:m-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Đánh giá hiệu suất & KPI
            </span>
            <span className="text-xs text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-xs text-zinc-500 font-medium">
              Quý 4 / 2026
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg text-xs font-medium transition-colors border border-zinc-200 dark:border-zinc-700 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              In phiếu
            </button>
            <button 
              onClick={onClose} 
              className="flex items-center gap-1 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-lg transition-colors"
              title="Thoát (Esc)"
            >
              <X className="w-4 h-4" />
              <span>Thoát</span>
            </button>
          </div>
        </div>

        {/* Printable Form Sheet */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 print:p-0">
          
          {/* Header Strip */}
          <div className="flex justify-between items-start pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <div className="font-bold text-xs uppercase text-zinc-800 dark:text-zinc-200 font-mono">
                TẬP ĐOÀN CÔNG NGHỆ & GIẢI PHÁP SỐ NEXUSTECH
              </div>
              <h2 className="text-lg font-bold tracking-tight mt-1">
                PHIẾU ĐÁNH GIÁ HIỆU SUẤT & XẾP LOẠI KPI CÁN BỘ
              </h2>
              <div className="text-xs text-zinc-500 font-mono mt-0.5">
                Kỳ đánh giá: Quý 4 năm 2026 • Chuẩn đánh giá hiệu suất 360°
              </div>
            </div>

            <div className="text-right font-mono text-xs">
              <span className="text-[10px] text-zinc-400 uppercase">MÃ HỒ SƠ</span>
              <div className="font-bold text-zinc-800 dark:text-zinc-200">KPI-2026Q4-{evaluation.id?.slice(-4).toUpperCase() || "001"}</div>
            </div>
          </div>

          {/* Employee Dossier Info */}
          <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded p-4 grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="text-zinc-400 text-[10px] uppercase">Họ và tên cán bộ:</span>
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 font-sans mt-0.5">{evaluation.employeeName}</div>
            </div>
            <div>
              <span className="text-zinc-400 text-[10px] uppercase">Mã nhân sự:</span>
              <div className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{evaluation.employeeCode || "NX-08942"}</div>
            </div>
            <div>
              <span className="text-zinc-400 text-[10px] uppercase">Phòng ban / Đơn vị:</span>
              <div className="text-zinc-800 dark:text-zinc-200 mt-0.5 font-sans">{evaluation.department}</div>
            </div>
            <div>
              <span className="text-zinc-400 text-[10px] uppercase">Chức danh / Vị trí:</span>
              <div className="text-zinc-800 dark:text-zinc-200 mt-0.5 font-sans">{evaluation.position}</div>
            </div>
          </div>

          {/* 3 Criteria Evaluation Sliders */}
          <div className="space-y-4">
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-500" />
              Đánh giá điểm số theo tiêu chí (Thang điểm 100)
            </div>

            {/* Criterion 1 */}
            <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2.5 bg-zinc-50/50 dark:bg-zinc-900/40">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">1. Mục tiêu công việc chính & Tiến độ</span>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium ml-2">(Trọng số 50%)</span>
                </div>
                <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">{c1} / 100</span>
              </div>
              <input
                type="range"
                min={40}
                max={100}
                value={c1}
                onChange={(e) => setC1(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>40: Cần cải thiện</span>
                <span>60: Đạt chuẩn</span>
                <span>80: Hoàn thành tốt</span>
                <span>100: Xuất sắc</span>
              </div>
            </div>

            {/* Criterion 2 */}
            <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2.5 bg-zinc-50/50 dark:bg-zinc-900/40">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">2. Kỷ luật, phối hợp & Văn hóa doanh nghiệp</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium ml-2">(Trọng số 25%)</span>
                </div>
                <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">{c2} / 100</span>
              </div>
              <input
                type="range"
                min={40}
                max={100}
                value={c2}
                onChange={(e) => setC2(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Criterion 3 */}
            <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2.5 bg-zinc-50/50 dark:bg-zinc-900/40">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">3. Sáng kiến cải tiến & Phát triển chuyên môn</span>
                  <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium ml-2">(Trọng số 25%)</span>
                </div>
                <span className="font-mono font-bold text-sm text-purple-600 dark:text-purple-400">{c3} / 100</span>
              </div>
              <input
                type="range"
                min={40}
                max={100}
                value={c3}
                onChange={(e) => setC3(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Consolidated Result Banner */}
          <div className="p-5 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <div className="text-xs text-zinc-400 font-medium">
                Kết quả tổng hợp hiệu suất
              </div>
              <div className="font-semibold text-sm mt-0.5">
                Điểm trung bình trọng số: <span className="font-mono text-xl text-blue-400 font-bold ml-1">{totalScore}</span> / 100
              </div>
            </div>

            <div className="text-right sm:text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${gradeBadgeColor}`}>
                {grade}
              </span>
              <div className="text-xs text-emerald-400 font-medium mt-1">
                Thưởng hiệu suất: {gradeBonus}
              </div>
            </div>
          </div>

          {/* Manager Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Nhận xét của quản lý trực tiếp & đề xuất phát triển
            </label>
            <textarea
              rows={3}
              value={managerNotes}
              onChange={(e) => setManagerNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Signatures */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">Cán bộ được đánh giá</div>
              <div className="text-[11px] text-zinc-400 italic">(Ký, họ tên)</div>
              <div className="h-12 flex items-center justify-center text-zinc-500 text-xs italic">
                Đã tự đánh giá
              </div>
            </div>

            <div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">Quản lý trực tiếp</div>
              <div className="text-[11px] text-zinc-400 italic">(Thẩm định & xác nhận)</div>
              <div className="h-12 flex items-center justify-center text-zinc-500 text-xs italic">
                Trưởng Bộ Phận
              </div>
            </div>

            <div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">Hội đồng nhân sự</div>
              <div className="text-[11px] text-zinc-400 italic">(Phê duyệt xếp hạng)</div>
              <div className="h-12 flex items-center justify-center">
                <span className="border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-medium rounded-full">
                  Đã phê duyệt
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center print:hidden">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors"
            >
              Thoát
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-lg text-xs font-medium transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Lưu & Xác nhận đánh giá
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
