# -*- coding: utf-8 -*-
"""
Hard-Gate Automated Assertion Engine (audit_vbhc.py)
Validates DOCX against vbhc-vietnamese-docx v1.5.0 rules.
"""

import os
import re
import sys
from collections import Counter
import docx
from docx.enum.section import WD_ORIENT
from docx.oxml.ns import qn

sys.stdout.reconfigure(encoding="utf-8")

BILINGUAL_BLOAT_REGEX = re.compile(
    r"\(\s*(?:"
    r"Homepage|Home|Checkout|Payment|Cart|Explore|Login|Sign\s*up|Register|Order|Menu|Promotions?|"
    r"Administrative\s+Management|Workflow|Functional\s+Requirements?|Non-Functional\s+Requirements?|"
    r"Performance|Availability|Security|Scalability|Presentation\s+Layer|Microservices\s+Layer|"
    r"Integration\s+Layer|Data\s+&\s+Storage|Private\s+Cloud|Hybrid\s+Cloud|Data\s+Center|"
    r"DMZ\s+Zone|Application\s+Zone|Database\s+Zone|Management\s+Zone|Data\s+Migration|"
    r"Data\s+Cleansing|ETL\s+Process|Change\s+Management|System\s+Testing|Testing|"
    r"Unit\s+Testing|Integration\s+Testing|Functional\s+Testing|Load\s+Test|Stress\s+Test|"
    r"Endurance\s+Test|Security\s+Pentest|Penetration\s+Test(?:ing)?|User\s+Acceptance\s+Testing|"
    r"Sample\s+Test\s+Matrix|Test\s+Matrix|Defect\s+Lifecycle|Critical|Major|Minor|Trivial|"
    r"Standard\s+Operating\s+Procedures?|Morning\s+Checklist|Evening\s+Checklist|"
    r"Backup\s*&\s*DR|Offsite|Full\s+Backup|Differential\s+Backup|Transaction\s+Log\s+Backup|"
    r"Single\s+Sign-On|Least\s+Privilege|Table\s+Partitioning|Indexing\s+Strategy|"
    r"Patch\s+Management|Rollback|AI\s+Assistant|User\s+Interface|User\s+Experience|"
    r"Role-Based\s+Access\s+Control|Attribute-Based\s+Access\s+Control|Zero\s+Trust\s+Architecture|"
    r"Business\s+Process|Hyper-Converged|Continuous\s+Integration|Shift-Left|Full-Stack\s+Observability|"
    r"Anomaly\s+Detection|Operational\s+Level\s+Agreement|Service\s+Level\s+Agreement|"
    r"Hardware\s+Security\s+Module|Public\s+Key\s+Infrastructure|Write\s+Once\s+Read\s+Many"
    r")[^)]*\)",
    re.IGNORECASE,
)

GENERIC_ENGLISH_PAREN_REGEX = re.compile(
    r"\([A-Za-z][A-Za-z0-9\s\-/&,.]{4,}\)"
)

AI_SLOP_PATTERNS = [
    r"đóng vai trò then chốt",
    r"ngọn hải đăng",
    r"đòn bẩy đột phá",
    r"bức tranh toàn cảnh",
    r"tấm gương phản chiếu",
    r"minh chứng rõ nét",
    r"bước tiến vượt bậc",
    r"đi sâu vào chi tiết",
    r"không thể không nhắc đến",
    r"nâng tầm trải nghiệm",
    r"mở rộng chân trời mới",
    r"bước ngoặt lịch sử",
    r"bứt phá vượt bậc",
    r"danh mục thực đơn",
    r"thời gian tiến độ",
    r"các phương án giải pháp",
    r"số lượng người dùng user",
]

FORBIDDEN_UNICODE_CHARS = ["\u2500", "\u2501", "\u2014", "\u2022", "\uf0d8", "\uf0a7", "\u25aa", "\u25ab"]


def is_data_table(table) -> bool:
    tblPr = table._tbl.tblPr
    if tblPr is None:
        return False
    borders = tblPr.find(qn("w:tblBorders"))
    if borders is None:
        return False
    top = borders.find(qn("w:top"))
    if top is not None and top.get(qn("w:val")) not in (None, "none", "nil"):
        return True
    return False


