# -*- coding: utf-8 -*-
"""
Generate 3 high-resolution (300 DPI) technical diagrams and operational dashboards
for the Administrative Management Information System (HTTT Quản lý Hành chính) report.
Complies 100% with Section 5 of vbhc-vietnamese-docx/SKILL.md:
- Donut chart: no explode, small slices <= 8% in side Legend only, center summary metric.
- Radar chart: ylim padded +20% (0..120 for max 100), custom outer label radius so labels never touch circle or title.
- Multi-subplot spacing: wspace >= 0.45, hspace >= 0.45, zero text collision.
- Color palette: Navy #1E3A8A, Teal #0D9488, Emerald #10B981, Amber #F59E0B, Slate #64748B.
"""

import os
import sys
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

sys.stdout.reconfigure(encoding="utf-8")

plt.rcParams["font.sans-serif"] = ["Arial", "Segoe UI", "Tahoma", "DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "amis_diagrams")
os.makedirs(OUT_DIR, exist_ok=True)

NAVY = "#1E3A8A"
TEAL = "#0D9488"
EMERALD = "#10B981"
AMBER = "#F59E0B"
SLATE = "#64748B"
DARK = "#0F172A"
BORDER = "#CBD5E1"


def draw_box(ax, x, y, w, h, title, subtitle="", facecolor="#FFFFFF", edgecolor=NAVY, title_color=NAVY, lw=1.3):
    box = FancyBboxPatch(
        (x, y), w, h,
        boxstyle="round,pad=0.003,rounding_size=0.014",
        facecolor=facecolor, edgecolor=edgecolor, linewidth=lw
    )
    ax.add_patch(box)
    if subtitle:
        ax.text(x + w / 2, y + h * 0.65, title, ha="center", va="center",
                fontsize=9.0, fontweight="bold", color=title_color)
        ax.text(x + w / 2, y + h * 0.30, subtitle, ha="center", va="center",
                fontsize=7.6, color="#334155")
    else:
        ax.text(x + w / 2, y + h / 2, title, ha="center", va="center",
                fontsize=9.0, fontweight="bold", color=title_color)


def generate_fig1_architecture():
    """Hình 1: Sơ đồ kiến trúc phân tầng và phân vùng mạng an toàn hệ thống thông tin quản lý hành chính."""
    fig, ax = plt.subplots(figsize=(13.0, 8.2), dpi=300)
    ax.set_xlim(0, 1.0)
    ax.set_ylim(0, 1.0)
    ax.axis("off")
    fig.patch.set_facecolor("#FFFFFF")

    ax.text(0.5, 0.968, "KIẾN TRÚC PHÂN TẦNG & PHÂN VÙNG MẠNG AN TOÀN HỆ THỐNG THÔNG TIN HÀNH CHÍNH",
            ha="center", va="center", fontsize=12.5, fontweight="bold", color=DARK)
    ax.text(0.5, 0.935, "Tuân thủ Khung Kiến trúc Chính phủ số Việt Nam, Nghị định 30/2020/NĐ-CP và An toàn thông tin Cấp độ 3",
            ha="center", va="center", fontsize=9.0, style="italic", color=SLATE)

    layers = [
        (0.76, 0.13, "TẦNG GIAO DIỆN\nTRÌNH DIỄN", "#EFF6FF", NAVY, [
            ("Cổng Điều hành Nội bộ", "Trình duyệt Web mã hóa TLS 1.3"),
            ("Cổng Dịch vụ công", "Tiếp nhận hồ sơ trực tuyến"),
            ("Ứng dụng Di động", "Ký số từ xa & Duyệt văn bản"),
            ("Bàn Điều hành Số", "Giám sát chỉ tiêu thời gian thực"),
        ]),
        (0.58, 0.13, "VÙNG MẠNG BIÊN DMZ\n& CỔNG XÁC THỰC", "#F0FDFA", TEAL, [
            ("Tường lửa Ứng dụng WAF", "Chống tấn công & Lọc gói tin"),
            ("Cổng Điều phối API", "Cân bằng tải & Giới hạn lưu lượng"),
            ("Định danh Tập trung", "Đăng nhập một lần & Xác thực 2 lớp"),
            ("Bộ Kiểm soát Đường dẫn", "Phân quyền đa tầng theo vai trò"),
        ]),
        (0.38, 0.15, "VÙNG ỨNG DỤNG NỘI BỘ\n(5 PHÂN HỆ NGHIỆP VỤ)", "#ECFDF5", EMERALD, [
            ("Văn thư & Điều hành", "Vào sổ, phân luồng, ký số cơ quan"),
            ("Hồ sơ & Lưu trữ số", "Lập danh mục, đóng gói nộp lưu"),
            ("Một cửa liên thông", "Giải quyết thủ tục hành chính"),
            ("Quản trị Nhân lực công", "Hồ sơ, chấm công, lương, đánh giá"),
        ]),
        (0.20, 0.13, "TẦNG TÍCH HỢP\n& LIÊN THÔNG QUỐC GIA", "#FFFBEB", AMBER, [
            ("Trục Liên thông Văn bản", "Gửi nhận gói tin điện tử liên cấp"),
            ("Nền tảng Chia sẻ Dữ liệu", "Kết nối tích hợp cấp Bộ, Tỉnh"),
            ("Định danh Điện tử Quốc gia", "Xác thực dữ liệu dân cư Đề án 06"),
            ("Hạ tầng Khóa công khai", "Thiết bị HSM & Chứng thư số công vụ"),
        ]),
        (0.03, 0.12, "VÙNG CƠ SỞ DỮ LIỆU LÕI\n& QUẢN TRỊ AN TOÀN", "#F1F5F9", SLATE, [
            ("CSDL Quan hệ PostgreSQL", "20 bảng nghiệp vụ, cổng 54321:5432"),
            ("Kho Lưu trữ Văn bản Số", "Lưu trữ tệp PDF/A kèm mã SHA-256"),
            ("Nhật ký Kiểm toán Bất biến", "Lưu vết WORM tối thiểu 24 tháng"),
            ("Vùng Quản trị & Sao lưu", "Giám sát 24/7, sao lưu quy tắc 3-2-1"),
        ]),
    ]

    for y, h, layer_name, bg_color, accent_color, items in layers:
        outer = FancyBboxPatch(
            (0.02, y), 0.96, h,
            boxstyle="round,pad=0.004,rounding_size=0.015",
            facecolor=bg_color, edgecolor=accent_color, linewidth=1.6
        )
        ax.add_patch(outer)
        ax.text(0.115, y + h / 2, layer_name, ha="center", va="center",
                fontsize=9.0, fontweight="bold", color=accent_color)

        box_w = 0.172
        start_x = 0.220
        gap = 0.019
        for idx, (b_title, b_sub) in enumerate(items):
            bx = start_x + idx * (box_w + gap)
            draw_box(ax, bx, y + 0.018, box_w, h - 0.036, b_title, b_sub,
                     facecolor="#FFFFFF", edgecolor=accent_color, title_color=DARK, lw=1.2)

    arrow_y = [0.76, 0.58, 0.38, 0.20]
    arrow_h = [0.05, 0.05, 0.05, 0.05]
    for idx in range(len(arrow_y)):
        y_top = arrow_y[idx]
        y_bot = y_top - arrow_h[idx]
        for x_pos in [0.306, 0.497, 0.688, 0.879]:
            ax.annotate(
                "", xy=(x_pos, y_bot + 0.005), xytext=(x_pos, y_top - 0.005),
                arrowprops=dict(arrowstyle="<->", color=SLATE, lw=1.3)
            )

    out_path = os.path.join(OUT_DIR, "fig_amis_architecture.png")
    fig.savefig(out_path, dpi=300, bbox_inches="tight", pad_inches=0.12)
    plt.close(fig)
    print(f"[OK] Saved {out_path}")


def generate_fig2_testing_dashboard():
    """Hình 2: Biểu đồ kết quả 42 kịch bản kiểm thử tích hợp và hiệu năng chịu tải hệ thống."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13.0, 6.6), dpi=300)
    fig.patch.set_facecolor("#FFFFFF")
    fig.subplots_adjust(wspace=0.46, hspace=0.45, top=0.84, bottom=0.14, left=0.18, right=0.96)

    fig.suptitle(
        "KẾT QUẢ KIỂM THỬ TÍCH HỢP TỰ ĐỘNG (42 KỊCH BẢN) & HIỆU NĂNG CHỊU TẢI HỆ THỐNG",
        fontsize=12.0, fontweight="bold", color=DARK, y=0.95
    )

    groups = [
        "N12: Thôi việc & Bảo lưu (2)",
        "N11: Nhật ký kiểm toán (1)",
        "N10: Quy hoạch cán bộ (1)",
        "N09: Đào tạo & Khảo sát (2)",
        "N08: Biến động nhân sự (1)",
        "N07: Tuyển dụng tự động (4)",
        "N06: Động cơ tính lương (6)",
        "N05: Duyệt đơn nghỉ phép (6)",
        "N04: Chấm công chuẩn UTC (6)",
        "N03: Hồ sơ công chức (3)",
        "N02: Cơ cấu phòng ban (6)",
        "N01: Phân quyền cốt lõi (4)",
    ]
    counts = [2, 1, 1, 2, 1, 4, 6, 6, 6, 3, 6, 4]
    y_pos = np.arange(len(groups))

    bars = ax1.barh(y_pos, counts, color=NAVY, height=0.65, edgecolor="#0F172A", linewidth=0.6)
    ax1.set_yticks(y_pos)
    ax1.set_yticklabels(groups, fontsize=8.5, color=DARK)
    ax1.set_xlim(0, 7.5)
    ax1.set_xlabel("Số kịch bản kiểm thử đạt chuẩn tuyệt đối (Tổng: 42/42 đạt)", fontsize=9.0, fontweight="bold", color=DARK)
    ax1.set_title("A. Phân bổ 42 Kịch bản Kiểm thử theo 12 Nhóm Nghiệp vụ", fontsize=10.0, fontweight="bold", color=NAVY, pad=10)
    ax1.grid(axis="x", linestyle="--", alpha=0.4, color=SLATE)
    ax1.set_axisbelow(True)

    for bar, c in zip(bars, counts):
        ax1.text(bar.get_width() + 0.18, bar.get_y() + bar.get_height() / 2,
                 f"{c}/{c} Đạt", va="center", ha="left", fontsize=8.0, fontweight="bold", color=TEAL)

    ccu = np.array([500, 1000, 2500, 5000, 7500, 10000])
    resp_avg = np.array([0.28, 0.39, 0.58, 0.85, 1.18, 1.46])
    resp_p95 = np.array([0.42, 0.56, 0.82, 1.24, 1.62, 1.92])

    ax2.plot(ccu, resp_avg, marker="o", linewidth=2.4, color=TEAL, label="Thời gian phản hồi trung bình (giây)")
    ax2.plot(ccu, resp_p95, marker="s", linewidth=2.2, linestyle="--", color=NAVY, label="Thời gian phản hồi phân vị 95% (giây)")
    ax2.axhline(2.0, color=AMBER, linestyle=":", linewidth=1.8, label="Ngưỡng cam kết tối đa (2,0 giây)")

    ax2.set_title("B. Biểu đồ Thời gian Phản hồi theo Lượng Người dùng Đồng thời", fontsize=10.0, fontweight="bold", color=NAVY, pad=10)
    ax2.set_xlabel("Lượng người dùng truy cập đồng thời (Phiên)", fontsize=9.0, fontweight="bold", color=DARK)
    ax2.set_ylabel("Thời gian phản hồi (Giây)", fontsize=9.0, fontweight="bold", color=DARK)
    ax2.set_ylim(0, 2.45)
    ax2.set_xlim(0, 10800)
    ax2.grid(True, linestyle="--", alpha=0.4, color=SLATE)

    for x_v, y_v in zip(ccu, resp_avg):
        ax2.annotate(f"{y_v:.2f}s", (x_v, y_v), textcoords="offset points", xytext=(0, -14),
                     ha="center", fontsize=7.8, fontweight="bold", color=TEAL)

    ax2.legend(loc="upper left", fontsize=8.2, frameon=True, facecolor="#F8FAFC", edgecolor=BORDER)

    out_path = os.path.join(OUT_DIR, "fig_amis_testing_dashboard.png")
    fig.savefig(out_path, dpi=300, bbox_inches="tight", pad_inches=0.12)
    plt.close(fig)
    print(f"[OK] Saved {out_path}")


def generate_fig3_operations_dashboard():
    """Hình 3: Bảng điều khiển giám sát vận hành (Donut không explode + Radar ylim dư 20%, không đè chữ)."""
    fig = plt.figure(figsize=(13.0, 6.8), dpi=300)
    fig.patch.set_facecolor("#FFFFFF")
    fig.subplots_adjust(wspace=0.52, hspace=0.45, top=0.76, bottom=0.18, left=0.05, right=0.93)

    fig.suptitle(
        "BẢNG ĐIỀU KHIỂN GIÁM SÁT CHẤT LƯỢNG VẬN HÀNH & ĐỐI SÁNH HIỆU QUẢ CẢI CÁCH HÀNH CHÍNH",
        fontsize=11.8, fontweight="bold", color=DARK, y=0.96
    )

    # Subplot 1: Donut chart (NO explode, slices <= 8% only in Legend, center metric)
    ax1 = fig.add_subplot(1, 2, 1)
    sizes = [74.2, 24.4, 1.4]
    colors = [NAVY, TEAL, AMBER]
    labels_legend = [
        "Hoàn thành trước hạn (74,2%)",
        "Hoàn thành đúng hạn (24,4%)",
        "Quá hạn đang đôn đốc (1,4%)",
    ]

    wedges, _ = ax1.pie(
        sizes,
        colors=colors,
        startangle=140,
        wedgeprops=dict(width=0.42, edgecolor="#FFFFFF", linewidth=2.0),
    )

    for wedge, pct in zip(wedges, sizes):
        if pct > 8.0:
            ang = (wedge.theta2 + wedge.theta1) / 2.0
            rx = 0.79 * np.cos(np.deg2rad(ang))
            ry = 0.79 * np.sin(np.deg2rad(ang))
            ax1.text(rx, ry, f"{pct:.1f}%".replace(".", ","), ha="center", va="center",
                     fontsize=9.2, fontweight="bold", color="#FFFFFF")

    ax1.text(0, 0.06, "98,6%", ha="center", va="center", fontsize=16.0, fontweight="bold", color=NAVY)
    ax1.text(0, -0.14, "Đúng & Trước hạn", ha="center", va="center", fontsize=8.5, fontweight="bold", color=SLATE)

    ax1.set_title("A. Tỷ lệ Giải quyết Hồ sơ Hành chính", fontsize=10.2, fontweight="bold", color=NAVY, pad=18)
    ax1.legend(wedges, labels_legend, title="Phân loại tiến độ xử lý", loc="upper center",
               bbox_to_anchor=(0.5, -0.04), ncol=1, fontsize=8.4, title_fontsize=8.6,
               frameon=True, facecolor="#F8FAFC", edgecolor=BORDER)

    # Subplot 2: Radar chart with ylim(0, 120) (+20% padding over 100 max) and custom outer label positioning
    ax2 = fig.add_subplot(1, 2, 2, polar=True)
    categories = [
        "Tỷ lệ đúng hạn",
        "Ký số toàn trình",
        "Tiết kiệm chi phí",
        "Tốc độ tra cứu",
        "Độ sẵn sàng hạ tầng",
        "Mức độ hài lòng",
    ]
    N = len(categories)
    angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
    angles += angles[:1]

    before_vals = [70.0, 15.0, 18.0, 20.0, 82.0, 65.0]
    after_vals = [98.6, 100.0, 89.4, 99.0, 99.9, 96.2]
    before_vals += before_vals[:1]
    after_vals += after_vals[:1]

    ax2.set_theta_offset(np.pi / 2)
    ax2.set_theta_direction(-1)
    ax2.set_xticks(angles[:-1])
    ax2.set_xticklabels([])  # Drawn manually with directional alignment to avoid crossing outer circle

    ax2.set_ylim(0, 120)
    ax2.set_yticks([25, 50, 75, 100])
    ax2.set_yticklabels(["25%", "50%", "75%", "100%"], fontsize=7.5, color=SLATE)

    # Place category labels cleanly outside the r=120 ring
    label_specs = [
        (angles[0], 131, "center", "bottom"),
        (angles[1], 130, "left", "center"),
        (angles[2], 130, "left", "center"),
        (angles[3], 132, "center", "top"),
        (angles[4], 130, "right", "center"),
        (angles[5], 130, "right", "center"),
    ]
    for cat, (ang, rad, ha_val, va_val) in zip(categories, label_specs):
        ax2.text(ang, rad, cat, ha=ha_val, va=va_val, fontsize=8.6, fontweight="bold", color=DARK, clip_on=False)

    ax2.plot(angles, before_vals, linewidth=2.0, linestyle="--", color=AMBER, label="Trước triển khai (%)")
    ax2.fill(angles, before_vals, color=AMBER, alpha=0.15)

    ax2.plot(angles, after_vals, linewidth=2.4, linestyle="-", color=TEAL, label="Sau vận hành chính thức (%)")
    ax2.fill(angles, after_vals, color=TEAL, alpha=0.22)

    ax2.set_title("B. Đối sánh 6 Chỉ số Vận hành Trọng yếu", fontsize=10.2, fontweight="bold", color=NAVY, y=1.16)
    ax2.legend(loc="upper center", bbox_to_anchor=(0.5, -0.10), ncol=2, fontsize=8.3,
               frameon=True, facecolor="#F8FAFC", edgecolor=BORDER)

    out_path = os.path.join(OUT_DIR, "fig_amis_operations_dashboard.png")
    fig.savefig(out_path, dpi=300, bbox_inches="tight", pad_inches=0.14)
    plt.close(fig)
    print(f"[OK] Saved {out_path}")


if __name__ == "__main__":
    generate_fig1_architecture()
    generate_fig2_testing_dashboard()
    generate_fig3_operations_dashboard()
