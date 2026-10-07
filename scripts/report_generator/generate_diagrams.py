# -*- coding: utf-8 -*-
"""
Script to generate all 37 academic UML and system architecture diagrams
for the HRMIS Major Assignment Report.
Uses matplotlib to produce high-resolution, vector-style diagrams at 300 DPI.
"""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Directory to save diagrams
OUT_DIR = os.path.join(os.path.dirname(__file__), 'diagrams')
os.makedirs(OUT_DIR, exist_ok=True)

# Configure default font
plt.rcParams['font.family'] = 'Times New Roman'
plt.rcParams['font.size'] = 10
plt.rcParams['axes.unicode_minus'] = False

def create_base_fig(width=10, height=6, dpi=300):
    fig, ax = plt.subplots(figsize=(width, height), dpi=dpi)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    return fig, ax

def draw_box(ax, x, y, w, h, title="", subtitle="", bg="#f8fafc", border="#334155", lw=1.5, title_color="#0f172a", title_size=10, title_weight="bold", sub_size=8, sub_color="#475569", corner=3):
    box = patches.FancyBboxPatch(
        (x, y), w, h,
        boxstyle=f"round,pad=0.5,rounding_size={corner}",
        facecolor=bg, edgecolor=border, linewidth=lw
    )
    ax.add_patch(box)
    if title and subtitle:
        ax.text(x + w/2, y + h*0.62, title, ha='center', va='center', fontsize=title_size, fontweight=title_weight, color=title_color)
        ax.text(x + w/2, y + h*0.28, subtitle, ha='center', va='center', fontsize=sub_size, color=sub_color)
    elif title:
        ax.text(x + w/2, y + h/2, title, ha='center', va='center', fontsize=title_size, fontweight=title_weight, color=title_color)
    return box

def draw_actor(ax, x, y, label="Actor", color="#1e293b"):
    # Head
    circle = patches.Circle((x, y + 5), 2.2, facecolor="#e2e8f0", edgecolor=color, lw=1.5)
    ax.add_patch(circle)
    # Body
    ax.plot([x, x], [y + 2.8, y - 2], color=color, lw=1.5)
    # Arms
    ax.plot([x - 3.5, x + 3.5], [y + 1, y + 1], color=color, lw=1.5)
    # Legs
    ax.plot([x, x - 2.5], [y - 2, y - 7], color=color, lw=1.5)
    ax.plot([x, x + 2.5], [y - 2, y - 7], color=color, lw=1.5)
    # Label
    ax.text(x, y - 9.5, label, ha='center', va='top', fontsize=9, fontweight='bold', color=color)

def draw_arrow(ax, x1, y1, x2, y2, label="", color="#334155", style="->", lw=1.2, label_pos=0.5, label_offset=(0, 2), linestyle="-"):
    ax.annotate(
        "", xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(arrowstyle=style, color=color, lw=lw, linestyle=linestyle, shrinkA=2, shrinkB=2)
    )
    if label:
        lx = x1 + (x2 - x1) * label_pos + label_offset[0]
        ly = y1 + (y2 - y1) * label_pos + label_offset[1]
        ax.text(lx, ly, label, ha='center', va='center', fontsize=8, color="#1e293b", backgroundcolor="#ffffff")

def draw_usecase_oval(ax, x, y, w=18, h=7, text="Use Case", code=""):
    oval = patches.Ellipse((x, y), w, h, facecolor="#f1f5f9", edgecolor="#0f766e", lw=1.5)
    ax.add_patch(oval)
    if code:
        ax.text(x, y + 1.2, f"<<{code}>>", ha='center', va='center', fontsize=7, color="#0f766e", fontweight='bold')
        ax.text(x, y - 1.2, text, ha='center', va='center', fontsize=8, color="#0f172a", fontweight='bold')
    else:
        ax.text(x, y, text, ha='center', va='center', fontsize=8, color="#0f172a", fontweight='bold')

# ==========================================
# 1. FIG 1.1: Sơ đồ cơ cấu tổ chức HTTT Corp
# ==========================================
def gen_fig_1_1():
    fig, ax = create_base_fig(11, 7)
    # Header box
    draw_box(ax, 32, 86, 36, 10, "ĐẠI HỘI ĐỒNG CỔ ĐÔNG & HỘI ĐỒNG QUẢN TRỊ", "Cơ quan quyết định chiến lược cao nhất", bg="#1e293b", border="#0f172a", title_color="#ffffff", sub_color="#94a3b8")
    draw_box(ax, 37, 68, 26, 9, "BAN TỔNG GIÁM ĐỐC (CEO)", "Điều hành toàn diện hoạt động doanh nghiệp", bg="#0f766e", border="#115e59", title_color="#ffffff", sub_color="#ccfbf1")
    draw_arrow(ax, 50, 86, 50, 77)

    # 6 functional blocks
    depts = [
        ("Ban Giám đốc Điều hành\n(BOD Office)", "Hoạch định & Thư ký HĐQT", 4, 38, 26, 18),
        ("Khối Công nghệ Thông tin\n(IT Department)", "Phát triển phần mềm & Hạ tầng", 37, 38, 26, 18),
        ("Khối Quản trị Nhân sự & ĐT\n(HR & Training)", "Tuyển dụng, Lương, Đào tạo, Kế nhiệm", 70, 38, 26, 18),
        ("Khối Tài chính Kế toán\n(Finance & Accounting)", "Quản lý dòng tiền, Thuế & Bảng lương", 4, 10, 26, 18),
        ("Khối Kinh doanh & PT Thị trường\n(Sales & BD)", "Phát triển khách hàng & Doanh số", 37, 10, 26, 18),
        ("Khối Tiếp thị & Truyền thông\n(Marketing & PR)", "Xây dựng thương hiệu & eNPS nội bộ", 70, 10, 26, 18),
    ]

    # Connecting lines from CEO
    draw_arrow(ax, 42, 68, 17, 56)
    draw_arrow(ax, 50, 68, 50, 56)
    draw_arrow(ax, 58, 68, 83, 56)

    for title, sub, x, y, w, h in depts:
        draw_box(ax, x, y, w, h, title, sub, bg="#f8fafc", border="#334155", title_color="#0f172a", title_size=9, sub_size=7.5)

    plt.savefig(os.path.join(OUT_DIR, "fig_1_1_org_chart.png"), bbox_inches='tight')
    plt.close()

# ==========================================
# 2. FIG 1.2: Sơ đồ Khối Quản trị Nhân sự
# ==========================================
def gen_fig_1_2():
    fig, ax = create_base_fig(11, 6)
    draw_box(ax, 35, 78, 30, 12, "TRƯỞNG PHÒNG NHÂN SỰ (HRD)", "Hoạch định chiến lược nguồn nhân lực toàn diện", bg="#1e293b", border="#0f172a", title_color="#ffffff", sub_color="#94a3b8")
    
    subs = [
        ("Bộ phận Thu hút Nhân tài\n(Talent Acquisition)", "Đăng tin, lọc CV, phỏng vấn,\nquản trị Kanban pipeline", 5, 30, 20, 28),
        ("Bộ phận Tiền lương & Phúc lợi\n(C&B Specialist)", "Chấm công, tính lương, BHXH,\nthuế TNCN, chế độ đãi ngộ", 28, 30, 20, 28),
        ("Bộ phận Đào tạo & Phát triển\n(L&D Specialist)", "Khóa đào tạo kỹ năng, hội nhập,\nkhảo sát eNPS doanh nghiệp", 52, 30, 20, 28),
        ("Bộ phận Quy hoạch & Tuân thủ\n(Succession & Compliance)", "Đánh giá 9-Box, quy hoạch kế nhiệm,\nkiểm toán luồng SOPs", 75, 30, 20, 28),
    ]

    for title, sub, x, y, w, h in subs:
        draw_box(ax, x, y, w, h, title, sub, bg="#f8fafc", border="#0f766e", title_color="#0f172a", title_size=8.5, sub_size=7.5)
        draw_arrow(ax, 50, 78, x + w/2, y + h)

    plt.savefig(os.path.join(OUT_DIR, "fig_1_2_hr_dept_structure.png"), bbox_inches='tight')
    plt.close()

