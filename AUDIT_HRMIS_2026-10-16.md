# Rà soát HRMIS — 16/10/2026

## Phạm vi kiểm tra

- Đọc luồng xác thực, phân quyền, nhân sự, hợp đồng, chấm công, nghỉ phép, lương, tuyển dụng, đánh giá và các API liên quan.
- Kiểm tra trực quan các trang quản trị chính bằng tài khoản quản trị và tài khoản nhân viên, gồm giao diện hẹp; kiểm tra chuyển hướng khi nhân viên mở trực tiếp URL quản trị.
- Chạy TypeScript, build sản xuất, lint và kiểm thử thuần logic cho phép năm vắt qua năm cùng các ngưỡng thuế TNCN.
- Không chạy bộ kiểm thử tích hợp trong `scratch/` vì các kịch bản đó ghi, sửa và xoá dữ liệu thật trong cơ sở dữ liệu đang cấu hình.

## Vấn đề đã sửa

| Khu vực | Sửa đổi |
| --- | --- |
| Bảo vệ trang | Chuyển từ `middleware.ts` không được Next.js 16 nhận sang `src/proxy.ts`; URL quản trị được chặn theo vai trò, vai trò lạ được coi là nhân viên cơ bản. |
| Phân quyền dữ liệu | Siết phạm vi quản lý thực tế cho hồ sơ nhân sự, hợp đồng, nghỉ phép, đánh giá, đơn ứng tuyển và lịch phỏng vấn; người quản lý không được mặc nhiên xem cả phòng chỉ vì thuộc phòng đó. |
| Nghỉ phép | Tách chỉnh sửa đơn khỏi quyết định duyệt; ngăn tự duyệt không đúng quyền; kiểm tra ngày, loại phép, số dư từng năm khi đơn vắt qua 31/12; dùng ngày UTC nhất quán; tạo/sửa/duyệt/xóa đơn cùng chấm công và nhật ký được đặt trong transaction. |
| Lương | Không tự tính đủ 22 ngày khi thiếu dữ liệu công; không cộng trùng ngày đã đi làm với ngày nghỉ có lương; kiểm tra kỳ lương và số tiền; nhân viên chỉ truy vấn được phiếu của chính mình; duyệt chi hàng loạt bắt buộc chọn ID cụ thể và xử lý nguyên nhóm trong transaction; tạo/sửa/xóa phiếu thủ công lưu cùng nhật ký, nhật ký ghi đúng vai trò người thao tác. |
| Tuyển dụng | Bài đăng hết hạn không còn nhận hồ sơ; kiểm tra phạm vi phòng ban và trạng thái đơn/phỏng vấn. |
| Dashboard và nội dung | Chỉ đếm nhân sự còn làm việc, loại thông tin không thuộc quyền kế toán, bỏ các tuyên bố GPS/tuân thủ không có cơ sở, sửa ví dụ thuế 2026. |
| Giao diện | Thiết kế lại trang đăng nhập, tổng quan, tuyển dụng công khai, thanh điều hướng, bảng và hệ màu/chữ dùng chung của các phân hệ. |

## Kết quả kiểm tra

- `npx tsc --noEmit`: đạt.
- `npm run build`: đạt, tạo 44 trang tĩnh và các route động; Next.js nhận `Proxy (Middleware)`.
- `npx tsx --test tests/business-rules.test.ts`: 7/7 đạt.
- `npm run lint`: còn 493 vấn đề (378 lỗi, 115 cảnh báo), chủ yếu là kiểu `any`, hooks và mã trong `scratch/`; cần một đợt chuẩn hóa riêng trước khi dùng lint làm cổng phát hành.

## Rủi ro nghiệp vụ còn cần quyết định (đã rà lại 17/10/2026)

1. Đã thêm đơn OT `PENDING → APPROVED/REJECTED`, cấm tự duyệt, kiểm tra phạm vi quản lý và chỉ đưa OT đã duyệt vào bảng lương tự động. Hệ số đang dùng 150% ngày thường, 200% cuối tuần, 300% ngày lễ. Cần rà soát thêm ca đêm, nghỉ bù, giới hạn OT và chứng từ/chấm công trước khi vận hành thật.
2. Nghỉ ốm đã được tách khỏi ngày công công ty trả lương. Ứng dụng hiện chỉ hiển thị số ngày; số tiền trợ cấp và hồ sơ BHXH phải do bộ phận nhân sự đối chiếu, chưa được tự động chi trả.
3. Mức đóng bảo hiểm, nền tính đóng và khoản miễn thuế vẫn mã hóa trong công thức. Kế toán/HR cần duyệt bảng quy tắc cho từng kỳ, đặc biệt trường hợp nghỉ không hưởng lương dài ngày và mức đóng BHXH theo hợp đồng. Trạng thái `PAID` chỉ là ghi nhận trong ứng dụng; không có tích hợp chuyển tiền.
4. Bản ghi `LEAVE` có trước migration ngày 17/10 không xác định chắc chắn được nguồn gốc nên được giữ nguyên khi rút đơn cũ. HR cần đối chiếu thủ công những bản ghi lịch sử này nếu muốn làm sạch.

## Cập nhật theo chính sách công ty (16/10/2026)

