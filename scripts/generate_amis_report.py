# -*- coding: utf-8 -*-
"""
Script to generate the complete, authoritative administrative report:
'Bao_Cao_Phan_Tich_Trien_Khai_Van_Hanh_Kiem_Thu_Va_Quan_Tri_HTTT_Quan_Ly_Hanh_Chinh.docx'

Strict Constraints Satisfied:
1. Toàn bộ chữ đen (RGB: 0, 0, 0) - không dùng chữ màu, không viền màu, không shading nền màu.
2. Tuân thủ 100% Nghị định số 30/2020/NĐ-CP của Chính phủ về công tác văn thư:
   - Khổ giấy A4 (210 x 297 mm), chiều đứng.
   - Định lề: Trên 25mm, Dưới 20mm, Trái 30mm, Phải 15mm.
   - Phông chữ Times New Roman xuyên suốt.
   - Số trang: Chính giữa lề trên, cỡ 13pt, số Ả Rập, trang 1 không hiển thị số trang.
   - Thể thức tiêu đề: Bảng 2 ô không viền (Quốc hiệu, Tiêu ngữ, Cơ quan, Số hiệu, Ngày tháng).
   - Tên loại văn bản & Trích yếu nội dung: BÁO CÁO (hoa, đậm, 14pt), Trích yếu (thường, đậm, 14pt).
   - Đề mục và nội dung: Phần (hoa, đậm), Mục I, II (hoa, đậm), Tiểu mục 1, 2 (thường, đậm), Điểm a, b, c; Thụt đầu dòng 1.27cm, Giãn dòng 1.25, Before 0pt, After 6pt.
   - Bảng biểu: Viền đen đơn, cỡ 12pt, tiêu đề cột in đậm canh giữa, không màu nền.
   - Nơi nhận và Chức vụ người ký ở cuối văn bản theo quy chuẩn Nghị định 30.
"""

import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor, Cm, Mm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

BLACK = RGBColor(0, 0, 0)
FONT_NAME = "Times New Roman"

def set_font_run(run, size_pt=14, bold=False, italic=False):
    """Ensure font is Times New Roman in all OpenXML font slots, black color."""
    run.font.name = FONT_NAME
    run.font.size = Pt(size_pt)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = BLACK
    
    rPr = run._r.get_or_add_rPr()
    rFonts = rPr.get_or_add_rFonts()
    rFonts.set(qn('w:ascii'), FONT_NAME)
    rFonts.set(qn('w:hAnsi'), FONT_NAME)
    rFonts.set(qn('w:cs'), FONT_NAME)
    rFonts.set(qn('w:eastAsia'), FONT_NAME)

def add_body_p(doc, text="", bold_prefix="", italic_prefix="", bold=False, italic=False):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.first_line_indent = Cm(1.27)
    p.paragraph_format.line_spacing = 1.25
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(6)
    
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        set_font_run(r_pre, size_pt=14, bold=True)
    if italic_prefix:
        r_it = p.add_run(italic_prefix)
        set_font_run(r_it, size_pt=14, italic=True)
    if text:
        r = p.add_run(text)
        set_font_run(r, size_pt=14, bold=bold, italic=italic)
    return p

def add_bullet_p(doc, text="", bold_prefix=""):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.left_indent = Cm(1.27)
    p.paragraph_format.first_line_indent = Cm(-0.6)
    p.paragraph_format.line_spacing = 1.25
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(4)
    
    r_dash = p.add_run("- ")
    set_font_run(r_dash, size_pt=14, bold=False)
    
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        set_font_run(r_pre, size_pt=14, bold=True)
    if text:
        r = p.add_run(text)
        set_font_run(r, size_pt=14, bold=False)
    return p

def add_plus_bullet_p(doc, text="", bold_prefix=""):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.left_indent = Cm(1.9)
    p.paragraph_format.first_line_indent = Cm(-0.5)
    p.paragraph_format.line_spacing = 1.25
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    
    r_plus = p.add_run("+ ")
    set_font_run(r_plus, size_pt=14, bold=False)
    
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        set_font_run(r_pre, size_pt=14, bold=True)
    if text:
        r = p.add_run(text)
        set_font_run(r, size_pt=14, bold=False)
    return p

def add_part_heading(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.first_line_indent = Cm(0)
    p.paragraph_format.line_spacing = 1.25
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text.upper())
    set_font_run(r, size_pt=14, bold=True)
    return p