# ==========================================
# 3. FIG 1.3: Mô hình tích hợp dòng thông tin HRMIS
# ==========================================
def gen_fig_1_3():
    fig, ax = create_base_fig(11, 7)
    # Center Hub
    draw_box(ax, 35, 40, 30, 20, "TRỤC DỮ LIỆU NHÂN SỰ TẬP TRUNG\n(HRMIS CORE PLATFORM)", "PostgreSQL Database 3NF & Next.js Engine", bg="#0f766e", border="#115e59", title_color="#ffffff", sub_color="#ccfbf1", title_size=9.5)

    modules = [
        ("TUYỂN DỤNG\n& KANBAN", 6, 75, 20, 14),
        ("HỒ SƠ NHÂN SỰ\n& PHÒNG BAN", 40, 75, 20, 14),
        ("CHẤM CÔNG\n& ĐIỂM DANH", 74, 75, 20, 14),
        ("NGHỈ PHÉP\n& PHÊ DUYỆT", 6, 12, 20, 14),
        ("TÍNH TOÁN\nBẢNG LƯƠNG", 40, 12, 20, 14),
        ("QUY HOẠCH CÁN BỘ\n& KIỂM TOÁN", 74, 12, 20, 14),
    ]

    for title, x, y, w, h in modules:
        draw_box(ax, x, y, w, h, title, "", bg="#f8fafc", border="#334155", title_color="#0f172a", title_size=8.5)

    # Connecting bi-directional arrows
    draw_arrow(ax, 16, 75, 38, 58, "Ứng viên trúng tuyển", style="<->")
    draw_arrow(ax, 50, 75, 50, 60, "Định danh nhân viên", style="<->")
    draw_arrow(ax, 84, 75, 62, 58, "Giờ công thực tế", style="<->")
    draw_arrow(ax, 16, 26, 38, 42, "Ngày phép hợp lệ", style="<->")
    draw_arrow(ax, 50, 26, 50, 40, "Thu nhập thực lĩnh", style="<->")
    draw_arrow(ax, 84, 26, 62, 42, "Nhật ký kiểm toán", style="<->")

    plt.savefig(os.path.join(OUT_DIR, "fig_1_3_hrmis_data_flow.png"), bbox_inches='tight')
    plt.close()

# ==========================================
# 4. FIG 2.1: Actor Hierarchy
# ==========================================
def gen_fig_2_1():
    fig, ax = create_base_fig(10, 6)
    draw_actor(ax, 50, 80, "Người dùng hệ thống\n(Authenticated User)")
    
    # 4 Sub-actors
    actors = [
        (15, 30, "Nhân viên\n(USER - Employee)"),
        (38, 30, "Trưởng phòng ban\n(MANAGER - Dept Head)"),
        (62, 30, "Chuyên viên Nhân sự\n(HR Specialist / HRD)"),
        (85, 30, "Quản trị viên tối cao\n(SYSTEM_ADMIN)"),
    ]

    for x, y, label in actors:
        draw_actor(ax, x, y, label)
        draw_arrow(ax, x, y + 10, 50, 65, style="->", color="#64748b")

    plt.savefig(os.path.join(OUT_DIR, "fig_2_1_actor_hierarchy.png"), bbox_inches='tight')
    plt.close()

# ==========================================
# 5. FIG 2.2: Use Case Overview
# ==========================================
def gen_fig_2_2():
    fig, ax = create_base_fig(11, 7.5)
    # Actors on left and right
    draw_actor(ax, 8, 70, "Quản trị viên\n(Admin)")
    draw_actor(ax, 8, 25, "Chuyên viên HR\n(HR)")
    draw_actor(ax, 92, 70, "Trưởng phòng\n(Manager)")
    draw_actor(ax, 92, 25, "Nhân viên\n(Employee)")

    # System boundary
    rect = patches.Rectangle((20, 5), 60, 90, facecolor="#ffffff", edgecolor="#0f766e", lw=2, linestyle="--")
    ax.add_patch(rect)
    ax.text(50, 92, "HỆ THỐNG THÔNG TIN QUẢN TRỊ NHÂN LỰC (HRMIS)", ha='center', va='center', fontsize=11, fontweight='bold', color="#0f766e")

    ucs = [
        (50, 84, "Đăng nhập & Xác thực đa tầng", "UC01"),
        (35, 74, "Quản trị Hồ sơ & Cơ cấu phòng ban", "UC02"),
        (65, 74, "Chấm công & Theo dõi chuyên cần", "UC03"),
        (35, 62, "Quản lý Nghỉ phép & Phê duyệt đơn từ", "UC04"),
        (65, 62, "Tính toán & Khóa bảng lương tháng", "UC05"),
        (35, 50, "Đăng tin & Tuyển dụng Kanban", "UC06"),
        (65, 50, "Ban hành Biến động nhân sự", "UC07"),
        (35, 38, "Tổ chức Đào tạo & Khảo sát eNPS", "UC08"),
        (65, 38, "Quy hoạch cán bộ & Ma trận 9-Box", "UC09"),
        (50, 26, "Kiểm soát Luồng SOPs & Nhật ký Audit", "UC10"),
        (50, 14, "Báo cáo Thống kê & Phân tích nhân lực", "UC11"),
    ]

    for x, y, text, code in ucs:
        draw_usecase_oval(ax, x, y, 26, 7.5, text, code)

    # Link lines
    draw_arrow(ax, 12, 70, 36, 84, style="-", color="#94a3b8")
    draw_arrow(ax, 12, 70, 22, 74, style="-", color="#94a3b8")
    draw_arrow(ax, 12, 70, 36, 26, style="-", color="#94a3b8")

    draw_arrow(ax, 12, 30, 22, 74, style="-", color="#94a3b8")
    draw_arrow(ax, 12, 30, 22, 62, style="-", color="#94a3b8")
    draw_arrow(ax, 12, 30, 52, 62, style="-", color="#94a3b8")
    draw_arrow(ax, 12, 30, 22, 50, style="-", color="#94a3b8")

    draw_arrow(ax, 88, 70, 78, 74, style="-", color="#94a3b8")
    draw_arrow(ax, 88, 70, 48, 62, style="-", color="#94a3b8")
    draw_arrow(ax, 88, 70, 78, 38, style="-", color="#94a3b8")

    draw_arrow(ax, 88, 30, 78, 74, style="-", color="#94a3b8")
    draw_arrow(ax, 88, 30, 48, 62, style="-", color="#94a3b8")

    plt.savefig(os.path.join(OUT_DIR, "fig_2_2_usecase_overview.png"), bbox_inches='tight')
    plt.close()

# ==========================================
# 6. Helper for Module Use Cases (FIG 2.3 to 2.11)
# ==========================================
def gen_module_usecase(filename, title, actor_left, actor_right, ucs):
    fig, ax = create_base_fig(10, 6)
    if actor_left:
        draw_actor(ax, 10, 50, actor_left)
    if actor_right:
        draw_actor(ax, 90, 50, actor_right)

    rect = patches.Rectangle((22, 8), 56, 84, facecolor="#ffffff", edgecolor="#0f766e", lw=1.8, linestyle="--")
    ax.add_patch(rect)
    ax.text(50, 88, title, ha='center', va='center', fontsize=9.5, fontweight='bold', color="#0f766e")

    for i, (text, code) in enumerate(ucs):
        y = 78 - i * (70 / max(len(ucs), 1))
        draw_usecase_oval(ax, 50, y, 32, 8, text, code)
        if actor_left:
            draw_arrow(ax, 14, 50, 34, y, style="-", color="#94a3b8")
        if actor_right:
            draw_arrow(ax, 86, 50, 66, y, style="-", color="#94a3b8")

    plt.savefig(os.path.join(OUT_DIR, filename), bbox_inches='tight')
    plt.close()

