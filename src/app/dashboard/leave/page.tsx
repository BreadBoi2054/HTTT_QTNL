"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import LeaveModal from "@/components/leave/LeaveModal";
import { useSession } from "next-auth/react";

export default function LeavePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  
  const { data: session } = useSession();
  const isAdminOrManager = ["SYSTEM_ADMIN", "MANAGER", "HR"].includes((session?.user as any)?.roleName || "");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leave");
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn rút/xóa đơn xin nghỉ này?")) return;
    try {
      const res = await fetch(`/api/leave/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      fetchRequests();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Đã duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Đang chờ
          </span>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ANNUAL_LEAVE": return "Phép năm (Có lương)";
      case "SICK_LEAVE": return "Nghỉ ốm (Có lương)";
      case "UNPAID_LEAVE": return "Nghỉ không lương";
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <>
      <div className="space-y-6 pb-12 animate-swiss-in max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                <Calendar className="w-3.5 h-3.5" />
                Quản lý Nghỉ phép & Đơn từ
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
              Đơn Từ & Nghỉ Phép Doanh Nghiệp
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {isAdminOrManager ? "Tiếp nhận, xử lý và phê duyệt đơn nghỉ phép của toàn bộ nhân sự." : "Đăng ký nghỉ phép, theo dõi tiến độ phê duyệt và số ngày phép còn lại."}
            </p>
          </div>
          <button 
            onClick={() => { setSelectedReq(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo đơn nghỉ phép</span>
          </button>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bento-card p-5 group">
            <div className="flex items-start justify-between">
              <div>
                <span className="swiss-label">Tổng số đơn</span>
                <div className="text-3xl font-mono font-extrabold text-zinc-900 dark:text-zinc-100 mt-2">
                  {requests.length}
                </div>
              </div>
              <div className="squircle w-10 h-10 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <span className="text-xs text-zinc-400 mt-2 block">Toàn bộ hồ sơ trong cơ sở dữ liệu</span>
          </div>

          <div className="bento-card p-5 group">
            <div className="flex items-start justify-between">
              <div>
                <span className="swiss-label text-amber-600 dark:text-amber-400">Chờ phê duyệt</span>
                <div className="text-3xl font-mono font-extrabold text-amber-600 dark:text-amber-400 mt-2">
                  {requests.filter(r => r.status === "PENDING").length}
                </div>
              </div>
              <div className="squircle w-10 h-10 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <span className="text-xs text-zinc-400 mt-2 block">Hồ sơ đang chờ quản lý thẩm định</span>
          </div>

          <div className="bento-card p-5 group">
            <div className="flex items-start justify-between">
              <div>
                <span className="swiss-label text-emerald-600 dark:text-emerald-400">Tỷ lệ chấp thuận</span>
                <div className="text-3xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                  {requests.length > 0 ? Math.round((requests.filter(r => r.status === "APPROVED").length / requests.length) * 100) : 0}%
                </div>
              </div>
              <div className="squircle w-10 h-10 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <span className="text-xs text-zinc-400 mt-2 block">Đơn đã được ban hành phê duyệt</span>
          </div>
        </div>

        {/* TABLE */}
        <div className="bento-card rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/40">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Danh sách Đơn Nghỉ phép
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[10px] font-mono uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                  {isAdminOrManager && <th className="px-5 py-3 font-semibold">Nhân viên</th>}
                  <th className="px-5 py-3 font-semibold">Khoảng thời gian</th>
                  <th className="px-5 py-3 font-semibold">Loại hình nghỉ</th>
                  <th className="px-5 py-3 font-semibold text-center">Trạng thái</th>
                  <th className="px-5 py-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={isAdminOrManager ? 5 : 4} className="px-6 py-12 text-center text-zinc-500 font-mono">
                      <div className="w-5 h-5 border-2 border-zinc-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                      Đang tải danh sách đơn...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={isAdminOrManager ? 5 : 4} className="px-6 py-12 text-center text-zinc-500 font-mono">
                      Chưa có đơn từ nào được khởi tạo.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group">
                      {isAdminOrManager && (
                        <td className="px-5 py-3">
                          <div className="font-sans font-medium text-zinc-900 dark:text-zinc-100 text-sm">
                            {req.employee?.user?.name || "N/A"}
                          </div>
                          <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                            {req.employee?.department?.name || "Chưa phân phòng"}
                          </div>
                        </td>
                      )}
                      <td className="px-5 py-3 font-mono text-zinc-700 dark:text-zinc-300">
                        {formatDate(req.startDate)} <span className="text-zinc-400 mx-1">→</span> {formatDate(req.endDate)}
                      </td>
                      <td className="px-5 py-3 font-sans text-zinc-800 dark:text-zinc-200">
                        {getTypeLabel(req.type)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => { setSelectedReq(req); setIsModalOpen(true); }} 
                            className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" 
                            title={isAdminOrManager ? "Duyệt đơn" : "Xem chi tiết"}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {(req.status === "PENDING" || isAdminOrManager) && (
                            <button 
                              onClick={() => handleDelete(req.id)} 
                              className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" 
                              title="Xóa/Rút đơn"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <LeaveModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchRequests} 
        leaveRequest={selectedReq} 
        isAdmin={isAdminOrManager} 
      />
    </>
  );
}
