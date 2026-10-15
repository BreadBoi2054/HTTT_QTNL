import { prisma } from "../lib/prisma";

function toUtcDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
}

async function main() {
  console.log("=== BẮT ĐẦU CẬP NHẬT DỮ LIỆU DEMO LÊN MỚI NHẤT (THÁNG 10/2026 - QUÝ 4/2026) ===");

  const now = new Date();
  const todayUtc = toUtcDateOnly(now);

  // 1. Lấy toàn bộ nhân sự đang hoạt động
  const employees = await prisma.employeeProfile.findMany({
    where: { status: { in: ["ACTIVE", "PROBATION"] } },
    include: { user: true, department: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`1. Đang đồng bộ chấm công cho ${employees.length} nhân sự từ 01/10/2026 đến hôm nay (${todayUtc.toISOString().slice(0, 10)})...`);

  // Tạo dữ liệu chấm công cho tất cả các ngày làm việc từ đầu tháng hiện tại đến hôm nay (bao gồm cả hôm nay)
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (9 = October)
  const currentDay = now.getDate();

  let attendanceUpserted = 0;
  for (let day = 1; day <= currentDay; day++) {
    const localDate = new Date(currentYear, currentMonth, day);
    const dayOfWeek = localDate.getDay();
    const isToday = day === currentDay;

    // Bỏ qua Chủ nhật (0), trừ khi hôm nay là Chủ nhật thì vẫn tạo dữ liệu chấm công để Dashboard hiển thị trực quan
    if (dayOfWeek === 0 && !isToday) continue;

    const dateUtc = new Date(Date.UTC(currentYear, currentMonth, day, 0, 0, 0, 0));

    for (let idx = 0; idx < employees.length; idx++) {
      const emp = employees[idx];
      const seedVal = (day * 17 + idx * 31) % 100;

      let status = "PRESENT";
      let checkInHour = 7;
      let checkInMin = 45 + (seedVal % 15); // 07:45 - 07:59
      let checkOutHour = 17;
      let checkOutMin = 30 + (seedVal % 25);

      if (isToday) {
        // Hôm nay: ~82% Đúng giờ, ~10% Đi muộn, ~5% Nghỉ phép, ~3% Vắng mặt
        if (idx % 19 === 0 && idx > 0) {
          status = "LEAVE";
        } else if (idx % 11 === 0 && idx > 0) {
          status = "LATE";
          checkInHour = 8;
          checkInMin = 18 + (idx % 25);
        } else if (idx === employees.length - 1) {
          status = "ABSENT";
        } else {
          status = "PRESENT";
          checkInHour = 7;
          checkInMin = 48 + (idx % 12);
        }
      } else {
        if (seedVal < 84) {
          status = "PRESENT";
        } else if (seedVal < 93) {
          status = "LATE";
          checkInHour = 8;
          checkInMin = 16 + (seedVal % 30);
        } else if (seedVal < 98) {
          status = "LEAVE";
        } else {
          status = "ABSENT";
        }
      }

      const checkIn =
        status === "PRESENT" || status === "LATE"
          ? new Date(Date.UTC(currentYear, currentMonth, day, checkInHour - 7, checkInMin, 0))
          : null;

      // Nếu là hôm nay và giờ hiện tại chưa tới 17:30 thì một số nhân sự đang làm việc, một số đã check-out demo
      const checkOut =
        status === "PRESENT" || status === "LATE"
          ? isToday && idx % 3 !== 0
            ? null
            : new Date(Date.UTC(currentYear, currentMonth, day, checkOutHour - 7, checkOutMin, 0))
          : null;

      await prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: emp.id,
            date: dateUtc,
          },
        },
        update: {
          status,
          checkIn,
          checkOut,
        },
        create: {
          employeeId: emp.id,
          date: dateUtc,
          status,
          checkIn,
          checkOut,
        },
      });
      attendanceUpserted++;
    }
  }
  console.log(`   -> Đã cập nhật ${attendanceUpserted} bản ghi chấm công (bao gồm ngày hôm nay ${todayUtc.toISOString().slice(0, 10)}).`);

  // 2. Cập nhật Hợp đồng lao động (Contract) sang mã HĐLĐ-2025 / HĐLĐ-2026 và ngày hiệu lực mới
  console.log("2. Đang làm mới danh sách Hợp đồng lao động (Contract)...");
  const contracts = await prisma.contract.findMany({
    orderBy: { createdAt: "asc" },
    include: { employee: { include: { user: true } } },
  });

  for (let i = 0; i < contracts.length; i++) {
    const c = contracts[i];
    const numStr = String(i + 1).padStart(4, "0");

    if (i % 7 === 1) {
      // Hợp đồng sắp hết hạn trong 12 ngày tới
      const start = new Date(Date.UTC(2025, 9, 26, 0, 0, 0));
      const end = new Date(Date.UTC(2026, 9, 26, 0, 0, 0));
      await prisma.contract.update({
        where: { id: c.id },
        data: {
          code: `HĐLĐ-2025/NX-${numStr}`,
          contractType: "Hợp đồng Xác định thời hạn 12 tháng",
          startDate: start,
          endDate: end,
          status: "EXPIRING_SOON",
          note: "Hợp đồng xác định thời hạn 12 tháng - Chuẩn bị đánh giá tái ký Quý 4/2026",
        },
      });
    } else if (i % 7 === 2) {
      // Hợp đồng thử việc sắp kết thúc cuối tháng 10/2026
      const start = new Date(Date.UTC(2026, 8, 1, 0, 0, 0));
      const end = new Date(Date.UTC(2026, 9, 31, 0, 0, 0));
      await prisma.contract.update({
        where: { id: c.id },
        data: {
          code: `HĐTV-2026/NX-${numStr}`,
          contractType: "Hợp đồng Thử việc (02 tháng)",
          startDate: start,
          endDate: end,
          status: "EXPIRING_SOON",
          note: "Hợp đồng thử việc 02 tháng (09/2026 - 10/2026)",
        },
      });
    } else if (i % 7 === 3) {
      // Hợp đồng xác định thời hạn 12 tháng ký năm 2026 (còn hạn dài)
      const start = new Date(Date.UTC(2026, 3, 1, 0, 0, 0));
      const end = new Date(Date.UTC(2027, 3, 1, 0, 0, 0));
      await prisma.contract.update({
        where: { id: c.id },
        data: {
          code: `HĐLĐ-2026/NX-${numStr}`,
          contractType: "Hợp đồng Xác định thời hạn 12 tháng",
          startDate: start,
          endDate: end,
          status: "ACTIVE",
          note: "Hợp đồng lao động xác định thời hạn 2026 - 2027",
        },
      });
    } else {
      // Hợp đồng không xác định thời hạn ký đầu năm 2026
      const startMonth = i % 6; // Tháng 1 -> Tháng 6/2026
      const start = new Date(Date.UTC(2026, startMonth, 10 + (i % 15), 0, 0, 0));
      await prisma.contract.update({
        where: { id: c.id },
        data: {
          code: `HĐLĐ-2026/NX-${numStr}`,
          contractType: "Hợp đồng Không xác định thời hạn",
          startDate: start,
          endDate: null,
          status: "ACTIVE",
          note: "Hợp đồng lao động chính thức không xác định thời hạn (Chuẩn HRMIS 2026)",
        },
      });
    }
  }
  console.log(`   -> Đã làm mới ${contracts.length} hợp đồng lao động sang chuẩn năm 2025-2026.`);

  // 3. Cập nhật ngày gia nhập (joinDate) của nhân viên cho đa dạng từ 2025 - 2026
  console.log("3. Đang cập nhật ngày gia nhập (joinDate) của nhân sự...");
  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    const year = i < 12 ? 2025 : 2026;
    const month = i < 12 ? (i % 12) : (i % 9); // 2026 từ tháng 1 đến tháng 9
    const day = 5 + (i % 20);
    await prisma.employeeProfile.update({
      where: { id: emp.id },
      data: {
        joinDate: new Date(Date.UTC(year, month, day, 0, 0, 0)),
      },
    });
  }

  // 4. Cập nhật Quyết định Biến động Nhân sự (PersonnelChange) tháng 10/2026 (có cả APPROVED và PENDING)
  console.log("4. Đang làm mới Quyết định Biến động Nhân sự (PersonnelChange)...");
  await prisma.personnelChange.deleteMany({});
  const freshDecisions = [
    {
      code: "QĐ-2026-041",
      employeeName: "Nguyễn Văn An",
      employeeEmail: "user@nexustech.vn",
      type: "PROMOTION",
      fromDept: "Phòng Công nghệ (IT)",
      toDept: "Phòng Công nghệ (IT)",
      fromPosition: "Senior Frontend Developer",
      toPosition: "Senior Frontend Lead & Tech Lead",
      effectiveDate: "01/10/2026",
      signer: "Tổng Giám Đốc Đỗ Minh Hiếu",
      status: "APPROVED",
      createdAt: new Date(Date.UTC(2026, 9, 1, 8, 30, 0)),
    },
    {
      code: "QĐ-2026-042",
      employeeName: "Trần Thị Mai",
      employeeEmail: "hr@nexustech.vn",
      type: "PROMOTION",
      fromDept: "Phòng Nhân sự (HR)",
      toDept: "Phòng Nhân sự (HR)",
      fromPosition: "Chuyên viên Nhân sự Tổng hợp",
      toPosition: "Trưởng phòng Nhân sự & Đào tạo (HR Manager)",
      effectiveDate: "05/10/2026",
      signer: "Tổng Giám Đốc Đỗ Minh Hiếu",
      status: "APPROVED",
      createdAt: new Date(Date.UTC(2026, 9, 5, 9, 15, 0)),
    },
    {
      code: "QĐ-2026-043",
      employeeName: "Vũ Minh Tuấn",
      employeeEmail: "tuan.vu@nexustech.vn",
      type: "TRANSFER",
      fromDept: "Phòng Vận hành (Operations)",
      toDept: "Phòng Công nghệ (IT)",
      fromPosition: "Kỹ sư Hệ thống",
      toPosition: "DevOps & Cloud Security Engineer",
      effectiveDate: "10/10/2026",
      signer: "Phó TGĐ Vũ Đình Trọng",
      status: "APPROVED",
      createdAt: new Date(Date.UTC(2026, 9, 10, 10, 0, 0)),
    },
    {
      code: "QĐ-2026-044",
      employeeName: "Phạm Quỳnh Anh",
      employeeEmail: "quynhanh.pham@nexustech.vn",
      type: "NEW_HIRE",
      fromDept: "Ứng viên Tuyển dụng",
      toDept: "Phòng Nhân sự (HR)",
      fromPosition: "Ứng viên Đạt Phỏng vấn",
      toPosition: "Chuyên viên Tuyển dụng & Thu hút Nhân tài",
      effectiveDate: "14/10/2026",
      signer: "Tổng Giám Đốc Đỗ Minh Hiếu",
      status: "APPROVED",
      createdAt: new Date(Date.UTC(2026, 9, 14, 7, 45, 0)),
    },
    {
      code: "QĐ-2026-045",
      employeeName: "Nguyễn Hoàng Duy",
      employeeEmail: "duy.nguyen@nexustech.vn",
      type: "PROMOTION",
      fromDept: "Phòng Công nghệ (IT)",
      toDept: "Phòng Công nghệ (IT)",
      fromPosition: "Backend Architect (Node/Go/Postgres)",
      toPosition: "Principal Solutions Architect",
      effectiveDate: "20/10/2026",
      signer: "Tổng Giám Đốc Đỗ Minh Hiếu",
      status: "PENDING",
      createdAt: new Date(Date.UTC(2026, 9, 14, 8, 0, 0)),
    },
    {
      code: "QĐ-2026-046",
      employeeName: "Phạm Thùy Linh",
      employeeEmail: "linh.pham@nexustech.vn",
      type: "PROMOTION",
      fromDept: "Phòng Công nghệ (IT)",
      toDept: "Phòng Công nghệ (IT)",
      fromPosition: "UI/UX Product Designer & Design System Lead",
      toPosition: "Head of Product Design (Design Director)",
      effectiveDate: "01/11/2026",
      signer: "Tổng Giám Đốc Đỗ Minh Hiếu",
      status: "PENDING",
      createdAt: new Date(Date.UTC(2026, 9, 14, 8, 10, 0)),
    },
  ];

  for (const dec of freshDecisions) {
    await prisma.personnelChange.create({ data: dec });
  }
  console.log(`   -> Đã tạo ${freshDecisions.length} Quyết định nhân sự tháng 10/2026 (4 đã duyệt, 2 chờ phê duyệt).`);

  // 5. Cập nhật Khóa đào tạo (TrainingCourse) & Khảo sát (Survey) sang Quý 4/2026 mới nhất
  console.log("5. Đang làm mới Khóa đào tạo (TrainingCourse) & Khảo sát nội bộ (Survey)...");
  await prisma.trainingCourse.deleteMany({});
  await prisma.survey.deleteMany({});

  await prisma.trainingCourse.createMany({
    data: [
      {
        title: "Kiến trúc Hệ thống Phân tán & AI Agentic Workflow 2026",
        instructor: "TS. Vũ Đình Trọng (CTO)",
        category: "Công nghệ & Kỹ thuật",
        duration: "24 giờ",
        participants: 28,
        progress: 65,
        startDate: "10/10/2026",
        status: "IN_PROGRESS",
      },
      {
        title: "Bảo mật Dữ liệu Doanh nghiệp & Tuân thủ ISO/IEC 27001:2026",
        instructor: "Chuyên gia An ninh mạng Nguyễn Tuấn",
        category: "An toàn Thông tin",
        duration: "16 giờ",
        participants: 35,
        progress: 25,
        startDate: "14/10/2026",
        status: "ENROLLING",
      },
      {
        title: "Năng lực Lãnh đạo Kế cận & Quản trị Hiệu suất OKRs Quý 4/2026",
        instructor: "TGĐ Đỗ Minh Hiếu & Ban Cố vấn",
        category: "Quản trị & Lãnh đạo",
        duration: "20 giờ",
        participants: 18,
        progress: 80,
        startDate: "02/10/2026",
        status: "IN_PROGRESS",
      },
      {
        title: "Chiến lược Đàm phán & Chốt Hợp đồng Khách hàng Enterprise B2B",
        instructor: "Giám đốc Kinh doanh Lê Thị Bích",
        category: "Kinh doanh & Bán hàng",
        duration: "12 giờ",
        participants: 22,
        progress: 100,
        startDate: "25/09/2026",
        status: "COMPLETED",
      },
    ],
  });

  await prisma.survey.createMany({
    data: [
      {
        title: "Khảo sát Chỉ số Gắn kết & Hài lòng Nhân sự (eNPS Quý 4/2026)",
        targetDept: "Toàn tập đoàn",
        respondents: 31,
        totalTarget: 39,
        deadline: "31/10/2026",
        score: 4.8,
        status: "ACTIVE",
      },
      {
        title: "Đánh giá Trải nghiệm Hệ thống Quản trị Nhân sự HRMIS 2026 mới",
        targetDept: "Toàn tập đoàn",
        respondents: 36,
        totalTarget: 39,
        deadline: "05/11/2026",
        score: 4.9,
        status: "ACTIVE",
      },
      {
        title: "Khảo sát Nhu cầu Đào tạo Chuyên sâu & Ngân sách Học tập 2027",
        targetDept: "Khối Công nghệ & Kinh doanh",
        respondents: 24,
        totalTarget: 28,
        deadline: "15/11/2026",
        score: 4.7,
        status: "ACTIVE",
      },
    ],
  });
  console.log("   -> Đã cập nhật 4 khóa đào tạo và 3 khảo sát nội bộ Quý 4/2026.");

  // 6. Cập nhật Tin tuyển dụng (JobPosting), Hồ sơ ứng viên (Application) và Lịch phỏng vấn (Interview)
  console.log("6. Đang làm mới dữ liệu Tuyển dụng & Lịch phỏng vấn tháng 10-11/2026...");
  const jobs = await prisma.jobPosting.findMany();
  for (let i = 0; i < jobs.length; i++) {
    await prisma.jobPosting.update({
      where: { id: jobs[i].id },
      data: {
        dueDate: new Date(Date.UTC(2026, 10, 15 + i * 5, 17, 0, 0)), // 15/11/2026 - 30/11/2026
        createdAt: new Date(Date.UTC(2026, 9, 8 + i, 9, 0, 0)), // 08/10/2026 - 12/10/2026
      },
    });
  }

  const apps = await prisma.application.findMany({ orderBy: { createdAt: "asc" } });
  for (let i = 0; i < apps.length; i++) {
    await prisma.application.update({
      where: { id: apps[i].id },
      data: {
        createdAt: new Date(Date.UTC(2026, 9, 10 + (i % 5), 8 + i, 30, 0)), // 10/10/2026 - 14/10/2026
      },
    });
  }

  const adminOrManager = await prisma.user.findFirst({
    where: { email: { in: ["trong.vu@nexustech.vn", "manager@nexustech.vn", "admin@hrmis.com"] } },
  });

  if (adminOrManager && apps.length >= 3) {
    await prisma.interview.deleteMany({});
    await prisma.interview.createMany({
      data: [
        {
          applicationId: apps[2].id,
          interviewerId: adminOrManager.id,
          scheduledAt: new Date(Date.UTC(2026, 9, 14, 7, 0, 0)), // 14:00 chiều hôm nay 14/10/2026
          result: "PASS",
          notes: "Ứng viên nắm vững kiến trúc Next.js 16, PostgreSQL và thiết kế hệ thống phân tán.",
        },
        {
          applicationId: apps[1].id,
          interviewerId: adminOrManager.id,
          scheduledAt: new Date(Date.UTC(2026, 9, 16, 2, 30, 0)), // 09:30 sáng 16/10/2026 (Sắp diễn ra)
          result: null,
          notes: "Phỏng vấn vòng Chuyên môn Kỹ thuật (Technical Deep Dive) cùng CTO & IT Manager.",
        },
      ],
    });
  }

  // 7. Cập nhật Đơn nghỉ phép (LeaveRequest) sát với tuần hiện tại (Tháng 10/2026)
  console.log("7. Đang cập nhật ngày các Đơn xin nghỉ phép (LeaveRequest)...");
  const leaves = await prisma.leaveRequest.findMany({ orderBy: { startDate: "desc" } });
  const leaveSchedules = [
    {
      start: new Date(Date.UTC(2026, 9, 16, 0, 0, 0)),
      end: new Date(Date.UTC(2026, 9, 17, 0, 0, 0)),
      status: "PENDING",
      reason: "Giải quyết việc gia đình và tham dự lễ cưới em gái tại quê",
    },
    {
      start: new Date(Date.UTC(2026, 9, 20, 0, 0, 0)),
      end: new Date(Date.UTC(2026, 9, 21, 0, 0, 0)),
      status: "PENDING",
      reason: "Khám sức khỏe định kỳ chuyên sâu tại Bệnh viện Đại học Y",
    },
    {
      start: new Date(Date.UTC(2026, 9, 12, 0, 0, 0)),
      end: new Date(Date.UTC(2026, 9, 13, 0, 0, 0)),
      status: "APPROVED",
      reason: "Nghỉ phép năm thường niên cùng gia đình",
    },
    {
      start: new Date(Date.UTC(2026, 9, 8, 0, 0, 0)),
      end: new Date(Date.UTC(2026, 9, 9, 0, 0, 0)),
      status: "APPROVED",
      reason: "Nghỉ ốm theo chỉ định của bác sĩ chuyên khoa",
    },
    {
      start: new Date(Date.UTC(2026, 9, 5, 0, 0, 0)),
      end: new Date(Date.UTC(2026, 9, 6, 0, 0, 0)),
      status: "REJECTED",
      reason: "Trùng lịch nghiệm thu dự án trọng điểm Quý 4/2026 với đối tác",
    },
  ];
  for (let i = 0; i < Math.min(leaves.length, leaveSchedules.length); i++) {
    await prisma.leaveRequest.update({
      where: { id: leaves[i].id },
      data: {
        startDate: leaveSchedules[i].start,
        endDate: leaveSchedules[i].end,
        status: leaveSchedules[i].status,
        reason: leaveSchedules[i].reason,
      },
    });
  }

  // 8. Cập nhật trạng thái Bảng lương: Tháng 8/2026 (PAID), Tháng 9/2026 (PAID - đã chốt sổ), Tháng 10/2026 (DRAFT - kỳ hiện tại)
  console.log("8. Đang đồng bộ trạng thái Bảng lương Tháng 8, Tháng 9 (PAID) và Tháng 10/2026 (DRAFT)...");
  await prisma.payroll.updateMany({
    where: { year: 2026, month: { in: [8, 9] } },
    data: { status: "PAID" },
  });

  // 9. Thêm Nhật ký kiểm toán (AuditLog) mới nhất cho ngày hôm nay 14/10/2026
  console.log("9. Đang cập nhật Nhật ký hệ thống (AuditLog) hôm nay...");
  await prisma.auditLog.createMany({
    data: [
      {
        userName: "Tổng Giám Đốc Đỗ Minh Hiếu",
        userRole: "BOD",
        action: "Phê duyệt Quyết định tiếp nhận nhân sự QĐ-2026-044 (Phạm Quỳnh Anh - Phòng Nhân sự)",
        target: "PersonnelChange",
        ip: "10.0.14.101",
        status: "SUCCESS",
        createdAt: new Date(now.getTime() - 45 * 60 * 1000),
      },
      {
        userName: "Trần Thị Mai",
        userRole: "HR",
        action: "Chốt sổ và giải ngân hoàn tất Bảng lương Tháng 09/2026 cho toàn bộ 39 nhân sự",
        target: "PayrollEngine",
        ip: "10.0.14.108",
        status: "SUCCESS",
        createdAt: new Date(now.getTime() - 25 * 60 * 1000),
      },
      {
        userName: "Lê Tuấn Anh",
        userRole: "MANAGER",
        action: "Trình ký Quyết định bổ nhiệm QĐ-2026-045 & QĐ-2026-046 lên Ban Giám Đốc",
        target: "PersonnelChange",
        ip: "10.0.14.115",
        status: "SUCCESS",
        createdAt: new Date(now.getTime() - 10 * 60 * 1000),
      },
      {
        userName: "Nguyễn Tuấn IT Admin",
        userRole: "SYSTEM_ADMIN",
        action: "Đồng bộ dữ liệu Chấm công thời gian thực & Hợp đồng lao động Kỳ Tháng 10/2026 (Quý 4/2026)",
        target: "SystemSync",
        ip: "127.0.0.1",
        status: "SUCCESS",
        createdAt: now,
      },
    ],
  });

  console.log("=== HOÀN TẤT CẬP NHẬT TOÀN BỘ DỮ LIỆU DEMO TRONG POSTGRESQL ===");
  process.exit(0);
}

main().catch((err) => {
  console.error("Lỗi cập nhật dữ liệu demo:", err);
  process.exit(1);
});