def audit_docx(docx_path: str) -> int:
    if not os.path.exists(docx_path):
        print(f"[FAIL] File not found: {docx_path}")
        return 1

    doc = docx.Document(docx_path)
    errors = []
    warnings = []

    for idx, section in enumerate(doc.sections):
        w_cm = section.page_width.cm if section.page_width else 0
        h_cm = section.page_height.cm if section.page_height else 0
        if section.orientation == WD_ORIENT.LANDSCAPE or w_cm > h_cm:
            errors.append(f"Section {idx}: Violates STRICT NO-LANDSCAPE RULE ({w_cm:.1f}x{h_cm:.1f}cm)")
        if abs(w_cm - 21.0) > 0.2 or abs(h_cm - 29.7) > 0.2:
            errors.append(f"Section {idx}: Non-standard A4 size ({w_cm:.2f}x{h_cm:.2f}cm)")
        if not section.different_first_page_header_footer:
            errors.append(f"Section {idx}: different_first_page_header_footer is not True")
        hdr_xml = section.header._element.xml
        if "PAGE" not in hdr_xml:
            errors.append(f"Section {idx}: Missing PAGE field in header")

    all_texts = []
    for p_idx, p in enumerate(doc.paragraphs):
        if p.text.strip():
            all_texts.append((f"Paragraph {p_idx + 1}", p.text))
        for r in p.runs:
            if r.text.strip():
                if r.font.name and r.font.name != "Times New Roman":
                    errors.append(f"Paragraph {p_idx + 1}: Font {r.font.name} != Times New Roman")
                if r.font.color and r.font.color.rgb and str(r.font.color.rgb) != "000000":
                    errors.append(f"Paragraph {p_idx + 1}: Color #{r.font.color.rgb} != #000000")

    for t_idx, table in enumerate(doc.tables):
        for r_idx, row in enumerate(table.rows):
            for c_idx, cell in enumerate(row.cells):
                txt = cell.text.strip()
                if txt:
                    all_texts.append((f"Table {t_idx + 1} [R{r_idx + 1}C{c_idx + 1}]", txt))
                for p in cell.paragraphs:
                    for r in p.runs:
                        if r.text.strip():
                            if r.font.name and r.font.name != "Times New Roman":
                                errors.append(f"Table {t_idx + 1} [R{r_idx + 1}C{c_idx + 1}]: Font {r.font.name} != Times New Roman")
                            if r.font.color and r.font.color.rgb and str(r.font.color.rgb) != "000000":
                                errors.append(f"Table {t_idx + 1} [R{r_idx + 1}C{c_idx + 1}]: Color #{r.font.color.rgb} != #000000")

    bullet_prefixes = []
    for loc, text in all_texts:
        m_bloat = BILINGUAL_BLOAT_REGEX.search(text)
        if m_bloat:
            errors.append(f"{loc}: Bilingual parenthetical bloat {m_bloat.group(0)}")

        m_gen = GENERIC_ENGLISH_PAREN_REGEX.search(text)
        if m_gen:
            errors.append(f"{loc}: English parenthetical phrase {m_gen.group(0)}")

        for slop in AI_SLOP_PATTERNS:
            if re.search(slop, text, flags=re.IGNORECASE):
                errors.append(f"{loc}: AI Slop / tautology phrase '{slop}'")

        for ch in FORBIDDEN_UNICODE_CHARS:
            if ch in text:
                errors.append(f"{loc}: Forbidden Unicode char U+{ord(ch):04X} ({ch})")

        if re.search(r"\s+[.,;:!?]", text):
            errors.append(f"{loc}: Extra space before punctuation")

        if loc.startswith("Paragraph"):
            m_pref = re.match(r"^[-+]\s+([^:]{2,40}):", text.strip())
            if m_pref:
                bullet_prefixes.append(m_pref.group(1).strip().lower())

    prefix_counts = Counter(bullet_prefixes)
    for pref, cnt in prefix_counts.items():
        if cnt >= 3:
            errors.append(f"Symmetry Boilerplate: Prefix '- {pref}:' repeated {cnt} times (>= 3)")

    data_table_count = 0
    for t_idx, table in enumerate(doc.tables):
        if not is_data_table(table):
            continue
        data_table_count += 1
        num_cols = len(table.columns)
        if num_cols > 5:
            errors.append(f"Table {t_idx + 1}: Has {num_cols} columns (> 5 columns on A4 Portrait)")

        hdr_trPr = table.rows[0]._tr.trPr
        if hdr_trPr is None or hdr_trPr.find(qn("w:tblHeader")) is None:
            errors.append(f"Table {t_idx + 1}: Missing <w:tblHeader/> on row 0")

        for r_idx, row in enumerate(table.rows):
            trPr = row._tr.trPr
            if trPr is None or trPr.find(qn("w:cantSplit")) is None:
                errors.append(f"Table {t_idx + 1} Row {r_idx + 1}: Missing <w:cantSplit/>")

        col_widths_cm = [cell.width.cm if cell.width else 0 for cell in table.rows[0].cells]
        total_w = sum(col_widths_cm)
        if abs(total_w - 16.5) > 0.3:
            warnings.append(f"Table {t_idx + 1}: Total width = {total_w:.2f}cm (target 16.50cm)")
        for c_idx, w_cm in enumerate(col_widths_cm):
            hdr_text = table.rows[0].cells[c_idx].text.strip().upper()
            if hdr_text in ("STT", "TT"):
                if not (1.0 <= w_cm <= 1.3):
                    errors.append(f"Table {t_idx + 1} Col {c_idx + 1} (STT): Width {w_cm:.2f}cm outside 1.0-1.2cm")
            else:
                if w_cm < 2.2:
                    errors.append(f"Table {t_idx + 1} Col {c_idx + 1} ({hdr_text}): Width {w_cm:.2f}cm < 2.2cm")

    print("=" * 72)
    print(f"HARD-GATE VBHC AUDIT REPORT: {os.path.basename(docx_path)}")
    print("=" * 72)
    print(f"- Total Sections: {len(doc.sections)} (100% A4 Portrait)")
    print(f"- Total Paragraphs: {len(doc.paragraphs)}")
    print(f"- Total Tables: {len(doc.tables)} (Data Tables: {data_table_count})")
    print(f"- Errors Found: {len(errors)}")
    print(f"- Warnings Found: {len(warnings)}")

    if warnings:
        print("\n[WARN] Warnings:")
        for w in warnings:
            print(f"  * {w}")

    if errors:
        print("\n[FAIL] Errors:")
        for e in errors[:25]:
            print(f"  [X] {e}")
        if len(errors) > 25:
            print(f"  ... and {len(errors) - 25} more errors.")
        return 1

    print("\n[OK] PASSED 100%: Document satisfies all VBHC v1.5.0 hard-gate assertions!")
    return 0


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "Bao_Cao_Phan_Tich_Trien_Khai_Van_Hanh_Kiem_Thu_Va_Quan_Tri_HTTT_Quan_Ly_Hanh_Chinh.docx"
    sys.exit(audit_docx(target))
