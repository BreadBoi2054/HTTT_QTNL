"use client";

import { useState, useEffect } from "react";
import { X, Settings, ShieldCheck, CheckCircle2, Clock, Layers } from "lucide-react";

interface WorkflowConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: any;
  onSave: (updated: any) => void;
}

export default function WorkflowConfigModal({ isOpen, onClose, workflow, onSave }: WorkflowConfigModalProps) {
  const [sla, setSla] = useState("48 giờ");
  const [status, setStatus] = useState("ACTIVE");
  const [autoEscalate, setAutoEscalate] = useState(true);

  useEffect(() => {
    if (workflow) {
      setSla(workflow.sla || "48 giờ");
      setStatus(workflow.status || "ACTIVE");
    }
  }, [workflow]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !workflow) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...workflow,
      sla,
      status
    });
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs animate-fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Tham số vận hành
              </span>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Cấu hình Quy trình
              </h2>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Thoát</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <div className="text-xs text-zinc-500 font-medium">Quy trình áp dụng:</div>
            <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">{workflow.name}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Phân hệ: {workflow.category}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Thời gian xử lý SLA
              </label>
              <select
                value={sla}
                onChange={(e) => setSla(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
              >
                <option value="12 giờ">12 giờ (Hỏa tốc)</option>
                <option value="24 giờ">24 giờ (1 ngày làm việc)</option>
                <option value="48 giờ">48 giờ (2 ngày làm việc)</option>
                <option value="72 giờ">72 giờ (3 ngày làm việc)</option>
                <option value="5 ngày">5 ngày làm việc</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Trạng thái luồng
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
              >
                <option value="ACTIVE">Đang vận hành (ACTIVE)</option>
                <option value="PAUSED">Tạm dừng áp dụng (PAUSED)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Cấp bậc phê duyệt hiện tại ({workflow.steps?.length || 0} cấp)
            </label>
            <div className="space-y-1.5 p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-lg max-h-36 overflow-y-auto">
              {workflow.steps?.map((step: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                  <span className="w-5 h-5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-300 text-[10px] shrink-0">
                    0{idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs">
            <input 
              type="checkbox" 
              id="escalate"
              checked={autoEscalate}
              onChange={(e) => setAutoEscalate(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-0"
            />
            <label htmlFor="escalate" className="text-zinc-700 dark:text-zinc-300 cursor-pointer">
              Tự động cảnh báo quá hạn SLA gửi tới Ban Giám Đốc
            </label>
          </div>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Thoát</span>
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Lưu cấu hình
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
