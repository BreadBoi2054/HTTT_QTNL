"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Users, Briefcase, Clock, Calendar, AlertCircle, Lock, Building2,
  TrendingUp, CheckCircle2, UserCheck, ArrowUpRight,
  ChevronRight, ArrowRight, ShieldCheck, Banknote, Target, FileText, BookOpen
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isUser = user?.roleName === 'USER';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Lời chào theo thời gian trong ngày
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3">
        <div className="w-9 h-9 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-xs font-medium text-zinc-500 animate-pulse">Đang tải dữ liệu điều hành...</p>
      </div>
    );
  }

  // Dữ liệu biểu đồ chấm công
  const presentCount = data?.attendanceToday?.PRESENT || 0;
  const lateCount = data?.attendanceToday?.LATE || 0;
  const absentCount = (data?.attendanceToday?.ABSENT || 0) + (data?.attendanceToday?.LEAVE || 0);
  const totalReported = presentCount + lateCount + absentCount;
  const attendanceRate = totalReported > 0 
    ? Math.round((presentCount / totalReported) * 100) 
    : 100;

  const pieData = [
    { name: 'Đúng giờ', value: presentCount, color: '#2563EB' },
    { name: 'Đi muộn', value: lateCount, color: '#F59E0B' },
    { name: 'Vắng/Nghỉ', value: absentCount, color: '#EF4444' }
  ];

  // Custom Tooltip cho BarChart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-md bg-zinc-950/90 text-white border border-zinc-700/60 rounded-xl px-3.5 py-2 shadow-xl text-xs">
          <p className="font-semibold text-zinc-200">{label}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-zinc-400">Nhân sự chính thức:</span>
            <span className="font-mono font-bold text-white">{payload[0].value} người</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-swiss-in pb-10 max-w-7xl mx-auto">
      
      {/* 1. ENTERPRISE OPERATIONAL HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <span>Hệ thống</span>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-200 font-medium">Bàn điều hành trung tâm</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="font-mono text-[11px] text-zinc-500">
              Kỳ làm việc: {new Date().toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Tổng Quan Điều Hành Nhân Lực
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Tài khoản: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{user?.name || "Người dùng"}</span> (Vai trò: {user?.roleName || "Nhân viên"}). Cập nhật trạng thái tác nghiệp toàn doanh nghiệp.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <Link
            href="/dashboard/attendance"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300/80 dark:border-zinc-700 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Chấm công</span>
          </Link>

          <Link
            href="/dashboard/leave"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300/80 dark:border-zinc-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Duyệt đơn</span>
          </Link>

          <Link
            href="/dashboard/my-workspace"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-white" />
            <span>Cổng cá nhân</span>
          </Link>
        </div>
      </div>

      {/* 2. BENTO METRICS GRID (4 TILES) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Tile 1: Tổng nhân sự */}
        <div className="bento-card p-5 group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Tổng nhân sự</span>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 tracking-tight font-mono">
                {data?.totalEmployees || 0}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/50 dark:border-blue-900/50">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
              6 phòng ban trực thuộc
            </span>
            <Link href="/dashboard/employees" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center font-medium text-[11px]">
              Xem danh sách <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Tile 2: Đi làm hôm nay */}
        <div className="bento-card p-4.5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Có mặt hôm nay</span>
                {isUser && <Lock className="w-3 h-3 text-zinc-400" />}
              </div>
              {isUser ? (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 italic">Giới hạn theo quyền</p>
              ) : (
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 tracking-tight font-mono">
                  {presentCount}
                </p>
              )}
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-900/50">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            {!isUser ? (
              <>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                  Đúng giờ: {presentCount} nhân sự
                </span>
                <span className="text-zinc-500 font-mono text-[11px]">{attendanceRate}%</span>
              </>
            ) : (
              <span className="text-zinc-400 text-[11px]">Chế độ cá nhân</span>
            )}
          </div>
        </div>

        {/* Tile 3: Tuyển dụng */}
        <div className="bento-card p-4.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Vị trí tuyển dụng</span>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 tracking-tight font-mono">
                {data?.activeJobs || 0}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-200/50 dark:border-violet-900/50">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            <span className="text-violet-600 dark:text-violet-400 font-medium text-[11px]">
              Đang nhận hồ sơ
            </span>
            <Link href="/dashboard/recruitment" className="text-violet-600 dark:text-violet-400 hover:underline flex items-center font-medium text-[11px]">
              Xem tin tuyển <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Tile 4: Tỷ lệ Chuyên cần */}
        <div className="bento-card p-4.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Tỷ lệ chuyên cần</span>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 tracking-tight font-mono">
                {isUser ? "--" : `${attendanceRate}%`}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/50 dark:border-amber-900/50">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
              {isUser ? "Chế độ cá nhân" : `Muộn: ${lateCount} • Vắng: ${absentCount}`}
            </span>
            <Link href="/dashboard/attendance" className="text-amber-600 dark:text-amber-400 hover:underline flex items-center font-medium text-[11px]">
              Sổ điểm danh <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* 3. BENTO SECTION: BIỂU ĐỒ TRỰC QUAN HÓA (2/3 & 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Biểu đồ phân bổ nhân sự (Chiếm 2 cột) */}
        <div className="lg:col-span-2 bento-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Phân Bố Nhân Sự Theo Phòng Ban
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 font-mono">
                    Headcount
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Số lượng nhân viên chính thức đang công tác tại các khối phòng ban
                </p>
              </div>

              {isUser && (
                <span className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">
                  <Lock className="w-3.5 h-3.5" /> Phân quyền bảo mật
                </span>
              )}
            </div>

            <div className="h-[300px] w-full pt-4">
              {isUser || !data?.headcountByDept ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 space-y-2">
                  <Lock className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                  <p className="text-xs">Dữ liệu tổng quan phòng ban chỉ hiển thị cho Quản lý & HR.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.headcountByDept} margin={{ top: 20, right: 10, left: -20, bottom: 25 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#71717A', fontSize: 11, fontWeight: 500 }} 
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#71717A', fontSize: 11, fontFamily: 'monospace' }} 
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar 
                      dataKey="value" 
                      fill="url(#barGradient)" 
                      radius={[6, 6, 0, 0]} 
                      maxBarSize={42} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Đơn vị tính: Nhân viên</span>
            <Link href="/dashboard/departments" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center font-medium">
              Quản lý cơ cấu tổ chức <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

        {/* Biểu đồ Donut Chuyên Cần (Chiếm 1 cột) */}
        <div className="lg:col-span-1 bento-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100 dark:border-zinc-800/80">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Tình Hình Chuyên Cần
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Hôm nay ({new Date().toLocaleDateString('vi-VN')})</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {/* Donut Chart with Center Metric */}
            <div className="relative h-[200px] flex items-center justify-center my-2">
              {isUser || !data?.attendanceToday ? (
                <div className="text-center text-zinc-400 dark:text-zinc-500 text-xs">
                  <Lock className="w-7 h-7 mx-auto mb-1.5 text-zinc-300 dark:text-zinc-700" />
                  Chỉ hiển thị cho cấp Quản lý
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={pieData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={55} 
                        outerRadius={78} 
                        paddingAngle={4} 
                        dataKey="value" 
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Metric */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
                      {attendanceRate}%
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-semibold tracking-wider">
                      Có mặt
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Legend Details */}
          {!isUser && data?.attendanceToday && (
            <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-blue-50/70 dark:bg-blue-950/40 p-2 rounded-xl border border-blue-100/80 dark:border-blue-900/40">
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Đúng giờ</div>
                  <div className="text-sm font-bold text-blue-700 dark:text-blue-300 font-mono mt-0.5">{presentCount}</div>
                </div>
                <div className="bg-amber-50/70 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-100/80 dark:border-amber-900/40">
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Đi muộn</div>
                  <div className="text-sm font-bold text-amber-700 dark:text-amber-300 font-mono mt-0.5">{lateCount}</div>
                </div>
                <div className="bg-red-50/70 dark:bg-red-950/40 p-2 rounded-xl border border-red-100/80 dark:border-red-900/40">
                  <div className="text-[10px] text-red-600 dark:text-red-400 font-medium">Vắng/Nghỉ</div>
                  <div className="text-sm font-bold text-red-700 dark:text-red-300 font-mono mt-0.5">{absentCount}</div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 4. BENTO SECTION: LỐI TẮT PHÂN HỆ VÀ DANH SÁCH ỨNG VIÊN MỚI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Phím Tắt Phân Hệ (Chiếm 1 cột) */}
        <div className="lg:col-span-1 bento-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100 dark:border-zinc-800/80 mb-4">
              <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Lối Tắt Phân Hệ
              </h3>
              <span className="text-[11px] text-zinc-400">Truy cập nhanh</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/dashboard/departments"
                className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">Cơ cấu tổ chức</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Sơ đồ phòng ban</div>
              </Link>

              <Link
                href="/dashboard/payroll"
                className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Banknote className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 transition-colors">Bảng tính lương</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Kỳ lương & thuế</div>
              </Link>

              <Link
                href="/dashboard/performance"
                className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Target className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 transition-colors">Hiệu suất KPI</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Đánh giá chu kỳ</div>
              </Link>

              <Link
                href="/dashboard/contracts"
                className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-violet-500/50 dark:hover:border-violet-500/50 hover:bg-violet-50/30 dark:hover:bg-violet-950/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 transition-colors">Hợp đồng</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Pháp lý & thời hạn</div>
              </Link>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
            <Link href="/dashboard/guide" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-between font-medium">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                Sổ tay quy trình nghiệp vụ
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Ứng viên mới nhất (Chiếm 2 cột) */}
        <div className="lg:col-span-2 bento-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100 dark:border-zinc-800/80 mb-4">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Ứng Viên Mới Ứng Tuyển
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Danh sách hồ sơ nộp gần nhất cần thẩm định</p>
              </div>
              <Link 
                href="/dashboard/recruitment" 
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center"
              >
                Xem tất cả ({data?.recentApplications?.length || 0}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {isUser || !data?.recentApplications ? (
                <div className="py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs flex flex-col items-center gap-2">
                  <Lock className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
                  <span>Dữ liệu ứng viên giới hạn theo phân quyền của Quản lý & HR.</span>
                </div>
              ) : data.recentApplications.length === 0 ? (
                <div className="py-8 text-center text-zinc-400 text-xs">
                  Hiện chưa có ứng viên mới nộp đơn trong hôm nay.
                </div>
              ) : (
                data.recentApplications.slice(0, 4).map((app: any) => {
                  const initials = app.candidateName
                    ? app.candidateName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                    : "UV";
                  
                  const statusConfig: Record<string, { label: string; color: string }> = {
                    APPLIED: { label: 'Mới nộp', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900' },
                    INTERVIEW: { label: 'Phỏng vấn', color: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-900' },
                    OFFER: { label: 'Đề nghị', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900' },
                    HIRED: { label: 'Đã tuyển', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900' },
                    REJECTED: { label: 'Từ chối', color: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700' },
                  };

                  const currentStatus = statusConfig[app.status] || { label: app.status, color: 'bg-zinc-100 text-zinc-600' };

                  return (
                    <div 
                      key={app.id} 
                      className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          {initials}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {app.candidateName}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">{app.jobTitle}</span>
                            <span>•</span>
                            <span>Nộp: {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('vi-VN') : 'Gần đây'}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${currentStatus.color}`}>
                        {currentStatus.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3.5 mt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Tiến trình thẩm định hồ sơ ứng viên tự động</span>
            <Link href="/dashboard/recruitment" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center font-medium">
              Đến phòng Tuyển dụng <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