def gen_all_module_usecases():
    gen_module_usecase(
        "fig_2_3_usecase_employee.png",
        "PHÂN HỆ HỒ SƠ NHÂN SỰ & CƠ CẤU TỔ CHỨC",
        "Quản trị / HR", "Nhân viên",
        [
            ("Xem sơ đồ cây cơ cấu tổ chức Org Chart", "UC02.1"),
            ("Thêm mới & Cập nhật hồ sơ nhân sự", "UC02.2"),
            ("Tra cứu hồ sơ & Lọc theo phòng ban", "UC02.3"),
            ("Cập nhật thông tin tài khoản cá nhân", "UC02.4"),
            ("Phân quyền vai trò người dùng (RBAC)", "UC02.5"),
        ]
    )

    gen_module_usecase(
        "fig_2_4_usecase_attendance.png",
        "PHÂN HỆ CHẤM CÔNG & CHUYÊN CẦN",
        "Nhân viên", "Trưởng phòng / HR",
        [
            ("Điểm danh Check-in đầu ca làm việc", "UC03.1"),
            ("Điểm danh Check-out kết thúc ca", "UC03.2"),
            ("Tra cứu lịch sử chấm công cá nhân", "UC03.3"),
            ("Xem bảng tổng hợp chuyên cần toàn đơn vị", "UC03.4"),
            ("Báo cáo tỷ lệ đúng giờ / đi muộn", "UC03.5"),
        ]
    )

    gen_module_usecase(
        "fig_2_5_usecase_leave.png",
        "PHÂN HỆ QUẢN LÝ NGHỈ PHÉP & PHÊ DUYỆT",
        "Nhân viên", "Trưởng phòng / HR",
        [
            ("Tạo mới đơn xin nghỉ phép (Năm, ốm, riêng)", "UC04.1"),
            ("Theo dõi trạng thái đơn nghỉ phép cá nhân", "UC04.2"),
            ("Hủy đơn nghỉ phép khi chưa phê duyệt", "UC04.3"),
            ("Phê duyệt hoặc Từ chối đơn nghỉ phép", "UC04.4"),
            ("Tổng hợp quỹ phép và trừ công tự động", "UC04.5"),
        ]
    )

    gen_module_usecase(
        "fig_2_6_usecase_payroll.png",
        "PHÂN HỆ BẢNG CHẤM LƯƠNG & ĐÃI NGỘ",
        "Chuyên viên C&B", "Nhân viên / Quản lý",
        [
            ("Cấu hình thành phần lương (Phụ cấp, Thưởng)", "UC05.1"),
            ("Kích hoạt động cơ tính lương tự động", "UC05.2"),
            ("Rà soát bảng lương & Điều chỉnh thủ công", "UC05.3"),
            ("Phê duyệt & Khóa bảng lương tháng", "UC05.4"),
            ("Xuất bảng lương ra Excel & Tra cứu Payslip", "UC05.5"),
        ]
    )

    gen_module_usecase(
        "fig_2_7_usecase_recruitment.png",
        "PHÂN HỆ QUẢN TRỊ TUYỂN DỤNG & KANBAN",
        "Chuyên viên Tuyển dụng", "Ứng viên / Quản lý",
        [
            ("Đăng tin tuyển dụng mới lên hệ thống", "UC06.1"),
            ("Tiếp nhận hồ sơ ứng tuyển từ cổng Careers", "UC06.2"),
            ("Kéo thả ứng viên qua các giai đoạn Kanban", "UC06.3"),
            ("Lên lịch phỏng vấn & Gửi thư mời", "UC06.4"),
            ("Chuyển đổi ứng viên thành Nhân viên chính thức", "UC06.5"),
        ]
    )

    gen_module_usecase(
        "fig_2_8_usecase_changes.png",
        "PHÂN HỆ BIẾN ĐỘNG NHÂN SỰ",
        "Trưởng phòng / HR", "Ban Giám đốc",
        [
            ("Lập đề xuất điều chuyển phòng ban", "UC07.1"),
            ("Ban hành quyết định bổ nhiệm chức vụ", "UC07.2"),
            ("Điều chỉnh mức lương & Hợp đồng", "UC07.3"),
            ("Xử lý quy trình thôi việc & Bàn giao", "UC07.4"),
            ("Theo dõi báo cáo tỷ lệ luân chuyển (Turnover)", "UC07.5"),
        ]
    )

    gen_module_usecase(
        "fig_2_9_usecase_training.png",
        "PHÂN HỆ ĐÀO TẠO & KHẢO SÁT eNPS",
        "Chuyên viên L&D", "Toàn thể Nhân viên",
        [
            ("Thiết lập khóa đào tạo & Phân bổ học viên", "UC08.1"),
            ("Theo dõi tiến độ & Đánh giá kết quả khóa học", "UC08.2"),
            ("Tạo khảo sát đo lường mức độ gắn kết eNPS", "UC08.3"),
            ("Tham gia phản hồi khảo sát ẩn danh", "UC08.4"),
            ("Phân tích chỉ số hài lòng môi trường làm việc", "UC08.5"),
        ]
    )

    gen_module_usecase(
        "fig_2_10_usecase_succession.png",
        "PHÂN HỆ QUY HOẠCH CÁN BỘ & KẾ NHIỆM",
        "Trưởng phòng Nhân sự", "Ban Tổng Giám đốc",
        [
            ("Xác định danh mục vị trí trọng yếu (Key Roles)", "UC09.1"),
            ("Đánh giá nhân tài theo ma trận 9-Box Grid", "UC09.2"),
            ("Lập danh sách nhân sự kế nhiệm tiềm năng", "UC09.3"),
            ("Xây dựng lộ trình đào tạo bồi dưỡng cán bộ", "UC09.4"),
            ("Phê duyệt kế hoạch kế nhiệm chiến lược", "UC09.5"),
        ]
    )

    gen_module_usecase(
        "fig_2_11_usecase_audit.png",
        "PHÂN HỆ KIỂM TOÁN & QUY TRÌNH SOPs",
        "Chuyên viên Tuân thủ", "System Admin",
        [
            ("Tra cứu nhật ký thao tác người dùng (Audit Log)", "UC10.1"),
            ("Lọc sự kiện theo IP, thời gian và đối tượng", "UC10.2"),
            ("Giám sát luồng phê duyệt đa cấp theo SOPs", "UC10.3"),
            ("Xuất báo cáo kiểm toán phục vụ thanh tra", "UC10.4"),
            ("Cảnh báo vi phạm quyền truy cập bất thường", "UC10.5"),
        ]
    )

