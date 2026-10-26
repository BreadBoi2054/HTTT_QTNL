# UI Polish & Bolder Redesign Plan (HTTT_QTNL)

## Goal
Sửa triệt để lỗi hỏng dấu tiếng Việt (`?`), chuẩn hóa hệ thống màu sắc Swiss Cobalt Blue + hình học `rounded-xl`, phá vỡ bố cục rập khuôn "4 ô KPI + Bảng" trên các phân hệ trọng tâm (`P0-B`), giữ bản sắc Swiss Cobalt Blue tinh lọc bỏ Indigo/Gradient (`P1-A`), và nâng cấp Custom Confirm Modal + Skeleton Loading toàn cục (`P2-A`).

## Tasks
- [x] Task 1: Khôi phục mã hóa tiếng Việt UTF-8 bị hỏng (`?`) tại `Header.tsx`, `PayrollModal.tsx`, `payroll/page.tsx`, `PayslipDetailModal.tsx`, `personnel-changes/page.tsx`, `cadre-planning/page.tsx` → Verify: Grep không còn chuỗi `?` lỗi dấu trong `src/`.
- [x] Task 2: Nâng cấp `ToastProvider.tsx` (bổ sung Custom Confirm Modal `window.confirm` / `useConfirm` + `TableSkeleton` dùng chung) và chuẩn hóa `100dvh` + animation classes tại `globals.css`, `dashboard/layout.tsx`, `Sidebar.tsx`, `login/page.tsx`, `careers/` → Verify: Không còn popup `window.confirm` thô cứng và `h-screen`.
- [x] Task 3: Tái cấu trúc bố cục `/bolder` & tinh lọc màu `/quieter` cho `dashboard/page.tsx` (Executive Command Split), `payroll/page.tsx` (Financial Ledger Strip + `overflow-x-auto`), `recruitment/page.tsx` (Pipeline Funnel Strip), `my-workspace/page.tsx`, `performance/page.tsx`, `training-surveys/page.tsx` (bỏ Indigo/Gradient/Rainbow cards & Eyebrow thừa) → Verify: Kiểm tra JSX bố cục mới và grep không còn `indigo-`.
- [x] Task 4: Đồng bộ bo góc (`rounded-xl`/`rounded-full`), thay thế Emoji (`📅`, `⭐`) bằng Lucide Icons, áp dụng Custom Confirm & Skeleton cho `EmployeeModal.tsx`, `employees/page.tsx`, `contracts/page.tsx`, `leave/page.tsx`, `departments/page.tsx`, `attendance/page.tsx`, `audit-workflow/page.tsx`, `roles/page.tsx`, `guide/page.tsx`, `payroll/components/page.tsx` → Verify: Tất cả input/badge đồng nhất bo góc và có Skeleton state.
- [x] Task 5: Chạy kiểm định chất lượng (`npx tsc --noEmit`, `npm run lint`, `ux_audit.py`, `accessibility_checker.py`) → Verify: 0 lỗi TypeScript/Build và pass kiểm định UI.

## Done When
- [x] 0 chuỗi tiếng Việt bị lỗi dấu `?` trên toàn bộ UI và dữ liệu Phiếu lương.
- [x] 0 màu `indigo-*` hoặc gradient AI lệch chuẩn; 0 thẻ KPI cầu vồng; các trang chính có bố cục đặc trưng riêng.
- [x] Toàn bộ input, badge, bảng lương 9 cột (`overflow-x-auto`), Skeleton loader và Custom Confirm Modal hoạt động đồng bộ, pass `tsc` & `lint`.
