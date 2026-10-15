# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG QUẢN TRỊ NHÂN LỰC TOÀN DIỆN (HRMIS)
*Hệ thống Quản lý Nguồn nhân lực & Vận hành Doanh nghiệp - TẬP ĐOÀN CÔNG NGHỆ NEXUSTECH (NEXUSTECH GROUP)*

---

## I. GIỚI THIỆU TỔNG QUAN & ĐỐI TƯỢNG SỬ DỤNG

### 1. Ứng dụng này làm cho ai? (Hồ Sơ Doanh Nghiệp Cụ Thể)
Hệ thống **HRMIS Enterprise** được thiết kế và triển khai chuẩn hóa chuyên biệt cho:
- **Tên doanh nghiệp:** **CÔNG TY CỔ PHẦN TẬP ĐOÀN CÔNG NGHỆ & GIẢI PHÁP SỐ NEXUSTECH (NEXUSTECH GROUP)**
- **Mã số doanh nghiệp / MST:** `0109867543` (Do Sở Kế hoạch & Đầu tư TP. Hà Nội cấp)
- **Trụ sở chính:** Tòa nhà Nexustech Tower, Số 28 Phạm Hùng, Phường Mỹ Đình 2, Quận Nam Từ Liêm, TP. Hà Nội.
- **Chi nhánh Miền Nam:** Tầng 18, Bitexco Financial Tower, Số 2 Hải Triều, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh.
- **Lĩnh vực hoạt động:** Điện toán đám mây, Phần mềm Doanh nghiệp, Trí tuệ Nhân tạo (AI) và Chuyển đổi số toàn diện.
- **Tổng quy mô áp dụng:** 38 cán bộ nhân sự nòng cốt phân bổ đầy đủ trên 6 Khối phòng ban trọng yếu.

---

### 2. Những ai sử dụng ứng dụng này? (User Personas & Ma Trận RBAC)

Hệ thống thiết lập phân quyền dựa trên vai trò nghiêm ngặt (**Role-Based Access Control - RBAC**) với 4 nhóm người dùng chính:

| Nhóm người dùng (Persona) | Vai trò hệ thống | Trách nhiệm & Phạm vi sử dụng chính |
| :--- | :--- | :--- |
| **Ban Giám Đốc & Quản Trị Hệ Thống** | `SYSTEM_ADMIN` | • Toàn quyền kiểm soát hệ thống, phân quyền vai trò (Roles & Permissions).<br>• Xem toàn bộ Dashboard điều hành cấp cao, báo cáo tài chính/lương toàn tập đoàn.<br>• Phê duyệt quy hoạch cán bộ kế nhiệm cấp cao và giám sát nhật ký kiểm toán hệ thống. |
| **Trưởng Bộ Phận / Trưởng Phòng** | `MANAGER` | • Quản lý nhân sự trực thuộc trong phòng ban của mình.<br>• Duyệt/từ chối đơn xin nghỉ phép của nhân viên trực thuộc.<br>• Đề xuất điều chuyển, bổ nhiệm, luân chuyển nhân sự.<br>• Lập danh sách quy hoạch nhân tài kế nhiệm (Talent Pool) và đánh giá khảo sát đào tạo. |
| **Bộ Phận Nhân Sự (HR Team)** | `HR` | • Đăng tin tuyển dụng và quản lý luồng ứng viên (Kanban Pipeline).<br>• Khởi tạo hồ sơ nhân viên mới, hợp đồng, chức vụ, bộ phận.<br>• Quản trị bảng công, chấm công và chạy bảng lương hàng tháng (Payroll).<br>• Quản lý danh mục khóa đào tạo và theo dõi biến động nhân sự. |
| **Toàn Thể Cán Bộ Nhân Viên** | `USER` | • Thực hiện Check-in / Check-out chấm công hàng ngày tại Trạm điểm danh thông minh.<br>• Làm đơn xin nghỉ phép (nghỉ phép năm, thai sản, ốm đau) và theo dõi trạng thái duyệt.<br>• Tra cứu phiếu lương chi tiết cá nhân hàng tháng (bảo mật chỉ xem được của mình).<br>• Tham gia các khảo sát và khóa đào tạo nội bộ. |

---

## II. MA TRẬN TÀI KHOẢN TRẢI NGHIỆM (38 NHÂN SỰ - 6 PHÒNG BAN)

Hệ thống đã nạp sẵn cơ sở dữ liệu mẫu gồm **38 cán bộ nhân viên** phân bổ đầy đủ trên 6 phòng ban của Tập đoàn Nexustech, có chỉ định Trưởng phòng rõ ràng. Tất cả tài khoản mẫu ban đầu đều dùng mật khẩu mặc định: `password123`.

