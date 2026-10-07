# Project Context: Hệ thống Thông tin Quản trị Nhân lực (HTTT QTNL)

## 1. Yêu cầu hệ thống
- Chuẩn Kiến trúc Doanh nghiệp (Enterprise Architecture).
- Hệ thống phân quyền chặt chẽ: System Admin, Manager, User thường, v.v.
- Tối ưu SEO (theo SEO Fundamentals).
- Yêu cầu bắt buộc: Luôn duy trì file `log.md` này để không mất context.

## 2. Kiến trúc đã chốt
- **Nền tảng**: Next.js (Web App quản trị nội bộ).
- **Cơ sở dữ liệu**: PostgreSQL (qua Docker Desktop) kết hợp Prisma ORM.
- **Phạm vi (Scope)**: Full tính năng (Quản lý hồ sơ, phòng ban, chấm công, tính lương, tuyển dụng, v.v.).

## 3. Trạng thái hiện tại
- Đã chốt Kế hoạch Triển khai Giai đoạn 1 (Authentication & Dashboard Layout).
- Đang tiến hành code và thiết kế UI/UX cao cấp (Premium UI) theo yêu cầu.

## 4. Nhật ký hoạt động (Changelog)
- **[2026-08-18]**: Bắt đầu Giai đoạn 1: Cài đặt Auth.js, xây dựng Login Page và Dashboard Layout chuẩn Premium. Giao diện được thiết kế độc bản, loại bỏ cảm giác "AI đại trà".
- **[2026-08-18]**: Khởi tạo thành công codebase (Next.js + Docker DB + Prisma schema), tạo file `todo.md`.
- **[2026-08-18]**: Người dùng xác nhận lựa chọn Next.js, PostgreSQL qua Docker, và phát triển Full tính năng.
- **[2026-08-18]**: Khởi tạo dự án, thiết lập `log.md` và tạo bản Kế hoạch triển khai (Implementation Plan) kèm theo Socratic questions để làm rõ yêu cầu hệ thống.
- **[2026-08-18]**: Tinh chỉnh UI/UX trang Tuyển dụng (Dashboard), tách thành 2 Tabs riêng biệt: Bảng Ứng viên (Kanban) và Danh sách Tin Tuyển dụng.
- **[2026-08-18]**: Nâng cấp bảo mật phân quyền Role Assignment: UI và Backend API chặn HR cấp quyền `SYSTEM_ADMIN` cho nhân viên mới.
- **[2026-08-18]**: Khắc phục lỗi xoá tin tuyển dụng liên quan đến cơ chế `await params` của Next.js 15+ API Dynamic Routes. Gỡ nút thao tác ở trang public `/careers`.
- **[2026-08-18]**: Hoàn thiện tích hợp Premium Dark Mode sử dụng Tailwind CSS v4. Cấu hình tự động chuyển đổi Theme bằng biến đổi class `.dark`. Hoàn tất Dark Mode trên toàn bộ các trang: Dashboard, Quản lý Nhân sự, Chấm công, Tính lương và Tuyển dụng (Kanban Board). Giao diện tối ưu độ tương phản, widget và biểu đồ tương thích sâu với Dark Mode.
- **[2026-09-29]**: Xử lý lỗi `Configuration` khi đăng nhập: Khắc phục xung đột cổng 5432 trên Windows (Hyper-V / WSL2 port exclusion range 5366-5565) bằng cách ánh xạ cổng sang `54321:5432` trong `docker-compose.yml` và `.env`; thêm `AUTH_SECRET`; bổ sung `dotenv/config` vào `seed.ts` và nạp thành công bộ 4 tài khoản hệ thống.
- **[2026-09-29]**: Thiết kế và tích hợp chuẩn hóa toàn bộ 8 phân hệ doanh nghiệp vào thanh điều hướng Sidebar và hệ thống trang quản trị:
  1. Cơ cấu tổ chức (nâng cấp sơ đồ cây Org Chart và danh sách phòng ban tại `/dashboard/departments`).
  2. Tuyển dụng (tích hợp Kanban & Job Management tại `/dashboard/recruitment`).
  3. Hồ sơ nhân sự (quản lý hồ sơ điện tử tại `/dashboard/employees`).
  4. Bảng chấm lương (tính lương, công chuẩn, phê duyệt tại `/dashboard/payroll`).
  5. Biến động nhân sự (theo dõi luân chuyển, bổ nhiệm, thôi việc tại `/dashboard/personnel-changes`).
  6. Đào tạo và khảo sát (khóa đào tạo & khảo sát eNPS tại `/dashboard/training-surveys`).
  7. Quy hoạch cán bộ (bản đồ kế nhiệm & ma trận 9-Box Grid tại `/dashboard/cadre-planning`).
  8. Quy trình và kiểm toán (luồng SOPs đa cấp & audit logs tại `/dashboard/audit-workflow`).
