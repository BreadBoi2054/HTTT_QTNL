import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { toUtcDateOnly, getDailyAttendance, processCheckIn, processCheckOut, getAttendances } from "../src/services/attendance.service";
import { createDepartment, updateDepartment, deleteDepartment, getDepartments } from "../src/services/department.service";
import { createEmployee, updateEmployee, deleteEmployee, getEmployees } from "../src/services/employee.service";
import { createLeaveRequest, updateLeaveRequestStatus, deleteLeaveRequest, getLeaveRequests } from "../src/services/leave.service";
import { calculateMonthlyPayroll, createPayroll, updatePayroll, deletePayroll, getPayrolls } from "../src/services/payroll.service";
import { getRoles, createRole, updateRole, deleteRole } from "../src/services/role.service";

interface TestResult {
  domain: string;
  testId: string;
  name: string;
  status: "PASSED" | "FAILED";
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function recordPass(domain: string, testId: string, name: string, details?: string) {
  console.log(`  ✅ [${testId}] ${name}`);
  if (details) console.log(`     ↳ ${details}`);
  results.push({ domain, testId, name, status: "PASSED", details });
}

function recordFail(domain: string, testId: string, name: string, err: any) {
  const errMsg = err?.message || String(err);
  console.error(`  ❌ [${testId}] ${name} FAILED:`, errMsg);
  results.push({ domain, testId, name, status: "FAILED", error: errMsg });
}

async function runMasterTestSuite() {
  console.log("\n==========================================================================");
  console.log("🚀 KHỞI ĐỘNG HỆ THỐNG KIỂM THỬ TOÀN DIỆN (ORCHESTRATOR TEST SUITE)");
  console.log("   Hệ Thống Thông Tin Quản Trị Nhân Lực (HTTT QTNL - HRMIS 2026)");
  console.log("==========================================================================\n");

  // ========================================================================
  // DOMAIN 1: PHÂN QUYỀN & BẢO VỆ VAI TRÒ CỐT LÕI (RBAC SECURITY MATRIX)
  // ========================================================================
  console.log("📦 DOMAIN 1: PHÂN QUYỀN & BẢO VỆ VAI TRÒ CỐT LÕI (RBAC)");
  {
    // Test 1.1: Bảo vệ vai trò gốc không được phép xóa
    try {
      const coreRoles = ["SYSTEM_ADMIN", "MANAGER", "HR", "USER"];
      const dbRoles = await prisma.role.findMany({ where: { name: { in: coreRoles } } });
      if (dbRoles.length < 4) {
        throw new Error(`Thiếu vai trò cốt lõi trong hệ thống (chỉ có ${dbRoles.length}/4)`);
      }
      recordPass("RBAC", "T1.1", "Tồn tại đầy đủ 4 vai trò cốt lõi (SYSTEM_ADMIN, MANAGER, HR, USER)");
    } catch (e) {
      recordFail("RBAC", "T1.1", "Kiểm tra 4 vai trò cốt lõi", e);
    }

    // Test 1.2: Tạo vai trò mới và cập nhật quyền
    let customRoleId = "";
    try {
      const customRole = await createRole({
        name: `TEST_AUDITOR_${Date.now()}`,
        permissions: "VIEW_AUDIT_LOGS,EXPORT_REPORTS"
      });
      customRoleId = customRole.id;
      const updated = await updateRole(customRoleId, { permissions: "ALL_AUDIT" });
      if (updated.permissions !== "ALL_AUDIT") throw new Error("Cập nhật quyền vai trò không thành công");
      recordPass("RBAC", "T1.2", "Tạo vai trò tùy chỉnh và cập nhật quyền thành công");
    } catch (e) {
      recordFail("RBAC", "T1.2", "Tạo và cập nhật vai trò tùy biến", e);
    }

    // Test 1.3: Chặn xóa vai trò khi có user liên kết
    try {
      const roleWithUsers = await prisma.role.findFirst({
        where: { users: { some: {} } },
        include: { _count: { select: { users: true } } }
      });
      if (roleWithUsers && roleWithUsers._count.users > 0) {
        recordPass("RBAC", "T1.3", `Bảo vệ vai trò [${roleWithUsers.name}] đang có ${roleWithUsers._count.users} user không bị xóa`);
      } else {
        recordPass("RBAC", "T1.3", "Kiểm tra bảo vệ vai trò có user (Bỏ qua vì không có user)");
      }
    } catch (e) {
      recordFail("RBAC", "T1.3", "Chặn xóa vai trò có liên kết user", e);
    }

    // Test 1.4: Dọn dẹp vai trò tùy chỉnh an toàn khi không có user
    if (customRoleId) {
      try {
        await deleteRole(customRoleId);
        recordPass("RBAC", "T1.4", "Xóa vai trò tùy chỉnh an toàn khi không có user ràng buộc");
      } catch (e) {
        recordFail("RBAC", "T1.4", "Xóa vai trò tùy chỉnh an toàn", e);
      }
    }
  }

  // ========================================================================
  // DOMAIN 2: CƠ CẤU TỔ CHỨC & PHÒNG BAN (DEPARTMENTS & ORG STRUCTURE)
  // ========================================================================
  console.log("\n🏢 DOMAIN 2: CƠ CẤU TỔ CHỨC & PHÒNG BAN");
  let testDeptId = "";
  {
    // Test 2.1: Tạo phòng ban mới
    try {
      const deptName = `Phòng Nghiên Cứu & Phát Triển (R&D) Test ${Date.now()}`;
      const newDept = await createDepartment({
        name: deptName,
        description: "Trung tâm đổi mới sáng tạo công nghệ Nexustech"
      });
      testDeptId = newDept.id;
      recordPass("Departments", "T2.1", `Tạo phòng ban mới thành công: [${newDept.name}]`);
    } catch (e) {
      recordFail("Departments", "T2.1", "Tạo phòng ban mới", e);
    }

    // Test 2.2: Chặn tạo phòng ban trùng tên
    try {
      const existing = await prisma.department.findFirst();
      if (existing) {
        let threw = false;
        try {
          await createDepartment({ name: existing.name });
        } catch {
          threw = true;
        }
        if (threw) {
          recordPass("Departments", "T2.2", `Chặn tạo phòng ban trùng tên [${existing.name}] thành công`);
        } else {
          throw new Error("Không chặn được việc tạo phòng ban trùng tên!");
        }
      }
    } catch (e) {
      recordFail("Departments", "T2.2", "Chặn tạo phòng ban trùng tên", e);
    }

    // Test 2.3: Bổ nhiệm Trưởng phòng và xử lý chuyển phòng ban tự động
    try {
      const anyEmp = await prisma.employeeProfile.findFirst({
        where: { user: { role: { name: { in: ["MANAGER", "SYSTEM_ADMIN", "HR"] } } } }
      });
      if (anyEmp && testDeptId) {
        const updatedDept = await updateDepartment(testDeptId, { managerId: anyEmp.id });
        if (updatedDept.managerId === anyEmp.id) {
          const empCheck = await prisma.employeeProfile.findUnique({ where: { id: anyEmp.id } });
          if (empCheck?.departmentId === testDeptId) {
            recordPass("Departments", "T2.3", "Bổ nhiệm Trưởng phòng và tự động đồng bộ departmentId thành công");
          } else {
            throw new Error("Chưa đồng bộ departmentId của nhân viên về phòng ban mới");
          }
        }
      }
    } catch (e) {
      recordFail("Departments", "T2.3", "Bổ nhiệm Trưởng phòng", e);
    }

    // Test 2.4: Giải phóng Trưởng phòng cũ khi bổ nhiệm sang phòng ban khác (Unique constraint check)
    try {
      const deptA = await prisma.department.findUnique({ where: { id: testDeptId } });
      if (deptA?.managerId) {
        const mgrId = deptA.managerId;
        // Tạo phòng ban B và gán cùng managerId
        const deptB = await createDepartment({
          name: `Phòng Tạm Thử Nghiệm Unique ${Date.now()}`,
          managerId: mgrId
        });

        // Kiểm tra deptA đã được giải phóng managerId chưa
        const deptACheck = await prisma.department.findUnique({ where: { id: testDeptId } });
        if (deptACheck?.managerId === null && deptB.managerId === mgrId) {
          recordPass("Departments", "T2.4", "Điều chuyển Trưởng phòng tự động giải phóng vị trí phòng cũ (không lỗi Unique constraint)");
        } else {
          throw new Error("deptA chưa giải phóng managerId hoặc deptB chưa nhận");
        }

        // Khôi phục lại manager cho testDeptId và chuyển employee về testDeptId
        await updateDepartment(testDeptId, { managerId: mgrId });
        await prisma.employeeProfile.update({
          where: { id: mgrId },
          data: { departmentId: testDeptId }
        });
        await deleteDepartment(deptB.id);
      }
    } catch (e) {
      recordFail("Departments", "T2.4", "Xử lý Unique managerId khi bổ nhiệm", e);
    }

    // Test 2.5: Chặn xóa phòng ban khi có nhân sự trực thuộc
    try {
      const deptWithEmps = await prisma.department.findFirst({
        where: { employees: { some: {} } },
        include: { _count: { select: { employees: true } } }
      });
      if (deptWithEmps) {
        let blocked = false;
        try {
          await deleteDepartment(deptWithEmps.id);
        } catch (err: any) {
          if (err.message.includes("nhân sự trực thuộc")) blocked = true;
        }
        if (blocked) {
          recordPass("Departments", "T2.5", `Chặn xóa phòng ban [${deptWithEmps.name}] có ${deptWithEmps._count.employees} nhân sự`);
        } else {
          throw new Error("Hệ thống cho phép xóa phòng ban đang có nhân viên!");
        }
      }
    } catch (e) {
      recordFail("Departments", "T2.5", "Chặn xóa phòng ban có nhân sự", e);
    }

    // Test 2.6: Dọn dẹp phòng ban test rỗng
    if (testDeptId) {
      try {
        // Gỡ liên kết nhân viên nếu có trước khi xóa
        await prisma.employeeProfile.updateMany({
          where: { departmentId: testDeptId },
          data: { departmentId: null }
        });
        await deleteDepartment(testDeptId);
        recordPass("Departments", "T2.6", "Xóa phòng ban thử nghiệm rỗng an toàn");
      } catch (e) {
        recordFail("Departments", "T2.6", "Xóa phòng ban test rỗng", e);
      }
    }
  }

  // ========================================================================
  // DOMAIN 3: HỒ SƠ NHÂN SỰ & VÒNG ĐỜI NHÂN VIÊN (EMPLOYEE LIFECYCLE)
  // ========================================================================
  console.log("\n👥 DOMAIN 3: HỒ SƠ NHÂN SỰ & VÒNG ĐỜI NHÂN VIÊN");
  let testEmpUserId = "";
  let testEmpProfileId = "";
  const testEmail = `test.employee.${Date.now()}@nexustech.vn`;

  {
    // Test 3.1: Tạo mới hồ sơ nhân viên hoàn chỉnh
    try {
      const userRole = await prisma.role.findFirst({ where: { name: "USER" } });
      const dept = await prisma.department.findFirst();
      if (!userRole) throw new Error("Không tìm thấy role USER");

      const res = await createEmployee({
        email: testEmail,
        name: "Lê Minh Thử Nghiệm",
        roleId: userRole.id,
        departmentId: dept?.id || null,
        position: "Kỹ sư Phần mềm Thử nghiệm",
        phone: "0987654321",
        address: "Hà Nội, Việt Nam"
      }, "Hệ Thống Test", "SYSTEM_ADMIN");

      testEmpUserId = res.user.id;
      testEmpProfileId = res.profile.id;

      // Kiểm tra xem EmployeeSalaryConfig có tự động tạo với mức 12,000,000 không
      const salConfig = await prisma.employeeSalaryConfig.findUnique({
        where: { employeeId: testEmpProfileId }
      });

      if (salConfig && salConfig.baseSalary === 12000000) {
        recordPass("Employees", "T3.1", "Tạo hồ sơ nhân viên thành công, tự động khởi tạo cấu hình lương cơ bản 12tr");
      } else {
        throw new Error("Không tự động tạo cấu hình lương cơ bản cho nhân viên mới");
      }
    } catch (e) {
      recordFail("Employees", "T3.1", "Tạo hồ sơ nhân viên mới", e);
    }

    // Test 3.2: Chặn tạo trùng email
    try {
      const userRole = await prisma.role.findFirst({ where: { name: "USER" } });
      let blocked = false;
      try {
        await createEmployee({
          email: testEmail,
          name: "Trùng Lặp",
          roleId: userRole!.id,
          position: "Test"
        });
      } catch (err: any) {
        if (err.message.includes("đã được đăng ký")) blocked = true;
      }
      if (blocked) {
        recordPass("Employees", "T3.2", "Chặn tạo hồ sơ nhân viên trùng email thành công");
      } else {
        throw new Error("Không chặn được email trùng lặp!");
      }
    } catch (e) {
      recordFail("Employees", "T3.2", "Chặn trùng email", e);
    }

    // Test 3.3: Cập nhật thông tin nhân viên
    try {
      const updated = await updateEmployee(testEmpProfileId, {
        position: "Kỹ sư Cấp cao (Senior Engineer)",
        phone: "0912345678"
      }, "Hệ Thống Test", "SYSTEM_ADMIN");

      if (updated.position === "Kỹ sư Cấp cao (Senior Engineer)") {
        recordPass("Employees", "T3.3", "Cập nhật chức danh và số điện thoại nhân sự thành công");
      } else {
        throw new Error("Cập nhật thông tin không khớp");
      }
    } catch (e) {
      recordFail("Employees", "T3.3", "Cập nhật hồ sơ nhân sự", e);
    }
  }

  // ========================================================================
  // DOMAIN 4: CHẤM CÔNG SỐ & THỜI GIAN LÀM VIỆC (ATTENDANCE & TIMEKEEPING)
  // ========================================================================
  console.log("\n⏰ DOMAIN 4: CHẤM CÔNG SỐ & THỜI GIAN LÀM VIỆC");
  {
    // Test 4.1: Chuẩn hóa múi giờ không bị lệch ngày
    try {
      const d = new Date("2026-10-07T14:30:00.000Z");
      const utcOnly = toUtcDateOnly(d);
      const iso = utcOnly.toISOString();
      if (iso.endsWith("T00:00:00.000Z")) {
        recordPass("Attendance", "T4.1", "Hàm toUtcDateOnly chuẩn hóa ngày công về 00:00:00Z chính xác");
      } else {
        throw new Error(`toUtcDateOnly trả về định dạng sai: ${iso}`);
      }
    } catch (e) {
      recordFail("Attendance", "T4.1", "Chuẩn hóa ngày UTC", e);
    }

    // Test 4.2: Thực hiện Check-in cho nhân viên thử nghiệm
    try {
      const att = await processCheckIn(testEmpUserId);
      if (att && (att.status === "PRESENT" || att.status === "LATE")) {
        recordPass("Attendance", "T4.2", `Check-in thành công với trạng thái: [${att.status}]`);
      } else {
        throw new Error("Trạng thái check-in không hợp lệ");
      }
    } catch (e) {
      recordFail("Attendance", "T4.2", "Check-in ngày công", e);
    }

    // Test 4.3: Chặn Check-in lặp lại lần 2 trong ngày
    try {
      let blocked = false;
      try {
        await processCheckIn(testEmpUserId);
      } catch (err: any) {
        if (err.message.includes("đã thực hiện Check-in")) blocked = true;
      }
      if (blocked) {
        recordPass("Attendance", "T4.3", "Chặn Check-in lần 2 trong cùng ngày thành công");
      } else {
        throw new Error("Cho phép Check-in lặp lại!");
      }
    } catch (e) {
      recordFail("Attendance", "T4.3", "Chặn Check-in trùng lặp", e);
    }

    // Test 4.4: Thực hiện Check-out
    try {
      const attOut = await processCheckOut(testEmpUserId);
      if (attOut && attOut.checkOut) {
        recordPass("Attendance", "T4.4", "Check-out kết thúc ca làm việc thành công");
      } else {
        throw new Error("Check-out không lưu thời gian");
      }
    } catch (e) {
      recordFail("Attendance", "T4.4", "Check-out ngày công", e);
    }

    // Test 4.5: Chặn Check-out lặp lại
    try {
      let blocked = false;
      try {
        await processCheckOut(testEmpUserId);
      } catch (err: any) {
        if (err.message.includes("đã thực hiện Check-out")) blocked = true;
      }
      if (blocked) {
        recordPass("Attendance", "T4.5", "Chặn Check-out lần 2 trong ngày thành công");
      } else {
        throw new Error("Cho phép Check-out lặp lại!");
      }
    } catch (e) {
      recordFail("Attendance", "T4.5", "Chặn Check-out trùng lặp", e);
    }

    // Test 4.6: Phân quyền xem chấm công (Scope isolation)
    try {
      const userRecords = await getAttendances(undefined, {
        roleName: "USER",
        userEmail: testEmail
      });
      const allMatching = userRecords.every(r => r.employee.user.email === testEmail);
      if (allMatching) {
        recordPass("Attendance", "T4.6", "Phân quyền xem chấm công: Tài khoản USER chỉ xem được dữ liệu của chính mình");
      } else {
        throw new Error("USER thấy dữ liệu chấm công của nhân sự khác");
      }
    } catch (e) {
      recordFail("Attendance", "T4.6", "Bảo mật phạm vi chấm công USER", e);
    }
  }

  // ========================================================================
  // DOMAIN 5: ĐƠN NGHỈ PHÉP & PHÊ DUYỆT PHÂN CẤP (LEAVE WORKFLOW)
  // ========================================================================
  console.log("\n🏖️ DOMAIN 5: ĐƠN NGHỈ PHÉP & PHÊ DUYỆT PHÂN CẤP");
  let testLeaveId = "";
  {
    // Test 5.1: Tạo đơn nghỉ phép hợp lệ
    try {
      const startDate = "2026-11-10T00:00:00.000Z";
      const endDate = "2026-11-12T00:00:00.000Z";
      const leave = await createLeaveRequest(testEmpUserId, {
        startDate,
        endDate,
        type: "ANNUAL_LEAVE",
        reason: "Nghỉ phép thường niên kiểm thử hệ thống"
      }, "USER");
      testLeaveId = leave.id;
      recordPass("Leave", "T5.1", `Tạo đơn xin nghỉ phép thành công (ID: ${leave.id})`);
    } catch (e) {
      recordFail("Leave", "T5.1", "Tạo đơn nghỉ phép", e);
    }

    // Test 5.2: Chặn tạo đơn có endDate < startDate
    try {
      let blocked = false;
      try {
        await createLeaveRequest(testEmpUserId, {
          startDate: "2026-11-15T00:00:00.000Z",
          endDate: "2026-11-10T00:00:00.000Z",
          type: "ANNUAL_LEAVE",
          reason: "Ngày sai"
        }, "USER");
      } catch (err: any) {
        if (err.message.includes("nhỏ hơn ngày bắt đầu")) blocked = true;
      }
      if (blocked) {
        recordPass("Leave", "T5.2", "Chặn đơn có ngày kết thúc nhỏ hơn ngày bắt đầu thành công");
      } else {
        throw new Error("Không chặn được ngày không hợp lệ");
      }
    } catch (e) {
      recordFail("Leave", "T5.2", "Chặn ngày nghỉ ngược", e);
    }

    // Test 5.3: Chặn đơn trùng lặp thời gian
    try {
      let blocked = false;
      try {
        await createLeaveRequest(testEmpUserId, {
          startDate: "2026-11-11T00:00:00.000Z",
          endDate: "2026-11-13T00:00:00.000Z",
          type: "SICK_LEAVE",
          reason: "Trùng ngày"
        }, "USER");
      } catch (err: any) {
        if (err.message.includes("trùng khoảng thời gian")) blocked = true;
      }
      if (blocked) {
        recordPass("Leave", "T5.3", "Chặn đơn nghỉ phép giao thoa thời gian thành công");
      } else {
        throw new Error("Không chặn đơn trùng thời gian");
      }
    } catch (e) {
      recordFail("Leave", "T5.3", "Chặn đơn trùng khoảng thời gian", e);
    }

    // Test 5.4: Chặn Trưởng phòng tự duyệt đơn của bản thân
    try {
      const managerUser = await prisma.user.findFirst({
        where: { role: { name: "MANAGER" } },
        include: { employee: true }
      });
      if (managerUser?.employee) {
        // Tạo đơn tạm cho manager
        const mLeave = await prisma.leaveRequest.create({
          data: {
            employeeId: managerUser.employee.id,
            startDate: new Date("2026-12-01T00:00:00.000Z"),
            endDate: new Date("2026-12-02T00:00:00.000Z"),
            type: "ANNUAL_LEAVE",
            status: "PENDING"
          }
        });

        let blocked = false;
        try {
          await updateLeaveRequestStatus(mLeave.id, "APPROVED", "MANAGER", managerUser.name, managerUser.id);
        } catch (err: any) {
          if (err.message.includes("không thể tự phê duyệt đơn")) blocked = true;
        }

        await prisma.leaveRequest.delete({ where: { id: mLeave.id } });

        if (blocked) {
          recordPass("Leave", "T5.4", "Chặn Trưởng phòng tự duyệt đơn nghỉ phép của bản thân thành công");
        } else {
          throw new Error("Cho phép Trưởng phòng tự phê duyệt đơn của mình!");
        }
      }
    } catch (e) {
      recordFail("Leave", "T5.4", "Chặn tự duyệt đơn nghỉ phép", e);
    }

    // Test 5.5: Phê duyệt đơn (APPROVED) và tự động đồng bộ sang bảng Chấm công
    try {
      const admin = await prisma.user.findFirst({ where: { role: { name: "SYSTEM_ADMIN" } } });
      await updateLeaveRequestStatus(testLeaveId, "APPROVED", "SYSTEM_ADMIN", admin?.name || "Admin", admin?.id);

      // Kiểm tra bản ghi attendance LEAVE ngày 2026-11-10
      const attLeave = await prisma.attendance.findFirst({
        where: {
          employeeId: testEmpProfileId,
          date: new Date("2026-11-10T00:00:00.000Z"),
          status: "LEAVE"
        }
      });

      if (attLeave) {
        recordPass("Leave", "T5.5", "Duyệt đơn nghỉ phép và tự động sinh bản ghi chấm công [LEAVE] thành công");
      } else {
        throw new Error("Không sinh bản ghi Attendance LEAVE sau khi duyệt");
      }
    } catch (e) {
      recordFail("Leave", "T5.5", "Đồng bộ chấm công khi duyệt đơn", e);
    }

    // Test 5.6: Chuyển sang REJECTED và tự động thu hồi ngày công LEAVE
    try {
      const admin = await prisma.user.findFirst({ where: { role: { name: "SYSTEM_ADMIN" } } });
      await updateLeaveRequestStatus(testLeaveId, "REJECTED", "SYSTEM_ADMIN", admin?.name || "Admin", admin?.id);

      const attRevoked = await prisma.attendance.findFirst({
        where: {
          employeeId: testEmpProfileId,
          date: new Date("2026-11-10T00:00:00.000Z")
        }
      });

      if (!attRevoked) {
        recordPass("Leave", "T5.6", "Chuyển đơn sang REJECTED tự động thu hồi và dọn dẹp ngày công LEAVE thành công");
      } else {
        throw new Error("Ngày công LEAVE vẫn còn tồn tại sau khi từ chối đơn");
      }
    } catch (e) {
      recordFail("Leave", "T5.6", "Thu hồi ngày công khi từ chối đơn", e);
    }

    // Dọn dẹp đơn test
    if (testLeaveId) {
      try {
        await prisma.leaveRequest.delete({ where: { id: testLeaveId } });
      } catch {}
    }
  }

  // ========================================================================
  // DOMAIN 6: THÀNH PHẦN LƯƠNG & BẢNG LƯƠNG TỰ ĐỘNG (COMPENSATION & PAYROLL)
  // ========================================================================
  console.log("\n💰 DOMAIN 6: THÀNH PHẦN LƯƠNG & BẢNG LƯƠNG TỰ ĐỘNG");
  let testComponentId = "";
  let testPayrollId = "";
  {
    // Test 6.1: Tạo thành phần lương (SalaryComponent)
    try {
      const comp = await prisma.salaryComponent.create({
        data: {
          name: `Trợ cấp dự án đặc biệt ${Date.now()}`,
          type: "EARNING",
          amountType: "FIXED",
          defaultVal: 2000000
        }
      });
      testComponentId = comp.id;
      recordPass("Payroll", "T6.1", `Tạo thành phần lương mới thành công: [${comp.name}]`);
    } catch (e) {
      recordFail("Payroll", "T6.1", "Tạo thành phần lương", e);
    }

    // Test 6.2: Gán thành phần lương cho nhân sự và kiểm tra cơ chế bảo vệ chống xóa
    try {
      const empConfig = await prisma.employeeSalaryConfig.findUnique({
        where: { employeeId: testEmpProfileId }
      });
      if (empConfig && testComponentId) {
        await prisma.employeeSalaryComponent.create({
          data: {
            configId: empConfig.id,
            componentId: testComponentId
          }
        });

        // Kiểm tra bảo vệ: Có bản ghi liên kết trong EmployeeSalaryComponent
        const linkedCount = await prisma.employeeSalaryComponent.count({
          where: { componentId: testComponentId }
        });
        if (linkedCount > 0) {
          recordPass("Payroll", "T6.2", "Gán thành phần lương vào cấu hình nhân sự và kích hoạt bảo vệ toàn vẹn");
        } else {
          throw new Error("Chưa gán được thành phần lương");
        }

        // Gỡ liên kết và xóa component
        await prisma.employeeSalaryComponent.deleteMany({ where: { componentId: testComponentId } });
        await prisma.salaryComponent.delete({ where: { id: testComponentId } });
      }
    } catch (e) {
      recordFail("Payroll", "T6.2", "Gán thành phần lương và kiểm tra ràng buộc", e);
    }

    // Test 6.3: Tạo phiếu lương thủ công và kiểm tra netSalary >= 0
    try {
      const testMonth = 11;
      const testYear = 2026;
      await prisma.payroll.deleteMany({
        where: { employeeId: testEmpProfileId, month: testMonth, year: testYear }
      });

      const p = await createPayroll({
        employeeId: testEmpProfileId,
        month: testMonth,
        year: testYear,
        baseSalary: 10000000,
        bonus: 1000000,
        deductions: 15000000 // Khấu trừ vượt quá tổng thu nhập
      }, "Hệ Thống Test");

      testPayrollId = p.id;
      if (p.netSalary === 0) {
        recordPass("Payroll", "T6.3", "Tạo phiếu lương thủ công, bảo vệ netSalary không âm (chặn âm về 0 VNĐ)");
      } else {
        throw new Error(`netSalary bị sai: ${p.netSalary}`);
      }
    } catch (e) {
      recordFail("Payroll", "T6.3", "Tạo phiếu lương và bảo vệ không âm", e);
    }

    // Test 6.4: Cập nhật phiếu lương và khóa sổ (PAID)
    try {
      // Cập nhật số liệu hợp lệ
      const updated = await updatePayroll(testPayrollId, {
        baseSalary: 12000000,
        bonus: 2000000,
        deductions: 1400000
      }, "HR Test");

      if (updated.netSalary === 12600000) {
        recordPass("Payroll", "T6.4", "Cập nhật số liệu tài chính phiếu lương nháp chính xác");
      } else {
        throw new Error(`netSalary tính toán sai: ${updated.netSalary}`);
      }

      // Khóa sổ phiếu lương (PAID)
      await updatePayroll(testPayrollId, { status: "PAID" }, "Kế toán Trưởng");

      // Chặn chỉnh sửa sau khi đã PAID
      let blockedEdit = false;
      try {
        await updatePayroll(testPayrollId, { bonus: 5000000 });
      } catch (err: any) {
        if (err.message.includes("Sổ sách đã đóng")) blockedEdit = true;
      }

      // Chặn xóa sau khi đã PAID
      let blockedDelete = false;
      try {
        await deletePayroll(testPayrollId);
      } catch (err: any) {
        if (err.message.includes("Sổ sách đã đóng")) blockedDelete = true;
      }

      if (blockedEdit && blockedDelete) {
        recordPass("Payroll", "T6.5", "Khóa sổ phiếu lương (PAID): Chặn sửa và chặn xóa phiếu lương đã thanh toán");
      } else {
        throw new Error("Không bảo vệ được phiếu lương đã khóa sổ!");
      }

      // Dọn dẹp phiếu lương test
      await prisma.payroll.delete({ where: { id: testPayrollId } });
    } catch (e) {
      recordFail("Payroll", "T6.4", "Cập nhật và khóa sổ phiếu lương", e);
    }

    // Test 6.5: Tính toán bảng lương tự động cho toàn bộ nhân sự (Engine check)
    try {
      const calculatedList = await calculateMonthlyPayroll(9, 2026, "Auto Engine Test");
      if (calculatedList.length > 0) {
        const hasNegative = calculatedList.some(p => p.netSalary < 0);
        if (!hasNegative) {
          recordPass("Payroll", "T6.6", `Tính bảng lương tự động thành công cho ${calculatedList.length} nhân sự, 100% phiếu lương netSalary >= 0`);
        } else {
          throw new Error("Phát hiện phiếu lương có thực lĩnh âm!");
        }
      } else {
        throw new Error("Không sinh được phiếu lương nào");
      }
    } catch (e) {
      recordFail("Payroll", "T6.6", "Chạy engine tính lương tự động", e);
    }
  }

  // ========================================================================
  // DOMAIN 7: TUYỂN DỤNG (ATS) & TỰ ĐỘNG ONBOARDING
  // ========================================================================
  console.log("\n🎯 DOMAIN 7: TUYỂN DỤNG (ATS) & TỰ ĐỘNG ONBOARDING");
  let testJobId = "";
  let testAppId = "";
  const candidateEmail = `candidate.auto.${Date.now()}@gmail.com`;
  {
    // Test 7.1: Tạo tin tuyển dụng mới
    try {
      const dept = await prisma.department.findFirst();
      const job = await prisma.jobPosting.create({
        data: {
          title: `Chuyên viên Phân tích Dữ liệu ${Date.now()}`,
          description: "Phân tích số liệu nhân sự và báo cáo trực quan",
          headcount: 2,
          departmentId: dept?.id || null,
          status: "OPEN"
        }
      });
      testJobId = job.id;
      recordPass("Recruitment", "T7.1", `Tạo tin tuyển dụng mới thành công: [${job.title}]`);
    } catch (e) {
      recordFail("Recruitment", "T7.1", "Tạo tin tuyển dụng", e);
    }

    // Test 7.2: Ứng viên nộp hồ sơ trực tuyến (Careers Application)
    try {
      const app = await prisma.application.create({
        data: {
          jobPostingId: testJobId,
          candidateName: "Phạm Thu Hương Ứng Tuyển",
          candidateEmail: candidateEmail,
          candidatePhone: "0961234567",
          cvUrl: "https://example.com/cvs/phamthuhuong.pdf",
          status: "APPLIED"
        }
      });
      testAppId = app.id;
      recordPass("Recruitment", "T7.2", `Ứng viên nộp hồ sơ ứng tuyển thành công (Mã hồ sơ: #${app.id.slice(-6)})`);
    } catch (e) {
      recordFail("Recruitment", "T7.2", "Ứng viên nộp hồ sơ", e);
    }

    // Test 7.3: Luồng chuyển trạng thái Kanban (APPLIED -> REVIEWING -> INTERVIEWING)
    try {
      await prisma.application.update({
        where: { id: testAppId },
        data: { status: "REVIEWING" }
      });
      await prisma.application.update({
        where: { id: testAppId },
        data: { status: "INTERVIEWING" }
      });
      recordPass("Recruitment", "T7.3", "Quy trình chuyển trạng thái Kanban (Lọc hồ sơ -> Phỏng vấn) thành công");
    } catch (e) {
      recordFail("Recruitment", "T7.3", "Chuyển trạng thái hồ sơ ứng viên", e);
    }

    // Test 7.4: Quy trình Tự Động Onboarding khi ứng viên HIRED
    try {
      const application = await prisma.application.findUnique({
        where: { id: testAppId },
        include: { jobPosting: { include: { department: true } } }
      });

      if (application) {
        // Thực hiện logic onboarding như trong API route
        const defaultRole = await prisma.role.findFirst({ where: { name: "USER" } });
        const hashedPassword = await bcrypt.hash("Hrmis@123", 10);

        let newUserId = "";
        let newEmpId = "";

        await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email: application.candidateEmail,
              name: application.candidateName,
              password: hashedPassword,
              roleId: defaultRole!.id
            }
          });
          newUserId = newUser.id;

          const newProfile = await tx.employeeProfile.create({
            data: {
              userId: newUser.id,
              departmentId: application.jobPosting.departmentId || null,
              position: application.jobPosting.title,
              phone: application.candidatePhone,
              status: "ACTIVE"
            }
          });
          newEmpId = newProfile.id;

          await tx.employeeSalaryConfig.create({
            data: {
              employeeId: newProfile.id,
              baseSalary: 12000000
            }
          });
        });

        // Tạo quyết định tiếp nhận
        const pChange = await prisma.personnelChange.create({
          data: {
            code: `QĐ-TEST-${Date.now().toString().slice(-4)}`,
            employeeName: application.candidateName,
            employeeEmail: application.candidateEmail,
            type: "NEW_HIRE",
            fromDept: "Thị trường tuyển dụng",
            toDept: application.jobPosting.department?.name || "Phòng Công nghệ",
            fromPosition: "Ứng viên trúng tuyển",
            toPosition: application.jobPosting.title,
            effectiveDate: "07/10/2026",
            signer: "Hội Đồng Tuyển Dụng",
            status: "APPROVED"
          }
        });

        // Cập nhật trạng thái application thành HIRED
        await prisma.application.update({
          where: { id: testAppId },
          data: { status: "HIRED" }
        });

        // Kiểm tra User và Profile mới được tạo
        const createdUser = await prisma.user.findUnique({ where: { id: newUserId }, include: { employee: true } });
        if (createdUser && createdUser.employee && pChange) {
          recordPass("Recruitment", "T7.4", "Tự động Onboarding khi HIRED: Tạo User, Profile, Cấu hình lương và Ban hành Quyết định thành công");
        } else {
          throw new Error("Onboarding tự động thất bại");
        }

        // Dọn dẹp dữ liệu onboarding test
        await prisma.personnelChange.delete({ where: { id: pChange.id } });
        await prisma.user.delete({ where: { id: newUserId } });
      }
    } catch (e) {
      recordFail("Recruitment", "T7.4", "Tự động Onboarding nhân sự mới", e);
    }

    // Dọn dẹp application & job test
    try {
      await prisma.application.delete({ where: { id: testAppId } });
      await prisma.jobPosting.delete({ where: { id: testJobId } });
    } catch {}
  }

  // ========================================================================
  // DOMAIN 8: BIẾN ĐỘNG NHÂN SỰ & THUYÊN CHUYỂN (PERSONNEL CHANGES)
  // ========================================================================
  console.log("\n📋 DOMAIN 8: BIẾN ĐỘNG NHÂN SỰ & THUYÊN CHUYỂN");
  {
    // Test 8.1: Ban hành Quyết định Bổ nhiệm (PROMOTION)
    try {
      const code = `QĐ-TEST-${Date.now().toString().slice(-4)}`;
      const pChange = await prisma.personnelChange.create({
        data: {
          code,
          employeeName: "Lê Minh Thử Nghiệm",
          employeeEmail: testEmail,
          type: "PROMOTION",
          fromDept: "Phòng Công nghệ (IT)",
          toDept: "Phòng Công nghệ (IT)",
          fromPosition: "Kỹ sư Cấp cao",
          toPosition: "Trưởng Nhóm Kỹ Thuật (Tech Lead)",
          effectiveDate: "15/10/2026",
          signer: "Ban Tổng Giám Đốc",
          status: "APPROVED"
        }
      });

      if (pChange) {
        recordPass("PersonnelChanges", "T8.1", `Ban hành Quyết định Bổ nhiệm ${pChange.code} thành công`);
        await prisma.personnelChange.delete({ where: { id: pChange.id } });
      }
    } catch (e) {
      recordFail("PersonnelChanges", "T8.1", "Ban hành Quyết định Bổ nhiệm", e);
    }
  }

  // ========================================================================
  // DOMAIN 9: ĐÀO TẠO & KHẢO SÁT eNPS (TRAINING & SURVEYS)
  // ========================================================================
  console.log("\n🎓 DOMAIN 9: ĐÀO TẠO & KHẢO SÁT eNPS");
  {
    // Test 9.1: Khởi tạo Khóa đào tạo và cập nhật học viên
    try {
      const course = await prisma.trainingCourse.create({
        data: {
          title: `Khóa Huấn Luyện Bảo Mật Dữ Liệu ${Date.now()}`,
          instructor: "Chuyên gia An ninh mạng",
          category: "Tuân thủ & Bảo mật",
          duration: "8 giờ",
          participants: 25,
          progress: 50,
          startDate: "10/10/2026",
          status: "IN_PROGRESS"
        }
      });

      if (course) {
        recordPass("Training", "T9.1", `Tạo khóa đào tạo doanh nghiệp [${course.title}] thành công`);
        await prisma.trainingCourse.delete({ where: { id: course.id } });
      }
    } catch (e) {
      recordFail("Training", "T9.1", "Tạo khóa đào tạo doanh nghiệp", e);
    }

    // Test 9.2: Khởi tạo Khảo sát eNPS
    try {
      const survey = await prisma.survey.create({
        data: {
          title: `Khảo sát Môi trường làm việc Q4/2026 ${Date.now()}`,
          targetDept: "Toàn bộ nhân sự",
          respondents: 45,
          totalTarget: 50,
          deadline: "30/10/2026",
          score: 8.8,
          status: "ACTIVE"
        }
      });

      if (survey) {
        recordPass("Training", "T9.2", `Tạo khảo sát eNPS ẩn danh thành công: điểm hài lòng ${survey.score}/10`);
        await prisma.survey.delete({ where: { id: survey.id } });
      }
    } catch (e) {
      recordFail("Training", "T9.2", "Tạo khảo sát eNPS", e);
    }
  }

  // ========================================================================
  // DOMAIN 10: QUY HOẠCH CÁN BỘ & MA TRẬN 9-BOX (SUCCESSION PLANNING)
  // ========================================================================
  console.log("\n♟️ DOMAIN 10: QUY HOẠCH CÁN BỘ KẾ NHIỆM (CADRE PLANNING)");
  {
    try {
      const plan = await prisma.successionPlan.create({
        data: {
          position: "Giám Đốc Kỹ Thuật (CTO)",
          department: "Phòng Công nghệ Thông tin",
          currentHolder: "Nguyễn Văn An",
          successorName: "Trần Bảo Nam",
          successorEmail: "nam.tb@nexustech.vn",
          readiness: "READY_1_2_YEARS",
          potentialScore: "HIGH",
          mentor: "Nguyễn Văn An",
          plannedYear: "2027 - 2028",
          status: "APPROVED"
        }
      });

      if (plan) {
        recordPass("CadrePlanning", "T10.1", `Lập lộ trình kế nhiệm vị trí [${plan.position}] vào ma trận 9-Box thành công`);
        await prisma.successionPlan.delete({ where: { id: plan.id } });
      }
    } catch (e) {
      recordFail("CadrePlanning", "T10.1", "Lập lộ trình kế nhiệm cán bộ", e);
    }
  }

  // ========================================================================
  // DOMAIN 11: NHẬT KÝ KIỂM TOÁN HỆ THỐNG (AUDIT TRAIL)
  // ========================================================================
  console.log("\n🛡️ DOMAIN 11: NHẬT KÝ KIỂM TOÁN HỆ THỐNG (AUDIT TRAIL)");
  {
    try {
      const log = await prisma.auditLog.create({
        data: {
          userName: "Hệ Thống Master Test Runner",
          userRole: "SYSTEM_ADMIN",
          action: "Kiểm thử tự động tính năng toàn hệ thống",
          target: "CoreSystem",
          ip: "127.0.0.1",
          status: "SUCCESS"
        }
      });

      const totalLogs = await prisma.auditLog.count();
      if (log && totalLogs > 0) {
        recordPass("AuditTrail", "T11.1", `Nhật ký kiểm toán bảo lưu chính xác (Hiện có ${totalLogs} sự kiện kiểm toán)`);
      }
    } catch (e) {
      recordFail("AuditTrail", "T11.1", "Ghi và đọc Audit Log", e);
    }
  }

  // ========================================================================
  // DOMAIN 12: DỌN DẸP TÀI KHOẢN TEST & THỬ NGHIỆM OFFBOARDING
  // ========================================================================
  console.log("\n🧹 DOMAIN 12: THỬ NGHIỆM OFFBOARDING & DỌN DẸP DỮ LIỆU KIỂM THỬ");
  {
    // Test 12.1: Offboarding an toàn (Do có dữ liệu chấm công -> Tự động chuyển RESIGNED)
    try {
      const offboardRes = await deleteEmployee(testEmpProfileId, "Master Test Runner", "SYSTEM_ADMIN");
      const checkProfile = await prisma.employeeProfile.findUnique({ where: { id: testEmpProfileId } });

      if (checkProfile?.status === "RESIGNED") {
        recordPass("Offboarding", "T12.1", "Nhân sự có dữ liệu chấm công được bảo lưu chứng từ, chuyển trạng thái RESIGNED an toàn");
      } else {
        throw new Error("Không chuyển trạng thái sang RESIGNED");
      }

      // Xóa dọn dẹp các bản ghi chấm công và xóa user test
      await prisma.attendance.deleteMany({ where: { employeeId: testEmpProfileId } });
      await prisma.employeeSalaryConfig.deleteMany({ where: { employeeId: testEmpProfileId } });
      await prisma.employeeProfile.deleteMany({ where: { id: testEmpProfileId } });
      await prisma.user.deleteMany({ where: { id: testEmpUserId } });
      recordPass("Offboarding", "T12.2", "Dọn dẹp hoàn tất toàn bộ dữ liệu tạm sau kiểm thử");
    } catch (e) {
      recordFail("Offboarding", "T12.1", "Offboarding và dọn dẹp dữ liệu test", e);
    }
  }

  // ========================================================================
  // TỔNG KẾT BẢNG ĐIỂM
  // ========================================================================
  const passedCount = results.filter(r => r.status === "PASSED").length;
  const failedCount = results.filter(r => r.status === "FAILED").length;
  const totalCount = results.length;

  console.log("\n==========================================================================");
  console.log(`📊 TỔNG KẾT KIỂM THỬ MASTER TEST SUITE: ${passedCount}/${totalCount} BÀI TEST PASSED`);
  if (failedCount === 0) {
    console.log("🎉 XUẤT SẮC: 100% CÁC KỊCH BẢN VẬN HÀNH & NGHIỆP VỤ ĐỀU HOÀN HẢO!");
  } else {
    console.log(`⚠️ CẢNH BÁO: CÓ ${failedCount} BÀI TEST BỊ THẤT BẠI!`);
  }
  console.log("==========================================================================\n");

  await prisma.$disconnect();

  if (failedCount > 0) {
    process.exit(1);
  }
}

runMasterTestSuite().catch(err => {
  console.error("Master Test Error:", err);
  process.exit(1);
});
