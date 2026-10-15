"use client";

import { useState, useEffect } from "react";
import { Plus, Trash, Settings2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useConfirm, TableSkeleton } from "@/components/providers/ToastProvider";

export default function SalaryComponentsPage() {
  const confirm = useConfirm();
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState("");
  const [type, setType] = useState("EARNING");
  const [amountType, setAmountType] = useState("FIXED");
  const [defaultVal, setDefaultVal] = useState("");

  const fetchComponents = async () => {
    try {
      const res = await fetch("/api/payroll/components");
      const data = await res.json();
      setComponents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const handleDelete = async (id: string, compName: string) => {
    if (!(await confirm(`Bạn có chắc chắn muốn xóa thành phần lương "${compName}"?`))) return;
    try {
      const res = await fetch(`/api/payroll/components/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorText = await res.text();
        alert(errorText || "Không thể xóa thành phần lương.");
        return;
      }
      fetchComponents();
    } catch (error: any) {
      alert(error.message || "Lỗi khi xóa thành phần lương.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !defaultVal) return;

    try {
      const res = await fetch("/api/payroll/components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, amountType, defaultVal })
      });
      if (!res.ok) {
        const errorText = await res.text();
        alert(errorText || "Không thể tạo thành phần lương.");
        return;
      }
      setName("");
      setDefaultVal("");
      fetchComponents();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Lỗi khi tạo thành phần lương.");
    }
  };

  const TypeBadge = ({ t }: { t: string }) => {
    if (t === "EARNING") return <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">Thu nhập (+)</span>;
    return <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">Khấu trừ (-)</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <Link href="/dashboard/payroll" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Bảng lương
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Danh mục Thành phần Lương</h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">Quản lý các khoản phụ cấp, thưởng và khấu trừ động áp dụng khi tính lương.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Create */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-500" />
            Tạo thành phần mới
          </h2>
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tên khoản mục</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Phụ cấp ăn trưa"
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Loại</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="EARNING">Thu nhập (+)</option>
                <option value="DEDUCTION">Khấu trừ (-)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cách tính</label>
              <select 
                value={amountType}
                onChange={(e) => setAmountType(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="FIXED">Cố định (VNĐ)</option>
                <option value="PERCENTAGE">Phần trăm lương cơ bản (%)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Giá trị mặc định</label>
              <input 
                type="number" 
                required
                value={defaultVal}
                onChange={(e) => setDefaultVal(e.target.value)}
                placeholder="VD: 500000 hoặc 10"
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tạo mới
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
            <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">Danh sách các khoản mục</h3>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold border-b border-zinc-200 dark:border-zinc-800">Tên khoản mục</th>
                  <th className="px-6 py-4 font-semibold border-b border-zinc-200 dark:border-zinc-800">Loại</th>
                  <th className="px-6 py-4 font-semibold border-b border-zinc-200 dark:border-zinc-800">Giá trị</th>
                  <th className="px-6 py-4 font-semibold border-b border-zinc-200 dark:border-zinc-800">Cách tính</th>
                  <th className="px-6 py-4 font-semibold border-b border-zinc-200 dark:border-zinc-800 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {loading ? (
                   <tr><td colSpan={5} className="p-4"><TableSkeleton rows={4} cols={5} /></td></tr>
                ) : components.length === 0 ? (
                   <tr><td colSpan={5} className="p-8 text-center text-zinc-500 dark:text-zinc-400">Chưa có thành phần lương nào được định nghĩa.</td></tr>
                ) : (
                  components.map(c => (
                    <tr key={c.id} className="hover:bg-zinc-50/60 dark:bg-zinc-900/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{c.name}</td>
                      <td className="px-6 py-4"><TypeBadge t={c.type} /></td>
                      <td className="px-6 py-4 font-mono text-zinc-700 dark:text-zinc-300">
                        {c.amountType === "FIXED" ? new Intl.NumberFormat('vi-VN').format(c.defaultVal) : c.defaultVal}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                        {c.amountType === "FIXED" ? "VNĐ" : "% Lương cơ bản"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Xóa khoản mục"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
