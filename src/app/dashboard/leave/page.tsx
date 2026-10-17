"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import LeaveModal from "@/components/leave/LeaveModal";
import { useSession } from "next-auth/react";
import { useConfirm, TableSkeleton } from "@/components/providers/ToastProvider";

type LeaveBalance = { allowance: number; usedDays: number; remainingDays: number };

export default function LeavePage() {
  const confirm = useConfirm();
  const [requests, setRequests] = useState<any[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  
  const { data: session } = useSession();
  const roleName = (session?.user as any)?.roleName || "USER";
  const isAdminOrManager = ["SYSTEM_ADMIN", "BOD", "MANAGER", "HR"].includes(roleName);
  const canManageEmployee = ["SYSTEM_ADMIN", "BOD", "HR"].includes(roleName);

  const fetchRequests = async () => {
    setLoading(true);
    setLoadError("");
    const requestsResult = fetch("/api/leave", { signal: AbortSignal.timeout(12000) })
      .then(async (res) => {
        if (!res.ok) throw new Error("Không tải được danh sách đơn nghỉ phép.");
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error(error);
        setLoadError("Không tải được danh sách đơn nghỉ phép. Vui lòng thử lại.");
      })
      .finally(() => setLoading(false));
    const balanceResult = fetch("/api/leave/balance", { signal: AbortSignal.timeout(12000) })
      .then(async (res) => {
        if (!res.ok) throw new Error("Không tải được quỹ phép cá nhân.");
        setLeaveBalance(await res.json());
      })
      .catch((error) => {
        console.error(error);
        setLeaveBalance(null);
      });
    await Promise.all([requestsResult, balanceResult]);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDelete = async (id: string) => {
    if (!(await confirm("Bạn có chắc chắn muốn rút/xóa đơn xin nghỉ này?"))) return;
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Đã duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Đang chờ
          </span>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ANNUAL_LEAVE": return "Phép năm (Có lương)";
      case "SICK_LEAVE": return "Nghỉ ốm (Chế độ BHXH)";
      case "MATERNITY_LEAVE": return "Nghỉ thai sản";
      case "UNPAID_LEAVE": return "Nghỉ không lương";
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const filteredRequests = statusFilter === "ALL" ? requests : requests.filter((r) => r.status === statusFilter);

  return (
    <>
      <div className="space-y-6 pb-12 animate-swiss-in max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Đơn Từ & Nghỉ Phép Doanh Nghiệp
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {isAdminOrManager ? "Tiếp nhận và xử lý đơn nghỉ phép trong phạm vi bạn phụ trách." : "Đăng ký nghỉ phép, theo dõi tiến độ phê duyệt và số ngày phép còn lại."}
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

        {loadError && <div role="alert" className="folio-panel border-amber-300 px-4 py-3 text-sm text-amber-800">{loadError}</div>}

        {/* PERSONAL ANNUAL LEAVE BALANCE SUMMARY */}
        <div className="bento-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-blue-600">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Quỹ phép cá nhân năm {new Date().getFullYear()}
            </span>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              Số dư ngày phép hưởng lương của bạn
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Định mức</div>
              <div className="text-base font-mono font-bold text-zinc-900 dark:text-zinc-100">{leaveBalance ? `${leaveBalance.allowance} ngày` : "—"}</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-mono">Đã dùng</div>
              <div className="text-base font-mono font-bold text-amber-700 dark:text-amber-300">{leaveBalance ? `${leaveBalance.usedDays} ngày` : "—"}</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-mono">Còn lại</div>
              <div className="text-base font-mono font-bold text-emerald-700 dark:text-emerald-300">{leaveBalance ? `${leaveBalance.remainingDays} ngày` : "—"}</div>
            </div>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bento-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="swiss-label">Tổng số đơn</span>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight mt-2">
                  {requests.length}
                </div>
              </div>
              <div className="squircle w-9 h-9 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <span className="text-xs text-zinc-400 mt-2 block">Các đơn trong phạm vi truy cập của bạn</span>
          </div>

          <div className="bento-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="swiss-label">Chờ phê duyệt</span>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight mt-2">
                  {requests.filter(r => r.status === "PENDING").length}
                </div>
              </div>
              <div className="squircle w-9 h-9 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-2 block">Hồ sơ đang chờ quản lý thẩm định</span>
          </div>

          <div className="bento-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="swiss-label">Tỷ lệ chấp thuận</span>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight mt-2">
                  {requests.length > 0 ? Math.round((requests.filter(r => r.status === "APPROVED").length / requests.length) * 100) : 0}%
                </div>
              </div>
              <div className="squircle w-9 h-9 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2 block">Đơn đã được ban hành phê duyệt</span>
          </div>
        </div>

        {/* TABLE */}
        <div className="bento-card rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/70 dark:bg-zinc-900/40">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Danh sách Đơn Nghỉ phép
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 outline-none"
              >
                <option value="ALL">Tất cả ({requests.length})</option>
                <option value="PENDING">Chờ duyệt ({requests.filter(r => r.status === "PENDING").length})</option>
                <option value="APPROVED">Đã duyệt ({requests.filter(r => r.status === "APPROVED").length})</option>
                <option value="REJECTED">Từ chối ({requests.filter(r => r.status === "REJECTED").length})</option>
              </select>
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
                    <td colSpan={isAdminOrManager ? 5 : 4} className="p-4">
                      <TableSkeleton rows={5} cols={isAdminOrManager ? 5 : 4} />
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={isAdminOrManager ? 5 : 4} className="px-6 py-12 text-center text-zinc-500 font-mono">
                      {requests.length === 0 ? "Chưa có đơn từ nào được khởi tạo." : "Không có đơn nghỉ phép nào khớp với bộ lọc trạng thái."}
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
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
                          {(canManageEmployee || (req.status === "PENDING" && req.employee?.userId === session?.user?.id)) && (
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
        isAdmin={isAdminOrManager && (["SYSTEM_ADMIN", "BOD"].includes(roleName) || selectedReq?.employee?.userId !== session?.user?.id)}
        canManageEmployee={canManageEmployee}
        canEditDetails={canManageEmployee || !selectedReq || selectedReq?.employee?.userId === session?.user?.id}
      />
    </>
  );
}
