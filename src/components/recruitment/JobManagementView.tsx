"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function JobManagementView() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [headcount, setHeadcount] = useState(1);
  const [status, setStatus] = useState("OPEN");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recruitment/jobs");
      const data = await res.json();
      if (Array.isArray(data)) setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    setIsFormOpen(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { title, description, headcount, status };
      const url = editingJob ? `/api/recruitment/jobs/${editingJob.id}` : "/api/recruitment/jobs";
      const method = editingJob ? "PATCH" : "POST";
      
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      setIsFormOpen(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, jobTitle: string) => {
    if (!confirm(`Xóa tin tuyển dụng "${jobTitle}"?`)) return;
    try {
      await fetch(`/api/recruitment/jobs/${id}`, { method: "DELETE" });
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const openForm = (job: any = null) => {
    setEditingJob(job);
    setTitle(job ? job.title : "");
    setDescription(job ? job.description : "");
    setHeadcount(job ? job.headcount : 1);
    setStatus(job ? job.status : "OPEN");
    setIsFormOpen(true);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 flex flex-col overflow-hidden flex-1">
      <div className="flex-1 overflow-y-auto p-5">
        {isFormOpen ? (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
            <div className="mb-5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                Quản lý tuyển dụng
              </span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                {editingJob ? "Cập nhật vị trí tuyển dụng" : "Thêm vị trí tuyển dụng mới"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Tiêu đề vị trí công việc <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:border-blue-600 outline-none transition-colors" 
                  placeholder="VD: Senior DevOps Engineer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Chỉ tiêu tuyển dụng (Headcount) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  required 
                  min={1} 
                  value={headcount} 
                  onChange={e => setHeadcount(Number(e.target.value))} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:border-blue-600 outline-none transition-colors" 
                />
              </div>

              {editingJob && (
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Trạng thái tuyển dụng
                  </label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)} 
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:border-blue-600 outline-none transition-colors"
                  >
                    <option value="OPEN">Đang mở tuyển (Open)</option>
                    <option value="CLOSED">Đã đóng tuyển (Closed)</option>
                  </select>
                </div>
              )}

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Mô tả công việc (JD)
                </label>
                <textarea 
                  required 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  rows={4} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:border-blue-600 outline-none transition-colors resize-none" 
                  placeholder="Nêu trách nhiệm, yêu cầu năng lực và quyền lợi..."
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)} 
                  className="px-4 py-2 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-medium rounded-lg transition-colors"
                >
                  Lưu vị trí tuyển dụng
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/30">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Danh mục Vị trí Tuyển dụng
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">Các vị trí nhân sự đang triển khai tuyển dụng</p>
              </div>
              <button 
                onClick={() => openForm(null)} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-medium rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> 
                <span>Thêm vị trí</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/80 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs font-medium border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-5 py-3">Chức danh / Vị trí</th>
                    <th className="px-5 py-3 text-center">Chỉ tiêu</th>
                    <th className="px-5 py-3 text-center">Trạng thái</th>
                    <th className="px-5 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-zinc-500">
                        Đang tải danh sách vị trí...
                      </td>
                    </tr>
                  ) : jobs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-zinc-500">
                        Chưa có vị trí tuyển dụng nào.
                      </td>
                    </tr>
                  ) : (
                    jobs.map(job => (
                      <tr key={job.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                          {job.title}
                        </td>
                        <td className="px-5 py-3 text-center text-zinc-700 dark:text-zinc-300 font-mono">
                          {job.headcount}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            job.status === 'OPEN' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                              : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'OPEN' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                            {job.status === 'OPEN' ? 'Đang tuyển' : 'Đã đóng'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button 
                              onClick={() => openForm(job)} 
                              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              title="Sửa"
                            >
                              <Edit2 className="w-3.5 h-3.5"/>
                            </button>
                            <button 
                              onClick={() => handleDelete(job.id, job.title)} 
                              className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5"/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
