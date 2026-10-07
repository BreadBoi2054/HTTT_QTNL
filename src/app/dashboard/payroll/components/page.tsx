"use client";

import { useState, useEffect } from "react";
import { Plus, Trash, Settings2 } from "lucide-react";

export default function SalaryComponentsPage() {
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
    if (!confirm(`Bạn có chắc chắn muốn xóa thành phần lương "${compName}"?`)) return;
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
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Thành phần Lương</h1>
        <p className="text-slate-500 mt-1">Quản lý các khoản phụ cấp, thưởng và tiền phạt động.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Create */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-500" />
            Tạo thành phần mới
          </h2>
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên khoản mục</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Phụ cấp ăn trưa"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loại</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="EARNING">Thu nhập (+)</option>
                <option value="DEDUCTION">Khấu trừ (-)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cách tính</label>
              <select 
                value={amountType}
                onChange={(e) => setAmountType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="FIXED">Cố định (VNĐ)</option>
                <option value="PERCENTAGE">Phần trăm lương cơ bản (%)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Giá trị mặc định</label>
              <input 
                type="number" 
                required
                value={defaultVal}
                onChange={(e) => setDefaultVal(e.target.value)}
                placeholder="VD: 500000 hoặc 10"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
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
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold text-slate-700">Danh sách các khoản mục</h3>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold border-b border-slate-200">Tên khoản mục</th>
                  <th className="px-6 py-4 font-semibold border-b border-slate-200">Loại</th>
                  <th className="px-6 py-4 font-semibold border-b border-slate-200">Giá trị</th>
                  <th className="px-6 py-4 font-semibold border-b border-slate-200">Cách tính</th>
                  <th className="px-6 py-4 font-semibold border-b border-slate-200 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                   <tr><td colSpan={5} className="p-8 text-center text-slate-500">Đang tải...</td></tr>
                ) : components.length === 0 ? (
                   <tr><td colSpan={5} className="p-8 text-center text-slate-500">Chưa có thành phần lương nào được định nghĩa.</td></tr>
                ) : (
                  components.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                      <td className="px-6 py-4"><TypeBadge t={c.type} /></td>
                      <td className="px-6 py-4 font-mono text-slate-700">
                        {c.amountType === "FIXED" ? new Intl.NumberFormat('vi-VN').format(c.defaultVal) : c.defaultVal}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {c.amountType === "FIXED" ? "VNĐ" : "% Lương cơ bản"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