*(Lưu ý: Đối với nhân viên mới được tiếp nhận qua luồng Tuyển dụng Onboarding tự động, mật khẩu mặc định được hệ thống tự động sinh là `Hrmis@123`).*

### 1. Tài khoản Quản trị & Trưởng Bộ Phận (Key Roles)

| Họ và Tên | Chức vụ | Phòng ban | Email đăng nhập | Quyền (Role) |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin HQ)** | Tổng Giám Đốc (CEO) | Ban Tổng Giám Đốc (BOD) | `admin@hrmis.com` | `SYSTEM_ADMIN` |
| **Lê Tuấn Anh** | Giám đốc Kỹ thuật / IT Manager | Phòng Công nghệ (IT) | `manager@hrmis.com` | `MANAGER` |
| **Trần Thị Mai** | Trưởng phòng Nhân sự | Phòng Nhân sự & Đào tạo (HR) | `hr@hrmis.com` | `HR` |
| **Đặng Thu Hòa** | Kế toán trưởng | Phòng Tài chính - Kế toán | `hoa.dang@hrmis.com` | `MANAGER` |
| **Nguyễn Hoàng Nam** | Giám đốc Kinh doanh | Phòng Kinh doanh & Phát triển thị trường | `nam.nguyen@hrmis.com` | `MANAGER` |
| **Vũ Thu Trang** | Trưởng phòng Marketing | Phòng Marketing & Truyền thông | `trang.vu@hrmis.com` | `MANAGER` |
| **Nguyễn Văn An** | Senior Frontend Lead & Tech Lead | Phòng Công nghệ (IT) | `user@hrmis.com` | `USER` |

### 2. Danh sách phân bổ 38 nhân sự theo từng phòng ban
1. **Ban Tổng Giám Đốc (BOD - 4 nhân sự):**
   - `admin@hrmis.com` (Quản trị viên (Admin HQ) - Tổng Giám Đốc (CEO), Head of Dept, SYSTEM_ADMIN)
   - `trong.vu@hrmis.com` (Vũ Đình Trọng - Phó Tổng Giám Đốc Kỹ thuật & Hạ tầng (CTO), MANAGER)
   - `long.pham@hrmis.com` (Phạm Hoàng Long - Phó Tổng Giám Đốc Vận hành & Tài chính (COO), MANAGER)
   - `uyen.hoang@hrmis.com` (Hoàng Thu Uyên - Thư ký Hội đồng & Trợ lý Điều hành BOD, USER)
2. **Phòng Công nghệ (IT - 8 nhân sự):**
   - `manager@hrmis.com` (Lê Tuấn Anh - Giám đốc Kỹ thuật / IT Manager, Head of Dept, MANAGER)
   - `user@hrmis.com` (Nguyễn Văn An - Senior Frontend Lead & Tech Lead, USER)
   - `duy.nguyen@hrmis.com` (Nguyễn Hoàng Duy - Backend Architect, USER)
   - `linh.pham@hrmis.com` (Phạm Thùy Linh - UI/UX Product Designer & Design System Lead, USER)
   - `tuan.vu@hrmis.com` (Vũ Minh Tuấn - DevOps & Cloud Security Engineer, USER)
   - `my.tran@hrmis.com` (Trần Thảo My - Senior React/Next.js Engineer, USER)
   - `dung.do@hrmis.com` (Đỗ Hùng Dũng - Mobile Application Engineer, USER)
   - `hang.le@hrmis.com` (Lê Thúy Hằng - QA/QC & Automation Test Engineer, USER)
3. **Phòng Nhân sự & Đào tạo (HR - 6 nhân sự):**
   - `hr@hrmis.com` (Trần Thị Mai - Trưởng phòng Nhân sự, Head of Dept, HR)
   - `ngan.do@hrmis.com` (Đỗ Kim Ngân - Phó phòng Nhân sự & Đãi ngộ (C&B Lead), HR)
   - `phuong.nguyen@hrmis.com` (Nguyễn Bích Phương - Chuyên viên Tuyển dụng Cấp cao (Senior TA), HR)
   - `phuc.le@hrmis.com` (Lê Hoàng Phúc - Chuyên viên Đào tạo & Phát triển (L&D Specialist), USER)
   - `oanh.vu@hrmis.com` (Vũ Kiều Oanh - Chuyên viên Tiền lương & BHXH (C&B Officer), USER)
   - `anh.trinh@hrmis.com` (Trịnh Đức Anh - Chuyên viên Quan hệ Lao động & Văn hóa Doanh nghiệp, USER)
