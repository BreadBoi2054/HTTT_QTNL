# -*- coding: utf-8 -*-
"""
Script to generate an entirely unique, high-level administrative report for:
Student: NGUYỄN NHƯ HẠ
Student ID: 2305HTTA008
Institution: HỌC VIỆN CHÍNH TRỊ QUỐC GIA HỒ CHÍ MINH - HỌC VIỆN HÀNH CHÍNH VÀ QUẢN TRỊ CÔNG

Topic: "Phân tích triển khai vận hành kiểm thử và quản trị hệ thống thông tin quản lý hành chính"
Approach: Tiếp cận theo mô hình Quản lý Hành chính Nhà nước hiện đại (SAMIS), quy trình BPMN 2.0,
          kiến trúc Zero Trust, hạ tầng siêu hội tụ HCI, kiểm thử Shift-Left/BDD, vận hành ITIL v4/AIOps,
          và quản trị phân quyền ABAC.

Strict Constraints Satisfied:
1. Toàn bộ chữ đen (RGB: 0, 0, 0) - Không màu mè, không shading nền màu.
2. Tuân thủ 100% Nghị định số 30/2020/NĐ-CP của Chính phủ về công tác văn thư:
   - Khổ giấy A4 (210 x 297 mm), chiều đứng.
   - Định lề: Trên 25mm, Dưới 20mm, Trái 30mm, Phải 15mm.
   - Phông chữ Times New Roman đồng bộ cho mọi kiểu chữ.
   - Đánh số trang: Chính giữa lề trên, cỡ 13pt, số Ả Rập, trang 1 không hiển thị số trang.
   - Đề mục: Phần (hoa, đậm), Mục I, II (hoa, đậm), Tiểu mục 1, 2 (thường, đậm), Điểm a, b, c;
     Thụt đầu dòng 1.27cm, Giãn dòng 1.25, Before 0pt, After 6pt.
   - Bảng biểu: Viền đen đơn, cỡ 12pt, tiêu đề cột in đậm canh giữa, không màu nền.
   - Thông tin tác giả: Nguyễn Như Hạ - 2305HTTA008 ở trên cùng.
   - BỎ HOÀN TOÀN phần chữ ký ở dưới cùng theo yêu cầu của người dùng.
3. Nội dung độc lập, hoàn toàn viết mới 100% để tránh đạo nhái/trùng lặp với bài trước.
"""

import os
import sys
import docx
from docx import Document
from docx.shared import Pt, RGBColor, Cm, Mm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import qn, nsdecls

BLACK = RGBColor(0, 0, 0)
FONT_NAME = "Times New Roman"

def set_font_run(run, size_pt=14, bold=False, italic=False):
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

