# -*- coding: utf-8 -*-
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from build_report import add_caption, create_table

def build_preamble(doc):
    # ---------------------------------------------
    # TRANG BÌA CHÍNH (TITLE PAGE)
    # ---------------------------------------------
    p0 = doc.add_paragraph()
    p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p0.paragraph_format.space_before = Pt(10)
    p0.paragraph_format.space_after = Pt(2)
    r = p0.add_run("HỌC VIỆN CHÍNH TRỊ QUỐC GIA HỒ CHÍ MINH\n")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.bold = True
    r = p0.add_run("HỌC VIỆN HÀNH CHÍNH VÀ QUẢN TRỊ CÔNG")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    p_line = doc.add_paragraph()
    p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_line.paragraph_format.space_before = Pt(4)
    p_line.paragraph_format.space_after = Pt(70)
    r = p_line.add_run("---------------------------------------------------------")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(10)
    p_title.paragraph_format.space_after = Pt(15)
    r_sub = p_title.add_run("TÊN ĐỀ TÀI:\n")
    r_sub.font.name = "Times New Roman"
    r_sub.font.size = Pt(13)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(100, 116, 139)
    r_main = p_title.add_run("PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG THÔNG TIN QUẢN TRỊ NHÂN LỰC (HRMIS) TẠI DOANH NGHIỆP")
    r_main.font.name = "Times New Roman"
    r_main.font.size = Pt(17)
    r_main.font.bold = True
    r_main.font.color.rgb = RGBColor(15, 23, 42)

    p_type = doc.add_paragraph()
    p_type.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_type.paragraph_format.space_before = Pt(20)
    p_type.paragraph_format.space_after = Pt(60)
    r = p_type.add_run("BÀI TẬP LỚN KẾT THÚC HỌC PHẦN\n")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True
    r = p_type.add_run("Học phần: Hệ thống thông tin Quản trị nhân lực")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.italic = True

    p_info = doc.add_paragraph()
    p_info.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_info.paragraph_format.left_indent = Pt(100)
    p_info.paragraph_format.space_before = Pt(30)
    p_info.paragraph_format.space_after = Pt(80)
    p_info.paragraph_format.line_spacing = 1.3
    
    info_lines = [
        ("Giảng viên hướng dẫn: ", "ThS. Hoàng Minh Ngọc"),
        ("Sinh viên thực hiện:    ", "Đỗ Minh Hiếu"),
        ("Mã sinh viên:          ", "2305HTTA009"),
        ("Mã phách:              ", "...................................................................."),
    ]
    for lbl, val in info_lines:
        r1 = p_info.add_run(lbl)
        r1.font.name = "Times New Roman"
        r1.font.size = Pt(13)
        r1.font.bold = True
        r2 = p_info.add_run(val + "\n")
        r2.font.name = "Times New Roman"
        r2.font.size = Pt(13)

    p_foot = doc.add_paragraph()
    p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_foot.paragraph_format.space_before = Pt(20)
    r = p_foot.add_run("Hà Nội - 2026")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.bold = True

    doc.add_page_break()

    # ---------------------------------------------
    # LỜI CẢM ƠN
    # ---------------------------------------------
    p_ack_title = doc.add_paragraph()
    p_ack_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ack_title.paragraph_format.space_before = Pt(20)
    p_ack_title.paragraph_format.space_after = Pt(15)
    r = p_ack_title.add_run("LỜI CẢM ƠN")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    p_kinh_gui = doc.add_paragraph()
    p_kinh_gui.paragraph_format.space_after = Pt(4)
    r = p_kinh_gui.add_run("Kính gửi:")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.bold = True

    recipients = [
        "- Lãnh đạo Khoa Khoa học Liên ngành - Ngoại ngữ - Tin học, Học viện Hành chính và Quản trị công;",
        "- Quý Thầy, Cô giáo phụ trách Bộ môn Hệ thống thông tin và Quản trị doanh nghiệp;",
        "- Giảng viên hướng dẫn: ThS. Hoàng Minh Ngọc đã tận tình định hướng, chỉ dẫn phương pháp và truyền đạt kiến thức chuyên môn quý báu;",
        "- Ban Lãnh đạo và Khối Quản trị Nguồn nhân lực tại Công ty Cổ phần Công nghệ & Dịch vụ Số HTTT (HTTT Corporation)."
    ]
    for rec in recipients:
        p = doc.add_paragraph(style='List Paragraph')
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.25
        r = p.add_run(rec)
        r.font.name = "Times New Roman"
        r.font.size = Pt(13)

    ack_texts = [
        "Để bài báo cáo bài tập lớn kết thúc học phần với đề tài \"Phân tích và thiết kế hệ thống thông tin quản trị nhân lực (HRMIS) tại doanh nghiệp\" được hoàn thành một cách khoa học, chỉn chu và đạt kết quả thực tiễn cao nhất, em xin bày tỏ lòng biết ơn sâu sắc và chân thành nhất đến quý Thầy, Cô giáo. Thầy Cô đã dành nhiều thời gian, tâm huyết để truyền thụ những kiến thức nền tảng quý báu về phương pháp luận phân tích thiết kế hệ thống hướng đối tượng (OOAD), kiến trúc hệ thống thông tin quản lý nguồn nhân lực (HRIS/HRMIS) và nguyên lý quản trị doanh nghiệp số hiện đại.",
        "Đồng thời, em cũng xin chân thành cảm ơn Ban Giám hiệu cùng tập thể cán bộ, giảng viên tại Học viện Hành chính và Quản trị công đã tạo mọi điều kiện học tập, nghiên cứu và trang bị cho sinh viên phương pháp tư duy hệ thống đa chiều. Em cũng xin gửi lời cảm ơn tới đội ngũ quản lý nhân sự tại HTTT Corporation đã hỗ trợ cung cấp quy trình nghiệp vụ thực tế, cấu trúc phòng ban và các dữ liệu thực nghiệm quý báu phục vụ quá trình khảo sát bài toán.",
        "Dù đã có nhiều cố gắng nghiên cứu, đào sâu tài liệu và bám sát thực tiễn vận hành phần mềm quản trị nhân sự thực tế, song bài báo cáo chắc chắn không tránh khỏi những thiếu sót nhất định. Em rất mong nhận được những ý kiến đóng góp, chỉ dẫn quý báu từ quý Thầy, Cô giáo để đề tài tiếp tục được hoàn thiện và phát triển hơn nữa.",
        "Em xin trân trọng cảm ơn!"
    ]
    for t in ack_texts:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(5)
        p.paragraph_format.line_spacing = 1.25
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r = p.add_run(t)
        r.font.name = "Times New Roman"
        r.font.size = Pt(13)

    p_sign = doc.add_paragraph()
    p_sign.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_sign.paragraph_format.space_before = Pt(15)
    p_sign.paragraph_format.line_spacing = 1.25
    r = p_sign.add_run("Hà Nội, tháng 09 năm 2026\nSinh viên thực hiện\n\n\n\nĐỗ Minh Hiếu\nMSV: 2305HTTA009")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.italic = True

    doc.add_page_break()

    # ---------------------------------------------
    # LỜI CAM ĐOAN
    # ---------------------------------------------
    p_pledge_title = doc.add_paragraph()
    p_pledge_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_pledge_title.paragraph_format.space_before = Pt(20)
    p_pledge_title.paragraph_format.space_after = Pt(15)
    r = p_pledge_title.add_run("LỜI CAM ĐOAN")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    pledge_texts = [
        "Em xin cam đoan rằng toàn bộ nội dung được trình bày trong bài báo cáo bài tập lớn kết thúc học phần với đề tài \"Phân tích và thiết kế hệ thống thông tin quản trị nhân lực (HRMIS) tại doanh nghiệp\" là công trình nghiên cứu độc lập của bản thân em dưới sự hướng dẫn chuyên môn của giảng viên.",
        "Đề tài được thực hiện dựa trên nền tảng kiến thức lý thuyết đã tích lũy trong học phần Hệ thống thông tin Quản trị nhân lực, kết hợp khảo sát thực tế quy trình quản lý hồ sơ, chấm công, tiền lương, tuyển dụng, đào tạo và quy hoạch kế nhiệm tại doanh nghiệp công nghệ số. Mọi số liệu thực nghiệm, sơ đồ phân tích UML, lược đồ cơ sở dữ liệu quan hệ và bảng đặc tả nghiệp vụ trong báo cáo đều được xây dựng trung thực, minh bạch và có xuất xứ rõ ràng.",
        "Các nội dung kế thừa từ tài liệu tham khảo, bài báo khoa học, giáo trình đào tạo và tiêu chuẩn kỹ thuật phần mềm đều được trích dẫn nguồn đầy đủ theo đúng chuẩn mực học thuật quy định.",
        "Em xin hoàn toàn chịu trách nhiệm trước Bộ môn, Khoa và Hội đồng chấm thi về tính trung thực và sự chuẩn mực của công trình nghiên cứu này.",
        "Em xin trân trọng cam đoan!"
    ]
    for t in pledge_texts:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(5)
        p.paragraph_format.line_spacing = 1.25
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r = p.add_run(t)
        r.font.name = "Times New Roman"
        r.font.size = Pt(13)

    p_pledge_sign = doc.add_paragraph()
    p_pledge_sign.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_pledge_sign.paragraph_format.space_before = Pt(15)
    p_pledge_sign.paragraph_format.line_spacing = 1.25
    r = p_pledge_sign.add_run("Hà Nội, ngày 29 tháng 09 năm 2026\nSinh viên cam đoan\n\n\n\nĐỗ Minh Hiếu\nMSV: 2305HTTA009")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.italic = True

    doc.add_page_break()

    # ---------------------------------------------
    # MỤC LỤC
    # ---------------------------------------------
    p_toc_title = doc.add_paragraph()
    p_toc_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_toc_title.paragraph_format.space_before = Pt(15)
    p_toc_title.paragraph_format.space_after = Pt(15)
    r = p_toc_title.add_run("MỤC LỤC")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    toc_items = [
        ("PHẦN MỞ ĐẦU", "4", True),
        ("1. Lý do chọn đề tài", "4", False),
        ("2. Tổng quan về Doanh nghiệp & Bài toán Quản trị Nhân lực", "5", False),
        ("3. Mục tiêu và nhiệm vụ nghiên cứu", "8", False),
        ("4. Đối tượng và phạm vi nghiên cứu", "9", False),
        ("5. Cấu trúc của báo cáo", "10", False),
        ("PHẦN NỘI DUNG", "11", True),
        ("CHƯƠNG 1: CƠ SỞ LÝ LUẬN VỀ QUẢN TRỊ NGUỒN NHÂN LỰC VÀ HỆ THỐNG THÔNG TIN QUẢN TRỊ NHÂN LỰC (HRMIS)", "11", True),
        ("1.1. Lý thuyết cơ sở về Quản trị nguồn nhân lực và Hệ thống thông tin Quản trị nhân lực (HRMIS)", "11", False),
        ("1.2. Mô hình tích hợp dòng dữ liệu và quy trình nghiệp vụ nhân sự đa phân hệ", "16", False),
        ("1.3. Khảo sát thực trạng quy trình quản lý nhân sự tại doanh nghiệp", "20", False),
        ("1.4. Phát biểu bài toán và xác định các yêu cầu tin học hóa", "26", False),
        ("Tóm tắt chương 1", "30", False),
        ("CHƯƠNG 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG THÔNG TIN QUẢN TRỊ NHÂN LỰC (HTTT QTNL)", "31", True),
        ("2.1. Phân tích các yêu cầu nghiệp vụ", "31", False),
        ("2.1.1. Xác định tác nhân hệ thống (Actors)", "31", False),
        ("2.1.2. Xác định danh mục ca sử dụng (Use case)", "34", False),
        ("2.1.3. Đặc tả chi tiết các Use case cốt lõi của hệ thống", "40", False),
        ("2.1.4. Xây dựng biểu đồ Use case", "68", False),
        ("2.1.5. Phân tầng yêu cầu: từ quy trình nghiệp vụ đến use case hệ thống", "78", False),
        ("2.2. Phân tích cấu trúc hệ thống", "83", False),
        ("2.2.1. Định nghĩa và biểu diễn đối tượng, lớp (Kiến trúc BCE)", "83", False),
        ("2.2.2. Xác định các đối tượng, lớp từ đặc tả yêu cầu", "85", False),
        ("2.3. Phân tích hành vi của hệ thống", "88", False),
        ("2.3.1. Xây dựng biểu đồ trình tự (Sequence Diagrams)", "88", False),
        ("2.3.2. Xây dựng biểu đồ hoạt động (Activity Diagrams)", "106", False),
        ("2.3.3. Xây dựng biểu đồ trạng thái (State Machine Diagrams)", "120", False),
        ("2.3.4. Xây dựng biểu đồ cộng tác / tương tác", "126", False),
        ("2.4. Thiết kế hệ thống", "128", False),
        ("2.4.1. Xây dựng biểu đồ lớp (Class Diagrams)", "128", False),
        ("2.4.2. Thiết kế lưu trữ dữ liệu (Database Schema / Physical ERD & Data Dictionary)", "140", False),
        ("2.4.3. Thiết kế giao diện người dùng (UI Wireframes & Mockups)", "154", False),
        ("2.4.4. Thiết kế mô hình thành phần & Kiến trúc kỹ thuật (3-Tier Enterprise)", "166", False),
        ("Tóm tắt chương 2", "172", False),
        ("CHƯƠNG 3: KẾT QUẢ ĐẠT ĐƯỢC VÀ ĐỀ XUẤT, KHUYẾN NGHỊ HOẶC HƯỚNG PHÁT TRIỂN", "173", True),
        ("3.1. Những kết quả đạt được", "173", False),
        ("3.2. Đánh giá ưu điểm và hạn chế", "176", False),
        ("3.3. Hướng nghiên cứu và phát triển mở rộng", "178", False),
        ("Tóm tắt chương 3", "180", False),
        ("TÀI LIỆU THAM KHẢO", "181", True),
    ]

    for title, page, is_bold in toc_items:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        r1 = p.add_run(title)
        r1.font.name = "Times New Roman"
        r1.font.size = Pt(12)
        r1.font.bold = is_bold
        # Tab dots
        dots_count = max(5, 75 - len(title))
        r_dots = p.add_run(" " + "." * dots_count + " ")
        r_dots.font.name = "Times New Roman"
        r_dots.font.size = Pt(10)
        r_dots.font.color.rgb = RGBColor(148, 163, 184)
        r2 = p.add_run(page)
        r2.font.name = "Times New Roman"
        r2.font.size = Pt(12)
        r2.font.bold = is_bold

    doc.add_page_break()

    # ---------------------------------------------
    # DANH MỤC THUẬT NGỮ VIẾT TẮT
    # ---------------------------------------------
    p_abbr_title = doc.add_paragraph()
    p_abbr_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_abbr_title.paragraph_format.space_before = Pt(15)
    p_abbr_title.paragraph_format.space_after = Pt(15)
    r = p_abbr_title.add_run("DANH MỤC TỪ / THUẬT NGỮ VIẾT TẮT")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    abbr_data = [
        ["HRMIS", "Human Resource Management Information System", "Hệ thống thông tin quản trị nguồn nhân lực"],
        ["HRIS", "Human Resource Information System", "Hệ thống thông tin nhân sự"],
        ["HRM", "Human Resource Management", "Quản trị nguồn nhân lực"],
        ["RBAC", "Role-Based Access Control", "Kiểm soát truy cập dựa trên vai trò"],
        ["SOP", "Standard Operating Procedure", "Quy trình thao tác chuẩn"],
        ["eNPS", "Employee Net Promoter Score", "Chỉ số đo lường mức độ gắn kết nhân viên"],
        ["KPI", "Key Performance Indicator", "Chỉ số đánh giá hiệu quả công việc"],
        ["C&B", "Compensation & Benefits", "Tiền lương và chế độ đãi ngộ"],
        ["L&D", "Learning & Development", "Đào tạo và phát triển nhân lực"],
        ["ESS", "Employee Self-Service", "Cổng tự phục vụ của nhân viên"],
        ["OOAD", "Object-Oriented Analysis and Design", "Phân tích và thiết kế hướng đối tượng"],
        ["UML", "Unified Modeling Language", "Ngôn ngữ mô hình hóa thống nhất"],
        ["ERD", "Entity Relationship Diagram", "Sơ đồ quan hệ thực thể"],
        ["3NF", "Third Normal Form", "Dạng chuẩn hóa dữ liệu bậc 3"],
        ["ORM", "Object-Relational Mapping", "Ánh xạ quan hệ đối tượng"],
        ["BCE", "Boundary - Control - Entity", "Kiến trúc Giao diện - Điều khiển - Thực thể"],
        ["JWT", "JSON Web Token", "Chuỗi mã hóa xác thực phiên làm việc"],
        ["BHXH", "Bảo hiểm Xã hội", "Bảo hiểm xã hội bắt buộc theo Luật Lao động"],
        ["BHYT", "Bảo hiểm Y tế", "Bảo hiểm y tế theo quy định Nhà nước"],
        ["BHTN", "Bảo hiểm Thất nghiệp", "Bảo hiểm thất nghiệp người lao động"],
        ["TNCN", "Thuế Thu nhập Cá nhân", "Thuế thu nhập cá nhân tính lũy tiến từng phần"],
    ]

    create_table(doc, ["Ký hiệu", "Thuật ngữ tiếng Anh", "Ý nghĩa tiếng Việt"], abbr_data, [2.5, 6.5, 7.0])

    doc.add_page_break()

    # ---------------------------------------------
    # DANH MỤC BẢNG BIỂU & SƠ ĐỒ HÌNH ẢNH
    # ---------------------------------------------
    p_list_title = doc.add_paragraph()
    p_list_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_list_title.paragraph_format.space_before = Pt(15)
    p_list_title.paragraph_format.space_after = Pt(10)
    r = p_list_title.add_run("DANH MỤC BẢNG BIỂU, SƠ ĐỒ")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    p_tbl_lbl = doc.add_paragraph()
    r = p_tbl_lbl.add_run("Danh mục Bảng biểu:")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.bold = True

    tables_list = [
        ("Bảng 1.1. Cơ cấu nhân sự và quy mô 6 khối phòng ban tại HTTT Corporation", "6"),
        ("Bảng 1.2. So sánh quy trình quản trị nhân sự truyền thống vs Hệ thống HRMIS tích hợp", "24"),
        ("Bảng 1.3. Ma trận phân định trách nhiệm liên phòng ban (RACI Matrix) trong vận hành nhân sự", "28"),
        ("Bảng 2.1. Ánh xạ tác nhân hệ thống với vai trò vận hành thực tế tại doanh nghiệp", "32"),
        ("Bảng 2.2. Danh mục 52 Use case chi tiết của Hệ thống Thông tin Quản trị Nhân lực", "35"),
        ("Bảng 2.3. Đặc tả chi tiết Use case UC01 - Đăng nhập & Xác thực phân quyền RBAC", "41"),
        ("Bảng 2.4. Đặc tả chi tiết Use case UC02 - Tiếp nhận & Tạo mới hồ sơ nhân sự điện tử", "43"),
        ("Bảng 2.5. Đặc tả chi tiết Use case UC03 - Điểm danh chấm công & Theo dõi chuyên cần", "45"),
        ("Bảng 2.6. Đặc tả chi tiết Use case UC04 - Đăng ký và Phê duyệt đơn xin nghỉ phép", "48"),
        ("Bảng 2.7. Đặc tả chi tiết Use case UC05 - Vận hành động cơ tính lương tự động", "50"),
        ("Bảng 2.8. Đặc tả chi tiết Use case UC06 - Đăng tin tuyển dụng & Quản trị Kanban ứng viên", "53"),
        ("Bảng 2.9. Đặc tả chi tiết Use case UC07 - Ban hành quyết định biến động nhân sự", "55"),
        ("Bảng 2.10. Đặc tả chi tiết Use case UC08 - Tổ chức khóa đào tạo & Khảo sát eNPS", "57"),
        ("Bảng 2.11. Đặc tả chi tiết Use case UC09 - Quy hoạch cán bộ & Đánh giá ma trận 9-Box", "59"),
        ("Bảng 2.12. Đặc tả chi tiết Use case UC10 - Kiểm soát luồng phê duyệt & Ghi vết Audit Log", "61"),
        ("Bảng 2.13. Bảng ánh xạ ba tầng: từ Quy trình nghiệp vụ đến Use Case và Màn hình thực tế", "79"),
        ("Bảng 2.14. Ma trận phân quyền truy cập chức năng theo vai trò người dùng (RBAC Matrix)", "138"),
        ("Bảng 2.15. Đặc tả từ điển dữ liệu bảng Vai trò hệ thống (Role)", "142"),
        ("Bảng 2.16. Đặc tả từ điển dữ liệu bảng Tài khoản người dùng (User)", "143"),
        ("Bảng 2.17. Đặc tả từ điển dữ liệu bảng Phòng ban (Department)", "144"),
        ("Bảng 2.18. Đặc tả từ điển dữ liệu bảng Hồ sơ nhân sự (EmployeeProfile)", "145"),
        ("Bảng 2.19. Đặc tả từ điển dữ liệu bảng Chấm công (Attendance)", "146"),
        ("Bảng 2.20. Đặc tả từ điển dữ liệu bảng Đơn nghỉ phép (LeaveRequest)", "147"),
        ("Bảng 2.21. Đặc tả từ điển dữ liệu bảng Bảng lương tháng (Payroll)", "148"),
        ("Bảng 2.22. Đặc tả từ điển dữ liệu bảng Thành phần lương (SalaryComponent)", "149"),
        ("Bảng 2.23. Đặc tả từ điển dữ liệu bảng Tin tuyển dụng & Ứng viên (JobPosting & Application)", "150"),
        ("Bảng 2.24. Đặc tả từ điển dữ liệu bảng Biến động, Đào tạo, Kế nhiệm & Kiểm toán (HR Core)", "151"),
        ("Bảng 3.1. Tổng hợp các chỉ số hiệu quả vận hành nhân sự trước và sau khi triển khai HRMIS", "175"),
    ]

    for title, page in tables_list:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        r1 = p.add_run(title)
        r1.font.name = "Times New Roman"
        r1.font.size = Pt(11)
        dots_count = max(4, 75 - len(title))
        r_dots = p.add_run(" " + "." * dots_count + " ")
        r_dots.font.name = "Times New Roman"
        r_dots.font.size = Pt(10)
        r_dots.font.color.rgb = RGBColor(148, 163, 184)
        r2 = p.add_run(page)
        r2.font.name = "Times New Roman"
        r2.font.size = Pt(11)

    p_fig_lbl = doc.add_paragraph()
    p_fig_lbl.paragraph_format.space_before = Pt(10)
    r = p_fig_lbl.add_run("Danh mục Sơ đồ, Hình ảnh:")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.bold = True

    figures_list = [
        ("Hình 1.1. Sơ đồ cơ cấu tổ chức tổng thể Công ty Cổ phần Công nghệ & Dịch vụ Số HTTT", "6"),
        ("Hình 1.2. Sơ đồ cơ cấu tổ chức & Phân định chức năng Khối Quản trị Nguồn nhân lực", "7"),
        ("Hình 1.3. Mô hình tích hợp dòng thông tin 2 chiều giữa các phân hệ trong hệ sinh thái HRMIS", "18"),
        ("Hình 2.1. Biểu đồ cây phân cấp Tác nhân (Actor Hierarchy)", "33"),
        ("Hình 2.2. Biểu đồ Use case tổng quan Hệ thống Thông tin Quản trị Nhân lực (HRMIS)", "68"),
        ("Hình 2.3. Biểu đồ Use case Phân hệ Quản lý Hồ sơ & Cơ cấu phòng ban", "69"),
        ("Hình 2.4. Biểu đồ Use case Phân hệ Chấm công & Điểm danh chuyên cần", "70"),
        ("Hình 2.5. Biểu đồ Use case Phân hệ Quản lý Nghỉ phép & Phê duyệt đơn từ", "71"),
        ("Hình 2.6. Biểu đồ Use case Phân hệ Bảng chấm lương & Đãi ngộ (Payroll)", "72"),
        ("Hình 2.7. Biểu đồ Use case Phân hệ Quản trị Tuyển dụng & Kanban ứng viên", "73"),
        ("Hình 2.8. Biểu đồ Use case Phân hệ Biến động nhân sự & Bổ nhiệm", "74"),
        ("Hình 2.9. Biểu đồ Use case Phân hệ Đào tạo & Khảo sát nội bộ eNPS", "75"),
        ("Hình 2.10. Biểu đồ Use case Phân hệ Quy hoạch cán bộ & Kế nhiệm (9-Box Grid)", "76"),
        ("Hình 2.11. Biểu đồ Use case Phân hệ Kiểm toán & Luồng phê duyệt (SOPs & Audit Trail)", "77"),
        ("Hình 2.12. Biểu đồ trình tự Use case Đăng nhập & Xác thực phân quyền RBAC (UC01)", "89"),
        ("Hình 2.13. Biểu đồ trình tự Use case Tiếp nhận & Tạo mới hồ sơ nhân sự (UC02)", "91"),
        ("Hình 2.14. Biểu đồ trình tự Use case Điểm danh chấm công & Ghi nhận công làm việc (UC03)", "93"),
        ("Hình 2.15. Biểu đồ trình tự Use case Đăng ký và Phê duyệt đơn nghỉ phép (UC04)", "95"),
        ("Hình 2.16. Biểu đồ trình tự Use case Tính toán & Khóa bảng lương tháng (UC05)", "97"),
        ("Hình 2.17. Biểu đồ trình tự Use case Tuyển dụng & Luân chuyển trạng thái ứng viên Kanban (UC06)", "100"),
        ("Hình 2.18. Biểu đồ trình tự Use case Ban hành quyết định biến động nhân sự (UC07)", "102"),
        ("Hình 2.19. Biểu đồ trình tự Use case Quy hoạch cán bộ & Đánh giá ma trận 9-Box (UC08)", "104"),
        ("Hình 2.20. Biểu đồ hoạt động Quy trình Tiếp nhận và Quản lý hồ sơ nhân sự", "107"),
        ("Hình 2.21. Biểu đồ hoạt động Quy trình Chấm công và Xử lý công lệch", "109"),
        ("Hình 2.22. Biểu đồ hoạt động Quy trình Phê duyệt đơn nghỉ phép đa cấp", "111"),
        ("Hình 2.23. Biểu đồ hoạt động Quy trình Tính toán, Kiểm tra và Khóa bảng lương", "113"),
        ("Hình 2.24. Biểu đồ hoạt động Quy trình Tuyển dụng nhân sự từ Đăng tin đến Onboarding", "115"),
        ("Hình 2.25. Biểu đồ hoạt động Quy trình Điều chuyển, Bổ nhiệm và Điều chỉnh lương", "117"),
        ("Hình 2.26. Biểu đồ hoạt động Quy trình Đánh giá 9-Box & Quy hoạch cán bộ kế nhiệm", "119"),
        ("Hình 2.27. Biểu đồ trạng thái Vòng đời Hồ sơ nhân viên (Employee Lifecycle)", "121"),
        ("Hình 2.28. Biểu đồ trạng thái Vòng đời Đơn nghỉ phép (Leave Request Lifecycle)", "123"),
        ("Hình 2.29. Biểu đồ trạng thái Vòng đời Bảng lương tháng (Payroll Lifecycle)", "125"),
        ("Hình 2.30. Biểu đồ trạng thái Vòng đời Hồ sơ ứng viên tuyển dụng (Application Lifecycle)", "127"),
        ("Hình 2.31. Biểu đồ gói phân hệ tổng quan của hệ thống (Package Diagram)", "129"),
        ("Hình 2.32. Biểu đồ lớp Phân hệ Hồ sơ nhân sự & Cơ cấu tổ chức", "131"),
        ("Hình 2.33. Biểu đồ lớp Phân hệ Chấm công, Nghỉ phép & Tiền lương", "133"),
        ("Hình 2.34. Biểu đồ lớp Phân hệ Tuyển dụng, Biến động, Đào tạo, Quy hoạch & Kiểm toán", "135"),
        ("Hình 2.35. Biểu đồ lớp miền cốt lõi của hệ thống (Domain Model)", "137"),
        ("Hình 2.36. Lược đồ thực thể quan hệ Cơ sở dữ liệu vật lý (Physical ERD chuẩn 3NF)", "141"),
        ("Hình 2.37. Sơ đồ kiến trúc kỹ thuật hệ thống 3 tầng (3-Tier Enterprise)", "167"),
    ]

    for title, page in figures_list:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        r1 = p.add_run(title)
        r1.font.name = "Times New Roman"
        r1.font.size = Pt(11)
        dots_count = max(4, 75 - len(title))
        r_dots = p.add_run(" " + "." * dots_count + " ")
        r_dots.font.name = "Times New Roman"
        r_dots.font.size = Pt(10)
        r_dots.font.color.rgb = RGBColor(148, 163, 184)
        r2 = p.add_run(page)
        r2.font.name = "Times New Roman"
        r2.font.size = Pt(11)

    doc.add_page_break()
