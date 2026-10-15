"use client";

import { 
  BookOpen, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Clock, 
  Banknote, 
  ArrowLeftRight, 
  Award, 
  GraduationCap, 
  Network, 
  CheckCircle2, 
  ChevronRight,
  Crown,
  KeyRound,
  FileCheck,
  Building2,
  Workflow
} from "lucide-react";
import Link from "next/link";

export default function UserGuidePage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-swiss-in">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Hồ Sơ Nghiệp Vụ & Kiến Trúc Vận Hành HRMIS
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
          Tài liệu chuẩn hóa kiến trúc nghiệp vụ, phân quyền vai trò người dùng (RBAC), quy trình điều hành và chính sách nhân sự toàn diện.
        </p>
      </div>

      {/* 1. MỤC ĐÍCH & ĐỐI TƯỢNG PHỤC VỤ */}
      <section className="bento-card rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="squircle w-8 h-8 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Building2 className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            1. Hệ thống này làm cho ai? Hồ sơ Tập đoàn NEXUSTECH
          </h2>
        </div>

        {/* Corporate Profile Banner */}
        <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <span className="font-bold text-sm text-blue-950 dark:text-blue-100 tracking-tight">
              CÔNG TY CỔ PHẦN TẬP ĐOÀN CÔNG NGHỆ & GIẢI PHÁP SỐ NEXUSTECH (NEXUSTECH GROUP)
            </span>
            <span className="font-mono text-xs text-blue-700 dark:text-blue-300 font-semibold">
              MÃ DOANH NGHIỆP / MST: 0109867543
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-sans">
            <div><strong>Trụ sở chính:</strong> Tòa nhà Nexustech, 28 Phạm Hùng, Mỹ Đình, Nam Từ Liêm, Hà Nội.</div>
            <div><strong>Chi nhánh TP.HCM:</strong> Tòa nhà văn phòng Nexustech, Số 2 Hải Triều, Bến Nghé, Quận 1, TP.HCM.</div>
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300 pt-1">
            Tổng Giám Đốc (CEO): <strong>Ông Nguyễn Văn An</strong> • Quy mô nhân sự: 38 cán bộ nòng cốt thuộc 6 Khối phòng ban.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 space-y-2">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Tổ chức áp dụng
            </span>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Doanh nghiệp Công nghệ & Đổi mới sáng tạo</h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Hệ thống được thiết kế chuyên biệt cho <strong>Tập đoàn Công nghệ Nexustech</strong> cùng các doanh nghiệp vừa và lớn có cơ cấu tổ chức phân tầng, nhu cầu số hóa quy trình quản trị nguồn nhân lực khép kín từ khâu tuyển dụng đến bổ nhiệm, quy hoạch và quyết toán lương.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 space-y-2">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Mục tiêu & Giải pháp
            </span>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Hợp nhất Dữ liệu & Tự động hóa</h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Xóa bỏ hoàn toàn tình trạng chấm công thủ công, tính lương sai lệch qua Excel, phỏng vấn thất lạc CV và quy hoạch cán bộ thiếu minh bạch. Mọi thao tác đều liên thông dữ liệu tức thì.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 space-y-2">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Tiêu chuẩn tuân thủ
            </span>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Kiểm toán Audit Trail & RBAC</h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Tuân thủ pháp luật lao động Việt Nam (khấu trừ bảo hiểm xã hội 10.5%, nghỉ phép năm có hưởng lương), bảo lưu chứng từ kế toán chống xóa nhầm và phân quyền bảo mật 6 lớp RBAC nghiêm ngặt.
            </p>
          </div>
        </div>
      </section>

      {/* 2. MA TRẬN 4 VAI TRÒ NGƯỜI DÙNG (CHO NHỮNG AI DÙNG?) */}
      <section className="bento-card rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="squircle w-8 h-8 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              2. Hệ thống dành cho những ai dùng? (Ma trận 6 vai trò RBAC)
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-semibold font-mono">Ma trận phân quyền (RBAC)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Role 1: SYSTEM_ADMIN */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white">
                <Crown className="w-3.5 h-3.5" /> Quản trị viên (Admin)
              </span>
              <span className="text-xs text-zinc-500 font-medium">Ban Lãnh đạo Cấp cao</span>
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Tổng Giám Đốc (CEO), Thành viên HĐQT, Ban Quản trị Cấp cao
            </h3>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Hoạch định chiến lược toàn diện, xem toàn bộ bảng điều khiển Dashboard và biểu đồ phân tích.</li>
              <li>Thành lập phòng ban mới, tái cấu trúc tổ chức và <strong>bổ nhiệm Trưởng phòng ban</strong>.</li>
              <li>Phân quyền hệ thống, phê duyệt các quy hoạch kế nhiệm cán bộ chiến lược.</li>
              <li>Truy cập toàn quyền nhật ký kiểm toán hệ thống (Audit Trail) để giám sát an ninh.</li>
            </ul>
            <div className="pt-2 border-t border-blue-200/50 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300">
              Tài khoản mẫu: <strong>admin@nexustech.vn</strong> / Mật khẩu: <code className="font-mono">password123</code>
            </div>
          </div>

          {/* Role 2: MANAGER */}
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white">
                <Award className="w-3.5 h-3.5" /> Trưởng đơn vị (Manager)
              </span>
              <span className="text-xs text-zinc-500 font-medium">Trưởng phòng & Lãnh đạo Đơn vị</span>
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Trưởng phòng IT, Giám đốc Kinh doanh, Kế toán trưởng, Trưởng phòng Marketing...
            </h3>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Quản lý trực tiếp danh bạ và chức danh nhân sự trong phòng ban mình phụ trách.</li>
              <li><strong>Xét duyệt đơn xin nghỉ phép</strong> của nhân viên trực thuộc (tự động đồng bộ chấm công).</li>
              <li>Đề xuất quy hoạch cán bộ kế nhiệm, xây dựng ma trận 9-Box cho phòng ban.</li>
              <li>Được bảo vệ quyền hạn: Chỉ được tạo nhân viên quyền USER, không được tự cấp quyền Admin.</li>
            </ul>
            <div className="pt-2 border-t border-amber-200/50 dark:border-amber-900/40 text-xs text-amber-700 dark:text-amber-300">
              Tài khoản mẫu: <strong>manager@nexustech.vn</strong> (IT), <strong>nam.nguyen@nexustech.vn</strong> (Sales)
            </div>
          </div>

          {/* Role 3: HR */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white">
                <Briefcase className="w-3.5 h-3.5" /> Nhân sự & Đào tạo (HR)
              </span>
              <span className="text-xs text-zinc-500 font-medium">Chuyên viên Nhân sự & C&B</span>
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Trưởng phòng Nhân sự, Chuyên viên Tuyển dụng (TA), C&B, Đào tạo (L&D)
            </h3>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Đăng tin tuyển dụng trên trang công khai <code>/careers</code>; quản lý phễu Kanban ứng viên.</li>
              <li>Kích hoạt luồng <strong>Onboarding tự động</strong> cho ứng viên trúng tuyển.</li>
              <li>Quản trị thành phần lương động (Phụ cấp, Thưởng, Khấu trừ) và tính lương hàng tháng.</li>
              <li>Ban hành Quyết định biến động nhân sự (Thăng chức, Điều chuyển, Tiếp nhận, Thôi việc).</li>
              <li>Tổ chức các khóa đào tạo nội bộ và khởi tạo khảo sát đo lường chỉ số eNPS.</li>
            </ul>
            <div className="pt-2 border-t border-emerald-200/50 dark:border-emerald-900/40 text-xs text-emerald-700 dark:text-emerald-300">
              Tài khoản mẫu: <strong>hr@nexustech.vn</strong> / Mật khẩu: <code className="font-mono">password123</code>
            </div>
          </div>

          {/* Role 4: USER */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-950">
                <Users className="w-3.5 h-3.5" /> Nhân viên (Cổng tự phục vụ)
              </span>
              <span className="text-xs text-zinc-500 font-medium">Cán bộ Nhân viên Toàn công ty</span>
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Toàn thể Cán bộ, Kỹ sư, Chuyên viên, Nhân viên chính thức và thử việc
            </h3>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li><strong>Chấm công hàng ngày:</strong> Bấm Check-in khi vào ca và Check-out trước khi về.</li>
              <li><strong>Tạo đơn xin nghỉ phép:</strong> Chọn ngày, chọn loại phép (Nghỉ phép năm, Nghỉ ốm...).</li>
              <li><strong>Tra cứu phiếu lương cá nhân:</strong> Xem chi tiết ngày công, phụ cấp và các khoản khấu trừ.</li>
              <li>Tham gia bình chọn khảo sát văn hóa eNPS và đăng ký học các khóa kỹ năng chuyên môn.</li>
            </ul>
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
              Tài khoản mẫu: <strong>user@nexustech.vn</strong> / Mật khẩu: <code className="font-mono">password123</code>
            </div>
          </div>
        </div>
      </section>

      {/* 3. QUY TRÌNH NGHIỆP VỤ CHUẨN CỦA HỆ THỐNG */}
      <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Workflow className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            3. Bản đồ Quy trình Nghiệp vụ Chuẩn (Enterprise Workflows)
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          {/* Quy trình 1 */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/30">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">1</span>
              <span>Quy trình Tuyển dụng & Kích hoạt Onboarding Tự động</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 mb-3 leading-relaxed">
              HR tạo tin tuyển dụng trên hệ thống &rarr; Tin xuất hiện trên cổng công khai <code>/careers</code> &rarr; Ứng viên nộp hồ sơ &rarr; HR xem trên bảng Kanban 6 cột &rarr; Lên lịch phỏng vấn &rarr; Khi chuyển trạng thái ứng viên sang <strong>Đã tuyển dụng (Hired)</strong>, hệ thống tự động:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <strong className="text-blue-600 dark:text-blue-400 block mb-0.5 font-semibold">Bước A. Sinh tài khoản</strong>
                Tạo User & Hồ sơ nhân sự mới với mật khẩu mặc định (Hrmis@123).
              </div>
              <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <strong className="text-blue-600 dark:text-blue-400 block mb-0.5 font-semibold">Bước B. Ban hành quyết định</strong>
                Tự động sinh Quyết định tiếp nhận nhân sự mới (Mã QĐ-2026-xxx).
              </div>
              <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <strong className="text-blue-600 dark:text-blue-400 block mb-0.5 font-semibold">Bước C. Ghi vết kiểm toán</strong>
                Lưu vào Audit Trail đảm bảo tính minh bạch và bảo mật.
              </div>
            </div>
          </div>

          {/* Quy trình 2 */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/30">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">2</span>
              <span>Quy trình Chấm công & Tự động Tính trễ (08:30:00)</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Mỗi nhân viên đăng nhập tài khoản &rarr; Vào menu <strong>Chấm công</strong> &rarr; Bấm nút <strong>Check In</strong>. Hệ thống đối chiếu thời gian máy chủ: Nếu sau mốc <strong className="text-amber-600 dark:text-amber-400 font-mono">08:30:00 AM</strong>, trạng thái tự động phân loại là <code>Đi trễ (Late)</code>. Cuối ngày làm việc, bấm <strong>Check Out</strong> để hoàn thành ca. HR có thể xuất báo cáo CSV sẵn sàng tích hợp phần mềm kế toán.
            </p>
          </div>

          {/* Quy trình 3 */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/30">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">3</span>
              <span>Quy trình Nghỉ phép & Tự động Đồng bộ Điểm danh</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Nhân viên tạo đơn xin nghỉ phép (hoặc Lãnh đạo/HR tạo hộ bằng cách chọn nhân viên từ danh sách) &rarr; Trưởng phòng hoặc HR xem xét và bấm <strong>Phê duyệt (Approved)</strong> &rarr; Hệ thống lập tức quét toàn bộ các ngày làm việc trong khoảng thời gian nghỉ (tự động loại trừ ngày Chủ nhật) và tạo bản ghi chấm công trạng thái <code>Nghỉ phép</code>. Nhân viên vẫn được hưởng nguyên lương đối với nghỉ phép năm.
            </p>
          </div>

          {/* Quy trình 4 */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/30">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">4</span>
              <span>Quy trình Biến động Nhân sự & Chọn Nhân viên Từ Danh sách</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Khi thực hiện <strong>Thăng chức, Điều chuyển hoặc Thôi việc</strong>: Thay vì gõ tay họ tên và chức vụ, người phụ trách chỉ cần <strong>chọn nhân viên từ danh sách công ty</strong>. Hệ thống tự động truy xuất hồ sơ gốc, điền phòng ban và vị trí hiện tại. Khi quyết định được ban hành, hồ sơ nhân sự được tự động cập nhật ngay lập tức.
            </p>
          </div>

          {/* Quy trình 5 */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/30">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">5</span>
              <span>Quy trình Quản trị Lãnh đạo & Hiển thị Trưởng phòng Ban</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Tất cả các phòng ban đều có <strong>Trưởng phòng phụ trách</strong> được gán trong Cơ cấu tổ chức. Tại trang Danh bạ nhân sự, hệ thống hiển thị nổi bật huy hiệu <strong className="inline-flex items-center gap-1"><Award className="w-3.5 h-3.5 text-amber-500 inline" /> Trưởng phòng</strong> cho người đứng đầu đơn vị. Với nhân viên thông thường, hệ thống hiển thị rõ ràng thông tin: <em>"Trực thuộc Trưởng phòng: [Tên Trưởng phòng]"</em>, giúp cán bộ trong toàn cơ quan nhận diện cấu trúc phân cấp chỉ huy rõ ràng.
            </p>
          </div>

          {/* Quy trình 6: ESS Portal */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/30">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">6</span>
              <span>Cổng Tự Phục Vụ Nhân Viên (Employee Self-Service - ESS)</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Mỗi cán bộ nhân viên đều có <strong>Không gian làm việc số cá nhân (Khu vực của tôi)</strong>. Tại đây, nhân viên trực tiếp tra cứu: Thẻ căn cước nhân viên số, Quỹ ngày phép còn lại, Tỷ lệ đi làm và chấm công tháng này, Xếp loại KPI gần nhất, và Phiếu lương cá nhân. Hỗ trợ thao tác thuận tiện: Xin nghỉ phép nhanh và Giải trình bổ sung công.
            </p>
          </div>

          {/* Quy trình 7: Contracts */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/30">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">7</span>
              <span>Quản trị Vòng đời Hợp đồng Lao động & Cảnh báo Trước 30 Ngày</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Theo dõi toàn diện các loại hợp đồng: Thử việc (2 tháng), Xác định thời hạn (12-36 tháng) và Không xác định thời hạn. Hệ thống tự động kích hoạt <strong>Dải cảnh báo màu vàng cam</strong> đối với các hợp đồng sắp hết hạn trong vòng 30 ngày (tuân thủ Điều 20 Bộ luật Lao động 2019 thông báo trước ít nhất 15 ngày). Hỗ trợ xem mẫu hợp đồng lao động song phương chuẩn pháp lý và ký duyệt.
            </p>
          </div>

          {/* Quy trình 8: Performance KPI */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/30">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">8</span>
              <span>Đánh giá Hiệu suất 360° & Tự động Phân bổ Thưởng KPI</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Chuẩn hóa quy trình thẩm định 3 tiêu chí cốt lõi: Mục tiêu công việc chính (50%), Kỷ luật văn hóa doanh nghiệp (25%), và Sáng kiến đổi mới sáng tạo (25%). Tự động xếp hạng theo chuẩn Bell Curve (Hạng A: Xuất sắc, Hạng B: Tốt, Hạng C: Đạt, Hạng D: Cần cải thiện) và tự động đồng bộ hệ số thưởng KPI sang bảng tính lương hàng tháng.
            </p>
          </div>

          {/* Quy trình 9: Notification Hub */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/30">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">9</span>
              <span>Trung tâm Thông báo & Cảnh báo Điều hành Thời gian thực</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Tích hợp chuông thông báo thông minh trên thanh tiêu đề: Cảnh báo HĐLĐ sắp hết hạn, Thông báo mở đợt đánh giá KPI quý, Phiếu lương kỳ mới được duyệt chi, và cập nhật tình trạng phê duyệt đơn từ. Nhấp vào thông báo sẽ lập tức chuyển hướng tới phân hệ nghiệp vụ tương ứng.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CƠ CHẾ & THUẬT TOÁN TÍNH KPI, CHẤM CÔNG VÀ TÍNH LƯƠNG */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="squircle w-8 h-8 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Banknote className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              4. Cơ Chế Nghiệp Vụ: Đánh Giá KPI, Chấm Công & Bảng Tính Lương
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-semibold font-mono">Quy chuẩn vận hành HRMIS v3.2</span>
        </div>

        {/* 4.1 Thuật toán Đánh giá KPI & Phân bổ thưởng */}
        <div className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" /> Phân hệ 1: Thuật toán Đánh giá Hiệu suất & Xếp loại Bell Curve KPI
            </span>
            <span className="text-[11px] font-mono font-semibold text-zinc-500">Trọng số 50% - 25% - 25%</span>
          </div>

          <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-1">
            <p>
              Hệ thống áp dụng công thức tính điểm tổng hợp chuẩn hóa từ 3 nhóm tiêu chí:
            </p>
            <div className="p-2.5 bg-white dark:bg-zinc-800/80 rounded-lg border border-amber-200/60 dark:border-amber-800 font-mono text-xs font-semibold text-amber-900 dark:text-amber-200">
              Điểm KPI Tổng Hợp = (Mục tiêu công việc chính × 50%) + (Kỷ luật & Văn hóa × 25%) + (Sáng kiến đổi mới × 25%)
            </div>
          </div>

          {/* Bảng phân hạng KPI */}
          <div className="overflow-x-auto text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100/70 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-3 py-2">Xếp loại Bell Curve</th>
                  <th className="px-3 py-2 text-center">Khung điểm</th>
                  <th className="px-3 py-2 text-center">Tỷ lệ điều chỉnh</th>
                  <th className="px-3 py-2">Chính sách thưởng / phạt lương</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-3 py-2 font-bold text-emerald-600 dark:text-emerald-400">Hạng A (Xuất sắc)</td>
                  <td className="px-3 py-2 text-center font-mono font-semibold">90.0 - 100 điểm</td>
                  <td className="px-3 py-2 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">+25%</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">Cộng thưởng 25% Lương CB theo ngày công thực tế</td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-3 py-2 font-bold text-blue-600 dark:text-blue-400">Hạng B (Hoàn thành tốt)</td>
                  <td className="px-3 py-2 text-center font-mono font-semibold">75.0 - 89.9 điểm</td>
                  <td className="px-3 py-2 text-center font-mono font-bold text-blue-600 dark:text-blue-400">+10%</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">Cộng thưởng 10% Lương CB theo ngày công thực tế</td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-3 py-2 font-bold text-zinc-600 dark:text-zinc-400">Hạng C (Đạt yêu cầu)</td>
                  <td className="px-3 py-2 text-center font-mono font-semibold">60.0 - 74.9 điểm</td>
                  <td className="px-3 py-2 text-center font-mono font-semibold text-zinc-500">0%</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">Hưởng nguyên lương cơ bản theo ngày công, không thưởng</td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-3 py-2 font-bold text-rose-600 dark:text-rose-400">Hạng D (Cần cải thiện)</td>
                  <td className="px-3 py-2 text-center font-mono font-semibold">Dưới 60.0 điểm</td>
                  <td className="px-3 py-2 text-center font-mono font-bold text-rose-600 dark:text-rose-400">-10%</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">Khấu trừ phạt 10% Lương CB theo ngày công thực tế</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 4.2 Nghiệp vụ Chấm công & Ngày công chuẩn */}
        <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" /> Phân hệ 2: Cơ Chế Chấm Công & Xác Định Ngày Công Chuẩn (Timesheet)
            </span>
            <span className="text-[11px] font-mono font-semibold text-zinc-500">Chuẩn 22 ngày công / tháng</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-zinc-800/70 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Mốc giờ quy chuẩn vào ca:</span>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                Mốc giờ vào làm là <strong>08:30 sáng</strong>. Check-in đúng hoặc trước 08:30 ghi nhận Đúng giờ (<code>PRESENT</code>). Check-in sau 08:30 ghi nhận Đi muộn (<code>LATE</code>).
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-zinc-800/70 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Định mức 22 công chuẩn:</span>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                Chế độ làm việc 5 ngày/tuần (Thứ 2 đến Thứ 6). Số ngày tính lương: <code>effectiveDays = min(22, workedDays + paidLeaveDays)</code>.
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-zinc-800/70 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Loại trừ Thứ 7 & Chủ nhật:</span>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                Đơn xin nghỉ phép tự động loại trừ cả Thứ 7 và Chủ nhật, bảo toàn số ngày phép thực tế không bị tính dôi ngày cuối tuần.
              </p>
            </div>
          </div>
        </div>

        {/* 4.3 Công thức tính lương & Phụ cấp */}
        <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-emerald-600" /> Phân hệ 3: Thuật Toán Quyết Toán Lương Thực Lĩnh (Net Payroll)
            </span>
            <span className="text-[11px] font-mono font-semibold text-zinc-500">BHXH Bắt buộc 10.5%</span>
          </div>

          <div className="p-3 bg-white dark:bg-zinc-800/80 rounded-lg border border-emerald-200 dark:border-emerald-800 font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300">
            Lương Thực Lĩnh (Net) = max(0, Lương CB theo công + Phụ Cấp + Thưởng KPI - Bảo Hiểm Bắt Buộc (10.5%) - Thuế TNCN Lũy Tiến)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">3 Cấu phần Phụ cấp định mức:</span>
              <ul className="text-zinc-600 dark:text-zinc-400 list-disc list-inside space-y-0.5">
                <li><strong>Phụ cấp ăn trưa:</strong> 730.000 VNĐ / tháng (miễn thuế TNCN).</li>
                <li><strong>Phụ cấp xăng xe & liên lạc:</strong> 500.000 VNĐ / tháng.</li>
                <li><strong>Phụ cấp trách nhiệm:</strong> 2.000.000 VNĐ / tháng (Trưởng phòng, Giám đốc, Lead).</li>
              </ul>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Bảo hiểm bắt buộc (10.5% theo Luật BHXH):</span>
              <ul className="text-zinc-600 dark:text-zinc-400 list-disc list-inside space-y-0.5">
                <li>Bảo hiểm Xã hội (BHXH): 8.0% × Lương CB theo công.</li>
                <li>Bảo hiểm Y tế (BHYT): 1.5% × Lương CB theo công.</li>
                <li>Bảo hiểm Thất nghiệp (BHTN): 1.0% × Lương CB theo công.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 4.4 Quy tắc khi nghỉ 1-2 buổi */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Quy Tắc Tính Lương Khi Nghỉ 1 Hoặc 2 Buổi:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4" /> Kịch bản A: Nghỉ có phép (Được duyệt)
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Áp dụng cho <strong>Nghỉ phép năm</strong> hoặc <strong>Nghỉ ốm đau có bảo hiểm</strong> đã được Quản lý trực tiếp phê duyệt:
              </p>
              <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                Hưởng đủ 100% lương cơ bản (Không bị trừ lương)
              </div>
              <p className="text-[11px] text-zinc-500">
                Hệ thống tự động cộng dồn ngày phép vào công chuẩn (21 ngày đi làm + 1 ngày phép = 22 công đầy đủ).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300 text-xs">
                <span>Kịch bản B: Nghỉ không phép hoặc không lương</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Áp dụng cho trường hợp <strong>Vắng mặt tự do</strong> hoặc làm đơn <strong>Nghỉ không hưởng lương</strong>:
              </p>
              <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 font-semibold">
                Bị trừ lương theo đúng tỷ lệ công thực tế
              </div>
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside space-y-0.5">
                <li>Nghỉ 1 ngày: Nhận 21/22 lương CB (Bị trừ 1/22 ≈ 4.55% lương)</li>
                <li>Nghỉ 2 ngày: Nhận 20/22 lương CB (Bị trừ 2/22 ≈ 9.09% lương)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 4.5 Bảng minh họa số tiền cụ thể */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Ví dụ minh họa chi tiết quyết toán thu nhập thực tế (Trưởng phòng Lương CB: 22.000.000 VNĐ, Phụ cấp 3.230.000 VNĐ, Đạt KPI Hạng A +25%):
          </div>

          <div className="overflow-x-auto text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-medium text-xs border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-2.5">Khoản mục thu nhập / Giảm trừ</th>
                  <th className="px-4 py-2.5 text-center">Định mức / Tỷ lệ</th>
                  <th className="px-4 py-2.5 text-center">Số ngày áp dụng</th>
                  <th className="px-4 py-2.5 text-right font-mono">Thành tiền (VNĐ)</th>
                  <th className="px-4 py-2.5 text-right">Tính chất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 font-bold text-zinc-900 dark:text-zinc-100">Lương cơ bản theo ngày công</td>
                  <td className="px-4 py-2.5 text-center font-mono">1.000.000 ₫/công</td>
                  <td className="px-4 py-2.5 text-center font-semibold">22 công (21 làm + 1 phép)</td>
                  <td className="px-4 py-2.5 text-right font-semibold font-mono text-zinc-900 dark:text-zinc-100">22.000.000 ₫</td>
                  <td className="px-4 py-2.5 text-right text-zinc-500">Lương cơ bản hợp đồng</td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Phụ cấp ăn trưa</td>
                  <td className="px-4 py-2.5 text-center font-mono">Cố định</td>
                  <td className="px-4 py-2.5 text-center font-semibold">Trọn tháng</td>
                  <td className="px-4 py-2.5 text-right font-mono text-emerald-600 font-semibold">+730.000 ₫</td>
                  <td className="px-4 py-2.5 text-right text-zinc-500">Miễn thuế TNCN</td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Phụ cấp xăng xe & liên lạc</td>
                  <td className="px-4 py-2.5 text-center font-mono">Cố định</td>
                  <td className="px-4 py-2.5 text-center font-semibold">Trọn tháng</td>
                  <td className="px-4 py-2.5 text-right font-mono text-emerald-600 font-semibold">+500.000 ₫</td>
                  <td className="px-4 py-2.5 text-right text-zinc-500">Hỗ trợ công tác</td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Phụ cấp trách nhiệm chức vụ</td>
                  <td className="px-4 py-2.5 text-center font-mono">Quản lý</td>
                  <td className="px-4 py-2.5 text-center font-semibold">Trọn tháng</td>
                  <td className="px-4 py-2.5 text-right font-mono text-emerald-600 font-semibold">+2.000.000 ₫</td>
                  <td className="px-4 py-2.5 text-right text-zinc-500">Trưởng phòng / Lead</td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 font-bold text-amber-700 dark:text-amber-400">Thưởng hiệu suất KPI (Hạng A)</td>
                  <td className="px-4 py-2.5 text-center font-mono font-bold text-amber-600">+25% Lương CB</td>
                  <td className="px-4 py-2.5 text-center font-semibold">Kỳ Q4/2026</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-600">+5.500.000 ₫</td>
                  <td className="px-4 py-2.5 text-right text-amber-600 font-medium">Xuất sắc (94.5đ)</td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 font-medium text-zinc-600 dark:text-zinc-400">Bảo hiểm bắt buộc (BHXH, BHYT, BHTN)</td>
                  <td className="px-4 py-2.5 text-center font-mono">10.5%</td>
                  <td className="px-4 py-2.5 text-center font-semibold">Trừ vào lương</td>
                  <td className="px-4 py-2.5 text-right font-mono text-rose-600 font-semibold">-2.310.000 ₫</td>
                  <td className="px-4 py-2.5 text-right text-zinc-500">Luật BHXH Việt Nam</td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 font-medium text-zinc-600 dark:text-zinc-400">Thuế Thu nhập Cá nhân (Thuế TNCN)</td>
                  <td className="px-4 py-2.5 text-center font-mono">Lũy tiến</td>
                  <td className="px-4 py-2.5 text-center font-semibold">TNTT: 16.690.000 ₫</td>
                  <td className="px-4 py-2.5 text-right font-mono text-rose-600 font-semibold">-1.753.500 ₫</td>
                  <td className="px-4 py-2.5 text-right text-zinc-500">Giảm trừ gia cảnh 11tr</td>
                </tr>
                <tr className="bg-emerald-50/60 dark:bg-emerald-950/30 border-t-2 border-emerald-500">
                  <td className="px-4 py-3 font-extrabold text-sm text-emerald-900 dark:text-emerald-200 uppercase">Lương Thực Lĩnh Chuyển Khoản (Net)</td>
                  <td colSpan={2} className="px-4 py-3 text-center text-xs text-emerald-700 dark:text-emerald-300 font-semibold">Khóa sổ kế toán trạng thái [PAID]</td>
                  <td className="px-4 py-3 text-right font-mono font-extrabold text-base text-emerald-600 dark:text-emerald-400">26.666.500 ₫</td>
                  <td className="px-4 py-3 text-right text-xs text-emerald-700 dark:text-emerald-300 font-semibold">Thực nhận 100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. BẢNG TÀI KHOẢN TRẢI NGHIỆM */}
      <section className="bento-card rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="squircle w-8 h-8 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              5. Danh sách Tài khoản Kiểm thử Đầy đủ (Demo Credentials)
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-mono font-semibold">Mật khẩu chung: password123</span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-800/40 font-semibold text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 uppercase tracking-wider">
                <th className="px-4 py-3">Họ và tên</th>
                <th className="px-4 py-3">Email đăng nhập</th>
                <th className="px-4 py-3">Phòng ban</th>
                <th className="px-4 py-3">Chức vụ phụ trách</th>
                <th className="px-4 py-3 text-center">Vai trò (Role)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-zinc-100">Quản trị viên (Admin HQ)</td>
                <td className="px-4 py-3.5 font-mono text-blue-600 dark:text-blue-400 font-semibold">admin@nexustech.vn</td>
                <td className="px-4 py-3.5">Ban Tổng Giám Đốc (BOD)</td>
                <td className="px-4 py-3.5 font-medium">Tổng Giám Đốc (CEO)</td>
                <td className="px-4 py-3.5 text-center">
                  <span className="px-3 py-1 rounded-full text-[11px] bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 font-semibold">
                    SYSTEM_ADMIN
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-zinc-100">Lê Tuấn Anh</td>
                <td className="px-4 py-3.5 font-mono text-blue-600 dark:text-blue-400 font-semibold">manager@nexustech.vn</td>
                <td className="px-4 py-3.5">Phòng Công nghệ (IT)</td>
                <td className="px-4 py-3.5 font-bold text-amber-700 dark:text-amber-400">⭐ Giám đốc Kỹ thuật / IT Manager</td>
                <td className="px-4 py-3.5 text-center">
                  <span className="px-3 py-1 rounded-full text-[11px] bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 font-semibold">
                    MANAGER
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-zinc-100">Trần Thị Mai</td>
                <td className="px-4 py-3.5 font-mono text-blue-600 dark:text-blue-400 font-semibold">hr@nexustech.vn</td>
                <td className="px-4 py-3.5">Phòng Nhân sự & Đào tạo</td>
                <td className="px-4 py-3.5 font-bold text-emerald-700 dark:text-emerald-400">⭐ Trưởng phòng Nhân sự</td>
                <td className="px-4 py-3.5 text-center">
                  <span className="px-3 py-1 rounded-full text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 font-semibold">
                    HR
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-zinc-100">Đặng Thu Hòa</td>
                <td className="px-4 py-3.5 font-mono text-blue-600 dark:text-blue-400 font-semibold">hoa.dang@nexustech.vn</td>
                <td className="px-4 py-3.5">Phòng Tài chính - Kế toán</td>
                <td className="px-4 py-3.5 font-bold text-amber-700 dark:text-amber-400">⭐ Kế toán trưởng</td>
                <td className="px-4 py-3.5 text-center">
                  <span className="px-3 py-1 rounded-full text-[11px] bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 font-semibold">
                    MANAGER
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-zinc-100">Nguyễn Hoàng Nam</td>
                <td className="px-4 py-3.5 font-mono text-blue-600 dark:text-blue-400 font-semibold">nam.nguyen@nexustech.vn</td>
                <td className="px-4 py-3.5">Phòng Kinh doanh & PTTT</td>
                <td className="px-4 py-3.5 font-bold text-amber-700 dark:text-amber-400">⭐ Giám đốc Kinh doanh</td>
                <td className="px-4 py-3.5 text-center">
                  <span className="px-3 py-1 rounded-full text-[11px] bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 font-semibold">
                    MANAGER
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-zinc-100">Vũ Thu Trang</td>
                <td className="px-4 py-3.5 font-mono text-blue-600 dark:text-blue-400 font-semibold">trang.vu@nexustech.vn</td>
                <td className="px-4 py-3.5">Phòng Marketing & Truyền thông</td>
                <td className="px-4 py-3.5 font-bold text-amber-700 dark:text-amber-400">⭐ Trưởng phòng Marketing</td>
                <td className="px-4 py-3.5 text-center">
                  <span className="px-3 py-1 rounded-full text-[11px] bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 font-semibold">
                    MANAGER
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-zinc-100">Nguyễn Văn An</td>
                <td className="px-4 py-3.5 font-mono text-blue-600 dark:text-blue-400 font-semibold">user@nexustech.vn</td>
                <td className="px-4 py-3.5">Phòng Công nghệ (IT)</td>
                <td className="px-4 py-3.5">Senior Frontend Lead & Tech Lead</td>
                <td className="px-4 py-3.5 text-center">
                  <span className="px-3 py-1 rounded-full text-[11px] bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 font-semibold font-mono">
                    USER
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-zinc-100">Đỗ Kim Ngân</td>
                <td className="px-4 py-3.5 font-mono text-blue-600 dark:text-blue-400 font-semibold">ngan.do@nexustech.vn</td>
                <td className="px-4 py-3.5">Phòng Nhân sự & Đào tạo</td>
                <td className="px-4 py-3.5">Phó phòng Nhân sự & Đãi ngộ (C&B Lead)</td>
                <td className="px-4 py-3.5 text-center">
                  <span className="px-3 py-1 rounded-full text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 font-semibold">
                    HR
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-zinc-100">Dương Minh Đức</td>
                <td className="px-4 py-3.5 font-mono text-blue-600 dark:text-blue-400 font-semibold">duc.duong@nexustech.vn</td>
                <td className="px-4 py-3.5">Phòng Tài chính - Kế toán</td>
                <td className="px-4 py-3.5">Phó phòng Kế toán & Kiểm soát Chi phí</td>
                <td className="px-4 py-3.5 text-center">
                  <span className="px-3 py-1 rounded-full text-[11px] bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 font-semibold font-mono">
                    USER
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-zinc-100">Lê Quốc Bảo</td>
                <td className="px-4 py-3.5 font-mono text-blue-600 dark:text-blue-400 font-semibold">bao.le@nexustech.vn</td>
                <td className="px-4 py-3.5">Phòng Kinh doanh & PTTT</td>
                <td className="px-4 py-3.5">Phó Giám đốc Kinh doanh Miền Bắc</td>
                <td className="px-4 py-3.5 text-center">
                  <span className="px-3 py-1 rounded-full text-[11px] bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 font-semibold font-mono">
                    USER
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p>
            <strong>Lưu ý mật khẩu truy cập:</strong> Toàn bộ 38 tài khoản nhân sự mẫu có sẵn trong hệ thống sử dụng mật khẩu mặc định là <code className="font-mono font-bold bg-amber-100/60 dark:bg-amber-900/60 px-1 py-0.5 rounded">password123</code>. Đối với các nhân sự mới được tuyển dụng thông qua luồng Onboarding tự động (Kanban ATS), hệ thống sẽ khởi tạo mật khẩu mặc định là <code className="font-mono font-bold bg-amber-100/60 dark:bg-amber-900/60 px-1 py-0.5 rounded">Hrmis@123</code>.
          </p>
        </div>
      </section>

      {/* 6. CHUẨN HÓA CÁC NÚT TƯƠNG TÁC: LỘ TRÌNH, CHI TIẾT & VĂN BẢN */}
      <section className="bento-card rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="squircle w-8 h-8 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              6. Chuẩn Hóa Các Nút Tương Tác & Xuất Báo Cáo Tài Liệu
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-semibold font-mono">Modal & Văn bản chuẩn</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/30 space-y-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> Nút [LỘ TRÌNH CHI TIẾT] (Quy hoạch cán bộ)
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Hiển thị lộ trình 4 giai đoạn bồi dưỡng cán bộ nguồn kế nhiệm (Lãnh đạo OKR/KPI &rarr; Luân chuyển thực chiến &rarr; Đánh giá 360° &rarr; Chuyển giao bổ nhiệm). Hỗ trợ nút <strong>In Lộ trình / Xuất PDF</strong> trực tiếp.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/30 space-y-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Nút [CHI TIẾT KHÓA HỌC] & [KẾT QUẢ] (Đào tạo & Khảo sát)
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Mở giáo trình khung 4 tuần (Syllabus), thông tin giảng viên nội bộ, tỷ lệ hoàn thành và trích xuất học viên tiêu biểu. Phân tích chỉ số eNPS và 4 nhóm tiêu chí mức độ hài lòng của nhân viên.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/30 space-y-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> Nút [VĂN BẢN] (Biến động Nhân sự)
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Mở văn bản Quyết định Bổ nhiệm / Điều chuyển Cán bộ chính thức chuẩn thể thức văn bản hành chính Việt Nam (Quốc hiệu, Tiêu ngữ, Căn cứ pháp lý, Các điều khoản ban hành, Chữ ký số Tổng Giám Đốc).
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/30 space-y-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600" /> Nút [XUẤT BÁO CÁO] (Hợp đồng, Bảng công, Bảng lương)
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Cho phép xuất báo cáo ra định dạng CSV/Excel và in phiếu lương PDF bảo mật để lưu trữ hồ sơ kế toán và báo cáo cơ quan thanh tra lao động.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs">
        <div>
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Sẵn sàng trải nghiệm hệ thống?</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Khám phá các phân hệ chức năng tương ứng với quyền hạn của bạn.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/employees"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Hồ sơ nhân sự &rarr;
          </Link>
          <Link
            href="/dashboard/attendance"
            className="px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-lg text-xs font-medium transition-colors"
          >
            Chấm công & Điểm danh &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