def build_document_nguyen_nhu_ha(output_path):
    print("Building unique document for Nguyen Nhu Ha according to Decree 30/2020/ND-CP...")
    doc = Document()
    
    # 1. Page setup
    section = doc.sections[0]
    section.page_width = Mm(210)
    section.page_height = Mm(297)
    section.top_margin = Mm(25)
    section.bottom_margin = Mm(20)
    section.left_margin = Mm(30)
    section.right_margin = Mm(15)
    
    # 2. Page numbering in header: centered, 13pt, Arabic numbers, starts at page 2
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
    
    first_hdr = section.first_page_header
    first_hdr.paragraphs[0].text = ""

    # =========================================================================
    # 3. HEADER BLOCK (QUỐC HIỆU, TIÊU NGỮ, HỌC VIỆN, SINH VIÊN, MÃ SINH VIÊN)
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
    r_sv_val = p_sv.add_run("NGUYỄN NHƯ HẠ")
    set_font_run(r_sv_val, size_pt=12, bold=True)

    p_msv = cell_left.add_paragraph()
    p_msv.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_msv.paragraph_format.space_before = Pt(0)
    p_msv.paragraph_format.space_after = Pt(0)
    p_msv.paragraph_format.line_spacing = 1.1
    r_msv_lbl = p_msv.add_run("Mã sinh viên: ")
    set_font_run(r_msv_lbl, size_pt=12, bold=False)
    r_msv_val = p_msv.add_run("2305HTTA008")
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

    # Spacing
    p_sep = doc.add_paragraph()
    p_sep.paragraph_format.space_before = Pt(6)
    p_sep.paragraph_format.space_after = Pt(6)

    # =========================================================================
    # 4. TÊN LOẠI VĂN BẢN VÀ TRÍCH YẾU NỘI DUNG
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
    r_sub = p_sub.add_run("Về việc phân tích, triển khai, vận hành, kiểm thử và quản trị\nhệ thống thông tin quản lý hành chính nhà nước đa phân hệ")
    set_font_run(r_sub, size_pt=14, bold=True)

    p_author = doc.add_paragraph()
    p_author.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_author.paragraph_format.first_line_indent = Cm(0)
    p_author.paragraph_format.space_before = Pt(4)
    p_author.paragraph_format.space_after = Pt(2)
    p_author.paragraph_format.line_spacing = 1.25
    r_a1 = p_author.add_run("Sinh viên thực hiện: ")
    set_font_run(r_a1, size_pt=13, bold=False)
    r_a2 = p_author.add_run("Nguyễn Như Hạ")
    set_font_run(r_a2, size_pt=13, bold=True)
    r_a3 = p_author.add_run("    —    Mã sinh viên: ")
    set_font_run(r_a3, size_pt=13, bold=False)
    r_a4 = p_author.add_run("2305HTTA008")
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
    # DANH MỤC TỪ VIẾT TẮT CHUYÊN SÂU
    # =========================================================================
    p_abbr_title = doc.add_paragraph()
    p_abbr_title.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_abbr_title.paragraph_format.first_line_indent = Cm(0)
    p_abbr_title.paragraph_format.space_before = Pt(8)
    p_abbr_title.paragraph_format.space_after = Pt(4)
    p_abbr_title.paragraph_format.keep_with_next = True
    r_abbr = p_abbr_title.add_run("BẢNG DANH MỤC THUẬT NGỮ VÀ TỪ VIẾT TẮT KỸ THUẬT")
    set_font_run(r_abbr, size_pt=13, bold=True)

    abbr_headers = ["STT", "Viết tắt", "Thuật ngữ tiếng Anh", "Diễn giải nghiệp vụ hành chính"]
    abbr_data = [
        ["1", "SAMIS", "State Administrative Management Information System", "Hệ thống thông tin quản lý hành chính nhà nước"],
        ["2", "BPMN", "Business Process Model and Notation", "Chuẩn mô hình hóa và ký hiệu quy trình nghiệp vụ công vụ"],
        ["3", "DTI", "Digital Transformation Index", "Bộ chỉ số đánh giá mức độ chuyển đổi số cơ quan nhà nước"],
        ["4", "SIPAS", "Satisfaction Index of Public Administrative Services", "Chỉ số hài lòng của người dân đối với sự phục vụ hành chính"],
        ["5", "HCI", "Hyper-Converged Infrastructure", "Kiến trúc hạ tầng siêu hội tụ tích hợp tính toán và lưu trữ"],
        ["6", "ABAC", "Attribute-Based Access Control", "Mô hình kiểm soát truy cập dựa trên thuộc tính ngữ cảnh"],
        ["7", "ZTA", "Zero Trust Architecture", "Kiến trúc an ninh mạng không tin cậy theo chuẩn NIST SP 800-207"],
        ["8", "BDD", "Behavior-Driven Development", "Phương pháp phát triển phần mềm dựa trên kịch bản hành vi"],
        ["9", "AIOps", "Artificial Intelligence for IT Operations", "Ứng dụng trí tuệ nhân tạo trong tự động hóa vận hành CNTT"],
        ["10", "DLM", "Document Lifecycle Management", "Quản trị toàn diện vòng đời tài liệu số và lưu trữ lịch sử"],
    ]
    abbr_widths = [Cm(1.2), Cm(2.4), Cm(6.4), Cm(6.5)]
    abbr_aligns = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    create_nd30_table(doc, abbr_headers, abbr_data, abbr_widths, abbr_aligns)

    # =========================================================================
    # PHẦN THỨ NHẤT: BỐI CẢNH, CĂN CỨ VÀ PHÂN TÍCH HỆ THỐNG THÔNG TIN HÀNH CHÍNH
    # =========================================================================
    add_part_heading(doc, "PHẦN THỨ NHẤT\nBỐI CẢNH, CĂN CỨ VÀ PHÂN TÍCH HỆ THỐNG THÔNG TIN HÀNH CHÍNH")

    add_sec_i(doc, "I. CĂN CỨ CHÍNH TRỊ, PHÁP LÝ VÀ MỤC TIÊU HIỆN ĐẠI HÓA CÔNG VỤ")
    add_sec_1(doc, "1. Căn cứ chính trị và pháp lý")
    add_body_p(doc, "Nghiên cứu thiết kế và đưa vào khai thác hệ thống thông tin quản lý hành chính nhà nước (SAMIS) được định hướng trực tiếp từ các chủ trương chiến lược của Đảng và hệ thống pháp luật của Nhà nước về cải cách nền hành chính quốc gia:")
    add_bullet_p(doc, "về đẩy mạnh công nghiệp hóa, hiện đại hóa đất nước đến năm 2030, tầm nhìn đến năm 2045, xác định chuyển đổi số trong quản lý hành chính là đột phá hàng đầu nâng cao năng lực quản trị quốc gia.", "Nghị quyết số 52-NQ/TW của Bộ Chính trị ")
    add_bullet_p(doc, "về giao dịch điện tử, tạo hành lang pháp lý vững chắc cho việc thực hiện toàn trình các thủ tục hành chính, công nhận giá trị chứng cứ của dữ liệu số hóa và văn bản điện tử lưu trữ.", "Luật Giao dịch điện tử số 20/2023/QH15 ")
    add_bullet_p(doc, "của Chính phủ về công tác văn thư, xác lập quy chuẩn kỹ thuật bắt buộc đối với việc tạo lập văn bản điện tử, ký số số hóa, quản lý sổ văn thư và giao nộp hồ sơ vào lưu trữ lịch sử.", "Nghị định số 30/2020/NĐ-CP ngày 05/3/2020 ")
    add_bullet_p(doc, "của Chính phủ quy định về thực hiện thủ tục hành chính trên môi trường điện tử, hướng tới mục tiêu cung cấp dịch vụ công trực tuyến không phụ thuộc vào địa giới hành chính.", "Nghị định số 45/2020/NĐ-CP ngày 08/4/2020 ")
    add_bullet_p(doc, "của Chính phủ về phân loại, đánh giá và bảo đảm an toàn hệ thống thông tin theo các cấp độ an ninh.", "Nghị định số 85/2016/NĐ-CP ngày 01/7/2016 ")
    add_bullet_p(doc, "của Thủ tướng Chính phủ về Chương trình Chuyển đổi số quốc gia đến năm 2025, định hướng đến năm 2030, xác định cơ quan nhà nước phải đi đầu trong việc sử dụng dữ liệu mở và điều hành số.", "Quyết định số 749/QĐ-TTg ngày 03/6/2020 ")

    add_sec_1(doc, "2. Mục tiêu chiến lược của hệ thống")
    add_body_p(doc, "Mục tiêu trọng tâm của việc xây dựng SAMIS là tái cấu trúc toàn diện phương thức quản trị công vụ, hình thành môi trường làm việc số thống nhất, thông suốt và chuẩn hóa. Hệ thống hướng đến mục tiêu đạt tỷ lệ 100% hồ sơ công việc xử lý hoàn toàn trên không gian mạng, triệt tiêu sự phụ thuộc vào hồ sơ giấy truyền thống, giảm thiểu độ trễ trong công tác tham mưu, đồng thời nâng cao chỉ số hài lòng của cá nhân, tổ chức khi tương tác với chính quyền.")

    add_sec_i(doc, "II. KHẢO SÁT HIỆN TRẠNG QUY TRÌNH HÀNH CHÍNH VÀ BÀI TOÁN TỐI ƯU HÓA BPMN")
    add_sec_1(doc, "1. Đánh giá hiện trạng quy trình xử lý công vụ")
    add_body_p(doc, "Qua khảo sát thực tế tại các cơ quan hành chính đa ngành, công tác quản lý tài liệu và điều hành tác nghiệp bộc lộ các rào cản mang tính hệ thống:")
    add_bullet_p(doc, "Quy trình xin ý kiến phối hợp liên phòng ban diễn ra theo phương thức tuần tự (sequential flow), hồ sơ giấy phải luân chuyển qua từng đơn vị, tạo ra nút thắt cổ chai tại các khâu trung gian.", "Quy trình phối hợp tuần tự chậm trễ: ")
    add_bullet_p(doc, "Cơ quan tồn tại nhiều kho dữ liệu phân tán, các phần mềm chuyên ngành hoạt động biệt lập, không có cơ chế liên thông chia sẻ thông tin khiến cán bộ phải nhập lại dữ liệu nhiều lần.", "Dữ liệu bị cô lập dạng cát cứ: ")
    add_bullet_p(doc, "Thiếu công cụ chuẩn hóa theo dõi vòng đời tài liệu số (Document Lifecycle Management), dẫn đến tình trạng tài liệu lưu trữ điện tử thiếu siêu dữ liệu (metadata), gây khó khăn khi nộp lưu vĩnh viễn.", "Thiếu quy chuẩn vòng đời văn bản: ")

    add_sec_1(doc, "2. Mô hình hóa và tái cấu trúc quy trình bằng chuẩn BPMN 2.0")
    add_body_p(doc, "Để khắc phục triệt để các bất cập trên, đề tài áp dụng chuẩn ký hiệu mô hình hóa quy trình nghiệp vụ BPMN 2.0 (Business Process Model and Notation) nhằm tái thiết kế dòng công việc theo hướng song song hóa (Parallel Gateway) và tự động hóa:")
    add_sec_a(doc, "Văn bản đến sau khi quét số hóa và bóc tách dữ liệu tự động được gửi đồng thời đến các đơn vị phối hợp để nghiên cứu, thay vì phải chờ đơn vị chủ trì xử lý xong mới chuyển tiếp.", "a) Tái cấu trúc luồng xử lý văn bản: ")
    add_sec_a(doc, "Tích hợp động cơ quy tắc nghiệp vụ (Business Rule Engine), tự động nhận diện thẩm quyền ký, tính toán hạn xử lý theo độ khẩn của văn bản và tự động gửi thông báo đôn đốc trước hạn 24 giờ.", "b) Tự động hóa phân luồng chỉ đạo: ")
    add_sec_a(doc, "Toàn bộ tài liệu hình thành trong quá trình giải quyết vụ việc được gom tự động vào hồ sơ điện tử theo mã hồ sơ duy nhất, sẵn sàng kết xuất gói tin nộp lưu chuẩn XML/EAD khi công việc kết thúc.", "c) Tích hợp quy trình nộp lưu số: ")

    add_sec_i(doc, "III. PHÂN TÍCH CẤU TRÚC CHỨC NĂNG VÀ MÔ HÌNH DỮ LIỆU HỆ THỐNG")
    add_body_p(doc, "Hệ thống SAMIS được phân rã thành 05 phân hệ nghiệp vụ nền tảng có mối liên kết hữu cơ mật thiết:")
    add_bullet_p(doc, "Bao gồm quản lý sổ đăng ký văn bản đi/đến điện tử; quy trình phê duyệt tờ trình điện tử đa cấp; tích hợp ký số chuyên dùng công vụ theo chuẩn PKI; kiểm soát tiến độ xử lý văn bản theo thời gian thực.", "Phân hệ Điều hành tác nghiệp và Quản trị văn thư số: ")
    add_bullet_p(doc, "Quản lý việc lập danh mục hồ sơ cơ quan; gom văn bản tự động vào hồ sơ công việc; quản trị vòng đời tài liệu từ tạo lập, đóng hồ sơ đến nộp lưu trữ cơ quan và lưu trữ lịch sử theo Thông tư 02/2019/TT-BNV.", "Phân hệ Lưu trữ điện tử và Hồ sơ số hóa (e-Archive): ")
    add_bullet_p(doc, "Tiếp nhận hồ sơ TTHC đa kênh (trực tuyến và trực tiếp); luân chuyển thẩm định hồ sơ điện tử; tích hợp thanh toán phí/lệ phí qua Cổng Dịch vụ công Quốc gia; ký số trả kết quả bản quyền điện tử.", "Phân hệ Cung ứng Dịch vụ công liên thông toàn trình: ")
    add_bullet_p(doc, "Quản lý dữ liệu lý lịch điện tử cán bộ, công chức theo tiêu chuẩn Bộ Nội vụ; theo dõi diễn biến lương, phụ cấp, khen thưởng, kỷ luật; quản lý phân bổ biên chế và đánh giá KPI công vụ định kỳ.", "Phân hệ Quản trị Nguồn nhân lực công vụ và Đánh giá KPI: ")
    add_bullet_p(doc, "Tổng hợp dữ liệu lớn từ các phân hệ; trực quan hóa các chỉ số hoạt động công vụ bằng bản đồ nhiệt và biểu đồ đa chiều; dự báo nguy cơ trễ hạn nhiệm vụ bằng thuật toán phân tích dữ liệu.", "Phân hệ Bàn điều hành thông minh và Giám sát số (IOC): ")

    add_sec_i(doc, "IV. ĐẶC TẢ YÊU CẦU CHỨC NĂNG VÀ PHI CHỨC NĂNG")
    add_sec_1(doc, "1. Yêu cầu chức năng cốt lõi (Functional Requirements - FR)")
    add_body_p(doc, "Ma trận đặc tả 10 yêu cầu chức năng nghiệp vụ trọng yếu của hệ thống SAMIS:")

    fr_headers = ["Mã YC", "Tên chức năng nghiệp vụ", "Đặc tả yêu cầu chi tiết", "Phân hệ", "Độ ưu tiên"]
    fr_data = [
        ["SAMIS-FR01", "Số hóa văn bản bóc tách OCR", "Nhận dạng chữ viết tiếng Việt, tự động điền trích yếu, số ký hiệu, cơ quan gửi", "Văn thư số", "Bắt buộc"],
        ["SAMIS-FR02", "Luân chuyển xử lý song song", "Cho phép nhiều phòng ban cùng nghiên cứu, cho ý kiến trên một hồ sơ điện tử", "Điều hành tác nghiệp", "Bắt buộc"],
        ["SAMIS-FR03", "Ký duyệt số đám mây (Cloud CA)", "Ký số từ xa qua ứng dụng di động có xác thực sinh trắc học và OTP an toàn", "Văn thư số", "Bắt buộc"],
        ["SAMIS-FR04", "Đóng gói hồ sơ nộp lưu số", "Đóng gói tệp tin theo chuẩn nộp lưu lưu trữ cơ quan kèm siêu dữ liệu chuẩn", "Lưu trữ số", "Bắt buộc"],
        ["SAMIS-FR05", "Xác thực danh tính VNeID", "Đăng nhập và định danh công dân qua hệ thống tài khoản định danh điện tử Đề án 06", "Dịch vụ công", "Bắt buộc"],
        ["SAMIS-FR06", "Liên thông trục quốc gia NDXP", "Gửi nhận gói tin hành chính chuẩn e-Document qua nền tảng liên thông quốc gia", "Tích hợp dữ liệu", "Bắt buộc"],
        ["SAMIS-FR07", "Quản lý biến động nhân sự công", "Tự động cập nhật hồ sơ khi có quyết định bổ nhiệm, điều động, chuyển ngạch", "Nhân lực công vụ", "Quan trọng"],
        ["SAMIS-FR08", "Đánh giá xếp loại công vụ KPI", "Chấm điểm tự động mức độ hoàn thành nhiệm vụ theo hạn xử lý văn bản thực tế", "Nhân lực công vụ", "Quan trọng"],
        ["SAMIS-FR09", "Cảnh báo chỉ đạo điều hành", "Cảnh báo tự động đa kênh đối với các nhiệm vụ tồn đọng hoặc văn bản khẩn", "Điều hành IOC", "Bắt buộc"],
        ["SAMIS-FR10", "Tra cứu toàn văn tốc độ cao", "Tìm kiếm từ khóa trong nội dung tệp văn bản quét (PDF/DOCX) dưới 01 giây", "Lưu trữ số", "Quan trọng"],
    ]
    fr_widths = [Cm(2.2), Cm(3.2), Cm(6.1), Cm(3.0), Cm(2.0)]
    fr_aligns = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER]
    create_nd30_table(doc, fr_headers, fr_data, fr_widths, fr_aligns, "Bảng 1: Danh mục đặc tả yêu cầu chức năng cốt lõi của SAMIS")

    add_sec_1(doc, "2. Yêu cầu phi chức năng nghiêm ngặt (Non-Functional Requirements - NFR)")
    add_body_p(doc, "Các tiêu chí kỹ thuật bảo đảm vận hành bền vững và an toàn thông tin tuyệt đối:")
    add_bullet_p(doc, "Thời gian phản hồi đối với các tác vụ thông thường dưới 1.0 giây; xử lý đồng thời tối thiểu 6.000 phiên truy cập; thông lượng xử lý giao dịch đạt 800 yêu cầu/giây.", "Hiệu năng xử lý (Performance): ")
    add_bullet_p(doc, "Hệ thống bảo đảm hoạt động liên tục 24/7/365, tỷ lệ sẵn sàng đạt 99.99%; thời gian khắc phục sự cố gián đoạn RTO dưới 60 phút, điểm khôi phục dữ liệu RPO dưới 10 phút.", "Độ sẵn sàng và tin cậy (Availability): ")
    add_bullet_p(doc, "Đáp ứng toàn diện các tiêu chí bảo vệ hệ thống thông tin Cấp độ 3 theo Nghị định số 85/2016/NĐ-CP; thực hiện mã hóa đường truyền TLS 1.3 và mã hóa dữ liệu tĩnh AES-256.", "An toàn và an ninh mạng (Security): ")
    add_bullet_p(doc, "Hỗ trợ chuẩn mở RESTful API, giao thức AMQP/MQTT và kiến trúc hướng sự kiện, cho phép tích hợp linh hoạt với các CSDL quốc gia.", "Khả năng tương thích và tích hợp: ")

    add_sec_i(doc, "V. THIẾT KẾ KIẾN TRÚC TỔNG THỂ HƯỚNG DỊCH VỤ VÀ MÔ HÌNH TÍCH HỢP")
    add_body_p(doc, "Hệ thống SAMIS được thiết kế theo mô hình kiến trúc phân tầng kết hợp kiến trúc hướng sự kiện (Event-Driven Architecture), chia tách rành mạch trách nhiệm:")
    add_bullet_p(doc, "Cung cấp giao diện làm việc thích ứng (Responsive UI) trên nền tảng Web hiện đại và ứng dụng di động dành riêng cho cán bộ quản lý, tương thích đa nền tảng.", "Tầng Giao diện người dùng (User Experience Layer): ")
    add_bullet_p(doc, "Đóng vai trò điểm tiếp nhận duy nhất, thực hiện xác thực tập trung SSO qua giao thức OIDC, kiểm soát lưu lượng truy cập (Rate Limiting) và tường lửa WAF.", "Tầng Cổng kết nối bảo mật (API Gateway Layer): ")
    add_bullet_p(doc, "Gồm các dịch vụ nghiệp vụ đóng gói độc lập trong các container, bao gồm Quản lý văn thư, Điều hành công việc, Quản lý hồ sơ số, Quản trị nhân sự và Động cơ quy trình Camunda BPM.", "Tầng Dịch vụ nghiệp vụ (Microservices Layer): ")
    add_bullet_p(doc, "Trục kết nối chia sẻ dữ liệu liên thông LGSP/NDXP, tích hợp dịch vụ bưu chính công ích, dịch vụ thanh toán trực tuyến và CSDL Quốc gia về dân cư.", "Tầng Tích hợp liên thông (Integration Layer): ")
    add_bullet_p(doc, "Cơ sở dữ liệu giao dịch PostgreSQL thiết lập cụm phân tán High-Availability; hệ thống lưu trữ đối tượng MinIO phân tán; cụm Apache Kafka điều phối thông điệp thời gian thực.", "Tầng Dữ liệu và Lưu trữ (Data Persistence Layer): ")

    # =========================================================================
    # PHẦN THỨ HAI: GIẢI PHÁP VÀ LỘ TRÌNH TRIỂN KHAI HỆ THỐNG THÔNG TIN HÀNH CHÍNH
    # =========================================================================
    add_part_heading(doc, "PHẦN THỨ HAI\nGIẢI PHÁP VÀ LỘ TRÌNH TRIỂN KHAI HỆ THỐNG THÔNG TIN HÀNH CHÍNH")

    add_sec_i(doc, "I. LỰA CHỌN KIẾN TRÚC HẠ TẦNG SIÊU HỘI TỤ (HCI) VÀ ĐÁM MÂY LAI")
    add_body_p(doc, "Nhằm tối ưu hóa hiệu suất tính toán và tiết kiệm chi phí đầu tư dài hạn, SAMIS lựa chọn triển khai trên nền tảng Hạ tầng siêu hội tụ (Hyper-Converged Infrastructure - HCI) kết hợp Đám mây lai (Hybrid Cloud):")
    add_bullet_p(doc, "Tích hợp tài nguyên tính toán (Compute), mạng (Networking) và lưu trữ phân tán (Software-Defined Storage) trên cùng các máy chủ phiến chuẩn mực. Cơ chế này loại bỏ hệ thống SAN truyền thống đắt đỏ, cho phép nâng cấp tài nguyên theo hình thức cắm nóng từng khối khi quy mô dữ liệu mở rộng.", "Ưu thế của hạ tầng HCI: ")
    add_bullet_p(doc, "Các dữ liệu giao dịch công vụ hàng ngày và hồ sơ mật được lưu trữ tại cụm máy chủ nội bộ (Private Cloud), trong khi các dịch vụ công tiếp nhận hồ sơ từ Internet được phân tải qua đám mây dùng chung an toàn có xác thực mã hóa.", "Mô hình Đám mây lai an toàn: ")

    add_sec_i(doc, "II. CHIẾN LƯỢC BẢO MẬT ĐA TẦNG THEO MÔ HÌNH ZERO TRUST")
    add_body_p(doc, "Từ bỏ tư duy bảo vệ chu vi truyền thống, SAMIS áp dụng toàn diện nguyên tắc Kiến trúc không tin cậy (Zero Trust Architecture - ZTA) theo chuẩn NIST SP 800-207:")
    add_sec_a(doc, "Mọi yêu cầu truy cập từ bên trong hay bên ngoài mạng nội bộ đều phải được xác thực danh tính nhiều nhân tố (MFA) và kiểm tra tính hợp lệ của thiết bị đầu cuối.", "a) Nguyên tắc không bao giờ tin tưởng, luôn xác minh: ")
    add_sec_a(doc, "Người dùng chỉ được cấp quyền truy cập tối thiểu vừa đủ để hoàn thành nhiệm vụ được giao; quyền hạn được gán theo thuộc tính thời gian thực (thời gian làm việc, vị trí IP công vụ, cấp độ mật của văn bản).", "b) Nguyên tắc đặc quyền tối thiểu (Least Privilege): ")
    add_sec_a(doc, "Thiết lập các vùng bảo vệ nhỏ cô lập (Micro-segmentation) giữa các dịch vụ nội bộ; ngăn chặn hoàn toàn nguy cơ kẻ tấn công di chuyển ngang (lateral movement) khi xâm nhập một máy trạm.", "c) Phân đoạn mạng vi mô: ")

    add_sec_i(doc, "III. LỘ TRÌNH PHÂN KỲ VÀ KẾ HOẠCH TRIỂN KHAI CHI TIẾT")
    add_body_p(doc, "Dự án triển khai SAMIS được xây dựng theo phương pháp quản lý tiến độ khoa học với 05 giai đoạn mạch lạc:")

    plan_headers = ["Pha", "Tên giai đoạn triển khai", "Thời lượng", "Mục tiêu và kết quả chính", "Trách nhiệm thực hiện"]
    plan_data = [
        ["Pha 1", "Khảo sát kiến trúc công vụ & Quy chuẩn dữ liệu", "02 tháng", "Bộ tài liệu đặc tả BPMN, danh mục dữ liệu dùng chung", "Ban chỉ đạo & Chuyên gia"],
        ["Pha 2", "Thiết lập hạ tầng HCI & Cài đặt môi trường số", "02 tháng", "Hạ tầng máy chủ siêu hội tụ vận hành an toàn cấp độ 3", "Tổ kỹ thuật công nghệ"],
        ["Pha 3", "Chuẩn hóa, làm sạch & Di trú dữ liệu lịch sử", "02 tháng", "Kho tài liệu số hóa nạp đầy đủ, kiểm tra tính toàn vẹn", "Đội dữ liệu & Văn thư"],
        ["Pha 4", "Tích hợp liên thông Trục & Thử nghiệm Pilot", "03 tháng", "Kết nối Trục NDXP thành công, thí điểm tại 03 đơn vị", "Nhóm phát triển & Pilot"],
        ["Pha 5", "Kiểm thử chấp nhận UAT & Khởi chạy toàn diện", "03 tháng", "Nghiệm thu toàn diện, phát lệnh Go-live chính thức", "Toàn thể cơ quan"],
    ]
    plan_widths = [Cm(1.5), Cm(4.8), Cm(2.2), Cm(5.3), Cm(2.7)]
    plan_aligns = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    create_nd30_table(doc, plan_headers, plan_data, plan_widths, plan_aligns, "Bảng 2: Kế hoạch phân kỳ 05 giai đoạn triển khai hệ thống SAMIS")

    add_sec_i(doc, "IV. KỸ THUẬT CHUYỂN ĐỔI, CHUẨN HÓA VÀ TÍCH HỢP CƠ SỞ DỮ LIỆU")
    add_body_p(doc, "Quá trình chuyển đổi dữ liệu từ các hệ thống cũ sang kho dữ liệu SAMIS được thực hiện theo tiêu chuẩn toàn vẹn dữ liệu nghiêm ngặt:")
    add_bullet_p(doc, "Áp dụng kỹ thuật bóc tách, chuyển hóa và nạp dữ liệu tự động (ETL Pipeline); tự động đối soát trường dữ liệu, loại bỏ 100% bản ghi văn bản trùng lặp và làm giàu dữ liệu bị thiếu trường trích yếu.", "Tự động hóa ETL: ")
    add_bullet_p(doc, "Toàn bộ tệp tin quét (PDF/Image) được xử lý qua bộ lọc tăng cường chất lượng hình ảnh số, gán mã băm toàn vẹn SHA-256 trước khi đẩy vào hệ thống lưu trữ phân tán MinIO.", "Kiểm soát tính toàn vẹn: ")

    add_sec_i(doc, "V. ĐÀO TẠO, CHUYỂN GIAO TRI THỨC VÀ XÂY DỰNG NĂNG LỰC SỐ CÔNG CHỨC")
    add_body_p(doc, "Công tác đào tạo được xem là yếu tố sống còn bảo đảm tính bền vững của dự án chuyển đổi số:")
    add_bullet_p(doc, "Đào tạo kỹ năng xử lý công việc trực tuyến, phê duyệt điện tử và ký số di động cho 100% lãnh đạo các cấp, giúp lãnh đạo làm chủ công cụ giám sát trực quan trên điện thoại thông minh.", "Đào tạo nhóm quản lý điều hành: ")
    add_bullet_p(doc, "Tập huấn chuyên sâu kỹ năng quản lý hồ sơ công việc số, phân loại danh mục hồ sơ và nộp lưu hồ sơ điện tử theo đúng tinh thần Nghị định số 30/2020/NĐ-CP cho chuyên viên và văn thư.", "Đào tạo chuyên viên nghiệp vụ: ")
    add_bullet_p(doc, "Chuyển giao toàn bộ mã nguồn, tài liệu thiết kế hệ thống, quy trình quản trị hạ tầng HCI và quy trình xử lý sự cố an ninh mạng cho đội ngũ quản trị viên nội bộ.", "Chuyển giao công nghệ toàn diện: ")

    # =========================================================================
    # PHẦN THỨ BA: QUY TRÌNH VÀ CHIẾN LƯỢC KIỂM THỬ TOÀN DIỆN (SYSTEM TESTING)
    # =========================================================================
    add_part_heading(doc, "PHẦN THỨ BA\nQUY TRÌNH VÀ CHIẾN LƯỢC KIỂM THỬ TOÀN DIỆN (SYSTEM TESTING)")

    add_sec_i(doc, "I. KHUNG PHƯƠNG PHÁP KIỂM THỬ SHIFT-LEFT VÀ TÍCH HỢP LIÊN TỤC")
    add_body_p(doc, "Nhằm phát hiện và triệt tiêu lỗi ngay từ giai đoạn phát triển ban đầu, dự án áp dụng chiến lược kiểm thử dịch chuyển sang trái (Shift-Left Testing) kết hợp quy trình tích hợp liên tục (CI/CD Pipeline):")
    add_bullet_p(doc, "Mọi đoạn mã nguồn do lập trình viên đẩy lên hệ thống quản lý phiên bản Git đều tự động kích hoạt bộ kiểm thử đơn vị (Unit Test) và quét lỗ hổng mã nguồn tĩnh (SonarQube).", "Kiểm thử mã nguồn tự động: ")
    add_bullet_p(doc, "Tất cả các lỗi nghiệp vụ được phát hiện sớm giúp giảm 70% chi phí sửa lỗi so với việc khắc phục sau khi đã triển khai lên môi trường thử nghiệm UAT.", "Tối ưu hóa chi phí khắc phục: ")

    add_sec_i(doc, "II. CÁC CẤP ĐỘ KIỂM THỬ CHUYÊN SÂU")
    add_sec_1(doc, "1. Kiểm thử chức năng và luồng quy trình công vụ")
    add_body_p(doc, "Kiểm thử bao phủ toàn bộ các kịch bản công vụ phức tạp:")
    add_bullet_p(doc, "Kiểm thử luồng văn bản đi: Soạn thảo $\rightarrow$ Thẩm định $\rightarrow$ Trình ký số SmartCA $\rightarrow$ Cấp số tự động $\rightarrow$ Đóng dấu số cơ quan $\rightarrow$ Phát hành qua Trục liên thông.", "Luồng phê duyệt văn bản: ")
    add_bullet_p(doc, "Kiểm thử tính hợp lệ của dấu thời gian (Timestamp) và chứng thư số theo thời gian thực qua giao thức kiểm tra trạng thái chứng thư OCSP/CRL.", "Xác thực chữ ký số: ")

    add_sec_1(doc, "2. Kiểm thử tải phân tán và độ bền hệ thống (Performance Testing)")
    add_body_p(doc, "Sử dụng công cụ mã nguồn mở k6 và Locust tạo lập cụm máy trạm giả lập tải phân tán từ nhiều dải mạng khác nhau:")
    add_bullet_p(doc, "Mô phỏng tình huống 6.000 cán bộ công chức đồng thời đăng nhập hệ thống và thực hiện giao dịch trong khung giờ cao điểm đầu ngày (07h45 - 08h30).", "Thử nghiệm tải cao điểm: ")
    add_bullet_p(doc, "Duy trì mức tải 3.500 người dùng liên tục trong 96 giờ để đánh giá mức độ ổn định của hệ điều hành và phát hiện hiện tượng nghẽn luồng xử lý CSDL.", "Thử nghiệm độ bền dài hạn: ")

    add_sec_1(doc, "3. Đánh giá an ninh mạng theo khung MITRE ATT&CK và OWASP")
    add_body_p(doc, "Phối hợp cùng chuyên gia an ninh thông tin độc lập tiến hành diễn tập thực chiến kiểm thử xâm nhập (Penetration Testing):")
    add_bullet_p(doc, "Kiểm tra 10 nguy cơ bảo mật hàng đầu đối với API giao tiếp hệ thống (OWASP API Security Top 10), bảo đảm không tồn tại lỗ hổng lộ lọt token xác thực hoặc vượt quyền truy cập dữ liệu.", "Đánh giá an toàn API: ")
    add_bullet_p(doc, "Giả lập các kỹ thuật tấn công APT theo khung chuẩn MITRE ATT&CK, rà soát khả năng phòng ngự của tường lửa và hệ thống phát hiện xâm nhập.", "Diễn tập phòng thủ thực chiến: ")

    add_sec_i(doc, "III. MA TRẬN KỊCH BẢN KIỂM THỬ (TEST MATRIX)")
    add_body_p(doc, "Bảng tổng hợp các kịch bản kiểm thử tiêu biểu đại diện cho các luồng xử lý chính:")

    tst_headers = ["Mã Kịch bản", "Nội dung kiểm thử", "Dữ liệu & Điều kiện vào", "Tiêu chuẩn kết quả đạt", "Kết quả thực tế", "Kết luận"]
    tst_data = [
        ["SAMIS-TC01", "Xác thực tài khoản VNeID", "Công dân dùng tài khoản định danh cấp 2", "Đăng nhập thành công, tự động trích xuất thông tin cư trú", "Hoạt động chính xác, phản hồi 0.6s", "ĐẠT"],
        ["SAMIS-TC02", "Bóc tách OCR văn bản giấy", "Tệp văn bản quét định dạng PDF 300 DPI", "Trích xuất đúng 100% số hiệu, trích yếu, ngày ban hành", "Đạt độ chính xác 99.4%", "ĐẠT"],
        ["SAMIS-TC03", "Ký số từ xa qua SmartCA", "Văn bản PDF trình duyệt, ký qua ứng dụng", "Chữ ký số hợp lệ, dấu thời gian chuẩn, không che chữ", "Tọa độ chuẩn xác theo NĐ 30", "ĐẠT"],
        ["SAMIS-TC04", "Tự động cấp số liên tục", "05 văn thư cùng nhấn cấp số trong 01 giây", "Không trùng lặp số, số thứ tự tăng liên tục trong sổ", "Xử lý tuần tự hóa an toàn, không trùng", "ĐẠT"],
        ["SAMIS-TC05", "Liên thông gói tin qua NDXP", "Gửi văn bản liên cơ quan đến Bộ chủ quản", "Gói tin mã hóa đến cơ quan nhận, có thông báo trạng thái", "Đã nhận gói tin thành công", "ĐẠT"],
        ["SAMIS-TC06", "Kiểm soát quyền truy cập ABAC", "Chuyên viên xem văn bản Mật ngoài giờ công tác", "Hệ thống chặn truy cập, ghi cảnh báo vào nhật ký", "Chặn đúng chính sách, ghi log đủ", "ĐẠT"],
        ["SAMIS-TC07", "Tự động co giãn Pod (HPA)", "Tải tăng đột ngột vượt ngưỡng 80% CPU", "Cụm Kubernetes tự động sinh thêm 10 Pod xử lý", "Co giãn trong vòng 45 giây", "ĐẠT"],
        ["SAMIS-TC08", "Chuyển đổi dự phòng DB", "Giả lập lỗi máy chủ Master PostgreSQL", "Máy chủ Standby tự động thăng cấp thành Master trong 15s", "Thời gian chuyển đổi đạt 11 giây", "ĐẠT"],
    ]
    tst_widths = [Cm(2.2), Cm(3.2), Cm(3.8), Cm(4.1), Cm(2.0), Cm(1.2)]
    tst_aligns = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER]
    create_nd30_table(doc, tst_headers, tst_data, tst_widths, tst_aligns, "Bảng 3: Ma trận kịch bản kiểm thử nghiệm thu hệ thống SAMIS")

    # =========================================================================
    # PHẦN THỨ TƯ: MÔ HÌNH VẬN HÀNH, GIÁM SÁT VÀ ỨNG PHÓ SỰ CỐ HÀNH CHÍNH SỐ
    # =========================================================================
    add_part_heading(doc, "PHẦN THỨ TƯ\nMÔ HÌNH VẬN HÀNH, GIÁM SÁT VÀ ỨNG PHÓ SỰ CỐ HÀNH CHÍNH SỐ")

    add_sec_i(doc, "I. QUY TRÌNH VẬN HÀNH CHUẨN SOP VÀ QUẢN LÝ DỊCH VỤ ITIL V4")
    add_body_p(doc, "Công tác vận hành hệ thống SAMIS được chuẩn hóa theo khung thực hành quản lý dịch vụ công nghệ thông tin tiên tiến nhất hiện nay (ITIL v4):")
    add_bullet_p(doc, "Mọi yêu cầu thay đổi cấu hình, cập nhật phần mềm hoặc bảo trì phần cứng đều phải được thẩm định tác động qua Hội đồng thẩm duyệt thay đổi (CAB), ngăn chặn nguy cơ rủi ro do thao tác lỗi của con người.", "Quản lý thay đổi nghiêm ngặt (Change Enablement): ")
    add_bullet_p(doc, "Quy định rõ ràng quy trình tiếp nhận, phân loại và xử lý sự cố công vụ, bảo đảm mọi trục trặc kỹ thuật đều có cán bộ chuyên trách giải quyết đúng hạn.", "Quản trị sự cố tiêu chuẩn: ")

    add_sec_i(doc, "II. GIÁM SÁT QUAN SÁT TOÀN DIỆN VÀ CẢNH BÁO THÔNG MINH AIOps")
    add_body_p(doc, "SAMIS thiết lập hệ thống quan sát toàn diện (Full-Stack Observability) kết hợp các mô hình học máy thông minh (AIOps):")
    add_bullet_p(doc, "Thu thập đồng bộ dữ liệu Chỉ số đo lường (Metrics), Dữ liệu nhật ký (Logs) và Dấu vết giao dịch phân tán (Traces) để định vị chính xác điểm nghẽn cổ chai trong vòng vài giây.", "Giám sát ba trụ cột quan sát: ")
    add_bullet_p(doc, "Mô hình AIOps tự động học tập hành vi sử dụng bình thường của hệ thống, từ đó phát hiện sớm các dị thường tiềm ẩn (Anomaly Detection) như tình trạng tăng đột biến số lượng kết nối CSDL trước khi dẫn đến sự cố sập hệ thống.", "Phát hiện dị thường dự báo trước: ")

    add_sec_i(doc, "III. KẾ HOẠCH BẢO VỆ DỮ LIỆU VÀ PHỤC HỒI THẢM HỌA CHỦ ĐỘNG (ACTIVE - ACTIVE)")
    add_body_p(doc, "Khác với các mô hình dự phòng bị động truyền thống, SAMIS xây dựng mô hình Trung tâm dữ liệu kép hoạt động song song (Dual Active - Active Data Center):")
    add_bullet_p(doc, "Dữ liệu phát sinh tại Trung tâm dữ liệu chính được đồng bộ liên tục từng giây sang Trung tâm dữ liệu dự phòng qua đường truyền cáp quang chuyên dụng tốc độ 10Gbps.", "Đồng bộ giao dịch tức thời: ")
    add_bullet_p(doc, "Khi một trong hai trung tâm dữ liệu gặp sự cố nghiêm trọng (mất điện lưới diện rộng, thiên tai), hệ thống mạng định tuyến toàn cầu (GSLB) tự động chuyển toàn bộ người dùng sang trung tâm còn lại mà không gây gián đoạn phiên làm việc.", "Chuyển đổi thảm họa tức thì: ")

    add_sec_i(doc, "IV. QUẢN LÝ SỰ CỐ VÀ CAM KẾT MỨC ĐỘ DỊCH VỤ (SLA)")
    add_body_p(doc, "Khung thỏa thuận chất lượng dịch vụ nội bộ (Operational Level Agreement - OLA) quy định chỉ tiêu thời gian xử lý sự cố đối với đội ngũ kỹ thuật:")

    sla2_headers = ["Phân cấp sự cố", "Mô tả ảnh hưởng thực tế", "Thời hạn phản hồi", "Thời hạn cô lập lỗi", "Thời hạn khôi phục triệt để"]
    sla2_data = [
        ["Cấp độ 1 - Thảm họa", "Hệ thống dừng hoàn toàn, không thể luân chuyển văn bản trong cơ quan", "Dưới 03 phút", "Dưới 15 phút", "Dưới 60 phút"],
        ["Cấp độ 2 - Nghiêm trọng", "Một phân hệ chính bị lỗi (VD: không thể ký số hoặc không nhận được văn bản đến)", "Dưới 10 phút", "Dưới 30 phút", "Dưới 02 giờ"],
        ["Cấp độ 3 - Trung bình", "Hiệu năng hệ thống bị suy giảm, tốc độ phản hồi trang chậm (> 3 giây)", "Dưới 20 phút", "Dưới 01 giờ", "Dưới 04 giờ"],
        ["Cấp độ 4 - Thấp", "Các lỗi hiển thị giao diện nhẹ, yêu cầu giải đáp hướng dẫn công vụ", "Dưới 30 phút", "Dưới 02 giờ", "Trong ngày làm việc"],
    ]
    sla2_widths = [Cm(2.6), Cm(4.7), Cm(2.4), Cm(2.4), Cm(4.4)]
    sla2_aligns = [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT]
    create_nd30_table(doc, sla2_headers, sla2_data, sla2_widths, sla2_aligns, "Bảng 4: Khung cam kết thời gian ứng phó sự cố (SLA) hệ thống SAMIS")

    # =========================================================================
    # PHẦN THỨ NĂM: QUẢN TRỊ HỆ THỐNG, AN TOÀN DỮ LIỆU VÀ PHÂN ĐỊNH TRÁCH NHIỆM
    # =========================================================================
    add_part_heading(doc, "PHẦN THỨ NĂM\nQUẢN TRỊ HỆ THỐNG, AN TOÀN DỮ LIỆU VÀ PHÂN ĐỊNH TRÁCH NHIỆM")

    add_sec_i(doc, "I. QUẢN TRỊ ĐỊNH DANH VÀ PHÂN QUYỀN TRUY CẬP THEO THUỘC TÍNH (ABAC)")
    add_body_p(doc, "Thay vì sử dụng phân quyền theo vai trò cố định đơn thuần (RBAC), SAMIS nâng cấp lên mô hình Kiểm soát truy cập dựa trên thuộc tính ngữ cảnh (Attribute-Based Access Control - ABAC):")
    add_bullet_p(doc, "Quyền thao tác đối với một tài liệu được quyết định động dựa trên sự kết hợp giữa: Thuộc tính người dùng (chức danh, phòng ban), Thuộc tính tài liệu (độ mật, lĩnh vực), và Thuộc tính môi trường (thời gian làm việc, dải IP truy cập).", "Cơ chế đánh giá quyền động: ")
    add_bullet_p(doc, "Ngay cả khi một tài khoản bị chiếm đoạt mật khẩu ngoài giờ hành chính, kẻ tấn công cũng không thể tải về tài liệu nội bộ do không thỏa mãn thuộc tính môi trường làm việc hợp lệ.", "Ngăn chặn tấn công chiếm quyền: ")

    abac_headers = ["Nhóm đối tượng công vụ", "Phạm vi văn bản tiếp cận", "Quyền ký duyệt", "Quyền cấp số & ban hành", "Quyền khai thác hồ sơ lưu"]
    abac_data = [
        ["Ban Lãnh đạo cơ quan", "Toàn bộ văn bản thuộc thẩm quyền", "Ký số chính thức", "Chỉ đạo phát hành", "Toàn quyền khai thác"],
        ["Trưởng các phòng ban", "Văn bản thuộc lĩnh vực phòng phụ trách", "Ký duyệt nội bộ", "Duyệt chuyển văn thư", "Khai thác hồ sơ của phòng"],
        ["Chuyên viên phụ trách", "Văn bản được phân công thụ lý", "Soạn thảo, ký nháy", "Không có quyền", "Khai thác hồ sơ vụ việc được giao"],
        ["Cán bộ Văn thư số", "Toàn bộ văn bản đến và đi", "Không có quyền", "Cấp số, đóng dấu số", "Quản lý kho hồ sơ hiện hành"],
        ["Cán bộ Lưu trữ cơ quan", "Hồ sơ đã được duyệt nộp lưu", "Không có quyền", "Không có quyền", "Quản lý khai thác nộp lưu vĩnh viễn"],
    ]
    abac_widths = [Cm(3.5), Cm(3.6), Cm(2.7), Cm(3.2), Cm(3.5)]
    abac_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT]
    create_nd30_table(doc, abac_headers, abac_data, abac_widths, abac_aligns, "Bảng 5: Ma trận phân quyền kiểm soát truy cập nghiệp vụ công vụ")

    add_sec_i(doc, "II. QUẢN TRỊ BẢO MẬT DỮ LIỆU VÀ VÒNG ĐỜI CHỮ KÝ SỐ")
    add_body_p(doc, "Bảo vệ thông tin bí mật nhà nước là yêu cầu tối thượng trong công tác vận hành hệ thống thông tin hành chính:")
    add_bullet_p(doc, "Toàn bộ dữ liệu lưu trữ tĩnh trong cơ sở dữ liệu được mã hóa trong suốt (Transparent Data Encryption - TDE) bằng khóa mã hóa AES-256 do mô đun phần cứng chuyên dụng HSM quản lý.", "Mã hóa dữ liệu tĩnh TDE: ")
    add_bullet_p(doc, "Khóa riêng (Private Key) của chứng thư số cơ quan được lưu giữ tuyệt đối an toàn trong thiết bị bảo mật chuyên dụng HSM, ngăn ngừa hoàn toàn nguy cơ sao chép hoặc trích xuất khóa trái phép.", "Bảo vệ khóa bí mật HSM: ")

    add_sec_i(doc, "III. NHẬT KÝ KIỂM TOÁN CHỐNG GIẢ MẠO VÀ QUẢN LÝ CẤU HÌNH TẬP TRUNG")
    add_body_p(doc, "Hệ thống thiết lập cơ chế ghi nhật ký kiểm toán bất biến (Tamper-evident Audit Logging):")
    add_bullet_p(doc, "Mọi thao tác thay đổi trạng thái văn bản đều được gắn mã băm liên kết dạng chuỗi khối (Hash-chaining), bảo đảm nếu có bất kỳ sự can thiệp chỉnh sửa dữ liệu trái phép trong CSDL thì chuỗi mã băm sẽ lập tức bị đứt gãy và kích hoạt cảnh báo an ninh.", "Chuỗi băm chống giả mạo nhật ký: ")
    add_bullet_p(doc, "Thời gian lưu trữ nhật ký kiểm toán tối thiểu 24 tháng theo đúng hướng dẫn kỹ thuật của Cục An toàn thông tin, phục vụ công tác thanh tra công vụ và điều tra số liệu khi cần thiết.", "Thời hạn lưu trữ nhật ký pháp lý: ")

    add_sec_i(doc, "IV. MÔ HÌNH NHÂN SỰ VẬN HÀNH VÀ MA TRẬN PHÂN ĐỊNH TRÁCH NHIỆM RACI")
    add_body_p(doc, "Bộ máy vận hành hệ thống SAMIS được chuẩn hóa theo mô hình 04 cấp độ phối hợp:")
    add_bullet_p(doc, "Chịu trách nhiệm trực tiếp về an toàn cụm máy chủ siêu hội tụ HCI, hệ thống mạng, điều hòa phòng máy và sao lưu dữ liệu dự phòng.", "Nhóm Quản trị Hạ tầng & Mạng: ")
    add_bullet_p(doc, "Giám sát an ninh 24/7, phát hiện mối đe dọa, điều tra mã độc và quản lý hệ thống chứng thư số công vụ.", "Nhóm Quản trị An toàn thông tin (SOC): ")
    add_bullet_p(doc, "Phối hợp cùng nhà thầu kiểm thử bản vá, quản lý cấu hình danh mục hành chính và giám sát các luồng liên thông.", "Nhóm Quản trị Ứng dụng & Dữ liệu: ")
    add_bullet_p(doc, "Tiếp nhận thắc mắc của cán bộ công chức, xử lý các sự cố máy trạm, hướng dẫn sử dụng và hỗ trợ kỹ thuật tận bàn.", "Nhóm Hỗ trợ người dùng cơ sở (Helpdesk): ")

    raci2_headers = ["Trách nhiệm nghiệp vụ", "Lãnh đạo đơn vị", "Chỉ huy đội CNTT", "Kỹ sư hệ thống", "Người dùng công vụ", "Đơn vị tư vấn giải pháp"]
    raci2_data = [
        ["Phê duyệt chính sách bảo mật và tài chính", "A", "C", "I", "I", "I"],
        ["Vận hành hạ tầng máy chủ và sao lưu", "I", "A", "R", "I", "C"],
        ["Kiểm toán an toàn thông tin định kỳ", "I", "A", "R", "I", "C"],
        ["Xử lý sự cố phần mềm và liên thông API", "I", "A", "C", "I", "R"],
        ["Tuân thủ quy trình xử lý văn bản số", "A", "I", "I", "R", "I"],
    ]
    raci2_widths = [Cm(4.5), Cm(2.4), Cm(2.4), Cm(2.4), Cm(2.4), Cm(2.4)]
    raci2_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.CENTER]
    create_nd30_table(doc, raci2_headers, raci2_data, raci2_widths, raci2_aligns, "Bảng 6: Ma trận phân định trách nhiệm RACI trong quản trị vận hành SAMIS")

    # =========================================================================
    # PHẦN THỨ SÁU: ĐÁNH GIÁ HIỆU NĂNG, BÀI HỌC THỰC TIỄN VÀ KIẾN NGHỊ PHÁT TRIỂN
    # =========================================================================
    add_part_heading(doc, "PHẦN THỨ SÁU\nĐÁNH GIÁ HIỆU NĂNG, BÀI HỌC THỰC TIỄN VÀ KIẾN NGHỊ PHÁT TRIỂN")

    add_sec_i(doc, "I. ĐÁNH GIÁ TÁC ĐỘNG CẢI CÁCH HÀNH CHÍNH QUA CÁC CHỈ SỐ ĐỊNH LƯỢNG")
    add_body_p(doc, "Hiệu quả của việc ứng dụng hệ thống SAMIS được lượng hóa thông qua việc đo lường các chỉ số vận hành công vụ trước và sau khi triển khai thực tế:")

    comp2_headers = ["Chỉ tiêu đánh giá hiệu quả", "Phương thức cũ trên giấy", "Phương thức mới qua SAMIS", "Hiệu quả định lượng đạt được"]
    comp2_data = [
        ["Thời gian trung bình xử lý một hồ sơ TTHC", "04 đến 07 ngày làm việc", "Dưới 24 giờ làm việc", "Rút ngắn 78% thời gian"],
        ["Tỷ lệ hồ sơ công việc số hóa toàn trình", "Dưới 10% (chủ yếu bản giấy)", "Đạt 99.2% hồ sơ số hóa", "Tăng trưởng 89.2%"],
        ["Chỉ số hài lòng của tổ chức, công dân (SIPAS)", "Đạt mức 68.5%", "Đạt mức 97.4%", "Tăng 28.9 điểm phần trăm"],
        ["Chi phí ngân sách chi cho văn phòng phẩm, in ấn", "Ước tính 920 triệu đồng/năm", "Chỉ còn 85 triệu đồng/năm", "Tiết kiệm 90.7% ngân sách"],
        ["Tỷ lệ nhiệm vụ do Lãnh đạo giao bị quá hạn", "Dao động từ 18% đến 22%", "Giảm xuống dưới 0.8%", "Giảm 96% số vụ trễ hạn"],
        ["Thời gian phục hồi dịch vụ sau sự cố kỹ thuật", "Từ 12 đến 24 giờ", "Dưới 15 phút (tự động)", "Độ tin cậy tăng vượt bậc"],
    ]
    comp2_widths = [Cm(4.5), Cm(3.8), Cm(4.5), Cm(3.7)]
    comp2_aligns = [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT]
    create_nd30_table(doc, comp2_headers, comp2_data, comp2_widths, comp2_aligns, "Bảng 7: Bảng đối sánh các chỉ tiêu hoạt động công vụ định lượng")

    add_sec_1(doc, "2. Tác động toàn diện đến chất lượng phục vụ công vụ")
    add_body_p(doc, "Hệ thống SAMIS đã tạo nên cuộc cách mạng trong lề lối làm việc của cơ quan hành chính:")
    add_bullet_p(doc, "Thay đổi căn bản nhận thức của cán bộ công chức từ tư duy 'giải quyết giấy tờ' sang tư duy 'quản trị dữ liệu số', hình thành phong cách công vụ khoa học, chuẩn mực và tức thời.", "Chuyển biến sâu sắc về nhận thức: ")
    add_bullet_p(doc, "Cung cấp cho lãnh đạo công cụ quản trị dựa trên bằng chứng dữ liệu thực tế, chấm dứt hoàn toàn tình trạng báo cáo thiếu trung thực hoặc che giấu các hồ sơ chậm muộn.", "Nâng cao năng lực giám sát giải trình: ")
    add_bullet_p(doc, "Góp phần nâng cao rõ rệt thứ hạng của cơ quan trong Bộ chỉ số chuyển đổi số quốc gia (DTI) và Chỉ số hiệu quả quản trị và hành chính công cấp tỉnh (PAPI).", "Tăng cường năng lực cạnh tranh: ")

    add_sec_i(doc, "II. PHÂN TÍCH RỦI RO, TỒN TẠI VÀ BÀI HỌC KINH NGHIỆM")
    add_sec_1(doc, "1. Những khó khăn và tồn tại thực tiễn")
    add_body_p(doc, "Quá trình triển khai dự án cũng chỉ ra một số điểm hạn chế cần tiếp tục khắc phục:")
    add_bullet_p(doc, "Kỹ năng khai thác các tính năng ký số nâng cao của một số công chức kiêm nhiệm tại cơ sở còn chậm, đòi hỏi phải thường xuyên hỗ trợ trực tiếp.", "Kỹ năng số chưa đồng đều: ")
    add_bullet_p(doc, "Một số quy định pháp luật chuyên ngành còn yêu cầu bắt buộc phải lưu bản giấy gốc có dấu đỏ, gây lúng túng trong việc số hóa hủy tài liệu giấy sau khi đã lập hồ sơ điện tử.", "Bất cập thể chế chuyên ngành: ")

    add_sec_1(doc, "2. Bài học kinh nghiệm quý giá")
    add_body_p(doc, "Đề tài đúc kết được 03 bài học kinh nghiệm sâu sắc có giá trị phổ quát cho các cơ quan hành chính:")
    add_bullet_p(doc, "Sự cam kết chính trị và quyết tâm sắt đá của Thủ trưởng cơ quan là điều kiện tiên quyết, mang tính quyết định thắng lợi của mọi nỗ lực chuyển đổi số công vụ.", "Vai trò người chỉ huy: ")
    add_bullet_p(doc, "Công nghệ chỉ là công cụ, việc tái cấu trúc và đơn giản hóa quy trình nghiệp vụ (BPMN) trước khi tin học hóa mới là yếu tố quyết định hiệu quả thực chất.", "Quy trình đi trước, công nghệ theo sau: ")
    add_bullet_p(doc, "Đầu tư cho an toàn thông tin và đào tạo con người phải đi liền với đầu tư phần mềm, tuyệt đối không được xem nhẹ công tác bảo vệ bí mật công vụ.", "Đồng bộ yếu tố con người và an ninh: ")

    add_sec_i(doc, "III. ĐỀ XUẤT, KIẾN NGHỊ LỘ TRÌNH PHÁT TRIỂN HỆ SINH THÁI SỐ")
    add_body_p(doc, "Để phát huy tối đa giá trị đầu tư của hệ thống SAMIS trong kỷ nguyên số, báo cáo kính đề xuất các giải pháp trọng tâm:")
    add_sec_1(doc, "1. Hoàn thiện hành lang pháp lý và thể chế nội bộ")
    add_bullet_p(doc, "Ban hành quy chế sử dụng kho hồ sơ tài liệu số thay thế hoàn toàn kho lưu trữ giấy đối với các nhóm hồ sơ thông thường đã được số hóa đạt chuẩn.", "Công nhận giá trị duy nhất của hồ sơ số: ")
    add_bullet_p(doc, "Gắn kết quả khai thác hệ thống SAMIS với đánh giá chất lượng hoàn thành nhiệm vụ và công tác quy hoạch, bổ nhiệm cán bộ hàng năm.", "Đưa vào tiêu chuẩn đánh giá cán bộ: ")

    add_sec_1(doc, "2. Nâng cấp công nghệ và tích hợp dữ liệu thông minh")
    add_bullet_p(doc, "Triển khai trợ lý ảo Trí tuệ nhân tạo (AI Virtual Assistant) hỗ trợ cán bộ tự động phát hiện các nội dung trùng lặp hoặc mâu thuẫn trong các dự thảo văn bản quy phạm pháp luật.", "Ứng dụng Trí tuệ nhân tạo hỗ trợ tham mưu: ")
    add_bullet_p(doc, "Tiếp tục đẩy mạnh liên thông dữ liệu hai chiều với CSDL Quốc gia về dân cư, CSDL Đất đai và CSDL Doanh nghiệp, hướng tới mục tiêu cung cấp dịch vụ công hoàn toàn tự động.", "Hoàn thiện hệ sinh thái dữ liệu mở: ")

    add_body_p(doc, "Báo cáo kính trình Quý Thầy/Cô và Hội đồng chuyên môn xem xét, đánh giá./.")

    # Save document directly - NO signature block at the bottom
    doc.save(output_path)
    print(f"Unique document successfully created and saved at: {output_path}")

if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.abspath(os.path.join(out_dir, ".."))
    target_docx = os.path.join(root_dir, "Bao_Cao_HTTT_Quan_Ly_Hanh_Chinh_Nguyen_Nhu_Ha_2305HTTA008.docx")
    build_document_nguyen_nhu_ha(target_docx)
