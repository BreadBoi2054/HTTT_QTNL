"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, ShieldAlert } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastInput {
  title?: string;
  message: string;
  type?: ToastType;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
}

interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (input: ToastInput | string) => void;
  confirm: (input: ConfirmOptions | string) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
  confirm: async () => false,
});

export function useToast() {
  return useContext(ToastContext);
}

export function useConfirm() {
  return useContext(ToastContext).confirm;
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full divide-y divide-zinc-100 dark:divide-zinc-800/60" role="status" aria-label="Đang tải dữ liệu">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="px-6 py-4 flex items-center justify-between gap-4">
          {Array.from({ length: cols }).map((__, cIdx) => (
            <div
              key={cIdx}
              className={`h-4 rounded-md bg-zinc-200/70 dark:bg-zinc-800 skeleton-shimmer ${
                cIdx === 0 ? "w-44" : cIdx === cols - 1 ? "w-20" : "w-28"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="status" aria-label="Đang tải danh sách">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bento-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 rounded-md bg-zinc-200/70 dark:bg-zinc-800 skeleton-shimmer" />
            <div className="h-7 w-7 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 skeleton-shimmer" />
          </div>
          <div className="h-3 w-full rounded-md bg-zinc-100 dark:bg-zinc-800/60 skeleton-shimmer" />
          <div className="h-3 w-2/3 rounded-md bg-zinc-100 dark:bg-zinc-800/60 skeleton-shimmer" />
          <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
            <div className="h-3 w-20 rounded-md bg-zinc-200/60 dark:bg-zinc-800 skeleton-shimmer" />
            <div className="h-6 w-16 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

function inferToastMeta(rawMessage: string): { type: ToastType; title: string; cleanMessage: string } {
  const cleanMessage = rawMessage.replace(/^[\u2705\u274C\u26A0\uFE0F\u2139\uD83D\uDD14]+\s*/u, "").trim();
  const lower = cleanMessage.toLowerCase();

  if (
    lower.includes("thành công") ||
    cleanMessage.startsWith("Đã ") ||
    lower.includes("hoàn tất")
  ) {
    return { type: "success", title: "Thao tác thành công", cleanMessage };
  }

  if (
    lower.includes("lỗi") ||
    lower.includes("không thể") ||
    lower.includes("thất bại") ||
    lower.includes("từ chối")
  ) {
    return { type: "error", title: "Thông báo lỗi", cleanMessage };
  }

  if (
    lower.includes("cảnh báo") ||
    lower.includes("vui lòng") ||
    lower.includes("chưa ") ||
    lower.includes("không đủ") ||
    lower.includes("không có quyền")
  ) {
    return { type: "warning", title: "Lưu ý nghiệp vụ", cleanMessage };
  }

  return { type: "info", title: "Thông báo hệ thống", cleanMessage };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { open: boolean }) | null>(null);
  const confirmResolverRef = useRef<((val: boolean) => void) | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput | string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      let item: ToastItem;

      if (typeof input === "string") {
        const inferred = inferToastMeta(input);
        item = {
          id,
          title: inferred.title,
          message: inferred.cleanMessage,
          type: inferred.type,
        };
      } else {
        const inferred = inferToastMeta(input.message);
        const type = input.type || inferred.type;
        const defaultTitle =
          type === "success"
            ? "Thao tác thành công"
            : type === "error"
            ? "Thông báo lỗi"
            : type === "warning"
            ? "Lưu ý nghiệp vụ"
            : "Thông báo hệ thống";

        item = {
          id,
          title: input.title || defaultTitle,
          message: inferred.cleanMessage,
          type,
        };
      }

      setToasts((prev) => [...prev.slice(-4), item]);

      setTimeout(() => {
        removeToast(id);
      }, 3800);
    },
    [removeToast]
  );

  const confirm = useCallback((input: ConfirmOptions | string): Promise<boolean> => {
    const opts: ConfirmOptions =
      typeof input === "string"
        ? {
            title: input.toLowerCase().includes("xóa") || input.toLowerCase().includes("hủy") || input.toLowerCase().includes("chấm dứt")
              ? "Xác nhận thao tác quan trọng"
              : "Xác nhận nghiệp vụ",
            message: input,
            confirmText: "Xác nhận thực hiện",
            cancelText: "Hủy bỏ",
            variant:
              input.toLowerCase().includes("xóa") ||
              input.toLowerCase().includes("hủy") ||
              input.toLowerCase().includes("chấm dứt") ||
              input.toLowerCase().includes("từ chối")
                ? "danger"
                : "primary",
          }
        : {
            title: input.title || "Xác nhận nghiệp vụ",
            message: input.message,
            confirmText: input.confirmText || "Xác nhận thực hiện",
            cancelText: input.cancelText || "Hủy bỏ",
            variant: input.variant || "primary",
          };

    setConfirmState({ ...opts, open: true });
    return new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve;
    });
  }, []);

  const handleConfirmClose = useCallback((result: boolean) => {
    setConfirmState(null);
    if (confirmResolverRef.current) {
      confirmResolverRef.current(result);
      confirmResolverRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!confirmState?.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleConfirmClose(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmState?.open, handleConfirmClose]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const originalAlert = window.alert;

    window.alert = (msg?: any) => {
      const text = typeof msg === "string" ? msg : String(msg ?? "Thông báo hệ thống");
      toast(text);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [toast]);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />;
    }
  };

  const getAccentBorder = (type: ToastType) => {
    switch (type) {
      case "success":
        return "border-emerald-500/30 dark:border-emerald-500/25";
      case "error":
        return "border-rose-500/30 dark:border-rose-500/25";
      case "warning":
        return "border-amber-500/30 dark:border-amber-500/25";
      default:
        return "border-blue-500/30 dark:border-blue-500/25";
    }
  };

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {confirmState?.open && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-swiss-in no-print"
          onClick={() => handleConfirmClose(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  confirmState.variant === "danger"
                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/60"
                    : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/80 dark:border-blue-800/60"
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 id="confirm-modal-title" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {confirmState.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5 leading-relaxed whitespace-pre-line">
                  {confirmState.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => handleConfirmClose(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmClose(true)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors shadow-xs ${
                  confirmState.variant === "danger"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none no-print max-w-full px-4 sm:px-0"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={`pointer-events-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 ${getAccentBorder(
              item.type
            )} rounded-xl shadow-lg p-4 flex items-start gap-3 min-w-[300px] max-w-md animate-swiss-in`}
          >
            {getIcon(item.type)}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                {item.title}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5 leading-relaxed break-words">
                {item.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(item.id)}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
              aria-label="Đóng thông báo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}