- **[2026-09-29]**: Tinh chỉnh giao diện Sidebar theo yêu cầu: Bỏ toàn bộ các nhãn "Mới" khỏi các phân hệ để giao diện đồng bộ, thanh lịch và chuyên nghiệp.
- **[2026-09-29]**: Nâng cấp hệ thống lên tiệm cận 100/100 (Full-Stack Data Integration & Unified Theme):
  1. Thống nhất toàn bộ Theme giao diện sang chuẩn Corporate Slate / Neutral: Loại bỏ hoàn toàn các dải màu mè (gradient sặc sỡ, banner xanh đỏ tím vàng); đồng bộ hóa kích thước bo góc (`rounded-2xl`), đường viền (`border-slate-200/80 dark:border-slate-800`), nút thao tác đồng nhất, thẻ thống kê trung tính và bố cục bảng biểu chuẩn xác.
  2. Bổ sung 5 Model Prisma vào CSDL PostgreSQL: `PersonnelChange`, `TrainingCourse`, `Survey`, `SuccessionPlan`, `AuditLog`.
  3. Xây dựng 4 REST API routes đầy đủ bảo mật Session & RBAC: `/api/personnel-changes`, `/api/training-surveys`, `/api/cadre-planning`, `/api/audit-workflow`.
  4. Đã chạy đồng bộ CSDL (`prisma db push`), sinh client (`prisma generate`) và nạp dữ liệu mẫu vào database.
- **[2026-09-29]**: Bổ sung và nạp đầy đủ dữ liệu mẫu doanh nghiệp chuẩn (Enterprise Seed Dataset) qua `seed.ts`:
  1. Tăng quy mô từ 4 lên 18 nhân sự đầy đủ chức danh, email, mã nhân viên (EMP001 đến EMP018) trải đều 6 phòng ban (Ban Điều hành BOD, Phòng Công nghệ Thông tin, Phòng Nhân sự & Đào tạo, Phòng Tài chính Kế toán, Phòng Kinh doanh, Phòng Marketing).
  2. Nạp dữ liệu chấm công 5 ngày gần nhất cho toàn bộ 18 nhân sự.
  3. Nạp 6 đơn nghỉ phép với các trạng thái khác nhau (Đã duyệt, Đang chờ duyệt, Từ chối).
  4. Nạp bảng lương thực tế cho 2 tháng (Tháng 8 & Tháng 9/2026) cho toàn bộ nhân sự.
  5. Nạp 4 tin tuyển dụng với 6 ứng viên trên Kanban (Ứng tuyển, Phỏng vấn, Đề nghị việc, Đã tuyển) và các lịch phỏng vấn.
  6. Nạp đầy đủ dữ liệu cho các phân hệ mới: 5 bản ghi Biến động nhân sự, 4 Khóa đào tạo, 3 Khảo sát eNPS, 4 Kế hoạch quy hoạch cán bộ kế nhiệm, 5 Nhật ký kiểm toán hệ thống.