# ==========================================
# 7. Sequence Diagrams (FIG 2.12 to 2.19)
# ==========================================
def gen_sequence_diagram(filename, title, lifelines, messages):
    fig, ax = create_base_fig(11, 7)
    ax.text(50, 95, title, ha='center', va='center', fontsize=10.5, fontweight='bold', color="#0f766e")

    n = len(lifelines)
    xs = [12 + i * (76 / (n - 1)) for i in range(n)]

    # Draw lifelines
    for x, label in zip(xs, lifelines):
        draw_box(ax, x - 7, 84, 14, 7, label, "", bg="#1e293b", border="#0f172a", title_color="#ffffff", title_size=8)
        ax.plot([x, x], [84, 8], color="#94a3b8", linestyle="--", lw=1.2)

    # Draw messages
    step_y = 78
    dy = 70 / (len(messages) + 1)
    for sender_idx, receiver_idx, msg, is_return in messages:
        step_y -= dy
        x1, x2 = xs[sender_idx], xs[receiver_idx]
        linestyle = "--" if is_return else "-"
        color = "#0f766e" if not is_return else "#64748b"
        draw_arrow(ax, x1, step_y, x2, step_y, msg, color=color, style="->", lw=1.2, label_offset=(0, 2), linestyle=linestyle)

    plt.savefig(os.path.join(OUT_DIR, filename), bbox_inches='tight')
    plt.close()

def gen_all_sequence_diagrams():
    gen_sequence_diagram(
        "fig_2_12_seq_login.png",
        "BIỂU ĐỒ TRÌNH TỰ: ĐĂNG NHẬP & XÁC THỰC PHÂN QUYỀN RBAC (UC01)",
        ["Người dùng", "Giao diện Login", "Auth Controller", "Prisma Service", "PostgreSQL DB"],
        [
            (0, 1, "1. Nhập email & password", False),
            (1, 2, "2. Gửi credentials POST /api/auth", False),
            (2, 3, "3. findUnique(email) kèm role", False),
            (3, 4, "4. SELECT * FROM users WHERE email", False),
            (4, 3, "5. Trả về thông tin User & Password Hash", True),
            (2, 2, "6. bcrypt.compare(pass, hash)", False),
            (2, 1, "7. Cấp Session JWT kèm roleName", True),
            (1, 0, "8. Chuyển hướng Dashboard tương ứng", True),
        ]
    )

    gen_sequence_diagram(
        "fig_2_13_seq_employee.png",
        "BIỂU ĐỒ TRÌNH TỰ: TẠO MỚI HỒ SƠ NHÂN SỰ ĐIỆN TỬ (UC02)",
        ["Chuyên viên HR", "Employee Modal", "Employee API", "Prisma Service", "Database"],
        [
            (0, 1, "1. Nhập thông tin nhân sự & chức danh", False),
            (1, 2, "2. POST /api/employees (Body JSON)", False),
            (2, 2, "3. Kiểm tra quyền hạn Session (RBAC)", False),
            (2, 3, "4. createEmployee(data)", False),
            (3, 4, "5. INSERT INTO EmployeeProfile & User", False),
            (4, 3, "6. Bản ghi tạo thành công", True),
            (2, 1, "7. Trả về mã nhân viên EMPxxx", True),
            (1, 0, "8. Cập nhật bảng dữ liệu & Thông báo", True),
        ]
    )

    gen_sequence_diagram(
        "fig_2_14_seq_attendance.png",
        "BIỂU ĐỒ TRÌNH TỰ: ĐIỂM DANH CHẤM CÔNG CHECK-IN (UC03)",
        ["Nhân viên", "Attendance Page", "Attendance API", "Prisma Service", "Database"],
        [
            (0, 1, "1. Bấm nút Check-in điểm danh", False),
            (1, 2, "2. POST /api/attendance {type: IN}", False),
            (2, 2, "3. Lấy thời gian thực & xác định ca", False),
            (2, 3, "4. upsert(Attendance Record)", False),
            (3, 4, "5. INSERT INTO Attendance (status: PRESENT)", False),
            (4, 3, "6. Bản ghi chấm công lưu thành công", True),
            (2, 1, "7. Trả về trạng thái & Giờ check-in", True),
            (1, 0, "8. Hiển thị thông báo chấm công thành công", True),
        ]
    )

    gen_sequence_diagram(
        "fig_2_15_seq_leave.png",
        "BIỂU ĐỒ TRÌNH TỰ: ĐĂNG KÝ VÀ PHÊ DUYỆT ĐƠN NGHỈ PHÉP (UC04)",
        ["Nhân viên", "Trưởng phòng", "Leave Service", "Database", "Notification"],
        [
            (0, 2, "1. Gửi đơn xin nghỉ phép (Loại, Ngày)", False),
            (2, 3, "2. Lưu đơn trạng thái PENDING", False),
            (2, 1, "3. Thông báo đơn nghỉ mới cho Quản lý", True),
            (1, 2, "4. Xem xét và Bấm Phê duyệt (APPROVED)", False),
            (2, 3, "5. UPDATE LeaveRequest SET status=APPROVED", False),
            (2, 0, "6. Gửi thông báo kết quả duyệt cho Nhân viên", True),
        ]
    )

    gen_sequence_diagram(
        "fig_2_16_seq_payroll.png",
        "BIỂU ĐỒ TRÌNH TỰ: TÍNH TOÁN VÀ KHÓA BẢNG LƯƠNG THÁNG (UC05)",
        ["Chuyên viên C&B", "Payroll Page", "Payroll Engine", "Prisma Service", "Database"],
        [
            (0, 1, "1. Chọn Tháng/Năm & Bấm Tính lương", False),
            (1, 2, "2. POST /api/payroll/calculate", False),
            (2, 3, "3. Thu thập dữ liệu ngày công thực tế", False),
            (3, 4, "4. SELECT SUM(workDays) FROM Attendance", False),
            (2, 2, "5. Áp dụng công thức Lương - BHXH - Thuế", False),
            (2, 4, "6. INSERT/UPDATE Payroll Records", False),
            (2, 1, "7. Trả về bảng lương dự thảo", True),
            (0, 1, "8. Xác nhận và Khóa bất biến bảng lương", False),
            (1, 4, "9. UPDATE Payroll SET status='LOCKED'", False),
        ]
    )

    gen_sequence_diagram(
        "fig_2_17_seq_recruitment.png",
        "BIỂU ĐỒ TRÌNH TỰ: QUẢN TRỊ ỨNG VIÊN TUYỂN DỤNG KANBAN (UC06)",
        ["HR Tuyển dụng", "Kanban Board", "Application API", "Prisma Service", "Database"],
        [
            (0, 1, "1. Kéo thẻ ứng viên từ APPLIED sang INTERVIEW", False),
            (1, 2, "2. PATCH /api/recruitment/applications/{id}", False),
            (2, 3, "3. update({ status: 'INTERVIEW' })", False),
            (3, 4, "4. UPDATE Application SET status='INTERVIEW'", False),
            (4, 3, "5. Cập nhật cơ sở dữ liệu thành công", True),
            (2, 1, "6. Phản hồi 200 OK kèm thông tin ứng viên", True),
            (1, 0, "7. Cập nhật vị trí thẻ trực quan trên Kanban", True),
        ]
    )

    gen_sequence_diagram(
        "fig_2_18_seq_personnel_change.png",
        "BIỂU ĐỒ TRÌNH TỰ: BAN HÀNH QUYẾT ĐỊNH BIẾN ĐỘNG NHÂN SỰ (UC07)",
        ["Trưởng phòng HR", "Giao diện Biến động", "Personnel API", "Prisma Service", "Database"],
        [
            (0, 1, "1. Nhập thông tin bổ nhiệm/điều chuyển", False),
            (1, 2, "2. POST /api/personnel-changes", False),
            (2, 3, "3. Tạo bản ghi PersonnelChange", False),
            (3, 4, "4. INSERT INTO PersonnelChange", False),
            (2, 3, "5. Cập nhật phòng ban/chức danh mới trong Profile", False),
            (3, 4, "6. UPDATE EmployeeProfile SET departmentId/jobTitle", False),
            (2, 1, "7. Trả về quyết định thành công", True),
            (1, 0, "8. Hiển thị quyết định & Ghi vết Audit Log", True),
        ]
    )

    gen_sequence_diagram(
        "fig_2_19_seq_cadre_planning.png",
        "BIỂU ĐỒ TRÌNH TỰ: QUY HOẠCH CÁN BỘ & ĐÁNH GIÁ MA TRẬN 9-BOX (UC08)",
        ["Hội đồng Đánh giá", "Cadre Page", "Planning API", "Prisma Service", "Database"],
        [
            (0, 1, "1. Nhập điểm Năng lực & Tiềm năng", False),
            (1, 2, "2. POST /api/cadre-planning", False),
            (2, 2, "3. Tính toán tọa độ trong ma trận 9-Box", False),
            (2, 3, "4. create(SuccessionPlan)", False),
            (3, 4, "5. INSERT INTO SuccessionPlan", False),
            (4, 3, "6. Bản ghi quy hoạch lưu thành công", True),
            (2, 1, "7. Hiển thị nhân sự vào ô 9-Box tương ứng", True),
            (1, 0, "8. Hoàn tất cập nhật bản đồ kế nhiệm", True),
        ]
    )

