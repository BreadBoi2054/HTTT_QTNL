---
type: project
tags:
  - ai-memory
  - project-conventions
  - business-rules
created: 2026-10-14
updated: 2026-10-14
---

# Project Conventions & Core Business Rules (`HTTT_QTNL`)

⬅️ Quay lại: [[MEMORY]] | [[00 - Dashboard (MOC)]] | Xem thêm: [[03 - Quy tắc Nghiệp vụ & Công thức Tính lương (Business Rules)]]

## 1. Quy tắc Phân quyền RBAC & Phạm vi Dữ liệu (Data Scoping)
- **6 Vai trò chuẩn**: `SYSTEM_ADMIN`, `BOD`, `HR`, `ACCOUNTANT`, `MANAGER`, `USER`.
- **Giới hạn của `MANAGER`**:
  - Chỉ được xem/quản lý dữ liệu nhân sự, hợp đồng, chấm công, nghỉ phép, lương, KPI, ứng viên **thuộc phòng ban mình quản lý (hoặc cá nhân mình)**.
  - Chỉ được tạo nhân sự mới với vai trò `USER` trong phòng ban của mình.
  - Trong tuyển dụng: Không được chuyển trạng thái ứng viên sang `OFFERED` hoặc `HIRED`.
  - Trong biến động nhân sự & quy hoạch: Đề xuất của `MANAGER` luôn ở trạng thái chờ duyệt (`PENDING` / `REVIEWING`), không được tự phê duyệt.
- **Giới hạn của `HR`**: Không được tạo hoặc nâng quyền tài khoản lên `BOD` hoặc `SYSTEM_ADMIN`.
- **Giải ngân bảng lương hàng loạt (`bulkDisbursePayrolls`)**: Chỉ `BOD` và `SYSTEM_ADMIN` có quyền phê duyệt giải ngân (`PAID`).

## 2. Quy tắc Hồ sơ, Phòng ban & Xóa mềm (Soft-Archive)
- Bổ nhiệm Trưởng phòng (`managerId`) tự động nâng vai trò `USER` -> `MANAGER` và đồng bộ `departmentId`.
- Xóa nhân sự đã có dữ liệu lịch sử (lương, công, hợp đồng, nghỉ phép, KPI) bắt buộc **chuyển trạng thái sang `RESIGNED`** (xóa mềm), chấm dứt hợp đồng (`TERMINATED`) và gỡ chức Trưởng phòng, tuyệt đối không xóa vật lý.

## 3. Quy tắc Chấm công & Nghỉ phép
- Ngày chấm công chuẩn hóa theo múi giờ `Asia/Ho_Chi_Minh` (`toUtcDateOnly`).
- Check-in sau **08:30** giờ Việt Nam bị ghi nhận trạng thái `LATE` (kèm `AuditLog` mức `WARNING`).
- Làm việc trên 5 giờ/ngày tự động trừ 1 giờ nghỉ trưa; phần vượt quá 8 giờ/ngày tính vào giờ tăng ca (OT).
- Đơn nghỉ phép tự động loại trừ Thứ Bảy và Chủ Nhật (`calculateWorkingDays`). Khi `APPROVED`, tự động sinh bản ghi `Attendance` trạng thái `LEAVE`; khi hủy/từ chối, tự động thu hồi bản ghi `LEAVE` chưa Check-in.

## 4. Quy tắc Tính lương, Bảo hiểm, Thuế TNCN & KPI
- **Ngày công chuẩn**: `22` ngày/tháng. Không cho phép chạy bảng lương cho tháng tương lai hoặc ghi đè phiếu lương đã `PAID`.
- **Bảo hiểm bắt buộc**: Tổng **10.5%** (`BHXH 8%` + `BHYT 1.5%` + `BHTN 1%`) tính trên lương cơ bản theo ngày công thực tế.
- **Thuế TNCN (PIT)**: Biểu thuế lũy tiến từng phần 7 bậc (5% -> 35%) sau khi trừ giảm trừ bản thân `11,000,000 VNĐ`, bảo hiểm bắt buộc và phụ cấp ăn trưa miễn thuế (tối đa `730,000 VNĐ`).
- **Tích hợp KPI**: Trọng số `50% - 25% - 25%`. Xếp hạng `A (>=90): +25%`, `B (75-89.9): +10%`, `C (60-74.9): 0%`, `D (<60): -10%`.