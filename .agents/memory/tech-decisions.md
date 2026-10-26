---
type: project
tags:
  - ai-memory
  - tech-decisions
  - architecture
created: 2026-10-14
updated: 2026-10-14
---

# Tech Decisions — NEXUSTECH HRMIS (`HTTT_QTNL`)

⬅️ Quay lại: [[MEMORY]] | [[00 - Dashboard (MOC)]] | Xem thêm: [[01 - Kiến trúc Hệ thống (System Architecture)]]

## 1. Framework & Giao diện
- **Next.js `16.3.1` (App Router) + React `19.2.8`**: Tách biệt rõ các trang quản trị nội bộ (`/dashboard/**`), cổng tự phục vụ nhân viên (`/dashboard/my-workspace`) và cổng tuyển dụng công khai (`/careers/**`).
- **Tailwind CSS v4 (`@tailwindcss/postcss`)**: Kết hợp `lucide-react`, `recharts` cho biểu đồ thống kê điều hành và `next-themes` hỗ trợ giao diện Sáng/Tối.

## 2. Cơ sở dữ liệu & ORM
- **PostgreSQL + Prisma ORM `7.9.1`**:
  - Sử dụng `@prisma/adapter-pg` kết hợp `pg.Pool` tại `src/lib/prisma.ts` theo mẫu Singleton để giữ kết nối ổn định trong quá trình phát triển (Hot Reload).
  - Các nghiệp vụ liên bảng (tạo nhân sự, xóa mềm nhân sự, duyệt nghỉ phép, tính lương, tiếp nhận ứng viên `HIRED`, duyệt quyết định biến động) bắt buộc chạy trong `prisma.$transaction`.

## 3. Xác thực & Bảo mật (`src/auth.ts`)
- **NextAuth v5 (`5.0.0-beta.32`)**:
  - Sử dụng `Credentials` provider và `bcryptjs`.
  - Chiến lược phiên `strategy: "jwt"`, nhúng `id`, `roleId`, `roleName`, `employeeId` vào token và session.
  - Hỗ trợ đăng nhập linh hoạt qua 2 tên miền nội bộ (`@nexustech.vn` và `@hrmis.com`).
  - **Chặn đăng nhập tức thời**: Tài khoản có `EmployeeProfile.status` là `RESIGNED` hoặc `SUSPENDED` bị từ chối ngay tại tầng `authorize` và khi làm mới JWT.

## 4. Kiến trúc Phân tầng (4-Tier Architecture)
1. **Presentation Layer**: `src/app/**/page.tsx` & `src/components/**`
2. **Controller / API Layer**: 33 Route Handlers tại `src/app/api/**/route.ts` kiểm tra `auth()` và RBAC
3. **Business Service Layer**: 8 Service tại `src/services/*.service.ts`
4. **Data Access Layer**: `src/lib/prisma.ts` & `prisma/schema.prisma` (17 Models)