4. **Phòng Tài chính - Kế toán (Finance - 6 nhân sự):**
   - `hoa.dang@hrmis.com` (Đặng Thu Hòa - Kế toán trưởng, Head of Dept, MANAGER)
   - `duc.duong@hrmis.com` (Dương Minh Đức - Phó phòng Kế toán & Kiểm soát Chi phí, USER)
   - `quang.tran@hrmis.com` (Trần Nhật Quang - Chuyên viên Phân tích Tài chính Doanh nghiệp (FP&A), USER)
   - `thanh.bui@hrmis.com` (Bùi Ngọc Thanh - Kế toán viên Tổng hợp & Báo cáo Thuế, USER)
   - `huong.pham@hrmis.com` (Phạm Mai Hương - Kế toán Thanh toán & Giao dịch Ngân hàng, USER)
   - `chau.ngo@hrmis.com` (Ngô Bảo Châu - Thủ quỹ Doanh nghiệp & Quản lý Thu chi, USER)
5. **Phòng Kinh doanh & Phát triển thị trường (Sales - 8 nhân sự):**
   - `nam.nguyen@hrmis.com` (Nguyễn Hoàng Nam - Giám đốc Kinh doanh (Sales Director), Head of Dept, MANAGER)
   - `bao.le@hrmis.com` (Lê Quốc Bảo - Phó Giám đốc Kinh doanh Miền Bắc, USER)
   - `huong.dinh@hrmis.com` (Đinh Thị Lan Hương - Trưởng nhóm Khách hàng Doanh nghiệp (B2B Lead), USER)
   - `trong.tran@hrmis.com` (Trần Đình Trọng - Senior Account Executive (Enterprise SaaS), USER)
   - `ha.nguyen@hrmis.com` (Nguyễn Thu Hà - Key Account Manager (Khách hàng Chiến lược), USER)
   - `manh.chu@hrmis.com` (Chu Văn Mạnh - Chuyên viên Tư vấn Giải pháp Phần mềm, USER)
   - `linh.lai@hrmis.com` (Lại Mỹ Linh - Chuyên viên Phát triển Khách hàng Doanh nghiệp, USER)
   - `huy.dang@hrmis.com` (Đặng Quốc Huy - Chuyên viên Hỗ trợ Kinh doanh (Sales Admin & Contracts), USER)
6. **Phòng Marketing & Truyền thông (Marketing - 6 nhân sự):**
   - `trang.vu@hrmis.com` (Vũ Thu Trang - Trưởng phòng Marketing, Head of Dept, MANAGER)
   - `khoa.tran@hrmis.com` (Trần Đăng Khoa - Chuyên viên Chiến lược Thương hiệu & Digital, USER)
   - `yen.pham@hrmis.com` (Phạm Hải Yến - Chuyên viên Digital Marketing & SEO Lead, USER)
   - `thang.nguyen@hrmis.com` (Nguyễn Chiến Thắng - Content Marketing & Copywriter Lead, USER)
   - `ngoc.bui@hrmis.com` (Bùi Bích Ngọc - Chuyên viên Quản trị Sự kiện & Quan hệ Báo chí PR, USER)
   - `dat.le@hrmis.com` (Lê Thành Đạt - Chuyên viên Thiết kế Đồ họa & Đa phương tiện, USER)

---

## III. CHUẨN HÓA CÁC NÚT TƯƠNG TÁC: LỘ TRÌNH, CHI TIẾT & VĂN BẢN

Mọi nút bấm tương tác trên toàn hệ thống đều đã được kết nối với các Modal dữ liệu chi tiết, chuẩn xác và có khả năng xuất/in tài liệu:

### 1. Nút `[LỘ TRÌNH CHI TIẾT]` (Phân hệ Quy hoạch cán bộ - Cadre Planning)
- Khi bấm vào nút `[LỘ TRÌNH CHI TIẾT]`, hệ thống hiển thị **Lộ trình 4 giai đoạn bồi dưỡng cán bộ kế nhiệm**:
  - **Giai đoạn 1 (Tháng 1-6):** Nâng cao năng lực Lãnh đạo & Quản trị mục tiêu OKR/KPI (Hoàn thành 100%).
  - **Giai đoạn 2 (Tháng 7-12):** Luân chuyển thực chiến & Chủ trì dự án trọng điểm cấp Tập đoàn (Đang triển khai 75%).
  - **Giai đoạn 3 (Tháng 13-18):** Đánh giá năng lực 360 độ từ Ban Tổng Giám Đốc và đồng nghiệp.
  - **Giai đoạn 4 (Tháng 19-24):** Tiếp nhận chuyển giao toàn diện từ đương nhiệm và ban hành quyết định bổ nhiệm.