# ==========================================
# 8. Activity Diagrams (FIG 2.20 to 2.26)
# ==========================================
def gen_activity_diagram(filename, title, steps):
    fig, ax = create_base_fig(9, 7)
    ax.text(50, 95, title, ha='center', va='center', fontsize=10, fontweight='bold', color="#0f766e")

    # Start node
    start = patches.Circle((50, 88), 2, facecolor="#0f172a", edgecolor="#0f172a")
    ax.add_patch(start)

    y = 88
    dy = 75 / (len(steps) + 1)
    prev_y = y

    for i, (text, is_decision) in enumerate(steps):
        y -= dy
        if is_decision:
            # Diamond
            diamond = patches.Polygon([[50, y+4], [62, y], [50, y-4], [38, y]], closed=True, facecolor="#fef3c7", edgecolor="#d97706", lw=1.5)
            ax.add_patch(diamond)
            ax.text(50, y, text, ha='center', va='center', fontsize=7.5, fontweight='bold', color="#92400e")
            draw_arrow(ax, 50, prev_y - 2, 50, y + 4)
            prev_y = y - 4
        else:
            # Rounded rect
            draw_box(ax, 30, y - 3, 40, 6, text, "", bg="#f8fafc", border="#334155", title_size=8)
            draw_arrow(ax, 50, prev_y, 50, y + 3)
            prev_y = y - 3

    # End node
    y -= dy
    draw_arrow(ax, 50, prev_y, 50, y + 2)
    end_outer = patches.Circle((50, y), 2.5, facecolor="#ffffff", edgecolor="#0f172a", lw=1.5)
    end_inner = patches.Circle((50, y), 1.5, facecolor="#0f172a", edgecolor="#0f172a")
    ax.add_patch(end_outer)
    ax.add_patch(end_inner)

    plt.savefig(os.path.join(OUT_DIR, filename), bbox_inches='tight')
    plt.close()

def gen_all_activity_diagrams():
    gen_activity_diagram(
        "fig_2_20_activity_employee.png",
        "BIỂU ĐỒ HOẠT ĐỘNG: TIẾP NHẬN & QUẢN LÝ HỒ SƠ NHÂN SỰ",
        [
            ("Tiếp nhận hồ sơ nhân viên mới trúng tuyển", False),
            ("Kiểm tra tính hợp lệ của hồ sơ (CCCD, Bằng cấp)", True),
            ("Nhập dữ liệu vào form hồ sơ nhân sự điện tử", False),
            ("Gán mã phòng ban và chỉ định chức danh công việc", False),
            ("Cấp tài khoản đăng nhập và gán vai trò RBAC", False),
            ("Lưu hồ sơ vào CSDL & Kích hoạt trạng thái ACTIVE", False),
        ]
    )

    gen_activity_diagram(
        "fig_2_21_activity_attendance.png",
        "BIỂU ĐỒ HOẠT ĐỘNG: QUY TRÌNH CHẤM CÔNG & XỬ LÝ CÔNG LỆCH",
        [
            ("Nhân viên truy cập hệ thống và bấm Check-in", False),
            ("Đối chiếu thời gian thực với khung giờ quy định", True),
            ("Ghi nhận trạng thái: PRESENT (Đúng giờ) hoặc LATE (Đi trễ)", False),
            ("Nhân viên thực hiện công việc trong ca", False),
            ("Hết ca: Nhân viên bấm Check-out ra về", False),
            ("Hệ thống tự động tính lũy kế số ngày công tháng", False),
        ]
    )

    gen_activity_diagram(
        "fig_2_22_activity_leave.png",
        "BIỂU ĐỒ HOẠT ĐỘNG: QUY TRÌNH DUYỆT ĐƠN NGHỈ PHÉP ĐA CẤP",
        [
            ("Nhân viên tạo đơn nghỉ phép trực tuyến", False),
            ("Kiểm tra số dư ngày phép năm còn lại", True),
            ("Gửi thông báo chờ duyệt đến Trưởng phòng", False),
            ("Trưởng phòng xem xét tính cấp thiết & Kế hoạch làm việc", True),
            ("Cập nhật trạng thái: APPROVED hoặc REJECTED", False),
            ("Đồng bộ dữ liệu sang phân hệ Chấm công & Tính lương", False),
        ]
    )

    gen_activity_diagram(
        "fig_2_23_activity_payroll.png",
        "BIỂU ĐỒ HOẠT ĐỘNG: QUY TRÌNH TÍNH TOÁN & KHÓA BẢNG LƯƠNG",
        [
            ("Chuyên viên C&B khởi tạo chu kỳ tính lương tháng", False),
            ("Tự động quét và tổng hợp ngày công từ Chấm công", False),
            ("Cộng phụ cấp chức vụ, ăn trưa & tiền thưởng thành tích", False),
            ("Trích trừ nghĩa vụ: BHXH/BHYT/BHTN (10.5%) & Thuế TNCN", False),
            ("Kế toán trưởng & Giám đốc nhân sự rà soát số liệu", True),
            ("Khóa bất biến bảng lương & Xuất phiếu lương điện tử", False),
        ]
    )

    gen_activity_diagram(
        "fig_2_24_activity_recruitment.png",
        "BIỂU ĐỒ HOẠT ĐỘNG: QUY TRÌNH TUYỂN DỤNG & KANBAN PIPELINE",
        [
            ("Phòng ban gửi phiếu yêu cầu tuyển dụng nhân sự", False),
            ("HR đăng tin tuyển dụng lên cổng thông tin Careers", False),
            ("Ứng viên nộp hồ sơ trực tuyến (Trạng thái APPLIED)", False),
            ("Sàng lọc hồ sơ và kéo sang cột INTERVIEW", False),
            ("Tổ chức phỏng vấn & Đánh giá năng lực ứng viên", True),
            ("Phát hành thư mời nhận việc (OFFER) & Ký hợp đồng (HIRED)", False),
        ]
    )

    gen_activity_diagram(
        "fig_2_25_activity_personnel_change.png",
        "BIỂU ĐỒ HOẠT ĐỘNG: QUY TRÌNH BIẾN ĐỘNG NHÂN SỰ & BỔ NHIỆM",
        [
            ("Phát sinh nhu cầu điều chuyển, bổ nhiệm hoặc tăng lương", False),
            ("Lập tờ trình đề xuất biến động nhân sự", False),
            ("Hội đồng quản trị / Ban Giám đốc phê duyệt đề xuất", True),
            ("Ban hành quyết định chính thức trên hệ thống", False),
            ("Tự động cập nhật phòng ban/mức lương mới vào Profile", False),
            ("Ghi nhận nhật ký biến động nhân sự vào lịch sử", False),
        ]
    )

    gen_activity_diagram(
        "fig_2_26_activity_succession.png",
        "BIỂU ĐỒ HOẠT ĐỘNG: QUY TRÌNH QUY HOẠCH CÁN BỘ & 9-BOX GRID",
        [
            ("Xác định danh mục vị trí lãnh đạo trọng yếu (Key Roles)", False),
            ("Đánh giá thành tích (Năng lực) & Tiềm năng phát triển", False),
            ("Định vị nhân sự vào 1 trong 9 ô ma trận 9-Box Grid", False),
            ("Nhân sự có thuộc nhóm Ngôi sao / Tiềm năng cao?", True),
            ("Lập kế hoạch kế nhiệm & Xây dựng lộ trình đào tạo đặc biệt", False),
            ("Phê duyệt danh sách quy hoạch nguồn cán bộ lãnh đạo", False),
        ]
    )