- **[2026-09-29]**: Xây dựng hoàn chỉnh tài liệu Báo cáo Bài tập lớn kết thúc học phần định dạng Word (.docx) chuẩn mực học thuật:
  1. Tên tài liệu: `Bao_Cao_Bai_Tap_Lon_HTTT_Quan_Tri_Nhan_Luc.docx` (Dung lượng: 7.09 MB, Độ dài: 19.094 từ, 487 đoạn văn, 29 bảng biểu, 40 hình ảnh sơ đồ kỹ thuật).
  2. Kế thừa chuẩn mực khung cấu trúc, thể thức văn bản hành chính (Nghị định 30/2020/NĐ-CP, căn lề Trái 3cm, Trên/Dưới/Phải 2cm, font Times New Roman, line spacing 1.25) từ file mẫu Texas Chicken.
  3. Chuyển dịch toàn diện nội dung sang Hệ thống Thông tin Quản trị Nhân lực (HTTT QTNL / HRMIS) của doanh nghiệp HTTT Corporation bám sát 100% codebase thực tế (Next.js 16, Prisma ORM, PostgreSQL Docker, Auth.js RBAC).
  4. Tạo mới 37 sơ đồ UML và kiến trúc hệ thống 3 tầng đạt chuẩn độ phân giải cao 300 DPI: Sơ đồ tổ chức, Actor Hierarchy, 11 biểu đồ Use Case, 8 biểu đồ Sequence, 7 biểu đồ Activity, 4 biểu đồ State Machine, Package Diagram, Class Diagrams, Physical ERD 3NF và 3-Tier Enterprise Architecture.
  5. Đầy đủ các phần: Trang bìa, Lời cảm ơn, Lời cam đoan, Mục lục, Danh mục từ viết tắt, Danh mục bảng biểu, Danh mục sơ đồ hình ảnh, Phần Mở đầu, Chương 1, Chương 2, Chương 3 và Tài liệu tham khảo.
- **[2026-10-07]**: Quét toàn diện, khắc phục triệt để các lỗi vận hành (Runtime) và logic nghiệp vụ (Domain Logic) trên toàn bộ hệ thống:
  1. **Khắc phục lỗi sập API Duyệt đơn nghỉ phép (`PUT /api/leave/[id]`)**: Fix lỗi `ReferenceError: status is not defined` do chưa trích xuất `status` từ request body; bổ sung ràng buộc quản lý (`MANAGER`) chỉ được duyệt nhân sự thuộc phòng mình và không được tự duyệt đơn của bản thân.
  2. **Khắc phục lỗi tính trùng ngày công & ngày nghỉ trong công thức tính lương (`calculateMonthlyPayroll`)**: Phân tách rõ ràng ngày đi làm thực tế (`PRESENT`, `LATE`) và ngày nghỉ phép có lương (`LEAVE`), xử lý trừ Chủ nhật chuẩn luật lao động, loại trừ nguy cơ cộng dồn lặp ngày công, mở rộng phạm vi `endDate` đến hết 23:59:59 của ngày cuối tháng.
  3. **Chuẩn hóa lệch múi giờ chấm công (`toUtcDateOnly`)**: Khắc phục lỗi lệch ngày (-1 ngày) khi lưu trường `@db.Date` trong PostgreSQL tại múi giờ Việt Nam (UTC+7), đồng bộ hóa kiểm tra điểm danh giữa `processCheckIn`, `processCheckOut` và `Dashboard` tổng quan.
  4. **Bảo toàn toàn vẹn dữ liệu (Foreign Key integrity)**:
     - Xóa/Thôi việc nhân sự (`deleteEmployee`): Tự động giải phóng vị trí Trưởng phòng (`Department.managerId = null`) và hủy các phân công phỏng vấn liên quan trước khi xóa tài khoản, triệt tiêu lỗi sập Foreign Key Constraint.
     - Xóa phòng ban (`deleteDepartment`): Chặn xóa nếu phòng ban đang có nhân sự trực thuộc với thông báo hướng dẫn rõ ràng thay vì văng lỗi 500.
     - Bảo vệ vai trò cốt lõi (`deleteRole`): Chặn xóa các vai trò gốc `SYSTEM_ADMIN`, `MANAGER`, `HR`, `USER` và vai trò đang có tài khoản sử dụng.
     - Biến động nhân sự (`personnel-changes`): Tự động giải phóng vị trí Trưởng phòng cũ khi nhân sự thôi việc hoặc chuyển công tác sang phòng ban khác.
  5. **Hoàn thiện kết nối phân quyền & Cổng cá nhân (ESS)**:
     - Bổ sung vai trò `MANAGER` vào phân hệ Bảng chấm lương trên thanh Sidebar.
     - Mở quyền xem hồ sơ ứng viên tuyển dụng cho Trưởng bộ phận (`MANAGER`) đối với các tin tuyển dụng của phòng mình.
     - Kết nối chức năng gửi đơn nghỉ phép nhanh từ Cổng không gian số cá nhân (`/dashboard/my-workspace`) trực tiếp vào cơ sở dữ liệu (`POST /api/leave`).
     - Tối ưu hóa phản hồi lỗi và thông báo trạng thái tại các trang Thành phần lương, Biến động nhân sự và Phòng ban.
  6. **Kiểm thử tự động thành công 100%**:
     - `npx tsc --noEmit` hoàn toàn không còn lỗi (Exit code 0).
     - `npm run build` biên dịch thành công toàn bộ 41 routes tĩnh và động trên Next.js 16 (Turbopack).
     - Suite kiểm thử tự động `scratch/test_domain_fixes.ts` đạt kết quả 10/10 bài test PASSED (toàn bộ 10 kịch bản vận hành & nghiệp vụ)