- Cung cấp tính năng **In Lộ trình / Xuất PDF**.

### 2. Nút `[CHI TIẾT KHÓA HỌC]` (Phân hệ Đào tạo & Khảo sát - Training)
- Khi bấm vào `[CHI TIẾT KHÓA HỌC]`, hệ thống mở giáo trình khung chi tiết 4 tuần đào tạo (Syllabus), thông tin giảng viên nội bộ, tỷ lệ hoàn thành và danh sách trích xuất học viên tiêu biểu kèm điểm số đánh giá.
- Nút **Tải Giáo trình / Slide PDF** hỗ trợ học viên truy cập tài liệu.

### 3. Nút `[KẾT QUẢ]` (Khảo sát ý kiến nhân viên - Surveys)
- Mở bản phân tích chi tiết mức độ hài lòng của nhân viên: Điểm trung bình (4.8/5.0), Chỉ số tín nhiệm eNPS (+78), phân tích 4 tiêu chí (Môi trường, Đãi ngộ, Lãnh đạo, Đào tạo) và ý kiến phản hồi ẩn danh tiêu biểu.

### 4. Nút `[CHI TIẾT]` (Hồ sơ Nhân sự - Employees)
- Hiển thị đầy đủ thông tin: Mã nhân viên Nexustech, CCCD, Lương cơ bản, Chế độ BHXH 10.5%, Phép năm còn lại, Phòng ban và Trực thuộc Trưởng phòng nào.

### 5. Nút `[VĂN BẢN]` (Biến động Nhân sự - Personnel Changes)
- Mở văn bản **Quyết định Bổ nhiệm / Điều chuyển Cán bộ chính thức** theo thể thức văn bản hành chính Việt Nam (Quốc hiệu, Tiêu ngữ, Căn cứ pháp lý, Các điều khoản ban hành, Chữ ký số Tổng Giám Đốc).

---

## IV. TÁI CẤU TRÚC BẢNG CHẤM CÔNG: TRẠM ĐIỂM DANH THÔNG MINH

### Đánh giá tính hợp lý của giao diện chấm công trước đây & Cải tiến:
* **Hạn chế trước đây:** Đặt 2 nút "Check In" và "Check Out" trần trụi ở góc màn hình mà không kiểm tra người dùng đã check-in hay chưa; không có xác thực địa điểm hay mạng nội bộ; quản lý và nhân viên dùng chung một giao diện khiến loãng mục đích giám sát.
* **Cải tiến chuyên nghiệp hiện tại:**
  1. **Tách biệt 2 chế độ thông minh:**
     - **Trạm Chấm Công Cá Nhân (Personal Terminal):** Nhân viên tự ghi nhận giờ làm.
     - **Bảng Giám Sát Toàn Doanh Nghiệp (Corporate Roster):** Dành cho Quản lý & HR theo dõi 38 nhân sự, lọc ngày, lọc trạng thái và xuất báo cáo.
  2. **Trạng thái nút bấm ngữ cảnh (Smart Contextual Action):**
     - Chưa Check-in: Nút `Check In Vào Ca` màu xanh sáng, nút `Check Out` bị khóa.
     - Đã Check-in: Hiển thị mốc giờ Check-in chính xác (VD: `08:24:12` - Đúng giờ), nút `Check In` chuyển sang `Đã Vào Ca`, nút `Check Out` kích hoạt cho phép kết thúc ngày làm.
     - Hoàn thành cả 2: Hiển thị `Hoàn thành ca làm việc (8.2 giờ)`.
  3. **Hệ thống xác thực bảo mật thực tế:**
     - 📍 **Định vị Geofencing:** Tòa nhà Nexustech Tower (Hà Nội), bán kính 28m hợp lệ.
     - 📶 **Xác thực Mạng Nội bộ:** Wi-Fi Nexustech-Corporate-5G (IP: 192.168.1.104 hợp lệ).
     - 🛡️ **Nhận diện Khuôn mặt:** AI Camera FaceID sẵn sàng xác thực.

---

## V. HỆ THỐNG PHÂN HỆ MỚI HOÀN THIỆN: ESS, HỢP ĐỒNG LAO ĐỘNG & ĐÁNH GIÁ KPI

