import "dotenv/config";
import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log("Seeding comprehensive enterprise data...");

  // 1. Delete existing data safely in foreign key order
  await prisma.auditLog.deleteMany({});
  await prisma.personnelChange.deleteMany({});
  await prisma.trainingCourse.deleteMany({});
  await prisma.survey.deleteMany({});
  await prisma.successionPlan.deleteMany({});
  await prisma.interview.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.jobPosting.deleteMany({});
  await prisma.payroll.deleteMany({});
  await prisma.employeeSalaryComponent.deleteMany({});
  await prisma.employeeSalaryConfig.deleteMany({});
  await prisma.salaryComponent.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  
  // Unlink manager before deleting profiles
  await prisma.department.updateMany({ data: { managerId: null } });
  await prisma.employeeProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.role.deleteMany({});

  console.log("Cleared old database records!");

  // 2. Create Roles
  const adminRole = await prisma.role.create({ data: { name: 'SYSTEM_ADMIN' } });
  const managerRole = await prisma.role.create({ data: { name: 'MANAGER' } });
  const hrRole = await prisma.role.create({ data: { name: 'HR' } });
  const userRole = await prisma.role.create({ data: { name: 'USER' } });

  console.log("Created 4 RBAC Roles!");

  // 3. Default Password for all demo accounts
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 4. Create 6 Enterprise Departments
  const itDept = await prisma.department.create({
    data: {
      name: 'Phòng Công nghệ (IT)',
      description: 'Nghiên cứu, phát triển và bảo trì hạ tầng công nghệ, hệ thống phần mềm HRMIS',
    }
  });

  const hrDept = await prisma.department.create({
    data: {
      name: 'Phòng Nhân sự & Đào tạo (HR)',
      description: 'Quản trị nhân lực, tuyển dụng, tiền lương đãi ngộ và phát triển nhân tài',
    }
  });

  const faDept = await prisma.department.create({
    data: {
      name: 'Phòng Tài chính - Kế toán',
      description: 'Quản lý thu chi, kiểm soát tài chính, lập báo cáo tài chính và tuân thủ thuế',
    }
  });

  const salesDept = await prisma.department.create({
    data: {
      name: 'Phòng Kinh doanh & Phát triển thị trường',
      description: 'Phát triển khách hàng doanh nghiệp B2B, mở rộng thị phần và quản trị doanh thu',
    }
  });

  const mktDept = await prisma.department.create({
    data: {
      name: 'Phòng Marketing & Truyền thông',
      description: 'Xây dựng thương hiệu doanh nghiệp, truyền thông số và định vị giải pháp',
    }
  });

  const bodDept = await prisma.department.create({
    data: {
      name: 'Ban Tổng Giám Đốc (BOD)',
      description: 'Hội đồng quản trị và Ban điều hành chiến lược phát triển toàn tập đoàn',
    }
  });

  console.log("Created 6 Departments!");

  // 5. Create 38 Employees across 6 enterprise departments
  const rawEmployees = [
    // 1. Ban Tổng Giám Đốc (BOD) (4 nhân sự)
    {
      name: 'Quản trị viên (Admin HQ)',
      email: 'admin@hrmis.com',
      roleId: adminRole.id,
      deptId: bodDept.id,
      position: 'Tổng Giám Đốc (CEO)',
      phone: '0987654001',
      address: 'Hoàn Kiếm, Hà Nội',
      baseSalary: 65000000,
      isManagerOfDept: bodDept.id,
    },
    {
      name: 'Vũ Đình Trọng',
      email: 'trong.vu@hrmis.com',
      roleId: managerRole.id,
      deptId: bodDept.id,
      position: 'Phó Tổng Giám Đốc Kỹ thuật & Hạ tầng (CTO)',
      phone: '0987654002',
      address: 'Tây Hồ, Hà Nội',
      baseSalary: 55000000,
    },
    {
      name: 'Phạm Hoàng Long',
      email: 'long.pham@hrmis.com',
      roleId: managerRole.id,
      deptId: bodDept.id,
      position: 'Phó Tổng Giám Đốc Vận hành & Tài chính (COO)',
      phone: '0987654003',
      address: 'Ba Đình, Hà Nội',
      baseSalary: 52000000,
    },
    {
      name: 'Hoàng Thu Uyên',
      email: 'uyen.hoang@hrmis.com',
      roleId: userRole.id,
      deptId: bodDept.id,
      position: 'Thư ký Hội đồng & Trợ lý Điều hành BOD',
      phone: '0987654004',
      address: 'Cầu Giấy, Hà Nội',
      baseSalary: 25000000,
    },

    // 2. Phòng Công nghệ (IT) (8 nhân sự)
    {
      name: 'Lê Tuấn Anh',
      email: 'manager@hrmis.com',
      roleId: managerRole.id,
      deptId: itDept.id,
      position: 'Giám đốc Kỹ thuật / IT Manager',
      phone: '0987654005',
      address: 'Cầu Giấy, Hà Nội',
      baseSalary: 45000000,
      isManagerOfDept: itDept.id,
    },
    {
      name: 'Nguyễn Văn An',
      email: 'user@hrmis.com',
      roleId: userRole.id,
      deptId: itDept.id,
      position: 'Senior Frontend Lead & Tech Lead',
      phone: '0987654006',
      address: 'Nam Từ Liêm, Hà Nội',
      baseSalary: 32000000,
    },
    {
      name: 'Nguyễn Hoàng Duy',
      email: 'duy.nguyen@hrmis.com',
      roleId: userRole.id,
      deptId: itDept.id,
      position: 'Backend Architect (Node/Go/Postgres)',
      phone: '0987654007',
      address: 'Thanh Xuân, Hà Nội',
      baseSalary: 34000000,
    },
    {
      name: 'Phạm Thùy Linh',
      email: 'linh.pham@hrmis.com',
      roleId: userRole.id,
      deptId: itDept.id,
      position: 'UI/UX Product Designer & Design System Lead',
      phone: '0987654008',
      address: 'Đống Đa, Hà Nội',
      baseSalary: 26000000,
    },
    {
      name: 'Vũ Minh Tuấn',
      email: 'tuan.vu@hrmis.com',
      roleId: userRole.id,
      deptId: itDept.id,
      position: 'DevOps & Cloud Security Engineer',
      phone: '0987654009',
      address: 'Hà Đông, Hà Nội',
      baseSalary: 28000000,
    },
    {
      name: 'Trần Thảo My',
      email: 'my.tran@hrmis.com',
      roleId: userRole.id,
      deptId: itDept.id,
      position: 'Senior React/Next.js Engineer',
      phone: '0987654010',
      address: 'Bắc Từ Liêm, Hà Nội',
      baseSalary: 27000000,
    },
    {
      name: 'Đỗ Hùng Dũng',
      email: 'dung.do@hrmis.com',
      roleId: userRole.id,
      deptId: itDept.id,
      position: 'Mobile Application Engineer (Flutter/iOS)',
      phone: '0987654011',
      address: 'Hoàng Mai, Hà Nội',
      baseSalary: 26000000,
    },
    {
      name: 'Lê Thúy Hằng',
      email: 'hang.le@hrmis.com',
      roleId: userRole.id,
      deptId: itDept.id,
      position: 'QA/QC & Automation Test Engineer',
      phone: '0987654012',
      address: 'Long Biên, Hà Nội',
      baseSalary: 22000000,
    },

    // 3. Phòng Nhân sự & Đào tạo (HR) (6 nhân sự)
    {
      name: 'Trần Thị Mai',
      email: 'hr@hrmis.com',
      roleId: hrRole.id,
      deptId: hrDept.id,
      position: 'Trưởng phòng Nhân sự (HR Manager)',
      phone: '0987654013',
      address: 'Ba Đình, Hà Nội',
      baseSalary: 38000000,
      isManagerOfDept: hrDept.id,
    },
    {
      name: 'Đỗ Kim Ngân',
      email: 'ngan.do@hrmis.com',
      roleId: hrRole.id,
      deptId: hrDept.id,
      position: 'Phó phòng Nhân sự & Đãi ngộ (C&B Lead)',
      phone: '0987654014',
      address: 'Tây Hồ, Hà Nội',
      baseSalary: 25000000,
    },
    {
      name: 'Nguyễn Bích Phương',
      email: 'phuong.nguyen@hrmis.com',
      roleId: hrRole.id,
      deptId: hrDept.id,
      position: 'Chuyên viên Tuyển dụng Cấp cao (Senior TA)',
      phone: '0987654015',
      address: 'Cầu Giấy, Hà Nội',
      baseSalary: 22000000,
    },
    {
      name: 'Lê Hoàng Phúc',
      email: 'phuc.le@hrmis.com',
      roleId: userRole.id,
      deptId: hrDept.id,
      position: 'Chuyên viên Đào tạo & Phát triển (L&D Specialist)',
      phone: '0987654016',
      address: 'Hoàng Mai, Hà Nội',
      baseSalary: 20000000,
    },
    {
      name: 'Vũ Kiều Oanh',
      email: 'oanh.vu@hrmis.com',
      roleId: userRole.id,
      deptId: hrDept.id,
      position: 'Chuyên viên Tiền lương & BHXH (C&B Officer)',
      phone: '0987654017',
      address: 'Đống Đa, Hà Nội',
      baseSalary: 18000000,
    },
    {
      name: 'Trịnh Đức Anh',
      email: 'anh.trinh@hrmis.com',
      roleId: userRole.id,
      deptId: hrDept.id,
      position: 'Chuyên viên Quan hệ Lao động & Văn hóa Doanh nghiệp',
      phone: '0987654018',
      address: 'Hai Bà Trưng, Hà Nội',
      baseSalary: 19000000,
    },

    // 4. Phòng Tài chính - Kế toán (6 nhân sự)
    {
      name: 'Đặng Thu Hòa',
      email: 'hoa.dang@hrmis.com',
      roleId: managerRole.id,
      deptId: faDept.id,
      position: 'Kế toán trưởng (Chief Accountant)',
      phone: '0987654019',
      address: 'Hai Bà Trưng, Hà Nội',
      baseSalary: 40000000,
      isManagerOfDept: faDept.id,
    },
    {
      name: 'Dương Minh Đức',
      email: 'duc.duong@hrmis.com',
      roleId: userRole.id,
      deptId: faDept.id,
      position: 'Phó phòng Kế toán & Kiểm soát Chi phí',
      phone: '0987654020',
      address: 'Thanh Xuân, Hà Nội',
      baseSalary: 28000000,
    },
    {
      name: 'Trần Nhật Quang',
      email: 'quang.tran@hrmis.com',
      roleId: userRole.id,
      deptId: faDept.id,
      position: 'Chuyên viên Phân tích Tài chính Doanh nghiệp (FP&A)',
      phone: '0987654021',
      address: 'Long Biên, Hà Nội',
      baseSalary: 24000000,
    },
    {
      name: 'Bùi Ngọc Thanh',
      email: 'thanh.bui@hrmis.com',
      roleId: userRole.id,
      deptId: faDept.id,
      position: 'Kế toán viên Tổng hợp & Báo cáo Thuế',
      phone: '0987654022',
      address: 'Cầu Giấy, Hà Nội',
      baseSalary: 20000000,
    },
    {
      name: 'Phạm Mai Hương',
      email: 'huong.pham@hrmis.com',
      roleId: userRole.id,
      deptId: faDept.id,
      position: 'Kế toán Thanh toán & Giao dịch Ngân hàng',
      phone: '0987654023',
      address: 'Nam Từ Liêm, Hà Nội',
      baseSalary: 18000000,
    },
    {
      name: 'Ngô Bảo Châu',
      email: 'chau.ngo@hrmis.com',
      roleId: userRole.id,
      deptId: faDept.id,
      position: 'Thủ quỹ Doanh nghiệp & Quản lý Thu chi',
      phone: '0987654024',
      address: 'Hoàn Kiếm, Hà Nội',
      baseSalary: 16000000,
    },

    // 5. Phòng Kinh doanh & Phát triển thị trường (8 nhân sự)
    {
      name: 'Nguyễn Hoàng Nam',
      email: 'nam.nguyen@hrmis.com',
      roleId: managerRole.id,
      deptId: salesDept.id,
      position: 'Giám đốc Kinh doanh (Sales Director)',
      phone: '0987654025',
      address: 'Thanh Xuân, Hà Nội',
      baseSalary: 45000000,
      isManagerOfDept: salesDept.id,
    },
    {
      name: 'Lê Quốc Bảo',
      email: 'bao.le@hrmis.com',
      roleId: userRole.id,
      deptId: salesDept.id,
      position: 'Phó Giám đốc Kinh doanh Miền Bắc',
      phone: '0987654026',
      address: 'Nam Từ Liêm, Hà Nội',
      baseSalary: 30000000,
    },
    {
      name: 'Đinh Thị Lan Hương',
      email: 'huong.dinh@hrmis.com',
      roleId: userRole.id,
      deptId: salesDept.id,
      position: 'Trưởng nhóm Khách hàng Doanh nghiệp (B2B Lead)',
      phone: '0987654027',
      address: 'Đống Đa, Hà Nội',
      baseSalary: 25000000,
    },
    {
      name: 'Trần Đình Trọng',
      email: 'trong.tran@hrmis.com',
      roleId: userRole.id,
      deptId: salesDept.id,
      position: 'Senior Account Executive (Enterprise SaaS)',
      phone: '0987654028',
      address: 'Cầu Giấy, Hà Nội',
      baseSalary: 23000000,
    },
    {
      name: 'Nguyễn Thu Hà',
      email: 'ha.nguyen@hrmis.com',
      roleId: userRole.id,
      deptId: salesDept.id,
      position: 'Key Account Manager (Khách hàng Chiến lược)',
      phone: '0987654029',
      address: 'Ba Đình, Hà Nội',
      baseSalary: 22000000,
    },
    {
      name: 'Chu Văn Mạnh',
      email: 'manh.chu@hrmis.com',
      roleId: userRole.id,
      deptId: salesDept.id,
      position: 'Chuyên viên Tư vấn Giải pháp Phần mềm (Solution Consultant)',
      phone: '0987654030',
      address: 'Hà Đông, Hà Nội',
      baseSalary: 20000000,
    },
    {
      name: 'Lại Mỹ Linh',
      email: 'linh.lai@hrmis.com',
      roleId: userRole.id,
      deptId: salesDept.id,
      position: 'Chuyên viên Phát triển Khách hàng Doanh nghiệp',
      phone: '0987654031',
      address: 'Tây Hồ, Hà Nội',
      baseSalary: 18000000,
    },
    {
      name: 'Đặng Quốc Huy',
      email: 'huy.dang@hrmis.com',
      roleId: userRole.id,
      deptId: salesDept.id,
      position: 'Chuyên viên Hỗ trợ Kinh doanh (Sales Admin & Contracts)',
      phone: '0987654032',
      address: 'Hoàng Mai, Hà Nội',
      baseSalary: 16000000,
    },

    // 6. Phòng Marketing & Truyền thông (6 nhân sự)
    {
      name: 'Vũ Thu Trang',
      email: 'trang.vu@hrmis.com',
      roleId: managerRole.id,
      deptId: mktDept.id,
      position: 'Trưởng phòng Marketing (Marketing Manager)',
      phone: '0987654033',
      address: 'Cầu Giấy, Hà Nội',
      baseSalary: 36000000,
      isManagerOfDept: mktDept.id,
    },
    {
      name: 'Trần Đăng Khoa',
      email: 'khoa.tran@hrmis.com',
      roleId: userRole.id,
      deptId: mktDept.id,
      position: 'Phó phòng Truyền thông & Thương hiệu (Brand Lead)',
      phone: '0987654034',
      address: 'Ba Đình, Hà Nội',
      baseSalary: 24000000,
    },
    {
      name: 'Hoàng Đức Minh',
      email: 'minh.hoang@hrmis.com',
      roleId: userRole.id,
      deptId: mktDept.id,
      position: 'Chuyên viên Tối ưu hóa Chiến dịch Số (Performance Marketing)',
      phone: '0987654035',
      address: 'Hà Đông, Hà Nội',
      baseSalary: 22000000,
    },
    {
      name: 'Phan Thanh Thảo',
      email: 'thao.phan@hrmis.com',
      roleId: userRole.id,
      deptId: mktDept.id,
      position: 'Content Marketing & Copywriting Lead',
      phone: '0987654036',
      address: 'Đống Đa, Hà Nội',
      baseSalary: 20000000,
    },
    {
      name: 'Nguyễn Tiến Dũng',
      email: 'dung.nguyen@hrmis.com',
      roleId: userRole.id,
      deptId: mktDept.id,
      position: 'Senior Graphic & Motion Designer',
      phone: '0987654037',
      address: 'Thanh Xuân, Hà Nội',
      baseSalary: 21000000,
    },
    {
      name: 'Đỗ Diệu Linh',
      email: 'linh.dieu@hrmis.com',
      roleId: userRole.id,
      deptId: mktDept.id,
      position: 'Chuyên viên SEO & Quản trị Mạng Xã hội (Social Media)',
      phone: '0987654038',
      address: 'Long Biên, Hà Nội',
      baseSalary: 18000000,
    },
  ];

  const createdProfiles: any[] = [];

  for (const emp of rawEmployees) {
    const user = await prisma.user.create({
      data: {
        name: emp.name,
        email: emp.email,
        password: hashedPassword,
        roleId: emp.roleId,
        employee: {
          create: {
            departmentId: emp.deptId,
            position: emp.position,
            phone: emp.phone,
            address: emp.address,
            joinDate: new Date(2024, Math.floor(Math.random() * 11), Math.floor(Math.random() * 25) + 1),
          }
        }
      },
      include: { employee: true }
    });

    if (user.employee) {
      createdProfiles.push({
        ...user.employee,
        baseSalary: emp.baseSalary,
        user: { name: user.name, email: user.email },
      });

      // If department manager, update department
      if (emp.isManagerOfDept) {
        await prisma.department.update({
          where: { id: emp.isManagerOfDept },
          data: { managerId: user.employee.id },
        });
      }

      // Create salary config
      await prisma.employeeSalaryConfig.create({
        data: {
          employeeId: user.employee.id,
          baseSalary: emp.baseSalary,
        }
      });
    }
  }

  console.log(`Created ${createdProfiles.length} Employee Profiles and linked Department Managers!`);

  // 6. Seed Attendance (Last 5 working days for all employees)
  const today = new Date();
  const pastDays: Date[] = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    pastDays.push(d);
  }

  for (const profile of createdProfiles) {
    for (const d of pastDays) {
      const isLate = Math.random() < 0.15;
      const isLeave = Math.random() < 0.05;

      const checkInHour = isLate ? 8 : 8;
      const checkInMin = isLate ? Math.floor(Math.random() * 30) + 31 : Math.floor(Math.random() * 25);
      const checkOutHour = 17;
      const checkOutMin = Math.floor(Math.random() * 30) + 30;

      const checkInDate = new Date(d);
      checkInDate.setHours(checkInHour, checkInMin, 0, 0);

      const checkOutDate = new Date(d);
      checkOutDate.setHours(checkOutHour, checkOutMin, 0, 0);

      const status = isLeave ? "LEAVE" : (isLate ? "LATE" : "PRESENT");

      await prisma.attendance.create({
        data: {
          employeeId: profile.id,
          date: d,
          checkIn: isLeave ? null : checkInDate,
          checkOut: isLeave ? null : checkOutDate,
          status,
        }
      });
    }
  }
  console.log(`Seeded 5-day Attendance records for all ${createdProfiles.length} employees!`);

  // 7. Seed Leave Requests
  const sampleLeaves = [
    {
      empIdx: 2, // Nguyễn Văn An
      startDate: new Date(2026, 9, 10),
      endDate: new Date(2026, 9, 12),
      type: "ANNUAL_LEAVE",
      status: "APPROVED",
      reason: "Nghỉ phép thường niên đi du lịch gia đình",
    },
    {
      empIdx: 4, // Phạm Thùy Linh
      startDate: new Date(2026, 8, 20),
      endDate: new Date(2026, 8, 22),
      type: "SICK_LEAVE",
      status: "APPROVED",
      reason: "Nghỉ ốm theo chỉ định của bác sĩ tại bệnh viện",
    },
    {
      empIdx: 5, // Vũ Minh Tuấn
      startDate: new Date(2026, 9, 18),
      endDate: new Date(2026, 9, 19),
      type: "ANNUAL_LEAVE",
      status: "PENDING",
      reason: "Giải quyết việc cá nhân gia đình tại quê",
    },
    {
      empIdx: 11, // Bùi Ngọc Thanh
      startDate: new Date(2026, 8, 28),
      endDate: new Date(2026, 8, 29),
      type: "UNPAID_LEAVE",
      status: "APPROVED",
      reason: "Khám sức khỏe chuyên sâu",
    },
    {
      empIdx: 14, // Đinh Thị Lan Hương
      startDate: new Date(2026, 9, 5),
      endDate: new Date(2026, 9, 6),
      type: "ANNUAL_LEAVE",
      status: "REJECTED",
      reason: "Trùng lịch demo giải pháp và đàm phán hợp đồng với đối tác lớn",
    },
    {
      empIdx: 16, // Trần Đăng Khoa
      startDate: new Date(2026, 9, 25),
      endDate: new Date(2026, 9, 26),
      type: "ANNUAL_LEAVE",
      status: "PENDING",
      reason: "Tham dự đám cưới em gái",
    }
  ];

  for (const req of sampleLeaves) {
    if (createdProfiles[req.empIdx]) {
      await prisma.leaveRequest.create({
        data: {
          employeeId: createdProfiles[req.empIdx].id,
          startDate: req.startDate,
          endDate: req.endDate,
          type: req.type,
          status: req.status,
          reason: req.reason,
        }
      });
    }
  }
  console.log("Seeded Leave Requests!");

  // 8. Seed Payroll (Month 8 and Month 9 for all employees)
  for (const profile of createdProfiles) {
    const bonus = Math.floor(Math.random() * 5) * 500000;
    const deductions = Math.floor(profile.baseSalary * 0.105); // 10.5% Social insurance
    const netSalary = profile.baseSalary + bonus - deductions;

    // Month 8 - PAID
    await prisma.payroll.create({
      data: {
        employeeId: profile.id,
        month: 8,
        year: 2026,
        baseSalary: profile.baseSalary,
        bonus,
        deductions,
        netSalary,
        status: "PAID",
      }
    });

    // Month 9 - DRAFT
    await prisma.payroll.create({
      data: {
        employeeId: profile.id,
        month: 9,
        year: 2026,
        baseSalary: profile.baseSalary,
        bonus: bonus + 500000,
        deductions,
        netSalary: profile.baseSalary + bonus + 500000 - deductions,
        status: "DRAFT",
      }
    });
  }
  console.log("Seeded 2 months Payroll records for all employees!");

  // 9. Seed Recruitment (Jobs, Applications, Interviews)
  const job1 = await prisma.jobPosting.create({
    data: {
      title: "Senior Fullstack Engineer (Next.js / Node.js)",
      description: "Tham gia phát triển và tối ưu hóa hệ thống phần mềm quản trị doanh nghiệp HRMIS. Yêu cầu 3+ năm kinh nghiệm với React, Next.js, PostgreSQL và TypeScript.",
      departmentId: itDept.id,
      headcount: 2,
      status: "OPEN",
      dueDate: new Date(2026, 10, 15),
    }
  });

  const job2 = await prisma.jobPosting.create({
    data: {
      title: "Chuyên viên Tuyển dụng & Thu hút Nhân tài (Talent Acquisition)",
      description: "Chịu trách nhiệm toàn trình tuyển dụng nhân sự khối công nghệ và kinh doanh, xây dựng thương hiệu nhà tuyển dụng.",
      departmentId: hrDept.id,
      headcount: 1,
      status: "OPEN",
      dueDate: new Date(2026, 10, 30),
    }
  });

  const job3 = await prisma.jobPosting.create({
    data: {
      title: "Trưởng nhóm Kinh doanh Giải pháp Doanh nghiệp B2B",
      description: "Dẫn dắt đội ngũ tư vấn phần mềm SaaS quản trị nhân lực cho các tập đoàn và doanh nghiệp vừa và lớn.",
      departmentId: salesDept.id,
      headcount: 2,
      status: "OPEN",
      dueDate: new Date(2026, 11, 1),
    }
  });

  const job4 = await prisma.jobPosting.create({
    data: {
      title: "Kế toán viên Tổng hợp & Quản trị Chi phí",
      description: "Kiểm soát chi phí hoạt động, lập tờ khai thuế, đối chiếu công nợ và quyết toán tiền lương.",
      departmentId: faDept.id,
      headcount: 1,
      status: "OPEN",
      dueDate: new Date(2026, 10, 20),
    }
  });

  // Applications for Job 1
  const app1 = await prisma.application.create({
    data: {
      jobPostingId: job1.id,
      candidateName: "Trần Minh Tâm",
      candidateEmail: "tam.tran@gmail.com",
      candidatePhone: "0912345678",
      cvUrl: "https://hrmis.com/cvs/tam-tran-fullstack.pdf",
      status: "APPLIED",
    }
  });

  const app2 = await prisma.application.create({
    data: {
      jobPostingId: job1.id,
      candidateName: "Ngô Quang Huy",
      candidateEmail: "huy.ngo@gmail.com",
      candidatePhone: "0912345679",
      cvUrl: "https://hrmis.com/cvs/huy-ngo-senior.pdf",
      status: "REVIEWING",
    }
  });

  const app3 = await prisma.application.create({
    data: {
      jobPostingId: job1.id,
      candidateName: "Đỗ Hải Nam",
      candidateEmail: "nam.do@gmail.com",
      candidatePhone: "0912345680",
      cvUrl: "https://hrmis.com/cvs/nam-do-lead.pdf",
      status: "INTERVIEWING",
    }
  });

  const app4 = await prisma.application.create({
    data: {
      jobPostingId: job1.id,
      candidateName: "Hoàng Gia Bảo",
      candidateEmail: "bao.hoang@gmail.com",
      candidatePhone: "0912345681",
      cvUrl: "https://hrmis.com/cvs/bao-hoang.pdf",
      status: "OFFERED",
    }
  });

  // Applications for Job 2
  await prisma.application.create({
    data: {
      jobPostingId: job2.id,
      candidateName: "Nguyễn Khánh Linh",
      candidateEmail: "linh.khanh@gmail.com",
      candidatePhone: "0912345682",
      cvUrl: "https://hrmis.com/cvs/linh-khanh-ta.pdf",
      status: "APPLIED",
    }
  });

  await prisma.application.create({
    data: {
      jobPostingId: job2.id,
      candidateName: "Phạm Quỳnh Anh",
      candidateEmail: "quynhanh.pham@gmail.com",
      candidatePhone: "0912345683",
      cvUrl: "https://hrmis.com/cvs/quynhanh-hr.pdf",
      status: "HIRED",
    }
  });

  // Schedule an interview
  await prisma.interview.create({
    data: {
      applicationId: app3.id,
      interviewerId: createdProfiles[1].userId, // Trưởng phòng IT
      scheduledAt: new Date(2026, 9, 5, 14, 0),
      result: "PASS",
      notes: "Ứng viên có kiến trúc phần mềm tốt, nắm vững Next.js và microservices",
    }
  });
  console.log("Seeded Recruitment Job Postings, Applications and Interviews!");

  // 10. Seed Personnel Changes (6 rich records)
  await prisma.personnelChange.createMany({
    data: [
      {
        code: "QĐ-2026-041",
        employeeName: "Nguyễn Văn An",
        employeeEmail: "user@hrmis.com",
        type: "PROMOTION",
        fromDept: "Phòng Công nghệ (IT)",
        toDept: "Phòng Công nghệ (IT)",
        fromPosition: "Frontend Developer",
        toPosition: "Senior Frontend Lead",
        effectiveDate: "01/10/2026",
        signer: "Lê Tuấn Anh (IT Manager)",
        status: "APPROVED"
      },
      {
        code: "QĐ-2026-042",
        employeeName: "Trần Thị Mai",
        employeeEmail: "hr@hrmis.com",
        type: "PROMOTION",
        fromDept: "Phòng Nhân sự & Đào tạo (HR)",
        toDept: "Phòng Nhân sự & Đào tạo (HR)",
        fromPosition: "Chuyên viên Nhân sự Cấp cao",
        toPosition: "Trưởng phòng Nhân sự (HR Manager)",
        effectiveDate: "15/09/2026",
        signer: "Quản trị viên (CEO)",
        status: "APPROVED"
      },
      {
        code: "QĐ-2026-043",
        employeeName: "Lê Hoàng Phúc",
        employeeEmail: "phuc.le@hrmis.com",
        type: "TRANSFER",
        fromDept: "Phòng Kinh doanh & Thị trường",
        toDept: "Phòng Nhân sự & Đào tạo (HR)",
        fromPosition: "Chuyên viên Đào tạo Khách hàng",
        toPosition: "Chuyên viên L&D Nội bộ",
        effectiveDate: "01/09/2026",
        signer: "Quản trị viên (CEO)",
        status: "APPROVED"
      },
      {
        code: "QĐ-2026-044",
        employeeName: "Vũ Minh Tuấn",
        employeeEmail: "tuan.vu@hrmis.com",
        type: "NEW_HIRE",
        fromDept: "Thị trường ngoài",
        toDept: "Phòng Công nghệ (IT)",
        fromPosition: "Chưa có",
        toPosition: "DevOps & Cloud Engineer",
        effectiveDate: "15/08/2026",
        signer: "Trần Thị Mai (HR Manager)",
        status: "APPROVED"
      },
      {
        code: "QĐ-2026-045",
        employeeName: "Lê Quốc Bảo",
        employeeEmail: "bao.le@hrmis.com",
        type: "PROMOTION",
        fromDept: "Phòng Kinh doanh & Thị trường",
        toDept: "Phòng Kinh doanh & Thị trường",
        fromPosition: "Chuyên viên Kinh doanh Cấp cao",
        toPosition: "Trưởng nhóm B2B Lead",
        effectiveDate: "01/10/2026",
        signer: "Nguyễn Hoàng Nam (Sales Director)",
        status: "APPROVED"
      }
    ]
  });
  console.log("Seeded Personnel Changes!");

  // 11. Seed Training Courses & Surveys
  await prisma.trainingCourse.createMany({
    data: [
      {
        title: "Chương trình Hội nhập Tân binh Doanh nghiệp (Onboarding)",
        instructor: "Phòng Nhân sự & Đào tạo (HR)",
        category: "Văn hóa Doanh nghiệp",
        duration: "16 giờ (4 buổi)",
        participants: 18,
        progress: 85,
        startDate: "05/09/2026",
        status: "IN_PROGRESS"
      },
      {
        title: "Nâng cao Kỹ năng Quản trị & Thiết lập Mục tiêu OKRs",
        instructor: "Chuyên gia Viện Quản trị Chiến lược",
        category: "Phát triển Lãnh đạo",
        duration: "24 giờ (6 buổi)",
        participants: 12,
        progress: 100,
        startDate: "10/08/2026",
        status: "COMPLETED"
      },
      {
        title: "Bảo mật Dữ liệu Doanh nghiệp & Chuẩn ISO 27001",
        instructor: "Vũ Minh Tuấn (DevOps & Security)",
        category: "Tuân thủ & An toàn",
        duration: "8 giờ (2 buổi)",
        participants: 45,
        progress: 40,
        startDate: "12/10/2026",
        status: "ENROLLING"
      },
      {
        title: "Kỹ năng Đàm phán & Chốt Hợp đồng Khách hàng Doanh nghiệp B2B",
        instructor: "Nguyễn Hoàng Nam (Sales Director)",
        category: "Kỹ năng Chuyên môn",
        duration: "12 giờ (3 buổi)",
        participants: 10,
        progress: 60,
        startDate: "20/09/2026",
        status: "IN_PROGRESS"
      }
    ]
  });

  await prisma.survey.createMany({
    data: [
      {
        title: "Khảo sát Chỉ số Hài lòng & Gắn kết Nhân viên (eNPS Q3/2026)",
        targetDept: "Toàn bộ Doanh nghiệp",
        respondents: 44,
        totalTarget: 48,
        deadline: "10/10/2026",
        score: 4.8,
        status: "ACTIVE"
      },
      {
        title: "Đánh giá Môi trường Làm việc & Văn hóa Chia sẻ",
        targetDept: "Toàn bộ Doanh nghiệp",
        respondents: 46,
        totalTarget: 48,
        deadline: "30/09/2026",
        score: 4.6,
        status: "ACTIVE"
      },
      {
        title: "Khảo sát Nhu cầu Đào tạo Kỹ năng Quý 4/2026",
        targetDept: "Khối Công nghệ & Sản phẩm",
        respondents: 16,
        totalTarget: 18,
        deadline: "15/10/2026",
        score: 4.5,
        status: "ACTIVE"
      }
    ]
  });
  console.log("Seeded Training Courses & Surveys!");

  // 12. Seed Succession Plans (Cadre Planning)
  await prisma.successionPlan.createMany({
    data: [
      {
        position: "Giám đốc Công nghệ (CTO)",
        department: "Phòng Công nghệ (IT)",
        currentHolder: "Lê Tuấn Anh (IT Manager)",
        successorName: "Nguyễn Văn An",
        successorEmail: "user@hrmis.com",
        readiness: "READY_1_2_YEARS",
        potentialScore: "HIGH",
        mentor: "Quản trị viên (Admin HQ)",
        plannedYear: "2026 - 2028",
        status: "APPROVED"
      },
      {
        position: "Giám đốc Nhân sự Tập đoàn (CHRO)",
        department: "Phòng Nhân sự & Đào tạo (HR)",
        currentHolder: "Trần Thị Mai (HR Manager)",
        successorName: "Đỗ Kim Ngân",
        successorEmail: "ngan.do@hrmis.com",
        readiness: "READY_NOW",
        potentialScore: "HIGH",
        mentor: "Ban Tổng Giám Đốc",
        plannedYear: "2026 - 2027",
        status: "APPROVED"
      },
      {
        position: "Giám đốc Tài chính (CFO)",
        department: "Phòng Tài chính - Kế toán",
        currentHolder: "Đặng Thu Hòa (Kế toán trưởng)",
        successorName: "Trần Nhật Quang",
        successorEmail: "quang.tran@hrmis.com",
        readiness: "READY_1_2_YEARS",
        potentialScore: "HIGH",
        mentor: "Đặng Thu Hòa",
        plannedYear: "2027 - 2029",
        status: "APPROVED"
      },
      {
        position: "Phó Giám đốc Kinh doanh Toàn quốc",
        department: "Phòng Kinh doanh & Thị trường",
        currentHolder: "Nguyễn Hoàng Nam (Sales Director)",
        successorName: "Lê Quốc Bảo",
        successorEmail: "bao.le@hrmis.com",
        readiness: "READY_NOW",
        potentialScore: "HIGH",
        mentor: "Nguyễn Hoàng Nam",
        plannedYear: "2026 - 2027",
        status: "APPROVED"
      }
    ]
  });
  console.log("Seeded Cadre Succession Plans!");

  // 13. Seed Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userName: "Quản trị viên (Admin HQ)",
        userRole: "SYSTEM_ADMIN",
        action: "Cập nhật cấu hình hệ thống & nạp dữ liệu toàn doanh nghiệp",
        target: "System / Database Seed",
        ip: "127.0.0.1 (Localhost)",
        status: "SUCCESS"
      },
      {
        userName: "Trần Thị Mai (HR Manager)",
        userRole: "HR",
        action: "Ban hành bảng tính lương Tháng 08/2026",
        target: "Payroll / Batch Calculate",
        ip: "192.168.1.45",
        status: "SUCCESS"
      },
      {
        userName: "Lê Tuấn Anh (IT Manager)",
        userRole: "MANAGER",
        action: "Phê duyệt Đơn xin nghỉ phép của Nguyễn Văn An",
        target: "LeaveRequest / EMP-03",
        ip: "192.168.1.32",
        status: "SUCCESS"
      },
      {
        userName: "Đặng Thu Hòa (Kế toán trưởng)",
        userRole: "MANAGER",
        action: "Đối soát và xác nhận chi trả lương chuyển khoản",
        target: "Finance / Disbursement",
        ip: "192.168.1.18",
        status: "SUCCESS"
      },
      {
        userName: "Nguyễn Văn An (Lead)",
        userRole: "USER",
        action: "Điểm danh Check-in hệ thống (Đúng giờ: 08:14)",
        target: "Attendance / CheckIn",
        ip: "192.168.1.108",
        status: "SUCCESS"
      }
    ]
  });
  console.log("Seeded Audit Logs!");

  console.log("\n=======================================================");
  console.log("  DATABASE FULLY POPULATED WITH 38 ENTERPRISE EMPLOYEES");
  console.log("=======================================================");
  console.log("Admin:    admin@hrmis.com   / password123 (SYSTEM_ADMIN)");
  console.log("Manager:  manager@hrmis.com / password123 (IT Manager)");
  console.log("HR:       hr@hrmis.com      / password123 (HR Manager)");
  console.log("User:     user@hrmis.com    / password123 (Frontend Lead)");
  console.log("Finance:  hoa.dang@hrmis.com / password123 (Chief Accountant)");
  console.log("Sales:    nam.nguyen@hrmis.com / password123 (Sales Director)");
  console.log("Marketing: trang.vu@hrmis.com / password123 (Marketing Manager)");
  console.log("=======================================================\n");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
