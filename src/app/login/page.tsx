"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Eye, EyeOff } from "lucide-react";

const demoAccounts = [
  { label: "Ban Giám đốc", email: "ceo@nexustech.vn", code: "BOD" },
  { label: "Quản trị Nhân sự", email: "hr@nexustech.vn", code: "HR" },
  { label: "Kế toán Lương", email: "accountant@nexustech.vn", code: "ACC" },
  { label: "Trưởng bộ phận", email: "manager@nexustech.vn", code: "MGR" },
  { label: "Quản trị Hệ thống", email: "admin@nexustech.vn", code: "ADM" },
  { label: "Cổng Nhân viên", email: "user@nexustech.vn", code: "ESS" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Email hoặc mật khẩu không chính xác. Vui lòng thử lại.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Không thể kết nối tới hệ thống xác thực. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError("");
  };

  return (
    <main className="folio-login min-h-dvh bg-[#f4f6f8] dark:bg-[#0c0e10] text-[#131416] dark:text-[#f2f4f7] flex flex-col justify-center p-4 sm:p-8 lg:p-12">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[#e6e8eb] dark:border-[#22262b] bg-white dark:bg-[#121518] lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Framed Sheet HRIS Overview & Statutory Ledger */}
        <section className="order-2 flex flex-col justify-between border-t border-[#e6e8eb] dark:border-[#22262b] bg-[#f8f9fb] dark:bg-[#171b1f] p-7 sm:p-10 lg:order-1 lg:border-t-0 lg:border-r lg:p-11">
          <div>
            <Link
              href="/careers"
              className="inline-flex items-center gap-2.5 group"
              aria-label="Nexustech, xem trang tuyển dụng"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1b6c80] text-white text-xs font-semibold">
                NX
              </span>
              <span className="flex items-center gap-2">
                <strong className="text-sm font-semibold tracking-tight text-[#131416] dark:text-white">Nexustech</strong>
                <span className="rounded bg-[#e6e8eb] dark:bg-[#22262b] px-2 py-0.5 text-xs font-medium text-[#434648] dark:text-[#9ba3b0]">
                  HRIS
                </span>
              </span>
            </Link>

            <div className="mt-9 max-w-md">
              <h1 className="text-2xl sm:text-[26px] font-semibold tracking-tight text-[#131416] dark:text-white leading-[1.22]">
                Hệ thống quản trị nhân lực và tiền lương.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[#5d5f60] dark:text-[#9ba3b0]">
                Quản lý tập trung hồ sơ lao động, hợp đồng pháp lý, bảng chấm công và quyết toán lương định kỳ trên một sổ cái thống nhất.
              </p>
            </div>

            {/* Authentic HR & Payroll Statutory Parameters Table (instead of fake dev worktree) */}
            <div className="mt-8 rounded-lg border border-[#e6e8eb] dark:border-[#22262b] bg-white dark:bg-[#121518] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e6e8eb] dark:border-[#22262b] bg-[#f4f6f8]/60 dark:bg-[#171b1f] text-[13px]">
                <span className="font-medium text-[#131416] dark:text-white">Định mức pháp lý & quyết toán áp dụng</span>
                <span className="text-xs font-medium text-[#1e7b4f] dark:text-emerald-400">Hiệu lực 2026</span>
              </div>
              <div className="divide-y divide-[#eef0f2] dark:divide-[#1b1f24] text-[13px] tabular-nums">
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[#5d5f60] dark:text-[#9ba3b0]">Khấu trừ BHXH · BHYT · BHTN (NLĐ)</span>
                  <span className="font-mono font-medium text-[#131416] dark:text-white">10.5%</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[#5d5f60] dark:text-[#9ba3b0]">Giảm trừ gia cảnh bản thân (Thuế TNCN)</span>
                  <span className="font-mono font-medium text-[#131416] dark:text-white">11.000.000 đ/tháng</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[#5d5f60] dark:text-[#9ba3b0]">Giảm trừ mỗi người phụ thuộc</span>
                  <span className="font-mono font-medium text-[#131416] dark:text-white">4.400.000 đ/tháng</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[#5d5f60] dark:text-[#9ba3b0]">Phân quyền kiểm soát nội bộ (RBAC)</span>
                  <span className="font-medium text-[#1b6c80] dark:text-[#2ba3be]">6 cấp phê duyệt</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-[#e6e8eb] dark:border-[#22262b] pt-4 text-[13px] text-[#5d5f60] dark:text-[#9ba3b0] flex items-center justify-between">
            <span>Tuân thủ Bộ luật Lao động 2019</span>
            <Link href="/careers" className="inline-flex items-center gap-1 font-medium text-[#1b6c80] dark:text-[#2ba3be] hover:underline">
              <span>Cổng tuyển dụng công khai</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Right Authentication Form */}
        <section className="order-1 flex flex-col justify-center p-7 sm:p-10 lg:order-2 lg:p-11 bg-white dark:bg-[#121518]">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-7">
              <h2 className="text-xl font-semibold text-[#131416] dark:text-white tracking-tight">Đăng nhập phiên làm việc</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#5d5f60] dark:text-[#9ba3b0]">
                Sử dụng tài khoản nội bộ để truy cập phân hệ theo vai trò được cấp.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-[#131416] dark:text-white">
                  Email công việc
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ten@nexustech.vn"
                  className="w-full rounded-md border border-[#cfd3d8] dark:border-[#2c3138] bg-white dark:bg-[#171b1f] px-3.5 py-2 text-sm text-[#131416] dark:text-white placeholder:text-[#5d5f60] dark:placeholder:text-[#878c92] focus:border-[#1b6c80] focus:outline-none focus:ring-2 focus:ring-[#1b6c80]/20"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-[#131416] dark:text-white">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full rounded-md border border-[#cfd3d8] dark:border-[#2c3138] bg-white dark:bg-[#171b1f] px-3.5 py-2 pr-11 text-sm text-[#131416] dark:text-white placeholder:text-[#5d5f60] dark:placeholder:text-[#878c92] focus:border-[#1b6c80] focus:outline-none focus:ring-2 focus:ring-[#1b6c80]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-0 px-3 text-[#5d5f60] dark:text-[#9ba3b0] hover:text-[#131416] dark:hover:text-white"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="rounded-md border border-[#ffedea] dark:border-rose-900 bg-[#ffedea] dark:bg-rose-950/40 px-3 py-2 text-[13px] text-[#831c1e] dark:text-rose-300">
                  {error}
                </p>
              )}

              <button
                disabled={loading}
                type="submit"
                className="flex w-full items-center justify-between rounded-md bg-[#1b6c80] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#155666] disabled:opacity-60"
              >
                <span>{loading ? "Đang xác thực..." : "Đăng nhập hệ thống"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {process.env.NODE_ENV === "development" && (
              <div className="mt-7 border-t border-[#e6e8eb] dark:border-[#22262b] pt-5">
                <div className="mb-3 flex items-center justify-between gap-2 text-[13px]">
                  <span className="font-medium text-[#5d5f60] dark:text-[#9ba3b0]">Tài khoản mẫu theo phân quyền</span>
                  <code className="font-mono text-[13px] text-[#434648] dark:text-[#9ba3b0]">password123</code>
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {demoAccounts.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => fillDemo(account.email)}
                      className="group flex flex-col gap-0.5 rounded-md border border-[#e6e8eb] dark:border-[#22262b] bg-[#f8f9fb] dark:bg-[#171b1f] p-2.5 text-left transition-colors hover:border-[#1b6c80] hover:bg-[#eef7f9]/50 dark:hover:bg-[#1e2328]"
                    >
                      <span className="flex w-full items-center justify-between font-mono text-[13px] font-medium text-[#1b6c80] dark:text-[#2ba3be]">
                        <span>{account.code}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                      <span className="text-[13px] font-medium text-[#131416] dark:text-white">{account.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