### 1. Cổng Tự Phục Vụ Nhân Viên (Employee Self-Service - ESS)
* **Đường dẫn:** `/dashboard/my-workspace`
* **Mục tiêu:** Trao quyền tự quản trị cho từng cán bộ nhân viên mà không làm lộ dữ liệu của đồng nghiệp.
* **Tính năng:**
  - Thẻ định danh nhân viên số (Digital Badge) với mã `NX-XXXXX`, chức vụ, phòng ban và thâm niên cống hiến.
  - Theo dõi thời gian thực Quỹ ngày phép năm (còn lại 10.5/12 ngày), tỷ lệ chấm công đúng giờ tháng này (98.5%), xếp hạng KPI gần nhất và mức lương thực lĩnh.
  - Tác vụ 1-chạm: Xin nghỉ phép nhanh và Giải trình bổ sung công.
  - Tra cứu phiếu lương chi tiết cá nhân bí mật.

### 2. Quản Lý Vòng Đời Hợp Đồng Lao Động & Cảnh Báo Trước 30 Ngày
* **Đường dẫn:** `/dashboard/contracts`
* **Mục tiêu:** Kiểm soát pháp lý lao động, giảm thiểu rủi ro tranh chấp và tự động hóa tái ký hợp đồng.
* **Tính năng:**
  - Theo dõi 4 loại hợp đồng: Thử việc (2 tháng), Xác định thời hạn (12 tháng, 36 tháng) và Không xác định thời hạn.
  - **Dải cảnh báo khẩn cấp:** Tự động lọc và hiển thị các hợp đồng sắp hết hạn trong vòng 30 ngày (tuân thủ Điều 20 Bộ luật Lao động 2019 thông báo trước ít nhất 15 ngày).
  - Soạn thảo hợp đồng lao động song phương chuẩn pháp lý Việt Nam và hỗ trợ in/xuất PDF trực tiếp.
  - Xuất bảng theo dõi HĐLĐ toàn công ty ra file CSV/Excel.

### 3. Đánh Giá Hiệu Suất 360° & Thuật Toán Phân Bổ Thưởng/Phạt KPI
* **Đường dẫn phân hệ:** `/dashboard/performance`
* **Mục tiêu:** Thẩm định năng lực minh bạch, lượng hóa hiệu suất theo chuẩn mực OKR/KPI và tự động liên thông sang Bảng tính lương (Payroll Engine).
* **Bộ 3 Tiêu chí Thẩm định & Trọng số:**
  1. **Tiêu chí 1: Mục tiêu công việc chính (Trọng số 50% - $W_1 = 0.50$):** Đánh giá mức độ hoàn thành các chỉ tiêu OKR/KPI chuyên môn theo hợp đồng lao động và cam kết đầu kỳ.
  2. **Tiêu chí 2: Kỷ luật & Văn hóa doanh nghiệp (Trọng số 25% - $W_2 = 0.25$):** Đánh giá việc tuân thủ nội quy, thời gian làm việc (đúng giờ, hạn chế đi muộn `LATE`), tinh thần hợp tác và đóng góp cho tập thể.
  3. **Tiêu chí 3: Sáng kiến & Đổi mới sáng tạo (Trọng số 25% - $W_3 = 0.25$):** Đánh giá các ý tưởng cải tiến quy trình, tự động hóa tác vụ hoặc chủ trì các dự án nâng cao năng suất.
* **Công thức Tính Điểm Tổng Hợp (Total Score):**
  $$\text{Điểm Tổng} = (\text{Điểm TC1} \times 0.50) + (\text{Điểm TC2} \times 0.25) + (\text{Điểm TC3} \times 0.25)$$
* **Bảng Quy Chuẩn Xếp Hạng Bell Curve & Hệ Số Thưởng/Phạt:**

| Phân hạng KPI | Khoảng điểm tổng hợp | Tỷ lệ thưởng/phạt | Mức điều chỉnh lương | Diễn giải & Chế tài |
| :--- | :---: | :---: | :---: | :--- |
| **Hạng A (Xuất sắc)** | **90.0 - 100 điểm** | $\mathbf{+25\%}$ | $+25\%$ Lương CB theo công | Cán bộ hoàn thành vượt mức chỉ tiêu, được quy hoạch cán bộ kế nhiệm. |
| **Hạng B (Hoàn thành tốt)** | **75.0 - 89.9 điểm** | $\mathbf{+10\%}$ | $+10\%$ Lương CB theo công | Hoàn thành tốt khối lượng công việc được giao, tinh thần phối hợp tốt. |
| **Hạng C (Đạt yêu cầu)** | **60.0 - 74.9 điểm** | $\mathbf{0\%}$ | Không thưởng, không phạt | Đạt chuẩn cơ bản, cần bồi dưỡng thêm kỹ năng chuyên môn. |
| **Hạng D (Cần cải thiện)** | **Dưới 60.0 điểm** | $\mathbf{-10\%}$ | $-10\%$ Phạt vi phạm KPI | Không hoàn thành chỉ tiêu, vi phạm kỷ luật lao động, xem xét điều chuyển. |

