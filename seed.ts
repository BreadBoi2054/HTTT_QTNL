import "dotenv/config";
import { prisma, pool } from "./src/lib/prisma";
import bcrypt from "bcryptjs";
import { calculateMonthlyPayroll } from "./src/services/payroll.service";

async function main() {
  console.log("🚀 Bắt đầu bơm dữ liệu toàn diện (Up-to-date đến Tháng 10/2026)...");

  // 1. Xóa dữ liệu cũ theo đúng thứ tự khóa ngoại
  await prisma.auditLog.deleteMany({});
  await prisma.personnelChange.deleteMany({});
  await prisma.surveyResponse.deleteMany({});
  await prisma.survey.deleteMany({});
  await prisma.trainingCourse.deleteMany({});
  await prisma.successionPlan.deleteMany({});
  await prisma.interview.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.jobPosting.deleteMany({});
  await prisma.payroll.deleteMany({});
  await prisma.employeeSalaryComponent.deleteMany({});
  await prisma.employeeSalaryConfig.deleteMany({});
  await prisma.salaryComponent.deleteMany({});
  await prisma.overtimeRequest.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.contract.deleteMany({});
  await prisma.performanceEvaluation.deleteMany({});
  await prisma.workCalendarYear.deleteMany({});

  await prisma.department.updateMany({ data: { managerId: null } });
  await prisma.employeeProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.role.deleteMany({});

  console.log("✅ Đã làm sạch dữ liệu cũ!");

  // 2. Tạo 6 Vai trò RBAC chuẩn Doanh nghiệp
  const adminRole = await prisma.role.create({
    data: {
      name: "SYSTEM_ADMIN",
      permissions: "MANAGE_ROLES,MANAGE_SETTINGS,VIEW_AUDIT_LOGS,VIEW_DASHBOARD",
    },
  });
  const bodRole = await prisma.role.create({
    data: {
      name: "BOD",
      permissions:
        "VIEW_DASHBOARD,MANAGE_PAYROLL,MANAGE_EMPLOYEES,MANAGE_DEPARTMENTS,MANAGE_CONTRACTS,MANAGE_PERFORMANCE,MANAGE_CADRE,MANAGE_PERSONNEL_CHANGES,VIEW_AUDIT_LOGS",
    },
  });
  const accountantRole = await prisma.role.create({
    data: {
      name: "ACCOUNTANT",
      permissions: "VIEW_DASHBOARD,MANAGE_PAYROLL,VIEW_AUDIT_LOGS",
    },
  });
  const hrRole = await prisma.role.create({
    data: {
      name: "HR",
      permissions:
        "VIEW_DASHBOARD,MANAGE_EMPLOYEES,MANAGE_CONTRACTS,MANAGE_ATTENDANCE,MANAGE_PAYROLL,MANAGE_PERFORMANCE,MANAGE_RECRUITMENT,MANAGE_PERSONNEL_CHANGES,MANAGE_TRAINING,MANAGE_CADRE",
    },
  });
  const managerRole = await prisma.role.create({
    data: {
      name: "MANAGER",
      permissions:
        "VIEW_DASHBOARD,MANAGE_ATTENDANCE,MANAGE_PERFORMANCE,MANAGE_LEAVE,MANAGE_RECRUITMENT",
    },
  });
  const userRole = await prisma.role.create({
    data: {
      name: "USER",
      permissions: "VIEW_DASHBOARD,MANAGE_ATTENDANCE,MANAGE_LEAVE",
    },
  });

  console.log("✅ Đã khởi tạo 6 Vai trò Phân quyền (RBAC)!");

  // 3. Mật khẩu mặc định cho toàn bộ tài khoản test
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 4. Tạo 6 Phòng ban Doanh nghiệp
  const itDept = await prisma.department.create({
    data: {
      name: "Phòng Công nghệ (IT)",
      description:
        "Nghiên cứu, phát triển và bảo trì hạ tầng công nghệ, hệ thống phần mềm HRMIS",
    },
  });

  const hrDept = await prisma.department.create({
    data: {
      name: "Phòng Nhân sự & Đào tạo (HR)",
      description:
        "Quản trị nhân lực, tuyển dụng, tiền lương đãi ngộ và phát triển nhân tài",
    },
  });

  const faDept = await prisma.department.create({
    data: {
      name: "Phòng Tài chính - Kế toán",
      description:
        "Quản lý thu chi, kiểm soát tài chính, lập báo cáo tài chính và tuân thủ thuế",
    },
  });

  const salesDept = await prisma.department.create({
    data: {
      name: "Phòng Kinh doanh & Phát triển thị trường",
      description:
        "Phát triển khách hàng doanh nghiệp B2B, mở rộng thị phần và quản trị doanh thu",
    },
  });

  const mktDept = await prisma.department.create({
    data: {
      name: "Phòng Marketing & Truyền thông",
      description:
        "Xây dựng thương hiệu doanh nghiệp, truyền thông số và định vị giải pháp",
    },
  });

  const bodDept = await prisma.department.create({
    data: {
      name: "Ban Tổng Giám Đốc (BOD)",
      description:
        "Hội đồng quản trị và Ban điều hành chiến lược phát triển toàn tập đoàn",
    },
  });

  console.log("✅ Đã khởi tạo 6 Phòng ban!");

  // 5. Khởi tạo Danh mục Phụ cấp lương (SalaryComponent)
  const compLunch = await prisma.salaryComponent.create({
    data: {
      id: "comp_lunch_allowance",
      name: "Phụ cấp ăn trưa",
      type: "EARNING",
      amountType: "FIXED",
      defaultVal: 730000, // Mức miễn thuế TNCN chuẩn
    },
  });

  const compFuel = await prisma.salaryComponent.create({
    data: {
      id: "comp_fuel_comm",
      name: "Phụ cấp xăng xe & liên lạc",
      type: "EARNING",
      amountType: "FIXED",
      defaultVal: 500000,
    },
  });

  const compResponsibility = await prisma.salaryComponent.create({
    data: {
      id: "comp_responsibility",
      name: "Phụ cấp trách nhiệm quản lý",
      type: "EARNING",
      amountType: "FIXED",
      defaultVal: 2000000,
    },
  });

  // 6. Khởi tạo Lịch công & Ngày nghỉ lễ chuẩn năm 2026 (WorkCalendarYear)
  await prisma.workCalendarYear.create({
    data: {
      year: 2026,
      holidays: [
        "2026-01-01", // Tết Dương lịch
        "2026-02-16", // Nghỉ Tết Nguyên Đán Bính Ngọ
        "2026-02-17", // Mùng 1 Tết Bính Ngọ
        "2026-02-18", // Mùng 2 Tết
        "2026-02-19", // Mùng 3 Tết
        "2026-02-20", // Mùng 4 Tết
        "2026-04-26", // Giỗ Tổ Hùng Vương (10/3 ÂL)
        "2026-04-30", // Ngày Giải phóng miền Nam 30/4
        "2026-05-01", // Quốc tế Lao động 1/5
        "2026-09-02", // Quốc khánh 2/9
        "2026-09-03", // Nghỉ liền kề Quốc khánh 2/9
      ],
      extraWorkdays: [
        "2026-04-25", // Làm bù thứ Bảy trước lễ 30/4
        "2026-09-05", // Làm bù thứ Bảy sau lễ Quốc khánh 2/9
      ],
      note: "Lịch nghỉ lễ, Tết hưởng nguyên lương năm 2026 theo Bộ luật Lao động 2019 (Điều 112)",
      updatedBy: "Trần Thị Mai (HR Manager)",
    },
  });
  console.log("✅ Đã khởi tạo Lịch công & Ngày nghỉ lễ chuẩn 2026!");

  // 7. Tạo 39 Nhân sự thuộc 6 Phòng ban
  const rawEmployees = [
    // 1. Ban Tổng Giám Đốc (BOD) (4 nhân sự)
    {
      name: "Đỗ Minh Hiếu",
      email: "ceo@nexustech.vn",
      roleId: bodRole.id,
      deptId: bodDept.id,
      position: "Tổng Giám Đốc (CEO & Ban Điều Hành)",
      phone: "0987654001",
      address: "Hoàn Kiếm, Hà Nội",
      baseSalary: 75000000,
      dependentCount: 2,
      isManagerOfDept: bodDept.id,
    },
    {
      name: "Vũ Đình Trọng",
      email: "trong.vu@nexustech.vn",
      roleId: bodRole.id,
      deptId: bodDept.id,
      position: "Phó Tổng Giám Đốc Kỹ thuật & Hạ tầng (CTO)",
      phone: "0987654002",
      address: "Tây Hồ, Hà Nội",
      baseSalary: 55000000,
      dependentCount: 2,
    },
    {
      name: "Phạm Hoàng Long",
      email: "long.pham@nexustech.vn",
      roleId: bodRole.id,
      deptId: bodDept.id,
      position: "Phó Tổng Giám Đốc Vận hành & Tài chính (COO)",
      phone: "0987654003",
      address: "Ba Đình, Hà Nội",
      baseSalary: 52000000,
      dependentCount: 1,
    },
    {
      name: "Hoàng Thu Uyên",
      email: "uyen.hoang@nexustech.vn",
      roleId: userRole.id,
      deptId: bodDept.id,
      position: "Thư ký Hội đồng & Trợ lý Điều hành BOD",
      phone: "0987654004",
      address: "Cầu Giấy, Hà Nội",
      baseSalary: 25000000,
      dependentCount: 1,
    },

    // 2. Phòng Công nghệ (IT) (9 nhân sự)
    {
      name: "Nguyễn Tuấn IT Admin",
      email: "admin@nexustech.vn",
      roleId: adminRole.id,
      deptId: itDept.id,
      position: "Quản trị viên Hệ thống (System Administrator)",
      phone: "0987654099",
      address: "Cầu Giấy, Hà Nội",
      baseSalary: 35000000,
      dependentCount: 1,
    },
    {
      name: "Lê Tuấn Anh",
      email: "manager@nexustech.vn",
      roleId: managerRole.id,
      deptId: itDept.id,
      position: "Giám đốc Kỹ thuật / IT Manager",
      phone: "0987654005",
      address: "Cầu Giấy, Hà Nội",
      baseSalary: 45000000,
      dependentCount: 2,
      isManagerOfDept: itDept.id,
    },
    {
      name: "Nguyễn Văn An",
      email: "user@nexustech.vn",
      roleId: userRole.id,
      deptId: itDept.id,
      position: "Senior Frontend Lead & Tech Lead",
      phone: "0987654006",
      address: "Nam Từ Liêm, Hà Nội",
      baseSalary: 32000000,
      dependentCount: 1,
    },
    {
      name: "Nguyễn Hoàng Duy",
      email: "duy.nguyen@nexustech.vn",
      roleId: userRole.id,
      deptId: itDept.id,
      position: "Backend Architect (Node/Go/Postgres)",
      phone: "0987654007",
      address: "Thanh Xuân, Hà Nội",
      baseSalary: 34000000,
      dependentCount: 1,
    },
    {
      name: "Phạm Thùy Linh",
      email: "linh.pham@nexustech.vn",
      roleId: userRole.id,
      deptId: itDept.id,
      position: "UI/UX Product Designer & Design System Lead",
      phone: "0987654008",
      address: "Đống Đa, Hà Nội",
      baseSalary: 26000000,
      dependentCount: 0,
    },
    {
      name: "Vũ Minh Tuấn",
      email: "tuan.vu@nexustech.vn",
      roleId: userRole.id,
      deptId: itDept.id,
      position: "DevOps & Cloud Security Engineer",
      phone: "0987654009",
      address: "Hà Đông, Hà Nội",
      baseSalary: 28000000,
      dependentCount: 1,
    },
    {
      name: "Trần Thảo My",
      email: "my.tran@nexustech.vn",
      roleId: userRole.id,
      deptId: itDept.id,
      position: "Senior React/Next.js Engineer",
      phone: "0987654010",
      address: "Bắc Từ Liêm, Hà Nội",
      baseSalary: 27000000,
      dependentCount: 0,
    },
    {
      name: "Đỗ Hùng Dũng",
      email: "dung.do@nexustech.vn",
      roleId: userRole.id,
      deptId: itDept.id,
      position: "Mobile Application Engineer (Flutter/iOS)",
      phone: "0987654011",
      address: "Hoàng Mai, Hà Nội",
      baseSalary: 26000000,
      dependentCount: 1,
    },
    {
      name: "Lê Thúy Hằng",
      email: "hang.le@nexustech.vn",
      roleId: userRole.id,
      deptId: itDept.id,
      position: "QA/QC & Automation Test Engineer",
      phone: "0987654012",
      address: "Long Biên, Hà Nội",
      baseSalary: 22000000,
      dependentCount: 0,
    },

    // 3. Phòng Nhân sự & Đào tạo (HR) (6 nhân sự)
    {
      name: "Trần Thị Mai",
      email: "hr@nexustech.vn",
      roleId: hrRole.id,
      deptId: hrDept.id,
      position: "Trưởng phòng Nhân sự (HR Manager)",
      phone: "0987654013",
      address: "Ba Đình, Hà Nội",
      baseSalary: 38000000,
      dependentCount: 2,
      isManagerOfDept: hrDept.id,
    },
    {
      name: "Đỗ Kim Ngân",
      email: "ngan.do@nexustech.vn",
      roleId: hrRole.id,
      deptId: hrDept.id,
      position: "Phó phòng Nhân sự & Đãi ngộ (C&B Lead)",
      phone: "0987654014",
      address: "Tây Hồ, Hà Nội",
      baseSalary: 25000000,
      dependentCount: 1,
    },
    {
      name: "Nguyễn Bích Phương",
      email: "phuong.nguyen@nexustech.vn",
      roleId: hrRole.id,
      deptId: hrDept.id,
      position: "Chuyên viên Tuyển dụng Cấp cao (Senior TA)",
      phone: "0987654015",
      address: "Cầu Giấy, Hà Nội",
      baseSalary: 22000000,
      dependentCount: 0,
    },
    {
      name: "Lê Hoàng Phúc",
      email: "phuc.le@nexustech.vn",
      roleId: userRole.id,
      deptId: hrDept.id,
      position: "Chuyên viên Đào tạo & Phát triển (L&D Specialist)",
      phone: "0987654016",
      address: "Hoàng Mai, Hà Nội",
      baseSalary: 20000000,
      dependentCount: 0,
    },
    {
      name: "Vũ Kiều Oanh",
      email: "oanh.vu@nexustech.vn",
      roleId: userRole.id,
      deptId: hrDept.id,
      position: "Chuyên viên Tiền lương & BHXH (C&B Officer)",
      phone: "0987654017",
      address: "Đống Đa, Hà Nội",
      baseSalary: 18000000,
      dependentCount: 0,
    },
    {
      name: "Trịnh Đức Anh",
      email: "anh.trinh@nexustech.vn",
      roleId: userRole.id,
      deptId: hrDept.id,
      position: "Chuyên viên Quan hệ Lao động & Văn hóa Doanh nghiệp",
      phone: "0987654018",
      address: "Hai Bà Trưng, Hà Nội",
      baseSalary: 19000000,
      dependentCount: 0,
    },

    // 4. Phòng Tài chính - Kế toán (6 nhân sự)
    {
      name: "Đặng Thu Hòa",
      email: "accountant@nexustech.vn",
      roleId: accountantRole.id,
      deptId: faDept.id,
      position: "Kế toán trưởng (Chief Accountant)",
      phone: "0987654019",
      address: "Hai Bà Trưng, Hà Nội",
      baseSalary: 40000000,
      dependentCount: 2,
      isManagerOfDept: faDept.id,
    },
    {
      name: "Dương Minh Đức",
      email: "duc.duong@nexustech.vn",
      roleId: userRole.id,
      deptId: faDept.id,
      position: "Phó phòng Kế toán & Kiểm soát Chi phí",
      phone: "0987654020",
      address: "Thanh Xuân, Hà Nội",
      baseSalary: 28000000,
      dependentCount: 1,
    },
    {
      name: "Trần Nhật Quang",
      email: "quang.tran@nexustech.vn",
      roleId: userRole.id,
      deptId: faDept.id,
      position: "Chuyên viên Phân tích Tài chính Doanh nghiệp (FP&A)",
      phone: "0987654021",
      address: "Long Biên, Hà Nội",
      baseSalary: 24000000,
      dependentCount: 0,
    },
    {
      name: "Bùi Ngọc Thanh",
      email: "thanh.bui@nexustech.vn",
      roleId: userRole.id,
      deptId: faDept.id,
      position: "Kế toán viên Tổng hợp & Báo cáo Thuế",
      phone: "0987654022",
      address: "Cầu Giấy, Hà Nội",
      baseSalary: 20000000,
      dependentCount: 1,
    },
    {
      name: "Phạm Mai Hương",
      email: "huong.pham@nexustech.vn",
      roleId: userRole.id,
      deptId: faDept.id,
      position: "Kế toán Thanh toán & Giao dịch Ngân hàng",
      phone: "0987654023",
      address: "Nam Từ Liêm, Hà Nội",
      baseSalary: 18000000,
      dependentCount: 0,
    },
    {
      name: "Ngô Bảo Châu",
      email: "chau.ngo@nexustech.vn",
      roleId: userRole.id,
      deptId: faDept.id,
      position: "Thủ quỹ Doanh nghiệp & Quản lý Thu chi",
      phone: "0987654024",
      address: "Hoàn Kiếm, Hà Nội",
      baseSalary: 16000000,
      dependentCount: 0,
    },

    // 5. Phòng Kinh doanh & Phát triển thị trường (8 nhân sự)
    {
      name: "Nguyễn Hoàng Nam",
      email: "nam.nguyen@nexustech.vn",
      roleId: managerRole.id,
      deptId: salesDept.id,
      position: "Giám đốc Kinh doanh (Sales Director)",
      phone: "0987654025",
      address: "Thanh Xuân, Hà Nội",
      baseSalary: 45000000,
      dependentCount: 2,
      isManagerOfDept: salesDept.id,
    },
    {
      name: "Lê Quốc Bảo",
      email: "bao.le@nexustech.vn",
      roleId: userRole.id,
      deptId: salesDept.id,
      position: "Phó Giám đốc Kinh doanh Miền Bắc",
      phone: "0987654026",
      address: "Nam Từ Liêm, Hà Nội",
      baseSalary: 30000000,
      dependentCount: 1,
    },
    {
      name: "Đinh Thị Lan Hương",
      email: "huong.dinh@nexustech.vn",
      roleId: userRole.id,
      deptId: salesDept.id,
      position: "Trưởng nhóm Khách hàng Doanh nghiệp (B2B Lead)",
      phone: "0987654027",
      address: "Đống Đa, Hà Nội",
      baseSalary: 25000000,
      dependentCount: 1,
    },
    {
      name: "Trần Đình Trọng",
      email: "trong.tran@nexustech.vn",
      roleId: userRole.id,
      deptId: salesDept.id,
      position: "Senior Account Executive (Enterprise SaaS)",
      phone: "0987654028",
      address: "Cầu Giấy, Hà Nội",
      baseSalary: 23000000,
      dependentCount: 0,
    },
    {
      name: "Nguyễn Thu Hà",
      email: "ha.nguyen@nexustech.vn",
      roleId: userRole.id,
      deptId: salesDept.id,
      position: "Key Account Manager (Khách hàng Chiến lược)",
      phone: "0987654029",
      address: "Ba Đình, Hà Nội",
      baseSalary: 22000000,
      dependentCount: 0,
    },
    {
      name: "Chu Văn Mạnh",
      email: "manh.chu@nexustech.vn",
      roleId: userRole.id,
      deptId: salesDept.id,
      position: "Chuyên viên Tư vấn Giải pháp Phần mềm (Solution Consultant)",
      phone: "0987654030",
      address: "Hà Đông, Hà Nội",
      baseSalary: 20000000,
      dependentCount: 0,
    },
    {
      name: "Lại Mỹ Linh",
      email: "linh.lai@nexustech.vn",
      roleId: userRole.id,
      deptId: salesDept.id,
      position: "Chuyên viên Phát triển Khách hàng Doanh nghiệp",
      phone: "0987654031",
      address: "Tây Hồ, Hà Nội",
      baseSalary: 18000000,
      dependentCount: 0,
    },
    {
      name: "Đặng Quốc Huy",
      email: "huy.dang@nexustech.vn",
      roleId: userRole.id,
      deptId: salesDept.id,
      position: "Chuyên viên Hỗ trợ Kinh doanh (Sales Admin & Contracts)",
      phone: "0987654032",
      address: "Hoàng Mai, Hà Nội",
      baseSalary: 16000000,
      dependentCount: 0,
    },

    // 6. Phòng Marketing & Truyền thông (6 nhân sự)
    {
      name: "Vũ Thu Trang",
      email: "trang.vu@nexustech.vn",
      roleId: managerRole.id,
      deptId: mktDept.id,
      position: "Trưởng phòng Marketing (Marketing Manager)",
      phone: "0987654033",
      address: "Cầu Giấy, Hà Nội",
      baseSalary: 36000000,
      dependentCount: 1,
      isManagerOfDept: mktDept.id,
    },
    {
      name: "Trần Đăng Khoa",
      email: "khoa.tran@nexustech.vn",
      roleId: userRole.id,
      deptId: mktDept.id,
      position: "Phó phòng Truyền thông & Thương hiệu (Brand Lead)",
      phone: "0987654034",
      address: "Ba Đình, Hà Nội",
      baseSalary: 24000000,
      dependentCount: 1,
    },
    {
      name: "Hoàng Đức Minh",
      email: "minh.hoang@nexustech.vn",
      roleId: userRole.id,
      deptId: mktDept.id,
      position: "Chuyên viên Tối ưu hóa Chiến dịch Số (Performance Marketing)",
      phone: "0987654035",
      address: "Hà Đông, Hà Nội",
      baseSalary: 22000000,
      dependentCount: 0,
    },
    {
      name: "Phan Thanh Thảo",
      email: "thao.phan@nexustech.vn",
      roleId: userRole.id,
      deptId: mktDept.id,
      position: "Content Marketing & Copywriting Lead",
      phone: "0987654036",
      address: "Đống Đa, Hà Nội",
      baseSalary: 20000000,
      dependentCount: 0,
    },
    {
      name: "Nguyễn Tiến Dũng",
      email: "dung.nguyen@nexustech.vn",
      roleId: userRole.id,
      deptId: mktDept.id,
      position: "Senior Graphic & Motion Designer",
      phone: "0987654037",
      address: "Thanh Xuân, Hà Nội",
      baseSalary: 21000000,
      dependentCount: 0,
    },
    {
      name: "Đỗ Diệu Linh",
      email: "linh.dieu@nexustech.vn",
      roleId: userRole.id,
      deptId: mktDept.id,
      position: "Chuyên viên SEO & Quản trị Mạng Xã hội (Social Media)",
      phone: "0987654038",
      address: "Long Biên, Hà Nội",
      baseSalary: 18000000,
      dependentCount: 0,
    },
  ];

  const createdProfiles: any[] = [];

  for (let i = 0; i < rawEmployees.length; i++) {
    const emp = rawEmployees[i];
    const joinDate = new Date(2024, i % 10, (i % 20) + 1);
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
            joinDate,
            annualLeaveDays: 12,
            dependentCount: emp.dependentCount ?? 0,
          },
        },
      },
      include: { employee: true },
    });

    if (user.employee) {
      createdProfiles.push({
        ...user.employee,
        baseSalary: emp.baseSalary,
        user: { name: user.name, email: user.email },
      });

      if (emp.isManagerOfDept) {
        await prisma.department.update({
          where: { id: emp.isManagerOfDept },
          data: { managerId: user.employee.id },
        });
      }

      // Cấu hình lương & Gán phụ cấp
      const salaryCfg = await prisma.employeeSalaryConfig.create({
        data: {
          employeeId: user.employee.id,
          baseSalary: emp.baseSalary,
        },
      });

      await prisma.employeeSalaryComponent.create({
        data: {
          configId: salaryCfg.id,
          componentId: compLunch.id,
          customAmount: 730000,
        },
      });

      await prisma.employeeSalaryComponent.create({
        data: {
          configId: salaryCfg.id,
          componentId: compFuel.id,
          customAmount: 500000,
        },
      });

      const isLeadership =
        emp.position.includes("Trưởng") ||
        emp.position.includes("Giám Đốc") ||
        emp.position.includes("Giám đốc") ||
        emp.position.includes("CEO") ||
        emp.position.includes("Lead") ||
        emp.position.includes("Kế toán trưởng");

      if (isLeadership) {
        await prisma.employeeSalaryComponent.create({
          data: {
            configId: salaryCfg.id,
            componentId: compResponsibility.id,
            customAmount: 2000000,
          },
        });
      }

      // Khởi tạo Hợp đồng lao động (Contract)
      const countStr = String(i + 1).padStart(4, "0");
      const code = `HĐLĐ-2024/NX-${countStr}`;
      let contractType = "Hợp đồng Không xác định thời hạn";
      let startDate = joinDate;
      let endDate: Date | null = null;
      let status = "ACTIVE";

      if (i % 6 === 1) {
        contractType = "Hợp đồng Xác định thời hạn 12 tháng";
        startDate = new Date("2025-11-01");
        endDate = new Date("2026-10-31");
        status = "EXPIRING_SOON";
      } else if (i % 6 === 2) {
        contractType = "Hợp đồng Xác định thời hạn 12 tháng";
        startDate = new Date("2025-11-15");
        endDate = new Date("2026-11-15");
        status = "EXPIRING_SOON";
      } else if (i >= 35) {
        contractType = "Hợp đồng Thử việc (02 tháng)";
        startDate = new Date("2026-09-01");
        endDate = new Date("2026-10-31");
        status = "ACTIVE";
      }

      await prisma.contract.create({
        data: {
          code,
          employeeId: user.employee.id,
          contractType,
          startDate,
          endDate,
          salary: emp.baseSalary,
          status,
          note: `Hợp đồng lao động tiêu chuẩn theo Bộ luật Lao động 2019 số ${code}.`,
        },
      });
    }
  }

  console.log(
    `✅ Đã tạo ${createdProfiles.length} Hồ sơ Nhân sự, Cấu hình Phụ cấp và 39 Hợp đồng lao động!`
  );

  // 8. Nạp dữ liệu Chấm công (Attendance) cho Tháng 08, Tháng 09 và Tháng 10/2026 đến ngày 21/10/2026
  const holidaysSet = new Set(["2026-09-02", "2026-09-03"]);
  const extraWorkdaysSet = new Set(["2026-09-05"]);

  const allAttendanceDays: Date[] = [];

  // Tháng 08/2026 (01/08 -> 31/08/2026)
  for (let day = 1; day <= 31; day++) {
    const d = new Date(Date.UTC(2026, 7, day));
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) {
      allAttendanceDays.push(d);
    }
  }

  // Tháng 09/2026 (01/09 -> 30/09/2026, trừ nghỉ lễ 2-3/9, cộng làm bù 5/9)
  for (let day = 1; day <= 30; day++) {
    const d = new Date(Date.UTC(2026, 8, day));
    const iso = d.toISOString().slice(0, 10);
    const dow = d.getUTCDay();
    if (holidaysSet.has(iso)) continue;
    if ((dow !== 0 && dow !== 6) || extraWorkdaysSet.has(iso)) {
      allAttendanceDays.push(d);
    }
  }

  // Tháng 10/2026 (01/10 -> 21/10/2026 - Up to date với ngày hiện tại)
  for (let day = 1; day <= 21; day++) {
    const d = new Date(Date.UTC(2026, 9, day));
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) {
      allAttendanceDays.push(d);
    }
  }

  const attendanceSeedBatch: any[] = [];
  for (let empIdx = 0; empIdx < createdProfiles.length; empIdx++) {
    const profile = createdProfiles[empIdx];
    for (let dayIdx = 0; dayIdx < allAttendanceDays.length; dayIdx++) {
      const d = allAttendanceDays[dayIdx];
      const iso = d.toISOString().slice(0, 10);

      // Ngày hôm nay (2026-10-21): Đảm bảo 37/39 nhân sự đi làm (35 đúng giờ, 2 đi muộn, 2 nghỉ phép)
      if (iso === "2026-10-21") {
        if (empIdx === 8 || empIdx === 22) {
          attendanceSeedBatch.push({
            employeeId: profile.id,
            date: d,
            checkIn: null,
            checkOut: null,
            status: "LEAVE",
          });
          continue;
        }
        const isLateToday = empIdx === 10 || empIdx === 29;
        const checkInDate = new Date(d);
        checkInDate.setHours(8, isLateToday ? 18 : (empIdx % 15), 0, 0);
        const checkOutDate = new Date(d);
        checkOutDate.setHours(17, 30 + (empIdx % 25), 0, 0);

        attendanceSeedBatch.push({
          employeeId: profile.id,
          date: d,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          status: isLateToday ? "LATE" : "PRESENT",
        });
        continue;
      }

      // Các ngày trước đó: Phân bổ xác suất cố định theo hash để số liệu ổn định và thực tế
      const seedVal = (empIdx * 17 + dayIdx * 31) % 100;
      const isLate = seedVal < 8; // 8% đi muộn
      const checkInMin = isLate ? 16 + (seedVal % 25) : seedVal % 15;
      const checkOutMin = 30 + (seedVal % 28);

      const checkInDate = new Date(d);
      checkInDate.setHours(8, checkInMin, 0, 0);

      const checkOutDate = new Date(d);
      checkOutDate.setHours(17, checkOutMin, 0, 0);

      attendanceSeedBatch.push({
        employeeId: profile.id,
        date: d,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        status: isLate ? "LATE" : "PRESENT",
      });
    }
  }

  await prisma.attendance.createMany({
    data: attendanceSeedBatch,
    skipDuplicates: true,
  });
  console.log(
    `✅ Đã nạp ${attendanceSeedBatch.length} bản ghi Chấm công xuyên suốt Tháng 08, 09 và đến ngày 21/10/2026!`
  );

  // 9. Nạp Đơn xin nghỉ phép (LeaveRequest) cập nhật Tháng 09 & 10/2026
  const sampleLeaves = [
    {
      empIdx: 6, // Nguyễn Văn An (Senior Frontend Lead)
      startDate: new Date("2026-10-12"),
      endDate: new Date("2026-10-13"),
      type: "ANNUAL_LEAVE",
      status: "APPROVED",
      reason: "Nghỉ phép thường niên đưa gia đình đi khám sức khỏe định kỳ",
    },
    {
      empIdx: 8, // Phạm Thùy Linh (UI/UX Designer) - Đang nghỉ hôm nay 21/10/2026
      startDate: new Date("2026-10-20"),
      endDate: new Date("2026-10-21"),
      type: "ANNUAL_LEAVE",
      status: "APPROVED",
      reason: "Nghỉ phép cá nhân giải quyết thủ tục hành chính tại địa phương",
    },
    {
      empIdx: 22, // Bùi Ngọc Thanh (Kế toán tổng hợp) - Đang nghỉ hôm nay 21/10/2026
      startDate: new Date("2026-10-21"),
      endDate: new Date("2026-10-22"),
      type: "SICK_LEAVE",
      status: "APPROVED",
      reason: "Nghỉ ốm theo chỉ định của bác sĩ (Có giấy chứng nhận BHXH)",
    },
    {
      empIdx: 9, // Vũ Minh Tuấn (DevOps Engineer)
      startDate: new Date("2026-10-23"),
      endDate: new Date("2026-10-24"),
      type: "ANNUAL_LEAVE",
      status: "PENDING",
      reason: "Xin nghỉ phép về quê dự lễ kỷ niệm của gia đình",
    },
    {
      empIdx: 15, // Nguyễn Bích Phương (Senior TA)
      startDate: new Date("2026-10-26"),
      endDate: new Date("2026-10-27"),
      type: "ANNUAL_LEAVE",
      status: "PENDING",
      reason: "Nghỉ phép thường niên sau đợt cao điểm tuyển dụng Q3",
    },
    {
      empIdx: 27, // Đinh Thị Lan Hương (B2B Lead)
      startDate: new Date("2026-10-08"),
      endDate: new Date("2026-10-09"),
      type: "ANNUAL_LEAVE",
      status: "REJECTED",
      reason: "Trùng lịch thuyết trình thầu dự án chuyển đổi số với Tập đoàn đối tác",
    },
    {
      empIdx: 34, // Trần Đăng Khoa (Brand Lead)
      startDate: new Date("2026-10-28"),
      endDate: new Date("2026-10-29"),
      type: "ANNUAL_LEAVE",
      status: "PENDING",
      reason: "Tham dự lễ cưới em ruột tại Đà Nẵng",
    },
    {
      empIdx: 12, // Lê Thúy Hằng (QA/QC)
      startDate: new Date("2026-09-17"),
      endDate: new Date("2026-09-18"),
      type: "ANNUAL_LEAVE",
      status: "APPROVED",
      reason: "Nghỉ phép năm đã được IT Manager phê duyệt",
    },
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
        },
      });
    }
  }
  console.log("✅ Đã nạp danh sách Đơn xin nghỉ phép (LeaveRequest) Tháng 09 & 10/2026!");

  // 10. Nạp Đề nghị Tăng ca (OvertimeRequest) với đủ hệ số 150%, 200%, 300%
  const sampleOvertimes = [
    // Tháng 09/2026 (Đã duyệt để tính vào lương Tháng 09)
    {
      empIdx: 6, // Nguyễn Văn An (Tech Lead) - Trực lễ Quốc khánh 02/09 (300%)
      date: new Date(Date.UTC(2026, 8, 2)),
      hours: 4,
      status: "APPROVED",
      reason: "Trực vận hành hệ thống Core Production dịp lễ Quốc khánh 2/9 (Hệ số 300%)",
      approvedBy: "Lê Tuấn Anh (IT Manager)",
      approvedAt: new Date("2026-09-03T09:00:00Z"),
    },
    {
      empIdx: 9, // Vũ Minh Tuấn (DevOps) - Cuối tuần Chủ nhật 13/09 (200%)
      date: new Date(Date.UTC(2026, 8, 13)),
      hours: 4,
      status: "APPROVED",
      reason: "Nâng cấp cụm cơ sở dữ liệu PostgreSQL HA cuối tuần (Hệ số 200%)",
      approvedBy: "Lê Tuấn Anh (IT Manager)",
      approvedAt: new Date("2026-09-14T08:30:00Z"),
    },
    {
      empIdx: 7, // Nguyễn Hoàng Duy (Backend Architect) - Ngày thường 22/09 (150%)
      date: new Date(Date.UTC(2026, 8, 22)),
      hours: 3,
      status: "APPROVED",
      reason: "Tối ưu hiệu năng API tính lương tự động & kiểm thử tải (Hệ số 150%)",
      approvedBy: "Lê Tuấn Anh (IT Manager)",
      approvedAt: new Date("2026-09-23T09:00:00Z"),
    },
    {
      empIdx: 20, // Dương Minh Đức (Phó phòng Kế toán) - Ngày thường 29/09 (150%)
      date: new Date(Date.UTC(2026, 8, 29)),
      hours: 3,
      status: "APPROVED",
      reason: "Khóa sổ kế toán và đối chiếu báo cáo tài chính Quý 3/2026 (Hệ số 150%)",
      approvedBy: "Đặng Thu Hòa (Kế toán trưởng)",
      approvedAt: new Date("2026-09-30T08:45:00Z"),
    },

    // Tháng 10/2026 (Đã duyệt & Chờ duyệt mới nhất đến ngày 21/10/2026)
    {
      empIdx: 6, // Nguyễn Văn An - Thứ Bảy 17/10/2026 (200%)
      date: new Date(Date.UTC(2026, 9, 17)),
      hours: 4,
      status: "APPROVED",
      reason: "Triển khai bản cập nhật giao diện Rippling Design System lên môi trường Production (Hệ số 200%)",
      approvedBy: "Lê Tuấn Anh (IT Manager)",
      approvedAt: new Date("2026-10-18T09:00:00Z"),
    },
    {
      empIdx: 7, // Nguyễn Hoàng Duy - Thứ Năm 15/10/2026 (150%)
      date: new Date(Date.UTC(2026, 9, 15)),
      hours: 2.5,
      status: "APPROVED",
      reason: "Xử lý tích hợp cổng thanh toán ngân hàng và đối soát bảo hiểm (Hệ số 150%)",
      approvedBy: "Lê Tuấn Anh (IT Manager)",
      approvedAt: new Date("2026-10-16T08:30:00Z"),
    },
    {
      empIdx: 8, // Phạm Thùy Linh - Thứ Sáu 16/10/2026 (150%)
      date: new Date(Date.UTC(2026, 9, 16)),
      hours: 2,
      status: "APPROVED",
      reason: "Hoàn thiện bộ quy chuẩn UI/UX Component Library cho phân hệ Nhân sự (Hệ số 150%)",
      approvedBy: "Lê Tuấn Anh (IT Manager)",
      approvedAt: new Date("2026-10-17T08:30:00Z"),
    },
    {
      empIdx: 17, // Vũ Kiều Oanh (C&B Officer) - Thứ Hai 19/10/2026 (150%)
      date: new Date(Date.UTC(2026, 9, 19)),
      hours: 3,
      status: "APPROVED",
      reason: "Rà soát hồ sơ giảm trừ gia cảnh và đối chiếu tờ khai BHXH Tháng 10/2026 (Hệ số 150%)",
      approvedBy: "Trần Thị Mai (HR Manager)",
      approvedAt: new Date("2026-10-20T09:00:00Z"),
    },
    {
      empIdx: 10, // Trần Thảo My (Senior React Engineer) - Thứ Ba 20/10/2026 (PENDING - 150%)
      date: new Date(Date.UTC(2026, 9, 20)),
      hours: 2.5,
      status: "PENDING",
      reason: "Kiểm thử E2E và tối ưu tốc độ tải trang Bảng lương (Chờ duyệt - Hệ số 150%)",
      approvedBy: null,
      approvedAt: null,
    },
    {
      empIdx: 9, // Vũ Minh Tuấn (DevOps) - Chủ nhật 18/10/2026 (PENDING - 200%)
      date: new Date(Date.UTC(2026, 9, 18)),
      hours: 4,
      status: "PENDING",
      reason: "Bảo trì định kỳ tường lửa và sao lưu máy chủ Cloud cuối tuần (Chờ duyệt - Hệ số 200%)",
      approvedBy: null,
      approvedAt: null,
    },
    {
      empIdx: 22, // Bùi Ngọc Thanh (Kế toán thuế) - Thứ Hai 19/10/2026 (PENDING - 150%)
      date: new Date(Date.UTC(2026, 9, 19)),
      hours: 2,
      status: "PENDING",
      reason: "Lập báo cáo quyết toán thuế TNCN tạm tính Quý 3/2026 (Chờ duyệt - Hệ số 150%)",
      approvedBy: null,
      approvedAt: null,
    },
  ];

  for (const ot of sampleOvertimes) {
    if (createdProfiles[ot.empIdx]) {
      await prisma.overtimeRequest.create({
        data: {
          employeeId: createdProfiles[ot.empIdx].id,
          date: ot.date,
          hours: ot.hours,
          status: ot.status,
          reason: ot.reason,
          approvedBy: ot.approvedBy,
          approvedAt: ot.approvedAt,
        },
      });
    }
  }
  console.log("✅ Đã nạp 11 Đề nghị Tăng ca (OvertimeRequest) Tháng 09 & 10/2026!");

  // 11. Nạp Đánh giá Hiệu suất KPI (PerformanceEvaluation) cho Q3-2026, 2026-09, Q4-2026, 2026-10
  for (let i = 0; i < createdProfiles.length; i++) {
    const emp = createdProfiles[i];
    const name = emp.user.name;
    let c1 = 84,
      c2 = 85,
      c3 = 82;

    if (
      name.includes("An") ||
      name.includes("Dũng") ||
      emp.position.includes("Trưởng phòng") ||
      emp.position.includes("Giám Đốc") ||
      emp.position.includes("Giám đốc") ||
      emp.position.includes("Kế toán trưởng")
    ) {
      c1 = 95;
      c2 = 92;
      c3 = 94; // Hạng A: 94.0đ -> Thưởng +25%
    } else if (
      name.includes("Phương") ||
      name.includes("Mai") ||
      name.includes("Khoa") ||
      name.includes("Duy") ||
      name.includes("Bảo")
    ) {
      c1 = 88;
      c2 = 86;
      c3 = 85; // Hạng B: 86.8đ -> Thưởng +10%
    } else if (i % 9 === 0) {
      c1 = 72;
      c2 = 74;
      c3 = 70; // Hạng C: 72.0đ -> Thưởng 0%
    } else {
      c1 = 80 + (i % 12);
      c2 = 81 + ((i * 3) % 10);
      c3 = 79 + ((i * 7) % 11);
    }

    const total = Math.round((c1 * 0.5 + c2 * 0.25 + c3 * 0.25) * 10) / 10;
    let grade = "HẠNG B (HOÀN THÀNH TỐT)";
    let bonusRate = 0.1;

    if (total >= 90) {
      grade = "HẠNG A (XUẤT SẮC)";
      bonusRate = 0.25;
    } else if (total >= 75) {
      grade = "HẠNG B (HOÀN THÀNH TỐT)";
      bonusRate = 0.1;
    } else {
      grade = "HẠNG C (ĐẠT YÊU CẦU)";
      bonusRate = 0.0;
    }

    const notes =
      total >= 90
        ? "Cán bộ hoàn thành xuất sắc OKRs trọng tâm, chủ trì dự án vượt tiến độ."
        : "Hoàn thành tốt chỉ tiêu công việc và tuân thủ kỷ luật doanh nghiệp.";

    for (const period of ["Q3-2026", "Q4-2026", "2026-10"]) {
      await prisma.performanceEvaluation.create({
        data: {
          employeeId: emp.id,
          period,
          year: 2026,
          criterion1: c1,
          criterion2: c2,
          criterion3: c3,
          selfScore: Math.round((c1 + c2 + c3) / 3),
          managerScore: total,
          totalScore: total,
          grade,
          bonusRate,
          status: "APPROVED",
          managerNotes: notes,
        },
      });
    }
  }
  console.log("✅ Đã nạp Đánh giá KPI (Q3-2026, Q4-2026 & Tháng 10/2026) cho 39 nhân sự!");

  // 12. Tính toán Bảng lương chuẩn xác qua Payroll Engine cho Tháng 08, 09 và 10/2026
  console.log("⏳ Đang chạy Engine tính lương chuẩn cho Tháng 08, 09 và 10/2026...");
  await calculateMonthlyPayroll(8, 2026, "Đặng Thu Hòa (Kế toán trưởng)", "ACCOUNTANT");
  await prisma.payroll.updateMany({
    where: { month: 8, year: 2026 },
    data: { status: "PAID" },
  });

  await calculateMonthlyPayroll(9, 2026, "Đặng Thu Hòa (Kế toán trưởng)", "ACCOUNTANT");
  await prisma.payroll.updateMany({
    where: { month: 9, year: 2026 },
    data: { status: "PAID" },
  });

  // Tháng 10/2026: Tính lương tự động dựa trên dữ liệu chấm công & OT hiện tại, để ở trạng thái DRAFT (và 8 phiếu đã PAID mẫu) để test duyệt chi
  const octPayrolls = await calculateMonthlyPayroll(
    10,
    2026,
    "Trần Thị Mai (HR Manager)",
    "HR"
  );
  const samplePaidOctIds = octPayrolls.slice(0, 8).map((p) => p.id);
  if (samplePaidOctIds.length > 0) {
    await prisma.payroll.updateMany({
      where: { id: { in: samplePaidOctIds } },
      data: { status: "PAID" },
    });
  }
  console.log(
    "✅ Đã tính toán 117 phiếu lương (Tháng 08 PAID, Tháng 09 PAID, Tháng 10 gồm 8 PAID & 31 DRAFT sẵn sàng test duyệt chi)!"
  );

  // 13. Nạp Tuyển dụng (JobPosting, Application, Interview) cập nhật cuối Tháng 10 & Tháng 11/2026
  const job1 = await prisma.jobPosting.create({
    data: {
      title: "Senior Fullstack Engineer (Next.js 16 / Node.js / PostgreSQL)",
      description:
        "Tham gia phát triển và tối ưu hóa hệ thống phần mềm quản trị nhân lực thế hệ mới NexusHR. Yêu cầu 3+ năm kinh nghiệm với React, Next.js, PostgreSQL và TypeScript.",
      departmentId: itDept.id,
      headcount: 2,
      status: "OPEN",
      dueDate: new Date("2026-11-15"),
    },
  });

  const job2 = await prisma.jobPosting.create({
    data: {
      title: "Chuyên viên Tuyển dụng & Thu hút Nhân tài (Talent Acquisition)",
      description:
        "Chịu trách nhiệm toàn trình tuyển dụng nhân sự khối công nghệ và kinh doanh, xây dựng thương hiệu nhà tuyển dụng.",
      departmentId: hrDept.id,
      headcount: 1,
      status: "OPEN",
      dueDate: new Date("2026-11-30"),
    },
  });

  const job3 = await prisma.jobPosting.create({
    data: {
      title: "Trưởng nhóm Kinh doanh Giải pháp Doanh nghiệp B2B",
      description:
        "Dẫn dắt đội ngũ tư vấn phần mềm SaaS quản trị nhân lực cho các tập đoàn và doanh nghiệp vừa và lớn.",
      departmentId: salesDept.id,
      headcount: 2,
      status: "OPEN",
      dueDate: new Date("2026-12-01"),
    },
  });

  const job4 = await prisma.jobPosting.create({
    data: {
      title: "Kế toán viên Tổng hợp & Quản trị Chi phí",
      description:
        "Kiểm soát chi phí hoạt động, lập tờ khai thuế, đối chiếu công nợ và quyết toán tiền lương.",
      departmentId: faDept.id,
      headcount: 1,
      status: "OPEN",
      dueDate: new Date("2026-11-20"),
    },
  });

  await prisma.application.create({
    data: {
      jobPostingId: job1.id,
      candidateName: "Trần Minh Tâm",
      candidateEmail: "tam.tran@gmail.com",
      candidatePhone: "0912345678",
      cvUrl: "https://hrmis.com/cvs/tam-tran-fullstack.pdf",
      status: "APPLIED",
    },
  });

  await prisma.application.create({
    data: {
      jobPostingId: job1.id,
      candidateName: "Ngô Quang Huy",
      candidateEmail: "huy.ngo@gmail.com",
      candidatePhone: "0912345679",
      cvUrl: "https://hrmis.com/cvs/huy-ngo-senior.pdf",
      status: "REVIEWING",
    },
  });

  const app3 = await prisma.application.create({
    data: {
      jobPostingId: job1.id,
      candidateName: "Đỗ Hải Nam",
      candidateEmail: "nam.do@gmail.com",
      candidatePhone: "0912345680",
      cvUrl: "https://hrmis.com/cvs/nam-do-lead.pdf",
      status: "INTERVIEWING",
    },
  });

  await prisma.application.create({
    data: {
      jobPostingId: job1.id,
      candidateName: "Hoàng Gia Bảo",
      candidateEmail: "bao.hoang@gmail.com",
      candidatePhone: "0912345681",
      cvUrl: "https://hrmis.com/cvs/bao-hoang.pdf",
      status: "OFFERED",
    },
  });

  await prisma.application.create({
    data: {
      jobPostingId: job2.id,
      candidateName: "Nguyễn Khánh Linh",
      candidateEmail: "linh.khanh@gmail.com",
      candidatePhone: "0912345682",
      cvUrl: "https://hrmis.com/cvs/linh-khanh-ta.pdf",
      status: "APPLIED",
    },
  });

  await prisma.application.create({
    data: {
      jobPostingId: job2.id,
      candidateName: "Phạm Quỳnh Anh",
      candidateEmail: "quynhanh.pham@gmail.com",
      candidatePhone: "0912345683",
      cvUrl: "https://hrmis.com/cvs/quynhanh-hr.pdf",
      status: "HIRED",
    },
  });

  await prisma.interview.create({
    data: {
      applicationId: app3.id,
      interviewerId: createdProfiles[5].userId, // Lê Tuấn Anh (IT Manager)
      scheduledAt: new Date("2026-10-22T07:00:00Z"),
      result: "PASS",
      notes:
        "Ứng viên có tư duy kiến trúc hệ thống xuất sắc, nắm vững Next.js App Router và PostgreSQL.",
    },
  });
  console.log("✅ Đã nạp dữ liệu Tuyển dụng (Tin đăng, Ứng viên & Lịch phỏng vấn)!");

  // 14. Nạp Quyết định Biến động Nhân sự (PersonnelChange)
  await prisma.personnelChange.createMany({
    data: [
      {
        code: "QĐ-2026-048",
        employeeId: createdProfiles[6].id,
        employeeName: "Nguyễn Văn An",
        employeeEmail: "user@nexustech.vn",
        type: "PROMOTION",
        fromDeptId: itDept.id,
        fromDept: "Phòng Công nghệ (IT)",
        toDeptId: itDept.id,
        toDept: "Phòng Công nghệ (IT)",
        fromPosition: "Frontend Developer",
        toPosition: "Senior Frontend Lead & Tech Lead",
        newSalary: 32000000,
        effectiveDate: "15/10/2026",
        appliedAt: new Date("2026-10-15T02:00:00Z"),
        signer: "Đỗ Minh Hiếu (Tổng Giám Đốc)",
        status: "APPROVED",
      },
      {
        code: "QĐ-2026-047",
        employeeId: createdProfiles[26].id,
        employeeName: "Lê Quốc Bảo",
        employeeEmail: "bao.le@nexustech.vn",
        type: "PROMOTION",
        fromDeptId: salesDept.id,
        fromDept: "Phòng Kinh doanh & Phát triển thị trường",
        toDeptId: salesDept.id,
        toDept: "Phòng Kinh doanh & Phát triển thị trường",
        fromPosition: "Trưởng nhóm Kinh doanh B2B",
        toPosition: "Phó Giám đốc Kinh doanh Miền Bắc",
        newSalary: 30000000,
        effectiveDate: "10/10/2026",
        appliedAt: new Date("2026-10-10T02:00:00Z"),
        signer: "Đỗ Minh Hiếu (Tổng Giám Đốc)",
        status: "APPROVED",
      },
      {
        code: "QĐ-2026-046",
        employeeId: createdProfiles[16].id,
        employeeName: "Lê Hoàng Phúc",
        employeeEmail: "phuc.le@nexustech.vn",
        type: "TRANSFER",
        fromDeptId: salesDept.id,
        fromDept: "Phòng Kinh doanh & Phát triển thị trường",
        toDeptId: hrDept.id,
        toDept: "Phòng Nhân sự & Đào tạo (HR)",
        fromPosition: "Chuyên viên Đào tạo Sản phẩm",
        toPosition: "Chuyên viên Đào tạo & Phát triển (L&D Specialist)",
        newSalary: 20000000,
        effectiveDate: "01/10/2026",
        appliedAt: new Date("2026-10-01T02:00:00Z"),
        signer: "Trần Thị Mai (HR Manager)",
        status: "APPROVED",
      },
      {
        code: "QĐ-2026-049",
        employeeId: createdProfiles[10].id,
        employeeName: "Trần Thảo My",
        employeeEmail: "my.tran@nexustech.vn",
        type: "PROMOTION",
        fromDeptId: itDept.id,
        fromDept: "Phòng Công nghệ (IT)",
        toDeptId: itDept.id,
        toDept: "Phòng Công nghệ (IT)",
        fromPosition: "Senior React/Next.js Engineer",
        toPosition: "Principal Frontend Architect",
        newSalary: 31000000,
        effectiveDate: "01/11/2026",
        signer: "Lê Tuấn Anh (IT Manager)",
        status: "PENDING",
      },
    ],
  });
  console.log("✅ Đã nạp Quyết định Biến động Nhân sự!");

  // 15. Nạp Khóa Đào tạo & Khảo sát Nội bộ (TrainingCourse & Survey)
  await prisma.trainingCourse.createMany({
    data: [
      {
        title: "Chương trình Hội nhập Nhân sự Mới Quý 4/2026 (Onboarding)",
        instructor: "Phòng Nhân sự & Đào tạo (HR)",
        category: "Văn hóa Doanh nghiệp",
        duration: "16 giờ (4 buổi)",
        participants: 22,
        progress: 85,
        startDate: "05/10/2026",
        status: "IN_PROGRESS",
      },
      {
        title: "Bảo mật Dữ liệu Doanh nghiệp & Chuẩn An toàn Thông tin ISO 27001",
        instructor: "Vũ Minh Tuấn (DevOps & Security)",
        category: "Tuân thủ & An toàn",
        duration: "8 giờ (2 buổi)",
        participants: 39,
        progress: 65,
        startDate: "15/10/2026",
        status: "IN_PROGRESS",
      },
      {
        title: "Nâng cao Kỹ năng Quản trị & Thiết lập Mục tiêu OKRs 2026",
        instructor: "Chuyên gia Viện Quản trị Chiến lược",
        category: "Phát triển Lãnh đạo",
        duration: "24 giờ (6 buổi)",
        participants: 15,
        progress: 100,
        startDate: "10/09/2026",
        status: "COMPLETED",
      },
      {
        title: "Ứng dụng AI & Tự động hóa Quy trình Nghiệp vụ Doanh nghiệp",
        instructor: "Lê Tuấn Anh (IT Manager)",
        category: "Kỹ năng Chuyên môn",
        duration: "12 giờ (3 buổi)",
        participants: 28,
        progress: 25,
        startDate: "25/10/2026",
        status: "ENROLLING",
      },
    ],
  });

  await prisma.survey.createMany({
    data: [
      {
        title: "Khảo sát Chỉ số Hài lòng & Gắn kết Nhân viên (eNPS Quý 4/2026)",
        targetDept: "Toàn bộ Doanh nghiệp",
        respondents: 36,
        totalTarget: 39,
        deadline: "31/10/2026",
        score: 4.8,
        status: "ACTIVE",
      },
      {
        title: "Đánh giá Trải nghiệm Hệ thống Quản trị Nhân sự NexusHR 2.0",
        targetDept: "Toàn bộ Doanh nghiệp",
        respondents: 38,
        totalTarget: 39,
        deadline: "25/10/2026",
        score: 4.9,
        status: "ACTIVE",
      },
      {
        title: "Khảo sát Kế hoạch Đào tạo & Nâng cao Năng lực Năm 2027",
        targetDept: "Khối Công nghệ & Kinh doanh",
        respondents: 15,
        totalTarget: 17,
        deadline: "15/11/2026",
        score: 4.6,
        status: "ACTIVE",
      },
    ],
  });
  console.log("✅ Đã nạp Khóa Đào tạo & Khảo sát Nội bộ!");

  // 16. Nạp Quy hoạch Cán bộ Nguồn (SuccessionPlan)
  await prisma.successionPlan.createMany({
    data: [
      {
        position: "Giám đốc Công nghệ (CTO)",
        department: "Phòng Công nghệ (IT)",
        currentHolder: "Lê Tuấn Anh (IT Manager)",
        successorName: "Nguyễn Văn An",
        successorEmail: "user@nexustech.vn",
        readiness: "READY_NOW",
        potentialScore: "HIGH",
        mentor: "Vũ Đình Trọng (Phó TGĐ Kỹ thuật)",
        plannedYear: "2026 - 2027",
        status: "APPROVED",
      },
      {
        position: "Giám đốc Nhân sự Tập đoàn (CHRO)",
        department: "Phòng Nhân sự & Đào tạo (HR)",
        currentHolder: "Trần Thị Mai (HR Manager)",
        successorName: "Đỗ Kim Ngân",
        successorEmail: "ngan.do@nexustech.vn",
        readiness: "READY_NOW",
        potentialScore: "HIGH",
        mentor: "Đỗ Minh Hiếu (CEO)",
        plannedYear: "2026 - 2027",
        status: "APPROVED",
      },
      {
        position: "Giám đốc Tài chính (CFO)",
        department: "Phòng Tài chính - Kế toán",
        currentHolder: "Đặng Thu Hòa (Kế toán trưởng)",
        successorName: "Dương Minh Đức",
        successorEmail: "duc.duong@nexustech.vn",
        readiness: "READY_1_2_YEARS",
        potentialScore: "HIGH",
        mentor: "Phạm Hoàng Long (COO)",
        plannedYear: "2027 - 2028",
        status: "APPROVED",
      },
      {
        position: "Phó Tổng Giám Đốc Kinh doanh",
        department: "Phòng Kinh doanh & Phát triển thị trường",
        currentHolder: "Nguyễn Hoàng Nam (Sales Director)",
        successorName: "Lê Quốc Bảo",
        successorEmail: "bao.le@nexustech.vn",
        readiness: "READY_NOW",
        potentialScore: "HIGH",
        mentor: "Nguyễn Hoàng Nam",
        plannedYear: "2026 - 2027",
        status: "APPROVED",
      },
    ],
  });
  console.log("✅ Đã nạp Quy hoạch Cán bộ Kế cận!");

  // 17. Nạp Nhật ký Kiểm toán Hệ thống (AuditLog)
  await prisma.auditLog.createMany({
    data: [
      {
        userName: "Nguyễn Tuấn IT Admin",
        userRole: "SYSTEM_ADMIN",
        action: "Đồng bộ dữ liệu toàn doanh nghiệp & cập nhật kỳ công Tháng 10/2026",
        target: "System / Database Seed",
        ip: "127.0.0.1",
        status: "SUCCESS",
      },
      {
        userName: "Trần Thị Mai (HR Manager)",
        userRole: "HR",
        action: "Cập nhật Lịch công & Ngày nghỉ lễ chuẩn năm 2026 theo Bộ luật LĐ 2019",
        target: "WorkCalendar / 2026",
        ip: "192.168.1.45",
        status: "SUCCESS",
      },
      {
        userName: "Lê Tuấn Anh (IT Manager)",
        userRole: "MANAGER",
        action: "Phê duyệt 3 đề nghị làm thêm giờ (OT) của khối Kỹ thuật kỳ 10/2026",
        target: "OvertimeRequest / IT Dept",
        ip: "192.168.1.32",
        status: "SUCCESS",
      },
      {
        userName: "Đặng Thu Hòa (Kế toán trưởng)",
        userRole: "ACCOUNTANT",
        action: "Đối soát BHXH, BHYT, BHTN và thuế TNCN lũy tiến kỳ lương Tháng 10/2026",
        target: "Payroll / Reconciliation",
        ip: "192.168.1.18",
        status: "SUCCESS",
      },
      {
        userName: "Đỗ Minh Hiếu (CEO)",
        userRole: "BOD",
        action: "Duyệt chi đợt 1 (8 phiếu lương khối Lãnh đạo & Kỹ thuật) kỳ Tháng 10/2026",
        target: "Payroll / BulkDisburse",
        ip: "192.168.1.10",
        status: "SUCCESS",
      },
    ],
  });
  console.log("✅ Đã nạp Nhật ký Kiểm toán (Audit Logs)!");

  console.log("\n=======================================================");
  console.log("  🎉 ĐÃ BƠM DỮ LIỆU THÀNH CÔNG (UP-TO-DATE: 21/10/2026)");
  console.log("=======================================================");
  console.log("CEO/BOD:    ceo@nexustech.vn        / password123 (BOD)");
  console.log("Admin:      admin@nexustech.vn      / password123 (SYSTEM_ADMIN)");
  console.log("HR Manager: hr@nexustech.vn         / password123 (HR)");
  console.log("Accountant: accountant@nexustech.vn / password123 (ACCOUNTANT)");
  console.log("IT Manager: manager@nexustech.vn    / password123 (MANAGER)");
  console.log("Employee:   user@nexustech.vn       / password123 (USER)");
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
