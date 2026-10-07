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

Hệ thống đã nạp sẵn cơ sở dữ liệu mẫu gồm **38 cán bộ nhân viên** phân bổ đầy đủ trên 6 phòng ban của Tập đoàn Nexustech, có chỉ định Trưởng phòng rõ ràng. Tất cả tài khoản đều dùng mật khẩu mặc định: `password123`.

### 1. Tài khoản Quản trị & Trưởng Bộ Phận (Key Roles)

| Họ và Tên | Chức vụ | Phòng ban | Email đăng nhập | Quyền (Role) |
| :--- | :--- | :--- | :--- | :--- |
| **Nguyễn Văn An** | Tổng Giám Đốc (CEO) | Ban Giám Đốc (BOD) | `admin@hrmis.com` | `SYSTEM_ADMIN` |
| **Trần Thị Mai** | Trưởng phòng Nhân sự | Phòng Quản Trị Nhân Sự | `hr@hrmis.com` | `HR` / `MANAGER` |
| **Phạm Hoàng Nam** | Trưởng phòng Kỹ thuật | Phòng Công Nghệ Thông Tin | `nam.pham@hrmis.com` | `MANAGER` |
| **Bùi Phương Thảo** | Trưởng phòng Tài chính | Phòng Kế Toán & Tài Chính | `thao.bui@hrmis.com` | `MANAGER` |
| **Nguyễn Văn Phát** | Trưởng phòng Kinh doanh | Phòng Kinh Doanh & Bán Hàng | `phat.nguyen@hrmis.com` | `MANAGER` |
| **Hoàng Minh Tú** | Trưởng phòng Tiếp thị | Phòng Marketing & Truyền Thông | `tu.hoang@hrmis.com` | `MANAGER` |
| **Trần Văn Bình** | Chuyên viên Phát triển (Senior) | Phòng Công Nghệ Thông Tin | `user@hrmis.com` | `USER` |

### 2. Danh sách phân bổ nhân viên theo từng phòng ban
1. **Ban Giám Đốc (BOD - 4 nhân sự):**
   - `admin@hrmis.com` (Nguyễn Văn An - Tổng Giám Đốc, Head of Dept)
   - `phuong.le@hrmis.com` (Lê Minh Phương - Phó Tổng Giám Đốc Vận Hành)
   - `hung.do@hrmis.com` (Đỗ Quang Hùng - Giám Đốc Tài Chính CFO)
   - `nga.trinh@hrmis.com` (Trịnh Thúy Nga - Thư Ký Hội Đồng Quản Trị)
2. **Phòng Công Nghệ Thông Tin (IT - 8 nhân sự):**
   - `nam.pham@hrmis.com` (Phạm Hoàng Nam - Trưởng phòng CNTT, Head of Dept)
   - `user@hrmis.com` (Trần Văn Bình - Kỹ sư Lập trình Senior)
   - `anh.hoang@hrmis.com` (Hoàng Quốc Anh - Kỹ sư DevOps)
   - `linh.dang@hrmis.com` (Đặng Thùy Linh - Kỹ sư Kiểm thử QA)
   - `khoa.vu@hrmis.com` (Vũ Đăng Khoa - Kỹ sư Lập trình Fullstack)
   - `tram.doan@hrmis.com` (Đoàn Ngọc Trâm - Chuyên viên Thiết kế UI/UX)
   - `long.ha@hrmis.com` (Hà Đức Long - Kỹ sư Dữ liệu Data Engineer)
   - `quyen.phan@hrmis.com` (Phan Thảo Quyên - Chuyên viên Phân tích Nghiệp vụ BA)
3. **Phòng Quản Trị Nhân Sự (HR - 6 nhân sự):**
   - `hr@hrmis.com` (Trần Thị Mai - Trưởng phòng Nhân sự, Head of Dept)
   - `tuan.vu@hrmis.com` (Vũ Anh Tuấn - Chuyên viên Tiền lương C&B)
   - `ngoc.dinh@hrmis.com` (Đinh Bảo Ngọc - Chuyên viên Tuyển dụng Talent Acquisition)
   - `son.mac@hrmis.com` (Mạc Văn Sơn - Chuyên viên Đào tạo & Phát triển L&D)
   - `chi.duong@hrmis.com` (Dương Kim Chi - Chuyên viên Quan hệ Lao động)
   - `uyen.ha@hrmis.com` (Hà Phương Uyên - Chuyên viên Văn hóa Doanh nghiệp)