* **Quy trình Phê duyệt 3 bước & Lưu vết CSDL:**
  - **Bước 1 (Tự đánh giá):** Nhân viên chủ động tự chấm điểm và giải trình kết quả công tác trong kỳ.
  - **Bước 2 (Quản lý thẩm định):** Trưởng phòng ban trực tiếp xem xét, đối soát dữ liệu và chấm điểm quản lý (`managerScore`).
  - **Bước 3 (Hội đồng nhân sự phê duyệt):** Chốt phân hạng Bell Curve, ghi nhận trạng thái `APPROVED` vào Model `PerformanceEvaluation` trong PostgreSQL và tự động đồng bộ sang bảng lương hàng tháng.

---

### 4. Trung Tâm Thông Báo & Cảnh Báo Thời Gian Thực (In-App Notification Hub)
* **Vị trí:** Biểu tượng chuông trên thanh Header.
* **Tính năng:**
  - Tự động phát hiện và cảnh báo: Hợp đồng lao động sắp hết hạn, mở kỳ đánh giá KPI quý, phiếu lương mới được phát hành, và đơn xin nghỉ phép được duyệt.
  - Badge đếm số lượng chưa đọc, hỗ trợ đánh dấu đã đọc và chuyển hướng 1-chạm tới module liên quan.

---

## VI. CƠ CHẾ & THUẬT TOÁN TÍNH LƯƠNG CHI TIẾT (PAYROLL MECHANISM)

### 1. Nguyên Tắc Ngày Công Chuẩn (Standard Working Days) & Chấm Công
* **Số ngày công chuẩn cố định:** `STANDARD_WORKING_DAYS = 22 ngày / tháng` (quy chuẩn theo Bộ luật Lao động cho chế độ làm việc từ Thứ 2 đến Thứ 6 hàng tuần, nghỉ Thứ 7 và Chủ nhật).
* **Mốc giờ chấm công chuẩn:** Giờ vào ca quy chuẩn là **08:30 sáng**. Check-in $\le$ 08:30 là Đúng giờ (`PRESENT`), sau 08:30 là Đi muộn (`LATE`).
* **Quy tắc ngày nghỉ tuần (Cuối tuần):** Đơn xin nghỉ phép tự động loại trừ cả Thứ 7 và Chủ nhật (`dayOfWeek !== 0 && dayOfWeek !== 6`).
* **Công thức ngày tính công thực tế:**
  $$\text{Số ngày tính lương (effectiveDays)} = \min(22, \text{Ngày đi làm thực tế} + \text{Ngày nghỉ phép hưởng lương})$$

---

### 2. Trả Lời: Khi Nghỉ 1 Hoặc 2 Buổi Thì Lương Tính Như Thế Nào?

Hệ thống phân định rạch ròi thành **2 kịch bản nghiệp vụ**:

#### 🟢 KỊCH BẢN A: Nghỉ CÓ PHÉP (Nghỉ phép năm `ANNUAL_LEAVE` hoặc Nghỉ ốm đau `SICK_LEAVE` được duyệt)
* **Nguyên tắc:** Nhân viên đã nộp đơn và được Trưởng bộ phận / HR bấm **Phê duyệt (APPROVED)**.
* **Cơ chế tính:** Số ngày nghỉ phép được cộng dồn vào `paidLeaveDays`.
  $$\text{Số ngày tính công} = 21 \text{ ngày đi làm} + 1 \text{ ngày phép} = 22 \text{ ngày công đầy đủ}$$
* **Kết quả:** Nhân viên **HƯỞNG ĐỦ 100% LƯƠNG CƠ BẢN**, không bị trừ tiền.

