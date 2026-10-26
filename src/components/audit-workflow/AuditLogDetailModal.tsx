"use client";

import { useState, useEffect } from "react";
import { X, ShieldCheck, CheckCircle2, Clock, User, Globe } from "lucide-react";

interface AuditLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: any;
}

export default function AuditLogDetailModal({ isOpen, onClose, log }: AuditLogDetailModalProps) {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !log) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs animate-fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Nhật ký kiểm toán hệ thống
              </span>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Chi tiết Bản ghi Kiểm toán
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

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Metadata Card */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs">
            <div>
              <span className="text-zinc-500 text-[11px] font-medium">Mã sự kiện:</span>
              <div className="font-mono font-semibold text-zinc-800 dark:text-zinc-200 truncate mt-0.5">{log.id}</div>
            </div>

            <div>
              <span className="text-zinc-500 text-[11px] font-medium">Thời gian ghi nhận:</span>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {new Date(log.createdAt).toLocaleString("vi-VN")}
              </div>
            </div>

            <div>
              <span className="text-zinc-500 text-[11px] font-medium">Người thực hiện:</span>
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">{log.userName}</div>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{log.userRole}</span>
            </div>

            <div>
              <span className="text-zinc-500 text-[11px] font-medium">Địa chỉ IP & Cổng:</span>
              <div className="font-mono text-zinc-800 dark:text-zinc-200 mt-0.5">
                {log.ip || "Không ghi nhận"}
              </div>
            </div>
          </div>

          {/* Action & Target Description */}
          <div className="space-y-3">
            <div className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <span className="text-zinc-500 text-[11px] font-medium">Hành động chi tiết:</span>
              <p className="text-xs text-zinc-900 dark:text-zinc-100 font-medium mt-1 leading-relaxed">
                {log.action}
              </p>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs">
              <div>
                <span className="text-zinc-500 text-[11px] font-medium">Đối tượng tác động:</span>
                <div className="font-mono font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{log.target}</div>
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {log.status || "SUCCESS"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
            Mã sự kiện là mã bản ghi cơ sở dữ liệu. Hệ thống hiện chưa tạo chữ ký số hoặc cơ chế lưu trữ bất biến cho nhật ký.
          </div>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <X className="w-4 h-4" />
              <span>Thoát</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