4. **Phòng Kế Toán & Tài Chính (Finance - 6 nhân sự):**
   - `thao.bui@hrmis.com` (Bùi Phương Thảo - Trưởng phòng Kế toán, Head of Dept)
   - `loc.nguyen@hrmis.com` (Nguyễn Tấn Lộc - Kế toán Tổng hợp)
   - `nhung.dao@hrmis.com` (Đào Hồng Nhung - Kế toán Thuế & Kiểm toán)
   - `khang.to@hrmis.com` (Tô Vĩnh Khang - Chuyên viên Phân tích Tài chính)
   - `lien.tran@hrmis.com` (Trần Bích Liên - Thủ quỹ Doanh nghiệp)
   - `triet.vo@hrmis.com` (Võ Minh Triết - Kế toán Công nợ)
5. **Phòng Kinh Doanh & Bán Hàng (Sales - 8 nhân sự):**
   - `phat.nguyen@hrmis.com` (Nguyễn Văn Phát - Trưởng phòng Kinh doanh, Head of Dept)
   - `hang.le@hrmis.com` (Lê Thu Hằng - Quản lý Khách hàng Doanh nghiệp Key Account)
   - `thanh.lam@hrmis.com` (Lâm Quốc Thành - Chuyên viên Bán hàng Cấp cao)
   - `yen.phung@hrmis.com` (Phùng Hải Yến - Chuyên viên Phát triển Thị trường)
   - `dat.nguyen@hrmis.com` (Nguyễn Tiến Đạt - Đại diện Kinh doanh Vùng)
   - `van.chu@hrmis.com` (Chu Khánh Vân - Tư vấn Bán hàng Giải pháp)
   - `huy.luu@hrmis.com` (Lưu Gia Huy - Chăm sóc Khách hàng VIP)
   - `my.truong@hrmis.com` (Trương Diễm My - Quản lý Hợp đồng Thương mại)
6. **Phòng Marketing & Truyền Thông (Marketing - 6 nhân sự):**
   - `tu.hoang@hrmis.com` (Hoàng Minh Tú - Trưởng phòng Marketing, Head of Dept)
   - `giang.nguyen@hrmis.com` (Nguyễn Hương Giang - Chuyên viên Truyền thông Nội bộ)
   - `bach.tran@hrmis.com` (Trần Xuân Bách - Chuyên viên Digital Marketing)
   - `thao.do@hrmis.com` (Đỗ Thu Thảo - Nhà sáng tạo Nội dung Content Lead)
   - `tuan.pham@hrmis.com` (Phạm Quốc Tuấn - Thiết kế Đồ họa Visual Designer)
   - `chau.ly@hrmis.com` (Lý Minh Châu - Chuyên viên Quản lý Sự kiện & PR)

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

### 3. Đánh Giá Hiệu Suất 360° & Tự Động Phân Bổ Thưởng KPI
* **Đường dẫn:** `/dashboard/performance`
* **Mục tiêu:** Thẩm định năng lực minh bạch, loại bỏ định kiến cá nhân và liên thông trực tiếp với hệ số thưởng lương.
* **Tính năng:**
  - 3 nhóm tiêu chí chuẩn: Mục tiêu công việc chính (50%), Kỷ luật văn hóa tập đoàn (25%), Sáng kiến đổi mới sáng tạo (25%).
  - Quy trình đánh giá: Nhân viên tự chấm điểm &rarr; Quản lý trực tiếp thẩm định & cho điểm &rarr; Hội đồng Nhân sự phê duyệt xếp hạng Bell Curve (Hạng A, B, C, D).
  - Tự động gắn hệ số thưởng: Hạng A (+25% Lương CB), Hạng B (+10% Lương CB), Hạng C (0%), Hạng D (Trừ KPI).
  - Xuất bảng kết quả đánh giá KPI toàn tập đoàn ra CSV/Excel.

### 4. Trung Tâm Thông Báo & Cảnh Báo Thời Gian Thực (In-App Notification Hub)
* **Vị trí:** Biểu tượng chuông trên thanh Header.
* **Tính năng:**
  - Tự động phát hiện và cảnh báo: Hợp đồng lao động sắp hết hạn, mở kỳ đánh giá KPI quý, phiếu lương mới được phát hành, và đơn xin nghỉ phép được duyệt.
  - Badge đếm số lượng chưa đọc, hỗ trợ đánh dấu đã đọc và chuyển hướng 1-chạm tới module liên quan.