#### 🔴 KỊCH BẢN B: Nghỉ KHÔNG PHÉP (Vắng mặt `ABSENT`) hoặc Nghỉ KHÔNG HƯỞNG LƯƠNG (`UNPAID_LEAVE`)
* **Nguyên tắc:** Nhân viên tự ý nghỉ không xin phép hoặc làm đơn xin nghỉ việc riêng không hưởng lương.
* **Cơ chế trừ lương:** Lương cơ bản được tính theo tỷ lệ công thực tế (**Pro-rated Base Salary**):
  $$\text{Lương Cơ Bản Nhận Được} = \text{round}\left(\frac{\text{Lương Cơ Bản Thỏa Thuận}}{22} \times \text{Số ngày đi làm thực tế}\right)$$
* **Cách trừ cụ thể:**
  * **Nghỉ 1 buổi (1 ngày):** Đi làm 21 công $\rightarrow$ Lương CB nhận $\frac{21}{22} \times \text{Lương CB}$ (**Bị trừ $\frac{1}{22} \approx 4.545\%$** lương cơ bản).
  * **Nghỉ 2 buổi (2 ngày):** Đi làm 20 công $\rightarrow$ Lương CB nhận $\frac{20}{22} \times \text{Lương CB}$ (**Bị trừ $\frac{2}{22} \approx 9.09\%$** lương cơ bản).

---

### 3. Danh Mục Các Khoản Phụ Cấp Chuẩn Doanh Nghiệp (Salary Components)
Toàn bộ phụ cấp được cấu hình linh hoạt trong hệ thống và tự động cộng vào khoản thu nhập hàng tháng:
1. **Phụ cấp ăn trưa:** Cố định **730.000 VNĐ / tháng** (mức miễn thuế TNCN chuẩn theo quy định).
2. **Phụ cấp xăng xe & liên lạc:** Cố định **500.000 VNĐ / tháng** (hỗ trợ chi phí đi lại và cước viễn thông công tác).
3. **Phụ cấp trách nhiệm chức vụ:** Cố định **2.000.000 VNĐ / tháng** (áp dụng cho cấp Trưởng bộ phận, Giám đốc khối và Team Lead).

---

### 4. Công Thức Tổng Quát Tính Thực Lĩnh (Net Salary)
$$\text{Lương Thực Lĩnh (Net)} = \max\left(0, \text{Lương CB theo công} + \sum \text{Phụ Cấp} + \text{Thưởng KPI} - \sum \text{Bảo Hiểm (10.5\%)} - \text{Thuế TNCN}\right)$$

* **Khoản cộng (Gross Additions):**
  * **Lương cơ bản theo ngày công thực tế:** $\text{Pro-rated Base} = \text{round}\left(\frac{\text{Lương CB}}{22} \times \text{effectiveDays}\right)$.
  * **Tổng các khoản phụ cấp cố định:** Ăn trưa, xăng xe, trách nhiệm.
  * **Thưởng hiệu suất KPI:** $\text{Thưởng KPI} = \text{round}(\text{Lương CB theo công} \times \text{bonusRate})$ với Hạng A ($+25\%$), Hạng B ($+10\%$).
* **Khoản trừ nghĩa vụ pháp lý (10.5% theo Luật BHXH Việt Nam):**
  * Bảo hiểm Xã hội (BHXH): $8\% \times \text{Lương CB theo công}$
  * Bảo hiểm Y tế (BHYT): $1.5\% \times \text{Lương CB theo công}$
  * Bảo hiểm Thất nghiệp (BHTN): $1.0\% \times \text{Lương CB theo công}$
  * Khấu trừ vi phạm KPI (nếu xếp Hạng D: $-10\%$).
* **Thuế Thu nhập Cá nhân (kỳ tính thuế từ năm 2026 - Luật 109/2025/QH15):**
  * $\text{Thu nhập chịu thuế} = \text{Lương CB theo công} + \sum \text{Phụ Cấp} + \text{Thưởng KPI} - \text{Ăn trưa miễn thuế (730k)}$.
  * $\text{Thu nhập tính thuế (TNTT)} = \max(0, \text{Thu nhập chịu thuế} - \text{Bảo hiểm bắt buộc} - 15.5\text{ triệu} - 6.2\text{ triệu} \times \text{Số người phụ thuộc})$.
  * Biểu thuế tháng 5 bậc: đến 10 triệu 5%; trên 10–30 triệu 10% trừ 500 nghìn; trên 30–60 triệu 20% trừ 3.5 triệu; trên 60–100 triệu 30% trừ 9.5 triệu; trên 100 triệu 35% trừ 14.5 triệu.

---

### 5. Bảng Minh Họa Quyết Toán Lương Thực Tế Chi Tiết (Bao Gồm Thuế TNCN)