# ==========================================
# 9. State Machine Diagrams (FIG 2.27 to 2.30)
# ==========================================
def gen_state_diagram(filename, title, states):
    fig, ax = create_base_fig(11, 4.5)
    ax.text(50, 88, title, ha='center', va='center', fontsize=10, fontweight='bold', color="#0f766e")

    n = len(states)
    xs = [10 + i * (80 / (n - 1)) for i in range(n)]

    # Start
    start = patches.Circle((4, 50), 1.8, facecolor="#0f172a", edgecolor="#0f172a")
    ax.add_patch(start)
    draw_arrow(ax, 5.8, 50, xs[0] - 6, 50)

    for i, (name, desc) in enumerate(states):
        x = xs[i]
        draw_box(ax, x - 7, 40, 14, 20, name, desc, bg="#f1f5f9", border="#0f766e", title_size=8, sub_size=6.5)
        if i < n - 1:
            draw_arrow(ax, x + 7, 50, xs[i+1] - 7, 50, "tiếp theo", style="->", lw=1)

    # End
    draw_arrow(ax, xs[-1] + 7, 50, 95, 50)
    end_outer = patches.Circle((96.5, 50), 2.2, facecolor="#ffffff", edgecolor="#0f172a", lw=1.5)
    end_inner = patches.Circle((96.5, 50), 1.4, facecolor="#0f172a", edgecolor="#0f172a")
    ax.add_patch(end_outer)
    ax.add_patch(end_inner)

    plt.savefig(os.path.join(OUT_DIR, filename), bbox_inches='tight')
    plt.close()

def gen_all_state_diagrams():
    gen_state_diagram(
        "fig_2_27_state_employee.png",
        "BIỂU ĐỒ TRẠNG THÁI: VÒNG ĐỜI HỒ SƠ NHÂN VIÊN (EMPLOYEE LIFECYCLE)",
        [
            ("ONBOARDING", "Tiếp nhận\nthử việc"),
            ("ACTIVE", "Chính thức\nhoạt động"),
            ("PROBATION", "Kỳ hạn\nđánh giá"),
            ("SUSPENDED", "Tạm hoãn\nhợp đồng"),
            ("TERMINATED", "Đã chấm dứt\nthôi việc"),
        ]
    )

    gen_state_diagram(
        "fig_2_28_state_leave.png",
        "BIỂU ĐỒ TRẠNG THÁI: VÒNG ĐỜI ĐƠN NGHỈ PHÉP (LEAVE REQUEST LIFECYCLE)",
        [
            ("DRAFT", "Lập dự thảo\nđơn nghỉ"),
            ("PENDING", "Đang chờ\nquản lý duyệt"),
            ("REVIEWING", "HR kiểm tra\nquỹ phép"),
            ("APPROVED", "Đã chấp thuận\nchính thức"),
            ("REJECTED", "Bị từ chối\nhoặc hủy"),
        ]
    )

    gen_state_diagram(
        "fig_2_29_state_payroll.png",
        "BIỂU ĐỒ TRẠNG THÁI: VÒNG ĐỜI BẢNG LƯƠNG THÁNG (PAYROLL LIFECYCLE)",
        [
            ("INITIAL", "Khởi tạo\nchu kỳ tháng"),
            ("CALCULATED", "Đã tổng hợp\nngày công"),
            ("AUDITED", "Đã đối soát\nC&B & Kế toán"),
            ("APPROVED", "Lãnh đạo\nký duyệt"),
            ("LOCKED", "Đã khóa\nvà chi trả"),
        ]
    )

    gen_state_diagram(
        "fig_2_30_state_candidate.png",
        "BIỂU ĐỒ TRẠNG THÁI: VÒNG ĐỜI ỨNG VIÊN TUYỂN DỤNG (APPLICATION LIFECYCLE)",
        [
            ("APPLIED", "Nộp hồ sơ\nứng tuyển"),
            ("SCREENING", "Sàng lọc\nCV ban đầu"),
            ("INTERVIEW", "Phỏng vấn\nchuyên môn"),
            ("OFFER", "Gửi thư\nđề nghị việc"),
            ("HIRED", "Gia nhập\nchính thức"),
        ]
    )

# ==========================================
# 10. Package & Class Diagrams (FIG 2.31 to 2.35)
# ==========================================
def gen_package_diagram():
    fig, ax = create_base_fig(11, 7)
    ax.text(50, 94, "BIỂU ĐỒ GÓI PHÂN HỆ TỔNG QUAN HỆ THỐNG HRMIS (PACKAGE DIAGRAM)", ha='center', va='center', fontsize=10.5, fontweight='bold', color="#0f766e")

    packages = [
        ("Gói 1: Core & RBAC", ["User", "Role", "Session"], 6, 56),
        ("Gói 2: Organization", ["Department", "EmployeeProfile"], 38, 56),
        ("Gói 3: Time & Attendance", ["Attendance", "LeaveRequest"], 70, 56),
        ("Gói 4: Compensation & Benefit", ["Payroll", "SalaryComponent"], 6, 16),
        ("Gói 5: Talent Acquisition", ["JobPosting", "Application", "Interview"], 38, 16),
        ("Gói 6: Talent Development & Audit", ["PersonnelChange", "SuccessionPlan", "AuditLog"], 70, 16),
    ]

    for title, classes, x, y in packages:
        # Tab
        tab = patches.Rectangle((x, y + 26), 12, 4, facecolor="#0f766e", edgecolor="#0f766e")
        ax.add_patch(tab)
        # Main box
        draw_box(ax, x, y, 26, 26, title, "\n".join([f"+ {c}" for c in classes]), bg="#f8fafc", border="#0f766e", title_size=9, sub_size=8)

    # Dependencies
    draw_arrow(ax, 32, 69, 38, 69, "<<use>>")
    draw_arrow(ax, 64, 69, 70, 69, "<<use>>")
    draw_arrow(ax, 19, 56, 19, 42, "<<use>>")
    draw_arrow(ax, 51, 56, 51, 42, "<<use>>")
    draw_arrow(ax, 83, 56, 83, 42, "<<use>>")

    plt.savefig(os.path.join(OUT_DIR, "fig_2_31_package_diagram.png"), bbox_inches='tight')
    plt.close()