---

## VI. CƠ CHẾ & THUẬT TOÁN TÍNH LƯƠNG CHI TIẾT (PAYROLL MECHANISM)

### 1. Nguyên Tắc Ngày Công Chuẩn (Standard Working Days)
* **Số ngày công chuẩn cố định:** `STANDARD_WORKING_DAYS = 22 ngày / tháng` (quy chuẩn theo Bộ luật Lao động cho chế độ làm việc từ Thứ 2 đến Thứ 6 hàng tuần, nghỉ Thứ 7 và Chủ nhật).
* **Ngày tính công thực tế:**
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
  $$\text{Lương Cơ Bản Nhận Được} = \frac{\text{Lương Cơ Bản Thỏa Thuận}}{22} \times \text{Số ngày đi làm thực tế}$$
* **Cách trừ cụ thể:**
  * **Nghỉ 1 buổi (1 ngày):** Đi làm 21 công $\rightarrow$ Lương CB nhận $\frac{21}{22} \times \text{Lương CB}$ (**Bị trừ $\frac{1}{22} \approx 4.545\%$** lương cơ bản).
  * **Nghỉ 2 buổi (2 ngày):** Đi làm 20 công $\rightarrow$ Lương CB nhận $\frac{20}{22} \times \text{Lương CB}$ (**Bị trừ $\frac{2}{22} \approx 9.09\%$** lương cơ bản).

---

### 3. Ví Dụ Bằng Số Tiền Minh Họa Thực Tế

> **Giả định:** Nhân viên A có mức lương thỏa thuận trên HĐLĐ là **22.000.000 VNĐ / tháng**:
> * Đơn giá 1 ngày công chuẩn: $\frac{22.000.000}{22} = \mathbf{1.000.000 \text{ VNĐ / ngày}}$.

| Trường hợp nghỉ | Số ngày đi làm | Số ngày tính lương | Lương cơ bản nhận | Số tiền bị trừ |
| :--- | :---: | :---: | :---: | :---: |
| **Đi làm đủ tháng** | 22 ngày | 22 công | 22.000.000 VNĐ | 0 VNĐ |
| **Nghỉ 1 ngày CÓ PHÉP** | 21 ngày | 21 + 1 = 22 công | **22.000.000 VNĐ** | **0 VNĐ (Hưởng đủ 100%)** |
| **Nghỉ 2 ngày CÓ PHÉP** | 20 ngày | 20 + 2 = 22 công | **22.000.000 VNĐ** | **0 VNĐ (Hưởng đủ 100%)** |
| **Nghỉ 1 ngày KHÔNG PHÉP** | 21 ngày | 21 công | **21.000.000 VNĐ** | **-1.000.000 VNĐ** |
| **Nghỉ 2 ngày KHÔNG PHÉP** | 20 ngày | 20 công | **20.000.000 VNĐ** | **-2.000.000 VNĐ** |

---

### 4. Công Thức Tổng Quát Tính Thực Lĩnh (Net Salary)
$$\text{Lương Thực Lĩnh (Net)} = \text{Lương CB theo công} + \text{Phụ Cấp} + \text{Thưởng KPI} - \text{Khấu Trừ Bảo Hiểm (10.5\%)}$$

* **Khoản cộng (Gross):**
  * Lương cơ bản theo ngày công thực tế.
  * Phụ cấp cố định (Ăn trưa, xăng xe, trách nhiệm).
  * Thưởng hiệu suất KPI (theo xếp hạng A: +25%, B: +10% tại phân hệ Đánh giá hiệu suất).
* **Khoản trừ nghĩa vụ pháp lý (10.5% theo Luật BHXH Việt Nam):**
  * Bảo hiểm Xã hội (BHXH): $8\% \times \text{Lương CB}$
  * Bảo hiểm Y tế (BHYT): $1.5\% \times \text{Lương CB}$
  * Bảo hiểm Thất nghiệp (BHTN): $1.0\% \times \text{Lương CB}$

---
*Tài liệu được cập nhật tự động theo phiên bản HRMIS Enterprise v3.0 - Tập đoàn Công nghệ Nexustech.*


