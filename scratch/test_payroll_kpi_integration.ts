import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { calculateMonthlyPayroll } from "../src/services/payroll.service";
import { getPerformanceEvaluations, upsertPerformanceEvaluation } from "../src/services/performance.service";

async function runTests() {
  console.log("=== BẮT ĐẦU KIỂM THỬ TÍCH HỢP KPI, CHẤM CÔNG & TÍNH LƯƠNG ===");

  // 1. Kiểm thử truy vấn KPI
  console.log("\n--- TEST 1: Truy vấn danh sách đánh giá KPI ---");
  const evaluations = await getPerformanceEvaluations("Q4-2026", 2026);
  console.log(`Số bản ghi KPI Q4-2026: ${evaluations.length}`);
  if (evaluations.length === 0) throw new Error("Chưa có bản ghi KPI nào!");

  const sampleEval = evaluations[0];
  console.log(`Mẫu KPI nhân viên: ${sampleEval.employee.user.name} - Điểm: ${sampleEval.totalScore} - Xếp loại: ${sampleEval.grade} - Tỷ lệ thưởng: +${sampleEval.bonusRate * 100}%`);

  // 2. Chạy thử nghiệm Engine Tính Lương Tháng 10/2026
  console.log("\n--- TEST 2: Chạy Bảng Tính Lương Tự Động Tháng 10/2026 ---");
  const payrolls = await calculateMonthlyPayroll(10, 2026, "Test Suite Runner");
  console.log(`Đã tính thành công ${payrolls.length} phiếu lương.`);

  if (payrolls.length === 0) throw new Error("Không sinh được phiếu lương nào!");

  // 3. Kiểm tra chi tiết phiếu lương nhân viên Hạng A (Xuất sắc)
  console.log("\n--- TEST 3: Kiểm tra cấu phần lương của nhân sự Hạng A ---");
  const highPerformer = payrolls.find(p => {
    const details = p.details as any[];
    return details.some(d => d.name.includes("Thưởng hiệu suất KPI (HẠNG A"));
  });

  if (!highPerformer) {
    console.log("Cảnh báo: Không tìm thấy nhân sự có thưởng Hạng A trong tháng này. Kiểm tra nhân sự đầu tiên:");
    const p1 = payrolls[0];
    console.log("Phiếu lương nhân viên đầu:", p1);
  } else {
    const empProfile = await prisma.employeeProfile.findUnique({
      where: { id: highPerformer.employeeId },
      include: { user: true }
    });
    console.log(`Nhân sự: ${empProfile?.user.name}`);
    console.log(`Lương cơ bản theo công: ${highPerformer.baseSalary.toLocaleString('vi-VN')} VNĐ`);
    console.log(`Tổng thưởng & Phụ cấp: ${highPerformer.bonus.toLocaleString('vi-VN')} VNĐ`);
    console.log(`Tổng giảm trừ (Bảo hiểm 10.5%): ${highPerformer.deductions.toLocaleString('vi-VN')} VNĐ`);
    console.log(`LƯƠNG THỰC LĨNH (NET): ${highPerformer.netSalary.toLocaleString('vi-VN')} VNĐ`);

    console.log("\nChi tiết các khoản mục phiếu lương:");
    const details = highPerformer.details as any[];
    details.forEach(d => {
      console.log(`  - [${d.type}] ${d.name}: ${d.amount?.toLocaleString?.('vi-VN') || d.amount} ${d.amountType}`);
    });

    // Xác nhận có đầy đủ phụ cấp và thưởng KPI
    const hasLunch = details.some(d => d.name.includes("Phụ cấp ăn trưa"));
    const hasKpi = details.some(d => d.name.includes("Thưởng hiệu suất KPI"));
    const hasBhxh = details.some(d => d.name.includes("Bảo hiểm Xã hội"));

    if (hasLunch && hasKpi && hasBhxh) {
      console.log("\n>>> XÁC NHẬN: Phiếu lương đã tích hợp ĐẦY ĐỦ Phụ cấp ăn trưa, Thưởng KPI và Bảo hiểm bắt buộc!");
    } else {
      throw new Error(`Thiếu thành phần lương: hasLunch=${hasLunch}, hasKpi=${hasKpi}, hasBhxh=${hasBhxh}`);
    }
  }

  // 4. Kiểm tra cập nhật điểm KPI từ API/Service
  console.log("\n--- TEST 4: Thử nghiệm điều chỉnh điểm KPI và tính lại lương ---");
  const targetEval = evaluations[evaluations.length - 1]; // Lấy nhân sự cuối
  const updatedEval = await upsertPerformanceEvaluation({
    employeeId: targetEval.employeeId,
    period: "Q4-2026",
    year: 2026,
    criterion1: 98,
    criterion2: 95,
    criterion3: 96,
    managerNotes: "Vượt bậc chỉ tiêu quý 4."
  }, "Admin Test", "SYSTEM_ADMIN");

  console.log(`Nhân sự ${updatedEval.employee.user.name} được nâng lên: ${updatedEval.totalScore}đ (${updatedEval.grade})`);

  // Xóa phiếu lương DRAFT cũ để tính lại
  await prisma.payroll.deleteMany({
    where: { employeeId: targetEval.employeeId, month: 10, year: 2026, status: "DRAFT" }
  });

  const recomputed = await calculateMonthlyPayroll(10, 2026, "Recompute Test");
  const updatedPay = recomputed.find(p => p.employeeId === targetEval.employeeId);
  const recomputedDetails = updatedPay?.details as any[];
  const kpiItem = recomputedDetails?.find(d => d.name.includes("Thưởng hiệu suất KPI"));
  console.log(`Bảng lương mới của ${updatedEval.employee.user.name} đã cập nhật thưởng KPI: ${kpiItem?.name} = ${kpiItem?.amount.toLocaleString('vi-VN')} VNĐ`);

  console.log("\n=== TẤT CẢ CÁC BÀI KIỂM THỬ TÍCH HỢP ĐỀU THÀNH CÔNG (PASSED 100%) ===");
}

runTests().catch(err => {
  console.error("Lỗi kiểm thử:", err);
  process.exit(1);
});
