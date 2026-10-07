"use client";

import { useState, useEffect } from "react";
import { X, GitBranch, Plus, Trash2, Clock, CheckCircle2 } from "lucide-react";

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (wf: any) => void;
}

export default function CreateWorkflowModal({ isOpen, onClose, onCreated }: CreateWorkflowModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Nhân sự & Tuyển dụng");
  const [sla, setSla] = useState("48 giờ");
  const [steps, setSteps] = useState<string[]>([
    "Quản lý trực tiếp thẩm tra",
    "Chuyên viên Nhân sự xác minh",
    "Ban Giám Đốc phê duyệt"
  ]);
  const [newStepText, setNewStepText] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddStep = () => {
    if (!newStepText.trim()) return;
    setSteps([...steps, newStepText.trim()]);
    setNewStepText("");
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Vui lòng nhập tên luồng quy trình.");
      return;
    }
    if (steps.length === 0) {
      alert("Quy trình cần ít nhất 1 bước phê duyệt.");
      return;
    }

    const newWf = {
      id: "wf_" + Date.now(),
      name: name.trim(),
      category,
      stepsCount: steps.length,
      sla,
      activeRequests: 0,
      steps,
      status: "ACTIVE"
    };

    onCreated(newWf);
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
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Quy trình chuẩn SOP
              </span>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Khởi tạo Luồng phê duyệt mới
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Tên luồng quy trình <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Quy trình Đề xuất Mua sắm Thiết bị IT chuyên dụng..."
              className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Phân hệ nghiệp vụ
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
              >
                <option value="Nhân sự & Tuyển dụng">Nhân sự & Tuyển dụng</option>
                <option value="Lương thưởng & Đãi ngộ">Lương thưởng & Đãi ngộ</option>
                <option value="Chấm công & Nghỉ phép">Chấm công & Nghỉ phép</option>
                <option value="Đào tạo & Đánh giá">Đào tạo & Đánh giá</option>
                <option value="Hành chính & Quản trị">Hành chính & Quản trị</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Thời hạn SLA
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
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Các bước duyệt đa cấp ({steps.length} bước)
            </label>
            <div className="space-y-1.5 mb-2.5 max-h-36 overflow-y-auto">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 text-[10px]">
                      0{idx + 1}
                    </span>
                    <span className="text-zinc-800 dark:text-zinc-200">{step}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="text-zinc-400 hover:text-red-500 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                placeholder="Thêm cấp duyệt tiếp theo..."
                className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 text-zinc-900 dark:text-zinc-100"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddStep();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddStep}
                className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-700 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm
              </button>
            </div>
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
              Lưu & kích hoạt quy trình
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