- Người dùng xác nhận công chuẩn theo ngày làm việc thực tế từng tháng, trừ cuối tuần/ngày lễ; OT cần duyệt; nghỉ ốm theo BHXH.
- Đã cập nhật công thức lương, phép, biểu mẫu nhập lương, trang sổ lương và hướng dẫn. Đã thêm migration `20261016000000_overtime_approval` và áp dụng thành công vào PostgreSQL cục bộ.
- `npx tsc --noEmit`: đạt. `npx tsx --test tests/business-rules.test.ts`: 7/7 đạt. `npm run build`: đạt, tạo 44 trang tĩnh và các route động mới.
- Lịch 2026 dựa trên [thông báo nghỉ Tết](https://xaydungchinhsach.chinhphu.vn/lich-nghi-tet-nguyen-dan-2026-cua-hoc-sinh-giao-vien-can-bo-cong-chuc-vien-chuc-tp-ha-noi-119251217121327126.htm), [nghỉ bù Giỗ Tổ](https://xaydungchinhsach.chinhphu.vn/lich-nghi-le-gio-to-hung-vuong-30-4-1-5-quoc-khanh-2-9-nam-2026-119260222115822151.htm), [Quốc khánh](https://xaydungchinhsach.chinhphu.vn/thong-bao-lich-nghi-le-quoc-khanh-2026-119260729092042494.htm) và [Ngày Văn hóa Việt Nam](https://xaydungchinhsach.chinhphu.vn/ngay-24-11-hang-nam-la-ngay-van-hoa-viet-nam-nguoi-lao-dong-duoc-nghi-huong-nguyen-luong-119260113152642414.htm). Doanh nghiệp cần xác nhận lựa chọn ngày 1/9 hay 3/9 và các ngày hoán đổi riêng.

**Kết luận:** Các lỗi phân quyền và phép tính rõ ràng tìm thấy trong lần rà soát này đã được sửa, nhưng chưa đủ bằng chứng để khẳng định toàn bộ nghiệp vụ nhân sự và bảng lương đã sẵn sàng cho vận hành thực tế. Các quy tắc trong mục trên cần được người phụ trách nghiệp vụ xác nhận.

## Cập nhật 17/10/2026

- Đã thêm lịch công lưu trong PostgreSQL và màn hình HR quản lý ngày nghỉ, ngày làm bù cuối tuần. Lương, nghỉ phép và lịch công chuẩn cùng đọc lịch này. Không cho thay đổi ngày thuộc tháng đã có phiếu lương `PAID`; phiếu `DRAFT` cần tính lại sau khi sửa lịch.
- Đã đặt toàn bộ lần tính lương tự động cho nhiều nhân viên trong một transaction. Nếu bất kỳ phiếu nào lỗi, mọi cập nhật của lần chạy được khôi phục.
- Đã bổ sung migration khởi tạo để có thể dựng cơ sở dữ liệu mới từ đầu; cơ sở dữ liệu đang dùng được đánh dấu migration khởi tạo là đã áp dụng vì bảng đã tồn tại. Migration lịch công đã áp dụng thành công.
- Đã chạy kiểm thử tích hợp trên PostgreSQL thử nghiệm riêng: ngày làm bù, OT đã duyệt, nghỉ ốm không hưởng lương công ty và rollback lô tính lương. Dữ liệu thật không bị kiểm thử ghi sửa.
- `npx tsc --noEmit`, build sản xuất (45 trang tĩnh và route động), 9 kiểm thử nghiệp vụ và 1 kiểm thử tích hợp đều đạt; lint các file lịch công/kiểm thử mới đạt.
- Còn cần đối chiếu nghiệp vụ bảo hiểm/thuế, quy định OT chi tiết và các bản ghi chấm công `LEAVE` lịch sử trước khi dùng bảng lương làm căn cứ chi trả thực tế.

## Cập nhật truy vết chấm công nghỉ phép (17/10/2026)

- Bản ghi chấm công do đơn nghỉ đã duyệt tạo mới được gắn `leaveRequestId`. Nếu đơn chuyển bản ghi `ABSENT` hoặc trạng thái khác thành `LEAVE`, hệ thống lưu `statusBeforeLeave`.
- Khi rút duyệt hoặc xóa đơn, chỉ bản ghi gắn đúng ID đơn được hoàn tác: bản ghi tạo mới bị xóa, bản ghi có sẵn được trả về trạng thái cũ. Bản ghi `LEAVE` nhập thủ công và bản ghi lịch sử chưa có ID nguồn được giữ nguyên.
- Migration `20261017000000_leave_attendance_origin` đã chạy trên database thử nghiệm mới và database `hrmis` hiện tại; kiểm thử tích hợp xác nhận cả rút duyệt và xóa đơn đều giữ ngày nghỉ nhập thủ công, khôi phục ngày vắng mặt và xóa ngày nghỉ do đơn tạo. TypeScript, build sản xuất, lint phần vừa sửa và 9 kiểm thử nghiệp vụ đều đạt.

---

## Rà soát sâu toàn hệ thống & Kết quả 3 đợt cải thiện (17/10/2026 — Đợt tiếp nối)

### 1. Bảng kiểm kê các phân hệ và luồng chính

| Phân hệ | Cách kiểm tra | Kết quả & Lỗi đã xác nhận (đã sửa) | Nghi vấn / Phụ thuộc chính sách | Ý tưởng cải thiện |
| --- | --- | --- | --- | --- |
| **1. Đăng nhập & Phiên (`src/auth.ts`, `src/proxy.ts`)** | Đọc mã nguồn JWT callback, `proxy.ts`, đối chiếu trạng thái `Employee.status` trong DB. | **[Đã sửa - Cao]** JWT giữ nguyên role/status suốt 24h kể cả khi nhân sự bị `RESIGNED`/`SUSPENDED` hoặc xóa tài khoản. Đã bổ sung đồng bộ DB định kỳ mỗi 60 giây trong callback `jwt` để thu hồi phiên ngay lập tức; chặn `ACCOUNTANT` truy cập trực tiếp `/dashboard/employees` tại `src/proxy.ts`. | Chưa áp dụng cơ chế khóa tài khoản tạm thời (rate-limit) sau nhiều lần sai mật khẩu. | Bổ sung rate-limit theo IP/username tại endpoint đăng nhập. |
| **2. Vai trò & Quyền (`src/app/api/roles/route.ts`, `src/lib/access-control.ts`)** | Kiểm tra ma trận quyền và các API hệ thống (`/api/roles`, `/api/audit-workflow`). | **[Đã sửa - Cao]** `POST /api/roles` chỉ kiểm tra đăng nhập mà không kiểm tra `SYSTEM_ADMIN`; `GET /api/audit-workflow` trả toàn bộ nhật ký kiểm toán cho mọi user. Đã khóa `POST /api/roles` cho `SYSTEM_ADMIN` và giới hạn `audit-workflow` theo đúng vai trò/phạm vi. | Ma trận quyền hệ thống lưu tĩnh; nếu mở rộng role động cần bảng phân quyền chi tiết. | Chuẩn hóa helper kiểm tra quyền dùng chung cho mọi API route. |
| **3. Hồ sơ nhân sự (`src/services/employee.service.ts`, `/api/employees/**`)** | Kiểm tra truy vấn chi tiết/danh sách nhân sự, tạo/sửa/xóa, ẩn thông tin nhạy cảm và UI hồ sơ. | **[Đã sửa - Nghiêm trọng]** Lộ hash mật khẩu `user.password` trong `getEmployeeById`; `MANAGER` gọi `GET /api/employees` thấy toàn công ty; `POST/PUT` cho phép gán nhân sự sang phòng ban khác hoặc tạo tài khoản quyền `SYSTEM_ADMIN`; xóa nhân sự dùng `res.ok` giả trên UI. Đã sửa triệt để ở cả API, Service và UI. | Quy tắc mã nhân viên (`EMP...`) tự sinh hay nhập tay khi import hàng loạt. | Hỗ trợ xuất hồ sơ nhân sự chuẩn PDF/Excel có phân quyền trường nhạy cảm. |
| **4. Phòng ban (`src/services/department.service.ts`, `/api/departments/**`)** | Kiểm tra `GET/POST/PUT/DELETE` phòng ban và danh sách nhân sự đi kèm. | **[Đã sửa - Cao]** `GET /api/departments` và `[id]` trả kèm toàn bộ danh sách `employees` (lộ lương/thông tin cá nhân cho mọi vai trò); xóa phòng ban khi còn lịch sử biến động gây lỗi FK 500. Đã giới hạn trường trả về theo vai trò và kiểm tra ràng buộc trước khi xóa. | Cơ cấu phòng ban đa cấp (cây phòng ban) hiện mới ở mức 1 cấp phẳng. | Thêm biểu đồ cơ cấu tổ chức trực quan từ dữ liệu phòng ban. |
| **5. Hợp đồng lao động (`src/services/contract.service.ts`, `/api/contracts/**`)** | Kiểm tra RBAC xem/tạo/sửa/xóa hợp đồng, ngày hiệu lực và luồng duyệt. | **[Đã sửa - Cao]** `PUT/DELETE /api/contracts/[id]` cho phép `MANAGER` sửa/xóa hợp đồng hoặc đổi `employeeId` sang người ngoài phạm vi; cho phép tạo hợp đồng `endDate < startDate`. Đã khóa `PUT/DELETE` chỉ cho `SYSTEM_ADMIN`/`HR` và kiểm tra tính hợp lệ của ngày hợp đồng + nhật ký kiểm toán. | Quy tắc tự động chuyển hợp đồng hết hạn sang trạng thái `EXPIRED` theo cronjob hay thủ công. | Cảnh báo sớm hợp đồng sắp hết hạn trước 30/15 ngày trên Dashboard. |
| **6. Chấm công & Lịch công (`src/services/attendance.service.ts`, `work-calendar.service.ts`)** | Kiểm thử tích hợp trên DB cách ly + kiểm tra hiệu năng trang `/dashboard/attendance`. | **[Đã sửa - Trung bình]** Đồng hồ thời gian thực trên `/dashboard/attendance` làm re-render toàn bộ bảng chấm công mỗi giây; tab "Giám sát công ty" hiển thị cho cả `USER`. Đã tách component `LiveTerminalClock` độc lập và ẩn tab giám sát với `USER`. | Bản ghi `LEAVE` lịch sử trước migration 17/10 không có `leaveRequestId` được giữ nguyên để đối chiếu thủ công. | Bổ sung công cụ đối chiếu có kiểm soát cho HR đối với các bản ghi `LEAVE` lịch sử. |
| **7. Nghỉ phép (`src/services/leave.service.ts`, `/api/leave/**`)** | Kiểm thử đơn vị + kiểm thử tích hợp trên DB cách ly `hrmis_codex_test_leave`. | **[Đã sửa - Cao]** Chuẩn hóa ngày nghỉ phép về `00:00:00.000Z`; không trừ phép năm nếu ngày đó nhân sự thực tế có chấm công đi làm (`PRESENT`/`LATE`); chặn tạo/sửa/duyệt/hủy duyệt/xóa đơn nghỉ thuộc kỳ lương đã `PAID`; sửa kiểm tra hạn mức khi duyệt đơn `PENDING`; loại bỏ tùy chọn `MATERNITY_LEAVE` chưa hỗ trợ trên UI. | Chính sách nghỉ ốm dài ngày và thai sản hưởng BHXH chi tiết theo từng loại bệnh. | Cho phép đính kèm giấy nghỉ ốm hưởng BHXH ngay trên form tạo đơn. |
| **8. Tăng ca / OT (`src/services/overtime.service.ts`, `/api/overtime/**`)** | Kiểm thử đơn vị + tích hợp với lịch công và bảng lương. | **[Đã sửa - Cao]** Chặn đăng ký/duyệt OT trùng vào ngày đang nghỉ phép `APPROVED` (trừ khi thực tế có chấm công đi làm); chặn tạo/sửa OT vào kỳ lương đã `PAID`; ngày làm bù cuối tuần (`extraWorkdays`) áp dụng đúng hệ số OT ngày làm việc (`150%`) thay vì `200%`. | Cần chốt giới hạn trần giờ OT theo ngày/tháng/năm (Điều 107 BLLĐ 2019) và phụ cấp ca đêm (Điều 98 BLLĐ 2019). | Hiển thị bộ đếm tổng số giờ OT trong tháng/năm ngay khi quản lý bấm duyệt. |
| **9. Bảng lương & Thuế/BHXH (`src/services/payroll.service.ts`, `/api/payroll/**`)** | Kiểm thử đơn vị (12/12) + kiểm thử tích hợp trên DB cách ly `hrmis_codex_test_payroll`. | **[Đã sửa - Nghiêm trọng]** Sửa lỗi `proRatedBaseSalary` trả đủ 100% lương cho nhân sự đã `RESIGNED`/`SUSPENDED` giữa tháng; chuẩn hóa `leave.startDate`/`endDate` UTC khi đếm ngày nghỉ; bỏ fallback lấy nhầm điểm KPI của quý trước; dùng đúng `statutoryTotal` khi giảm trừ thuế TNCN; gom truy vấn `existingPayrolls` ngoài vòng lặp; kiểm tra đầy đủ trạng thái `PAID` và giá trị âm khi sửa tay. | Cần chốt: (1) Nền đóng BHXH dựa trên `Contract.salary` hay lương thực nhận theo ngày công; (2) Trần đóng BHXH/BHTN (20 × lương cơ sở / vùng) và ngưỡng nghỉ không lương $\ge 14$ ngày. | Xuất phiếu lương PDF chuẩn có chữ ký số/xác nhận và bảng kê đối chiếu ngân hàng. |
| **10. Tuyển dụng (`src/app/api/recruitment/**`, `JobManagementView.tsx`)** | Kiểm tra API đăng tin, sửa tin, ứng tuyển và quản lý hồ sơ. | **[Đã sửa - Trung bình]** `POST` và `PATCH /api/recruitment/jobs` bỏ sót trường `dueDate` và `departmentId` khiến hạn nộp hồ sơ không lưu được từ UI; UI dùng `window.confirm` và đóng modal kể cả khi API lỗi. Đã sửa lưu đầy đủ `dueDate`/`departmentId` và dùng `useConfirm` + kiểm tra `res.ok`. | Lưu trữ CV ứng viên hiện dùng URL/base64, cần giới hạn dung lượng và định dạng file tải lên. | Tích hợp gửi email tự động thông báo lịch phỏng vấn cho ứng viên. |
| **11. Đánh giá KPI (`src/services/performance.service.ts`, `EvaluationModal.tsx`)** | Kiểm tra công thức điểm KPI, phân quyền chấm điểm và UI modal đánh giá. | **[Đã sửa - Cao]** Sửa lỗi độ ưu tiên toán tử `Math.round(((c1 * 0.5) + (c2 * 0.25) + (c3 * 0.25)) * 10) / 10` trong `EvaluationModal.tsx` (trước đó chỉ chia 10 cho `c3 * 0.25`); sửa lỗi UI cập nhật điểm giả khi API trả lỗi; bổ sung thanh trượt tự đánh giá (`selfScore`) cho nhân viên và chặn tự nâng `managerScore`/`grade`/`status` ở backend; hiển thị đúng huy hiệu `Hạng D`. | Quy trình khiếu nại/phản hồi kết quả đánh giá KPI giữa nhân viên và quản lý. | Bổ sung biểu đồ xu hướng điểm KPI qua các quý cho từng nhân sự. |
| **12. Đào tạo, Khảo sát, Quy hoạch & Biến động nhân sự** | Kiểm tra RBAC tại `/api/training-surveys`, `/api/cadre-planning`, `/api/personnel-changes` và các trang UI tương ứng. | **[Đã sửa - Cao]** Chặn lộ danh sách người làm khảo sát ẩn danh cho user thường; khóa tạo/duyệt quy hoạch cán bộ và quyết định biến động nhân sự theo đúng vai trò (`SYSTEM_ADMIN`, `BOD`, `HR`); nối nút Duyệt/Từ chối và hiển thị đúng trạng thái trên UI; thay `window.prompt` chấm sao khảo sát bằng modal chọn 1–5 sao; thêm hỗ trợ in PDF (`printable-modal`). | Quy trình tự động cập nhật phòng ban/chức vụ trong hồ sơ nhân sự ngay khi quyết định thuyên chuyển/bổ nhiệm được `BOD` duyệt. | Liên kết trực tiếp kết quả khóa đào tạo với tiêu chí nâng lương/quy hoạch cán bộ. |
| **13. Tổng quan Dashboard & Hướng dẫn (`/api/dashboard`, `/dashboard/guide`)** | Kiểm tra hiệu năng truy vấn và tính chính xác của tài liệu hướng dẫn trong ứng dụng. | **[Đã sửa - Trung bình]** Song song hóa 5 truy vấn Prisma trong `GET /api/dashboard` bằng `Promise.all` (loại bỏ waterfall tuần tự); bổ sung 2 thẻ vai trò `BOD` và `ACCOUNTANT` vào trang `/dashboard/guide` để khớp 100% với 6 vai trò thực tế. | Có thể bổ sung cache ngắn hạn (30–60s) cho thống kê tổng quan khi số lượng nhân sự tăng lớn. | Cho phép tùy biến widget trên Dashboard theo từng vai trò. |

---

### 2. Tổng hợp 3 đợt sửa lỗi và mã Commit

1. **Đợt 1 — Bảo mật, Phân quyền RBAC/IDOR, Phiên đăng nhập & Toàn vẹn dữ liệu (`commit b08d37f`)**:
   - Đã sửa 24 files: đồng bộ trạng thái tài khoản/nhân sự trong JWT (`src/auth.ts`), chặn `ACCOUNTANT` tại `src/proxy.ts`, loại bỏ lộ `user.password` trong `employee.service.ts`, khóa phân quyền theo phạm vi quản lý thực tế ở `employees`, `departments`, `contracts`, `performance`, `payroll`, `roles`, `cadre-planning`, `personnel-changes`, `audit-workflow`, `training-surveys`.
2. **Đợt 2 — Nghiệp vụ Chấm công, Nghỉ phép, OT, Lịch công & Bảng lương + Kiểm thử tích hợp DB cách ly (`commit 29b2130`)**:
   - Đã sửa 6 files (`payroll.service.ts`, `leave.service.ts`, `overtime.service.ts` và 3 file test): sửa hệ số OT ngày làm bù cuối tuần (`150%`), sửa lương nhân sự nghỉ việc/đình chỉ giữa tháng, chuẩn hóa ngày nghỉ UTC, không trừ phép năm khi ngày đó có đi làm (`PRESENT`/`LATE`), chặn sửa nghỉ phép/OT thuộc kỳ lương đã `PAID`, sửa kiểm tra hạn mức khi duyệt đơn `PENDING`, bỏ fallback lấy nhầm KPI quý trước, sửa giảm trừ thuế TNCN theo đúng `statutoryTotal`.
3. **Đợt 3 — Giao diện, Form/Modal, RBAC UI, In ấn PDF & Hiệu năng Dashboard/API**:
   - Đã sửa 15 files (`EvaluationModal.tsx`, `performance/page.tsx`, `LeaveModal.tsx`, `my-workspace/page.tsx`, `recruitment/jobs/route.ts`, `recruitment/jobs/[id]/route.ts`, `JobManagementView.tsx`, `personnel-changes/page.tsx`, `cadre-planning/page.tsx`, `employees/page.tsx`, `attendance/page.tsx`, `leave/page.tsx`, `training-surveys/page.tsx`, `guide/page.tsx`, `api/dashboard/route.ts`).

---

### 3. Bằng chứng kiểm thử (Verification Evidence)

- **Kiểm tra kiểu tĩnh TypeScript**: `npx tsc --noEmit` → **Đạt (0 lỗi)**.
- **Kiểm thử đơn vị nghiệp vụ (`npx tsx --test tests/business-rules.test.ts`)**: **12/12 kịch bản đạt** (phép năm vắt qua năm, công chuẩn tháng, ngày làm bù cuối tuần & OT 150%, chuẩn hóa ngày UTC, lịch công, OT sai giờ, biểu thuế TNCN 2026 lũy tiến, duyệt chi hàng loạt, truy vấn lương thiếu định danh, phiếu lương tương lai, xếp hạng & thưởng/phạt KPI).
- **Kiểm thử tích hợp Nghỉ phép – Chấm công (`npx tsx --test tests/leave-attendance-integration.test.ts`)**: **Đạt 100%** trên cơ sở dữ liệu PostgreSQL thử nghiệm cách ly (`hrmis_codex_test_leave`) dựng mới hoàn toàn từ 5 migrations; tự động dọn sạch DB thử nghiệm sau khi chạy.
- **Kiểm thử tích hợp Bảng lương – OT – Nghỉ ốm – Rollback (`npx tsx --test tests/payroll-integration.test.ts`)**: **Đạt 100%** trên cơ sở dữ liệu PostgreSQL thử nghiệm cách ly (`hrmis_codex_test_payroll`) dựng mới hoàn toàn từ 5 migrations; tự động dọn sạch DB thử nghiệm sau khi chạy.
- **Build sản xuất (`npm run build`)**: **Đạt 100%**, biên dịch thành công toàn bộ các trang tĩnh, route động và `Proxy (Middleware)` trên Next.js 16.3.1.

---

### 4. Đối chiếu pháp lý & Các quyết định chính sách đã chốt và triển khai (Đợt 4)

1. **`1.A` — Căn cứ đóng BHXH, BHYT, BHTN và trường hợp nghỉ không lương $\ge 14$ ngày** (Luật BHXH 2024 — Luật số 41/2024/QH15; Nghị định 161/2026/NĐ-CP & Nghị định 293/2025/NĐ-CP):
   - **Đã triển khai**: Hệ thống tính BHXH (8%), BHYT (1.5%) trên mức lương cơ bản hợp đồng (`Contract.salary` / `baseSalary`), áp trần 20 lần mức tham chiếu (`46.800.000đ` trước 01/07/2026; `50.600.000đ` từ 01/07/2026); tính BHTN (1%) áp trần 20 lần lương tối thiểu vùng I (`106.200.000đ` từ 01/01/2026). Nếu tổng số ngày nghỉ không hưởng lương / nghỉ ốm trong tháng $\ge 14$ ngày làm việc (`standardWorkingDays - effectiveDays >= 14`), hệ thống tự động miễn trích đóng BHXH/BHYT/BHTN tháng đó.
2. **`2.A` — Cảnh báo mềm ngưỡng giờ OT và duyệt linh hoạt theo thỏa thuận hai bên** (Điều 107 & Điều 108 Bộ luật Lao động 2019):
   - **Đã triển khai**: Hệ thống tự động tính tổng số giờ OT lũy kế trong tháng và trong năm của từng nhân sự, hiển thị cảnh báo mềm khi vượt ngưỡng `40 giờ/tháng` hoặc `200–300 giờ/năm` ngay trên biểu mẫu gửi đơn và danh sách chờ duyệt (`OvertimePanel.tsx`), đồng thời cho phép Quản lý/HR phê duyệt linh hoạt khi có sự đồng thuận của hai bên và ghi nhận rõ vào Nhật ký kiểm toán (`AuditLog`).
3. **`3.A` — Đối chiếu thủ công bản ghi chấm công `LEAVE` lịch sử trước migration 17/10/2026**:
   - **Đã triển khai**: Giữ nguyên an toàn các bản ghi `LEAVE` lịch sử (`leaveRequestId = null`); bổ sung thanh cảnh báo nhanh, bộ lọc chuyên biệt (`Nghỉ phép lịch sử / thủ công`) và nhãn truy vết mã đơn trên màn hình Giám sát Chấm công (`/dashboard/attendance`).
4. **Cập nhật Sổ tay nghiệp vụ (`/dashboard/guide`)**:
   - **Đã triển khai**: Đồng bộ toàn bộ quy định `1.A`, `2.A`, `3.A` vào Sổ tay nghiệp vụ HRMIS v3.3.

---

### 5. Quy trình Sao lưu, Khôi phục, Migration & Vận hành an toàn

1. **Sao lưu (Backup) trước khi cập nhật**:
   - Chạy `pg_dump -Fc -h <host> -U <user> -d hrmis -f backup_hrmis_$(date +%Y%m%d_%H%M%S).dump` trước mọi đợt chạy migration hoặc chốt bảng lương.
2. **Kiểm thử Migration trên DB cách ly**:
   - Luôn tạo DB tạm (`hrmis_migration_verify`), chạy `npx prisma migrate deploy` trên DB tạm và chạy bộ kiểm thử tích hợp (`tests/leave-attendance-integration.test.ts`, `tests/payroll-integration.test.ts`) trước khi chạy trên DB chính.
3. **Khôi phục (Restore) khi có sự cố**:
   - Dùng `pg_restore --clean --if-exists -h <host> -U <user> -d hrmis <file.dump>` để quay về trạng thái nguyên vẹn trước migration.
4. **Giám sát & Nhật ký kiểm toán (`AuditLog`)**:
   - Mọi thao tác nhạy cảm (duyệt nghỉ phép, duyệt OT, tạo/sửa/xóa/duyệt chi lương, sửa hợp đồng, biến động nhân sự) đều được ghi nhận nguyên tử trong cùng transaction với dữ liệu nghiệp vụ.

---

### 6. Rà soát & Sửa lỗi Đợt 5 — Tính Bảo hiểm & Vòng đời Quyết định Biến động Nhân sự (17/10/2026)

#### 6.1. Ưu tiên 1 — Nghiệp vụ Tính Bảo hiểm (`src/services/payroll.service.ts`)

1. **Lỗi đã xác nhận & Giải pháp đã triển khai**:
   - **[Đã sửa - Nghiêm trọng] Suy diễn ngày nghỉ không lương từ `standardWorkingDays - effectiveDays`**:
     - *Nguyên nhân*: Trước đây `calculateStatutoryInsurance` tính `nonPaidWorkingDays = standardWorkingDays - effectivePaidDays`, dẫn đến nhân viên thiếu dữ liệu chấm công (chưa chấm công, không có đơn nghỉ) hoặc vào/nghỉ việc giữa tháng bị coi nhầm là nghỉ không lương $\ge 14$ ngày và bị miễn đóng BHXH sai quy định.
     - *Giải pháp*: Bổ sung `InsuranceAttendanceBreakdown` và phân tách rạch ròi từng ngày làm việc chuẩn trong kỳ thành:
       1. Ngày đi làm hưởng lương (`workedDays`: `PRESENT` / `LATE`) + Ngày nghỉ phép có hưởng lương (`paidLeaveDays`: `ANNUAL_LEAVE` đã duyệt).
       2. Ngày nghỉ không hưởng lương đã xác nhận (`confirmedUnpaidDays`: `UNPAID_LEAVE` đã duyệt + `ABSENT` không phép đã ghi nhận).
       3. Ngày nghỉ ốm hưởng chế độ BHXH đã xác nhận (`confirmedSickDays`: `SICK_LEAVE` đã duyệt).
       4. Ngày ngoài thời gian làm việc do vào/nghỉ việc giữa tháng (`midMonthUnworkedDays`).
       5. Ngày chưa có dữ liệu chấm công (`missingAttendanceDays`).
     - Chỉ tự động miễn đóng BHXH/BHYT/BHTN (`exempt = true`) khi tổng ngày nghỉ không lương và nghỉ ốm **đã có bằng chứng xác nhận** (`confirmedExemptDays = confirmedUnpaidDays + confirmedSickDays`) $\ge 14$ ngày công.
     - Khi `confirmedExemptDays < 14` nhưng `nonPaidWorkingDays >= 14` do thiếu dữ liệu công (`missingAttendanceDays > 0`) hoặc vào/nghỉ việc giữa tháng (`midMonthUnworkedDays > 0`), hệ thống **không tự động miễn đóng** (`exempt = false`), vẫn tạm trích bảo hiểm theo căn cứ hợp đồng và gắn cờ `needsHrReconciliation = true` kèm dòng cảnh báo trên phiếu lương: *"Cần HR đối chiếu chấm công/bảo hiểm (Thiếu dữ liệu công X ngày, vào/nghỉ giữa tháng Y ngày — tạm trích bảo hiểm theo HĐ)"*.
   - **[Đã sửa - Cao] Nhánh `SalaryComponent` khấu trừ bảo hiểm cấu hình riêng bị cộng vào `totalDeduction` trước khi xét miễn đóng**:
     - *Nguyên nhân*: Vòng lặp `components` cộng toàn bộ khoản `DEDUCTION` (bao gồm cả component bảo hiểm cấu hình riêng) vào `totalDeduction` và `details` trước khi kiểm tra điều kiện miễn đóng $\ge 14$ ngày.
     - *Giải pháp*: Tách `regularComponents` và `insuranceComponents` bằng `isStatutoryInsuranceComponent()`. Khi `ins.exempt === true`, không cộng bất kỳ khoản bảo hiểm nào (cả mặc định lẫn cấu hình riêng) vào `totalDeduction` và hiển thị nhất quán dòng miễn đóng trên `details`. Khi không miễn đóng, component bảo hiểm theo tỷ lệ `%` được tính trên `contractInsuranceBaseSalary`.
   - **[Đã sửa - Cao] Tách bạch 3 mức lương & Loại bỏ điều kiện ngầm `baseSalary === 12000000`**:
     - Đã xóa bỏ đoạn tự động ghi đè `EmployeeSalaryConfig.baseSalary` khi `baseSalary === 12000000`.
     - Tách rõ 3 đại lượng trên bảng tính và trên `details` của phiếu lương:
       1. `configuredBaseSalary` (`config.baseSalary`): Lương cấu hình làm cơ sở tính công và phụ cấp `%`.
       2. `proRatedBaseSalary`: Lương trả theo ngày công thực tế hưởng lương trong kỳ.
       3. `contractInsuranceBaseSalary`: Căn cứ đóng BHXH/BHYT/BHTN lấy từ Hợp đồng lao động `ACTIVE` (nếu có), ngược lại mới dùng `configuredBaseSalary`.

2. **Đối chiếu quy định pháp lý & Điểm cần HR / Kế toán xác nhận**:
   - Căn cứ pháp lý: **Luật Bảo hiểm xã hội 2024 (Luật số 41/2024/QH15, hiệu lực từ 01/07/2025)** — Điều 31, khoản 5 và khoản 6 Điều 33; **Nghị định 293/2025/NĐ-CP** (lương tối thiểu vùng từ 01/01/2026).
   - **Cần HR/Kế toán xác nhận chính sách nội bộ**:
     - *Trường hợp 1 (Vào làm hoặc thôi việc giữa tháng có $\ge 14$ ngày không làm việc và không hưởng lương)*: Theo khoản 5 Điều 33 Luật BHXH 2024, người lao động và người sử dụng lao động không phải đóng BHXH tháng đó *trừ trường hợp hai bên có thỏa thuận có đóng BHXH*. Hiện hệ thống đang giữ ở chế độ an toàn (**tạm tính bảo hiểm + gắn cờ "Cần HR đối chiếu"**) để HR kiểm tra thỏa thuận hợp đồng và kỳ báo tăng/báo giảm BHXH.
     - *Trường hợp 2 (Chênh lệch giữa `EmployeeSalaryConfig.baseSalary` và `Contract.salary`)*: Cần xác nhận khi nào công ty cho phép lương tính công nội bộ (`configuredBaseSalary`) khác với lương ghi trên hợp đồng đóng BHXH (`Contract.salary`), hoặc có muốn đồng bộ 1-1 bắt buộc cho toàn bộ nhân viên hay không.

---

#### 6.2. Ưu tiên 2 — Vòng đời Quyết định Biến động Nhân sự (`src/services/personnel-change.service.ts`, `src/app/api/personnel-changes/route.ts`, `src/app/dashboard/personnel-changes/page.tsx`)

1. **Lỗi đã xác nhận & Giải pháp đã triển khai**:
   - **[Đã sửa - Nghiêm trọng] Cho phép đổi quyết định đã `APPROVED` sang `REJECTED` làm lệch hồ sơ nhân sự**:
     - *Giải pháp*: Khóa vòng đời quyết định một chiều trong `decidePersonnelChangeDecision`. Chỉ quyết định ở trạng thái `PENDING` mới được chuyển sang `APPROVED` hoặc `REJECTED`. Mọi yêu cầu sửa hoặc đảo ngược quyết định đã `APPROVED`/`REJECTED` đều bị chặn với mã lỗi `400` và hướng dẫn lập quyết định điều chỉnh mới có ghi nhận `AuditLog`.
   - **[Đã sửa - Cao] Đề xuất nâng lương `PENDING` làm mất `newSalary` khi phê duyệt**:
     - *Giải pháp*: Bổ sung migration `20261017010000_personnel_change_lifecycle` thêm cột `newSalary`, `employeeId`, `fromDeptId`, `toDeptId`, `appliedAt` vào bảng `PersonnelChange`. Lưu `newSalary` ngay khi tạo quyết định `PENDING`, hiển thị rõ trên bảng danh sách và văn bản quyết định để người duyệt kiểm tra, và tự động áp dụng đúng `existing.newSalary` khi bấm "Duyệt" (`{ id, status: "APPROVED" }`).
   - **[Đã sửa - Cao] Tìm kiếm nhân sự qua email và tìm phòng ban gần đúng (`contains`)**:
     - *Giải pháp*: Lưu và ưu tiên định danh ổn định `employeeId`, `fromDeptId`, `toDeptId`. Kiểm tra chặt sự tồn tại của phòng ban đích (`resolveTargetDepartment` theo `toDeptId` hoặc khớp chính xác tên phòng ban); nếu phòng ban không tồn tại thì trả lỗi `400` thay vì âm thầm bỏ qua.
   - **[Đã sửa - Trung bình] Xử lý nhất quán ngày hiệu lực (`effectiveDate`) và tiền tố năm mã quyết định (`code`)**:
     - Chuẩn hóa kiểm tra định dạng ngày `YYYY-MM-DD` có thực trên lịch (`normalizeEffectiveDateString`).
     - Sinh mã quyết định theo năm của `effectiveDate` (`QĐ-${decisionYear}-xxx`) thay vì cố định `QĐ-2026-`.
     - Với quyết định đã `APPROVED` nhưng có `effectiveDate > today` (ngày hiệu lực tương lai): hệ thống lưu trạng thái `APPROVED` với `appliedAt = null` (chưa ghi đè sớm hồ sơ nhân sự trước ngày hiệu lực), và tự động đồng bộ hồ sơ (`applyDuePersonnelChanges`) ngay khi đến ngày hiệu lực.

---

#### 6.3. Bằng chứng Kiểm thử Đợt 5

- **Kiểm thử đơn vị (`node --import tsx --test tests/business-rules.test.ts`)**: **15/15 bài kiểm thử đạt (0 lỗi)**.
- **Kiểm thử Migration & Tích hợp trên PostgreSQL cách ly (`tests/payroll-integration.test.ts` trên `hrmis_codex_test_batch5`)**: **Đạt 100%** (áp dụng thành công cả 6 migrations từ đầu trên DB mới, kiểm chứng đầy đủ: thiếu chấm công không tự miễn BHXH, nghỉ không lương 13 ngày vs 14 ngày, component bảo hiểm riêng được miễn đóng nhất quán khi nghỉ $\ge 14$ ngày, lương cấu hình `12.000.000đ` khác lương HĐ `20.000.000đ`, đề xuất nâng lương `PENDING -> APPROVED`, chặn đảo ngược quyết định đã `APPROVED`, chặn phòng ban không tồn tại, quyết định hiệu lực tương lai `QĐ-2027-001` và đồng bộ khi đến hạn).

---

### 7. Rà soát & Sửa lỗi Đợt 6 — Quyết định Nhân sự Lịch sử, Thi hành Đúng Ngày Hiệu Lực & Bảo hiểm Theo Địa bàn (17/10/2026)

#### 7.1. Ưu tiên Khẩn — Đối chiếu 4 Quyết định `APPROVED` Lịch sử (`appliedAt IS NULL`) & Tách `GET` khỏi Thao tác Ghi

1. **Kết quả đối chiếu chỉ-đọc 4 bản ghi `APPROVED` lịch sử trên DB `hrmis` (không tự động đánh dấu hoặc chạy lại hàng loạt)**:

| Mã QĐ | Nhân sự & Email | Loại & Ngày hiệu lực gốc | Nội dung trong Quyết định (`PersonnelChange`) | Trạng thái thực tế trên `EmployeeProfile` / `Department` / `Contract` / `AuditLog` | Phân loại & Phương án xử lý |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`QĐ-2026-041`** (`cmv7ttbh700d0rwu8wgstd97d`) | **Nguyễn Văn An** (`user@nexustech.vn`) | `PROMOTION` — `01/10/2026` | Phòng đích: `Phòng Công nghệ (IT)`, Chức danh: `Senior Frontend Lead & Tech Lead`, `newSalary`: `null`, `employeeId`: `null`, `toDeptId`: `null` | Hồ sơ `cmv6gbvu3000vl4u83vt4fce8` đang ở `Phòng Công nghệ (IT)`, chức vụ `Senior Frontend Lead & Tech Lead`, HĐ `HĐLĐ-2026/NX-0007` lương `32.000.000đ`. | **`HISTORICAL_MATCHED`** (Đã khớp 100% hồ sơ hiện tại). Không cần chạy đồng bộ lại; HR có thể bấm **"Xác nhận lịch sử"** (`MARK_HISTORICAL_APPLIED`) để đóng dấu `appliedAt` và gắn `employeeId`/`toDeptId`. |
| **`QĐ-2026-042`** (`cmv7ttbh900d1rwu8g4fixtzy`) | **Trần Thị Mai** (`hr@nexustech.vn`) | `PROMOTION` — `05/10/2026` | Phòng đích: `Phòng Nhân sự (HR)`, Chức danh: `Trưởng phòng Nhân sự & Đào tạo (HR Manager)`, `employeeId`: `null`, `toDeptId`: `null` | Hồ sơ `cmv6gbvxa001gl4u8q7zane30` đang ở phòng `Phòng Nhân sự & Đào tạo (HR)` (không tồn tại tên `Phòng Nhân sự (HR)` trong bảng `Department`), chức vụ hiện tại là `Trưởng phòng Nhân sự (HR Manager)`. | **`HISTORICAL_NEEDS_REVIEW`** (Khác biệt chuỗi tên phòng ban và tên chức vụ rút gọn). Đã khóa tự động chạy lại để không gây lỗi thiếu phòng ban `Phòng Nhân sự (HR)` hoặc ghi đè chức vụ hiện tại; chờ HR xác nhận đối chiếu. |
| **`QĐ-2026-043`** (`cmv7ttbhc00d2rwu8wlna2svk`) | **Vũ Minh Tuấn** (`tuan.vu@nexustech.vn`) | `TRANSFER` — `10/10/2026` | Từ `Phòng Vận hành (Operations)` sang `Phòng Công nghệ (IT)`, Chức danh: `DevOps & Cloud Security Engineer`, `employeeId`: `null`, `toDeptId`: `null` | Hồ sơ `cmv6gbvvg0014l4u879sxnn7g` đang ở `Phòng Công nghệ (IT)`, chức vụ `DevOps & Cloud Security Engineer`, HĐ `HĐTV-2026/NX-0010` lương `28.000.000đ`. | **`HISTORICAL_MATCHED`** (Đã khớp 100% hồ sơ hiện tại). Không tự động chạy lại; HR có thể bấm **"Xác nhận lịch sử"** (`MARK_HISTORICAL_APPLIED`). |
| **`QĐ-2026-044`** (`cmv7ttbhf00d3rwu8qvitr5jy`) | **Phạm Quỳnh Anh** (`quynhanh.pham@nexustech.vn`) | `NEW_HIRE` — `14/10/2026` | Từ `Ứng viên Tuyển dụng` sang `Phòng Nhân sự (HR)`, Chức danh: `Chuyên viên Tuyển dụng & Thu hút Nhân tài`, `employeeId`: `null`, `toDeptId`: `null` | Ứng viên trong bảng `Application` (`cmv6gbwwo00zfl4u89t5pqash`, email `quynhanh.pham@gmail.com`) có `status = HIRED`, có `AuditLog` phê duyệt QĐ-2026-044, nhưng **chưa được khởi tạo tài khoản `User` và `EmployeeProfile`**, tên phòng đích ghi `Phòng Nhân sự (HR)`. | **`HISTORICAL_NEEDS_REVIEW`** (Quyết định tiếp nhận ứng viên chưa hoàn tất tạo `EmployeeProfile`). Đã khóa tự động chạy lại; HR cần tạo hồ sơ nhân viên mới (Onboarding) trước khi đóng dấu hoàn tất. |

2. **Giải pháp kỹ thuật đã triển khai**:
   - **Tách hoàn toàn đọc danh sách khỏi thao tác ghi (`src/app/api/personnel-changes/route.ts`)**: Xóa lời gọi `applyDuePersonnelChanges()` khỏi `GET /api/personnel-changes`. Endpoint `GET` hiện chỉ đọc dữ liệu và phân loại trạng thái vòng đời (`enrichPersonnelChangesWithLifecycle`: `APPLIED`, `SCHEDULED`, `DUE_READY`, `HISTORICAL_MATCHED`, `HISTORICAL_NEEDS_REVIEW`, `PENDING`, `REJECTED`).
   - **Chặn tự động chạy lại quyết định lịch sử chưa xác minh (`isUnverifiedHistoricalDecision`)**: Các quyết định `APPROVED` lịch sử có `appliedAt === null` nhưng thiếu khóa định danh chuẩn (`employeeId === null && toDeptId === null`) được tự động đưa vào danh sách `skippedUnverified`, tuyệt đối không tự động ghi đè lên hồ sơ nhân sự hiện tại.
   - **Chuẩn hóa định dạng ngày `DD/MM/YYYY` lịch sử (`normalizeEffectiveDateString`)**: Hỗ trợ cả `YYYY-MM-DD` và `DD/MM/YYYY` (ví dụ `"20/10/2026"` $\rightarrow$ `"2026-10-20"`, `"01/11/2026"` $\rightarrow$ `"2026-11-01"`), khắc phục triệt để nguy cơ chuỗi `"01/11/2026"` bị so sánh từ điển hoặc phân tích nhầm theo kiểu `MM/DD/YYYY` thành tháng 01/2026.

---

#### 7.2. Ưu tiên Cao — Cơ chế Thi hành Quyết định Đúng Ngày Hiệu Lực (`POST /api/personnel-changes/apply-due`)

- **Endpoint vận hành & định kỳ chuyên biệt (`src/app/api/personnel-changes/apply-due/route.ts`)**:
  - Hỗ trợ xác thực tác vụ định kỳ qua header `x-cron-secret` hoặc `Authorization: Bearer <CRON_SECRET>` (khi cấu hình `CRON_SECRET`), đồng thời hỗ trợ Quản trị hệ thống / Ban Giám Đốc / HR kích hoạt trực tiếp từ giao diện quản trị.
- **So sánh ngày hiệu lực theo múi giờ Việt Nam (`Asia/Ho_Chi_Minh`)**:
  - Hàm `formatVietnamDate(date)` chuẩn hóa ngày tham chiếu về `YYYY-MM-DD` theo đúng múi giờ `Asia/Ho_Chi_Minh`.
- **Chống chạy trùng & Cô lập lỗi từng quyết định**:
  - Mỗi quyết định đến hạn được thực thi trong một giao dịch `Serializable` độc lập kèm kiểm tra `updateMany({ where: { id, appliedAt: null } })` và xử lý xung đột tuần tự hóa (`P2034`), đảm bảo hai lần chạy đồng thời không bao giờ thi hành trùng.
  - Bọc `try / catch` riêng cho từng quyết định: nếu một quyết định bị lỗi (ví dụ phòng ban đích hoặc hồ sơ nhân sự bị xóa), lỗi được ghi vào mảng `failed` và `AuditLog` (`status: "WARNING"`), không làm gãy các quyết định hợp lệ khác hoặc gây lỗi 500 trên trang quản trị, và cho phép chạy lại an toàn sau khi khắc phục.

---

#### 7.3. Ưu tiên Nghiệp vụ — Bảo hiểm Theo Địa bàn (Vùng I–IV), Chặn Mức Pháp lý Năm Tương lai Chưa Cấu hình, Ngày Nghỉ Việc Thực tế & Phiếu lương Thủ công (`src/services/payroll.service.ts`)

1. **Biểu mức lương tối thiểu 4 vùng (`WageRegion = "I" | "II" | "III" | "IV"`) & Trần BHTN theo kỳ (`resolveStatutoryWageParameters`)**:
   - Đối chiếu đầy đủ quy định chính thức:
     - **Từ 01/01/2026 (Nghị định 293/2025/NĐ-CP)**: Vùng I = `5.310.000đ` (trần BHTN `106.200.000đ`), Vùng II = `4.730.000đ` (trần BHTN `94.600.000đ`), Vùng III = `4.140.000đ` (trần BHTN `82.800.000đ`), Vùng IV = `3.700.000đ` (trần BHTN `74.000.000đ`).
     - **Từ 01/07/2024 đến 31/12/2025 (Nghị định 74/2024/NĐ-CP)**: Vùng I = `4.960.000đ` (trần BHTN `99.200.000đ`), Vùng II = `4.410.000đ` (trần BHTN `88.200.000đ`), Vùng III = `3.860.000đ` (trần BHTN `77.200.000đ`), Vùng IV = `3.450.000đ` (trần BHTN `69.000.000đ`).
   - **Chặn tự suy diễn mức pháp lý cho năm tương lai chưa cấu hình (`year > 2026`)**: Nếu tính bảo hiểm cho năm `> 2026` mà chưa khai báo cấu hình `PAYROLL_STATUTORY_WAGES_<YEAR>`, hệ thống từ chối ngay với thông báo yêu cầu cập nhật biểu mức pháp lý thay vì tự áp dụng ngầm mức năm 2026.
   - **Cảnh báo vùng địa bàn khi chưa cấu hình riêng**: Khi chưa xác nhận vùng địa bàn (`regionConfirmed = false`) và lương hợp đồng vượt trần BHTN vùng thấp nhất (`69.000.000đ`), phiếu lương ghi rõ dòng thuyết minh vùng đang tạm áp dụng để HR đối chiếu.
2. **Phân biệt ngày nghỉ việc thực tế với ngày chấm công cuối (`calculateMonthlyPayroll`)**:
   - Đã loại bỏ việc dùng `lastActiveDateKey` (ngày chấm công cuối cùng trong tháng) để suy diễn ngày nghỉ việc.
   - Chỉ tính vào `midMonthUnworkedDays` (ngày ngoài thời gian làm việc do nghỉ việc giữa tháng) khi nhân sự có **bằng chứng ngày thôi việc thực tế** trong kỳ (từ quyết định `RESIGNATION` đã `APPROVED` hoặc ngày kết thúc `endDate` của hợp đồng `TERMINATED`). Nếu chỉ thiếu bản ghi chấm công ở nửa cuối tháng mà chưa có quyết định thôi việc xác nhận ngày hiệu lực, các ngày đó được tính vào `missingAttendanceDays` (thiếu dữ liệu chấm công cần HR đối chiếu).
3. **Chuẩn hóa thuyết minh trên phiếu lương tạo/sửa thủ công (`buildManualPayrollDetails`)**:
   - Đã xóa bỏ lời gọi `calculateStatutoryInsurance(baseSalary, 22, 22)` dùng giả định 22 ngày công mặc định và tự tách khoản `deductions` thủ công thành 3 dòng BHXH/BHYT/BHTN giả tạo.
   - Bảo toàn các dòng khấu trừ chi tiết sẵn có nếu tổng số tiền khấu trừ không đổi, hoặc ghi nhận chính xác khoản giảm trừ/khấu trừ áp dụng thủ công khớp 100% với số tiền thực trừ (`deductions`).

---

#### 7.4. Bằng chứng Kiểm thử Đợt 6

- **Kiểm tra kiểu tĩnh (`npx tsc --noEmit`)**: **0 lỗi**.
- **Kiểm tra ESLint trên toàn bộ các tệp sửa/tạo mới**: **0 lỗi**.
- **Kiểm thử đơn vị (`node --import tsx --test tests/business-rules.test.ts`)**: **18/18 bài kiểm thử đạt (0 lỗi)**.
- **Kiểm thử tích hợp trên PostgreSQL cách ly (`tests/payroll-integration.test.ts` trên `hrmis_codex_test_batch6`)**: **Đạt 100%**, đã kiểm chứng thực tế:
  1. Quyết định lịch sử chưa xác minh (`employeeId = null, toDeptId = null`) được giữ nguyên trong `skippedUnverified`, không tự động chạy lại làm ghi đè hồ sơ mới hơn.
  2. Hai tiến trình `applyDuePersonnelChanges` chạy đồng thời (`Promise.all`) kích hoạt kiểm soát giao dịch `Serializable` của PostgreSQL và chỉ thi hành đúng 1 lần.
  3. Quyết định lỗi (phòng ban đích không còn tồn tại) được cô lập vào `failed`, không làm gãy quyết định hợp lệ khác, và chạy lại thành công sau khi khắc phục.
  4. Đối chiếu lịch sử (`MARK_HISTORICAL_APPLIED`) đóng dấu `appliedAt` và chuẩn hóa `effectiveDate` mà giữ nguyên hồ sơ hiện tại.
  5. Phân biệt chính xác 18 ngày thiếu chấm công (`missingAttendanceDays`) khi chưa có quyết định `RESIGNATION` với 18 ngày sau khi nghỉ việc (`midMonthUnworkedDays`) khi đã có quyết định `RESIGNATION` xác nhận.
- **Kiểm tra biên dịch sản phẩm (`npm run build`)**: **Thành công 100%** (Next.js 16.3.1 Turbopack, 46/46 static pages và toàn bộ API routes).

