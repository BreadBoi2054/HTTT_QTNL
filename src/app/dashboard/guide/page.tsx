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
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
            <BookOpen className="w-3.5 h-3.5" />
            Hồ Sơ Nghiệp Vụ • Kiến Trúc Vận Hành Hệ Thống
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
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
              Tuân thủ pháp luật lao động Việt Nam (khấu trừ bảo hiểm xã hội 10.5%, nghỉ phép năm có hưởng lương), bảo lưu chứng từ kế toán chống xóa nhầm và phân quyền bảo mật 4 lớp nghiêm ngặt.
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
              2. Hệ thống dành cho những ai dùng? (Ma trận 4 nhóm đối tượng)
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
          <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-600 text-white">
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
            <div className="pt-2 border-t border-purple-200/50 dark:border-purple-900/40 text-xs text-purple-700 dark:text-purple-300">
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
              Tất cả các phòng ban đều có <strong>Trưởng phòng phụ trách</strong> được gán trong Cơ cấu tổ chức. Tại trang Danh bạ nhân sự, hệ thống hiển thị nổi bật huy hiệu <strong>⭐ Trưởng phòng</strong> cho người đứng đầu đơn vị. Với nhân viên thông thường, hệ thống hiển thị rõ ràng thông tin: <em>"Trực thuộc Trưởng phòng: [Tên Trưởng phòng]"</em>, giúp cán bộ trong toàn cơ quan nhận diện cấu trúc phân cấp chỉ huy rõ ràng.
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

      {/* 4. CƠ CHẾ & THUẬT TOÁN TÍNH LƯƠNG CHI TIẾT */}
      <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              4. Cơ Chế & Thuật Toán Tính Lương Chi Tiết (Payroll Engine)
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-medium">Quy chuẩn tính lương & đãi ngộ</span>
        </div>

        {/* 1. Ngày công chuẩn & Công thức */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Quy tắc công chuẩn</span>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-sans">
              22 Ngày Công Chuẩn Cố Định / Tháng
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-xs">
              Quy chuẩn theo Bộ luật Lao động Việt Nam cho chế độ làm việc 5 ngày/tuần (Thứ 2 đến Thứ 6, nghỉ Thứ 7 và Chủ nhật). Số ngày tính lương là tổng ngày đi làm thực tế cộng dồn với các ngày nghỉ phép có hưởng lương (tối đa 22 công).
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Công thức thực lĩnh Net</span>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              Net = Lương CB theo công + Phụ cấp + Thưởng - BH (10.5%)
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-xs">
              Trong đó: <strong>Lương CB theo công = (Lương CB / 22) × Số ngày công tính lương</strong>. Các khoản trích nộp bắt buộc gồm: BHXH (8%), BHYT (1.5%), BHTN (1.0%) theo đúng luật hiện hành.
            </p>
          </div>
        </div>

        {/* 2. Quy tắc nghỉ 1-2 buổi */}
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

        {/* 3. Bảng minh họa số tiền cụ thể */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Ví dụ minh họa số tiền thực tế (Lương cơ bản thỏa thuận: 22.000.000 VNĐ / tháng, tương đương 1.000.000 VNĐ / ngày công):
          </div>

          <div className="overflow-x-auto text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-medium text-xs border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-2.5">Trường hợp nghỉ việc</th>
                  <th className="px-4 py-2.5 text-center">Ngày đi làm</th>
                  <th className="px-4 py-2.5 text-center">Công tính lương</th>
                  <th className="px-4 py-2.5 text-right font-mono">Lương CB nhận được</th>
                  <th className="px-4 py-2.5 text-right font-mono">Số tiền bị trừ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">Đi làm đủ tháng</td>
                  <td className="px-4 py-2.5 text-center">22 ngày</td>
                  <td className="px-4 py-2.5 text-center font-semibold">22 công</td>
                  <td className="px-4 py-2.5 text-right font-semibold font-mono text-emerald-600 dark:text-emerald-400">22.000.000 ₫</td>
                  <td className="px-4 py-2.5 text-right font-mono text-zinc-400">0 ₫</td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 font-medium text-emerald-600 dark:text-emerald-400">Nghỉ 1 ngày có phép (Phép năm)</td>
                  <td className="px-4 py-2.5 text-center">21 ngày</td>
                  <td className="px-4 py-2.5 text-center font-semibold">21 + 1 = 22 công</td>
                  <td className="px-4 py-2.5 text-right font-semibold font-mono text-emerald-600 dark:text-emerald-400">22.000.000 ₫</td>
                  <td className="px-4 py-2.5 text-right font-mono text-emerald-600 font-medium">0 ₫ (Hưởng đủ 100%)</td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 font-medium text-emerald-600 dark:text-emerald-400">Nghỉ 2 ngày có phép (Phép năm)</td>
                  <td className="px-4 py-2.5 text-center">20 ngày</td>
                  <td className="px-4 py-2.5 text-center font-semibold">20 + 2 = 22 công</td>
                  <td className="px-4 py-2.5 text-right font-semibold font-mono text-emerald-600 dark:text-emerald-400">22.000.000 ₫</td>
                  <td className="px-4 py-2.5 text-right font-mono text-emerald-600 font-medium">0 ₫ (Hưởng đủ 100%)</td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 font-medium text-amber-600 dark:text-amber-400">Nghỉ 1 ngày không phép / Không lương</td>
                  <td className="px-4 py-2.5 text-center">21 ngày</td>
                  <td className="px-4 py-2.5 text-center font-semibold">21 công</td>
                  <td className="px-4 py-2.5 text-right font-semibold font-mono text-zinc-900 dark:text-zinc-100">21.000.000 ₫</td>
                  <td className="px-4 py-2.5 text-right font-semibold font-mono text-red-600 dark:text-red-400">-1.000.000 ₫</td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-4 py-2.5 font-medium text-amber-600 dark:text-amber-400">Nghỉ 2 ngày không phép / Không lương</td>
                  <td className="px-4 py-2.5 text-center">20 ngày</td>
                  <td className="px-4 py-2.5 text-center font-semibold">20 công</td>
                  <td className="px-4 py-2.5 text-right font-semibold font-mono text-zinc-900 dark:text-zinc-100">20.000.000 ₫</td>
                  <td className="px-4 py-2.5 text-right font-semibold font-mono text-red-600 dark:text-red-400">-2.000.000 ₫</td>
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
                <td className="px-4 py-3.5 font-bold text-amber-700 dark:text-amber-400">⭐ Trưởng phòng IT</td>
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
                <td className="px-4 py-3.5 font-bold text-purple-700 dark:text-purple-400">⭐ Trưởng phòng Nhân sự</td>
                <td className="px-4 py-3.5 text-center">
                  <span className="px-3 py-1 rounded-full text-[11px] bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 font-semibold">
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
                <td className="px-4 py-3.5">Phòng Kinh doanh B2B</td>
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
                <td className="px-4 py-3.5">Phòng Marketing & Brand</td>
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
                <td className="px-4 py-3.5">Kỹ sư Frontend chính</td>
                <td className="px-4 py-3.5 text-center">
                  <span className="px-3 py-1 rounded-full text-[11px] bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 font-semibold font-mono">
                    USER
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
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
