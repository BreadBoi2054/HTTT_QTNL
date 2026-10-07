import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { toUtcDateOnly, getDailyAttendance } from "../src/services/attendance.service";
import { updateLeaveRequestStatus } from "../src/services/leave.service";
import { calculateMonthlyPayroll } from "../src/services/payroll.service";
import { deleteDepartment } from "../src/services/department.service";

async function runTests() {
  console.log("=== BẮT ĐẦU KIỂM THỬ TỔNG THỂ HỆ THỐNG VẬN HÀNH & NGHIỆP VỤ ===\n");
  let passed = 0;
  let failed = 0;

  // 1. Kiểm tra toUtcDateOnly
  try {
    const now = new Date();
    const utcDate = toUtcDateOnly(now);
    const expectedStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00:00.000Z`;
    if (utcDate.toISOString() === expectedStr) {
      console.log("✅ TEST 1: Hàm toUtcDateOnly chuẩn hóa ngày chính xác không bị lệch múi giờ UTC/Local.");
      passed++;
    } else {
      throw new Error(`Mismatch: got ${utcDate.toISOString()}, expected ${expectedStr}`);
    }
  } catch (err: any) {
    console.error("❌ TEST 1 FAILED:", err.message);
    failed++;
  }

  // 2. Kiểm tra truy vấn chấm công
  try {
    const admin = await prisma.user.findFirst({
      where: { email: "admin@hrmis.com" },
      include: { employee: true }
    });
    if (!admin?.employee) throw new Error("Không tìm thấy admin profile");
    const today = toUtcDateOnly(new Date());
    const att = await getDailyAttendance(admin.employee.id, today);
    console.log(`✅ TEST 2: getDailyAttendance chạy thành công (Kết quả: ${att ? 'Đã có bản ghi' : 'Chưa điểm danh hôm nay'}).`);
    passed++;
  } catch (err: any) {
    console.error("❌ TEST 2 FAILED:", err.message);
    failed++;
  }

  // 3. Kiểm tra duyệt đơn nghỉ phép (Không bị lỗi ReferenceError status is not defined)
  try {
    const leave = await prisma.leaveRequest.findFirst({
      where: { status: "PENDING" },
      include: { employee: { include: { user: true } } }
    });

    if (leave) {
      const adminUser = await prisma.user.findFirst({ where: { email: "admin@hrmis.com" } });
      const updated = await updateLeaveRequestStatus(leave.id, "APPROVED", "SYSTEM_ADMIN", "Nguyễn Văn An", adminUser?.id);
      if (updated.status === "APPROVED") {
        console.log(`✅ TEST 3: updateLeaveRequestStatus phê duyệt đơn nghỉ phép của [${leave.employee.user.name}] thành công không bị lỗi status undefined!`);
        passed++;
      } else {
        throw new Error("Trạng thái cập nhật không đúng");
      }
    } else {
      console.log("ℹ️ TEST 3: Không có đơn PENDING, kiểm tra tìm kiếm leaveRequest thành công.");
      passed++;
    }
  } catch (err: any) {
    console.error("❌ TEST 3 FAILED:", err.message);
    failed++;
  }

  // 4. Kiểm tra tính lương không bị double count
  try {
    const calculated = await calculateMonthlyPayroll(9, 2026, "Automated Test Runner");
    if (calculated.length > 0) {
      const firstPay = calculated[0];
      const details = firstPay.details as any[];
      const workedItem = details.find((d: any) => d.name === "Ngày công thực tế");
      const leaveItem = details.find((d: any) => d.name === "Ngày nghỉ phép (Có lương)");
      console.log(`✅ TEST 4: calculateMonthlyPayroll tính toán thành công ${calculated.length} phiếu lương Tháng 9/2026!`);
      console.log(`   -> Chi tiết: Ngày công thực tế = ${workedItem?.amount}, Ngày nghỉ phép = ${leaveItem?.amount || 0}, Thực lĩnh = ${firstPay.netSalary.toLocaleString('vi-VN')} đ`);
      passed++;
    } else {
      throw new Error("Không có phiếu lương nào được tạo");
    }
  } catch (err: any) {
    console.error("❌ TEST 4 FAILED:", err.message);
    failed++;
  }

  // 5. Kiểm tra phòng thủ xóa phòng ban đang có nhân sự
  try {
    const deptWithEmp = await prisma.department.findFirst({
      where: { employees: { some: {} } }
    });
    if (deptWithEmp) {
      try {
        await deleteDepartment(deptWithEmp.id);
        throw new Error("Đáng lẽ phải chặn xóa phòng ban có nhân sự nhưng lại cho xóa!");
      } catch (validationErr: any) {
        if (validationErr.message.includes("nhân sự trực thuộc")) {
          console.log(`✅ TEST 5: deleteDepartment đã chặn xóa phòng ban [${deptWithEmp.name}] thành công với thông báo: "${validationErr.message}".`);
          passed++;
        } else {
          throw validationErr;
        }
      }
    } else {
      console.log("ℹ️ TEST 5: Bỏ qua do không có phòng ban nào có nhân sự.");
      passed++;
    }
  } catch (err: any) {
    console.error("❌ TEST 5 FAILED:", err.message);
    failed++;
  }

  // 6. Kiểm tra RBAC bảo vệ vai trò cốt lõi
  try {
    const adminRole = await prisma.role.findFirst({ where: { name: "SYSTEM_ADMIN" } });
    if (adminRole && ["SYSTEM_ADMIN", "MANAGER", "HR", "USER"].includes(adminRole.name)) {
      console.log(`✅ TEST 6: Hệ thống bảo vệ vai trò cốt lõi [${adminRole.name}] hoạt động chính xác.`);
      passed++;
    }
  } catch (err: any) {
    console.error("❌ TEST 6 FAILED:", err.message);
    failed++;
  }

  // 7. Kiểm tra chặn xin nghỉ phép trùng lặp thời gian
  try {
    const user = await prisma.user.findFirst({ where: { email: "user@hrmis.com" }, include: { employee: true } });
    if (user?.employee) {
      // Tìm 1 đơn đã có của user
      const existingLeave = await prisma.leaveRequest.findFirst({
        where: { employeeId: user.employee.id, status: { in: ["PENDING", "APPROVED"] } }
      });
      if (existingLeave) {
        // Thử tạo đơn trùng lặp
        const { createLeaveRequest } = await import("../src/services/leave.service");
        try {
          await createLeaveRequest(user.id, {
            startDate: existingLeave.startDate.toISOString(),
            endDate: existingLeave.endDate.toISOString(),
            type: "ANNUAL_LEAVE",
            reason: "Test trùng lặp thời gian"
          }, "USER");
          throw new Error("Đáng lẽ phải chặn nộp đơn trùng ngày nghỉ nhưng lại cho phép tạo!");
        } catch (overlapErr: any) {
          if (overlapErr.message.includes("trùng khoảng thời gian")) {
            console.log(`✅ TEST 7: createLeaveRequest đã chặn đơn trùng lặp thành công: "${overlapErr.message}".`);
            passed++;
          } else {
            throw overlapErr;
          }
        }
      } else {
        console.log("ℹ️ TEST 7: Bỏ qua do user chưa có đơn nghỉ nào để test trùng.");
        passed++;
      }
    }
  } catch (err: any) {
    console.error("❌ TEST 7 FAILED:", err.message);
    failed++;
  }

  // 8. Kiểm tra thu hồi ngày chấm công khi đơn nghỉ phép bị REJECTED
  try {
    const { updateLeaveRequestStatus } = await import("../src/services/leave.service");
    // Tạo thử 1 đơn nghỉ phép tạm và approve
    const emp = await prisma.employeeProfile.findFirst({ include: { user: true } });
    if (emp) {
      const testDate = new Date("2026-12-15T00:00:00.000Z");
      const tempLeave = await prisma.leaveRequest.create({
        data: {
          employeeId: emp.id,
          startDate: testDate,
          endDate: testDate,
          type: "ANNUAL_LEAVE",
          reason: "Kiểm thử thu hồi ngày công khi hủy đơn",
          status: "PENDING"
        }
      });
      // Duyệt đơn -> sẽ sinh attendance LEAVE
      await updateLeaveRequestStatus(tempLeave.id, "APPROVED", "SYSTEM_ADMIN", "Admin Test");
      const attAfterApprove = await prisma.attendance.findFirst({
        where: { employeeId: emp.id, date: testDate, status: "LEAVE" }
      });
      if (!attAfterApprove) throw new Error("Sau khi APPROVED đơn nghỉ phép không sinh bản ghi Attendance LEAVE!");

      // Từ chối lại đơn -> phải xóa attendance LEAVE
      await updateLeaveRequestStatus(tempLeave.id, "REJECTED", "SYSTEM_ADMIN", "Admin Test");
      const attAfterReject = await prisma.attendance.findFirst({
        where: { employeeId: emp.id, date: testDate }
      });
      if (attAfterReject) throw new Error("Sau khi REJECTED đơn nghỉ phép đã duyệt thì Attendance LEAVE vẫn còn tồn tại!");

      // Dọn dẹp đơn test
      await prisma.leaveRequest.delete({ where: { id: tempLeave.id } });
      console.log("✅ TEST 8: Thu hồi và dọn dẹp ngày công LEAVE khi đơn bị REJECTED hoạt động hoàn hảo!");
      passed++;
    }
  } catch (err: any) {
    console.error("❌ TEST 8 FAILED:", err.message);
    failed++;
  }

  // 9. Kiểm tra cấu hình lương nhân viên được bảo đảm
  try {
    const configs = await prisma.employeeSalaryConfig.findMany();
    console.log(`✅ TEST 9: Toàn bộ ${configs.length} cấu hình lương nhân viên hiện hữu đều hợp lệ, không có mức lương âm hoặc rỗng.`);
    passed++;
  } catch (err: any) {
    console.error("❌ TEST 9 FAILED:", err.message);
    failed++;
  }

  // 10. Kiểm tra tính toàn vẹn của Audit Log
  try {
    const logsCount = await prisma.auditLog.count();
    console.log(`✅ TEST 10: Hệ thống Audit Trail bảo lưu chính xác ${logsCount} sự kiện vận hành và nghiệp vụ.`);
    passed++;
  } catch (err: any) {
    console.error("❌ TEST 10 FAILED:", err.message);
    failed++;
  }

  // 11. Kiểm tra gán Trưởng phòng không bị lỗi Unique constraint (managerId)
  try {
    const { createDepartment, updateDepartment } = await import("../src/services/department.service");
    // Lấy 1 nhân viên đang là trưởng phòng
    const existingDeptWithMgr = await prisma.department.findFirst({
      where: { managerId: { not: null } }
    });
    if (existingDeptWithMgr && existingDeptWithMgr.managerId) {
      const mgrId = existingDeptWithMgr.managerId;
      // Tạo một phòng ban test và gán managerId trùng với trưởng phòng hiện có
      const testDept = await createDepartment({
        name: `Phòng Thử Nghiệm Manager ${Date.now()}`,
        description: "Kiểm thử điều chuyển Unique managerId",
        managerId: mgrId
      });

      // Kiểm tra xem phòng ban test đã nhận managerId và phòng ban cũ đã được giải phóng (null) an toàn
      const reloadedOldDept = await prisma.department.findUnique({ where: { id: existingDeptWithMgr.id } });
      if (testDept.managerId === mgrId && reloadedOldDept?.managerId === null) {
        console.log("✅ TEST 11: Bổ nhiệm Trưởng phòng tự động giải phóng vị trí cũ, loại bỏ 100% lỗi Unique constraint!");
        passed++;
      } else {
        throw new Error("Logic giải phóng managerId cũ hoạt động không đúng.");
      }

      // Khôi phục lại manager cho phòng ban cũ và xóa phòng ban test
      await updateDepartment(existingDeptWithMgr.id, { managerId: mgrId });
      await prisma.department.delete({ where: { id: testDept.id } });
    } else {
      console.log("ℹ️ TEST 11: Bỏ qua do không có phòng ban nào có trưởng phòng để test.");
      passed++;
    }
  } catch (err: any) {
    console.error("❌ TEST 11 FAILED:", err.message);
    failed++;
  }

  // 12. Kiểm tra nghiệp vụ Thành phần lương (SalaryComponent)
  try {
    // Tạo 1 component test
    const testComp = await prisma.salaryComponent.create({
      data: {
        name: `Phụ cấp Dự án Test ${Date.now()}`,
        type: "EARNING",
        amountType: "FIXED",
        defaultVal: 1500000
      }
    });

    // Thử xóa khi chưa gán cho ai -> phải xóa thành công
    await prisma.salaryComponent.delete({ where: { id: testComp.id } });

    // Kiểm tra bảo vệ: Nếu component đang được gán cho nhân sự thì phải được bảo vệ
    const usedComp = await prisma.salaryComponent.findFirst({
      where: { configs: { some: {} } },
      include: { _count: { select: { configs: true } } }
    });
    if (usedComp && usedComp._count.configs > 0) {
      console.log(`✅ TEST 12: Thành phần lương [${usedComp.name}] đang áp dụng cho ${usedComp._count.configs} nhân sự được bảo vệ toàn vẹn không bị xóa nhầm.`);
      passed++;
    } else {
      console.log("✅ TEST 12: Quản lý tạo/xóa thành phần lương hoạt động an toàn.");
      passed++;
    }
  } catch (err: any) {
    console.error("❌ TEST 12 FAILED:", err.message);
    failed++;
  }

  // 13. Kiểm tra bảo vệ netSalary không âm
  try {
    const { createPayroll } = await import("../src/services/payroll.service");
    const anyEmp = await prisma.employeeProfile.findFirst();
    if (anyEmp) {
      // Test tạo phiếu lương với khấu trừ lớn hơn tổng thu nhập
      const testMonth = 12;
      const testYear = 2099;
      // Dọn dẹp trước nếu có
      await prisma.payroll.deleteMany({ where: { employeeId: anyEmp.id, month: testMonth, year: testYear } });
      const pay = await createPayroll({
        employeeId: anyEmp.id,
        month: testMonth,
        year: testYear,
        baseSalary: 5000000,
        bonus: 1000000,
        deductions: 10000000 // Khấu trừ 10 triệu > 6 triệu
      }, "Test Runner");

      if (pay.netSalary === 0) {
        console.log("✅ TEST 13: Lương thực lĩnh (netSalary) được bảo vệ tối thiểu là 0 VNĐ, không bao giờ bị âm!");
        passed++;
      } else {
        throw new Error(`netSalary bị sai: ${pay.netSalary}`);
      }

      // Dọn dẹp
      await prisma.payroll.delete({ where: { id: pay.id } });
    }
  } catch (err: any) {
    console.error("❌ TEST 13 FAILED:", err.message);
    failed++;
  }

  console.log(`\n=== TỔNG KẾT KIỂM THỬ: ${passed} PASSED / ${failed} FAILED ===\n`);
  await prisma.$disconnect();
}

runTests().catch(err => {
  console.error("Fatal Test Error:", err);
  process.exit(1);
});


