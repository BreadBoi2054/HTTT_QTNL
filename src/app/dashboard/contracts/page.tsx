"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Search, 
  Plus, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Building2, 
  User, 
  Printer, 
  Eye,
  Calendar,
  Send,
  ArrowRight
} from "lucide-react";
import ContractDetailModal from "@/components/contracts/ContractDetailModal";
import CreateContractModal from "@/components/contracts/CreateContractModal";

interface ContractItem {
  id: string;
  code: string;
  employeeName: string;
  employeeCode: string;
  employeeEmail?: string;
  department: string;
  position: string;
  type: string;
  startDate: string;
  endDate: string;
  salary: number;
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";
  daysLeft?: number;
}

const initialContracts: ContractItem[] = [
  {
    id: "ct_001",
    code: "HĐLĐ-2024/NX-08942",
    employeeName: "Trần Văn An",
    employeeCode: "NX-08942",
    employeeEmail: "an.tv@nexustech.vn",
    department: "Khối Công Nghệ & Phần Mềm",
    position: "Kỹ Sư Phần Mềm Cao Cấp",
    type: "Hợp đồng Không xác định thời hạn",
    startDate: "15/03/2022",
    endDate: "Không xác định",
    salary: 25000000,
    status: "ACTIVE"
  },
  {
    id: "ct_002",
    code: "HĐLĐ-2023/NX-07211",
    employeeName: "Lê Thị Bích",
    employeeCode: "NX-07211",
    employeeEmail: "bich.lt@nexustech.vn",
    department: "Khối Kinh Doanh & Tiếp Thị",
    position: "Trưởng Nhóm Khách Hàng Doanh Nghiệp",
    type: "Hợp đồng Không xác định thời hạn",
    startDate: "10/06/2023",
    endDate: "Không xác định",
    salary: 22000000,
    status: "ACTIVE"
  },
  {
    id: "ct_003",
    code: "HĐLĐ-2025/NX-10294",
    employeeName: "Bùi Quốc Khánh",
    employeeCode: "NX-10294",
    employeeEmail: "khanh.bq@nexustech.vn",
    department: "Khối Kinh Doanh & Tiếp Thị",
    position: "Chuyên Viên Phát Triển Thị Trường",
    type: "Hợp đồng Xác định thời hạn 12 tháng",
    startDate: "20/10/2025",
    endDate: "20/10/2026",
    salary: 16000000,
    status: "EXPIRING_SOON",
    daysLeft: 15
  },
  {
    id: "ct_004",
    code: "HĐLĐ-2025/NX-09811",
    employeeName: "Vũ Hải Đăng",
    employeeCode: "NX-09811",
    employeeEmail: "dang.vh@nexustech.vn",
    department: "Khối Công Nghệ & Phần Mềm",
    position: "Kỹ Sư DevOps & SRE",
    type: "Hợp đồng Xác định thời hạn 12 tháng",
    startDate: "28/10/2025",
    endDate: "28/10/2026",
    salary: 24000000,
    status: "EXPIRING_SOON",
    daysLeft: 23
  },
  {
    id: "ct_005",
    code: "HĐLĐ-2025/NX-07340",
    employeeName: "Đỗ Thu Hương",
    employeeCode: "NX-07340",
    employeeEmail: "huong.dt@nexustech.vn",
    department: "Khối Dịch Vụ Khách Hàng",
    position: "Chuyên Viên Chăm Sóc Khách Hàng VIP",
    type: "Hợp đồng Xác định thời hạn 12 tháng",
    startDate: "02/11/2025",
    endDate: "02/11/2026",
    salary: 15000000,
    status: "EXPIRING_SOON",
    daysLeft: 28
  },
  {
    id: "ct_006",
    code: "HĐLĐ-2024/NX-06433",
    employeeName: "Ngô Đức Dũng",
    employeeCode: "NX-06433",
    employeeEmail: "dung.nd@nexustech.vn",
    department: "Khối R&D & Trí Tuệ Nhân Tạo",
    position: "Chuyên Gia Nghiên Cứu AI",
    type: "Hợp đồng Không xác định thời hạn",
    startDate: "01/04/2024",
    endDate: "Không xác định",
    salary: 35000000,
    status: "ACTIVE"
  },
  {
    id: "ct_007",
    code: "HĐLĐ-2023/NX-05189",
    employeeName: "Hoàng Thị Mai",
    employeeCode: "NX-05189",
    employeeEmail: "mai.ht@nexustech.vn",
    department: "Khối Tài Chính & Kế Toán",
    position: "Kế Toán Trưởng Bộ Phận",
    type: "Hợp đồng Không xác định thời hạn",
    startDate: "18/08/2023",
    endDate: "Không xác định",
    salary: 28000000,
    status: "ACTIVE"
  },
  {
    id: "ct_008",
    code: "HĐTV-2026/NX-11029",
    employeeName: "Trịnh Bá Phúc",
    employeeCode: "NX-11029",
    employeeEmail: "phuc.tb@nexustech.vn",
    department: "Khối Công Nghệ & Phần Mềm",
    position: "Kỹ Sư Backend Node.js",
    type: "Hợp đồng Thử việc (02 tháng)",
    startDate: "01/09/2026",
    endDate: "31/10/2026",
    salary: 18000000,
    status: "ACTIVE",
    daysLeft: 26
  }
];