- **[2026-10-07 (Đợt 2 - Tổng duyệt & Fix đồng loạt toàn diện)]**: Thực hiện chiến dịch tổng rà soát toàn bộ hệ thống (Toàn bộ 6 Services, 14 API routes, 12 Giao diện Dashboard, Database Constraints, RBAC và Edge Cases) và khắc phục đồng loạt 100% các vấn đề:
  1. **Khắc phục lỗi vi phạm Unique constraint khi bổ nhiệm Trưởng phòng (`Department.managerId`)**: Tự động giải phóng vị trí Trưởng phòng cũ ở các phòng ban khác khi tạo mới (`createDepartment`) hoặc cập nhật (`updateDepartment`), đồng thời đồng bộ chuyển `departmentId` của Trưởng phòng về đúng phòng ban phụ trách.
  2. **Hoàn thiện vòng đời Quản lý Thành phần lương (`SalaryComponent`)**: Xây dựng mới API route `/api/payroll/components/[id]` hỗ trợ `PUT` và `DELETE` có cơ chế phòng vệ (chặn xóa nếu khoản mục đang được gán cho nhân viên), bổ sung nút Thao tác xóa trực tiếp trên giao diện `/dashboard/payroll/components`.
  3. **Mở quyền xem Tin tuyển dụng nội bộ cho Quản lý (`MANAGER`)**: Cập nhật `GET /api/recruitment/jobs` cho phép Trưởng phòng truy cập để nắm bắt kế hoạch tuyển dụng nhân sự.
  4. **Phân cấp nghiệp vụ Đánh giá Ứng viên tuyển dụng**: Cho phép Trưởng phòng (`MANAGER`) chuyển trạng thái sơ loại (`REVIEWING`), phỏng vấn (`INTERVIEWING`) hoặc loại hồ sơ (`REJECTED`) đối với ứng viên nộp vào phòng ban mình; khóa quyền gửi Offer (`OFFERED`) và Tuyển dụng chính thức (`HIRED`) chỉ dành riêng cho Admin và HR.
  5. **Chuẩn hóa truy vấn chấm công an toàn tuyệt đối**: Khắc phục triệt để nguy cơ lệch giờ khi parse query param `date` trong `/api/attendance` bằng cách khởi tạo `Date.UTC(y, m-1, d)`.
  6. **Bảo vệ Lương thực lĩnh không âm (`netSalary >= 0`)**: Đảm bảo toàn bộ công thức tính lương nháp, cập nhật lương và tính lương tự động hàng tháng luôn trả về thực lĩnh tối thiểu 0 VNĐ theo chuẩn mực kế toán.
  7. **Tối ưu hóa Form làm đơn nghỉ phép (`LeaveModal`)**: Ẩn dropdown chọn nhân viên đối với tài khoản nhân viên thường (`USER`), tự động nhận diện người làm đơn qua session; chỉ mở dropdown chọn nhân viên khi Admin/HR làm đơn thay.
  8. **Kiểm thử tự động mở rộng tuyệt đối 13/13 Test Suites PASSED**: Toàn bộ hệ thống vượt qua 13 kịch bản kiểm thử tích hợp và biên dịch Next.js 16 Production Build thành công 41/41 routes.

