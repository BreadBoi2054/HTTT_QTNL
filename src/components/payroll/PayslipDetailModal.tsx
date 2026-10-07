"use client";

import { useEffect } from "react";
import { X, Printer, CheckCircle2, Clock } from "lucide-react";

interface PayslipDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: any;
}

export default function PayslipDetailModal({ isOpen, onClose, payroll }: PayslipDetailModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !payroll) return null;

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const emp = payroll.employee;
  const user = emp?.user;
  const deptName = emp?.department?.name || "Chưa phân bổ";
  const position = emp?.position || "Chuyên viên";
  const empCode = emp?.employeeCode || `NV-${emp?.id?.slice(-5).toUpperCase()}`;

  // Breakdown calculations
  const baseSalary = payroll.baseSalary || 0;
  const bonus = payroll.bonus || 0;
  const deductions = payroll.deductions || 0;
  const grossSalary = baseSalary + bonus;
  const netSalary = payroll.netSalary || (grossSalary - deductions);

  // Social insurance itemization
  const bhxh = Math.round(baseSalary * 0.08);
  const bhyt = Math.round(baseSalary * 0.015);
  const bhtn = Math.round(baseSalary * 0.01);
  const otherDeductions = Math.max(0, deductions - (bhxh + bhyt + bhtn));

  const detailsList = Array.isArray(payroll.details) ? payroll.details : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden flex flex-col print:shadow-none print:border-none print:w-full print:m-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Top Action Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Chi tiết phiếu lương
            </span>
            <span className="text-xs text-zinc-300 dark:text-zinc-700">·</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Kỳ tháng {payroll.month < 10 ? `0${payroll.month}` : payroll.month}/{payroll.year}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-md text-xs font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              In phiếu
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-md text-xs font-medium transition-colors"
              title="Thoát về danh sách (Esc)"
            >
              <X className="w-3.5 h-3.5" />
              Thoát
            </button>
          </div>
        </div>

        {/* Printable Payslip Sheet */}
        <div className="p-8 space-y-6 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 print:p-0">
          
          {/* Corporate Letterhead */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <div className="font-bold text-sm tracking-wide uppercase text-zinc-900 dark:text-zinc-100">
                CÔNG TY CỔ PHẦN CÔNG NGHỆ NEXUSTECH
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Tòa nhà Nexustech Tower, Số 18 Duy Tân, Cầu Giấy, Hà Nội
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                MST: 0109867543 · Điện thoại: (024) 3792-8888
              </div>
            </div>

            <div className="text-left sm:text-right text-xs">
              <div className="text-zinc-400 uppercase text-[10px] font-medium tracking-wider">Mã chứng từ</div>
              <div className="font-mono font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                PL-{payroll.year}{payroll.month < 10 ? `0${payroll.month}` : payroll.month}-{payroll.id.slice(-6).toUpperCase()}
              </div>
              <div className="text-zinc-400 text-[11px] mt-0.5">
                Ngày lập: {new Date().toLocaleDateString("vi-VN")}
              </div>
            </div>
          </div>

          {/* Title & Status */}
          <div className="text-center space-y-1.5 py-1">
            <h1 className="text-xl font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
              PHIẾU LƯƠNG NHÂN VIÊN
            </h1>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Kỳ lương: Tháng {payroll.month < 10 ? `0${payroll.month}` : payroll.month} / Năm {payroll.year}
            </div>

            <div className="pt-1">
              {payroll.status === "PAID" ? (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã duyệt chi & hoàn tất thanh toán
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  Bản nháp (Đang chờ duyệt)
                </span>
              )}
            </div>
          </div>

          {/* Personnel Dossier Box */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg text-xs grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
            <div>
              <span className="text-zinc-400 uppercase text-[10px] font-medium tracking-wider">Họ và tên</span>
              <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">
                {user?.name || "N/A"}
              </div>
            </div>

            <div>
              <span className="text-zinc-400 uppercase text-[10px] font-medium tracking-wider">Mã nhân viên</span>
              <div className="font-mono font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">{empCode}</div>
            </div>

            <div>
              <span className="text-zinc-400 uppercase text-[10px] font-medium tracking-wider">Vai trò hệ thống</span>
              <div className="mt-1">
                {(user?.role?.name === "SYSTEM_ADMIN" || emp?.role === "SYSTEM_ADMIN") ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Ban Lãnh đạo (Admin)
                  </span>
                ) : (user?.role?.name === "MANAGER" || emp?.managedDept) ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Trưởng đơn vị (Manager)
                  </span>
                ) : (user?.role?.name === "HR") ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Nhân sự & C&B (HR)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                    Cán bộ nhân viên (User)
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-zinc-400 uppercase text-[10px] font-medium tracking-wider">Phòng ban</span>
              <div className="text-zinc-800 dark:text-zinc-200 mt-0.5">{deptName}</div>
            </div>

            <div>
              <span className="text-zinc-400 uppercase text-[10px] font-medium tracking-wider">Vị trí công tác</span>
              <div className="text-zinc-800 dark:text-zinc-200 mt-0.5">{position}</div>
            </div>

            <div>
              <span className="text-zinc-400 uppercase text-[10px] font-medium tracking-wider">Email công vụ</span>
              <div className="text-zinc-800 dark:text-zinc-200 mt-0.5 font-mono text-xs">{user?.email || "N/A"}</div>
            </div>
          </div>

          {/* Detailed Itemization Table */}
          <div className="space-y-4">
            
            {/* Section I: Thu nhập */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex justify-between uppercase tracking-wider">
                <span>I. Các khoản thu nhập (Gross)</span>
                <span>Số tiền (VNĐ)</span>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
                <div className="px-4 py-2.5 flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">1. Lương cơ bản theo hợp đồng</span>
                  <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">{formatVND(baseSalary)}</span>
                </div>
                <div className="px-4 py-2.5 flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">2. Phụ cấp & thưởng hiệu suất</span>
                  <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">{formatVND(bonus)}</span>
                </div>
                <div className="px-4 py-2.5 bg-zinc-50/70 dark:bg-zinc-900/40 flex justify-between font-semibold text-zinc-900 dark:text-zinc-100">
                  <span>Tổng thu nhập (A)</span>
                  <span className="font-mono">{formatVND(grossSalary)}</span>
                </div>
              </div>
            </div>

            {/* Section II: Khấu trừ */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex justify-between uppercase tracking-wider">
                <span>II. Các khoản giảm trừ nghĩa vụ (B)</span>
                <span>Số tiền (VNĐ)</span>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
                <div className="px-4 py-2.5 flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">1. Bảo hiểm Xã hội (BHXH 8%)</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatVND(bhxh)}</span>
                </div>
                <div className="px-4 py-2.5 flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">2. Bảo hiểm Y tế (BHYT 1.5%)</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatVND(bhyt)}</span>
                </div>
                <div className="px-4 py-2.5 flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">3. Bảo hiểm Thất nghiệp (BHTN 1.0%)</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatVND(bhtn)}</span>
                </div>
                {otherDeductions > 0 && (
                  <div className="px-4 py-2.5 flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">4. Giảm trừ khác / Tạm ứng</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatVND(otherDeductions)}</span>
                  </div>
                )}
                <div className="px-4 py-2.5 bg-zinc-50/70 dark:bg-zinc-900/40 flex justify-between font-semibold text-zinc-900 dark:text-zinc-100">
                  <span>Tổng các khoản giảm trừ (B)</span>
                  <span className="font-mono">{formatVND(deductions)}</span>
                </div>
              </div>
            </div>

            {/* Section III: Net Take-home */}
            <div className="p-5 bg-zinc-900 dark:bg-zinc-800/80 text-white rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold text-zinc-300">
                  III. Thực lĩnh chuyển khoản (Net = A - B)
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  Hình thức: Chuyển khoản ngân hàng Techcombank
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-400 font-mono">
                {formatVND(netSalary)}
              </div>
            </div>
          </div>

          {/* Itemized breakdown if present */}
          {detailsList && detailsList.length > 0 && (
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3.5 text-xs">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-2">
                Thông tin ngày công & phụ cấp thực tế:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {detailsList.map((d: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-zinc-950 p-2.5 border border-zinc-200 dark:border-zinc-800 rounded">
                    <div className="text-zinc-500 text-[11px] truncate">{d.name}</div>
                    <div className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 font-mono">
                      {d.amountType === "DAYS" ? `${d.amount} ngày` : formatVND(d.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signatures 4-Role Chain */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/80">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">1. Người lập biểu</div>
              <div className="text-[10px] text-zinc-400 italic">(Khởi tạo)</div>
              <div className="h-12 flex items-center justify-center text-zinc-400 text-xs italic">
                Chuyên viên C&B
              </div>
              <div className="font-medium text-[11px] text-purple-600 dark:text-purple-400">Phòng Nhân sự (HR)</div>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/80">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">2. Kiểm soát công</div>
              <div className="text-[10px] text-zinc-400 italic">(Thẩm định)</div>
              <div className="h-12 flex items-center justify-center text-zinc-400 text-xs italic">
                Đã đối soát công
              </div>
              <div className="font-medium text-[11px] text-amber-600 dark:text-amber-400">Trưởng phòng (Manager)</div>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/80">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">3. Phê duyệt chi</div>
              <div className="text-[10px] text-zinc-400 italic">(Khóa sổ tài chính)</div>
              <div className="h-12 flex items-center justify-center">
                {payroll.status === "PAID" ? (
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold rounded-full">
                    Đã duyệt chi
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-400 italic">Chờ phê duyệt</span>
                )}
              </div>
              <div className="font-medium text-[11px] text-blue-600 dark:text-blue-400">Ban Lãnh đạo (Admin)</div>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/80">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">4. Người nhận lương</div>
              <div className="text-[10px] text-zinc-400 italic">(Xác nhận nhận tiền)</div>
              <div className="h-12 flex items-center justify-center text-zinc-400 text-xs italic">
                Xác nhận điện tử
              </div>
              <div className="font-medium text-[11px] text-zinc-700 dark:text-zinc-300 truncate">{user?.name}</div>
            </div>
          </div>

        </div>

        {/* Sticky Bottom Action Bar with Clear Exit Button */}
        <div className="sticky bottom-0 z-20 flex items-center justify-between px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm print:hidden">
          <div className="text-xs text-zinc-500">
            Bấm <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 rounded border border-zinc-300 dark:border-zinc-700">Esc</kbd> hoặc nút Thoát để đóng
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-md text-xs font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              In phiếu
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-md text-xs font-medium transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Thoát
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
