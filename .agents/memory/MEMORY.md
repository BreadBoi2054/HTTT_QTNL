---
title: "MEMORY — Chỉ mục Bộ nhớ AI (HTTT_QTNL)"
tags:
  - ai-memory
  - index
  - httt-qtnl
created: 2026-10-14
updated: 2026-10-14
---

# Memory Index — NEXUSTECH HRMIS (`HTTT_QTNL`)

> Bộ nhớ liên phiên chuẩn `memory-system`, được liên kết trực tiếp (Directory Junction) vào **Obsidian Vault** tại `AI Memory (HTTT_QTNL)`.

## User
- [user] Sử dụng Windows 11, PowerShell, giao tiếp tiếng Việt trực diện, súc tích → [[user-preferences|user-preferences.md]]
- [user] Sử dụng Obsidian Vault tại `C:\Users\bread\OneDrive\Documents\Obsidian Vault` làm Second Brain kết nối với AI → [[user-preferences|user-preferences.md]]

## Project
- [project] Hệ thống Quản trị Nguồn nhân lực NEXUSTECH HRMIS (`HTTT_QTNL`) gồm 17 bảng Prisma, 8 Services, 33 API endpoints → [[tech-decisions|tech-decisions.md]]
- [project] Tech stack: Next.js 16.3.1 (App Router), React 19.2.8, Prisma 7.9.1 (`@prisma/adapter-pg`), NextAuth v5 (`jwt`), Tailwind v4 → [[tech-decisions|tech-decisions.md]]
- [project] Phân quyền RBAC 6 vai trò: `SYSTEM_ADMIN`, `BOD`, `HR`, `ACCOUNTANT`, `MANAGER`, `USER` kèm giới hạn phạm vi dữ liệu (Data Scoping) → [[project-conventions|project-conventions.md]]
- [project] Quy tắc xóa mềm nhân sự (Soft-Archive sang `RESIGNED`) khi đã phát sinh bảng lương, chấm công, hợp đồng, nghỉ phép hoặc KPI → [[project-conventions|project-conventions.md]]
- [project] Công thức tính lương chuẩn VN: 22 ngày công chuẩn, BHXH/BHYT/BHTN 10.5%, Thuế TNCN lũy tiến 7 bậc (giảm trừ 11tr, ăn trưa miễn thuế 730k), OT 150%, tích hợp thưởng/phạt KPI → [[project-conventions|project-conventions.md]]
- [project] Chấm công chuẩn hóa múi giờ `Asia/Ho_Chi_Minh` (sau 08:30 tính `LATE`) và đồng bộ 2 chiều với đơn nghỉ phép `APPROVED` → [[project-conventions|project-conventions.md]]
- [project] Tự động Onboarding 6 bước khi chuyển hồ sơ ứng viên sang `HIRED` (tạo User, EmployeeProfile `PROBATION`, SalaryConfig, HĐTV 02 tháng, Quyết định `NEW_HIRE`, tự đóng Job khi đủ headcount) → [[project-conventions|project-conventions.md]]

## Reference
- [reference] Tài liệu kiến trúc đầy đủ trong Obsidian Vault → [[00 - Dashboard (MOC)]]
- [reference] Sơ đồ 17 bảng CSDL PostgreSQL → [[02 - Cơ sở dữ liệu & ERD (Database Schema)]]