- **[2026-10-07 (Nâng cấp UI/UX Toàn Diện theo chuẩn `ui-ux-pro-max`)]**: Triển khai thiết kế lại giao diện hệ thống theo phong cách **Bento Box Grid + Dimensional Layering + Soft UI Glassmorphism**:
  1. **Nâng cấp Hệ thống Thiết kế (Design Tokens & CSS Utilities)**:
     - Bổ sung class `.bento-card` với border hairline, bóng mờ đa tầng 3D (elevation depth) và hiệu ứng nâng card (`translateY(-1px)`).
     - Bổ sung class `.glass-card` với hiệu ứng kính mờ `backdrop-filter: blur(12px)`.
     - Chuẩn hóa hệ thống biểu tượng squircle `.squircle` với dải màu pastel mềm mại, hover scale mượt mà.
  2. **Tái thiết kế Bảng điều khiển trung tâm (`DashboardPage`)**:
     - **Dynamic Hero Greeting Banner**: Lời chào cá nhân hóa theo buổi (Sáng/Chiều/Tối), hiển thị ngày tháng tự động, vai trò người dùng và thanh Quick Actions (Chấm công nhanh, Nộp đơn phép, Cổng cá nhân).
     - **4 Thẻ Bento KPI Metrics**: Bố cục trực quan với icon squircle màu semantic (Tổng nhân sự - Xanh lam, Có mặt - Xanh ngọc, Tuyển dụng - Tím, Tỷ lệ chuyên cần - Hổ phách) kèm link điều hướng nhanh.
     - **Biểu đồ Cột Phân bố Nhân sự (Bar Chart)**: Tích hợp dải màu SVG LinearGradient (`#2563EB` -> `#60A5FA`), bo góc cột `radius={[6, 6, 0, 0]}`, Custom Tooltip kính mờ nền tối viền phát sáng.
     - **Biểu đồ Tròn Chuyên Cần (Donut Chart)**: Tích hợp **Center Metric** (chỉ số 100% Có mặt ở giữa tâm vòng tròn) kèm 3 khối badge pastel tóm tắt số liệu (Đúng giờ, Đi muộn, Vắng/Nghỉ).
     - **Bento Tile Lối tắt phân hệ**: 4 khối lối tắt dẫn trực tiếp đến Cơ cấu tổ chức, Bảng lương, Hiệu suất KPI và Hợp đồng pháp lý.
     - **Bento Tile Ứng viên mới ứng tuyển**: Hiển thị avatar chữ cái gradient màu pastel, pulse status dot và nhãn trạng thái trực quan.
  3. **Đồng bộ hóa Sidebar & Header Bar**:
     - **Sidebar**: Logo thương hiệu `NEXUSTECH` dạng squircle phát sáng (`glow-blue`), thẻ Active dạng gradient pill viền trái sắc nét, icon micro-interactions zoom khi hover, badge màu sắc theo phân hệ.
     - **Header**: Thanh tìm kiếm thông minh phong cách Command Palette (`⌘K`), badge số lượng thông báo chuông, profile monogram avatar gradient với nhãn phân quyền màu sắc, nút toggle Dark Mode sang trọng.
  4. **Kiểm thử trực quan & Tự động hoàn tất 100%**:
     - Kiểm tra bằng `browser_subagent` chụp ảnh màn hình thực tế trên trình duyệt Chromium (`dashboard_bento_view.png` & `dashboard_bottom_view.png`).
     - `npx tsc --noEmit` đạt Exit code 0 (0 lỗi type).
     - `npm run build` Next.js 16 biên dịch thành công 41/41 routes.
