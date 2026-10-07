"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, Lock, Mail, AlertCircle, CheckCircle2, 
  ShieldCheck, Fingerprint, Building2, User, KeyRound
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error === "CredentialsSignin" || res.error.includes("CredentialsSignin")) {
          setError("Tài khoản hoặc mật khẩu không chính xác. Mật khẩu demo: password123");
        } else if (res.error === "Configuration") {
          setError("Không tìm thấy tài khoản tương ứng trên hệ thống.");
        } else {
          setError("Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.");
        }
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Đã xảy ra lỗi kết nối xác thực.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100/80 dark:bg-zinc-950 p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-4xl bento-card rounded-xl shadow-lg grid grid-cols-1 lg:grid-cols-12 overflow-hidden animate-swiss-in border border-zinc-200/90 dark:border-zinc-800/90 relative z-10">
        
        {/* Left Side - Enterprise Brand & Overview */}
        <div className="lg:col-span-5 p-8 sm:p-10 bg-zinc-900 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800 relative">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Fingerprint className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold tracking-tight text-white block leading-none">
                    NEXUSTECH
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">
                  Quản trị Nguồn nhân lực
                </span>
              </div>
            </div>

            <div className="space-y-3.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/80">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Nền tảng Quản trị Nguồn nhân lực
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Vận hành nhân sự & đãi ngộ chuẩn mực
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                Hợp nhất quản trị hồ sơ điện tử, tự động hóa chấm công GPS, quyết toán lương chuẩn mực và kiểm toán đa tầng.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="mt-8 space-y-3 text-xs text-zinc-300">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Chấm công số thông minh & tự động hóa ca làm việc</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Quyết toán lương & trích nộp bảo hiểm theo luật lao động</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Kiểm toán Audit Trail & phân quyền 4 lớp RBAC chặt chẽ</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-800/80 space-y-2 text-xs text-zinc-400 mt-6">
            <div className="flex justify-between items-center">
              <span>Trạng thái máy chủ:</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Trực tuyến ổn định
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-zinc-500 font-mono">
              <span>Hệ thống: HRMIS 2026</span>
              <span className="flex items-center gap-1 text-blue-400 font-sans">
                <ShieldCheck className="w-3.5 h-3.5" />
                Mã hóa chuẩn SSL
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - Form Gateway */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white dark:bg-zinc-900">
          <div className="w-full max-w-sm mx-auto space-y-6">
            <div>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                Cổng xác thực
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
                Đăng nhập tài khoản
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Nhập thông tin tài khoản công việc để vào hệ thống điều hành.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-xs rounded-xl flex items-center gap-2.5 animate-swiss-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 dark:text-red-400" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Email đăng nhập
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
                  placeholder="admin@nexustech.vn"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Mật khẩu
                  </label>
                  <span className="text-[10px] text-zinc-400 font-mono">Mặc định: password123</span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
                  placeholder="••••••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Đăng nhập hệ thống</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Fill Buttons */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2.5">
                Tài khoản kiểm thử nhanh (Demo):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo("admin@nexustech.vn")}
                  className="p-2.5 text-xs text-left border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 rounded-xl text-zinc-700 dark:text-zinc-300 transition-all group"
                >
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">Admin</div>
                  <div className="text-[10px] text-zinc-400 font-mono truncate">admin@nexustech.vn</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo("manager@nexustech.vn")}
                  className="p-2.5 text-xs text-left border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-amber-500 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 rounded-xl text-zinc-700 dark:text-zinc-300 transition-all group"
                >
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 transition-colors">Trưởng phòng</div>
                  <div className="text-[10px] text-zinc-400 font-mono truncate">manager@nexustech.vn</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo("hr@nexustech.vn")}
                  className="p-2.5 text-xs text-left border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-violet-500 hover:bg-violet-50/30 dark:hover:bg-violet-950/20 rounded-xl text-zinc-700 dark:text-zinc-300 transition-all group"
                >
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 transition-colors">Nhân sự (HR)</div>
                  <div className="text-[10px] text-zinc-400 font-mono truncate">hr@nexustech.vn</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo("user@nexustech.vn")}
                  className="p-2.5 text-xs text-left border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 rounded-xl text-zinc-700 dark:text-zinc-300 transition-all group"
                >
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 transition-colors">Nhân viên (User)</div>
                  <div className="text-[10px] text-zinc-400 font-mono truncate">user@nexustech.vn</div>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
