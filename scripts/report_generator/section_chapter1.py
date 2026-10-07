# -*- coding: utf-8 -*-
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from build_report import add_h1, add_h2, add_h3, add_p, add_bullet, add_figure, create_table, add_caption

def build_chapter1(doc):
    add_h1(doc, "CHƯƠNG 1: CƠ SỞ LÝ LUẬN VỀ QUẢN TRỊ NGUỒN NHÂN LỰC VÀ HỆ THỐNG THÔNG TIN QUẢN TRỊ NHÂN LỰC (HRMIS) TRONG DOANH NGHIỆP")

    # ---------------------------------------------
    # 1.1 Lý thuyết cơ sở
    # ---------------------------------------------
    add_h2(doc, "1.1. Lý thuyết cơ sở về Quản trị nguồn nhân lực và Hệ thống thông tin Quản trị nhân lực (HRMIS)")
    add_p(doc, "Quản trị nguồn nhân lực (Human Resource Management - HRM) là hệ thống các triết lý, chính sách và hoạt động chức năng nhằm thu hút, đào tạo - phát triển, duy trì và tạo động lực cho lực lượng lao động trong một tổ chức, nhằm đạt được mục tiêu chiến lược của doanh nghiệp đồng thời thỏa mãn nhu cầu phát triển cá nhân của người lao động. Trong nền kinh tế tri thức hiện đại, HRM đã vượt ra khỏi phạm vi công tác sự vụ hành chính (Personnel Management) để trở thành một cấu phần cốt lõi của chiến lược kinh doanh.")
    add_p(doc, "Theo lý thuyết quản trị nhân sự hiện đại của Giáo sư Dave Ulrich (Đại học Michigan, Hoa Kỳ), một hệ thống quản trị nhân sự tiên tiến phải đảm nhiệm đồng thời 04 vai trò chiến lược cốt lõi:")
    add_bullet(doc, " Tối ưu hóa và tự động hóa các quy trình hành chính (chấm công, tính lương, quản lý hồ sơ, thủ tục pháp lý) với độ chính xác tuyệt đối và chi phí vận hành thấp nhất.", "Chuyên gia hành chính (Administrative Expert): ")
    add_bullet(doc, " Lắng nghe, thấu hiểu tâm tư, đo lường mức độ hài lòng (eNPS) và tạo dựng môi trường làm việc công bằng, minh bạch, gắn kết nhân viên với tổ chức.", "Người ủng hộ nhân viên (Employee Champion): ")
    add_bullet(doc, " Thúc đẩy văn hóa đổi mới, đào tạo nâng cao năng lực thích ứng của nhân viên trước những biến động của thị trường và chuyển đổi số.", "Tác nhân thúc đẩy thay đổi (Change Agent): ")
    add_bullet(doc, " Cung cấp dữ liệu phân tích nhân sự (HR Analytics), dự báo định biên và xây dựng bản đồ quy hoạch cán bộ kế nhiệm phù hợp với mục tiêu tăng trưởng dài hạn.", "Đối tác chiến lược (Strategic Partner): ")
    add_p(doc, "Để thực thi trọn vẹn 4 vai trò trên, doanh nghiệp bắt buộc phải xây dựng Hệ thống thông tin Quản trị nguồn nhân lực (Human Resource Management Information System - HRMIS). Về bản chất, HRMIS là sự giao thoa toàn diện giữa quản trị nguồn nhân lực và công nghệ thông tin. Hệ thống cung cấp một cơ sở dữ liệu quan hệ tập trung, kết hợp các thuật toán xử lý nghiệp vụ tự động nhằm thu thập, lưu trữ, xử lý, phân tích và phân phối dòng thông tin nhân sự xuyên suốt toàn bộ vòng đời của người lao động.")
    add_p(doc, "Chu trình quản trị nhân sự khép kín trong HRMIS được chuẩn hóa thành 05 giai đoạn liên hoàn:")
    add_bullet(doc, " Xây dựng thương hiệu nhà tuyển dụng, phát triển cổng thông tin cơ hội việc làm (Careers Portal) và thu hút hồ sơ ứng viên tài năng.", "1. Thu hút nhân tài (Attract): ")
    add_bullet(doc, " Quản lý tin tuyển dụng, phân loại ứng viên theo mô hình phễu Kanban, lên lịch phỏng vấn, đánh giá ứng viên và phát hành thư mời nhận việc (Offer Letter).", "2. Tuyển chọn & Tiếp nhận (Recruit & Onboard): ")
    add_bullet(doc, " Thiết lập khung năng lực, tổ chức các khóa đào tạo nội bộ, đánh giá hiệu quả sau đào tạo và đo lường mức độ gắn kết văn hóa doanh nghiệp.", "3. Phát triển năng lực (Develop): ")
    add_bullet(doc, " Chấm công minh bạch, quản lý đơn nghỉ phép, vận hành động cơ tính lương tự động, trích nộp bảo hiểm, thuế TNCN và thực hiện các chính sách phúc lợi cạnh tranh.", "4. Duy trì & Đãi ngộ (Retain): ")
    add_bullet(doc, " Đánh giá tiềm năng và thành tích theo ma trận 9-Box Grid, lập kế hoạch kế nhiệm cho các vị trí lãnh đạo trọng yếu, quản lý biến động nhân sự và quy trình bàn giao thôi việc chuẩn mực.", "5. Quy hoạch & Luân chuyển (Succeed & Transition): ")

    # ---------------------------------------------
    # 1.2 Mô hình tích hợp dòng dữ liệu
    # ---------------------------------------------
    add_h2(doc, "1.2. Mô hình tích hợp dòng dữ liệu và quy trình nghiệp vụ nhân sự đa phân hệ")
    add_p(doc, "Trong các mô hình quản lý nhân sự truyền thống, các phân hệ nghiệp vụ thường bị phân tách thành các mảnh ghép rời rạc: bộ phận tuyển dụng sử dụng trang tính Excel riêng; bộ phận chấm công dùng phần mềm vân tay độc lập; kế toán lương tự nhập số liệu vào bảng tính để tính lương; trong khi các quyết định bổ nhiệm hay đào tạo chỉ lưu trên văn bản giấy tờ. Sự cô lập này dẫn đến 'nút cổ chai' nghiêm trọng: dữ liệu phải nhập lại nhiều lần, phát sinh độ trễ thông tin lớn và tiềm ẩn sai sót nghiêm trọng trong dữ liệu.")
    add_p(doc, "Hệ thống HRMIS mà đề tài nghiên cứu và thiết kế đã triệt tiêu hoàn toàn sự phân mảnh đó thông qua việc thiết lập một trục dữ liệu nhân sự liên thông 2 chiều (Bi-directional Data Pipeline) giữa 8 phân hệ cốt lõi:")
    add_figure(doc, "fig_1_3_hrmis_data_flow.png", "Hình 1.3. Mô hình tích hợp dòng thông tin 2 chiều giữa các phân hệ trong hệ sinh thái HRMIS")
    add_p(doc, "Cơ chế vận hành của dòng thông tin tích hợp được thể hiện qua các luồng nghiệp vụ liên hoàn:")
    add_bullet(doc, " Khi một ứng viên được Trưởng phòng và HR đánh giá đạt yêu cầu và chuyển sang trạng thái HIRED trên bảng Kanban tuyển dụng, hệ thống sẽ tự động kích hoạt tiến trình Onboarding, chuyển đổi toàn bộ thông tin ứng viên (họ tên, email, số điện thoại, vị trí) sang phân hệ Hồ sơ nhân sự điện tử mà không cần nhập liệu lại thủ công.", "Từ Tuyển dụng sang Hồ sơ nhân sự: ")
    add_bullet(doc, " Hồ sơ nhân viên mới được cấp mã nhân viên duy nhất (Employee Code: EMPxxx), liên kết với một phòng ban và chức danh cụ thể, đồng thời khởi tạo tài khoản đăng nhập với vai trò phân quyền (RBAC) tương ứng để nhân viên truy cập cổng tự phục vụ ESS.", "Từ Hồ sơ nhân sự sang Phân quyền & Tài khoản: ")
    add_bullet(doc, " Mỗi lượt Check-in/Check-out hàng ngày của nhân viên tại phân hệ Chấm công được ghi nhận tức thời kèm mốc thời gian thực và trạng thái (Đúng giờ/Đi trễ). Đồng thời, các đơn xin nghỉ phép đã được Trưởng phòng phê duyệt tại phân hệ Nghỉ phép sẽ tự động đồng bộ sang bảng chấm công để ghi nhận ngày nghỉ có hưởng lương hoặc nghỉ không lương hợp lệ.", "Từ Chấm công & Nghỉ phép: ")
    add_bullet(doc, " Đến kỳ tính lương cuối tháng, Động cơ tính lương (Payroll Engine) tự động quét toàn bộ dữ liệu ngày công thực tế, ngày phép năm, các khoản phụ cấp và tiền thưởng thành tích từ cơ sở dữ liệu để tính toán chi tiết thu nhập, trích đóng 10.5% BHXH/BHYT/BHTN và khấu trừ thuế TNCN lũy tiến, sinh ra bảng lương chính xác 100%.", "Từ Chấm công & Dữ liệu nhân sự sang Bảng lương: ")
    add_bullet(doc, " Mọi quyết định điều chuyển phòng ban, bổ nhiệm chức vụ hay tăng lương định kỳ tại phân hệ Biến động nhân sự sẽ tự động cập nhật trực tiếp vào hồ sơ nhân viên và mức lương cơ bản mới cho các chu kỳ tính lương tiếp theo.", "Từ Biến động nhân sự sang Hồ sơ & Tiền lương: ")
    add_bullet(doc, " Kết quả tham gia các khóa đào tạo, điểm số bài thi chuyên môn và mức độ gắn kết eNPS là nguồn dữ liệu đầu vào khách quan để Hội đồng đánh giá đưa nhân sự vào ma trận 9-Box Grid, lập kế hoạch dự phòng cho các vị trí quản lý tương lai.", "Từ Đào tạo & Khảo sát sang Quy hoạch cán bộ kế nhiệm: ")
    add_bullet(doc, " Toàn bộ các thao tác tạo mới, phê duyệt, điều chỉnh dữ liệu lương hoặc phân quyền vai trò trên tất cả các phân hệ đều được tự động ghi nhận vào Nhật ký kiểm toán (Audit Log) lưu trữ bất biến, phục vụ công tác thanh tra tuân thủ nội bộ và bảo mật thông tin.", "Kiểm soát tuân thủ & Ghi vết kiểm toán: ")

    # ---------------------------------------------
    # 1.3 Khảo sát thực trạng quy trình
    # ---------------------------------------------
    add_h2(doc, "1.3. Khảo sát thực trạng quy trình quản lý nhân sự tại doanh nghiệp")
    add_p(doc, "Qua quá trình khảo sát trực tiếp tại Công ty Cổ phần Công nghệ & Dịch vụ Số HTTT (HTTT Corporation) với quy mô đại diện gồm 6 khối phòng ban chức năng, nhóm nghiên cứu đã ghi nhận bức tranh chi tiết về thực trạng vận hành trước khi ứng dụng phần mềm quản trị:")
    add_p(doc, "1. Thực trạng quản lý hồ sơ và cơ cấu tổ chức:")
    add_bullet(doc, " Hồ sơ nhân viên được lưu trữ song song dưới hai hình thức: một phần lưu bằng bản cứng (hợp đồng lao động, sơ yếu lý lịch, bằng cấp chứng chỉ) trong tủ tài liệu phòng Nhân sự, và một phần lưu trong các file Microsoft Excel do chuyên viên nhân sự tự quản lý. Khi cần tra cứu thông tin phục vụ lập báo cáo hoặc trích xuất số CCCD, tài khoản ngân hàng, chuyên viên phải tìm kiếm thủ công mất nhiều thời gian, nguy cơ thất lạc dữ liệu hoặc sai lệch thông tin giữa các phiên bản file Excel rất cao.")
    add_p(doc, "2. Thực trạng chấm công và theo dõi chuyên cần:")
    add_bullet(doc, " Doanh nghiệp sử dụng 02 máy chấm công vân tay đặt tại cửa ra vào văn phòng. Tuy nhiên, tình trạng nghẽn hàng đợi xảy ra phổ biến vào khung giờ 8h15 - 8h30 sáng; đầu đọc vân tay thường xuyên bị mờ, không nhận diện được vân tay khi thời tiết lạnh hoặc tay ẩm ướt. Cuối tháng, nhân sự phải xuất file text thô từ máy chấm công để xử lý công thức Excel, dẫn đến tranh cãi kéo dài về các trường hợp quên chấm công, đi muộn có lý do chính đáng.")
    add_p(doc, "3. Thực trạng phê duyệt đơn nghỉ phép:")
    add_bullet(doc, " Quy trình xin nghỉ phép thực hiện qua việc gửi email hoặc nhắn tin qua nhóm Zalo nội bộ của từng phòng ban. Trưởng phòng phê duyệt bằng tin nhắn nhưng không lưu trữ tập trung. Bộ phận C&B không nắm bắt được số ngày phép năm còn lại của nhân viên theo thời gian thực, dẫn đến tình trạng nhân viên nghỉ quá số ngày phép quy định nhưng vẫn được tính đủ lương.")
    add_p(doc, "4. Thực trạng tính toán tiền lương và chế độ đãi ngộ:")
    add_bullet(doc, " Bảng lương tháng được lập trên một file Excel đồ sộ với hàng chục cột công thức đan xen phức tạp. Chuyên viên C&B mất từ 4 đến 6 ngày làm việc vào đầu mỗi tháng để tính toán, đối soát và gửi phiếu lương thủ công qua email từng cá nhân. Tỷ lệ phát sinh khiếu nại sai lệch ngày công, thiếu phụ cấp hoặc tính sai thuế TNCN chiếm từ 8% đến 12% tổng số nhân sự mỗi kỳ.")
    add_p(doc, "5. Thực trạng tuyển dụng, đào tạo và quy hoạch cán bộ:")
    add_bullet(doc, " Thông tin tuyển dụng chỉ đăng rải rác trên mạng xã hội hoặc nhận CV qua email cá nhân của HR. Ứng viên tiềm năng bị trôi tin nhắn và không được phân loại khoa học. Các chương trình đào tạo nội bộ tổ chức định kỳ nhưng không có hệ thống theo dõi kết quả; khảo sát mức độ hài lòng thực hiện qua Google Forms phân tán; doanh nghiệp hoàn toàn chưa có công cụ quy hoạch cán bộ kế nhiệm chuyên nghiệp.")

    table_1_2_data = [
        ["Quản lý hồ sơ", "Lưu file Excel phân tán, hồ sơ giấy dễ thất lạc", "Hồ sơ điện tử tập trung, phân quyền bảo mật cao", "Tra cứu tức thời, bảo mật 100%"],
        ["Chấm công", "Máy vân tay hay nghẽn, tổng hợp công thức Excel", "Check-in/Out trực tuyến, tự động tính công", "Tiết kiệm 90% thời gian chốt công"],
        ["Đơn nghỉ phép", "Nhắn tin Zalo/Email, theo dõi phép thủ công", "Tạo và duyệt đơn đa cấp trực tuyến, trừ phép tự động", "Minh bạch quỹ phép, không sai sót"],
        ["Tính tiền lương", "File Excel công thức thủ công, mất 4-6 ngày/tháng", "Động cơ tính lương tự động, trích bảo hiểm/thuế 1-click", "Thời gian tính lương còn < 15 phút"],
        ["Tuyển dụng", "Nhận CV qua email, theo dõi bằng bảng tính", "Kanban Pipeline trực quan, kết nối cổng Careers", "Rút ngắn 50% thời gian tuyển dụng"],
        ["Biến động nhân sự", "Văn bản giấy tờ rời rạc, cập nhật hồ sơ chậm", "Quyết định điện tử, tự động cập nhật Profile & Lương", "Lưu vết lịch sử biến động 100%"],
        ["Quy hoạch kế nhiệm", "Đánh giá cảm tính, thiếu bản đồ kế nhiệm", "Ma trận 9-Box Grid, xác định nhân tài & kế nhiệm", "Chủ động 100% nguồn cán bộ quản lý"],
        ["Kiểm toán tuân thủ", "Không có nhật ký, không kiểm soát được can thiệp", "Audit Trail ghi nhận tự động toàn bộ thao tác", "Đáp ứng tiêu chuẩn ISO 27001"],
    ]
    create_table(doc, ["Mảng nghiệp vụ", "Quy trình truyền thống (Trước)", "Hệ thống HRMIS đề xuất (Sau)", "Hiệu quả cải tiến"], table_1_2_data, [2.5, 4.5, 5.5, 3.5])
    add_caption(doc, "Bảng 1.2: So sánh quy trình quản trị nhân sự truyền thống vs Hệ thống HRMIS tích hợp")

    # ---------------------------------------------
    # 1.4 Phát biểu bài toán & Yêu cầu tin học hóa
    # ---------------------------------------------
    add_h2(doc, "1.4. Phát biểu bài toán và xác định các yêu cầu tin học hóa")
    add_p(doc, "Từ những khảo sát và phân tích bất cập thực tiễn nêu trên, bài toán đặt ra cho đề tài là: Xây dựng Hệ thống Thông tin Quản trị Nhân lực (HRMIS) toàn diện cho HTTT Corporation, giải quyết triệt để sự cô lập dữ liệu giữa các nghiệp vụ nhân sự, tự động hóa quy trình chấm công - tính lương, số hóa phễu tuyển dụng Kanban, chuẩn hóa công tác quy hoạch cán bộ và thiết lập cơ chế kiểm toán tuân thủ minh bạch.")
    add_p(doc, "1. Yêu cầu chức năng của hệ thống (Functional Requirements):")
    add_bullet(doc, " Trực quan hóa cơ cấu tổ chức hình cây (Org Chart); quản lý danh mục phòng ban, bổ nhiệm Trưởng phòng (Manager), quản lý định biên và hiển thị quy mô nhân sự thực tế theo thời gian thực.", "Nhóm 1 - Cơ cấu tổ chức & Phòng ban: ")
    add_bullet(doc, " Quản lý toàn diện hồ sơ lý lịch nhân sự (mã nhân viên, họ tên, CCCD, ngày sinh, ngày vào làm, chức danh, mức lương cơ bản, tài khoản ngân hàng, loại hợp đồng); hỗ trợ lọc, tìm kiếm nâng cao và modal thêm/sửa hồ sơ an toàn.", "Nhóm 2 - Hồ sơ nhân sự điện tử: ")
    add_bullet(doc, " Điểm danh Check-in/Check-out hàng ngày; ghi nhận thời gian thực và phân loại trạng thái (Đúng giờ, Đi trễ, Vắng mặt); cung cấp bảng thống kê chuyên cần cho cá nhân và toàn doanh nghiệp.", "Nhóm 3 - Chấm công & Điểm danh chuyên cần: ")
    add_bullet(doc, " Hỗ trợ nhân viên tạo đơn xin nghỉ phép (Nghỉ phép năm, nghỉ ốm, việc riêng); quy trình phê duyệt đa cấp (Trưởng phòng duyệt -> HR xác nhận); tự động kiểm tra số dư phép và đồng bộ ngày công sang bảng lương.", "Nhóm 4 - Quản lý Nghỉ phép & Phê duyệt: ")
    add_bullet(doc, " Động cơ tính lương tự động dựa trên ngày công thực tế, lương cơ bản ngạch bậc, thành phần phụ cấp chức vụ, tiền thưởng hiệu quả; tự động trích nộp 10.5% bảo hiểm (BHXH 8%, BHYT 1.5%, BHTN 1%) và thuế TNCN lũy tiến; chức năng khóa bất biến bảng lương tháng chống sửa đổi và xuất bảng lương Excel.", "Nhóm 5 - Bảng chấm lương & Đãi ngộ C&B: ")
    add_bullet(doc, " Quản lý tin tuyển dụng đang mở; cổng thông tin việc làm công khai (Careers Page); bảng điều khiển Kanban trực quan kéo thả ứng viên qua các giai đoạn (Applied -> Screening -> Interview -> Offer -> Hired -> Rejected); chức năng đặt lịch phỏng vấn và tự động tạo hồ sơ nhân viên khi trúng tuyển.", "Nhóm 6 - Quản trị Tuyển dụng & Kanban: ")
    add_bullet(doc, " Quản lý và ban hành các quyết định điều chuyển phòng ban, bổ nhiệm chức vụ, điều chỉnh mức lương, chuyển chính thức; tự động cập nhật vào Profile và lịch sử nhân sự.", "Nhóm 7 - Biến động nhân sự: ")
    add_bullet(doc, " Thiết lập khóa đào tạo kỹ năng; tổ chức khảo sát đo lường mức độ gắn kết nhân viên eNPS ẩn danh; đánh giá nhân tài theo ma trận 9-Box Grid (Năng lực vs Tiềm năng); lập kế hoạch kế nhiệm cho các vị trí trọng yếu; ghi vết nhật ký kiểm toán (Audit Trail) bất biến.", "Nhóm 8 - Đào tạo, Khảo sát, Kế nhiệm & Kiểm toán: ")

    add_p(doc, "2. Yêu cầu phi chức năng của hệ thống (Non-Functional Requirements):")
    add_bullet(doc, " Phân quyền truy cập đa tầng dựa trên vai trò (RBAC) với 4 cấp: SYSTEM_ADMIN, MANAGER, HR, USER. Mã hóa mật khẩu bằng thuật toán băm Bcrypt Salt 10; bảo vệ toàn bộ API endpoints bằng xác thực phiên làm việc JSON Web Token (JWT); chặn hoàn toàn các hành vi leo thang đặc quyền.", "Bảo mật & Phân quyền (Security & RBAC): ")
    add_bullet(doc, " Thời gian phản hồi trung bình của hệ thống đối với các thao tác truy vấn dữ liệu và tải trang dưới 500ms; động cơ tính toán bảng lương cho toàn bộ nhân sự hoàn thành trong thời gian dưới 3 giây.", "Hiệu năng & Tốc độ đáp ứng (Performance): ")
    add_bullet(doc, " Cơ sở dữ liệu quan hệ PostgreSQL được thiết kế chuẩn hóa mức 3NF, bảo đảm tính toàn vẹn khóa ngoại (Foreign Keys), cơ chế giao dịch ACID (Atomicity, Consistency, Isolation, Durability) ngăn ngừa triệt để tình trạng xung đột dữ liệu.", "Tính toàn vẹn dữ liệu (Data Integrity): ")
    add_bullet(doc, " Giao diện người dùng tuân thủ nghiêm ngặt chủ đề Corporate Slate / Neutral trang nhã, không màu mè, loại bỏ dải màu gradient sặc sỡ; hỗ trợ hiển thị mượt mà trên cả chế độ Sáng và Tối (Light/Dark Mode); bố cục Responsive thích ứng đa thiết bị.", "Trải nghiệm người dùng (UX/UI Consistency): ")

    add_p(doc, "3. Ma trận phân định trách nhiệm liên phòng ban (RACI Matrix):")
    table_1_3_data = [
        ["Quản lý cơ cấu & Phòng ban", "I", "C", "A", "R", "I"],
        ["Quản lý Hồ sơ nhân sự", "A", "C", "A", "R", "I"],
        ["Điểm danh & Chấm công", "A", "R", "A", "R", "I"],
        ["Phê duyệt Đơn nghỉ phép", "A", "R", "A", "C", "I"],
        ["Tính toán & Chi trả Lương", "I", "I", "A", "R", "C"],
        ["Đăng tin & Tuyển dụng Kanban", "I", "C", "A", "R", "I"],
        ["Ban hành Biến động nhân sự", "C", "C", "A", "R", "I"],
        ["Đào tạo & Khảo sát eNPS", "I", "R", "A", "R", "I"],
        ["Quy hoạch cán bộ kế nhiệm", "C", "C", "A", "R", "I"],
        ["Kiểm toán & Quản trị hệ thống", "R", "I", "I", "I", "I"],
    ]
    create_table(doc, ["Quy trình nghiệp vụ nhân sự", "Admin", "Nhân viên (User)", "Trưởng phòng (Manager)", "Nhân sự (HR)", "Kế toán (Finance)"], table_1_3_data, [5.0, 2.0, 2.5, 2.5, 2.0, 2.0])
    add_caption(doc, "Bảng 1.3: Ma trận phân định trách nhiệm liên phòng ban (RACI Matrix) trong vận hành nhân sự\n(R: Responsible - Thực hiện; A: Accountable - Chịu trách nhiệm; C: Consulted - Tham vấn; I: Informed - Nhận thông tin)")

    # ---------------------------------------------
    # Tóm tắt chương 1
    # ---------------------------------------------
    add_h2(doc, "Tóm tắt chương 1")
    add_p(doc, "Chương 1 đã hệ thống hóa toàn diện cơ sở lý luận về Quản trị nguồn nhân lực (HRM) theo mô hình Dave Ulrich và vai trò của Hệ thống thông tin Quản trị nguồn nhân lực (HRMIS) trong doanh nghiệp số hiện đại. Đề tài đã làm rõ tính tất yếu của mô hình tích hợp dữ liệu liên thông 2 chiều giữa 8 phân hệ cốt lõi. Trên cơ sở khảo sát thực trạng vận hành tại HTTT Corporation, chương này đã chỉ rõ các điểm nghẽn nghiêm trọng về sự phân mảnh hồ sơ, gian lận giờ công, sai sót trong tính lương phức tạp và thiếu quy hoạch kế nhiệm. Từ đó, đề tài phát biểu bài toán tin học hóa, xác định chi tiết bộ yêu cầu chức năng, yêu cầu phi chức năng và ma trận phân định trách nhiệm RACI, tạo tiền đề khoa học vững chắc cho công tác phân tích và thiết kế hệ thống ở Chương 2.")

    doc.add_page_break()