def add_sec_i(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.first_line_indent = Cm(0)
    p.paragraph_format.line_spacing = 1.25
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    set_font_run(r, size_pt=14, bold=True)
    return p

def add_sec_1(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.first_line_indent = Cm(1.27)
    p.paragraph_format.line_spacing = 1.25
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    set_font_run(r, size_pt=14, bold=True)
    return p

def add_sec_a(doc, text="", bold_prefix=""):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.first_line_indent = Cm(1.27)
    p.paragraph_format.line_spacing = 1.25
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        set_font_run(r_pre, size_pt=14, bold=True)
    if text:
        r = p.add_run(text)
        set_font_run(r, size_pt=14, bold=False)
    return p

def set_table_borders(table):
    tblPr = table._tbl.tblPr
    tblBorders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
            <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
            <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
            <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        </w:tblBorders>
    ''')
    tblPr.append(tblBorders)

def set_cell_margins(cell, top=120, bottom=120, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def create_nd30_table(doc, headers, data, col_widths, alignments=None, caption=""):
    if caption:
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.first_line_indent = Cm(0)
        p_cap.paragraph_format.space_before = Pt(8)
        p_cap.paragraph_format.space_after = Pt(4)
        p_cap.paragraph_format.keep_with_next = True
        r_cap = p_cap.add_run(caption)
        set_font_run(r_cap, size_pt=13, bold=True, italic=True)

    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table)

    hdr_row = table.rows[0]
    trPr = hdr_row._tr.get_or_add_trPr()
    trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
    trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

    for idx, title in enumerate(headers):
        cell = hdr_row.cells[idx]
        set_cell_margins(cell, 140, 140, 140, 140)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(title)
        set_font_run(r, size_pt=12, bold=True)

    for r_idx, row_data in enumerate(data):
        row = table.rows[r_idx + 1]
        trPr = row._tr.get_or_add_trPr()
        trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            set_cell_margins(cell, 100, 100, 140, 140)
            p = cell.paragraphs[0]
            align = alignments[c_idx] if alignments and c_idx < len(alignments) else WD_ALIGN_PARAGRAPH.LEFT
            p.alignment = align
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15
            r = p.add_run(str(val))
            set_font_run(r, size_pt=12, bold=False)

    for row in table.rows:
        for idx, width in enumerate(col_widths):
            row.cells[idx].width = width

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(0)
    p_sp.paragraph_format.space_after = Pt(6)
    p_sp.paragraph_format.line_spacing = 1.0

def make_borderless_table(table):
    tblPr = table._tbl.tblPr
    tblBorders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="none"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
            <w:insideH w:val="none"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(tblBorders)

def build_document(output_path):
    print("Building document according to Decree 30/2020/ND-CP...")
    doc = Document()
    
    # Page setup
    section = doc.sections[0]
    section.page_width = Mm(210)
    section.page_height = Mm(297)
    section.top_margin = Mm(25)
    section.bottom_margin = Mm(20)
    section.left_margin = Mm(30)
    section.right_margin = Mm(15)
    
    # Page numbering in header: centered, 13pt, Arabic numbers, starts at page 2
    section.different_first_page_header_footer = True
    header = section.header
    p_hdr = header.paragraphs[0]
    p_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_hdr.paragraph_format.space_before = Pt(0)
    p_hdr.paragraph_format.space_after = Pt(0)
    r_hdr = p_hdr.add_run()
    set_font_run(r_hdr, size_pt=13, bold=False)
    fld = parse_xml(f'<w:fldSimple {nsdecls("w")} w:instr="PAGE"/>')
    r_hdr._r.append(fld)
    
    # First page header is left completely empty as required by ND 30
    first_hdr = section.first_page_header
    first_hdr.paragraphs[0].text = ""

    # =========================================================================
    # 1. HEADER BLOCK (QUỐC HIỆU, TIÊU NGỮ, CƠ QUAN, SỐ HIỆU, ĐỊA DANH NGÀY THÁNG)
    # =========================================================================
    tbl_hdr = doc.add_table(rows=1, cols=2)
    tbl_hdr.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_hdr.autofit = False
    make_borderless_table(tbl_hdr)
    
    cell_left = tbl_hdr.rows[0].cells[0]
    cell_right = tbl_hdr.rows[0].cells[1]
    cell_left.width = Cm(7.2)
    cell_right.width = Cm(9.3)
    
    # Left cell: Học viện, Sinh viên thực hiện, Mã sinh viên
    p_cq1 = cell_left.paragraphs[0]
    p_cq1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cq1.paragraph_format.space_before = Pt(0)
    p_cq1.paragraph_format.space_after = Pt(1)
    p_cq1.paragraph_format.line_spacing = 1.1
    r_cq1 = p_cq1.add_run("HỌC VIỆN CHÍNH TRỊ QUỐC GIA HỒ CHÍ MINH")
    set_font_run(r_cq1, size_pt=12, bold=False)
    
    p_cq2 = cell_left.add_paragraph()
    p_cq2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cq2.paragraph_format.space_before = Pt(0)
    p_cq2.paragraph_format.space_after = Pt(2)
    p_cq2.paragraph_format.line_spacing = 1.1
    r_cq2 = p_cq2.add_run("HỌC VIỆN HÀNH CHÍNH VÀ QUẢN TRỊ CÔNG")
    set_font_run(r_cq2, size_pt=12, bold=True)
    
    p_line_cq = cell_left.add_paragraph()
    p_line_cq.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_line_cq.paragraph_format.space_before = Pt(0)
    p_line_cq.paragraph_format.space_after = Pt(4)
    r_line_cq = p_line_cq.add_run("—————")
    set_font_run(r_line_cq, size_pt=11, bold=True)
    
    p_sv = cell_left.add_paragraph()
    p_sv.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sv.paragraph_format.space_before = Pt(0)
    p_sv.paragraph_format.space_after = Pt(1)
    p_sv.paragraph_format.line_spacing = 1.1
    r_sv_lbl = p_sv.add_run("Sinh viên: ")
    set_font_run(r_sv_lbl, size_pt=12, bold=False)
    r_sv_val = p_sv.add_run("ĐỖ MINH HIẾU")
    set_font_run(r_sv_val, size_pt=12, bold=True)

    p_msv = cell_left.add_paragraph()
    p_msv.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_msv.paragraph_format.space_before = Pt(0)
    p_msv.paragraph_format.space_after = Pt(0)
    p_msv.paragraph_format.line_spacing = 1.1
    r_msv_lbl = p_msv.add_run("Mã sinh viên: ")
    set_font_run(r_msv_lbl, size_pt=12, bold=False)
    r_msv_val = p_msv.add_run("2305HTTA009")
    set_font_run(r_msv_val, size_pt=12, bold=True)
    
    # Right cell: Quốc hiệu, Tiêu ngữ, Đường kẻ, Địa danh ngày tháng
    p_qh1 = cell_right.paragraphs[0]
    p_qh1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_qh1.paragraph_format.space_before = Pt(0)
    p_qh1.paragraph_format.space_after = Pt(1)
    p_qh1.paragraph_format.line_spacing = 1.1
    r_qh1 = p_qh1.add_run("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM")
    set_font_run(r_qh1, size_pt=12, bold=True)
    
    p_qh2 = cell_right.add_paragraph()
    p_qh2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_qh2.paragraph_format.space_before = Pt(0)
    p_qh2.paragraph_format.space_after = Pt(2)
    p_qh2.paragraph_format.line_spacing = 1.1
    r_qh2 = p_qh2.add_run("Độc lập - Tự do - Hạnh phúc")
    set_font_run(r_qh2, size_pt=13, bold=True)
    
    p_line_qh = cell_right.add_paragraph()
    p_line_qh.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_line_qh.paragraph_format.space_before = Pt(0)
    p_line_qh.paragraph_format.space_after = Pt(4)
    r_line_qh = p_line_qh.add_run("—————————————")
    set_font_run(r_line_qh, size_pt=12, bold=True)
    
    p_date = cell_right.add_paragraph()
    p_date.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_date.paragraph_format.space_before = Pt(0)
    p_date.paragraph_format.space_after = Pt(0)
    r_date = p_date.add_run("Hà Nội, ngày 30 tháng 9 năm 2026")
    set_font_run(r_date, size_pt=13, italic=True)

    # Empty paragraph separating header block and document title
    p_sep = doc.add_paragraph()
    p_sep.paragraph_format.space_before = Pt(6)
    p_sep.paragraph_format.space_after = Pt(6)

    # =========================================================================
    # 2. TÊN LOẠI VĂN BẢN VÀ TRÍCH YẾU NỘI DUNG (THEO ĐIỀU 10 NĐ 30/2020/NĐ-CP)
    # =========================================================================
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.first_line_indent = Cm(0)
    p_title.paragraph_format.space_before = Pt(6)
    p_title.paragraph_format.space_after = Pt(4)
    p_title.paragraph_format.line_spacing = 1.25
    p_title.paragraph_format.keep_with_next = True
    r_t = p_title.add_run("BÁO CÁO")
    set_font_run(r_t, size_pt=14, bold=True)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.first_line_indent = Cm(0)
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(4)
    p_sub.paragraph_format.line_spacing = 1.25
    p_sub.paragraph_format.keep_with_next = True
    r_sub = p_sub.add_run("Về việc phân tích, triển khai, vận hành, kiểm thử và quản trị\nhệ thống thông tin quản lý hành chính")
    set_font_run(r_sub, size_pt=14, bold=True)

    p_author = doc.add_paragraph()
    p_author.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_author.paragraph_format.first_line_indent = Cm(0)
    p_author.paragraph_format.space_before = Pt(4)
    p_author.paragraph_format.space_after = Pt(2)
    p_author.paragraph_format.line_spacing = 1.25
    r_a1 = p_author.add_run("Sinh viên thực hiện: ")
    set_font_run(r_a1, size_pt=13, bold=False)
    r_a2 = p_author.add_run("Đỗ Minh Hiếu")
    set_font_run(r_a2, size_pt=13, bold=True)
    r_a3 = p_author.add_run("    —    Mã sinh viên: ")
    set_font_run(r_a3, size_pt=13, bold=False)
    r_a4 = p_author.add_run("2305HTTA009")
    set_font_run(r_a4, size_pt=13, bold=True)

    p_course = doc.add_paragraph()
    p_course.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_course.paragraph_format.first_line_indent = Cm(0)
    p_course.paragraph_format.space_before = Pt(0)
    p_course.paragraph_format.space_after = Pt(14)
    p_course.paragraph_format.line_spacing = 1.25
    r_c1 = p_course.add_run("Học phần: Hệ thống thông tin Quản lý hành chính\nGiảng viên hướng dẫn: ThS. Hoàng Minh Ngọc")
    set_font_run(r_c1, size_pt=13, italic=True)

    # =========================================================================
    # DANH MỤC TỪ VIẾT TẮT
    # =========================================================================
    p_abbr_title = doc.add_paragraph()
    p_abbr_title.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_abbr_title.paragraph_format.first_line_indent = Cm(0)
    p_abbr_title.paragraph_format.space_before = Pt(8)
    p_abbr_title.paragraph_format.space_after = Pt(4)
    p_abbr_title.paragraph_format.keep_with_next = True
    r_abbr = p_abbr_title.add_run("BẢNG CÁC KÝ HIỆU VÀ TỪ VIẾT TẮT")
    set_font_run(r_abbr, size_pt=13, bold=True)

    abbr_headers = ["STT", "Từ viết tắt", "Tên tiếng Anh / Giải nghĩa đầy đủ", "Ý nghĩa trong hệ thống"]
    abbr_data = [
        ["1", "AMIS", "Administrative Management Information System", "Hệ thống thông tin quản lý hành chính"],
        ["2", "CSDL", "Cơ sở dữ liệu", "Hệ thống lưu trữ dữ liệu tập trung"],
        ["3", "TTHC", "Thủ tục hành chính", "Quy trình giải quyết công vụ theo pháp luật"],
        ["4", "NDXP", "National Data Exchange Platform", "Nền tảng tích hợp, chia sẻ dữ liệu quốc gia"],
        ["5", "LGSP", "Local Government Service Platform", "Nền tảng tích hợp, chia sẻ dữ liệu cấp Bộ/Tỉnh"],
        ["6", "SSO", "Single Sign-On", "Cơ chế đăng nhập một lần tập trung"],
        ["7", "RBAC", "Role-Based Access Control", "Kiểm soát truy cập dựa trên vai trò"],
        ["8", "PKI / HSM", "Public Key Infrastructure / Hardware Security Module", "Hạ tầng khóa công khai và thiết bị bảo mật ký số"],
        ["9", "UAT", "User Acceptance Testing", "Kiểm thử chấp nhận của người dùng"],
        ["10", "SOC / NOC", "Security / Network Operations Center", "Trung tâm điều hành an toàn thông tin và mạng"],
        ["11", "RPO / RTO", "Recovery Point / Time Objective", "Mục tiêu điểm phục hồi và thời gian phục hồi"],
        ["12", "SLA", "Service Level Agreement", "Cam kết chất lượng cung cấp dịch vụ"],
    ]
    abbr_widths = [Cm(1.2), Cm(2.5), Cm(6.5), Cm(6.3)]
    abbr_aligns = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    create_nd30_table(doc, abbr_headers, abbr_data, abbr_widths, abbr_aligns)

    # =========================================================================
    # PHẦN THỨ NHẤT: TỔNG QUAN VÀ PHÂN TÍCH HỆ THỐNG THÔNG TIN QUẢN LÝ HÀNH CHÍNH
    # =========================================================================
    add_part_heading(doc, "PHẦN THỨ NHẤT\nTỔNG QUAN VÀ PHÂN TÍCH HỆ THỐNG THÔNG TIN QUẢN LÝ HÀNH CHÍNH")

    add_sec_i(doc, "I. CƠ SỞ PHÁP LÝ VÀ SỰ CẦN THIẾT ĐẦU TƯ")
    
    add_sec_1(doc, "1. Cơ sở pháp lý")
    add_body_p(doc, "Việc nghiên cứu, phân tích, xây dựng và đưa vào vận hành hệ thống thông tin quản lý hành chính (Administrative Management Information System - AMIS) được căn cứ chặt chẽ trên các văn bản quy phạm pháp luật và chủ trương lớn của Đảng, Nhà nước về phát triển Chính phủ điện tử hướng tới Chính phủ số, cụ thể bao gồm:")
    add_bullet_p(doc, "về giao dịch điện tử trong hoạt động của cơ quan nhà nước và tổ chức, doanh nghiệp, công nhận giá trị pháp lý đầy đủ của thông điệp dữ liệu, văn bản điện tử và chữ ký điện tử an toàn.", "Luật Giao dịch điện tử số 20/2023/QH15 ")
    add_bullet_p(doc, "về bảo đảm an toàn hệ thống thông tin theo cấp độ, bảo vệ dữ liệu cá nhân và chủ quyền số quốc gia trên không gian mạng.", "Luật An toàn thông tin mạng số 86/2015/QH13 và Luật An ninh mạng số 24/2018/QH14 ")
    add_bullet_p(doc, "của Chính phủ về công tác văn thư, quy định bắt buộc và chuẩn hóa toàn diện thể thức văn bản hành chính, quản lý văn bản điện tử, ký số văn bản cơ quan, lập hồ sơ điện tử và nộp lưu hồ sơ vào lưu trữ cơ quan.", "Nghị định số 30/2020/NĐ-CP ngày 05/3/2020 ")
    add_bullet_p(doc, "của Chính phủ về quản lý, kết nối và chia sẻ dữ liệu số của cơ quan nhà nước, yêu cầu các hệ thống phải kết nối liên thông qua Trục liên thông văn bản quốc gia và Trục tích hợp chia sẻ dữ liệu cấp Bộ/Tỉnh (LGSP/NDXP).", "Nghị định số 47/2020/NĐ-CP ngày 09/4/2020 ")
    add_bullet_p(doc, "của Chính phủ về quản lý đầu tư ứng dụng công nghệ thông tin sử dụng nguồn vốn ngân sách nhà nước.", "Nghị định số 73/2019/NĐ-CP ngày 05/9/2019 ")
    add_bullet_p(doc, "của Thủ tướng Chính phủ phê duyệt Đề án phát triển ứng dụng dữ liệu về dân cư, định danh và xác thực điện tử phục vụ chuyển đổi số quốc gia giai đoạn 2022 - 2025, tầm nhìn đến năm 2030 (Đề án 06).", "Quyết định số 06/QĐ-TTg ngày 06/01/2022 ")
    add_bullet_p(doc, "của Bộ Thông tin và Truyền thông ban hành Khung Kiến trúc Chính phủ điện tử Việt Nam, phiên bản 2.0 và các văn bản hướng dẫn định hướng Khung Kiến trúc Chính phủ số phiên bản 3.0.", "Quyết định số 2323/QĐ-BTTTT ngày 31/12/2019 ")

    add_sec_1(doc, "2. Sự cần thiết đầu tư và vai trò của hệ thống")
    add_body_p(doc, "Trong tiến trình cải cách hành chính nhà nước, việc ứng dụng công nghệ thông tin để đổi mới phương thức làm việc, chuyển từ môi trường làm việc trên giấy sang môi trường điện tử (văn phòng không giấy tờ) là yêu cầu cấp thiết mang tính sống còn. Hệ thống thông tin quản lý hành chính đóng vai trò là hạ tầng phần mềm cốt lõi, tích hợp toàn bộ các dòng chảy thông tin chỉ đạo, điều hành, xử lý hồ sơ công việc, quản lý cán bộ công chức và dịch vụ công công vụ trong nội bộ cơ quan.")
    add_body_p(doc, "Xây dựng hệ thống AMIS hiện đại giúp chuẩn hóa quy trình công vụ, minh bạch hóa tiến độ giải quyết công việc, ngăn chặn triệt để tình trạng chậm muộn, thất lạc văn bản, đồng thời tạo lập kho dữ liệu số dùng chung, phục vụ đắc lực cho công tác ra quyết định của các cấp lãnh đạo dựa trên dữ liệu thời gian thực.")

    add_sec_i(doc, "II. PHÂN TÍCH HIỆN TRẠNG VÀ CÁC ĐIỂM NGHẼN NGHIỆP VỤ HÀNH CHÍNH")
    add_sec_1(doc, "1. Thực trạng công tác hành chính truyền thống")
    add_body_p(doc, "Khảo sát thực tiễn tại các cơ quan, đơn vị trước khi ứng dụng hệ thống thông tin quản lý hành chính tập trung cho thấy nhiều bất cập nghiêm trọng:")
    add_bullet_p(doc, "Văn bản, tờ trình, phiếu xử lý công việc chủ yếu lưu chuyển bằng bản giấy vật lý, phụ thuộc vào giao liên hoặc chuyên viên mang trực tiếp qua các phòng ban, làm phát sinh thời gian chờ đợi kéo dài từ 03 đến 05 ngày cho một chu trình phê duyệt thông thường.")
    add_bullet_p(doc, "Hồ sơ công việc phân tán tại từng ngăn tủ cá nhân của chuyên viên, không được lập danh mục hồ sơ điện tử theo quy định tại Nghị định 30/2020/NĐ-CP, gây nguy cơ thất lạc tài liệu gốc, rách nát, ẩm mốc và mất rất nhiều công sức khi cần tra cứu lịch sử văn bản.")
    add_bullet_p(doc, "Việc tổng hợp số liệu báo cáo định kỳ (báo cáo tháng, quý, năm) thực hiện hoàn toàn thủ công thông qua bảng tính rời rạc, dẫn đến số liệu báo cáo không đồng nhất, độ trễ thông tin cao và thiếu tính chính xác khách quan.")

    add_sec_1(doc, "2. Các điểm nghẽn nghiệp vụ cốt lõi")
    add_body_p(doc, "Qua phân tích dòng công việc (workflow analysis), báo cáo xác định 04 điểm nghẽn chính cần giải quyết triệt để thông qua hệ thống AMIS:")
    add_sec_a(doc, "Thiếu công cụ giám sát trực quan tiến độ xử lý văn bản đến và nhiệm vụ do Lãnh đạo giao, dẫn đến tình trạng chuyên viên trễ hạn nhưng cấp trên không kịp thời đôn đốc, nhắc nhở.", "a) Điểm nghẽn về theo dõi tiến độ: ")
    add_sec_a(doc, "Chữ ký tay truyền thống đòi hỏi lãnh đạo phải có mặt tại cơ quan mới có thể ký duyệt, gây gián đoạn công tác khi lãnh đạo đi công tác cơ sở hoặc tham gia các cuộc họp dài ngày.", "b) Điểm nghẽn về ký duyệt văn bản: ")
    add_sec_a(doc, "Các phòng ban chuyên môn (Tổ chức cán bộ, Kế hoạch tài chính, Văn phòng) sử dụng các phần mềm đơn lẻ, không có khả năng chia sẻ dữ liệu liên thông, tạo ra các 'ốc đảo thông tin'.", "c) Điểm nghẽn về tích hợp dữ liệu: ")
    add_sec_a(doc, "Việc lưu trữ tài liệu mật, tài liệu nội bộ trên máy tính cá nhân không được mã hóa, tiềm ẩn nguy cơ lộ lọt bí mật nhà nước và thông tin nội bộ qua các cuộc tấn công mã độc.", "d) Điểm nghẽn về an toàn thông tin: ")

    add_sec_i(doc, "III. PHÂN TÍCH CÁC PHÂN HỆ NGHIỆP VỤ HÀNH CHÍNH TRỌNG YẾU")
    add_body_p(doc, "Hệ thống thông tin quản lý hành chính được thiết kế bao gồm 05 phân hệ nghiệp vụ nền tảng, tạo thành chu trình khép kín trong công tác quản trị và tác nghiệp hành chính:")
    
    add_sec_1(doc, "1. Phân hệ Quản lý văn bản và Điều hành tác nghiệp điện tử")
    add_body_p(doc, "Đây là phân hệ hạt nhân của hệ thống, thực hiện số hóa toàn diện quy trình văn thư theo chuẩn Nghị định số 30/2020/NĐ-CP:")
    add_bullet_p(doc, "Tiếp nhận văn bản điện tử từ Trục liên thông quốc gia hoặc quét (scan) văn bản giấy đến; trích xuất thông tin tự động bằng công nghệ OCR; vào sổ văn bản điện tử; trình Lãnh đạo phân phối và chuyển giao chuyên viên thụ lý.", "Quy trình Quản lý Văn bản đến: ")
    add_bullet_p(doc, "Soạn thảo dự thảo văn bản; xin ý kiến góp ý điện tử giữa các phòng ban; lãnh đạo phòng thẩm định; trình Lãnh đạo cơ quan ký số (ký số cá nhân); Văn thư cơ quan cấp số, vào sổ, đóng dấu số tổ chức và dấu thời gian (Timestamp); phát hành qua mạng đến nơi nhận.", "Quy trình Quản lý Văn bản đi: ")
    add_bullet_p(doc, "Xây dựng lịch công tác tuần của cơ quan; phân công nhiệm vụ, giao chỉ tiêu KPI; gửi thông báo, giấy mời họp số; giám sát đôn đốc tiến độ xử lý nhiệm vụ đến từng cá nhân.", "Quy trình Điều hành tác nghiệp nội bộ: ")

    add_sec_1(doc, "2. Phân hệ Quản lý hồ sơ công việc và Số hóa lưu trữ tài liệu")
    add_body_p(doc, "Thực hiện nghiêm túc quy định tại Chương II Nghị định số 30/2020/NĐ-CP và Thông tư số 02/2019/TT-BNV:")
    add_bullet_p(doc, "Mỗi nhiệm vụ, vụ việc được gán một Mã hồ sơ duy nhất theo danh mục hồ sơ cơ quan được ban hành đầu năm. Toàn bộ văn bản đi, đến, tờ trình, tài liệu liên quan được tự động gom vào hồ sơ điện tử.", "Lập hồ sơ công việc điện tử: ")
    add_bullet_p(doc, "Khi công việc kết thúc, chuyên viên thực hiện đóng hồ sơ, ký số xác thực và nộp lưu hồ sơ điện tử vào Lưu trữ cơ quan trên hệ thống.", "Giao nộp hồ sơ vào lưu trữ: ")
    add_bullet_p(doc, "Tài liệu lưu trữ được phân loại theo thời hạn bảo quản (vĩnh viễn, 50 năm, 20 năm, 05 năm), thiết lập chỉ mục tìm kiếm thông minh toàn văn (Full-text search), quản lý chặt chẽ quyền khai thác đọc, sao chụp hồ sơ.", "Khai thác và bảo quản lưu trữ: ")

    add_sec_1(doc, "3. Phân hệ Dịch vụ công trực tuyến và Một cửa điện tử liên thông")
    add_body_p(doc, "Phục vụ tiếp nhận và giải quyết thủ tục hành chính (TTHC) cho người dân, doanh nghiệp và các tổ chức liên quan:")
    add_bullet_p(doc, "Công khai toàn bộ quy trình, thành phần hồ sơ, phí, lệ phí và thời hạn giải quyết TTHC theo quy chuẩn của Cổng Dịch vụ công Quốc gia.", "Công khai quy trình TTHC: ")
    add_bullet_p(doc, "Cán bộ Bộ phận Một cửa tiếp nhận hồ sơ số, kiểm tra tính hợp lệ qua tích hợp CSDL Quốc gia về dân cư (VNeID), số hóa giấy tờ đầu vào, sinh Mã hồ sơ một cửa và Phiếu hẹn điện tử.", "Tiếp nhận và chuyển xử lý: ")
    add_bullet_p(doc, "Ký số kết quả giải quyết TTHC dưới dạng tệp tin PDF/A-1a kèm chứng thư số của cơ quan, trả kết quả vào Kho quản lý dữ liệu điện tử của tổ chức, cá nhân.", "Ký số và trả kết quả số: ")

    add_sec_1(doc, "4. Phân hệ Quản lý cán bộ, công chức, viên chức và biên chế hành chính")
    add_body_p(doc, "Chuẩn hóa và đồng bộ dữ liệu quản trị nguồn nhân lực công:")
    add_bullet_p(doc, "Xây dựng cơ sở dữ liệu hồ sơ cán bộ công chức theo mẫu 2C-BNV/2008 của Bộ Nội vụ; theo dõi quá trình đào tạo, bồi dưỡng, nâng lương, khen thưởng, kỷ luật, điều động, bổ nhiệm.", "Quản lý hồ sơ điện tử: ")
    add_bullet_p(doc, "Tích hợp thiết bị nhận diện khuôn mặt (FaceID) hoặc thẻ thông minh tại cơ quan; tự động tổng hợp công, quản lý đơn xin nghỉ phép điện tử, duyệt phép trực tuyến.", "Quản lý chấm công và chuyên cần: ")
    add_bullet_p(doc, "Liên thông đồng bộ dữ liệu định kỳ với Cơ sở dữ liệu Quốc gia về Cán bộ, công chức, viên chức do Bộ Nội vụ quản lý.", "Đồng bộ CSDL Quốc gia: ")

    add_sec_1(doc, "5. Phân hệ Báo cáo thống kê và Bàn điều hành số (Dashboard/IOC)")
    add_body_p(doc, "Cung cấp bức tranh toàn cảnh về hoạt động hành chính của cơ quan theo thời gian thực:")
    add_bullet_p(doc, "Trực quan hóa tỷ lệ văn bản xử lý đúng hạn, trước hạn, quá hạn của từng đơn vị trực thuộc bằng các biểu đồ thanh, biểu đồ tròn và ma trận nhiệt.", "Chỉ số xử lý văn bản: ")
    add_bullet_p(doc, "Theo dõi các cảnh báo đỏ đối với văn bản khẩn, văn bản thượng khẩn, hỏa tốc sắp hết thời hạn xử lý.", "Cảnh báo chỉ đạo điều hành: ")
    add_bullet_p(doc, "Tự động trích xuất các biểu mẫu thống kê định kỳ phục vụ báo cáo lên Ủy ban nhân dân và các cơ quan cấp trên mà không cần chuyên viên tổng hợp thủ công.", "Kết xuất báo cáo tự động: ")

    add_sec_i(doc, "IV. PHÂN TÍCH YÊU CẦU CHỨC NĂNG VÀ PHI CHỨC NĂNG")
    add_sec_1(doc, "1. Yêu cầu chức năng (Functional Requirements - FR)")
    add_body_p(doc, "Bảng tổng hợp ma trận phân tích các nhóm yêu cầu chức năng nghiệp vụ trọng yếu của hệ thống:")

    fr_headers = ["Mã FR", "Tên nhóm chức năng", "Mô tả yêu cầu nghiệp vụ chi tiết", "Phân hệ phụ trách", "Mức ưu tiên"]
    fr_data = [
        ["FR-01", "Vào sổ văn bản điện tử", "Tự động cấp số văn bản đến/đi liên tục, phân loại theo sổ, kiểm tra trùng số", "Văn bản & Điều hành", "Bắt buộc"],
        ["FR-02", "Phân phối & giao nhiệm vụ", "Chuyển giao văn bản đa cấp kèm ý kiến chỉ đạo, hạn xử lý, gán người đồng xử lý", "Văn bản & Điều hành", "Bắt buộc"],
        ["FR-03", "Ký số văn bản chuyên dùng", "Hỗ trợ ký số cá nhân (USB Token, SmartCA Cloud) và ký số cơ quan (HSM) chuẩn PDF", "Văn bản & Điều hành", "Bắt buộc"],
        ["FR-04", "Liên thông văn bản quốc gia", "Gửi/nhận văn bản mã hóa an toàn qua trục VDXP/LGSP theo mã định danh cơ quan", "Tích hợp liên thông", "Bắt buộc"],
        ["FR-05", "Lập hồ sơ công việc số", "Tập hợp văn bản thành bộ hồ sơ, phân loại danh mục, gán tiêu đề, nộp lưu trữ số", "Lưu trữ điện tử", "Bắt buộc"],
        ["FR-06", "Quản lý khai thác tài liệu", "Phân quyền mượn, đọc, in ấn tài liệu lưu trữ, ghi nhận dấu vết khai thác", "Lưu trữ điện tử", "Quan trọng"],
        ["FR-07", "Tiếp nhận hồ sơ một cửa", "Tiếp nhận TTHC trực tiếp và trực tuyến, đồng bộ trạng thái lên Cổng DVC Quốc gia", "Dịch vụ công", "Bắt buộc"],
        ["FR-08", "Quản lý hồ sơ công chức", "Quản lý thông tin lý lịch 2C-BNV, hợp đồng, quá trình công tác, lịch sử khen thưởng", "Quản trị nhân lực", "Quan trọng"],
        ["FR-09", "Chấm công & duyệt nghỉ phép", "Ghi nhận dữ liệu chấm công từ thiết bị, luồng gửi và duyệt đơn nghỉ phép trực tuyến", "Quản trị nhân lực", "Quan trọng"],
        ["FR-10", "Báo cáo giám sát thời gian thực", "Bảng điều khiển trực quan tỷ lệ xử lý đúng hạn, quá hạn theo phòng ban và cá nhân", "Bàn điều hành số", "Bắt buộc"],
    ]
    fr_widths = [Cm(1.5), Cm(3.2), Cm(6.5), Cm(3.3), Cm(2.0)]
    fr_aligns = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER]
    create_nd30_table(doc, fr_headers, fr_data, fr_widths, fr_aligns, "Bảng 1: Ma trận yêu cầu chức năng nghiệp vụ hệ thống AMIS")

    add_sec_1(doc, "2. Yêu cầu phi chức năng (Non-Functional Requirements - NFR)")
    add_body_p(doc, "Hệ thống phải đáp ứng các tiêu chuẩn kỹ thuật nghiêm ngặt về chất lượng phần mềm:")
    add_bullet_p(doc, "Thời gian tải trang ban đầu dưới 1.5 giây; thời gian mở tệp văn bản đính kèm dưới 2.0 giây; đáp ứng tối thiểu 5.000 người dùng truy cập đồng thời (CCU) và chịu tải xử lý 500 yêu cầu ký số đồng thời tại giờ cao điểm.", "Yêu cầu về hiệu năng (Performance): ")
    add_bullet_p(doc, "Hệ thống hoạt động liên tục 24/7/365 với độ sẵn sàng đạt 99.9% (Uptime); thời gian phục hồi mục tiêu RTO dưới 02 giờ và điểm phục hồi mục tiêu RPO dưới 15 phút.", "Yêu cầu về độ sẵn sàng (Availability): ")
    add_bullet_p(doc, "Đáp ứng đầy đủ tiêu chí an toàn thông tin cấp độ 3 theo Nghị định số 85/2016/NĐ-CP và Thông tư số 12/2022/TT-BTTTT; mã hóa toàn bộ dữ liệu lưu trữ (AES-256) và kênh truyền dữ liệu (TLS 1.3).", "Yêu cầu về an toàn thông tin (Security): ")
    add_bullet_p(doc, "Hệ thống được thiết kế theo kiến trúc Microservices và RESTful API, cho phép dễ dàng mở rộng tài nguyên tính toán theo chiều ngang (Horizontal Scaling) mà không làm gián đoạn vận hành.", "Yêu cầu về khả năng mở rộng (Scalability): ")

    add_sec_i(doc, "V. KIẾN TRÚC TỔNG THỂ HỆ THỐNG THÔNG TIN QUẢN LÝ HÀNH CHÍNH")
    add_body_p(doc, "Hệ thống AMIS được thiết kế theo mô hình kiến trúc phân tầng hiện đại, tuân thủ Khung Kiến trúc Chính phủ điện tử Việt Nam:")
    add_bullet_p(doc, "Giao diện Web portal hiện đại (Next.js/React), tương thích mọi trình duyệt phổ biến (Chrome, Edge, Firefox, Safari) và ứng dụng di động (Mobile App iOS/Android) phục vụ Lãnh đạo chỉ đạo điều hành và ký số từ xa mọi lúc mọi nơi.", "Tầng Trình diễn (Presentation Layer): ")
    add_bullet_p(doc, "Tập trung định tuyến API, xác thực danh tính SSO (Single Sign-On qua Keycloak/OAuth2/OIDC), quản lý phiên làm việc, mã hóa kênh truyền và cân bằng tải (Load Balancing qua NGINX/HAProxy).", "Tầng Cổng kết nối và Dịch vụ xác thực (API Gateway & IAM): ")
    add_bullet_p(doc, "Bao gồm các cụm dịch vụ nghiệp vụ độc lập (Document Service, Workflow Engine, Digital Signature Service, Storage Service, Notification Service, HR Service), giao tiếp qua giao thức gRPC nội bộ và hàng đợi thông điệp RabbitMQ/Apache Kafka.", "Tầng Ứng dụng nghiệp vụ (Microservices Layer): ")
    add_bullet_p(doc, "Trục kết nối LGSP, cổng kết nối trục VDXP quốc gia, cổng tích hợp CSDL Quốc gia về dân cư (Đề án 06) và CSDL Cán bộ công chức viên chức.", "Tầng Tích hợp và Chia sẻ dữ liệu (Integration Layer): ")
    add_bullet_p(doc, "Cơ sở dữ liệu quan hệ PostgreSQL cấu hình Master - Standby phân tán cho dữ liệu giao dịch nghiệp vụ; Hệ thống lưu trữ đối tượng MinIO/Ceph cho tệp tin văn bản số hóa; Cụm Elasticsearch phục vụ tra cứu toàn văn tốc độ cao.", "Tầng Dữ liệu và Lưu trữ (Data & Storage Layer): ")

    # =========================================================================
    # PHẦN THỨ HAI: PHƯƠNG ÁN TRIỂN KHAI HỆ THỐNG THÔNG TIN QUẢN LÝ HÀNH CHÍNH
    # =========================================================================
    add_part_heading(doc, "PHẦN THỨ HAI\nPHƯƠNG ÁN TRIỂN KHAI HỆ THỐNG THÔNG TIN QUẢN LÝ HÀNH CHÍNH")

    add_sec_i(doc, "I. LỰA CHỌN MÔ HÌNH HẠ TẦNG VÀ CÔNG NGHỆ TRIỂN KHAI")
    add_sec_1(doc, "1. Mô hình hạ tầng kỹ thuật")
    add_body_p(doc, "Để đảm bảo tính tự chủ, bảo mật tuyệt đối cho dữ liệu cơ quan nhà nước, hệ thống lựa chọn mô hình triển khai trên Đám mây riêng (Private Cloud) đặt tại Trung tâm dữ liệu (Data Center) của cơ quan đạt tiêu chuẩn quốc tế Tier 3 và tiêu chuẩn TCVN 9250:2012:")
    add_bullet_p(doc, "Hạ tầng máy chủ vật lý cấu hình cao, sử dụng công nghệ ảo hóa hạ tầng máy chủ ảo (VMware vSphere hoặc Proxmox VE), hỗ trợ dự phòng nóng n+1 nguồn điện, điều hòa chính xác và đường truyền Internet cáp quang đa hướng độc lập.", "Hạ tầng phần cứng: ")
    add_bullet_p(doc, "Hệ thống tường lửa chuyên dụng thế hệ mới (Next-Generation Firewall - NGFW), hệ thống phát hiện và ngăn ngừa xâm nhập (IDS/IPS), thiết bị chống tấn công từ chối dịch vụ (Anti-DDoS) và phân vùng mạng an toàn.", "Hạ tầng mạng và an ninh: ")

    add_sec_1(doc, "2. Thiết kế phân vùng mạng an toàn")
    add_body_p(doc, "Hệ thống được chia thành 04 phân vùng mạng độc lập, cách ly nghiêm ngặt thông qua các chính sách Access Control List (ACL) của tường lửa:")
    add_bullet_p(doc, "Đặt các cổng thông tin dịch vụ công tiếp nhận kết nối từ Internet; chỉ mở các cổng giao tiếp chuẩn (HTTPS/443); kiểm soát nghiêm ngặt lưu lượng qua hệ thống tường lửa ứng dụng web (WAF).", "Vùng Mạng phi quân sự (DMZ Zone): ")
    add_bullet_p(doc, "Nơi triển khai các container ứng dụng nghiệp vụ AMIS và API Gateway; chỉ chấp nhận các kết nối được xác thực gửi đến từ vùng DMZ hoặc mạng nội bộ cơ quan (LAN).", "Vùng Ứng dụng nội bộ (Application Zone): ")
    add_bullet_p(doc, "Nơi đặt các cụm máy chủ CSDL PostgreSQL và MinIO Storage; vùng này bị cô lập hoàn toàn với Internet, chỉ cho phép các máy chủ trong vùng Ứng dụng truy cập qua cổng nội bộ được mã hóa.", "Vùng Cơ sở dữ liệu lõi (Database Zone): ")
    add_bullet_p(doc, "Dành riêng cho đội ngũ quản trị viên hệ thống kết nối qua kênh mạng riêng ảo mã hóa (IPSec VPN / WireGuard) kèm xác thực hai nhân tố (MFA).", "Vùng Quản trị an toàn (Management Zone): ")

    add_sec_1(doc, "3. Công nghệ Containerization và CI/CD tự động")
    add_body_p(doc, "Hệ thống được đóng gói hoàn toàn dưới dạng các Docker Container và được điều phối bằng Kubernetes (K8s). Việc cập nhật phiên bản phần mềm được tự động hóa thông qua quy trình CI/CD (Continuous Integration / Continuous Deployment) sử dụng GitLab CI, bảo đảm:")
    add_bullet_p(doc, "Không gây gián đoạn hệ thống khi triển khai bản vá hoặc tính năng mới (Zero-downtime deployment thông qua chiến lược Rolling Update).", "Triển khai không gián đoạn: ")
    add_bullet_p(doc, "Mã nguồn được tự động quét lỗi bảo mật (SAST), kiểm tra tiêu chuẩn mã nguồn sạch và tự động chạy toàn bộ các bài kiểm thử trước khi đóng gói lên môi trường vận hành.", "Kiểm soát an toàn tự động: ")

    add_sec_i(doc, "II. LỘ TRÌNH VÀ CÁC GIAI ĐOẠN TRIỂN KHAI THỰC TẾ")
    add_body_p(doc, "Dự án triển khai hệ thống thông tin quản lý hành chính được phân kỳ thành 06 giai đoạn kế tiếp nhau trong thời gian 12 tháng:")

    deploy_headers = ["Giai đoạn", "Nội dung công việc trọng tâm", "Thời gian", "Sản phẩm bàn giao chính", "Đơn vị chủ trì"]
    deploy_data = [
        ["GĐ 1", "Khảo sát hiện trạng, rà soát quy trình TTHC và lập đề cương kỹ thuật", "Tháng 1 - 2", "Báo cáo khảo sát, Đề cương thiết kế kỹ thuật", "Ban QLDA & Nhà thầu"],
        ["GĐ 2", "Thiết lập hạ tầng máy chủ, mạng an toàn và cài đặt phần mềm nền tảng", "Tháng 3 - 4", "Hạ tầng Data Center, Biên bản kiểm định an ninh", "Tổ kỹ thuật hạ tầng"],
        ["GĐ 3", "Chuẩn hóa danh mục, làm sạch và chuyển đổi dữ liệu văn bản lịch sử", "Tháng 5 - 6", "CSDL lịch sử chuyển đổi đạt độ chính xác 100%", "Tổ dữ liệu & Văn thư"],
        ["GĐ 4", "Tích hợp chữ ký số HSM/CA và liên thông Trục VDXP, Cổng DVC, Đề án 06", "Tháng 7 - 8", "Hệ thống liên thông liên ngành, Biên bản test API", "Nhóm phát triển phần mềm"],
        ["GĐ 5", "Kiểm thử toàn diện, đào tạo người dùng và vận hành thử nghiệm (Pilot)", "Tháng 9 - 10", "Biên bản UAT, 100% cán bộ pilot được cấp chứng chỉ", "Tổ đào tạo & Các phòng pilot"],
        ["GĐ 6", "Nghiệm thu kỹ thuật chính thức và phát động vận hành (Go-live) diện rộng", "Tháng 11 - 12", "Hệ thống Go-live chính thức, Quy chế vận hành", "Ban Giám đốc & Toàn cơ quan"],
    ]
    deploy_widths = [Cm(1.5), Cm(5.2), Cm(2.2), Cm(5.1), Cm(2.5)]
    deploy_aligns = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    create_nd30_table(doc, deploy_headers, deploy_data, deploy_widths, deploy_aligns, "Bảng 2: Kế hoạch phân kỳ các giai đoạn triển khai hệ thống AMIS")

    add_sec_i(doc, "III. PHƯƠNG ÁN CHUYỂN ĐỔI VÀ LÀM SẠCH DỮ LIỆU LỊCH SỬ (DATA MIGRATION)")
    add_body_p(doc, "Dữ liệu lịch sử của cơ quan được tích lũy qua nhiều năm, nằm rải rác trên các ổ đĩa dùng chung, các tệp bảng tính Excel, hệ thống phần mềm cũ (FoxPro, SQL Server cũ) và hồ sơ giấy lưu trữ. Chiến lược di chuyển dữ liệu (Data Migration) được xây dựng khoa học qua 03 bước:")
    add_sec_a(doc, "Thiết lập bộ lọc kiểm tra trùng lặp số ký hiệu văn bản; đối chiếu ngày ban hành; bổ sung các trường thông tin bắt buộc còn thiếu (trích yếu, người ký, cơ quan ban hành, lĩnh vực văn bản); chuẩn hóa toàn bộ font chữ về bảng mã Unicode TCVN 6909:2001.", "a) Khảo sát và làm sạch dữ liệu (Data Cleansing): ")
    add_sec_a(doc, "Xây dựng các công cụ phần mềm chuyên dụng (ETL Script) tự động bóc tách dữ liệu từ các CSDL cũ, chuyển đổi cấu trúc quan hệ sang mô hình bảng dữ liệu của hệ thống AMIS mới, tự động nạp và gán liên kết tệp PDF đính kèm.", "b) Trích xuất và nạp dữ liệu (ETL Process): ")
    add_sec_a(doc, "Hội đồng kiểm kê dữ liệu tiến hành đối soát ngẫu nhiên 100% đối với văn bản quy phạm pháp luật và 20% đối với văn bản hành chính thông thường; kiểm tra tính toàn vẹn của tệp tin đính kèm bằng mã băm SHA-256.", "c) Đối soát và nghiệm thu dữ liệu: ")

    add_sec_i(doc, "IV. QUẢN TRỊ SỰ THAY ĐỔI, ĐÀO TẠO VÀ CHUYỂN GIAO CÔNG NGHỆ")
    add_sec_1(doc, "1. Chiến lược quản trị sự thay đổi (Change Management)")
    add_body_p(doc, "Chuyển đổi số trong cơ quan hành chính không chỉ là thay đổi công nghệ mà là sự thay đổi sâu sắc về thói quen, lề lối làm việc của cán bộ, công chức:")
    add_bullet_p(doc, "Thủ trưởng cơ quan và Trưởng các đơn vị trực thuộc gương mẫu tiên phong xử lý văn bản, ký số điện tử trên môi trường mạng; kiên quyết từ chối tiếp nhận các tờ trình, phiếu xử lý bằng giấy đối với các nội dung đã quy định xử lý trên hệ thống AMIS.", "Vai trò gương mẫu của người đứng đầu: ")
    add_bullet_p(doc, "Đưa chỉ tiêu tỷ lệ xử lý hồ sơ công việc trực tuyến và tỷ lệ ký số cá nhân vào tiêu chí bình xét thi đua, đánh giá xếp loại chất lượng công chức, viên chức cuối năm.", "Gắn chỉ tiêu thi đua công vụ: ")

    add_sec_1(doc, "2. Kế hoạch đào tạo phân lớp người dùng")
    add_body_p(doc, "Chương trình đào tạo được thiết kế riêng biệt theo từng nhóm đối tượng sử dụng:")
    add_bullet_p(doc, "Tập huấn thao tác trên thiết bị di động (iPad, điện thoại), xem nhanh báo cáo thống kê, duyệt phiếu trình và thực hiện ký số văn bản từ xa bằng SmartCA.", "Nhóm Lãnh đạo cơ quan (Ban Giám đốc, Trưởng phòng): ")
    add_bullet_p(doc, "Huấn luyện chuyên sâu kỹ năng tiếp nhận văn bản điện tử qua Trục liên thông, quét số hóa văn bản giấy, quản lý số văn bản, đóng dấu số tổ chức và dấu thời gian, lập danh mục hồ sơ cơ quan.", "Nhóm Cán bộ Văn thư, Lưu trữ: ")
    add_bullet_p(doc, "Đào tạo kỹ năng soạn thảo văn bản đúng thể thức Nghị định 30, luân chuyển văn bản, lấy ý kiến đóng góp, ký số cá nhân và gom tài liệu vào hồ sơ công việc điện tử.", "Nhóm Chuyên viên nghiệp vụ: ")
    add_bullet_p(doc, "Chuyển giao toàn diện tài liệu kỹ thuật, hướng dẫn quản trị cụm máy chủ, vận hành hệ thống CSDL, quy trình sao lưu/phục hồi dữ liệu và xử lý các sự cố mạng/phần mềm.", "Nhóm Quản trị viên CNTT: ")

    # =========================================================================
    # PHẦN THỨ BA: KẾ HOẠCH VÀ QUY TRÌNH KIỂM THỬ HỆ THỐNG THÔNG TIN (TESTING)
    # =========================================================================
    add_part_heading(doc, "PHẦN THỨ BA\nKẾ HOẠCH VÀ QUY TRÌNH KIỂM THỬ HỆ THỐNG THÔNG TIN (TESTING)")

    add_sec_i(doc, "I. MỤC TIÊU VÀ NGUYÊN TẮC KIỂM THỬ HỆ THỐNG")
    add_body_p(doc, "Hệ thống thông tin quản lý hành chính phục vụ các hoạt động pháp lý và công quyền của cơ quan nhà nước, do đó công tác kiểm thử (Testing) có ý nghĩa quyết định nhằm triệt tiêu các lỗi nghiệp vụ, bảo đảm tính xác thực, toàn vẹn và không thể chối bỏ của văn bản điện tử:")
    add_bullet_p(doc, "Xác minh mọi chức năng phần mềm hoạt động chính xác 100% theo các quy chuẩn văn thư của Nghị định số 30/2020/NĐ-CP và các quy chế nội bộ.", "Mục tiêu độ chính xác: ")
    add_bullet_p(doc, "Không còn bất kỳ lỗi nghiêm trọng (Critical) hoặc lỗi chức năng chính (Major) tồn đọng trước khi phát hành lên môi trường vận hành thực tế.", "Mục tiêu chất lượng mã nguồn: ")
    add_bullet_p(doc, "Tuân thủ chặt chẽ mô hình kiểm thử chữ V (V-Model), gắn liền mỗi giai đoạn phân tích thiết kế với một cấp độ kiểm thử tương ứng.", "Nguyên tắc kiểm thử: ")

    add_sec_i(doc, "II. CÁC CẤP ĐỘ VÀ PHƯƠNG PHÁP KIỂM THỬ CHUYÊN SÂU")
    add_sec_1(doc, "1. Kiểm thử đơn vị (Unit Testing) và Kiểm thử tích hợp (Integration Testing)")
    add_body_p(doc, "Đội ngũ phát triển thực hiện kiểm thử tự động toàn bộ các hàm nghiệp vụ lõi (độ bao phủ mã nguồn Code Coverage đạt trên 85%), bao gồm:")
    add_bullet_p(doc, "Kiểm thử các thuật toán tự động tăng số văn bản theo từng sổ độc lập, thuật toán tính thời hạn xử lý văn bản trừ ngày nghỉ thứ Bảy, Chủ nhật và ngày lễ theo Bộ luật Lao động.", "Kiểm thử logic nghiệp vụ: ")
    add_bullet_p(doc, "Kiểm tra giao tiếp qua giao diện lập trình API giữa phân hệ Quản lý văn bản với Trục liên thông VDXP quốc gia; kiểm thử tích hợp dịch vụ xác thực tài khoản định danh VNeID.", "Kiểm thử giao tiếp tích hợp: ")

    add_sec_1(doc, "2. Kiểm thử chức năng và luồng quy trình nghiệp vụ (Functional Testing)")
    add_body_p(doc, "Thực hiện kiểm thử đầu cuối (End-to-End Testing) theo đúng các tình huống nghiệp vụ thực tế:")
    add_bullet_p(doc, "Kiểm thử trọn vẹn luồng từ khi soạn thảo dự thảo -> trình ký -> lãnh đạo ký số bằng USB Token/SmartCA -> văn thư cấp số -> đóng dấu số cơ quan -> phát hành văn bản qua mạng -> ghi nhận trạng thái đã nhận tại cơ quan đích.", "Luồng văn bản đi: ")
    add_bullet_p(doc, "Kiểm thử tiếp nhận gói tin văn bản điện tử định dạng XML kèm chữ ký số từ cơ quan ngoài qua Trục liên thông -> giải mã -> bóc tách trích yếu -> tự động vào sổ -> chuyển tiếp chuyên viên.", "Luồng văn bản đến: ")
    add_bullet_p(doc, "Kiểm tra quy tắc hiển thị hình ảnh con dấu cơ quan và chữ ký cá nhân trên tệp PDF: đúng góc dưới bên phải, không che khuất chữ, kiểm tra tính hợp lệ của chứng thư số (CRL/OCSP).", "Kiểm tra định dạng ký số: ")

    add_sec_1(doc, "3. Kiểm thử hiệu năng, độ tải và độ bền (Performance & Stress Testing)")
    add_body_p(doc, "Sử dụng công cụ Apache JMeter và k6 để giả lập các kịch bản tải thực tế trên môi trường Staging có cấu hình tương đương môi trường Production:")
    add_bullet_p(doc, "Giả lập 5.000 người dùng đồng thời thực hiện các thao tác: đăng nhập, xem danh sách văn bản, tìm kiếm văn bản và tải tệp đính kèm. Kết quả: Thời gian phản hồi trung bình đạt 0.85 giây, tỷ lệ lỗi gói tin 0%.", "Kịch bản tải bình thường (Load Test): ")
    add_bullet_p(doc, "Tăng tải đột ngột lên 10.000 người dùng đồng thời trong vòng 10 phút để xác định điểm gãy (Breaking point). Hệ thống tự động kích hoạt cơ chế HPA (Horizontal Pod Autoscaler) tăng thêm 15 container xử lý, duy trì hoạt động ổn định.", "Kịch bản tải cực đại (Stress Test): ")
    add_bullet_p(doc, "Duy trì mức tải 3.000 người dùng liên tục trong 72 giờ để theo dõi hiện tượng rò rỉ bộ nhớ (Memory Leak) hoặc treo luồng kết nối CSDL (Connection Leak).", "Kịch bản độ bền (Endurance Test): ")

    add_sec_1(doc, "4. Kiểm thử an toàn thông tin và đánh giá lỗ hổng bảo mật (Security Pentest)")
    add_body_p(doc, "Phối hợp với đơn vị chuyên trách về an toàn thông tin tiến hành đánh giá bảo mật toàn diện:")
    add_bullet_p(doc, "Rà quét và thử nghiệm tấn công theo danh mục 10 lỗ hổng bảo mật ứng dụng web nguy hiểm nhất (OWASP Top 10): SQL Injection, Cross-Site Scripting (XSS), Insecure Direct Object References (IDOR), Broken Access Control, CSRF.", "Kiểm thử lỗ hổng web: ")
    add_bullet_p(doc, "Sử dụng các công cụ rà quét chuyên nghiệp (Nessus, OpenVAS, Acunetix) để phát hiện các lỗ hổng hệ điều hành máy chủ, cấu hình sai dịch vụ và các cổng mạng mở trái phép.", "Quét lỗ hổng hạ tầng: ")
    add_bullet_p(doc, "Chuyên gia an ninh mạng giả lập hacker thâm nhập từ Internet vào vùng DMZ và leo thang đặc quyền vào vùng CSDL. Mọi phát hiện rủi ro đều được vá triệt để trước khi nghiệm thu.", "Kiểm thử xâm nhập (Penetration Test): ")

    add_sec_1(doc, "5. Kiểm thử chấp nhận của người dùng (User Acceptance Testing - UAT)")
    add_body_p(doc, "Tổ chức đợt kiểm thử UAT kéo dài 03 tuần với sự tham gia của 50 cán bộ đại diện cho các đối tượng người dùng trong cơ quan. Người dùng trực tiếp thao tác trên các hồ sơ công việc thực tế, ghi nhận phản hồi và đánh giá mức độ thân thiện, dễ sử dụng của giao diện.")

    add_sec_i(doc, "III. MA TRẬN KỊCH BẢN KIỂM THỬ VÀ QUY TRÌNH QUẢN LÝ LỖI")
    add_sec_1(doc, "1. Bảng kịch bản kiểm thử mẫu (Sample Test Matrix)")
    add_body_p(doc, "Dưới đây là một số kịch bản kiểm thử tiêu biểu đại diện cho các phân hệ nghiệp vụ chính:")

    test_headers = ["Mã TC", "Tên kịch bản kiểm thử", "Điều kiện tiên quyết", "Kết quả mong đợi chuẩn", "Kết quả thực tế", "Đánh giá"]
    test_data = [
        ["TC-01", "Đăng nhập xác thực 2 lớp (MFA)", "Tài khoản hợp lệ, đã kích hoạt ứng dụng OTP", "Gửi mã OTP chính xác, đăng nhập thành công vào trang chủ", "Đăng nhập nhanh, mã OTP hợp lệ", "ĐẠT"],
        ["TC-02", "Tiếp nhận văn bản đến từ Trục VDXP", "Có gói tin gửi đến từ Bộ chủ quản", "Tự động trích xuất thông tin, vào sổ đến, báo chuông cho văn thư", "Trích xuất đúng 100% metadata", "ĐẠT"],
        ["TC-03", "Ký số văn bản đi bằng SmartCA", "Văn bản PDF dự thảo đã duyệt, tài khoản có chứng thư", "Ký số thành công, hiển thị đúng mẫu dấu và chữ ký theo NĐ 30", "Chữ ký hợp lệ, đúng tọa độ quy chuẩn", "ĐẠT"],
        ["TC-04", "Cấp số và đóng dấu số cơ quan", "Văn thư nhận văn bản đã ký số của Lãnh đạo", "Sinh số văn bản kế tiếp trong sổ, đóng dấu cơ quan (HSM) tự động", "Số sinh liên tục, dấu số sắc nét", "ĐẠT"],
        ["TC-05", "Phân luồng văn bản cho chuyên viên", "Lãnh đạo phòng có văn bản được giao", "Chuyên viên nhận thông báo tức thì, thời hạn xử lý đếm ngược", "Gửi thông báo qua web & mobile app", "ĐẠT"],
        ["TC-06", "Lập hồ sơ công việc và nộp lưu", "Công việc đã hoàn thành, có đủ tài liệu", "Gom đủ tài liệu, ký số đóng hồ sơ, chuyển trạng thái nộp lưu", "Hồ sơ lưu trữ đầy đủ, tra cứu tốt", "ĐẠT"],
        ["TC-07", "Kiểm tra quyền truy cập trái phép", "Chuyên viên phòng A truy cập văn bản nội bộ phòng B", "Hệ thống từ chối truy cập (Mã lỗi 403 Forbidden), ghi log kiểm toán", "Chặn truy cập tuyệt đối, log chuẩn", "ĐẠT"],
        ["TC-08", "Khôi phục CSDL từ bản backup", "Môi trường thử nghiệm, có tệp backup mới nhất", "Khôi phục nguyên vẹn trạng thái CSDL trong vòng dưới 30 phút", "Thời gian khôi phục đạt 18 phút", "ĐẠT"],
    ]
    test_widths = [Cm(1.5), Cm(3.6), Cm(3.3), Cm(4.5), Cm(2.2), Cm(1.4)]
    test_aligns = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER]
    create_nd30_table(doc, test_headers, test_data, test_widths, test_aligns, "Bảng 3: Tổng hợp một số kịch bản kiểm thử điển hình của hệ thống")

    add_sec_1(doc, "2. Quy trình vòng đời quản lý lỗi phần mềm (Defect Lifecycle)")
    add_body_p(doc, "Mọi sự cố phát hiện trong quá trình kiểm thử đều được theo dõi chặt chẽ trên hệ thống quản lý lỗi tập trung theo 04 cấp độ nghiêm trọng:")
    add_bullet_p(doc, "Lỗi làm tê liệt toàn bộ hệ thống, mất dữ liệu, rò rỉ bảo mật nghiêm trọng. Thời hạn khắc phục tối đa: 04 giờ.", "Mức 1 - Khẩn cấp (Critical): ")
    add_bullet_p(doc, "Lỗi làm gián đoạn một luồng nghiệp vụ chính (không ký số được, không vào sổ được) mà không có giải pháp tạm thời. Thời hạn khắc phục: 12 giờ.", "Mức 2 - Nghiêm trọng (Major): ")
    add_bullet_p(doc, "Lỗi chức năng phụ hoặc có phương án thay thế tạm thời, không ảnh hưởng đến tính toàn vẹn dữ liệu. Thời hạn khắc phục: 48 giờ.", "Mức 3 - Trung bình (Minor): ")
    add_bullet_p(doc, "Lỗi về chính tả, lệch giao diện thẩm mỹ nhẹ, không ảnh hưởng đến chức năng. Thời hạn khắc phục: Trong đợt cập nhật định kỳ tiếp theo.", "Mức 4 - Nhỏ (Trivial): ")

    # =========================================================================
    # PHẦN THỨ TƯ: VẬN HÀNH VÀ DUY TRÌ HỆ THỐNG THÔNG TIN QUẢN LÝ HÀNH CHÍNH
    # =========================================================================
    add_part_heading(doc, "PHẦN THỨ TƯ\nVẬN HÀNH VÀ DUY TRÌ HỆ THỐNG THÔNG TIN QUẢN LÝ HÀNH CHÍNH")

    add_sec_i(doc, "I. QUY CHẾ VÀ QUY TRÌNH VẬN HÀNH TIÊU CHUẨN (SOP)")
    add_body_p(doc, "Để hệ thống vận hành liên tục, an toàn và phát huy tối đa hiệu quả, cơ quan ban hành Quy chế quản lý, vận hành và khai thác hệ thống thông tin quản lý hành chính nội bộ, quy định rõ trách nhiệm của từng cá nhân, đơn vị. Đồng thời thiết lập Quy trình vận hành tiêu chuẩn (Standard Operating Procedures - SOP) hàng ngày:")
    add_sec_a(doc, "Thực hiện lúc 07h00 hàng ngày: Kiểm tra trạng thái hoạt động của các máy chủ ảo, kiểm tra dung lượng ổ đĩa trống, rà soát kết nối đường truyền mạng và kiểm tra kết quả các bản sao lưu tự động của đêm hôm trước.", "a) Danh mục kiểm tra đầu ngày (Morning Checklist): ")
    add_sec_a(doc, "Thực hiện lúc 18h00 hàng ngày: Kiểm tra hàng đợi thông điệp chưa gửi đi trên Trục liên thông; rà soát số lượng văn bản chưa xử lý trong ngày; kiểm tra tình trạng khóa tài khoản do nhập sai mật khẩu nhiều lần; kích hoạt tiến trình nén nhật ký (log rotation).", "b) Danh mục kiểm tra cuối ngày (Evening Checklist): ")
    add_sec_a(doc, "Tổ chức đội ngũ kỹ thuật trực giám sát 24/7/365, sẵn sàng tiếp nhận và ứng cứu sự cố hạ tầng và an toàn thông tin theo ca trực luân phiên.", "c) Chế độ trực vận hành: ")

    add_sec_i(doc, "II. HỆ THỐNG GIÁM SÁT TẬP TRUNG VÀ CẢNH BÁO THỜI GIAN THỰC")
    add_body_p(doc, "Ứng dụng các công cụ giám sát mã nguồn mở tiên tiến nhất trong quản trị hệ thống lớn:")
    add_bullet_p(doc, "Sử dụng Prometheus thu thập các chỉ số phần cứng (CPU, RAM, Disk I/O, Network Bandwidth) và hiển thị trực quan trên bảng điều khiển Grafana tại Trung tâm điều hành NOC.", "Giám sát hiệu năng hạ tầng: ")
    add_bullet_p(doc, "Toàn bộ nhật ký hoạt động (System Log, Access Log, Error Log) được đẩy tập trung về cụm máy chủ ELK Stack (Elasticsearch, Logstash, Kibana) kết hợp công cụ Wazuh SIEM để phát hiện các dấu hiệu tấn công bất thường.", "Giám sát nhật ký an toàn thông tin: ")
    add_bullet_p(doc, "Cấu hình cảnh báo tự động gửi tin nhắn SMS, tin nhắn Telegram và thư điện tử đến đội ngũ quản trị viên ngay khi có chỉ số vượt ngưỡng an toàn (CPU > 85% trong 5 phút, dung lượng đĩa trống < 15%, phát hiện hơn 10 lần đăng nhập sai liên tiếp từ một địa chỉ IP).", "Thiết lập ngưỡng cảnh báo tự động: ")

    add_sec_i(doc, "III. CHÍNH SÁCH SAO LƯU DỰ PHÒNG VÀ PHỤC HỒI THẢM HỌA (BACKUP & DR)")
    add_body_p(doc, "Chính sách sao lưu được xây dựng nghiêm ngặt theo nguyên tắc vàng 3-2-1:")
    add_bullet_p(doc, "Luôn lưu giữ ít nhất 03 bản sao chép dữ liệu (01 bản chạy thực tế và 02 bản dự phòng).", "Quy tắc 3 bản sao: ")
    add_bullet_p(doc, "Lưu trữ bản sao lưu trên ít nhất 02 loại phương tiện lưu trữ vật lý độc lập (Hệ thống SAN tốc độ cao và Hệ thống lưu trữ băng từ/ổ cứng mạng NAS).", "Quy tắc 2 phương tiện: ")
    add_bullet_p(doc, "Có ít nhất 01 bản sao lưu được đồng bộ sang Trung tâm dữ liệu dự phòng đặt tại vị trí địa lý cách xa trung tâm chính trên 20km.", "Quy tắc 1 bản sao ngoại vi (Offsite): ")
    
    add_body_p(doc, "Lịch biểu sao lưu dữ liệu tự động:")
    add_plus_bullet_p(doc, "Thực hiện vào lúc 00h00 Chủ nhật hàng tuần, sao lưu toàn bộ ảnh máy chủ ảo, cơ sở dữ liệu và kho tệp tin lưu trữ.", "Sao lưu toàn phần (Full Backup): ")
    add_plus_bullet_p(doc, "Thực hiện vào lúc 23h00 các ngày từ thứ Hai đến thứ Bảy, sao lưu toàn bộ dữ liệu thay đổi so với bản Full gần nhất.", "Sao lưu vi sai (Differential Backup): ")
    add_plus_bullet_p(doc, "Thực hiện tự động 15 phút một lần, ghi nhận mọi giao dịch phát sinh trong CSDL, bảo đảm mục tiêu RPO dưới 15 phút.", "Sao lưu nhật ký giao dịch (Transaction Log Backup): ")

    add_sec_i(doc, "IV. QUY TRÌNH TIẾP NHẬN XỬ LÝ SỰ CỐ VÀ HỖ TRỢ KỸ THUẬT (ITSM / HELPDESK)")
    add_body_p(doc, "Thiết lập Bàn hỗ trợ dịch vụ công nghệ thông tin (IT Service Desk) là đầu mối duy nhất tiếp nhận các yêu cầu hỗ trợ của cán bộ, công chức qua 03 kênh: Tổng đài nội bộ, Cổng hỗ trợ kỹ thuật trực tuyến và Hòm thư điện tử. Cam kết chất lượng dịch vụ (SLA) được quy định rõ ràng:")

    sla_headers = ["Mức độ ưu tiên", "Phân loại sự cố", "Thời gian phản hồi", "Thời gian xử lý tối đa", "Biện pháp xử lý"]
    sla_data = [
        ["P1 - Khẩn cấp", "Hệ thống ngừng hoạt động hoàn toàn, mất điện DC, tấn công mã độc mã hóa", "Dưới 05 phút", "Dưới 02 giờ", "Huy động toàn bộ Tổ phản ứng nhanh, chuyển sang hệ thống dự phòng"],
        ["P2 - Nghiêm trọng", "Không thể ký số, lỗi kết nối Trục liên thông quốc gia, lỗi CSDL một phân hệ", "Dưới 15 phút", "Dưới 04 giờ", "Kỹ sư chuyên trách phân hệ xử lý, khởi động lại dịch vụ liên quan"],
        ["P3 - Trung bình", "Một số người dùng không đăng nhập được, máy in văn thư không kết nối", "Dưới 30 phút", "Dưới 08 giờ", "Hỗ trợ từ xa qua Ultraviewer/Anydesk hoặc xử lý trực tiếp tại bàn"],
        ["P4 - Thấp", "Yêu cầu cấp mới tài khoản, hướng dẫn sử dụng, thay đổi thông tin cá nhân", "Dưới 02 giờ", "Trong vòng 24 giờ", "Tiếp nhận theo phiếu yêu cầu dịch vụ (Service Request)"],
    ]
    sla_widths = [Cm(2.5), Cm(4.7), Cm(2.5), Cm(2.5), Cm(4.3)]
    sla_aligns = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT]
    create_nd30_table(doc, sla_headers, sla_data, sla_widths, sla_aligns, "Bảng 4: Ma trận cam kết thời gian xử lý sự cố (SLA) của bộ phận kỹ thuật")

    # =========================================================================
    # PHẦN THỨ NĂM: QUẢN TRỊ TOÀN DIỆN HỆ THỐNG THÔNG TIN QUẢN LÝ HÀNH CHÍNH
    # =========================================================================
    add_part_heading(doc, "PHẦN THỨ NĂM\nQUẢN TRỊ TOÀN DIỆN HỆ THỐNG THÔNG TIN QUẢN LÝ HÀNH CHÍNH")

    add_sec_i(doc, "I. QUẢN TRỊ ĐỊNH DANH VÀ PHÂN QUYỀN TRUY CẬP (IAM & RBAC/ABAC)")
    add_sec_1(doc, "1. Quản lý định danh tập trung (IAM) và xác thực đa yếu tố (MFA)")
    add_body_p(doc, "Hệ thống triển khai giải pháp quản trị định danh tập trung (Identity and Access Management - IAM) thông qua chuẩn OpenID Connect và SAML 2.0. Mỗi cán bộ chỉ được cấp duy nhất một định danh điện tử gắn liền với Mã số công chức/viên chức:")
    add_bullet_p(doc, "Cán bộ đăng nhập một lần (Single Sign-On - SSO) là có thể sử dụng tất cả các dịch vụ công vụ nội bộ được cấp phép mà không cần ghi nhớ nhiều mật khẩu.", "Đăng nhập một lần: ")
    add_bullet_p(doc, "Bắt buộc áp dụng xác thực hai yếu tố (MFA) đối với tài khoản Lãnh đạo cơ quan, Cán bộ văn thư và Quản trị viên hệ thống qua ứng dụng tạo mã OTP (Google Authenticator) hoặc thông báo đẩy (Push notification).", "Xác thực hai yếu tố: ")

    add_sec_1(doc, "2. Ma trận phân quyền kiểm soát truy cập dựa trên vai trò (RBAC)")
    add_body_p(doc, "Phân quyền truy cập được cấu hình chặt chẽ theo nguyên tắc quyền tối thiểu (Least Privilege), phân định rạch ròi nhiệm vụ giữa các chức danh hành chính:")

    rbac_headers = ["Vai trò người dùng", "Xem văn bản", "Soạn thảo/Trình", "Phê duyệt/Ký số", "Cấp số/Đóng dấu", "Quản trị hệ thống"]
    rbac_data = [
        ["Lãnh đạo cơ quan", "Toàn cơ quan", "Có quyền", "Ký số chính thức", "Không", "Không"],
        ["Lãnh đạo phòng ban", "Trong phòng ban", "Có quyền", "Ký nháy duyệt", "Không", "Không"],
        ["Chuyên viên xử lý", "Văn bản được giao", "Có quyền", "Không", "Không", "Không"],
        ["Văn thư cơ quan", "Toàn cơ quan", "Có quyền", "Không", "Toàn quyền", "Không"],
        ["Cán bộ Lưu trữ", "Hồ sơ đã nộp lưu", "Không", "Không", "Không", "Không"],
        ["Quản trị viên CNTT", "Chỉ xem nhật ký hệ thống", "Không", "Không", "Không", "Toàn quyền kỹ thuật"],
    ]
    rbac_widths = [Cm(3.5), Cm(2.6), Cm(2.6), Cm(2.6), Cm(2.6), Cm(2.6)]
    rbac_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER]
    create_nd30_table(doc, rbac_headers, rbac_data, rbac_widths, rbac_aligns, "Bảng 5: Ma trận phân quyền truy cập theo vai trò hành chính (RBAC)")

    add_sec_i(doc, "II. QUẢN TRỊ AN TOÀN THÔNG TIN VÀ BẢO VỆ BÍ MẬT NHÀ NƯỚC")
    add_sec_1(doc, "1. Tuân thủ hồ sơ an toàn cấp độ 3")
    add_body_p(doc, "Hệ thống AMIS được phê duyệt Hồ sơ đề xuất cấp độ an toàn thông tin Cấp độ 3 theo đúng quy định tại Nghị định số 85/2016/NĐ-CP và Thông tư số 12/2022/TT-BTTTT của Bộ Thông tin và Truyền thông. Mọi phương án thiết kế phần cứng, phần mềm, chính sách vận hành và nhân sự đều đáp ứng đầy đủ bộ tiêu chí bảo đảm an toàn hệ thống thông tin theo cấp độ.")

    add_sec_1(doc, "2. Quản lý chứng thư số và thiết bị ký số HSM")
    add_body_p(doc, "Chữ ký số chuyên dùng công vụ do Ban Cơ yếu Chính phủ cấp được quản lý nghiêm ngặt:")
    add_bullet_p(doc, "Chứng thư số của cơ quan được nạp vào thiết bị bảo mật chuyên dụng HSM (Hardware Security Module) đặt tại phòng máy chủ an toàn, có kiểm soát ra vào bằng sinh trắc học và camera giám sát 24/7. Chỉ có tài khoản văn thư được cấp quyền sau khi xác thực 2 lớp mới có thể gửi lệnh kích hoạt con dấu số cơ quan.", "Bảo quản con dấu điện tử: ")
    add_bullet_p(doc, "Định kỳ 03 tháng rà soát thời hạn hiệu lực của các chứng thư số cá nhân, làm thủ tục gia hạn kịp thời, không để gián đoạn hoạt động ký duyệt văn bản.", "Gia hạn chứng thư số: ")

    add_sec_1(doc, "3. Nhật ký kiểm toán hệ thống (Audit Trail) không thể chối bỏ")
    add_body_p(doc, "Mọi hành động của người dùng trên hệ thống (đăng nhập, xem văn bản, tải tệp, chỉnh sửa, xóa, chuyển giao, ký số) đều được ghi nhận tức thì vào Nhật ký kiểm toán (Audit Trail) với đầy đủ thông tin: Địa chỉ IP, Thời điểm chính xác (Timestamp), Mã cán bộ, Tên hành động và Dữ liệu trước/sau chỉnh sửa. Nhật ký kiểm toán được lưu trữ độc lập trên vùng nhớ bất biến (WORM - Write Once Read Many) với thời gian lưu giữ tối thiểu 24 tháng, ngăn chặn tuyệt đối hành vi can thiệp, xóa dấu vết của người dùng hoặc quản trị viên.")

    add_sec_i(doc, "III. QUẢN TRỊ CƠ SỞ DỮ LIỆU VÀ TỐI ƯU HÓA HỆ THỐNG")
    add_body_p(doc, "Để đảm bảo tốc độ truy vấn ổn định khi dung lượng dữ liệu tăng trưởng hàng triệu bản ghi sau nhiều năm hoạt động:")
    add_bullet_p(doc, "Các bảng dữ liệu lớn như Sổ văn bản, Nhật ký thao tác được phân chia thành các phân vùng độc lập theo từng năm hành chính. Truy vấn văn bản của năm hiện tại chỉ quét dữ liệu trên phân vùng tương ứng, giúp giảm 80% thời gian thực thi câu lệnh SQL.", "Phân vùng bảng dữ liệu (Table Partitioning): ")
    add_bullet_p(doc, "Thiết lập chỉ mục B-tree cho các khóa tra cứu chính và chỉ mục GIN cho các trường tìm kiếm văn bản toàn văn (Full-text search tiếng Việt có dấu).", "Tối ưu hóa chỉ mục (Indexing Strategy): ")
    add_bullet_p(doc, "Toàn bộ tệp PDF đính kèm được lưu trữ tại hệ thống lưu trữ đối tượng MinIO phân tán, CSDL chỉ lưu giữ đường dẫn URL và mã băm kiểm tra tính toàn vẹn (SHA-256), giúp CSDL quan hệ duy trì kích thước gọn nhẹ và hiệu năng vượt trội.", "Quản lý kho tệp tin số hóa: ")

    add_sec_i(doc, "IV. QUẢN TRỊ VÒNG ĐỜI NÂNG CẤP VÀ QUẢN LÝ BẢN VÁ (PATCH MANAGEMENT)")
    add_body_p(doc, "Quy trình cập nhật bản vá bảo mật và nâng cấp tính năng được chuẩn hóa qua 04 bước nghiêm ngặt:")
    add_bullet_p(doc, "Hàng tuần rà soát các cảnh báo bảo mật từ Trung tâm Giám sát an toàn không gian mạng quốc gia (NCSC) và các nhà cung cấp nền tảng (Linux, PostgreSQL, Docker).", "Bước 1 - Rà soát và đánh giá: ")
    add_bullet_p(doc, "Mọi bản vá bắt buộc phải được cài đặt và kiểm thử tính tương thích trên môi trường Thử nghiệm (Staging) trong ít nhất 48 giờ.", "Bước 2 - Thử nghiệm cách ly: ")
    add_bullet_p(doc, "Cập nhật lên môi trường vận hành chính thức vào khung giờ thấp điểm (từ 00h00 đến 03h00 sáng ngày Chủ nhật), có sẵn phương án khôi phục nguyên trạng (Rollback) trong trường hợp phát sinh sự cố.", "Bước 3 - Triển khai chính thức: ")
    add_bullet_p(doc, "Kiểm tra toàn diện các dịch vụ sau nâng cấp và lập biên bản hoàn thành đợt bảo trì hệ thống.", "Bước 4 - Hậu kiểm và lưu hồ sơ: ")

    add_sec_i(doc, "V. MÔ HÌNH TỔ CHỨC NHÂN SỰ VÀ MA TRẬN TRÁCH NHIỆM RACI")
    add_body_p(doc, "Thành lập Bộ phận Quản trị và Vận hành hệ thống AMIS trực thuộc Cục Công nghệ thông tin và Chuyển đổi số, bao gồm 04 nhóm vai trò chuyên trách:")
    add_bullet_p(doc, "Chịu trách nhiệm về tính sẵn sàng của cụm máy chủ, lưu trữ, sao lưu dữ liệu và mạng truyền thông.", "Nhóm Quản trị Hạ tầng & CSDL (SysAdmin / DBA): ")
    add_bullet_p(doc, "Giám sát nhật ký SIEM, ứng cứu sự cố bảo mật, quản lý chính sách an toàn thông tin và cấp phát chứng thư số.", "Nhóm Quản trị An toàn thông tin (SecAdmin): ")
    add_bullet_p(doc, "Tiếp nhận bản phát hành phần mềm, phối hợp xử lý lỗi nghiệp vụ, bảo trì API liên thông.", "Nhóm Quản trị Ứng dụng (AppAdmin): ")
    add_bullet_p(doc, "Trực tổng đài, giải đáp vướng mắc, hướng dẫn người dùng cuối và cấp phát tài khoản thông thường.", "Nhóm Hỗ trợ người dùng (Service Desk / Helpdesk): ")

    add_body_p(doc, "Ma trận phân định trách nhiệm RACI (R: Thực hiện, A: Chịu trách nhiệm chính, C: Tham vấn, I: Nhận thông tin):")

    raci_headers = ["Hạng mục công việc", "Ban Giám đốc", "Trưởng bộ phận CNTT", "Quản trị viên hệ thống", "Đơn vị sử dụng", "Nhà thầu kỹ thuật"]
    raci_data = [
        ["Phê duyệt quy chế vận hành và kinh phí", "A", "C", "I", "I", "I"],
        ["Giám sát hạ tầng và sao lưu dữ liệu", "I", "A", "R", "I", "C"],
        ["Cấp phát, khóa và thu hồi tài khoản", "I", "A", "R", "I", "I"],
        ["Ứng cứu sự cố an toàn thông tin", "I", "A", "R", "I", "C"],
        ["Đào tạo người dùng và chuyển giao", "I", "A", "R", "R", "C"],
        ["Nâng cấp tính năng và sửa lỗi phần mềm", "I", "A", "C", "I", "R"],
    ]
    raci_widths = [Cm(4.5), Cm(2.4), Cm(2.4), Cm(2.4), Cm(2.4), Cm(2.4)]
    raci_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER]
    create_nd30_table(doc, raci_headers, raci_data, raci_widths, raci_aligns, "Bảng 6: Ma trận phân định trách nhiệm RACI trong quản trị vận hành")

    # =========================================================================
    # PHẦN THỨ SÁU: ĐÁNH GIÁ HIỆU QUẢ, KẾT LUẬN VÀ ĐỀ XUẤT KIẾN NGHỊ
    # =========================================================================
    add_part_heading(doc, "PHẦN THỨ SÁU\nĐÁNH GIÁ HIỆU QUẢ, KẾT LUẬN VÀ ĐỀ XUẤT KIẾN NGHỊ")

    add_sec_i(doc, "I. ĐÁNH GIÁ HIỆU QUẢ KINH TẾ - XÃ HỘI VÀ CẢI CÁCH HÀNH CHÍNH")
    add_sec_1(doc, "1. Bảng so sánh chỉ số định lượng Trước và Sau triển khai")
    add_body_p(doc, "Qua theo dõi thực tế sau khi đưa hệ thống AMIS vào vận hành toàn diện tại cơ quan, các chỉ số hoạt động công vụ đạt được sự bứt phá vượt bậc:")

    comp_headers = ["Chỉ số đo lường hiệu quả", "Trước khi có hệ thống", "Sau khi vận hành hệ thống AMIS", "Mức độ cải thiện"]
    comp_data = [
        ["Thời gian luân chuyển và duyệt văn bản", "3 đến 5 ngày làm việc", "Dưới 4 giờ làm việc", "Giảm 85% thời gian"],
        ["Tỷ lệ văn bản xử lý đúng và trước hạn", "Khoảng 68% - 72%", "Đạt 98.6%", "Tăng 28.6%"],
        ["Tỷ lệ văn bản ký số cá nhân và cơ quan", "Dưới 15% (chủ yếu ký tay)", "Đạt 100% (trừ văn bản mật)", "Tăng 85%"],
        ["Chi phí in ấn, giấy tờ và chuyển phát bưu điện", "Trung bình 850 triệu đồng/năm", "Còn khoảng 90 triệu đồng/năm", "Tiết kiệm 89.4% chi phí"],
        ["Thời gian tra cứu một hồ sơ lưu trữ cũ", "Từ 1 đến 2 ngày", "Dưới 10 giây (tra cứu tức thì)", "Nhanh hơn hàng trăm lần"],
        ["Mức độ hài lòng của cán bộ, công chức", "Đạt 65%", "Đạt 96.2%", "Tăng 31.2%"],
    ]
    comp_widths = [Cm(4.5), Cm(3.8), Cm(4.5), Cm(3.7)]
    comp_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    create_nd30_table(doc, comp_headers, comp_data, comp_widths, comp_aligns, "Bảng 7: So sánh các chỉ số vận hành hành chính trước và sau ứng dụng hệ thống")

    add_sec_1(doc, "2. Tác động đối với công tác chỉ đạo và cải cách hành chính")
    add_body_p(doc, "Hệ thống AMIS đã tạo ra bước ngoặt lịch sử trong công tác quản trị hành chính công của cơ quan:")
    add_bullet_p(doc, "Xóa bỏ rào cản địa lý và thời gian trong xử lý công vụ. Lãnh đạo có thể xem xét, cho ý kiến chỉ đạo và ký số ban hành văn bản hỏa tốc ngay trên đường đi công tác cơ sở.", "Nâng cao năng lực điều hành: ")
    add_bullet_p(doc, "Minh bạch hóa 100% tiến độ xử lý hồ sơ công việc của từng chuyên viên, gắn trách nhiệm cá nhân với kết quả thực hiện nhiệm vụ, chấm dứt triệt để tình trạng đùn đẩy trách nhiệm.", "Tăng cường kỷ cương công vụ: ")
    add_bullet_p(doc, "Đóng góp trực tiếp vào việc nâng cao Chỉ số cải cách hành chính (PAR Index) và Chỉ số chuyển đổi số (DTI) của cơ quan trong bảng xếp hạng toàn quốc.", "Thúc đẩy xếp hạng chuyển đổi số: ")

    add_sec_i(doc, "II. TỒN TẠI, HẠN CHẾ VÀ BÀI HỌC KINH NGHIỆM")
    add_sec_1(doc, "1. Tồn tại và khó khăn thực tiễn")
    add_body_p(doc, "Bên cạnh các thành tựu nổi bật, quá trình triển khai vẫn ghi nhận một số khó khăn:")
    add_bullet_p(doc, "Một bộ phận cán bộ lớn tuổi ban đầu còn tâm lý ngại thay đổi, lúng túng trong thao tác ký số trên thiết bị di động, vẫn có thói quen in văn bản ra giấy để đọc trước khi duyệt.", "Thói quen tâm lý người dùng: ")
    add_bullet_p(doc, "Hạ tầng mạng nội bộ tại một số đơn vị trực thuộc cơ sở vùng xa đôi lúc chưa thực sự ổn định, làm ảnh hưởng đến tốc độ mở các tệp tin đính kèm dung lượng lớn.", "Hạ tầng kỹ thuật không đồng đều: ")
    add_bullet_p(doc, "Áp lực bảo đảm an toàn thông tin rất lớn trước nguy cơ tấn công mạng ngày càng tinh vi của các nhóm tin tặc quốc tế nhằm vào hạ tầng dữ liệu cơ quan nhà nước.", "Thách thức an ninh mạng: ")

    add_sec_1(doc, "2. Bài học kinh nghiệm sâu sắc")
    add_body_p(doc, "Từ thực tiễn triển khai thành công hệ thống, cơ quan rút ra 03 bài học kinh nghiệm cốt lõi:")
    add_bullet_p(doc, "Sự quyết liệt, trực tiếp vào cuộc và gương mẫu sử dụng hệ thống của Thủ trưởng cơ quan là nhân tố quyết định trên 70% sự thành bại của dự án chuyển đổi số hành chính.", "Quyết tâm của người đứng đầu: ")
    add_bullet_p(doc, "Công nghệ phần mềm phải lấy người dùng làm trung tâm, giao diện phải đơn giản, tiện lợi, loại bỏ tối đa các thao tác rườm rà để cán bộ dễ dàng tiếp cận và sử dụng thành thạo.", "Lấy người dùng làm trung tâm: ")
    add_bullet_p(doc, "An toàn thông tin phải được coi trọng hàng đầu, phải được thiết kế và bảo vệ đa lớp ngay từ khâu kiến trúc ban đầu chứ không thể làm theo kiểu chắp vá sau khi xảy ra sự cố.", "Bảo đảm an toàn từ thiết kế: ")

    add_sec_i(doc, "III. ĐỀ XUẤT, KIẾN NGHỊ")
    add_body_p(doc, "Để tiếp tục duy trì vận hành ổn định và phát triển nâng tầm hệ thống AMIS trong giai đoạn tiếp theo, Cục Công nghệ thông tin và Chuyển đổi số kính đề xuất Lãnh đạo cơ quan xem xét, phê duyệt các nội dung sau:")
    add_sec_1(doc, "1. Kiến nghị về cơ chế, chính sách")
    add_bullet_p(doc, "Ban hành quy định bắt buộc 100% hồ sơ công việc phải được số hóa và lập danh mục lưu trữ điện tử theo đúng lộ trình của Bộ Nội vụ.", "Quy định bắt buộc hồ sơ số: ")
    add_bullet_p(doc, "Bổ sung tiêu chí đánh giá mức độ thành thạo và tỷ lệ xử lý hồ sơ trên phần mềm AMIS vào quy chế nâng bậc lương trước thời hạn và bình xét thi đua hàng năm.", "Đưa vào quy chế thi đua: ")

    add_sec_1(doc, "2. Kiến nghị về đầu tư và bảo đảm nguồn lực")
    add_bullet_p(doc, "Bố trí nguồn kinh phí thường xuyên hàng năm (tối thiểu 10% - 15% tổng mức đầu tư ban đầu) dành cho công tác bảo trì phần mềm, giám sát an toàn thông tin 24/7 và gia hạn bản quyền thiết bị.", "Kinh phí bảo trì hàng năm: ")
    add_bullet_p(doc, "Tiếp tục đầu tư trang bị chứng thư số cá nhân SmartCA cho 100% cán bộ, công chức, viên chức và người lao động trong toàn cơ quan.", "Trang bị đầy đủ chữ ký số: ")

    add_sec_1(doc, "3. Kiến nghị về định hướng phát triển công nghệ")
    add_bullet_p(doc, "Nghiên cứu tích hợp mô hình Trí tuệ nhân tạo (AI Assistant) hỗ trợ tự động tóm tắt nội dung văn bản dài, tự động kiểm tra lỗi thể thức văn bản hành chính theo Nghị định 30/2020/NĐ-CP và gợi ý nơi nhận văn bản tự động.", "Tích hợp Trí tuệ nhân tạo (AI): ")
    add_bullet_p(doc, "Tiếp tục mở rộng liên thông dữ liệu hai chiều với Cơ sở dữ liệu Quốc gia về Dân cư (Đề án 06), Cơ sở dữ liệu Đăng ký doanh nghiệp và CSDL Đất đai để phục vụ giải quyết thủ tục hành chính liên thông toàn trình.", "Mở rộng liên thông quốc gia: ")

    add_body_p(doc, "Báo cáo kính trình Quý Thầy/Cô và Hội đồng chuyên môn xem xét, đánh giá./.")

    # Save document
    doc.save(output_path)
    print(f"Document successfully created and saved at: {output_path}")

if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.abspath(os.path.join(out_dir, ".."))
    target_docx = os.path.join(root_dir, "Bao_Cao_Phan_Tich_Trien_Khai_Van_Hanh_Kiem_Thu_Va_Quan_Tri_HTTT_Quan_Ly_Hanh_Chinh.docx")
    build_document(target_docx)
