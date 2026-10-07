"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, User, Key, Building2, FileCheck, ArrowRight, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface OnboardingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
}

export default function OnboardingSuccessModal({ isOpen, onClose, candidate }: OnboardingSuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !candidate) return null;

  const handleCopyPassword = () => {
    navigator.clipboard.writeText("Hrmis@123");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const jobTitle = candidate.jobPosting?.title || "Chuyên viên";
  const deptName = candidate.jobPosting?.department?.name || "Tập đoàn Nexustech";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-emerald-600 dark:bg-emerald-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-medium tracking-wide text-emerald-100 uppercase">
                Tiếp nhận nhân sự mới
              </span>
              <h2 className="text-base font-bold tracking-tight">
                Khởi tạo hồ sơ & tài khoản thành công
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            title="Thoát (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-zinc-600 dark:text-zinc-400">
            Hệ thống đã tự động liên kết dữ liệu tuyển dụng và tạo hồ sơ nhân sự, tài khoản truy cập hệ thống:
          </p>

          {/* Account Credential Box */}
          <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-blue-500" />
              1. Tài khoản đăng nhập hệ thống
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-zinc-400">Họ và tên:</span>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">{candidate.candidateName}</div>
              </div>
              <div>
                <span className="text-zinc-400">Phân quyền:</span>
                <div className="font-medium text-blue-600 dark:text-blue-400 mt-0.5">Nhân viên (EMPLOYEE)</div>
              </div>
              <div className="col-span-2">
                <span className="text-zinc-400">Tên đăng nhập / Email:</span>
                <div className="font-medium text-zinc-900 dark:text-zinc-100 font-mono mt-0.5">{candidate.candidateEmail}</div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="text-[11px] text-zinc-400 font-medium">Mật khẩu tạm thời:</div>
                <div className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">Hrmis@123</div>
              </div>
              <button
                onClick={handleCopyPassword}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Đã chép
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Sao chép
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dossier & Decision Summary */}
          <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-2.5">
            <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              2. Thông tin tiếp nhận
            </div>

            <div className="space-y-1.5 text-zinc-600 dark:text-zinc-400 text-xs">
              <div className="flex items-center justify-between">
                <span>Vị trí đảm nhiệm:</span>
                <strong className="text-zinc-900 dark:text-zinc-100 font-medium">{jobTitle}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Đơn vị trực thuộc:</span>
                <strong className="text-zinc-900 dark:text-zinc-100 font-medium">{deptName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Quyết định tiếp nhận:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Đã ban hành tự động</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Nhật ký hệ thống:</span>
                <span className="text-zinc-500">Đã lưu trữ audit trail</span>
              </div>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors"
            >
              Thoát
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Link
                href={`/dashboard/employees?search=${encodeURIComponent(candidate.candidateName)}`}
                onClick={onClose}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-medium transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                Hồ sơ nhân viên
              </Link>
              
              <Link
                href="/dashboard/personnel-changes"
                onClick={onClose}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-lg text-xs font-medium transition-colors"
              >
                <FileCheck className="w-3.5 h-3.5" />
                Xem quyết định
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