export default function ContractsPage() {
  const [contracts, setContracts] = useState<ContractItem[]>(initialContracts);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals state
  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((employees) => {
        if (Array.isArray(employees) && employees.length > 0) {
          const mapped: ContractItem[] = employees.map((emp: any, idx: number) => {
            const joinDateObj = new Date(emp.joinDate || Date.now());
            const joinYear = joinDateObj.getFullYear();
            const isIndefinite = idx % 3 === 0;
            const isExpiring = idx === 2 || idx === 7;
            const empCode = emp.employeeCode || `NX-${String(1000 + idx)}`;
            return {
              id: `ct_emp_${emp.id}`,
              code: `HĐLĐ-${joinYear}/${empCode}`,
              employeeName: emp.user?.name || "Cán bộ nhân viên",
              employeeCode: empCode,
              employeeEmail: emp.user?.email,
              department: emp.department?.name || "Văn phòng Tập đoàn",
              position: emp.position || "Chuyên viên",
              type: isIndefinite ? "Hợp đồng Không xác định thời hạn" : "Hợp đồng Xác định thời hạn 12 tháng",
              startDate: joinDateObj.toLocaleDateString("vi-VN"),
              endDate: isIndefinite ? "Không xác định" : "31/12/2026",
              salary: emp.salaryConfig?.baseSalary || 18000000 + (idx % 5) * 2000000,
              status: isExpiring ? "EXPIRING_SOON" : "ACTIVE",
              daysLeft: isExpiring ? 18 : undefined
            };
          });

          // Nạp các hợp đồng đã tạo thêm từ localStorage nếu có
          let customList: ContractItem[] = [];
          try {
            const savedCustom = localStorage.getItem("hrmis_custom_contracts");
            if (savedCustom) customList = JSON.parse(savedCustom);
          } catch (e) {
            console.error(e);
          }

          setContracts([...customList, ...mapped]);
        }
      })
      .catch((err) => console.error("Lỗi nạp hợp đồng nhân sự:", err));
  }, []);

  const handleContractCreated = (newC: ContractItem) => {
    const updated = [newC, ...contracts];
    setContracts(updated);
    try {
      const savedCustom = localStorage.getItem("hrmis_custom_contracts");
      const customList: ContractItem[] = savedCustom ? JSON.parse(savedCustom) : [];
      localStorage.setItem("hrmis_custom_contracts", JSON.stringify([newC, ...customList]));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredData = contracts.filter(c => {
    const matchSearch = c.employeeName.toLowerCase().includes(search.toLowerCase()) ||
                        c.code.toLowerCase().includes(search.toLowerCase()) ||
                        c.employeeCode.toLowerCase().includes(search.toLowerCase());
    const matchDept = selectedDept === "ALL" || c.department === selectedDept;
    const matchStatus = selectedStatus === "ALL" || c.status === selectedStatus;
    return matchSearch && matchDept && matchStatus;
  });

  const expiringList = contracts.filter(c => c.status === "EXPIRING_SOON");

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
  };

  const handleExportCSV = () => {
    const headers = [
      "Mã Hợp Đồng",
      "Mã Cán Bộ",
      "Họ Và Tên",
      "Đơn Vị / Phòng Ban",
      "Vị Trí Công Tác",
      "Loại Hợp Đồng",
      "Ngày Hiệu Lực",
      "Ngày Hết Hạn",
      "Mức Lương (VND)",
      "Trạng Thái"
    ];

    const rows = filteredData.map(c => [
      `"${c.code}"`,
      `"${c.employeeCode}"`,
      `"${c.employeeName.replace(/"/g, '""')}"`,
      `"${c.department.replace(/"/g, '""')}"`,
      `"${c.position.replace(/"/g, '""')}"`,
      `"${c.type}"`,
      `"${c.startDate}"`,
      `"${c.endDate}"`,
      c.salary,
      `"${c.status === 'EXPIRING_SOON' ? 'SẮP HẾT HẠN' : 'CÒN HIỆU LỰC'}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `So_Theo_Doi_HDLD_Nexustech_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="space-y-6 animate-swiss-in pb-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                Pháp Lý & Hợp Đồng Lao Động
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
              Quản Trị Hợp Đồng Lao Động
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Quản lý danh sách hợp đồng, theo dõi thời hạn và cảnh báo tự động trước 30 ngày
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs active:scale-95"
              title="Xuất danh sách ra CSV"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Xuất CSV</span>
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo hợp đồng</span>
            </button>
          </div>
        </div>

        {/* Compliance Alert Banner */}
        {expiringList.length > 0 && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                    Cảnh báo: Có {expiringList.length} hợp đồng lao động sẽ hết hạn trong 30 ngày tới
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    Bộ phận nhân sự cần gửi thông báo bằng văn bản để tiến hành tái ký hoặc thanh lý hợp đồng kịp thời.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {expiringList.map(c => (
                <div key={c.id} className="p-3 bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/40 rounded-lg flex items-center justify-between text-xs shadow-xs">
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">{c.employeeName}</div>
                    <div className="text-[11px] text-zinc-500">Hết hạn: {c.endDate} (Còn {c.daysLeft} ngày)</div>
                  </div>
                  <button 
                    onClick={() => setSelectedContract(c)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stat Bento Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-md border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">TỔNG SỐ HỢP ĐỒNG</span>
              <FileText className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100">{contracts.length} HĐLĐ</div>
            <div className="text-[11px] text-zinc-500 mt-1">Đang lưu trữ pháp lý</div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-md border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">VÔ THỜI HẠN (DÀI HẠN)</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {contracts.filter(c => c.type.includes("Không xác định")).length}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1 font-mono">Nhân sự gắn bó cốt lõi</div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-md border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">CÓ THỜI HẠN (1-3 NĂM)</span>
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
              {contracts.filter(c => c.type.includes("Xác định thời hạn")).length}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1 font-mono">Hợp đồng có kỳ hạn</div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-md border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">CẦN TÁI KÝ (≤ 30 NGÀY)</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400">
              {expiringList.length} HĐLĐ
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-semibold">Ưu tiên xử lý tuần này</div>
          </div>
        </div>

        {/* Filter and Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-zinc-50 dark:bg-zinc-900/40">
            <div className="relative w-full max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo số HĐ, tên cán bộ hoặc mã NX..."
                className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs focus:outline-none focus:border-zinc-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
              >
                <option value="ALL">Tất cả phòng ban</option>
                <option value="Khối Công Nghệ & Phần Mềm">Khối Công Nghệ & Phần Mềm</option>
                <option value="Khối Kinh Doanh & Tiếp Thị">Khối Kinh Doanh & Tiếp Thị</option>
                <option value="Khối Quản Trị Nhân Lực & Đào Tạo">Khối Quản Trị Nhân Lực & Đào Tạo</option>
                <option value="Khối R&D & Trí Tuệ Nhân Tạo">Khối R&D & Trí Tuệ Nhân Tạo</option>
                <option value="Khối Tài Chính & Kế Toán">Khối Tài Chính & Kế Toán</option>
                <option value="Khối Dịch Vụ Khách Hàng">Khối Dịch Vụ Khách Hàng</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Còn hiệu lực</option>
                <option value="EXPIRING_SOON">Sắp hết hạn (≤ 30 ngày)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-5 py-3 font-semibold">Số Hợp Đồng</th>
                  <th className="px-5 py-3 font-semibold">Cán bộ</th>
                  <th className="px-5 py-3 font-semibold">Loại hợp đồng</th>
                  <th className="px-5 py-3 font-semibold">Thời hạn hiệu lực</th>
                  <th className="px-5 py-3 font-semibold text-right">Lương thỏa thuận</th>
                  <th className="px-5 py-3 font-semibold text-center">Trạng thái</th>
                  <th className="px-5 py-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-zinc-500 font-mono text-xs">
                      Không có hợp đồng lao động nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((contract) => (
                    <tr 
                      key={contract.id}
                      onClick={() => setSelectedContract(contract)}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {contract.code}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">{contract.employeeName}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{contract.position} • {contract.department}</div>
                      </td>

                      <td className="px-5 py-3.5 text-zinc-700 dark:text-zinc-300">
                        {contract.type}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                        {contract.startDate} → {contract.endDate}
                      </td>

                      <td className="px-5 py-3.5 text-right font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {formatVND(contract.salary)}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        {contract.status === "EXPIRING_SOON" ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold">
                            <Clock className="w-3 h-3" /> CÒN {contract.daysLeft} NGÀY
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Có hiệu lực
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right text-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedContract(contract);
                          }}
                          className="px-2.5 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Xem hợp đồng
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

      {/* Modals */}
      <ContractDetailModal
        isOpen={Boolean(selectedContract)}
        onClose={() => setSelectedContract(null)}
        contract={selectedContract}
      />

      <CreateContractModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleContractCreated}
      />
    </>
  );
}
