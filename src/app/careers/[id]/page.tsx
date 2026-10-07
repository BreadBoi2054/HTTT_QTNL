"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Building, Users, Calendar, CheckCircle2, Upload, Send } from "lucide-react";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cvUrl, setCvUrl] = useState(""); // In a real app, this would be a file upload to S3/Cloudinary
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/careers/jobs/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        setJob(data);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPostingId: job.id,
          name,
          email,
          phone,
          cvUrl: cvUrl || "https://example.com/dummy-cv.pdf" // Fallback for testing
        })
      });

      if (!res.ok) throw new Error("Có lỗi xảy ra khi nộp hồ sơ.");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải thông tin...</div>;
  if (!job || job.error) return <div className="min-h-screen flex items-center justify-center">Không tìm thấy công việc này.</div>;

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="bento-card p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6 animate-swiss-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 squircle flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-2">Nộp hồ sơ thành công!</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Cảm ơn bạn đã ứng tuyển vào vị trí <strong className="text-blue-600 dark:text-blue-400">{job.title}</strong>. Phòng nhân sự Nexustech sẽ phản hồi kết quả sơ loại CV qua email của bạn trong thời gian sớm nhất.
            </p>
          </div>
          <Link href="/careers" className="inline-block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95">
            Quay lại danh sách việc làm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/careers" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Trở lại danh sách tuyển dụng
        </Link>

        <div className="bento-card rounded-3xl overflow-hidden shadow-xs">
          {/* Job Header */}
          <div className="p-8 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 mb-2.5">
              Tuyển dụng nhân sự chính thức
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-4">{job.title}</h1>
            <div className="flex flex-wrap gap-6 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              <div className="flex items-center gap-2"><Building className="w-4 h-4 text-blue-500" /> {job.department?.name || 'Nexustech'}</div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-zinc-400" /> Chỉ tiêu: {job.headcount} cán bộ</div>
              {job.dueDate && <div className="flex items-center gap-2 font-mono text-zinc-400"><Calendar className="w-4 h-4" /> Hạn nộp: {new Date(job.dueDate).toLocaleDateString('vi-VN')}</div>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Job Description */}
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight">Mô tả công việc & Yêu cầu tuyển dụng</h3>
                <div className="prose prose-zinc dark:prose-invert prose-xs text-xs whitespace-pre-wrap leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {job.description}
                </div>
              </div>
            </div>

            {/* Apply Form */}
            <div className="bg-zinc-50/80 dark:bg-zinc-900/60 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 h-fit">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-500" /> Ứng tuyển trực tuyến
              </h3>
              
              {error && <div className="p-3 mb-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Họ và tên *</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-zinc-900 dark:text-zinc-100" placeholder="Nguyễn Văn A" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Email liên hệ *</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-zinc-900 dark:text-zinc-100" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Số điện thoại</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-zinc-900 dark:text-zinc-100" placeholder="0987654321" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Đường dẫn CV (Google Drive / Portfolio) *</label>
                  <div className="relative">
                    <input type="url" required value={cvUrl} onChange={e => setCvUrl(e.target.value)} className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-zinc-900 dark:text-zinc-100" placeholder="https://..." />
                    <Upload className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">Vui lòng mở quyền xem liên kết đối với file CV của bạn.</p>
                </div>
                
                <button disabled={submitting} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-70 mt-2">
                  {submitting ? "Đang gửi hồ sơ..." : "Nộp đơn ứng tuyển"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
