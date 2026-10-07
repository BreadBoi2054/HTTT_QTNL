# -*- coding: utf-8 -*-
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from build_report import add_h1, add_h2, add_h3, add_p, add_bullet, add_figure, create_table, add_caption

def build_intro(doc):
    add_h1(doc, "PHẦN MỞ ĐẦU")

    # ---------------------------------------------
    # 1. Lý do chọn đề tài
    # ---------------------------------------------
    add_h2(doc, "1. Lý do chọn đề tài")
    add_p(doc, "Trong bối cảnh cuộc Cách mạng công nghiệp lần thứ tư (Industry 4.0) và làn sóng chuyển đổi số đang diễn ra mạnh mẽ trên phạm vi toàn cầu, nguồn nhân lực luôn được xác định là tài sản chiến lược quý giá nhất, quyết định trực tiếp đến năng lực cạnh tranh và sự tồn vong của mọi tổ chức kinh tế. Quản trị nguồn nhân lực (Human Resource Management - HRM) ngày nay không còn dừng lại ở các nghiệp vụ sự vụ hành chính đơn thuần như chấm công thủ công hay lưu trữ hồ sơ giấy, mà đã chuyển mình trở thành một đối tác chiến lược (Strategic Business Partner) đồng hành cùng sự tăng trưởng của doanh nghiệp.")
    add_p(doc, "Tuy nhiên, khảo sát thực tế tại nhiều doanh nghiệp công nghệ, dịch vụ và sản xuất tại Việt Nam hiện nay cho thấy công tác quản trị nhân lực vẫn đang đối mặt với những rào cản và nghịch lý nghiêm trọng:")
    add_bullet(doc, " Hầu hết các đơn vị vẫn quản lý hồ sơ nhân viên qua các file Microsoft Excel phân tán hoặc phần mềm đóng gói cục bộ. Dữ liệu nhân sự bị phân mảnh thành các 'ốc đảo' (Data Silos) biệt lập: phòng Nhân sự giữ hồ sơ lý lịch, phòng Kế toán giữ dữ liệu tính lương, trong khi các Trưởng bộ phận lại quản lý ca trực và đánh giá hiệu suất riêng lẻ.", "Sự phân mảnh và đứt gãy thông tin nhân sự: ")
    add_bullet(doc, " Quy trình chấm công bằng máy vân tay truyền thống thường xuyên xảy ra lỗi kẹt máy, nghẽn mạng giờ cao điểm hoặc tình trạng nhân viên chấm công hộ, đi muộn về sớm khó kiểm soát. Quản lý mất từ 3 đến 5 ngày công mỗi tháng chỉ để tổng hợp, đối soát công lệch và giải quyết hàng loạt khiếu nại sai sót.", "Bất cập trong theo dõi chấm công và gian lận giờ làm: ")
    add_bullet(doc, " Chính sách tiền lương hiện đại kết hợp nhiều biến số phức tạp: lương cơ bản theo ngạch bậc, phụ cấp trách nhiệm, thưởng hiệu quả công việc (KPIs), trích nộp nghĩa vụ Bảo hiểm xã hội (10.5%) và thuế Thu nhập cá nhân (TNCN) lũy tiến từng phần. Việc tính toán thủ công trên bảng tính tiềm ẩn rủi ro sai sót toán học cao, dễ gây mất niềm tin và suy giảm động lực của người lao động.", "Độ trễ và rủi ro sai lệch trong tính toán tiền lương & đãi ngộ: ")
    add_bullet(doc, " Hoạt động tuyển dụng chưa được số hóa theo mô hình đường ống (Pipeline/Kanban), dẫn đến thất lạc hồ sơ ứng viên tài năng. Công tác đào tạo và khảo sát văn hóa doanh nghiệp mang tính hình thức, thiếu công cụ đo lường mức độ gắn kết (eNPS). Đặc biệt, doanh nghiệp hoàn toàn bị động trong quy hoạch cán bộ kế nhiệm (Succession Planning), dẫn đến tình trạng khủng hoảng thiếu hụt nhân sự lãnh đạo khi có biến động bất ngờ.", "Thiếu hụt công cụ quản trị nhân tài và quy hoạch kế nhiệm chiến lược: ")
    add_p(doc, "Xuất phát từ những đòi hỏi bức thiết của thực tiễn, đề tài \"Phân tích và thiết kế hệ thống thông tin quản trị nhân lực (HRMIS) tại doanh nghiệp\" được lựa chọn nghiên cứu. Đề tài tập trung xây dựng một hệ sinh thái phần mềm quản trị nguồn nhân lực toàn diện, chuẩn mực theo chuẩn kiến trúc doanh nghiệp (Enterprise Architecture). Hệ thống tích hợp xuyên suốt từ: Cơ cấu tổ chức, Hồ sơ nhân sự điện tử, Chấm công chuyên cần, Quản lý nghỉ phép, Bảng chấm lương tự động, Tuyển dụng Kanban, Biến động nhân sự, Đào tạo & Khảo sát eNPS, đến Quy hoạch cán bộ kế nhiệm và Kiểm toán tuân thủ (Audit Workflow), góp phần nâng cao năng suất lao động và thúc đẩy chiến lược phát triển bền vững của doanh nghiệp.")

    # ---------------------------------------------
    # 2. Tổng quan về Doanh nghiệp & Bài toán
    # ---------------------------------------------
    add_h2(doc, "2. Tổng quan về Doanh nghiệp & Bài toán Quản trị Nhân lực")
    add_p(doc, "Công ty Cổ phần Công nghệ & Dịch vụ Số HTTT (HTTT Corporation) là doanh nghiệp công nghệ tiêu biểu hoạt động trong lĩnh vực phát triển giải pháp phần mềm quản trị doanh nghiệp, tích hợp hệ thống và cung cấp dịch vụ số hóa. Trải qua hơn 10 năm xây dựng và phát triển, công ty đã xây dựng được đội ngũ nhân sự chất lượng cao, quy tụ các kỹ sư phần mềm, chuyên gia giải pháp, chuyên viên nhân sự và đội ngũ tư vấn kinh doanh năng động.")
    add_p(doc, "Về cơ cấu tổ chức, HTTT Corporation vận hành theo mô hình quản trị chức năng kết hợp ma trận dự án. Đứng đầu là Đại hội đồng Cổ đông và Hội đồng Quản trị, điều hành trực tiếp thông qua Ban Tổng Giám đốc (CEO) cùng 6 khối phòng ban nghiệp vụ trọng yếu:")

    table_1_1_data = [
        ["1", "Ban Giám đốc Điều hành (BOD Office)", "Hoạch định chiến lược, thư ký HĐQT, quan hệ đối tác", "02", "Quản lý cấp cao"],
        ["2", "Khối Công nghệ Thông tin (IT Dept)", "R&D, Kiến trúc hệ thống, Lập trình Frontend/Backend/DevOps", "07", "Chuyên môn kỹ thuật"],
        ["3", "Khối Quản trị Nhân sự & Đào tạo (HR)", "Thu hút nhân tài, C&B, L&D, quy hoạch cán bộ, văn hóa", "03", "Nghiệp vụ nhân lực"],
        ["4", "Khối Tài chính Kế toán (Finance)", "Kế toán thuế, kiểm soát dòng tiền, thẩm định bảng lương", "02", "Tài chính kế toán"],
        ["5", "Khối Kinh doanh & PT Thị trường (Sales)", "Tư vấn giải pháp, tìm kiếm khách hàng, phát triển doanh thu", "02", "Kinh doanh dự án"],
        ["6", "Khối Tiếp thị & Truyền thông (Marketing)", "Truyền thông thương hiệu, tiếp thị số, khảo sát eNPS", "02", "Marketing & PR"],
    ]
    create_table(doc, ["STT", "Khối Phòng ban", "Chức năng nhiệm vụ cốt lõi", "Quy mô đại diện", "Tính chất chuyên môn"], table_1_1_data, [1.2, 4.5, 5.5, 2.0, 3.0])
    add_caption(doc, "Bảng 1.1: Cơ cấu nhân sự và quy mô 6 khối phòng ban tại HTTT Corporation")

    add_figure(doc, "fig_1_1_org_chart.png", "Hình 1.1. Sơ đồ cơ cấu tổ chức tổng thể Công ty Cổ phần Công nghệ & Dịch vụ Số HTTT")
    add_p(doc, "Trong cơ cấu bộ máy, Khối Quản trị Nguồn nhân lực đóng vai trò là xương sống kết nối và điều hòa toàn bộ các hoạt động sản xuất kinh doanh. Bộ phận này chịu trách nhiệm thiết lập các tiêu chuẩn năng lực, duy trì kỷ luật lao động, xây dựng chính sách đãi ngộ cạnh tranh và quy hoạch đội ngũ cán bộ nguồn:")
    add_figure(doc, "fig_1_2_hr_dept_structure.png", "Hình 1.2. Sơ đồ cơ cấu tổ chức & Phân định chức năng Khối Quản trị Nguồn nhân lực")

    # ---------------------------------------------
    # 3. Mục tiêu và nhiệm vụ nghiên cứu
    # ---------------------------------------------
    add_h2(doc, "3. Mục tiêu và nhiệm vụ nghiên cứu")
    add_p(doc, "Mục tiêu tổng quát của đề tài là nghiên cứu, phân tích và thiết kế một Hệ thống Thông tin Quản trị Nhân lực (HRMIS) toàn diện, ứng dụng công nghệ phần mềm hiện đại nhằm số hóa 100% các quy trình quản lý nhân sự, tự động hóa khâu chấm công - tính lương, tối ưu hóa đường ống tuyển dụng và xây dựng bản đồ quy hoạch cán bộ khoa học cho doanh nghiệp.")
    add_p(doc, "Để hoàn thành mục tiêu tổng quát nêu trên, đề tài xác định và giải quyết các nhiệm vụ nghiên cứu cụ thể sau:")
    add_bullet(doc, " Hệ thống hóa cơ sở lý luận về quản trị nguồn nhân lực hiện đại (mô hình Dave Ulrich, chu trình nhân sự 5 giai đoạn) và kiến trúc hệ thống thông tin quản lý nhân sự (HRIS/HRMIS).", "Về mặt lý luận: ")
    add_bullet(doc, " Tiến hành khảo sát thực trạng quy trình vận hành nhân sự tại doanh nghiệp HTTT Corporation; nhận diện các 'điểm nghẽn' (Bottlenecks), rủi ro sai sót trong tính lương và thất thoát nhân tài.", "Về mặt thực tiễn: ")
    add_bullet(doc, " Áp dụng phương pháp phân tích thiết kế hướng đối tượng (OOAD) sử dụng chuẩn ngôn ngữ mô hình hóa UML 2.5: Xác định 5 tác nhân, danh mục 52 ca sử dụng (Use case), xây dựng 10 bảng đặc tả chi tiết, 11 biểu đồ use case, 8 biểu đồ sequence, 7 biểu đồ activity, 4 biểu đồ state machine, biểu đồ package và biểu đồ lớp.", "Về mặt phân tích hệ thống: ")
    add_bullet(doc, " Thiết kế cơ sở dữ liệu quan hệ vật lý (Physical ERD) chuẩn hóa mức 3NF trên hệ quản trị PostgreSQL; thiết kế từ điển dữ liệu 10 bảng bám sát thực tế; thiết kế kiến trúc kỹ thuật 3 tầng (3-Tier Enterprise) trên nền tảng Next.js App Router, Prisma ORM và Auth.js RBAC.", "Về mặt thiết kế kỹ thuật: ")
    add_bullet(doc, " Thiết kế giao diện người dùng trực quan (UI Mockups) theo chủ đề Corporate Slate trang nhã, hỗ trợ cả giao diện Sáng/Tối (Light/Dark mode) và cổng tự phục vụ của nhân viên (ESS).", "Về mặt giao diện người dùng: ")
    add_bullet(doc, " Đánh giá hiệu quả kinh tế - kỹ thuật sau khi triển khai hệ thống thông qua bộ chỉ số so sánh định lượng và đề xuất các hướng mở rộng ứng dụng AI trong tương lai.", "Về mặt đánh giá & ứng dụng: ")

    # ---------------------------------------------
    # 4. Đối tượng và phạm vi nghiên cứu
    # ---------------------------------------------
    add_h2(doc, "4. Đối tượng và phạm vi nghiên cứu")
    add_bullet(doc, " Toàn bộ dòng thông tin quản trị nguồn nhân lực, dữ liệu hồ sơ, quy trình chấm công, công thức tính lương, quy trình tuyển dụng, dữ liệu biến động nhân sự, kế hoạch đào tạo, ma trận quy hoạch cán bộ kế nhiệm và nhật ký kiểm toán tuân thủ trong doanh nghiệp.", "Đối tượng nghiên cứu: ")
    add_bullet(doc, " Nghiên cứu tại cấp độ Công ty Cổ phần Công nghệ & Dịch vụ Số HTTT (HTTT Corporation) trong mối tương tác dữ liệu giữa 6 khối phòng ban chức năng.", "Phạm vi không gian: ")
    add_bullet(doc, " Giới hạn trong 8 phân hệ nghiệp vụ cốt lõi: (1) Cơ cấu tổ chức & Phòng ban; (2) Hồ sơ nhân sự điện tử; (3) Chấm công & Chuyên cần; (4) Nghỉ phép & Phê duyệt đơn từ; (5) Bảng chấm lương & Đãi ngộ C&B; (6) Quản trị Tuyển dụng & Kanban; (7) Biến động nhân sự; (8) Đào tạo, Khảo sát eNPS, Quy hoạch cán bộ kế nhiệm & Kiểm toán tuân thủ.", "Phạm vi nghiệp vụ: ")
    add_bullet(doc, " Áp dụng phương pháp phân tích thiết kế hướng đối tượng UML 2.5; hiện thực hóa kiến trúc phần mềm Full-stack trên nền tảng Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma ORM v7, PostgreSQL 16 đóng gói Docker Container và Auth.js RBAC bảo mật đa tầng.", "Phạm vi công nghệ: ")

    # ---------------------------------------------
    # 5. Cấu trúc của báo cáo
    # ---------------------------------------------
    add_h2(doc, "5. Cấu trúc của báo cáo")
    add_p(doc, "Báo cáo bài tập lớn kết thúc học phần được kết cấu chặt chẽ thành 3 chương chính cùng phần mở đầu, danh mục tài liệu tham khảo và phụ lục kỹ thuật theo đúng quy chuẩn học thuật:")
    add_bullet(doc, " Trình bày tính cấp thiết, lý do chọn đề tài, tổng quan doanh nghiệp nghiên cứu, mục tiêu, nhiệm vụ, đối tượng, phạm vi và phương pháp luận.", "Phần Mở đầu: ")
    add_bullet(doc, " Trình bày nền tảng lý thuyết về HRM và HRMIS, mô hình tích hợp dữ liệu đa phân hệ, kết quả khảo sát thực trạng vận hành tại HTTT Corporation, bảng so sánh trước - sau, phát biểu bài toán tin học hóa và ma trận trách nhiệm RACI.", "Chương 1 - Cơ sở lý luận về Quản trị nguồn nhân lực và Hệ thống thông tin Quản trị nhân lực (HRMIS): ")
    add_bullet(doc, " Đây là chương trọng tâm của báo cáo, gồm: Phân tích yêu cầu nghiệp vụ (tác nhân, 52 use case, 10 bảng đặc tả chi tiết, 11 biểu đồ use case, bảng ánh xạ 3 tầng); Phân tích cấu trúc hệ thống (kiến trúc BCE); Phân tích hành vi (19 biểu đồ sequence, activity, state); Thiết kế hệ thống (biểu đồ lớp, ma trận RBAC, Physical ERD 3NF, từ điển dữ liệu 10 bảng, thiết kế UI Mockups và kiến trúc 3 tầng).", "Chương 2 - Phân tích và Thiết kế hệ thống thông tin quản trị nhân lực (HTTT QTNL): ")
    add_bullet(doc, " Tổng kết các kết quả đạt được thông qua hệ thống phần mềm thực tế đã triển khai và nạp dữ liệu hoàn chỉnh 18 nhân sự, 6 phòng ban; phân tích ưu điểm, hạn chế và đề xuất lộ trình mở rộng ứng dụng AI, nhận diện khuôn mặt và hợp đồng điện tử.", "Chương 3 - Kết quả đạt được và đề xuất, khuyến nghị hoặc hướng phát triển: ")
    add_bullet(doc, " Liệt kê các văn bản quy phạm pháp luật lao động, giáo trình đại học chuẩn mực và tài liệu khoa học chuyên ngành trong và ngoài nước.", "Tài liệu tham khảo: ")

    doc.add_page_break()
