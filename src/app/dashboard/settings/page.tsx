"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor, Save, User, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = () => {
    setSaving(true);
    setSuccess("");
    setTimeout(() => {
      setSaving(false);
      setSuccess("Cập nhật tham số hệ thống thành công!");
      setTimeout(() => setSuccess(""), 3000);
    }, 800);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-swiss-in max-w-4xl mx-auto pb-16">
      {/* HEADER */}
      <div className="pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
          <Monitor className="w-3.5 h-3.5" />
          Cấu Hình Hệ Thống
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
          Cài Đặt & Tùy Chọn Vận Hành
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Quản lý giao diện hiển thị, cấu hình tài khoản quản trị và các thông số vận hành nền tảng NEXUSTECH
        </p>
      </div>

      <div className="space-y-5">
        {/* THEME SELECTION */}
        <div className="bento-card rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2.5">
              <div className="squircle w-8 h-8 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Monitor className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Giao diện hiển thị (Design Theme)
              </span>
            </div>
            <span className="text-xs text-zinc-500 font-medium">
              Hiện tại: <strong className="text-zinc-800 dark:text-zinc-200">{theme === "light" ? "Giao diện sáng" : theme === "dark" ? "Giao diện tối" : "Theo hệ thống"}</strong>
            </span>
          </div>

          <div className="p-6">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 font-medium">
              Lựa chọn chế độ giao diện phù hợp với môi trường làm việc của bạn:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center justify-center p-5 border rounded-2xl text-center transition-all ${
                  theme === "light" 
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-2 ring-blue-600/30 shadow-xs" 
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50/50"
                }`}
              >
                <div className="squircle w-10 h-10 bg-amber-50 dark:bg-amber-950/60 text-amber-500 mb-3">
                  <Sun className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Giao diện Sáng</span>
                <span className="text-[11px] text-zinc-500 mt-1">Nền sáng dịu mắt & sắc nét</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center justify-center p-5 border rounded-2xl text-center transition-all ${
                  theme === "dark" 
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-2 ring-blue-600/30 shadow-xs" 
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-800/40"
                }`}
              >
                <div className="squircle w-10 h-10 bg-blue-50 dark:bg-blue-950/60 text-blue-500 mb-3">
                  <Moon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Giao diện Tối</span>
                <span className="text-[11px] text-zinc-500 mt-1">Sleek Obsidian & Glassmorphism</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`flex flex-col items-center justify-center p-5 border rounded-2xl text-center transition-all ${
                  theme === "system" 
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-2 ring-blue-600/30 shadow-xs" 
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50/50"
                }`}
              >
                <div className="squircle w-10 h-10 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 mb-3">
                  <Monitor className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Theo Hệ điều hành</span>
                <span className="text-[11px] text-zinc-500 mt-1">Tự động đồng bộ thiết bị</span>
              </button>
            </div>
          </div>
        </div>

        {/* OPERATOR PROFILE */}
        <div className="bento-card rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2.5">
              <div className="squircle w-8 h-8 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Thông tin tài khoản vận hành
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Tên hiển thị hệ thống
                </label>
                <input 
                  type="text" 
                  defaultValue="Quản trị viên Hệ thống" 
                  disabled 
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 font-medium opacity-90 cursor-not-allowed" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Email định danh đăng nhập
                </label>
                <input 
                  type="email" 
                  defaultValue="admin@nexustech.vn" 
                  disabled 
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 opacity-90 cursor-not-allowed" 
                />
              </div>
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 font-semibold">
                Vai trò: Quản trị viên hệ thống (Toàn quyền quản trị phân hệ)
              </span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {success && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}
          <button 
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-70"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