def gen_class_diagram_core():
    fig, ax = create_base_fig(11, 7)
    ax.text(50, 95, "BIỂU ĐỒ LỚP: PHÂN HỆ HỒ SƠ NHÂN SỰ & CƠ CẤU TỔ CHỨC", ha='center', va='center', fontsize=10, fontweight='bold', color="#0f766e")

    # 4 Classes
    draw_box(ax, 6, 50, 24, 38, "Role", "+ id: String\n+ name: String\n+ permissions: Json\n+ createdAt: DateTime\n----------------------\n+ assignRole()\n+ checkPermission()", bg="#ffffff", border="#0f766e", title_size=9, sub_size=7.5)
    draw_box(ax, 38, 50, 26, 38, "User", "+ id: String\n+ email: String\n+ password: Hash\n+ roleId: String\n+ employeeId: String\n----------------------\n+ authenticate()\n+ changePassword()", bg="#ffffff", border="#0f766e", title_size=9, sub_size=7.5)
    draw_box(ax, 72, 50, 24, 38, "Department", "+ id: String\n+ name: String\n+ description: String\n+ managerId: String\n----------------------\n+ addEmployee()\n+ getHeadcount()", bg="#ffffff", border="#0f766e", title_size=9, sub_size=7.5)
    draw_box(ax, 28, 6, 44, 36, "EmployeeProfile", "+ id: String | employeeCode: String | fullName: String\n+ phone: String | citizenId: String | birthDate: DateTime\n+ hireDate: DateTime | jobTitle: String | baseSalary: Decimal\n+ bankAccount: String | bankName: String | contractType: String\n----------------------------------------------------\n+ updateProfile() | calculateSeniority() | getManager()", bg="#ffffff", border="#0f766e", title_size=9, sub_size=7.5)

    # Relationships
    draw_arrow(ax, 30, 69, 38, 69, "1..* has", style="->")
    draw_arrow(ax, 50, 50, 50, 42, "1..1 profile", style="->")
    draw_arrow(ax, 72, 60, 64, 60, "manages", style="->")
    draw_arrow(ax, 72, 24, 72, 50, "belongs to", style="->")

    plt.savefig(os.path.join(OUT_DIR, "fig_2_32_class_core.png"), bbox_inches='tight')
    plt.close()

def gen_class_diagram_attendance_payroll():
    fig, ax = create_base_fig(11, 7)
    ax.text(50, 95, "BIỂU ĐỒ LỚP: PHÂN HỆ CHẤM CÔNG, NGHỈ PHÉP & TIỀN LƯƠNG", ha='center', va='center', fontsize=10, fontweight='bold', color="#0f766e")

    draw_box(ax, 6, 50, 26, 38, "Attendance", "+ id: String\n+ employeeId: String\n+ date: DateTime\n+ checkIn: DateTime\n+ checkOut: DateTime\n+ status: AttendanceStatus\n----------------------\n+ recordCheckIn()\n+ recordCheckOut()", bg="#ffffff", border="#0f766e", title_size=8.5, sub_size=7.5)
    draw_box(ax, 38, 50, 26, 38, "LeaveRequest", "+ id: String\n+ employeeId: String\n+ type: LeaveType\n+ startDate: DateTime\n+ endDate: DateTime\n+ status: LeaveStatus\n----------------------\n+ approve()\n+ reject()", bg="#ffffff", border="#0f766e", title_size=8.5, sub_size=7.5)
    draw_box(ax, 70, 50, 26, 38, "SalaryComponent", "+ id: String\n+ name: String\n+ type: ComponentType\n+ amountType: AmountType\n+ defaultVal: Decimal\n----------------------\n+ calculateAmount()", bg="#ffffff", border="#0f766e", title_size=8.5, sub_size=7.5)
    draw_box(ax, 28, 6, 44, 36, "Payroll", "+ id: String | employeeId: String | month: Int | year: Int\n+ baseSalary: Decimal | actualWorkDays: Decimal\n+ allowances: Decimal | bonuses: Decimal | deductions: Decimal\n+ netSalary: Decimal | status: PayrollStatus\n----------------------------------------------------\n+ calculateMonthly() | lockPayroll() | exportPayslip()", bg="#ffffff", border="#0f766e", title_size=8.5, sub_size=7.5)

    draw_arrow(ax, 19, 50, 35, 42, "calculates days", style="->")
    draw_arrow(ax, 50, 50, 50, 42, "deducts unpaid", style="->")
    draw_arrow(ax, 75, 50, 65, 42, "includes", style="->")

    plt.savefig(os.path.join(OUT_DIR, "fig_2_33_class_attendance_payroll.png"), bbox_inches='tight')
    plt.close()

def gen_class_diagram_talent_audit():
    fig, ax = create_base_fig(11, 7)
    ax.text(50, 95, "BIỂU ĐỒ LỚP: TUYỂN DỤNG, BIẾN ĐỘNG, QUY HOẠCH & KIỂM TOÁN", ha='center', va='center', fontsize=10, fontweight='bold', color="#0f766e")

    draw_box(ax, 4, 52, 22, 36, "JobPosting", "+ id: String\n+ title: String\n+ headcount: Int\n+ status: JobStatus\n------------------\n+ publishJob()", bg="#ffffff", border="#0f766e", title_size=8.5, sub_size=7)
    draw_box(ax, 28, 52, 22, 36, "Application", "+ id: String\n+ jobPostingId: String\n+ candidateName: String\n+ status: AppStatus\n------------------\n+ updateStage()", bg="#ffffff", border="#0f766e", title_size=8.5, sub_size=7)
    draw_box(ax, 52, 52, 22, 36, "PersonnelChange", "+ id: String\n+ employeeId: String\n+ changeType: String\n+ effectiveDate: Date\n------------------\n+ applyChange()", bg="#ffffff", border="#0f766e", title_size=8.5, sub_size=7)
    draw_box(ax, 76, 52, 22, 36, "SuccessionPlan", "+ id: String\n+ keyRoleTitle: String\n+ successorId: String\n+ readinessLevel: String\n+ boxPosition: String\n------------------\n+ assessCandidate()", bg="#ffffff", border="#0f766e", title_size=8.5, sub_size=7)

    draw_box(ax, 16, 8, 32, 34, "TrainingCourse & Survey", "+ id: String | title: String | type: String\n+ instructor: String | status: String\n+ eNpsScore: Float | respondentCount: Int\n------------------------------------\n+ conductTraining() | collectSurvey()", bg="#ffffff", border="#0f766e", title_size=8.5, sub_size=7)
    draw_box(ax, 54, 8, 38, 34, "AuditLog", "+ id: String | action: String | entity: String\n+ entityId: String | userId: String | ipAddress: String\n+ userAgent: String | details: Json | createdAt: Date\n------------------------------------\n+ logAction() | queryLogs()", bg="#ffffff", border="#0f766e", title_size=8.5, sub_size=7)

    draw_arrow(ax, 26, 70, 28, 70, "1..* has", style="->")

    plt.savefig(os.path.join(OUT_DIR, "fig_2_34_class_talent_audit.png"), bbox_inches='tight')
    plt.close()

def gen_domain_model():
    fig, ax = create_base_fig(11, 7.5)
    ax.text(50, 95, "BIỂU ĐỒ LỚP MIỀN CỐT LÕI CỦA HỆ THỐNG HRMIS (DOMAIN MODEL)", ha='center', va='center', fontsize=11, fontweight='bold', color="#0f766e")

    # Center Employee
    draw_box(ax, 38, 40, 24, 20, "EmployeeProfile", "+ employeeCode\n+ fullName\n+ jobTitle\n+ baseSalary", bg="#0f766e", border="#115e59", title_color="#ffffff", sub_color="#ccfbf1", title_size=9.5, sub_size=8)

    entities = [
        ("Department", 38, 74, 24, 14, "belongs to"),
        ("User", 6, 74, 22, 14, "authenticates"),
        ("Role", 6, 40, 22, 14, "assigned to"),
        ("Attendance", 6, 10, 22, 16, "records time"),
        ("LeaveRequest", 38, 10, 24, 16, "requests leave"),
        ("Payroll", 72, 10, 22, 16, "receives pay"),
        ("PersonnelChange", 72, 40, 22, 16, "undergoes"),
        ("SuccessionPlan", 72, 74, 22, 16, "nominated in"),
    ]

    for name, x, y, w, h, rel in entities:
        draw_box(ax, x, y, w, h, name, "", bg="#f8fafc", border="#334155", title_size=9)
        # connect to center
        cx, cy = x + w/2, y + h/2
        draw_arrow(ax, cx, cy, 50, 50, rel, style="->", color="#64748b", lw=1)

    plt.savefig(os.path.join(OUT_DIR, "fig_2_35_domain_model.png"), bbox_inches='tight')
    plt.close()

