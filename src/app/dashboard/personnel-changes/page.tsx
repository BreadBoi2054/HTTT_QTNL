"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeftRight, 
  TrendingUp, 
  UserPlus, 
  UserMinus, 
  Award, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText,
  X,
  Printer,
  Building2
} from "lucide-react";

interface PersonnelChange {
  id: string;
  code: string;
  employeeName: string;
  employeeEmail: string;
  type: string;
  fromDept: string;
  toDept: string;
  fromPosition: string;
  toPosition: string;
  effectiveDate: string;
  signer: string;
  status: string;
}

export default function PersonnelChangesPage() {
  const [changes, setChanges] = useState<PersonnelChange[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");
  const [viewingChange, setViewingChange] = useState<PersonnelChange | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeEmail: "",
    type: "PROMOTION",
    fromDept: "Phòng Công nghệ (IT)",
    toDept: "Phòng Công nghệ (IT)",
    fromPosition: "",
    toPosition: "",
    effectiveDate: new Date().toISOString().split("T")[0],
    signer: "Ban Giám Đốc",
  });

  const fetchChanges = async () => {
    setLoading(true);
    try {
      const [changesRes, empRes, deptRes] = await Promise.all([
        fetch("/api/personnel-changes"),
        fetch("/api/employees"),
        fetch("/api/departments")
      ]);
      const [changesData, empData, deptData] = await Promise.all([
        changesRes.json(),
        empRes.json(),
        deptRes.json()
      ]);
      setChanges(Array.isArray(changesData) ? changesData : []);
      if (Array.isArray(empData)) setEmployees(empData);
      if (Array.isArray(deptData)) {
        setDepartments(deptData);
        if (deptData.length > 0 && !formData.toDept) {
          setFormData(prev => ({ ...prev, toDept: deptData[0].name }));
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChanges();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (viewingChange) setViewingChange(null);
        else if (isModalOpen) setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewingChange, isModalOpen]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/personnel-changes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchChanges();
        setIsModalOpen(false);
        setSelectedEmpId("");
        setFormData({
          employeeName: "",
          employeeEmail: "",
          type: "PROMOTION",
          fromDept: "Phòng Công nghệ (IT)",
          toDept: "Phòng Công nghệ (IT)",
          fromPosition: "",
          toPosition: "",
          effectiveDate: new Date().toISOString().split("T")[0],
          signer: "Ban Giám Đốc",
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Có lỗi xảy ra khi tạo quyết định biến động.");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Lỗi kết nối khi gửi quyết định.");
    }
  };

  const filteredChanges = changes.filter((c) => {
    const matchesSearch = c.employeeName?.toLowerCase().includes(search.toLowerCase()) || 
                          c.code?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "ALL" || c.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "NEW_HIRE": return "Tiếp nhận mới";
      case "PROMOTION": return "Bổ nhiệm / Thăng chức";
      case "TRANSFER": return "Điều chuyển nội bộ";
      case "RESIGNATION": return "Thôi việc";
      default: return type;
    }
  };

  return (
    <div className="space-y-6 animate-swiss-in pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Nhân sự & Bổ nhiệm
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
            Biến Động Nhân Sự & Bổ Nhiệm
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Theo dõi luân chuyển, bổ nhiệm cán bộ, tiếp nhận nhân sự mới và thống kê tỉ lệ thôi việc
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tạo quyết định biến động</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-card p-5 group">
          <div className="flex items-start justify-between mb-2">
            <span className="swiss-label">Tỷ lệ biến động</span>
            <div className="squircle w-9 h-9 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">2.4%</div>
          <div className="text-xs text-zinc-400 mt-1">Ngưỡng an toàn (&lt; 5%)</div>
        </div>

        <div className="bento-card p-5 group">
          <div className="flex items-start justify-between mb-2">
            <span className="swiss-label">Tiếp nhận mới</span>
            <div className="squircle w-9 h-9 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">+{changes.filter(c => c.type === "NEW_HIRE").length || 8}</div>
          <div className="text-xs text-zinc-400 mt-1">Hoàn thành tiếp nhận</div>
        </div>

        <div className="bento-card p-5 group">
          <div className="flex items-start justify-between mb-2">
            <span className="swiss-label">Điều chuyển & Bổ nhiệm</span>
            <div className="squircle w-9 h-9 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">{changes.filter(c => c.type === "PROMOTION" || c.type === "TRANSFER").length || 5}</div>
          <div className="text-xs text-zinc-400 mt-1">Quyết định đã ban hành</div>
        </div>

        <div className="bento-card p-5 group">
          <div className="flex items-start justify-between mb-2">
            <span className="swiss-label">Thôi việc / Nghỉ</span>
            <div className="squircle w-9 h-9 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <UserMinus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">{changes.filter(c => c.type === "RESIGNATION").length || 1}</div>
          <div className="text-xs text-zinc-400 mt-1">Bàn giao đầy đủ</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bento-card rounded-2xl overflow-hidden shadow-xs">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50/60 dark:bg-zinc-900/40">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc số quyết định..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all shadow-2xs font-mono"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none shadow-2xs font-mono"
            >
              <option value="ALL">Tất cả biến động</option>
              <option value="NEW_HIRE">Tiếp nhận mới</option>
              <option value="PROMOTION">Bổ nhiệm / Thăng chức</option>
              <option value="TRANSFER">Điều chuyển nội bộ</option>
              <option value="RESIGNATION">Thôi việc</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50/80 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs font-medium border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-5 py-3.5">Số QĐ & Ngày</th>
                <th className="px-5 py-3.5">Nhân sự</th>
                <th className="px-5 py-3.5">Loại biến động</th>
                <th className="px-5 py-3.5">Nội dung thay đổi</th>
                <th className="px-5 py-3.5">Người ký</th>
                <th className="px-5 py-3.5 text-right">Trạng thái & Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-zinc-500 text-xs">
                    Đang tải danh sách biến động nhân sự...
                  </td>
                </tr>
              ) : filteredChanges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-zinc-500 text-xs">
                    Không tìm thấy quyết định biến động nhân sự nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredChanges.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-medium text-zinc-900 dark:text-zinc-100 text-xs">{item.code}</div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> {item.effectiveDate}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{item.employeeName}</div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{item.employeeEmail}</div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                        {getTypeLabel(item.type)}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-xs">
                      <div className="text-zinc-500 text-[11px]">
                        Từ: <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.fromPosition}</span> ({item.fromDept})
                      </div>
                      <div className="text-zinc-900 dark:text-zinc-100 font-medium text-[11px] mt-0.5">
                        → Sang: <span>{item.toPosition}</span> ({item.toDept})
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400 text-xs">
                      {item.signer}
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-2">
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Đã ban hành
                      </span>
                      <button
                        onClick={() => setViewingChange(item)}
                        className="text-xs px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors"
                      >
                        Xem quyết định
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tạo Quyết Định */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Tạo Quyết định Biến động Nhân sự</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md"
                title="Thoát (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                  1. Loại hình biến động nhân sự <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      type: newType,
                      ...(newType === "RESIGNATION" ? { toPosition: "Thôi việc / Đã bàn giao", toDept: "Lưu trữ hồ sơ" } : {})
                    }));
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs focus:outline-none focus:border-blue-600 text-zinc-800 dark:text-zinc-200"
                >
                  <option value="PROMOTION">BỔ NHIỆM / THĂNG CHỨC NỘI BỘ</option>
                  <option value="TRANSFER">ĐIỀU CHUYỂN PHÒNG BAN</option>
                  <option value="RESIGNATION">THÔI VIỆC / CHẤM DỨT HỢP ĐỒNG</option>
                  <option value="NEW_HIRE">TIẾP NHẬN NHÂN SỰ MỚI (ONBOARDING)</option>
                </select>
              </div>

              {/* Employee Selection Dropdown */}
              {formData.type !== "NEW_HIRE" ? (
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                    2. Chọn nhân sự từ danh sách công ty <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedEmpId}
                    onChange={(e) => {
                      const empId = e.target.value;
                      setSelectedEmpId(empId);
                      const selected = employees.find(emp => emp.id === empId);
                      if (selected) {
                        setFormData(prev => ({
                          ...prev,
                          employeeName: selected.user.name,
                          employeeEmail: selected.user.email,
                          fromDept: selected.department?.name || "Chưa xếp phòng",
                          fromPosition: selected.position || "Nhân viên",
                          toDept: selected.department?.name || departments[0]?.name || "Phòng Công nghệ (IT)",
                          toPosition: prev.type === "RESIGNATION" ? "Thôi việc" : prev.toPosition
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs focus:outline-none focus:border-blue-600 text-zinc-800 dark:text-zinc-200 font-sans"
                  >
                    <option value="">-- Click để chọn nhân sự thực hiện quyết định --</option>
                    {employees
                      .filter(e => e.status !== "RESIGNED")
                      .map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.user.name} - {emp.position} ({emp.department?.name || "Chưa xếp phòng"})
                        </option>
                      ))}
                  </select>

                  {formData.employeeName && (
                    <div className="mt-2 p-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded font-mono text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">NHÂN SỰ:</span>
                        <strong className="text-zinc-900 dark:text-zinc-100">{formData.employeeName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">EMAIL:</span>
                        <span className="text-zinc-600 dark:text-zinc-300">{formData.employeeEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">HIỆN TẠI:</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">{formData.fromPosition} ({formData.fromDept})</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      Họ tên nhân sự mới <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Hoàng Văn Nam"
                      value={formData.employeeName}
                      onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                      Email doanh nghiệp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="nam.hoang@nexustech.vn"
                      value={formData.employeeEmail}
                      onChange={(e) => setFormData({ ...formData, employeeEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs focus:outline-none focus:border-blue-600 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Destination Dept & Position */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                    Đơn vị / Phòng ban tiếp nhận <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.toDept}
                    onChange={(e) => setFormData({ ...formData, toDept: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs focus:outline-none focus:border-blue-600"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                    {formData.type === "RESIGNATION" && <option value="Lưu trữ hồ sơ thôi việc">Lưu trữ hồ sơ thôi việc</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                    Chức vụ / Vị trí mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="new-positions"
                    placeholder="VD: Senior Tech Lead / Trưởng nhóm"
                    value={formData.toPosition}
                    onChange={(e) => setFormData({ ...formData, toPosition: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs focus:outline-none focus:border-blue-600"
                  />
                  <datalist id="new-positions">
                    <option value="Trưởng phòng (Department Manager)" />
                    <option value="Phó phòng (Deputy Manager)" />
                    <option value="Trưởng nhóm (Team Lead)" />
                    <option value="Senior Specialist (Chuyên viên Cấp cao)" />
                    <option value="Chuyên viên chính" />
                    <option value="Thôi việc / Đã bàn giao tài sản" />
                  </datalist>
                </div>
              </div>

              {/* Effective date & Signer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                    Ngày có hiệu lực thi hành <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                    Người ký ban hành quyết định <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="signers-list"
                    value={formData.signer}
                    onChange={(e) => setFormData({ ...formData, signer: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs focus:outline-none focus:border-blue-600"
                  />
                  <datalist id="signers-list">
                    <option value="Quản trị viên (Tổng Giám Đốc / CEO)" />
                    <option value="Trần Thị Mai (Trưởng phòng Nhân sự)" />
                    <option value="Lê Tuấn Anh (Giám đốc Kỹ thuật)" />
                    <option value="Đặng Thu Hòa (Kế toán trưởng)" />
                    <option value="Nguyễn Hoàng Nam (Giám đốc Kinh doanh)" />
                    <option value="Vũ Thu Trang (Trưởng phòng Marketing)" />
                  </datalist>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
                >
                  Thoát
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-medium transition-colors"
                >
                  Ban hành quyết định
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem Văn Bản Quyết Định Chính Thức */}
      {viewingChange && (
        <div 
          className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setViewingChange(null)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Sticky */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 print:hidden shrink-0">
              <div className="text-xs font-medium text-zinc-500">
                Quyết định nhân sự: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{viewingChange.code}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> In quyết định
                </button>
                <button
                  type="button"
                  onClick={() => setViewingChange(null)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
                  title="Thoát (Esc)"
                >
                  <X className="w-4 h-4" />
                  <span>Thoát</span>
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
              {/* National Motto & Header */}
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5 text-center space-y-1">
                <div className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  TẬP ĐOÀN CÔNG NGHỆ NEXUSTECH (NEXUSTECH GROUP)
                </div>
                <div className="text-[11px] font-mono text-zinc-500">
                  Số: <strong>{viewingChange.code}/QĐ-NXTC</strong>
                </div>
                <div className="pt-2 text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div className="text-[11px] italic text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 pb-2 inline-block">
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div className="pt-3 text-xs text-zinc-400">
                  Hà Nội, ngày {viewingChange.effectiveDate}
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center space-y-1">
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-tight text-zinc-950 dark:text-zinc-50">
                  QUYẾT ĐỊNH
                </h3>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  V/v {getTypeLabel(viewingChange.type)} Cán bộ Nhân viên
                </p>
              </div>

              {/* Document Body */}
              <div className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                <p className="italic">
                  - Căn cứ Điều lệ Tổ chức và Hoạt động của Tập đoàn Công nghệ Nexustech;<br/>
                  - Căn cứ Chiến lược Phát triển Nguồn nhân lực & Kế hoạch Tái cơ cấu bộ máy 2026;<br/>
                  - Xét đề nghị của Trưởng ban Quản trị Nhân sự & Đơn vị liên quan,
                </p>

                <div className="text-center font-bold tracking-wider text-zinc-900 dark:text-zinc-100 py-1">
                  QUYẾT NGHỊ:
                </div>

                <div className="space-y-2 pl-2">
                  <p>
                    <strong>Điều 1.</strong> {getTypeLabel(viewingChange.type)} đối với Ông/Bà: <strong>{viewingChange.employeeName}</strong> (Email: {viewingChange.employeeEmail}).
                  </p>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs">
                    <div>• Vị trí & Đơn vị hiện tại: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{viewingChange.fromPosition}</span> ({viewingChange.fromDept})</div>
                    <div className="text-blue-600 dark:text-blue-400 font-semibold">• Vị trí & Đơn vị bổ nhiệm mới: {viewingChange.toPosition} ({viewingChange.toDept})</div>
                  </div>

                  <p>
                    <strong>Điều 2.</strong> Mức lương cơ bản, các khoản phụ cấp chức danh và quyền lợi liên quan được áp dụng theo Thang bảng lương và Quy chế Đãi ngộ của Tập đoàn Nexustech kể từ ngày có hiệu lực.
                  </p>

                  <p>
                    <strong>Điều 3.</strong> Quyết định này có hiệu lực thi hành kể từ ngày <strong>{viewingChange.effectiveDate}</strong>. Các bộ phận Văn phòng Tổng Giám Đốc, Ban Quản trị Nhân sự, Kế toán & Tài chính và Ông/Bà có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này.
                  </p>
                </div>
              </div>

              {/* Signature Box */}
              <div className="grid grid-cols-2 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                <div className="text-zinc-500 text-xs space-y-1">
                  <div>Nơi nhận:</div>
                  <div>- Như Điều 3;</div>
                  <div>- Lưu HS, HC-NS;</div>
                  <div>- Ban Kiểm toán Nội bộ.</div>
                </div>

                <div className="text-center space-y-6">
                  <div>
                    <div className="font-bold uppercase text-zinc-900 dark:text-zinc-100">{viewingChange.signer}</div>
                    <div className="text-[11px] text-zinc-400 italic">(Ký, đóng dấu điện tử)</div>
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 inline-block px-3 font-medium">
                    ✓ Đã ký số điện tử
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 shrink-0">
              <button
                type="button"
                onClick={() => setViewingChange(null)}
                className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
              >
                Thoát
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-medium transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                In quyết định
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