- **[2026-10-07 (Đồng bộ hóa UI/UX toàn bộ dự án)]**: Đồng bộ hóa toàn diện ngôn ngữ thiết kế **Bento Box Grid + Soft UI Glassmorphism + Squircle Icons + Swiss Typography** trên 100% các trang và phân hệ:
  1. **Đăng nhập (`/login`)**: Bento Box Card 3D, ambient glow ánh xanh, hiển thị đầy đủ 4 nút chọn tài khoản demo chuẩn domain `@nexustech.vn`.
  2. **Cổng cá nhân (`/dashboard/my-workspace`)**: Employee Dossier Banner phong cách Executive, 4 Bento Metric Tiles, Tabs switcher pill, form gửi đơn nghỉ phép trực tiếp.
  3. **Chấm công số (`/dashboard/attendance`)**: Đồng hồ số Digital Clock thời gian thực, 4 Bento tiles tỷ lệ chuyên cần, thanh toolbar lọc và bảng dữ liệu chuyên nghiệp.
  4. **Nghỉ phép (`/dashboard/leave`)**: Header chuẩn Enterprise, 3 Bento Metric Tiles (Tổng đơn, Chờ duyệt, Đã duyệt), bảng danh sách đơn nghỉ phép phân cấp quản lý.
  5. **Hồ sơ nhân sự (`/dashboard/employees`)**: Executive Leadership Bento Card, bảo vệ tài khoản gốc `SYSTEM_ADMIN` & `admin@nexustech.vn`, thanh công cụ tìm kiếm và lọc vai trò/phòng ban.
  6. **Cơ cấu tổ chức (`/dashboard/departments`)**: Level 1 Board of Directors (BOD) Bento Card, Level 2 Department Grid Cards và danh sách phòng ban chi tiết.
  7. **Bảng tính lương (`/dashboard/payroll`)**: Banner vai trò nghiệp vụ (HR vs Manager), Bento stats lương thưởng, bảng lương đa cột với định dạng tiền tệ Việt Nam.
  8. **Hợp đồng lao động (`/dashboard/contracts`)**: Compliance Alert Banner cảnh báo hợp đồng sắp hết hạn, bảng dữ liệu hợp đồng pháp lý chuẩn hóa.
  9. **Hiệu suất & KPI (`/dashboard/performance`)**: 4 Thẻ KPI Bento, bảng đánh giá mục tiêu OKRs & xếp loại nhân sự.
  10. **Biến động nhân sự (`/dashboard/personnel-changes`)**: 4 Bento Tiles chỉ số thuyên chuyển/bổ nhiệm, bảng quyết định nhân sự và modal ban hành quyết định.
  11. **Tuyển dụng (`/dashboard/recruitment`)**: Phễu Kanban 6 cột trạng thái ứng viên với squircle status badges, xem CV và chuyển trạng thái tức thì.
  12. **Đào tạo & Khảo sát (`/dashboard/training-surveys`)**: Segmented Control Tabs, 4 Bento KPI tiles, card khóa học bo góc cao cấp và bảng khảo sát eNPS bảo mật ẩn danh.
  13. **Quy hoạch cán bộ (`/dashboard/cadre-planning`)**: Lộ trình kế nhiệm dự nguồn, ma trận đánh giá năng lực 9-Box Grid phong cách Bento hiện đại.
  14. **Quy trình & Kiểm toán (`/dashboard/audit-workflow`)**: Luồng phê duyệt SOPs đa cấp và bảng nhật ký kiểm toán hệ thống (Audit Trail) hỗ trợ xuất CSV.
  15. **Vai trò & Phân quyền (`/dashboard/roles`)**: Danh mục vai trò RBAC, bảng ma trận phân quyền với squircle icons và nhãn Quản trị gốc.
  16. **Cài đặt hệ thống (`/dashboard/settings`)**: Theme Switcher 3 chế độ (Sáng/Tối/Hệ điều hành) dạng Bento Card cao cấp, cập nhật hồ sơ quản trị viên `@nexustech.vn`.
  17. **Sổ tay nghiệp vụ (`/dashboard/guide`)**: Hồ sơ doanh nghiệp Tập đoàn Nexustech, ma trận 4 vai trò RBAC và bảng tài khoản kiểm thử `@nexustech.vn`.
  18. **Cổng tuyển dụng công khai (`/careers` & `/careers/[id]`)**: Hero Header phong cách Enterprise, các vị trí mở dạng Bento Card và form nộp CV ứng tuyển trực tuyến.
  19. **Kiểm tra chất lượng toàn diện**:
      - `npx tsc --noEmit` đạt Exit code 0 (100% không còn bất kỳ lỗi TypeScript nào).
      - `npm run build` thành công xuất sắc toàn bộ 41 routes tĩnh và động trên Next.js 16 (Turbopack).
