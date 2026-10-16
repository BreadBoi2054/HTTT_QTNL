"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Eye, EyeOff } from "lucide-react";

const demoAccounts = [
  { label: "Điều hành", email: "ceo@nexustech.vn", code: "BOD" },
  { label: "Nhân sự", email: "hr@nexustech.vn", code: "HR" },
  { label: "Kế toán", email: "accountant@nexustech.vn", code: "ACC" },
  { label: "Trưởng phòng", email: "manager@nexustech.vn", code: "MGR" },
  { label: "Quản trị", email: "admin@nexustech.vn", code: "ADM" },
  { label: "Nhân viên", email: "user@nexustech.vn", code: "ESS" },
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

  return <main className="folio-login min-h-dvh p-4 sm:p-8 lg:p-12">
    <div className="mx-auto grid min-h-[calc(100dvh-2rem)] max-w-6xl overflow-hidden border border-[#d5cabb] bg-[#fffdf8] shadow-[14px_14px_0_#d9d0c1] dark:border-[#405242] dark:bg-[#232720] dark:shadow-none sm:min-h-[calc(100dvh-4rem)] lg:grid-cols-[1.05fr_0.95fr] lg:min-h-[calc(100dvh-6rem)]">
      <section className="relative order-2 flex flex-col justify-between overflow-hidden bg-[#173b31] p-7 text-[#f6f1e6] sm:p-10 lg:order-1 lg:p-14">
        <div className="absolute -right-24 top-20 h-96 w-96 rounded-full border border-white/10" /><div className="absolute -right-10 top-36 h-72 w-72 rounded-full border border-white/10" />
        <div className="relative">
          <Link href="/careers" className="inline-flex items-center gap-3" aria-label="Nexustech, xem trang tuyển dụng"><span className="flex h-10 w-10 items-center justify-center border border-[#d3a77e] folio-display text-2xl">N</span><span><strong className="block text-sm tracking-[0.12em]">NEXUSTECH</strong><small className="text-[10px] uppercase tracking-[0.18em] text-[#bfd3c4]">Quản trị nguồn nhân lực</small></span></Link>
          <div className="mt-16 max-w-xl lg:mt-24"><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d8a980]">Không gian làm việc nội bộ · 2026</span><h1 className="mt-6 text-4xl leading-tight sm:text-5xl lg:text-6xl">Con người là<br /><em className="font-normal text-[#d8a980]">trọng tâm.</em></h1><p className="mt-7 max-w-md text-sm leading-7 text-[#ceded1]">Một nơi để theo dõi hồ sơ, thời gian làm việc, nghỉ phép, hiệu suất và thu nhập của đội ngũ.</p></div>
        </div>
        <div className="relative mt-16 border-t border-white/25 pt-5 text-xs text-[#c9d8cc]"><div className="flex items-center justify-between gap-4"><span>Hệ thống quản trị nhân lực</span><span className="font-mono text-[#d8a980]">NT — HRMIS</span></div></div>
      </section>

      <section className="order-1 flex flex-col justify-center p-7 sm:p-10 lg:order-2 lg:p-14">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10"><div className="folio-kicker">Truy cập / 01</div><h2 className="mt-3 text-4xl text-zinc-900 dark:text-zinc-100">Đăng nhập.</h2><p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">Sử dụng tài khoản công việc để mở bàn điều hành của bạn.</p></div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-zinc-700 dark:text-zinc-300">Email công việc</label><input id="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ten@nexustech.vn" className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" /></div>
            <div><label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-zinc-700 dark:text-zinc-300">Mật khẩu</label><div className="relative"><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nhập mật khẩu" className="w-full border border-zinc-300 bg-white px-4 py-3 pr-12 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 px-4 text-zinc-500" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            {error && <p role="alert" className="border-l-2 border-red-600 bg-red-50 px-3 py-2 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
            <button disabled={loading} type="submit" className="flex w-full items-center justify-between bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"><span>{loading ? "Đang xác thực..." : "Vào hệ thống"}</span><ArrowRight className="h-4 w-4" /></button>
          </form>

          {process.env.NODE_ENV === "development" && <div className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-700"><div className="mb-4 flex items-center justify-between gap-2"><span className="folio-kicker">Tài khoản dùng thử</span><span className="text-[10px] text-zinc-500">Mật khẩu: password123</span></div><div className="grid grid-cols-2 gap-px overflow-hidden border border-zinc-200 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-700 sm:grid-cols-3">{demoAccounts.map((account) => <button key={account.email} type="button" onClick={() => fillDemo(account.email)} className="group flex flex-col gap-2 bg-[#fffdf8] p-3 text-left transition-colors hover:bg-blue-50 dark:bg-[#232720] dark:hover:bg-blue-950"><span className="flex w-full items-center justify-between text-[10px] font-mono text-[#a86239]"><span>{account.code}</span><ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100" /></span><span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{account.label}</span></button>)}</div></div>}
          <div className="mt-8 text-xs text-zinc-500"><Link href="/careers" className="inline-flex items-center gap-1 hover:text-blue-600">Xem cơ hội nghề nghiệp <ArrowUpRight className="h-3 w-3" /></Link></div>
        </div>
      </section>
    </div>
  </main>;
}
