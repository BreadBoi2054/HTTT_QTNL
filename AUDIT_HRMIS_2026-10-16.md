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

## Rủi ro nghiệp vụ còn cần quyết định

1. Đã thay 22 ngày cố định bằng lịch làm việc từng tháng, trừ cuối tuần và ngày lễ 2026. Các năm khác phải cấu hình `PAYROLL_HOLIDAYS_YYYY` trong môi trường trước khi tính lương/phép; lịch 2026 có thể ghi đè nếu doanh nghiệp chọn lịch Tết hoặc Quốc khánh khác, hoặc có ngày nghỉ riêng. Chưa có giao diện quản trị lịch và chưa xử lý ngày làm bù cuối tuần.
2. Đã thêm đơn OT `PENDING → APPROVED/REJECTED`, cấm tự duyệt, kiểm tra phạm vi quản lý và chỉ đưa OT đã duyệt vào bảng lương tự động. Hệ số đang dùng 150% ngày thường, 200% cuối tuần, 300% ngày lễ. Cần rà soát thêm ca đêm, nghỉ bù, giới hạn OT và chứng từ/chấm công trước khi vận hành thật.
3. Nghỉ ốm đã được tách khỏi ngày công công ty trả lương. Ứng dụng hiện chỉ hiển thị số ngày; số tiền trợ cấp và hồ sơ BHXH phải do bộ phận nhân sự đối chiếu, chưa được tự động chi trả.
4. Mức đóng bảo hiểm, nền tính đóng và khoản miễn thuế vẫn mã hóa trong công thức. Kế toán/HR cần duyệt bảng quy tắc cho từng kỳ, đặc biệt trường hợp nghỉ không hưởng lương dài ngày và mức đóng BHXH theo hợp đồng. Trạng thái `PAID` chỉ là ghi nhận trong ứng dụng; không có tích hợp chuyển tiền.
5. Bảng chấm công chưa ghi nguồn gốc bản ghi `LEAVE`; khi rút đơn đã duyệt, hệ thống chưa phân biệt chắc chắn ngày công do đơn tạo với ngày `LEAVE` được nhập thủ công từ trước.
6. Chưa có kiểm thử tích hợp trong cơ sở dữ liệu thử nghiệm riêng và chưa chạy quy trình tạo/duyệt OT/tính lương từ đầu đến cuối trên dữ liệu cách ly.
7. Chạy tính lương tự động cho nhiều nhân viên vẫn lưu từng phiếu lần lượt; nếu một phiếu lỗi giữa chừng, những phiếu trước đó đã được cập nhật. Cần cơ chế lô có thể kiểm tra và chạy lại an toàn.

## Cập nhật theo chính sách công ty (16/10/2026)

- Người dùng xác nhận công chuẩn theo ngày làm việc thực tế từng tháng, trừ cuối tuần/ngày lễ; OT cần duyệt; nghỉ ốm theo BHXH.
- Đã cập nhật công thức lương, phép, biểu mẫu nhập lương, trang sổ lương và hướng dẫn. Đã thêm migration `20261016000000_overtime_approval` và áp dụng thành công vào PostgreSQL cục bộ.
- `npx tsc --noEmit`: đạt. `npx tsx --test tests/business-rules.test.ts`: 7/7 đạt. `npm run build`: đạt, tạo 44 trang tĩnh và các route động mới.
- Lịch 2026 dựa trên [thông báo nghỉ Tết](https://xaydungchinhsach.chinhphu.vn/lich-nghi-tet-nguyen-dan-2026-cua-hoc-sinh-giao-vien-can-bo-cong-chuc-vien-chuc-tp-ha-noi-119251217121327126.htm), [nghỉ bù Giỗ Tổ](https://xaydungchinhsach.chinhphu.vn/lich-nghi-le-gio-to-hung-vuong-30-4-1-5-quoc-khanh-2-9-nam-2026-119260222115822151.htm), [Quốc khánh](https://xaydungchinhsach.chinhphu.vn/thong-bao-lich-nghi-le-quoc-khanh-2026-119260729092042494.htm) và [Ngày Văn hóa Việt Nam](https://xaydungchinhsach.chinhphu.vn/ngay-24-11-hang-nam-la-ngay-van-hoa-viet-nam-nguoi-lao-dong-duoc-nghi-huong-nguyen-luong-119260113152642414.htm). Doanh nghiệp cần xác nhận lựa chọn ngày 1/9 hay 3/9 và các ngày hoán đổi riêng.

**Kết luận:** Các lỗi phân quyền và phép tính rõ ràng tìm thấy trong lần rà soát này đã được sửa, nhưng chưa đủ bằng chứng để khẳng định toàn bộ nghiệp vụ nhân sự và bảng lương đã sẵn sàng cho vận hành thực tế. Các quy tắc trong mục trên cần được người phụ trách nghiệp vụ xác nhận.