> **Giả định:** Nhân viên Nguyễn Văn An (Trưởng phòng, Lương CB hợp đồng: **22.000.000 VNĐ / tháng**, Phụ cấp ăn trưa: 730.000đ, Phụ cấp xăng xe: 500.000đ, Phụ cấp trách nhiệm: 2.000.000đ, Đánh giá KPI Hạng A (+25%), chưa đăng ký người phụ thuộc):
> - Tổng thu nhập chịu thuế: $22.000.000 + 500.000 + 2.000.000 + 5.500.000 = 30.000.000$ VNĐ (miễn thuế ăn trưa 730k).
> - Trừ BHXH 10.5%: $2.310.000$ VNĐ.
> - Trừ gia cảnh bản thân: $15.500.000$ VNĐ.
> - Thu nhập tính thuế (TNTT): $30.000.000 - 2.310.000 - 15.500.000 = 12.190.000$ VNĐ (Bậc 2: 10% - 500k).
> - Thuế TNCN khấu trừ: $12.190.000 \times 10\% - 500.000 = 719.000$ VNĐ.

| Khoản mục | Đơn giá / Tỷ lệ | Số ngày / Mức áp dụng | Thành tiền (VNĐ) | Phân loại |
| :--- | :---: | :---: | :---: | :--- |
| **Lương cơ bản theo công** | $1.000.000 \text{ đ/công}$ | 22 công (21 đi làm + 1 phép) | **22.000.000 VNĐ** | Thu nhập cơ bản |
| **Phụ cấp ăn trưa** | Cố định (Miễn thuế) | Cả tháng | **+730.000 VNĐ** | Phụ cấp đãi ngộ |
| **Phụ cấp xăng xe & liên lạc** | Cố định | Cả tháng | **+500.000 VNĐ** | Phụ cấp đãi ngộ |
| **Phụ cấp trách nhiệm** | Cấp quản lý | Cả tháng | **+2.000.000 VNĐ** | Phụ cấp chức vụ |
| **Thưởng hiệu suất KPI (Hạng A)** | $+25\%$ Lương CB | Hạng A (94.5 điểm) | **+5.500.000 VNĐ** | Thưởng hiệu suất |
| **Bảo hiểm Xã hội (BHXH 8%)** | $8\%$ | Trừ vào lương | **-1.760.000 VNĐ** | Giảm trừ pháp lý |
| **Bảo hiểm Y tế (BHYT 1.5%)** | $1.5\%$ | Trừ vào lương | **-330.000 VNĐ** | Giảm trừ pháp lý |
| **Bảo hiểm Thất nghiệp (BHTN 1%)** | $1.0\%$ | Trừ vào lương | **-220.000 VNĐ** | Giảm trừ pháp lý |
| **Thuế Thu nhập Cá nhân (TNCN)** | Lũy tiến từng phần | TNTT: 16.690.000 đ | **-1.753.500 VNĐ** | Nghĩa vụ thuế nhà nước |
| **TỔNG LƯƠNG THỰC LĨNH (NET)** | — | — | **26.666.500 VNĐ** | **Thực chuyển tài khoản** |

---

## VII. QUẢN LÝ QUỸ PHÉP NĂM & HỢP ĐỒNG LAO ĐỘNG (CHUẨN BLLĐ 2019)

### 1. Quỹ Phép Năm (Annual Leave Allowance - Điều 113 BLLĐ 2019)
- **Hạn mức chuẩn:** Mỗi nhân viên chính thức có **12 ngày phép hưởng nguyên lương / năm**.
- **Cơ chế kiểm soát tự động:** Khi nộp đơn `ANNUAL_LEAVE`, hệ thống tự động kiểm tra số ngày phép còn lại. Nếu đơn vượt quá số dư phép năm, hệ thống từ chối nộp và yêu cầu chuyển sang nghỉ không lương `UNPAID_LEAVE`.

### 2. Quản Trị Hợp Đồng Lao Động (Điều 20 BLLĐ 2019)
- **Cơ sở dữ liệu tập trung:** Toàn bộ hợp đồng được lưu trữ trong bảng `Contract` có liên kết quan hệ trực tiếp với `EmployeeProfile`.
- **Cảnh báo hết hạn:** Tự động tính toán số ngày còn lại (`daysLeft`) và gắn nhãn cảnh báo vàng `EXPIRING_SOON` khi còn $\le 30$ ngày để phòng Nhân sự tiến hành thủ tục tái ký hoặc thanh lý hợp đồng.

---
*Tài liệu được cập nhật tự động và đồng bộ trực tiếp với mã nguồn HRMIS Enterprise v3.2 - Tập đoàn Công nghệ Nexustech.*



