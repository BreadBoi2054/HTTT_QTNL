"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, User, CheckCircle2, MessageSquare } from "lucide-react";

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
  onSuccess: () => void;
}

export default function ScheduleInterviewModal({
  isOpen,
  onClose,
  candidate,
  onSuccess
}: ScheduleInterviewModalProps) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Default to tomorrow at 09:00 AM
      const tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      tmrw.setHours(9, 0, 0, 0);
      const tzOffset = tmrw.getTimezoneOffset() * 60000;
      const localISOTime = new Date(tmrw.getTime() - tzOffset).toISOString().slice(0, 16);
      setScheduledAt(localISOTime);
      setNotes("Phỏng vấn vòng 1: Đánh giá năng lực chuyên môn & độ phù hợp văn hóa");
      setError("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !candidate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) {
      setError("Vui lòng chọn thời gian phỏng vấn.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/recruitment/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: candidate.id,
          scheduledAt: new Date(scheduledAt).toISOString(),
          notes
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Không thể lưu lịch phỏng vấn");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Lỗi tạo lịch phỏng vấn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-zinc-50/70 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                Quy trình tuyển dụng
              </span>
              <h2 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Lên Lịch Phỏng Vấn Ứng Viên
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Candidate Card */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
            <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              {candidate.candidateName}
            </div>
            <div className="text-zinc-500 dark:text-zinc-400">
              Vị trí ứng tuyển: <strong className="text-zinc-700 dark:text-zinc-300">{candidate.jobPosting?.title || "Chuyên viên"}</strong>
            </div>
            <div className="text-zinc-500 dark:text-zinc-400">
              Email: <span className="font-mono">{candidate.candidateEmail}</span> • SĐT: {candidate.candidatePhone || "Chưa có"}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Thời gian phỏng vấn *
            </label>
            <input 
              type="datetime-local" 
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
              Ghi chú / Tiêu chí đánh giá
            </label>
            <textarea 
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập nội dung phỏng vấn, link Google Meet hoặc phòng họp trực tiếp..."
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm active:scale-95 disabled:opacity-50"
            >
              {loading ? "Đang lên lịch..." : "Xác nhận lịch phỏng vấn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