# ==========================================
# 11. Physical ERD & 3-Tier Architecture
# ==========================================
def gen_erd():
    fig, ax = create_base_fig(12, 8)
    ax.text(50, 96, "LƯỢC ĐỒ THỰC THỂ QUAN HỆ CƠ SỞ DỮ LIỆU VẬT LÝ (PHYSICAL ERD 3NF)", ha='center', va='center', fontsize=11, fontweight='bold', color="#0f766e")

    tables = [
        ("Role", ["PK id: text", "name: text (UK)", "permissions: jsonb"], 4, 70, 20, 20),
        ("User", ["PK id: text", "FK roleId: text", "email: text (UK)", "password: text"], 28, 70, 22, 20),
        ("Department", ["PK id: text", "name: text (UK)", "description: text", "FK managerId: text"], 54, 70, 22, 20),
        ("EmployeeProfile", ["PK id: text", "FK userId: text", "FK departmentId: text", "employeeCode: text (UK)", "fullName: text", "jobTitle: text", "baseSalary: numeric"], 34, 38, 32, 24),
        ("Attendance", ["PK id: text", "FK employeeId: text", "date: timestamp", "status: text"], 4, 10, 20, 20),
        ("LeaveRequest", ["PK id: text", "FK employeeId: text", "type: text", "status: text"], 27, 10, 20, 20),
        ("Payroll", ["PK id: text", "FK employeeId: text", "month: int, year: int", "netSalary: numeric", "status: text"], 50, 10, 22, 20),
        ("AuditLog", ["PK id: text", "action: text", "entity: text", "userId: text", "createdAt: timestamp"], 75, 10, 21, 20),
        ("JobPosting", ["PK id: text", "title: text", "FK departmentId: text", "status: text"], 78, 70, 18, 20),
        ("Application", ["PK id: text", "FK jobPostingId: text", "candidateName: text", "status: text"], 78, 42, 18, 20),
    ]

    for title, fields, x, y, w, h in tables:
        # Table Header
        th = patches.Rectangle((x, y + h - 5), w, 5, facecolor="#0f766e", edgecolor="#0f766e")
        ax.add_patch(th)
        ax.text(x + w/2, y + h - 2.5, title, ha='center', va='center', fontsize=8, fontweight='bold', color="#ffffff")
        # Table Body
        body = patches.Rectangle((x, y), w, h - 5, facecolor="#ffffff", edgecolor="#334155", lw=1.2)
        ax.add_patch(body)
        for fi, f in enumerate(fields):
            ax.text(x + 1, y + h - 7 - fi * 3.5, f, ha='left', va='top', fontsize=6.8, color="#0f172a")

    # Connect relationships
    draw_arrow(ax, 24, 80, 28, 80, "1..*")
    draw_arrow(ax, 38, 70, 42, 62, "1..1")
    draw_arrow(ax, 54, 75, 48, 62, "1..*")
    draw_arrow(ax, 40, 38, 14, 30, "1..*")
    draw_arrow(ax, 45, 38, 37, 30, "1..*")
    draw_arrow(ax, 55, 38, 60, 30, "1..*")
    draw_arrow(ax, 87, 70, 87, 62, "1..*")

    plt.savefig(os.path.join(OUT_DIR, "fig_2_36_erd.png"), bbox_inches='tight')
    plt.close()

def gen_architecture():
    fig, ax = create_base_fig(11, 7.5)
    ax.text(50, 95, "SƠ ĐỒ KIẾN TRÚC KỸ THUẬT HỆ THỐNG 3 TẦNG (3-TIER ENTERPRISE)", ha='center', va='center', fontsize=11, fontweight='bold', color="#0f766e")

    tiers = [
        ("TẦNG TRÌNH DIỄN (PRESENTATION LAYER)", [
            ("Web Dashboard (Next.js App Router)", "Quản lý điều hành đa phân hệ"),
            ("Employee Self-Service (ESS Portal)", "Chấm công, xin phép, tra cứu lương"),
            ("Careers Portal (Public Job Board)", "Nộp hồ sơ ứng tuyển trực tuyến"),
            ("Tailwind CSS v4 (Corporate Slate Theme)", "Dark / Light Mode chuẩn mực"),
        ], 6, 68, 88, 22),
        ("TẦNG NGHIỆP VỤ & ĐIỀU HƯỚNG (BUSINESS LOGIC LAYER)", [
            ("Next.js 16 API Route Handlers", "RESTful APIs chuẩn hóa 15+ endpoints"),
            ("Auth.js v5 (NextAuth RBAC Engine)", "Xác thực Session & Phân quyền 4 cấp"),
            ("Payroll & Attendance Engines", "Tính toán tự động ngày công & tiền lương"),
            ("Audit & Compliance Middleware", "Ghi vết kiểm toán và luồng phê duyệt"),
        ], 6, 38, 88, 22),
        ("TẦNG LƯU TRỮ DỮ LIỆU (DATA PERSISTENCE LAYER)", [
            ("Prisma ORM v7 Client", "Data Mapping & Migrations an toàn"),
            ("PostgreSQL 16 Database (Port 54321)", "Quan hệ 3NF, Khóa ngoại, Chỉ mục Index"),
            ("Docker Container Service", "Đóng gói đồng bộ môi trường phát triển"),
            ("Audit Trail & Backup Logs", "Lưu trữ lịch sử giao dịch bất biến"),
        ], 6, 8, 88, 22),
    ]

    for tier_title, items, x, y, w, h in tiers:
        # Tier boundary
        draw_box(ax, x, y, w, h, "", "", bg="#f8fafc", border="#0f766e", lw=1.5)
        ax.text(x + 3, y + h - 3, tier_title, ha='left', va='top', fontsize=8.5, fontweight='bold', color="#0f766e")
        # Sub items
        for ii, (it_title, it_desc) in enumerate(items):
            ix = x + 3 + ii * 21.5
            draw_box(ax, ix, y + 2, 20, 13, it_title, it_desc, bg="#ffffff", border="#94a3b8", title_size=7.5, sub_size=6.5)

    # Inter-tier communication arrows
    draw_arrow(ax, 50, 68, 50, 60, "HTTPS / JSON Payload", style="<->")
    draw_arrow(ax, 50, 38, 50, 30, "Prisma Engine TCP / Port 54321", style="<->")

    plt.savefig(os.path.join(OUT_DIR, "fig_2_37_architecture.png"), bbox_inches='tight')
    plt.close()

def main():
    print("Generating all 37 high-resolution diagrams...")
    gen_fig_1_1()
    gen_fig_1_2()
    gen_fig_1_3()
    gen_fig_2_1()
    gen_fig_2_2()
    gen_all_module_usecases()
    gen_all_sequence_diagrams()
    gen_all_activity_diagrams()
    gen_all_state_diagrams()
    gen_package_diagram()
    gen_class_diagram_core()
    gen_class_diagram_attendance_payroll()
    gen_class_diagram_talent_audit()
    gen_domain_model()
    gen_erd()
    gen_architecture()
    print("All diagrams generated successfully!")

if __name__ == '__main__':
    main()