- **[2026-10-07 (Thanh lọc AI-Slop & Nâng cấp Chuẩn mực Enterprise SaaS B2B)]**: Áp dụng quy chuẩn thiết kế sản phẩm số thực chiến (Anti-Slop / Taste-Skill & UI-UX Pro Max Enterprise Profile) cho toàn bộ hệ thống HTTT Quản trị Nguồn lực (HRMIS):
  1. **Tẩy rửa Triệt để "AI-Slop Tells"**:
     - Loại bỏ các dải gradient tím/xanh phát sáng rực rỡ (`glow-blue`, đốm mờ blur-3xl, icon lấp lánh `Sparkles`).
     - Xóa bỏ toàn bộ emoji điện thoại (`⭐`, `🛡️`, `🚀`, `💻`, `📖`, `📍`, `🏢`) -> Thay bằng vector icon đơn sắc của `Lucide` với nét 1.5 thanh mảnh.
     - Thay thế 100% các ký tự em-dash (`—`) dư thừa bằng dấu nối chuẩn mực (`-`).
     - Đưa văn phong từ các câu khẩu hiệu AI sáo rỗng về chuẩn mực thực tế doanh nghiệp Việt Nam (Bộ Luật Lao Động 2019, BHXH bắt buộc 10.5%, công chuẩn 22 ngày, Mã số thuế 0108992341).
  2. **Tối ưu Bàn điều hành Trung tâm (`/dashboard`)**:
     - Thay thế khối banner to 200px bằng **Thanh Header Tác nghiệp (Operational Action Header)** cao 55px (Breadcrumb `Hệ thống / Bàn điều hành trung tâm`, kỳ làm việc `Tháng 10/2026`, toolbar hành động nhanh: Chấm công, Duyệt đơn, Cổng cá nhân).
     - Tiết kiệm 150px chiều cao màn hình, đưa toàn bộ dữ liệu biểu đồ và chỉ số lên ngay tầm mắt người dùng (above-the-fold).
     - Tinh chỉnh 4 thẻ KPI số liệu gọn gàng, tăng mật độ thông tin (Data Density).
  3. **Nâng cấp Cổng Tuyển dụng Công khai (`/careers`)**:
     - Thiết kế lại Header tuyển dụng chuyên nghiệp với thông tin doanh nghiệp, trụ sở Hà Nội & TP.HCM.
     - Dải đãi ngộ 4 huy hiệu với vector icons: Lương thưởng 13-15 tháng, BHXH/BHYT/BHTN theo luật, Lộ trình cán bộ kế nhiệm, Trợ cấp thiết bị & đào tạo.
     - Thẻ tin tuyển dụng bo góc `rounded-xl` thanh lịch, hiển thị rõ thời hạn ứng tuyển và phòng ban.
  4. **Nâng cấp Khung sườn & Xác thực (`Sidebar`, `Header`, `Login`)**:
     - Sidebar: Logo NEXUSTECH • Quản trị Nguồn nhân lực, huy hiệu trạng thái `Hệ thống trực tuyến • HRMIS 2026`, menu active dạng pill tinh gọn.
     - Header: Bỏ Sparkles, chuẩn hóa trung tâm thông báo tác nghiệp.
     - Login: Giao diện xác thực thanh lịch, bỏ các đốm neon blur, làm nổi bật các tính năng bảo mật doanh nghiệp (Audit Trail, 4 lớp RBAC, SSL).
  5. **Kiểm thử & Đảm bảo Chất lượng**:
     - `npx tsc --noEmit` đạt Exit code 0 (0 errors).
     - `npm run build` Next.js 16 (Turbopack) biên dịch thành công 41/41 routes trong 2.7s.
     - Kiểm tra thực tế bằng `browser_subagent` chụp ảnh màn hình xác nhận giao diện sạch bóng AI-slop (`dashboard_page_1791336941587.png`, `careers_page_1791336953291.png`, `login_page_1791336968678.png`).
