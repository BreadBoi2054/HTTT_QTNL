# -*- coding: utf-8 -*-
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from build_report import add_h1, add_h2, add_h3, add_p, add_bullet, add_figure, create_table, add_caption

def build_chapter2(doc):
    add_h1(doc, "CHƯƠNG 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG THÔNG TIN QUẢN TRỊ NHÂN LỰC (HTTT QTNL)")

    # ---------------------------------------------
    # 2.1 PHÂN TÍCH YÊU CẦU NGHIỆP VỤ
    # ---------------------------------------------
    add_h2(doc, "2.1. Phân tích các yêu cầu nghiệp vụ")

    # 2.1.1 Tác nhân hệ thống
    add_h3(doc, "2.1.1. Xác định tác nhân hệ thống")
    add_p(doc, "Dựa trên mô hình tổ chức và ma trận trách nhiệm nghiệp vụ đã phân tích ở Chương 1, hệ thống xác định 05 tác nhân chính (Actors) trực tiếp tương tác và vận hành các phân hệ chức năng của phần mềm:")

    table_2_1_data = [
        ["1", "Quản trị viên tối cao\n(SYSTEM_ADMIN)", "Trưởng phòng CNTT / Quản trị IT", "Toàn quyền quản trị hệ thống, cấu hình tham số, phân quyền vai trò (RBAC), kiểm soát cơ sở dữ liệu và giám sát toàn diện nhật ký kiểm toán (Audit Logs)."],
        ["2", "Trưởng phòng Nhân sự\n(HR Specialist / HRD)", "Trưởng phòng & Chuyên viên HR", "Quản lý toàn diện hồ sơ nhân sự, phê duyệt hợp đồng, quản lý tuyển dụng Kanban, ban hành quyết định biến động nhân sự, tổ chức đào tạo, quy hoạch cán bộ và rà soát bảng lương."],
        ["3", "Trưởng phòng ban\n(MANAGER - Dept Head)", "Giám đốc / Trưởng 6 khối phòng ban", "Phê duyệt đơn xin nghỉ phép của nhân viên trực thuộc, theo dõi bảng chấm công chuyên cần của bộ phận, đề xuất điều chuyển/bổ nhiệm và tham gia đánh giá ma trận 9-Box."],
        ["4", "Nhân viên công ty\n(USER - Employee)", "Toàn thể cán bộ nhân viên", "Sử dụng cổng tự phục vụ ESS: thực hiện điểm danh Check-in/Check-out, nộp đơn xin nghỉ phép, tra cứu lịch sử chấm công cá nhân, xem phiếu lương điện tử (Payslip) và phản hồi khảo sát eNPS."],
        ["5", "Ban Giám đốc Điều hành\n(Board of Directors - BOD)", "Tổng Giám đốc & Thành viên HĐQT", "Theo dõi bảng điều khiển tổng quan (Executive Dashboard), phê duyệt các quyết định biến động nhân sự cấp cao, phê duyệt kế hoạch quy hoạch cán bộ kế nhiệm chiến lược và khóa bảng lương."],
    ]
    create_table(doc, ["STT", "Tác nhân (Actor)", "Vai trò thực tế", "Phạm vi tương tác và Quyền hạn chính"], table_2_1_data, [1.0, 3.5, 3.5, 8.0])
    add_caption(doc, "Bảng 2.1: Ánh xạ tác nhân hệ thống với vai trò vận hành thực tế tại doanh nghiệp")

    add_figure(doc, "fig_2_1_actor_hierarchy.png", "Hình 2.1. Biểu đồ cây phân cấp Tác nhân (Actor Hierarchy)")

    # 2.1.2 Danh mục 52 Use case
    add_h3(doc, "2.1.2. Xác định danh mục ca sử dụng (Use case)")
    add_p(doc, "Hệ thống HRMIS được phân tích và thiết kế bao gồm 52 Ca sử dụng (Use Cases) được nhóm khoa học thành 10 phân hệ nghiệp vụ chuyên biệt, bao quát trọn vẹn toàn bộ các hoạt động quản trị nguồn nhân lực trong doanh nghiệp:")

    table_2_2_data = [
        ["UC01", "Đăng nhập & Xác thực hệ thống", "Toàn bộ người dùng", "Nhóm 1: Xác thực & RBAC"],
        ["UC02", "Đăng xuất tài khoản an toàn", "Toàn bộ người dùng", "Nhóm 1: Xác thực & RBAC"],
        ["UC03", "Đổi mật khẩu người dùng", "Toàn bộ người dùng", "Nhóm 1: Xác thực & RBAC"],
        ["UC04", "Phân quyền vai trò người dùng (RBAC)", "System Admin", "Nhóm 1: Xác thực & RBAC"],
        ["UC05", "Quản lý danh mục quyền hạn (Permissions)", "System Admin", "Nhóm 1: Xác thực & RBAC"],
        ["UC06", "Xem sơ đồ cây tổ chức (Org Chart)", "Toàn bộ người dùng", "Nhóm 2: Cơ cấu tổ chức"],
        ["UC07", "Thêm mới phòng ban chức năng", "System Admin / HR", "Nhóm 2: Cơ cấu tổ chức"],
        ["UC08", "Cập nhật thông tin phòng ban", "System Admin / HR", "Nhóm 2: Cơ cấu tổ chức"],
        ["UC09", "Bổ nhiệm Trưởng phòng (Manager)", "HR / BOD", "Nhóm 2: Cơ cấu tổ chức"],
        ["UC10", "Xóa phòng ban (Khi không có nhân sự)", "System Admin", "Nhóm 2: Cơ cấu tổ chức"],
        ["UC11", "Tạo mới hồ sơ nhân viên điện tử", "HR / Admin", "Nhóm 3: Hồ sơ nhân sự"],
        ["UC12", "Cập nhật thông tin lý lịch nhân sự", "HR / Admin", "Nhóm 3: Hồ sơ nhân sự"],
        ["UC13", "Tra cứu & Lọc hồ sơ theo phòng ban", "Toàn bộ người dùng", "Nhóm 3: Hồ sơ nhân sự"],
        ["UC14", "Xem hồ sơ chi tiết nhân viên", "Toàn bộ người dùng", "Nhóm 3: Hồ sơ nhân sự"],
        ["UC15", "Xóa hồ sơ nhân sự (Lưu trữ an toàn)", "System Admin / HR", "Nhóm 3: Hồ sơ nhân sự"],
        ["UC16", "Điểm danh Check-in đầu ca làm việc", "Nhân viên (User)", "Nhóm 4: Chấm công chuyên cần"],
        ["UC17", "Điểm danh Check-out kết thúc ca", "Nhân viên (User)", "Nhóm 4: Chấm công chuyên cần"],
        ["UC18", "Xem lịch sử chấm công cá nhân", "Nhân viên (User)", "Nhóm 4: Chấm công chuyên cần"],
        ["UC19", "Theo dõi bảng chấm công toàn đơn vị", "Manager / HR", "Nhóm 4: Chấm công chuyên cần"],
        ["UC20", "Báo cáo thống kê tỷ lệ đúng giờ/đi muộn", "Manager / HR / BOD", "Nhóm 4: Chấm công chuyên cần"],
        ["UC21", "Tạo mới đơn xin nghỉ phép", "Nhân viên (User)", "Nhóm 5: Quản lý Nghỉ phép"],
        ["UC22", "Theo dõi trạng thái đơn nghỉ phép cá nhân", "Nhân viên (User)", "Nhóm 5: Quản lý Nghỉ phép"],
        ["UC23", "Hủy đơn xin nghỉ phép chưa duyệt", "Nhân viên (User)", "Nhóm 5: Quản lý Nghỉ phép"],
        ["UC24", "Phê duyệt đơn xin nghỉ phép", "Trưởng phòng (Manager)", "Nhóm 5: Quản lý Nghỉ phép"],
        ["UC25", "Từ chối đơn xin nghỉ phép", "Trưởng phòng (Manager)", "Nhóm 5: Quản lý Nghỉ phép"],
        ["UC26", "Tổng hợp số ngày phép năm còn lại", "HR / Nhân viên", "Nhóm 5: Quản lý Nghỉ phép"],
        ["UC27", "Cấu hình thành phần lương (Phụ cấp, Thưởng)", "HR / Admin", "Nhóm 6: Bảng lương & Đãi ngộ"],
        ["UC28", "Kích hoạt động cơ tính lương tự động", "HR / Admin", "Nhóm 6: Bảng lương & Đãi ngộ"],
        ["UC29", "Rà soát & Điều chỉnh số liệu bảng lương", "HR / Kế toán", "Nhóm 6: Bảng lương & Đãi ngộ"],
        ["UC30", "Khóa bất biến bảng lương tháng", "HR / BOD", "Nhóm 6: Bảng lương & Đãi ngộ"],
        ["UC31", "Xuất bảng lương ra định dạng Excel", "HR / Kế toán / BOD", "Nhóm 6: Bảng lương & Đãi ngộ"],
        ["UC32", "Xem phiếu lương điện tử cá nhân (Payslip)", "Nhân viên (User)", "Nhóm 6: Bảng lương & Đãi ngộ"],
        ["UC33", "Đăng tin tuyển dụng mới", "HR / Admin", "Nhóm 7: Tuyển dụng Kanban"],
        ["UC34", "Cập nhật / Đóng tin tuyển dụng", "HR / Admin", "Nhóm 7: Tuyển dụng Kanban"],
        ["UC35", "Xem danh sách việc làm trên Cổng Careers", "Ứng viên / Khách vãng lai", "Nhóm 7: Tuyển dụng Kanban"],
        ["UC36", "Nộp hồ sơ ứng tuyển trực tuyến", "Ứng viên", "Nhóm 7: Tuyển dụng Kanban"],
        ["UC37", "Kéo thả ứng viên qua các cột Kanban", "HR Tuyển dụng", "Nhóm 7: Tuyển dụng Kanban"],
        ["UC38", "Lên lịch phỏng vấn ứng viên", "HR / Manager", "Nhóm 7: Tuyển dụng Kanban"],
        ["UC39", "Chuyển ứng viên trúng tuyển thành Nhân viên", "HR Tuyển dụng", "Nhóm 7: Tuyển dụng Kanban"],
        ["UC40", "Lập đề xuất điều chuyển phòng ban", "Manager / HR", "Nhóm 8: Biến động nhân sự"],
        ["UC41", "Ban hành quyết định bổ nhiệm chức vụ", "HR / BOD", "Nhóm 8: Biến động nhân sự"],
        ["UC42", "Ban hành quyết định tăng lương định kỳ", "HR / BOD", "Nhóm 8: Biến động nhân sự"],
        ["UC43", "Xử lý thủ tục thôi việc & Bàn giao", "HR / Manager", "Nhóm 8: Biến động nhân sự"],
        ["UC44", "Xem lịch sử biến động nhân sự", "HR / BOD / Manager", "Nhóm 8: Biến động nhân sự"],
        ["UC45", "Thiết lập khóa đào tạo nội bộ", "HR L&D / Admin", "Nhóm 9: Đào tạo & Khảo sát"],
        ["UC46", "Phân bổ học viên tham gia khóa học", "HR L&D", "Nhóm 9: Đào tạo & Khảo sát"],
        ["UC47", "Cập nhật tiến độ & Kết quả đào tạo", "HR L&D", "Nhóm 9: Đào tạo & Khảo sát"],
        ["UC48", "Tạo cuộc khảo sát mức độ gắn kết eNPS", "HR / BOD", "Nhóm 9: Đào tạo & Khảo sát"],
        ["UC49", "Tham gia trả lời khảo sát ẩn danh", "Nhân viên (User)", "Nhóm 9: Đào tạo & Khảo sát"],
        ["UC50", "Phân tích điểm số eNPS và văn hóa doanh nghiệp", "HR / BOD", "Nhóm 9: Đào tạo & Khảo sát"],
        ["UC51", "Đánh giá nhân tài theo ma trận 9-Box Grid", "Hội đồng đánh giá / BOD", "Nhóm 10: Quy hoạch & Kiểm toán"],
        ["UC52", "Thiết lập kế hoạch kế nhiệm cho vị trí trọng yếu", "HRD / BOD", "Nhóm 10: Quy hoạch & Kiểm toán"],
    ]
    create_table(doc, ["Mã UC", "Tên Ca sử dụng (Use Case)", "Tác nhân chính", "Phân hệ trực thuộc"], table_2_2_data, [1.5, 6.5, 4.0, 4.0])
    add_caption(doc, "Bảng 2.2: Danh sách 52 Use case chi tiết của Hệ thống Thông tin Quản trị Nhân lực")

    # 2.1.3 Đặc tả 10 Use case cốt lõi
    add_h3(doc, "2.1.3. Đặc tả chi tiết các Use case cốt lõi của hệ thống")
    add_p(doc, "Nhằm phục vụ việc thiết kế kiến trúc phần mềm và cơ sở dữ liệu chi tiết, đề tài tiến hành đặc tả chuyên sâu 10 Use Case then chốt đại diện cho toàn bộ các phân hệ theo đúng biểu mẫu học thuật chuẩn:")

    def add_uc_spec_table(uc_code, uc_name, actor, pre, trigger, main_flow, alt_flow, post):
        data = [
            ["Mã & Tên Use Case", f"{uc_code} - {uc_name}"],
            ["Tác nhân chính (Primary Actor)", actor],
            ["Tiền điều kiện (Pre-conditions)", pre],
            ["Sự kiện kích hoạt (Trigger)", trigger],
            ["Luồng sự kiện chính (Main Flow)", main_flow],
            ["Luồng sự kiện ngoại lệ (Alternative Flow)", alt_flow],
            ["Hậu điều kiện (Post-conditions)", post],
        ]
        create_table(doc, ["Thuộc tính đặc tả", "Nội dung chi tiết"], data, [4.0, 12.0])
        add_caption(doc, f"Bảng đặc tả {uc_code}: {uc_name}")

    add_uc_spec_table(
        "UC01", "Đăng nhập & Xác thực phân quyền hệ thống (RBAC)",
        "Toàn bộ người dùng hệ thống (Admin, Manager, HR, Employee)",
        "Người dùng đã được cấp tài khoản hợp lệ trong cơ sở dữ liệu.",
        "Người dùng truy cập vào trang chủ hoặc đường dẫn /login của hệ thống.",
        "1. Hệ thống hiển thị biểu mẫu đăng nhập (Email, Mật khẩu).\n2. Người dùng nhập email và mật khẩu rồi bấm nút 'Đăng nhập'.\n3. Hệ thống kiểm tra tính hợp lệ của dữ liệu đầu vào.\n4. Hệ thống truy vấn CSDL để tìm tài khoản khớp email.\n5. Hệ thống băm mật khẩu nhập vào và so khớp với password hash bằng Bcrypt.\n6. Hệ thống tạo phiên làm việc (Session) đính kèm roleName và JWT token.\n7. Hệ thống chuyển hướng người dùng đến trang Dashboard tương ứng với quyền hạn.",
        "4a. Email không tồn tại: Hệ thống báo lỗi 'Tài khoản không tồn tại'.\n5a. Sai mật khẩu: Hệ thống thông báo 'Mật khẩu không chính xác'.\n5b. Tài khoản bị khóa: Hệ thống từ chối truy cập và báo liên hệ Admin.",
        "Người dùng đăng nhập thành công, phiên làm việc được lưu trong Cookie an toàn."
    )

    add_uc_spec_table(
        "UC02", "Tiếp nhận & Tạo mới hồ sơ nhân sự điện tử",
        "Chuyên viên Nhân sự (HR), Quản trị viên (Admin)",
        "Người dùng đã đăng nhập thành công với vai trò HR hoặc SYSTEM_ADMIN.",
        "Người dùng bấm vào nút '+ Thêm nhân viên' trên trang /dashboard/employees.",
        "1. Hệ thống mở cửa sổ Modal Thêm mới nhân viên.\n2. HR nhập thông tin cá nhân: Họ tên, Email, SĐT, Số CCCD, Ngày sinh.\n3. HR chọn Phòng ban công tác và chức danh công việc.\n4. HR nhập mức lương cơ bản đóng bảo hiểm và chọn loại Hợp đồng.\n5. HR gán vai trò người dùng (USER, MANAGER, HR).\n6. HR bấm nút 'Lưu thông tin'.\n7. Hệ thống validate dữ liệu, tự động sinh mã nhân viên EMPxxx duy nhất.\n8. Hệ thống lưu đồng thời thông tin vào bảng User và EmployeeProfile trong giao dịch Transaction.\n9. Hệ thống đóng Modal và cập nhật danh sách nhân sự trên màn hình.",
        "2a. Email hoặc CCCD bị trùng: Hệ thống hiển thị cảnh báo lỗi dữ liệu trùng.\n4a. Mức lương không hợp lệ (nhỏ hơn 0): Hệ thống yêu cầu nhập số dương.\n5a. HR cố gắng gán vai trò SYSTEM_ADMIN: Hệ thống từ chối và báo lỗi phân quyền.",
        "Bản ghi hồ sơ nhân viên mới được tạo thành công với trạng thái ACTIVE."
    )

    add_uc_spec_table(
        "UC03", "Điểm danh chấm công Check-in & Check-out",
        "Nhân viên công ty (USER - Employee)",
        "Nhân viên đã đăng nhập tài khoản vào hệ thống trên cổng ESS.",
        "Nhân viên bấm vào nút 'Check In' hoặc 'Check Out' tại trang /dashboard/attendance.",
        "1. Hệ thống lấy thời gian thực từ máy chủ (Server Timestamp).\n2. Hệ thống xác định ngày làm việc hiện tại và tìm bản ghi chấm công của nhân viên.\n3. Nếu là Check-in: Hệ thống ghi nhận giờ vào; so khớp với 8h30 sáng: nếu <= 8h30 gán trạng thái PRESENT, nếu > 8h30 gán trạng thái LATE.\n4. Nếu là Check-out: Hệ thống ghi nhận giờ ra và tính toán tổng số giờ làm việc thực tế trong ngày.\n5. Hệ thống lưu bản ghi vào bảng Attendance trong PostgreSQL.\n6. Hệ thống hiển thị thông báo chấm công thành công kèm mốc thời gian chi tiết.",
        "2a. Nhân viên đã Check-in trong ngày: Hệ thống chỉ cho phép thao tác Check-out.\n2b. Lỗi kết nối mạng: Hệ thống hiển thị cảnh báo và yêu cầu thử lại.",
        "Dữ liệu thời gian công được lưu trữ bền vững, tự động tích lũy vào kỳ lương tháng."
    )

    add_uc_spec_table(
        "UC04", "Đăng ký và Phê duyệt đơn xin nghỉ phép",
        "Nhân viên (Người tạo đơn), Trưởng phòng ban (Người phê duyệt)",
        "Nhân viên và Trưởng phòng đã đăng nhập hệ thống với tài khoản hợp lệ.",
        "Nhân viên bấm '+ Tạo đơn nghỉ phép' tại trang /dashboard/leave.",
        "1. Hệ thống hiển thị form đăng ký nghỉ phép (Loại nghỉ, Từ ngày, Đến ngày, Lý do).\n2. Nhân viên nhập đầy đủ thông tin và bấm 'Gửi đơn'.\n3. Hệ thống kiểm tra số ngày phép năm còn lại và lưu đơn ở trạng thái PENDING.\n4. Đơn nghỉ phép hiển thị trên màn hình quản lý của Trưởng phòng phụ trách.\n5. Trưởng phòng xem xét tính cấp thiết, bấm nút 'Phê duyệt' hoặc 'Từ chối'.\n6. Hệ thống cập nhật trạng thái đơn thành APPROVED hoặc REJECTED.\n7. Nếu APPROVED: Hệ thống trừ số ngày phép và đồng bộ ngày nghỉ có lương sang Chấm công.",
        "2a. Ngày kết thúc nhỏ hơn ngày bắt đầu: Hệ thống chặn và báo lỗi thời gian.\n3a. Hết ngày phép năm: Hệ thống cảnh báo sẽ chuyển sang hình thức nghỉ không hưởng lương.",
        "Đơn nghỉ phép được lưu vết phê duyệt, sẵn sàng phục vụ tính lương cuối tháng."
    )

    add_uc_spec_table(
        "UC05", "Vận hành động cơ tính toán và Khóa bảng lương tháng",
        "Chuyên viên C&B (HR), Kế toán trưởng, Ban Giám đốc (BOD)",
        "Đã hết chu kỳ tháng; dữ liệu chấm công và nghỉ phép trong tháng đã được chốt.",
        "HR chọn chu kỳ Tháng/Năm và bấm nút 'Tính toán bảng lương' tại /dashboard/payroll.",
        "1. Hệ thống gửi yêu cầu POST /api/payroll/calculate kèm tham số month, year.\n2. Động cơ tính lương quét toàn bộ 18 nhân viên chính thức trong công ty.\n3. Với từng nhân viên, hệ thống đếm số ngày công thực tế từ bảng Attendance.\n4. Hệ thống cộng các khoản phụ cấp chức danh và tiền thưởng thành tích.\n5. Hệ thống tính lương gộp (Gross) = (Lương cơ bản / 22) * Ngày công + Phụ cấp + Thưởng.\n6. Hệ thống trích trừ các nghĩa vụ bắt buộc: 8% BHXH, 1.5% BHYT, 1% BHTN (tổng 10.5%).\n7. Hệ thống tính thuế TNCN theo biểu thuế lũy tiến từng phần và tính ra Thực lĩnh (Net).\n8. Hệ thống lưu bản ghi Payroll vào CSDL và trả về bảng lương dự thảo.\n9. Lãnh đạo thẩm định và bấm 'Khóa bảng lương' (Chuyển trạng thái LOCKED).",
        "2a. Không tìm thấy dữ liệu chấm công: Hệ thống áp dụng ngày công chuẩn mặc định và ghi chú cảnh báo.\n8a. Bảng lương đã bị khóa trước đó: Hệ thống chặn thao tác tính lại trừ khi có quyền Admin mở khóa.",
        "Bảng lương tháng được chốt bất biến, xuất ra file Excel và gửi phiếu lương cho nhân viên."
    )

    add_uc_spec_table(
        "UC06", "Đăng tin tuyển dụng & Quản trị Kanban ứng viên",
        "Chuyên viên Tuyển dụng (HR), Trưởng phòng chuyên môn (Manager)",
        "HR đã đăng nhập hệ thống với quyền hạn tuyển dụng.",
        "HR truy cập phân hệ Tuyển dụng tại /dashboard/recruitment.",
        "1. HR tạo tin tuyển dụng mới: Chức danh, Số lượng cần tuyển, Phòng ban, Mô tả công việc.\n2. Tin tuyển dụng được công khai lên Cổng việc làm /careers.\n3. Ứng viên gửi hồ sơ ứng tuyển trực tuyến; hồ sơ tự động hiển thị tại cột APPLIED trên Kanban.\n4. HR sàng lọc hồ sơ, kéo thả thẻ ứng viên sang cột INTERVIEW.\n5. Hệ thống mở cửa sổ đặt lịch phỏng vấn, liên kết thông tin người phỏng vấn.\n6. Sau phỏng vấn, HR kéo thẻ sang OFFER (Đề nghị nhận việc) hoặc REJECTED (Từ chối).\n7. Khi ứng viên chấp thuận, HR kéo sang HIRED và bấm 'Tạo hồ sơ nhân viên'.\n8. Hệ thống tự động chuyển thông tin sang bảng EmployeeProfile.",
        "3a. File CV ứng viên không đúng định dạng (không phải PDF/DOCX): Hệ thống báo lỗi upload.\n7a. Ứng viên từ chối Offer: HR kéo thẻ về trạng thái REJECTED kèm lý do.",
        "Quy trình tuyển dụng được số hóa toàn diện theo phễu chuyển đổi Kanban."
    )

    add_uc_spec_table(
        "UC07", "Ban hành quyết định biến động nhân sự",
        "Trưởng phòng HR, Ban Giám đốc Điều hành (BOD)",
        "Nhân sự có quyết định điều chuyển, thăng chức, tăng lương hoặc thôi việc chính thức.",
        "HR bấm nút '+ Tạo biến động' tại trang /dashboard/personnel-changes.",
        "1. Hệ thống mở form tạo quyết định biến động nhân sự.\n2. HR chọn nhân viên từ danh sách, chọn loại biến động (Bổ nhiệm, Điều chuyển, Tăng lương, Thôi việc).\n3. HR nhập nội dung chi tiết: Phòng ban mới, Chức danh mới, Mức lương mới, Ngày có hiệu lực.\n4. HR bấm 'Ban hành quyết định'.\n5. Hệ thống lưu bản ghi vào bảng PersonnelChange.\n6. Hệ thống tự động cập nhật thông tin tương ứng trong bảng EmployeeProfile (phòng ban mới, chức danh mới, lương mới).\n7. Hệ thống tự động ghi nhật ký vào bảng AuditLog.",
        "2a. Không chọn nhân viên: Hệ thống yêu cầu chọn nhân viên cụ thể.\n3a. Ngày hiệu lực không hợp lệ: Hệ thống yêu cầu nhập ngày chuẩn định dạng.",
        "Quyết định biến động nhân sự được thực thi tức thời trong toàn bộ hệ thống."
    )

    add_uc_spec_table(
        "UC08", "Tổ chức khóa đào tạo & Khảo sát mức độ gắn kết eNPS",
        "Chuyên viên L&D, Toàn thể Nhân viên",
        "HR L&D đã đăng nhập hệ thống với quyền quản lý đào tạo.",
        "HR truy cập phân hệ /dashboard/training-surveys.",
        "1. HR tạo khóa đào tạo mới: Tên khóa học, Giảng viên, Thời gian, Số lượng học viên.\n2. Nhân viên nhận thông báo khóa học và tham gia đào tạo.\n3. HR tạo cuộc khảo sát mức độ hài lòng eNPS ẩn danh theo chu kỳ quý.\n4. Nhân viên truy cập đường dẫn khảo sát, chấm điểm từ 0 đến 10 và gửi phản hồi.\n5. Hệ thống tự động tính toán chỉ số eNPS = % Promoters (9-10 điểm) - % Detractors (0-6 điểm).\n6. Hệ thống hiển thị biểu đồ phân tích mức độ gắn kết văn hóa doanh nghiệp.",
        "4a. Nhân viên đã trả lời khảo sát: Hệ thống thông báo đã hoàn thành và chặn gửi lặp lại.",
        "Dữ liệu đào tạo và chỉ số eNPS được lưu trữ, phục vụ đánh giá năng lực nhân sự."
    )

    add_uc_spec_table(
        "UC09", "Quy hoạch cán bộ kế nhiệm & Đánh giá ma trận 9-Box",
        "Trưởng phòng Nhân sự (HRD), Ban Tổng Giám đốc (BOD)",
        "Hội đồng nhân sự thực hiện kỳ đánh giá tài năng hàng năm.",
        "HR truy cập phân hệ Quy hoạch cán bộ tại /dashboard/cadre-planning.",
        "1. Hệ thống hiển thị bản đồ quy hoạch các vị trí then chốt (CTO, HRD, Lead Architect, Sales Director).\n2. Hội đồng đánh giá nhập điểm số Năng lực hiện tại (1-5) và Tiềm năng phát triển (1-5) của nhân sự nguồn.\n3. Hệ thống tự động định vị nhân sự vào 1 trong 9 ô ma trận 9-Box Grid (ví dụ: Ngôi sao Star, Nhân sự cốt lõi Core Employee, Tiềm năng cao High Potential).\n4. HR thiết lập mức độ sẵn sàng kế nhiệm (Sẵn sàng ngay, 1-2 năm, 3-5 năm) và chỉ định người kế nhiệm.\n5. Hệ thống lưu bản ghi vào bảng SuccessionPlan và hiển thị bản đồ kế nhiệm trực quan.",
        "3a. Thiếu điểm đánh giá: Hệ thống yêu cầu hoàn tất chấm điểm cả 2 trục Năng lực và Tiềm năng.",
        "Bản đồ kế nhiệm chiến lược được thiết lập, đảm bảo tính liên tục của bộ máy lãnh đạo."
    )

    add_uc_spec_table(
        "UC10", "Kiểm soát luồng phê duyệt & Ghi vết nhật ký kiểm toán (Audit Log)",
        "Chuyên viên Tuân thủ, Quản trị viên (SYSTEM_ADMIN)",
        "Người dùng đã thực hiện bất kỳ thao tác thay đổi dữ liệu nào trên hệ thống.",
        "Hệ thống tự động kích hoạt Middleware ghi vết kiểm toán.",
        "1. Khi bất kỳ API nào thực hiện thao tác nhạy cảm (Tạo nhân viên, Sửa vai trò, Duyệt lương, Ban hành quyết định biến động).\n2. Middleware tự động trích xuất: Hành động (CREATE/UPDATE/DELETE), Thực thể tác động, ID bản ghi, ID người thực hiện, Địa chỉ IP máy khách, Chuỗi User-Agent trình duyệt.\n3. Hệ thống ghi một bản ghi bất biến vào bảng AuditLog.\n4. Admin truy cập trang /dashboard/audit-workflow để tra cứu, lọc nhật ký theo thời gian và người dùng.\n5. Cung cấp báo cáo minh chứng tuân thủ phục vụ các đợt kiểm toán độc lập.",
        "3a. Lỗi ghi log: Hệ thống ghi log dự phòng ra file an toàn để không làm gián đoạn giao dịch chính.",
        "Toàn bộ hành vi trên hệ thống được giám sát minh bạch, chống chối bỏ trách nhiệm."
    )

    # 2.1.4 Xây dựng biểu đồ Use case
    add_h3(doc, "2.1.4. Xây dựng biểu đồ Use case")
    add_p(doc, "Dưới đây là Biểu đồ Use case tổng quan cùng 09 biểu đồ Use case phân hệ chi tiết mô hình hóa theo chuẩn UML:")
    add_figure(doc, "fig_2_2_usecase_overview.png", "Hình 2.2. Biểu đồ Use case tổng quan Hệ thống Thông tin Quản trị Nhân lực (HRMIS)")
    add_figure(doc, "fig_2_3_usecase_employee.png", "Hình 2.3. Biểu đồ Use case Phân hệ Quản lý Hồ sơ & Cơ cấu phòng ban")
    add_figure(doc, "fig_2_4_usecase_attendance.png", "Hình 2.4. Biểu đồ Use case Phân hệ Chấm công & Điểm danh chuyên cần")
    add_figure(doc, "fig_2_5_usecase_leave.png", "Hình 2.5. Biểu đồ Use case Phân hệ Quản lý Nghỉ phép & Phê duyệt đơn từ")
    add_figure(doc, "fig_2_6_usecase_payroll.png", "Hình 2.6. Biểu đồ Use case Phân hệ Bảng chấm lương & Đãi ngộ (Payroll)")
    add_figure(doc, "fig_2_7_usecase_recruitment.png", "Hình 2.7. Biểu đồ Use case Phân hệ Quản trị Tuyển dụng & Kanban ứng viên")
    add_figure(doc, "fig_2_8_usecase_changes.png", "Hình 2.8. Biểu đồ Use case Phân hệ Biến động nhân sự & Bổ nhiệm")
    add_figure(doc, "fig_2_9_usecase_training.png", "Hình 2.9. Biểu đồ Use case Phân hệ Đào tạo & Khảo sát nội bộ eNPS")
    add_figure(doc, "fig_2_10_usecase_succession.png", "Hình 2.10. Biểu đồ Use case Phân hệ Quy hoạch cán bộ & Kế nhiệm (9-Box Grid)")
    add_figure(doc, "fig_2_11_usecase_audit.png", "Hình 2.11. Biểu đồ Use case Phân hệ Kiểm toán & Luồng phê duyệt (SOPs & Audit Trail)")

    # 2.1.5 Phân tầng yêu cầu
    add_h3(doc, "2.1.5. Phân tầng yêu cầu: từ quy trình nghiệp vụ đến use case hệ thống")
    add_p(doc, "Nhằm bảo đảm tính liên kết chặt chẽ và không bỏ sót yêu cầu trong quá trình xây dựng phần mềm, đề tài thiết lập Bảng ánh xạ ba tầng (Three-Tier Mapping Matrix): kết nối trực tiếp từ Quy trình nghiệp vụ thực tế của doanh nghiệp sang các Use Case chức năng và ánh xạ tới Màn hình giao diện phần mềm tương ứng:")

    table_2_13_data = [
        ["Quản lý cơ cấu tổ chức", "UC06, UC07, UC08, UC09, UC10", "/dashboard/departments", "Sơ đồ cây phòng ban, danh sách phòng ban, bổ nhiệm Manager"],
        ["Quản lý hồ sơ nhân sự", "UC11, UC12, UC13, UC14, UC15", "/dashboard/employees", "Bảng danh sách 18 nhân sự, modal thêm/sửa nhân viên, chi tiết hồ sơ"],
        ["Điểm danh & Chuyên cần", "UC16, UC17, UC18, UC19, UC20", "/dashboard/attendance", "Nút bấm Check-in/Out, lịch sử chấm công, tỷ lệ đi đúng giờ"],
        ["Nghỉ phép & Xét duyệt", "UC21, UC22, UC23, UC24, UC25, UC26", "/dashboard/leave", "Form tạo đơn nghỉ phép, danh sách chờ duyệt, nút Duyệt/Từ chối"],
        ["Bảng lương & Đãi ngộ", "UC27, UC28, UC29, UC30, UC31, UC32", "/dashboard/payroll", "Bảng lương 18 nhân sự, nút Tính lương, Khóa lương, Xuất Excel"],
        ["Tuyển dụng nhân sự", "UC33, UC34, UC35, UC36, UC37, UC38, UC39", "/dashboard/recruitment & /careers", "Kanban board 5 cột, danh sách tin tuyển dụng, form nộp CV"],
        ["Biến động nhân sự", "UC40, UC41, UC42, UC43, UC44", "/dashboard/personnel-changes", "Dòng thời gian biến động, modal tạo quyết định bổ nhiệm/điều chuyển"],
        ["Đào tạo & Khảo sát", "UC45, UC46, UC47, UC48, UC49, UC50", "/dashboard/training-surveys", "Thẻ khóa đào tạo, tiến độ học tập, biểu đồ đo lường chỉ số eNPS"],
        ["Quy hoạch cán bộ kế nhiệm", "UC51, UC52", "/dashboard/cadre-planning", "Bản đồ kế nhiệm 4 vị trí then chốt, ma trận 9-Box Grid trực quan"],
        ["Kiểm toán & Quản trị", "UC01, UC04, UC05, UC10", "/dashboard/audit-workflow & /dashboard", "Bảng nhật ký kiểm toán Audit Trail, danh mục quy trình SOPs"],
    ]
    create_table(doc, ["Quy trình nghiệp vụ thực tế", "Danh mục Use Case ánh xạ", "Đường dẫn màn hình (Route)", "Thành phần giao diện người dùng tương ứng"], table_2_13_data, [4.0, 3.5, 4.0, 4.5])
    add_caption(doc, "Bảng 2.13: Bảng ánh xạ ba tầng: từ Quy trình nghiệp vụ đến Use Case và Màn hình thực tế")

    # ---------------------------------------------
    # 2.2 PHÂN TÍCH CẤU TRÚC HỆ THỐNG
    # ---------------------------------------------
    add_h2(doc, "2.2. Phân tích cấu trúc hệ thống")
    add_h3(doc, "2.2.1. Định nghĩa và biểu diễn đối tượng, lớp theo mô hình BCE")
    add_p(doc, "Trong phân tích hướng đối tượng (OOA), hệ thống HRMIS được cấu thành bởi các đối tượng đại diện cho các thực thể vật lý hoặc khái niệm nghiệp vụ trong doanh nghiệp. Hệ thống áp dụng nghiêm ngặt mô hình phân tầng ba nhóm lớp chuẩn mực BCE (Boundary - Control - Entity):")
    add_bullet(doc, " Đại diện cho các màn hình giao diện người dùng và điểm tương tác API: DashboardPage, EmployeeModal, AttendanceScreen, LeaveApprovalView, PayrollTableView, RecruitmentKanbanBoard, PersonnelChangeView, CadrePlanningMatrix, AuditLogTable.", "Lớp Giao diện (Boundary Classes): ")
    add_bullet(doc, " Đóng gói các quy tắc nghiệp vụ, logic tính toán và điều phối giao dịch: AuthController, EmployeeService, AttendanceEngine, LeaveWorkflowController, PayrollCalculationEngine, RecruitmentService, SuccessionController, AuditLogService.", "Lớp Điều khiển (Control Classes): ")
    add_bullet(doc, " Đại diện cho các thực thể dữ liệu nghiệp vụ có trạng thái bền vững được lưu trữ trong cơ sở dữ liệu quan hệ: User, Role, Department, EmployeeProfile, Attendance, LeaveRequest, Payroll, SalaryComponent, JobPosting, Application, Interview, PersonnelChange, TrainingCourse, Survey, SuccessionPlan, AuditLog.", "Lớp Thực thể (Entity Classes): ")

    add_h3(doc, "2.2.2. Xác định các đối tượng, lớp từ đặc tả yêu cầu")
    add_p(doc, "Bằng phương pháp phân tích ngữ nghĩa danh từ từ 10 bản đặc tả ca sử dụng ở mục 2.1.3, hệ thống đã trích xuất danh mục các lớp thực thể then chốt cùng trách nhiệm nghiệp vụ tương ứng:")
    add_bullet(doc, " Lưu trữ tài khoản người dùng, email, password hash và liên kết khóa ngoại với Role và EmployeeProfile.", "Lớp User: ")
    add_bullet(doc, " Quản lý vai trò (SYSTEM_ADMIN, MANAGER, HR, USER) và danh mục phân quyền truy cập chức năng.", "Lớp Role: ")
    add_bullet(doc, " Quản lý thông tin định danh phòng ban, tên khối, mô tả chức năng và liên kết với Trưởng phòng (Manager).", "Lớp Department: ")
    add_bullet(doc, " Trọng tâm quản lý toàn diện thông tin nhân sự: mã nhân viên, CCCD, ngày sinh, ngày vào làm, chức danh, mức lương cơ bản, tài khoản ngân hàng và loại hợp đồng.", "Lớp EmployeeProfile: ")
    add_bullet(doc, " Quản lý dữ liệu chấm công: ngày làm việc, giờ Check-in, giờ Check-out, trạng thái (PRESENT, LATE, ABSENT) và số giờ làm việc thực tế.", "Lớp Attendance: ")
    add_bullet(doc, " Quản lý đơn xin nghỉ phép: loại nghỉ (Phép năm, ốm, việc riêng), từ ngày, đến ngày, lý do và trạng thái phê duyệt (PENDING, APPROVED, REJECTED).", "Lớp LeaveRequest: ")
    add_bullet(doc, " Quản lý bảng lương tháng: chu kỳ tháng/năm, ngày công thực tế, phụ cấp, tiền thưởng, các khoản khấu trừ bảo hiểm/thuế, thực lĩnh và trạng thái khóa.", "Lớp Payroll: ")
    add_bullet(doc, " Quản lý thông tin tuyển dụng, ứng viên nộp hồ sơ, lịch phỏng vấn và trạng thái phễu Kanban.", "Lớp JobPosting & Application: ")
    add_bullet(doc, " Quản lý lịch sử biến động nhân sự, khóa đào tạo, khảo sát eNPS, kế hoạch kế nhiệm 9-Box và nhật ký kiểm toán hệ thống.", "Lớp Talent & Audit Entities: ")

    # ---------------------------------------------
    # 2.3 PHÂN TÍCH HÀNH VI HỆ THỐNG
    # ---------------------------------------------
    add_h2(doc, "2.3. Phân tích hành vi của hệ thống")
    add_p(doc, "Phân tích hành vi hệ thống mô tả cách thức các đối tượng tương tác, truyền thông điệp và biến đổi trạng thái trong quá trình thực thi các ca sử dụng nghiệp vụ thông qua 4 loại biểu đồ chuẩn UML:")

    add_h3(doc, "2.3.1. Xây dựng biểu đồ trình tự (Sequence Diagrams)")
    add_p(doc, "Biểu đồ trình tự thể hiện luồng thông điệp được trao đổi tuần tự theo trục thời gian giữa tác nhân người dùng, lớp biên giao diện, lớp điều khiển logic và lớp thực thể lưu trữ đối với 08 ca sử dụng then chốt:")
    add_figure(doc, "fig_2_12_seq_login.png", "Hình 2.12. Biểu đồ trình tự Use case Đăng nhập & Xác thực phân quyền RBAC (UC01)")
    add_figure(doc, "fig_2_13_seq_employee.png", "Hình 2.13. Biểu đồ trình tự Use case Tiếp nhận & Tạo mới hồ sơ nhân sự (UC02)")
    add_figure(doc, "fig_2_14_seq_attendance.png", "Hình 2.14. Biểu đồ trình tự Use case Điểm danh chấm công & Ghi nhận công làm việc (UC03)")
    add_figure(doc, "fig_2_15_seq_leave.png", "Hình 2.15. Biểu đồ trình tự Use case Đăng ký và Phê duyệt đơn nghỉ phép (UC04)")
    add_figure(doc, "fig_2_16_seq_payroll.png", "Hình 2.16. Biểu đồ trình tự Use case Tính toán & Khóa bảng lương tháng (UC05)")
    add_figure(doc, "fig_2_17_seq_recruitment.png", "Hình 2.17. Biểu đồ trình tự Use case Tuyển dụng & Luân chuyển trạng thái ứng viên Kanban (UC06)")
    add_figure(doc, "fig_2_18_seq_personnel_change.png", "Hình 2.18. Biểu đồ trình tự Use case Ban hành quyết định biến động nhân sự (UC07)")
    add_figure(doc, "fig_2_19_seq_cadre_planning.png", "Hình 2.19. Biểu đồ trình tự Use case Quy hoạch cán bộ & Đánh giá ma trận 9-Box (UC08)")

    add_h3(doc, "2.3.2. Xây dựng biểu đồ hoạt động (Activity Diagrams)")
    add_p(doc, "Biểu đồ hoạt động mô tả chi tiết luồng xử lý công việc từ trạng thái bắt đầu đến khi kết thúc, bao gồm các điểm rẽ nhánh điều kiện và các hành động nghiệp vụ thực tế cho 07 quy trình cốt lõi:")
    add_figure(doc, "fig_2_20_activity_employee.png", "Hình 2.20. Biểu đồ hoạt động Quy trình Tiếp nhận và Quản lý hồ sơ nhân sự")
    add_figure(doc, "fig_2_21_activity_attendance.png", "Hình 2.21. Biểu đồ hoạt động Quy trình Chấm công và Xử lý công lệch")
    add_figure(doc, "fig_2_22_activity_leave.png", "Hình 2.22. Biểu đồ hoạt động Quy trình Phê duyệt đơn nghỉ phép đa cấp")
    add_figure(doc, "fig_2_23_activity_payroll.png", "Hình 2.23. Biểu đồ hoạt động Quy trình Tính toán, Kiểm tra và Khóa bảng lương")
    add_figure(doc, "fig_2_24_activity_recruitment.png", "Hình 2.24. Biểu đồ hoạt động Quy trình Tuyển dụng nhân sự từ Đăng tin đến Onboarding")
    add_figure(doc, "fig_2_25_activity_personnel_change.png", "Hình 2.25. Biểu đồ hoạt động Quy trình Điều chuyển, Bổ nhiệm và Điều chỉnh lương")
    add_figure(doc, "fig_2_26_activity_succession.png", "Hình 2.26. Biểu đồ hoạt động Quy trình Đánh giá 9-Box & Quy hoạch cán bộ kế nhiệm")

    add_h3(doc, "2.3.3. Xây dựng biểu đồ trạng thái (State Machine Diagrams)")
    add_p(doc, "Biểu đồ trạng thái mô tả vòng đời của các thực thể nghiệp vụ then chốt trong hệ thống, chỉ rõ các trạng thái có thể có, các sự kiện kích hoạt sự chuyển đổi trạng thái và các điều kiện ràng buộc kèm theo:")
    add_figure(doc, "fig_2_27_state_employee.png", "Hình 2.27. Biểu đồ trạng thái Vòng đời Hồ sơ nhân viên (Employee Lifecycle)")
    add_p(doc, "Vòng đời hồ sơ nhân viên trải qua 5 trạng thái liên tiếp: Bắt đầu từ khi tiếp nhận thử việc (ONBOARDING) -> Ký hợp đồng chính thức và kích hoạt hoạt động (ACTIVE) -> Kỳ hạn rà soát định kỳ (PROBATION) -> Tạm hoãn hợp đồng do thai sản hoặc lý do cá nhân (SUSPENDED) -> Chấm dứt hợp đồng lao động và thôi việc (TERMINATED).")

    add_figure(doc, "fig_2_28_state_leave.png", "Hình 2.28. Biểu đồ trạng thái Vòng đời Đơn nghỉ phép (Leave Request Lifecycle)")
    add_p(doc, "Vòng đời đơn nghỉ phép bắt đầu từ khi nhân viên tạo dự thảo (DRAFT) -> Gửi đơn chờ Trưởng phòng duyệt (PENDING) -> HR kiểm tra quỹ phép năm còn lại (REVIEWING) -> Được phê duyệt chính thức (APPROVED) hoặc Bị từ chối/hủy (REJECTED).")

    add_figure(doc, "fig_2_29_state_payroll.png", "Hình 2.29. Biểu đồ trạng thái Vòng đời Bảng lương tháng (Payroll Lifecycle)")
    add_p(doc, "Vòng đời bảng lương phát triển qua 5 giai đoạn nghiêm ngặt: Hết chu kỳ tháng (INITIAL) -> Thu thập ngày công và tính lương (CALCULATED) -> Kế toán và C&B đối soát (AUDITED) -> Ban Giám đốc phê duyệt (APPROVED) -> Khóa bất biến chống chỉnh sửa và chi trả (LOCKED).")

    add_figure(doc, "fig_2_30_state_candidate.png", "Hình 2.30. Biểu đồ trạng thái Vòng đời Hồ sơ ứng viên tuyển dụng (Application Lifecycle)")
    add_p(doc, "Vòng đời ứng viên trên Kanban gồm 5 chặng: Nộp hồ sơ (APPLIED) -> Sàng lọc CV (SCREENING) -> Phỏng vấn chuyên môn (INTERVIEW) -> Gửi thư mời việc (OFFER) -> Trúng tuyển gia nhập công ty (HIRED).")

    add_h3(doc, "2.3.4. Xây dựng biểu đồ cộng tác / tương tác")
    add_p(doc, "Biểu đồ cộng tác làm nổi bật mối quan hệ cấu trúc giữa các đối tượng tham gia vào việc thực thi ca sử dụng. Trong hệ thống HRMIS, sự cộng tác diễn ra liên tục: Khi đơn nghỉ phép được duyệt trên LeaveService, nó gửi thông điệp đồng thời tới AttendanceService (cập nhật ngày công nghỉ có lương) và PayrollService (tự động tính đủ lương ngày phép), đồng thời kích hoạt AuditLogService ghi nhận mốc thời gian phê duyệt.")

    # ---------------------------------------------
    # 2.4 THIẾT KẾ HỆ THỐNG
    # ---------------------------------------------
    add_h2(doc, "2.4. Thiết kế hệ thống")
    add_h3(doc, "2.4.1. Xây dựng biểu đồ lớp (Class Diagrams)")
    add_p(doc, "Biểu đồ lớp thể hiện cấu trúc tĩnh của hệ thống, bao gồm các lớp đối tượng, các thuộc tính kèm kiểu dữ liệu, các phương thức xử lý và mối quan hệ giữa các lớp (Kế thừa, Hợp thành, Kết tập, Phụ thuộc):")
    add_figure(doc, "fig_2_31_package_diagram.png", "Hình 2.31. Biểu đồ gói phân hệ tổng quan của hệ thống (Package Diagram)")
    add_figure(doc, "fig_2_32_class_core.png", "Hình 2.32. Biểu đồ lớp Phân hệ Hồ sơ nhân sự & Cơ cấu tổ chức")
    add_figure(doc, "fig_2_33_class_attendance_payroll.png", "Hình 2.33. Biểu đồ lớp Phân hệ Chấm công, Nghỉ phép & Tiền lương")
    add_figure(doc, "fig_2_34_class_talent_audit.png", "Hình 2.34. Biểu đồ lớp Phân hệ Tuyển dụng, Biến động, Đào tạo, Quy hoạch & Kiểm toán")
    add_figure(doc, "fig_2_35_domain_model.png", "Hình 2.35. Biểu đồ lớp miền cốt lõi của hệ thống (Domain Model)")

    add_p(doc, "Ma trận phân quyền truy cập chức năng theo vai trò người dùng (RBAC Matrix):")
    table_2_14_data = [
        ["Quản trị hệ thống & Cấu hình vai trò", "Toàn quyền", "Chỉ xem", "Không có quyền", "Không có quyền"],
        ["Quản lý Cơ cấu phòng ban", "Toàn quyền", "Toàn quyền", "Chỉ xem", "Chỉ xem"],
        ["Quản lý Hồ sơ nhân sự (Thêm/Sửa/Xóa)", "Toàn quyền", "Toàn quyền (Trừ Admin)", "Chỉ xem phòng mình", "Chỉ xem hồ sơ mình"],
        ["Chấm công điểm danh Check-in/Out", "Toàn quyền", "Toàn quyền", "Chấm công cá nhân", "Chấm công cá nhân"],
        ["Phê duyệt Đơn xin nghỉ phép", "Toàn quyền", "Thẩm định", "Phê duyệt phòng mình", "Tạo & Hủy đơn mình"],
        ["Vận hành tính toán Bảng lương", "Toàn quyền", "Toàn quyền", "Không có quyền", "Xem phiếu lương mình"],
        ["Khóa bảng lương tháng", "Toàn quyền", "Phê duyệt C&B", "Không có quyền", "Không có quyền"],
        ["Quản trị Tuyển dụng Kanban", "Toàn quyền", "Toàn quyền", "Tham gia phỏng vấn", "Không có quyền"],
        ["Ban hành Biến động nhân sự", "Toàn quyền", "Toàn quyền", "Đề xuất phòng mình", "Xem quyết định mình"],
        ["Đào tạo & Khảo sát eNPS", "Toàn quyền", "Toàn quyền", "Xem kết quả phòng", "Tham gia làm bài/khảo sát"],
        ["Quy hoạch cán bộ kế nhiệm (9-Box)", "Toàn quyền", "Toàn quyền", "Tham vấn phòng mình", "Không có quyền"],
        ["Tra cứu Nhật ký kiểm toán (Audit Trail)", "Toàn quyền", "Xem báo cáo", "Không có quyền", "Không có quyền"],
    ]
    create_table(doc, ["Phân hệ / Chức năng nghiệp vụ", "SYSTEM_ADMIN", "HR (Quản lý nhân sự)", "MANAGER (Trưởng phòng)", "USER (Nhân viên)"], table_2_14_data, [4.5, 3.0, 3.0, 3.0, 2.5])
    add_caption(doc, "Bảng 2.14: Ma trận phân quyền truy cập chức năng theo vai trò người dùng (RBAC Matrix)")

    # 2.4.2 Thiết kế lưu trữ dữ liệu
    add_h3(doc, "2.4.2. Thiết kế lưu trữ dữ liệu (Database Schema / ERD & Data Dictionary)")
    add_p(doc, "Cơ sở dữ liệu của hệ thống được thiết kế theo mô hình quan hệ (Relational Database) trên hệ quản trị PostgreSQL 16, đạt chuẩn hóa dạng 3NF (Third Normal Form) nhằm triệt tiêu hoàn toàn sự dư thừa dữ liệu và bảo đảm tính toàn vẹn tham chiếu:")
    add_figure(doc, "fig_2_36_erd.png", "Hình 2.36. Lược đồ thực thể quan hệ Cơ sở dữ liệu vật lý (Physical ERD chuẩn 3NF)")

    add_p(doc, "Dưới đây là từ điển dữ liệu chi tiết của 10 bảng CSDL cốt lõi được trích xuất trực tiếp từ Prisma Schema của hệ thống phần mềm thực tế:")

    # Table 2.15: Role
    t_role_data = [
        ["id", "String (CUID)", "PK, Not Null", "Mã định danh vai trò duy nhất"],
        ["name", "String", "Unique, Not Null", "Tên vai trò (SYSTEM_ADMIN, MANAGER, HR, USER)"],
        ["permissions", "Json", "Not Null, Default []", "Danh sách quyền hạn chức năng dưới dạng mảng JSON"],
        ["createdAt", "DateTime", "Not Null, Default now()", "Thời điểm khởi tạo vai trò trong hệ thống"],
        ["updatedAt", "DateTime", "Not Null", "Thời điểm cập nhật phân quyền gần nhất"],
    ]
    create_table(doc, ["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả nghiệp vụ"], t_role_data, [3.0, 3.5, 3.5, 6.0])
    add_caption(doc, "Bảng 2.15: Đặc tả từ điển dữ liệu bảng Vai trò hệ thống (Role)")

    # Table 2.16: User
    t_user_data = [
        ["id", "String (CUID)", "PK, Not Null", "Mã định danh tài khoản người dùng"],
        ["email", "String", "Unique, Not Null", "Địa chỉ email doanh nghiệp dùng để đăng nhập"],
        ["password", "String", "Not Null", "Mật khẩu người dùng đã băm an toàn qua Bcrypt"],
        ["roleId", "String", "FK -> Role.id", "Liên kết với vai trò phân quyền của người dùng"],
        ["createdAt", "DateTime", "Not Null, Default now()", "Thời điểm tạo tài khoản"],
        ["updatedAt", "DateTime", "Not Null", "Thời điểm cập nhật tài khoản gần nhất"],
    ]
    create_table(doc, ["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả nghiệp vụ"], t_user_data, [3.0, 3.5, 3.5, 6.0])
    add_caption(doc, "Bảng 2.16: Đặc tả từ điển dữ liệu bảng Tài khoản người dùng (User)")

    # Table 2.17: Department
    t_dept_data = [
        ["id", "String (CUID)", "PK, Not Null", "Mã định danh phòng ban duy nhất"],
        ["name", "String", "Unique, Not Null", "Tên khối phòng ban (BOD, IT, HR, Finance, Sales, Marketing)"],
        ["description", "String", "Nullable", "Mô tả chức năng nhiệm vụ của phòng ban"],
        ["managerId", "String", "FK -> EmployeeProfile.id", "Liên kết với Trưởng phòng phụ trách bộ phận"],
        ["createdAt", "DateTime", "Not Null, Default now()", "Thời điểm thành lập phòng ban"],
        ["updatedAt", "DateTime", "Not Null", "Thời điểm cập nhật thông tin phòng ban"],
    ]
    create_table(doc, ["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả nghiệp vụ"], t_dept_data, [3.0, 3.5, 3.5, 6.0])
    add_caption(doc, "Bảng 2.17: Đặc tả từ điển dữ liệu bảng Phòng ban (Department)")

    # Table 2.18: EmployeeProfile
    t_emp_data = [
        ["id", "String (CUID)", "PK, Not Null", "Mã định danh hồ sơ nhân sự"],
        ["userId", "String", "FK -> User.id, Unique", "Liên kết 1-1 với tài khoản đăng nhập người dùng"],
        ["departmentId", "String", "FK -> Department.id", "Liên kết với phòng ban công tác trực thuộc"],
        ["employeeCode", "String", "Unique, Not Null", "Mã nhân viên quản lý nội bộ (EMP001 đến EMP018)"],
        ["fullName", "String", "Not Null", "Họ và tên đầy đủ của cán bộ nhân viên"],
        ["phone", "String", "Nullable", "Số điện thoại liên lạc cá nhân"],
        ["citizenId", "String", "Nullable", "Số Căn cước công dân định danh"],
        ["birthDate", "DateTime", "Nullable", "Ngày tháng năm sinh"],
        ["hireDate", "DateTime", "Not Null, Default now()", "Ngày chính thức gia nhập công ty"],
        ["jobTitle", "String", "Not Null", "Chức vụ / Chức danh công việc đảm nhiệm"],
        ["baseSalary", "Decimal", "Not Null, Default 0", "Mức lương cơ bản thỏa thuận làm căn cứ đóng BHXH"],
        ["bankAccount", "String", "Nullable", "Số tài khoản ngân hàng nhận lương"],
        ["bankName", "String", "Nullable", "Tên ngân hàng phát hành thẻ"],
        ["contractType", "String", "Default 'Full-time'", "Loại hợp đồng lao động (Full-time, Thử việc, Part-time)"],
    ]
    create_table(doc, ["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả nghiệp vụ"], t_emp_data, [3.0, 3.5, 3.5, 6.0])
    add_caption(doc, "Bảng 2.18: Đặc tả từ điển dữ liệu bảng Hồ sơ nhân sự (EmployeeProfile)")

    # Table 2.19: Attendance
    t_att_data = [
        ["id", "String (CUID)", "PK, Not Null", "Mã định danh bản ghi chấm công"],
        ["employeeId", "String", "FK -> EmployeeProfile.id", "Mã nhân viên thực hiện điểm danh"],
        ["date", "DateTime", "Not Null", "Ngày làm việc ghi nhận chấm công"],
        ["checkIn", "DateTime", "Nullable", "Thời điểm Check-in thực tế đầu ca"],
        ["checkOut", "DateTime", "Nullable", "Thời điểm Check-out thực tế cuối ca"],
        ["status", "AttendanceStatus", "Default 'PRESENT'", "Trạng thái chuyên cần: PRESENT, LATE, ABSENT, LEAVE"],
        ["notes", "String", "Nullable", "Ghi chú giải trình lý do đi muộn hoặc quên chấm công"],
    ]
    create_table(doc, ["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả nghiệp vụ"], t_att_data, [3.0, 3.5, 3.5, 6.0])
    add_caption(doc, "Bảng 2.19: Đặc tả từ điển dữ liệu bảng Chấm công (Attendance)")

    # Table 2.20: LeaveRequest
    t_leave_data = [
        ["id", "String (CUID)", "PK, Not Null", "Mã định danh đơn xin nghỉ phép"],
        ["employeeId", "String", "FK -> EmployeeProfile.id", "Mã nhân viên làm đơn nghỉ"],
        ["type", "LeaveType", "Not Null", "Loại nghỉ phép: ANNUAL (Phép năm), SICK (Ốm), UNPAID (Không lương)"],
        ["startDate", "DateTime", "Not Null", "Ngày bắt đầu kỳ nghỉ phép"],
        ["endDate", "DateTime", "Not Null", "Ngày kết thúc kỳ nghỉ phép"],
        ["reason", "String", "Not Null", "Lý do chi tiết xin nghỉ phép"],
        ["status", "LeaveStatus", "Default 'PENDING'", "Trạng thái phê duyệt đơn: PENDING, APPROVED, REJECTED"],
    ]
    create_table(doc, ["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả nghiệp vụ"], t_leave_data, [3.0, 3.5, 3.5, 6.0])
    add_caption(doc, "Bảng 2.20: Đặc tả từ điển dữ liệu bảng Đơn nghỉ phép (LeaveRequest)")

    # Table 2.21: Payroll
    t_pay_data = [
        ["id", "String (CUID)", "PK, Not Null", "Mã định danh bản ghi bảng lương"],
        ["employeeId", "String", "FK -> EmployeeProfile.id", "Mã nhân viên được tính lương"],
        ["month", "Int", "Not Null", "Tháng tính lương (1 - 12)"],
        ["year", "Int", "Not Null", "Năm tính lương (ví dụ: 2026)"],
        ["baseSalary", "Decimal", "Not Null", "Mức lương cơ bản ngạch bậc áp dụng trong tháng"],
        ["actualWorkDays", "Decimal", "Not Null", "Tổng số ngày công làm việc thực tế được ghi nhận"],
        ["allowances", "Decimal", "Default 0", "Tổng tiền phụ cấp chức vụ, ăn trưa, điện thoại"],
        ["bonuses", "Decimal", "Default 0", "Tiền thưởng hiệu quả công việc, thưởng nóng dự án"],
        ["deductions", "Decimal", "Default 0", "Tổng các khoản khấu trừ: 10.5% BHXH + Thuế TNCN"],
        ["netSalary", "Decimal", "Not Null", "Thu nhập thực lĩnh chuyển khoản cuối cùng (Net)"],
        ["status", "PayrollStatus", "Default 'DRAFT'", "Trạng thái bảng lương: DRAFT, APPROVED, PAID, LOCKED"],
    ]
    create_table(doc, ["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả nghiệp vụ"], t_pay_data, [3.0, 3.5, 3.5, 6.0])
    add_caption(doc, "Bảng 2.21: Đặc tả từ điển dữ liệu bảng Bảng lương tháng (Payroll)")

    # Table 2.22: SalaryComponent
    t_comp_data = [
        ["id", "String (CUID)", "PK, Not Null", "Mã định danh thành phần lương"],
        ["name", "String", "Not Null", "Tên thành phần lương (Phụ cấp chức vụ, Thưởng KPI, Ăn trưa)"],
        ["type", "ComponentType", "Not Null", "Phân loại: ALLOWANCE (Phụ cấp), BONUS (Thưởng), DEDUCTION (Khấu trừ)"],
        ["amountType", "AmountType", "Default 'FIXED'", "Cách tính: FIXED (Cố định VND) hoặc PERCENTAGE (% lương cơ bản)"],
        ["defaultVal", "Decimal", "Default 0", "Giá trị mặc định áp dụng khi tính toán"],
    ]
    create_table(doc, ["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả nghiệp vụ"], t_comp_data, [3.0, 3.5, 3.5, 6.0])
    add_caption(doc, "Bảng 2.22: Đặc tả từ điển dữ liệu bảng Thành phần lương (SalaryComponent)")

    # Table 2.23: JobPosting & Application
    t_rec_data = [
        ["JobPosting.id", "String (CUID)", "PK, Not Null", "Mã định danh tin tuyển dụng"],
        ["JobPosting.title", "String", "Not Null", "Tiêu đề vị trí tuyển dụng (Senior Frontend, Backend...)"],
        ["JobPosting.headcount", "Int", "Default 1", "Số lượng nhân sự cần tuyển dụng cho vị trí"],
        ["JobPosting.status", "JobStatus", "Default 'OPEN'", "Trạng thái tin tuyển dụng: OPEN hoặc CLOSED"],
        ["Application.id", "String (CUID)", "PK, Not Null", "Mã định danh hồ sơ ứng viên nộp vào hệ thống"],
        ["Application.candidateName", "String", "Not Null", "Họ và tên ứng viên nộp hồ sơ"],
        ["Application.status", "AppStatus", "Default 'APPLIED'", "Giai đoạn Kanban: APPLIED, INTERVIEW, OFFER, HIRED, REJECTED"],
    ]
    create_table(doc, ["Tên trường", "Kiểu dữ liệu", "Ràng buộc", "Mô tả nghiệp vụ"], t_rec_data, [3.0, 3.5, 3.5, 6.0])
    add_caption(doc, "Bảng 2.23: Đặc tả từ điển dữ liệu bảng Tuyển dụng & Ứng viên (JobPosting & Application)")

    # Table 2.24: Core Talent & Audit
    t_core_data = [
        ["PersonnelChange", "id, employeeId, changeType, effectiveDate", "PK, FK", "Ghi nhận quyết định điều chuyển phòng ban, bổ nhiệm chức vụ, điều chỉnh lương"],
        ["TrainingCourse", "id, title, instructor, durationHours, status", "PK, Not Null", "Quản lý các khóa đào tạo nội bộ, an toàn thông tin và kỹ năng lãnh đạo"],
        ["Survey", "id, title, type, eNpsScore, respondentCount", "PK, Not Null", "Quản lý cuộc khảo sát mức độ hài lòng eNPS và đo lường văn hóa doanh nghiệp"],
        ["SuccessionPlan", "id, keyRoleTitle, successorId, readinessLevel, boxPosition", "PK, FK", "Quản lý lộ trình kế nhiệm cán bộ và định vị nhân sự trong ma trận 9-Box Grid"],
        ["AuditLog", "id, action, entity, entityId, userId, ipAddress, userAgent, createdAt", "PK, Not Null", "Ghi vết bất biến toàn bộ thao tác thêm, sửa, xóa, phân quyền và duyệt lương"],
    ]
    create_table(doc, ["Bảng thực thể", "Các trường dữ liệu then chốt", "Tính chất", "Ý nghĩa nghiệp vụ"], t_core_data, [3.0, 4.5, 2.5, 6.0])
    add_caption(doc, "Bảng 2.24: Đặc tả từ điển dữ liệu các bảng Biến động, Đào tạo, Kế nhiệm & Kiểm toán")

    # 2.4.3 Thiết kế giao diện
    add_h3(doc, "2.4.3. Thiết kế giao diện người dùng (UI Wireframes & Mockups)")
    add_p(doc, "Hệ thống HRMIS được xây dựng theo chuẩn giao diện phẳng hiện đại (Corporate Slate Theme) với tông màu xám slate trung tính, trang nhã, không màu mè và loại bỏ hoàn toàn các dải màu gradient sặc sỡ. Giao diện được tối ưu hóa theo nguyên lý lấy người dùng làm trung tâm (User-Centered Design):")
    add_bullet(doc, " Bố cục gồm thanh tiêu đề trên cùng (Header) hiển thị avatar, tên người dùng, vai trò và nút chuyển đổi Sáng/Tối (Dark/Light mode); thanh điều hướng bên trái (Sidebar) phân chia khoa học thành 4 nhóm nghiệp vụ rõ ràng, loại bỏ các nhãn gây rối mắt; khu vực làm việc chính hiển thị các thẻ thống kê tóm tắt và biểu đồ trực quan.", "1. Cấu trúc khung giao diện chung (Dashboard Layout): ")
    add_bullet(doc, " Bố cục gồm 3 thẻ tóm tắt chỉ số trung tính: Tổng nhân sự (18 nhân sự), Tỷ lệ hiện diện hôm nay (Chuyên cần đúng giờ), Vị trí tuyển dụng đang mở (4 vị trí); Biểu đồ cột thể hiện quy mô nhân sự theo 6 khối phòng ban; Biểu đồ tròn thể hiện tỷ lệ chuyên cần; Bảng danh sách 5 ứng viên mới nhất nộp hồ sơ.", "2. Màn hình Tổng quan điều hành (/dashboard): ")
    add_bullet(doc, " Bảng dữ liệu phân trang hiển thị đầy đủ 18 nhân sự với các cột: Mã nhân viên, Họ tên, Phòng ban, Chức danh, Mức lương đóng BHXH, Ngày vào làm và nút thao tác Sửa/Xóa. Modal thêm mới nhân viên được thiết kế tinh gọn với các ô nhập liệu được kiểm tra tính hợp lệ tức thời.", "3. Màn hình Quản lý Hồ sơ nhân sự (/dashboard/employees): ")
    add_bullet(doc, " Hiển thị sơ đồ cây cơ cấu tổ chức doanh nghiệp (Org Chart) trực quan liên kết từ Ban Giám đốc xuống 6 khối phòng ban; danh sách chi tiết các phòng ban kèm thông tin Trưởng phòng và định biên nhân sự.", "4. Màn hình Cơ cấu tổ chức & Phòng ban (/dashboard/departments): ")
    add_bullet(doc, " Giao diện Check-in/Check-out một chạm với đồng hồ thời gian thực; thẻ thống kê tỷ lệ đúng giờ, đi muộn, vắng mặt; bảng lịch sử chấm công 5 ngày gần nhất của toàn bộ nhân sự.", "5. Màn hình Chấm công & Chuyên cần (/dashboard/attendance): ")
    add_bullet(doc, " Danh sách đơn xin nghỉ phép hiển thị rõ loại nghỉ, khoảng thời gian, lý do; các nút thao tác Phê duyệt / Từ chối dành riêng cho Trưởng phòng và HR; form tạo đơn nghỉ phép trực quan với bộ chọn ngày.", "6. Màn hình Quản lý Nghỉ phép (/dashboard/leave): ")
    add_bullet(doc, " Bảng tính lương tự động cho toàn thể 18 nhân viên; hiển thị chi tiết Lương cơ bản, Ngày công thực tế, Phụ cấp, Tiền thưởng, Khấu trừ BHXH (10.5%), Thuế TNCN và Thực lĩnh (Net); nút bấm 'Tính lương tự động', 'Khóa bảng lương' và 'Xuất Excel'.", "7. Màn hình Bảng chấm lương & Đãi ngộ (/dashboard/payroll): ")
    add_bullet(doc, " Bảng Kanban tuyển dụng trực quan với 5 cột trạng thái kéo thả ứng viên (Applied -> Screening -> Interview -> Offer -> Hired); tab quản lý danh sách tin tuyển dụng đang mở; cổng thông tin việc làm công khai /careers dành cho ứng viên bên ngoài.", "8. Màn hình Tuyển dụng nhân sự (/dashboard/recruitment): ")
    add_bullet(doc, " Dòng thời gian (Timeline) theo dõi toàn bộ các quyết định điều chuyển phòng ban, bổ nhiệm chức vụ, tăng lương định kỳ; modal ban hành quyết định biến động nhân sự mới.", "9. Màn hình Biến động nhân sự (/dashboard/personnel-changes): ")
    add_bullet(doc, " Danh mục các khóa đào tạo nội bộ kèm thanh tiến độ học tập; biểu đồ đo lường mức độ gắn kết nhân viên eNPS theo quý với các thang điểm Promoters, Passives và Detractors.", "10. Màn hình Đào tạo & Khảo sát eNPS (/dashboard/training-surveys): ")
    add_bullet(doc, " Bản đồ kế nhiệm cho 4 vị trí lãnh đạo trọng yếu (CTO, HRD, Lead Architect, Sales Director); Ma trận 9-Box Grid định vị nhân sự tài năng dựa trên 2 trục Năng lực và Tiềm năng phát triển.", "11. Màn hình Quy hoạch cán bộ kế nhiệm (/dashboard/cadre-planning): ")
    add_bullet(doc, " Danh mục quy trình thao tác chuẩn (SOPs) đa cấp; bảng nhật ký kiểm toán hệ thống (Audit Trail) ghi vết chi tiết mốc thời gian, người thực hiện, hành động, địa chỉ IP và thiết bị.", "12. Màn hình Quy trình & Kiểm toán (/dashboard/audit-workflow): ")

    # 2.4.4 Kiến trúc kỹ thuật 3 tầng
    add_h3(doc, "2.4.4. Thiết kế mô hình thành phần & Kiến trúc kỹ thuật (3-Tier Enterprise Architecture)")
    add_p(doc, "Hệ thống HRMIS được xây dựng trên nền tảng kiến trúc 3 tầng (Three-Tier Enterprise Architecture) hiện đại, bảo đảm tính sẵn sàng cao (High Availability), khả năng bảo mật đa tầng và hiệu năng xử lý tối ưu:")
    add_figure(doc, "fig_2_37_architecture.png", "Hình 2.37. Sơ đồ kiến trúc kỹ thuật hệ thống 3 tầng (3-Tier Enterprise Architecture)")
    add_p(doc, "Phân tích chi tiết trách nhiệm kỹ thuật của từng tầng trong kiến trúc:")
    add_bullet(doc, " Xây dựng trên nền tảng Next.js 16 (App Router) kết hợp React 19 và Tailwind CSS v4. Tầng này chịu trách nhiệm hiển thị giao diện người dùng theo chuẩn Server Components và Client Components, quản lý trạng thái giao diện, thực hiện các hiệu ứng vi mô mượt mà và hỗ trợ hiển thị tối ưu trên cả giao diện Sáng và Tối (Corporate Slate Theme).", "1. Tầng Trình diễn (Presentation Layer): ")
    add_bullet(doc, " Trọng tâm là hệ thống các API Route Handlers chuẩn RESTful được viết bằng TypeScript trong Next.js. Tầng này đảm nhận việc xác thực danh tính và phân quyền vai trò (RBAC) thông qua Auth.js v5 (NextAuth), kiểm tra tính hợp lệ của dữ liệu đầu vào (Validation), thực thi các thuật toán nghiệp vụ cốt lõi (Động cơ tính lương tự động, Động cơ tổng hợp ngày công, Bộ lọc ma trận 9-Box Grid) và định tuyến giao dịch an toàn.", "2. Tầng Nghiệp vụ & Điều hướng (Business Logic Layer): ")
    add_bullet(doc, " Sử dụng Hệ quản trị cơ sở dữ liệu quan hệ PostgreSQL 16 đóng gói trong Docker Container (kết nối qua cổng 54321 chống xung đột mạng Windows). Việc tương tác dữ liệu được thực hiện thông qua Prisma ORM v7 với cơ chế Type-safe tuyệt đối, tự động quản lý kết nối Connection Pool, thực thi các truy vấn tối ưu và ghi nhật ký kiểm toán giao dịch (Audit Trail) bất biến.", "3. Tầng Lưu trữ Dữ liệu (Data Persistence Layer): ")

    # ---------------------------------------------
    # Tóm tắt chương 2
    # ---------------------------------------------
    add_h2(doc, "Tóm tắt chương 2")
    add_p(doc, "Chương 2 là phần trọng tâm và cốt lõi nhất của bài báo cáo. Bằng việc áp dụng bài bản phương pháp phân tích thiết kế hướng đối tượng (OOAD) và ngôn ngữ mô hình hóa UML 2.5, đề tài đã xác định 05 tác nhân hệ thống, đặc tả danh mục 52 Use Case, xây dựng 10 bảng đặc tả chi tiết và 11 biểu đồ Use Case trực quan. Trên phương diện cấu trúc và hành vi, đề tài đã thiết kế 19 biểu đồ Sequence, Activity và State Machine, bao quát toàn bộ các luồng giao dịch quản lý hồ sơ, chấm công chuyên cần, phê duyệt nghỉ phép, tính lương tự động, tuyển dụng Kanban, biến động nhân sự và quy hoạch kế nhiệm. Về mặt thiết kế kỹ thuật, đề tài đã hoàn thiện biểu đồ lớp phân tích, lược đồ cơ sở dữ liệu vật lý ERD 3NF chuẩn hóa, từ điển dữ liệu 10 bảng CSDL bám sát thực tế, mô hình hóa giao diện người dùng theo chủ đề Corporate Slate trang nhã và thiết lập kiến trúc kỹ thuật 3 tầng vững chắc, sẵn sàng đưa vào vận hành thực tế.")

    doc.add_page_break()
