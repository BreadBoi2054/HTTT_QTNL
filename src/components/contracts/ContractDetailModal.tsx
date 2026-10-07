"use client";

import { useEffect } from "react";
import { X, Printer, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

interface ContractDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: any;
}

export default function ContractDetailModal({ isOpen, onClose, contract }: ContractDetailModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !contract) return null;

  const handlePrint = () => {
    window.print();
  };

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
              Chi tiết hợp đồng
            </span>
            <span className="text-xs text-zinc-300 dark:text-zinc-700">·</span>
            <span className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
              {contract.code}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-md text-xs font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              In hợp đồng
            </button>
            <button 
              onClick={onClose} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-md text-xs font-medium transition-colors"
              title="Thoát (Esc)"
            >
              <X className="w-3.5 h-3.5" />
              Thoát
            </button>
          </div>
        </div>

        {/* Printable Legal Contract */}
        <div className="p-8 space-y-6 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 print:p-0">
          
          {/* National Motto & Form Letterhead */}
          <div className="text-center space-y-1 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="font-bold text-xs uppercase tracking-wider">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="text-xs font-semibold">
              Độc lập - Tự do - Hạnh phúc
            </div>
            <div className="text-[11px] text-zinc-400 pt-1">
              Số: {contract.code} / HĐLĐ-NEXUSTECH
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
              HỢP ĐỒNG LAO ĐỘNG
            </h1>
            <p className="text-xs text-zinc-500">
              Loại hình: <strong>{contract.type === "INDEFINITE" ? "Hợp đồng không xác định thời hạn" : contract.type === "PROBATION" ? "Hợp đồng thử việc" : "Hợp đồng xác định thời hạn"}</strong>
            </p>
          </div>

          {/* Legal Parties */}
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-1.5">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                BÊN A: NGƯỜI SỬ DỤNG LAO ĐỘNG
              </div>
              <div>Doanh nghiệp: <strong>CÔNG TY CỔ PHẦN CÔNG NGHỆ NEXUSTECH</strong></div>
              <div>Đại diện pháp luật: Ông <strong>Nguyễn Thế Vinh</strong> - Chức vụ: Tổng Giám Đốc</div>
              <div>Địa chỉ: Tòa nhà Nexustech Tower, Duy Tân, Cầu Giấy, TP. Hà Nội</div>
              <div>Mã số thuế: 0109867543 · Điện thoại: (024) 3792-8888</div>
            </div>

            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-1.5">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                BÊN B: NGƯỜI LAO ĐỘNG
              </div>
              <div>Họ và tên: <strong>{contract.employeeName}</strong></div>
              <div>Mã định danh cán bộ: {contract.employeeCode}</div>
              <div>Vị trí chuyên môn: <strong>{contract.position}</strong></div>
              <div>Đơn vị trực thuộc: {contract.departmentName}</div>
              <div>Email công vụ: {contract.employeeEmail}</div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-3 text-xs">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              ĐIỀU KHOẢN HỢP ĐỒNG & CHẾ ĐỘ ĐÃI NGỘ
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-1">
                <span className="text-[11px] text-zinc-400">Thời hạn hợp đồng:</span>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  Từ ngày {contract.startDate} {contract.endDate ? `đến ngày ${contract.endDate}` : "(Vô thời hạn)"}
                </div>
              </div>

              <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-1">
                <span className="text-[11px] text-zinc-400">Mức lương cơ sở:</span>
                <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {contract.salary.toLocaleString("vi-VN")} VNĐ / tháng
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-2 text-zinc-600 dark:text-zinc-400 text-xs">
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">Quyền lợi & Nghĩa vụ:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Thời giờ làm việc: 08 giờ/ngày, từ Thứ Hai đến Thứ Sáu (nghỉ Thứ Bảy, Chủ Nhật).</li>
                <li>Hình thức trả lương: Chuyển khoản ngân hàng trước ngày 05 hàng tháng.</li>
                <li>Chế độ bảo hiểm: Đóng BHXH (8%), BHYT (1.5%), BHTN (1%) đầy đủ theo quy định pháp luật.</li>
                <li>Thưởng hiệu suất (KPI) và tháng lương 13 theo kết quả kinh doanh của công ty.</li>
              </ul>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">ĐẠI DIỆN NGƯỜI LAO ĐỘNG</div>
              <div className="text-[11px] text-zinc-400 italic">(Ký, ghi rõ họ tên)</div>
              <div className="h-14 flex items-center justify-center italic text-zinc-400 text-xs">
                Đã xác nhận điện tử
              </div>
              <div className="font-medium text-zinc-800 dark:text-zinc-200">{contract.employeeName}</div>
            </div>

            <div>
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">ĐẠI DIỆN CÔNG TY NEXUSTECH</div>
              <div className="text-[11px] text-zinc-400 italic">(Ký tên, đóng dấu)</div>
              <div className="h-14 flex items-center justify-center">
                <span className="border border-emerald-600 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-300 px-3 py-1 text-[11px] font-bold rounded uppercase tracking-wider">
                  Đã ký điện tử
                </span>
              </div>
              <div className="font-medium text-zinc-800 dark:text-zinc-200">Nguyễn Thế Vinh - TGĐ</div>
            </div>
          </div>

        </div>

        {/* Sticky Bottom Action Bar with Exit Button */}
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
              In hợp đồng
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
