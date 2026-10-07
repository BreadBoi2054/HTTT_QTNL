"use client";

import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  ClipboardCheck, 
  BookOpen, 
  Users, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  BarChart3,
  X,
  ChevronRight,
  Download,
  Award,
  FileText,
  Star,
  Printer
} from "lucide-react";

interface TrainingCourse {
  id: string;
  title: string;
  instructor: string;
  category: string;
  duration: string;
  participants: number;
  progress: number;
  startDate: string;
  status: string;
}

interface Survey {
  id: string;
  title: string;
  targetDept: string;
  respondents: number;
  totalTarget: number;
  deadline: string;
  score: number;
  status: string;
}

export default function TrainingSurveysPage() {
  const [activeTab, setActiveTab] = useState<"training" | "surveys">("training");
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  // Form State for new course
  const [courseForm, setCourseForm] = useState({
    title: "",
    instructor: "",
    category: "Kỹ năng chuyên môn",
    duration: "16 giờ",
    participants: 10,
    startDate: new Date().toISOString().split("T")[0],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [res, empRes] = await Promise.all([
        fetch("/api/training-surveys"),
        fetch("/api/employees")
      ]);
      const data = await res.json();
      const empData = await empRes.json();
      setCourses(Array.isArray(data.courses) ? data.courses : []);
      setSurveys(Array.isArray(data.surveys) ? data.surveys : []);
      if (Array.isArray(empData)) setEmployees(empData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedSurvey) setSelectedSurvey(null);
        else if (selectedCourse) setSelectedCourse(null);
        else if (isModalOpen) setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedSurvey, selectedCourse, isModalOpen]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/training-surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseForm),
      });
      if (res.ok) {
        fetchData();
        setIsModalOpen(false);
        setCourseForm({
          title: "",
          instructor: "",
          category: "Kỹ năng chuyên môn",
          duration: "16 giờ",
          participants: 10,
          startDate: new Date().toISOString().split("T")[0],
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 animate-swiss-in pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              <GraduationCap className="w-3.5 h-3.5" />
              Đào Tạo & Khảo Sát Doanh Nghiệp
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
            Học Tập, Phát Triển & Khảo Sát Ý Kiến
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Nâng cao năng lực chuyên môn, quản trị lộ trình học tập và đo lường chỉ số gắn kết nhân sự eNPS
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Segmented Control Tabs */}
          <div className="flex bg-zinc-100/80 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
            <button
              onClick={() => setActiveTab("training")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "training"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Đào tạo ({courses.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("surveys")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "surveys"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Khảo sát ({surveys.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm khóa học</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Bento Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-card p-5 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Chương trình đào tạo</span>
            <div className="squircle w-9 h-9 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-all">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono tracking-tight text-zinc-900 dark:text-zinc-100">{courses.length}</div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Lộ trình học tập nội bộ</div>
        </div>

        <div className="bento-card p-5 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tỷ lệ hoàn thành</span>
            <div className="squircle w-9 h-9 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-all">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">88.5%</div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Đạt chỉ tiêu cam kết</div>
        </div>

        <div className="bento-card p-5 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Điểm hài lòng eNPS</span>
            <div className="squircle w-9 h-9 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-all">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono tracking-tight text-indigo-600 dark:text-indigo-400">+52</div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Mức xếp hạng xuất sắc</div>
        </div>

        <div className="bento-card p-5 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Khảo sát ý kiến</span>
            <div className="squircle w-9 h-9 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-all">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono tracking-tight text-amber-600 dark:text-amber-400">{surveys.length}</div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Tỷ lệ tham gia 92%</div>
        </div>
      </div>

      {/* Content for Training Tab */}
      {activeTab === "training" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 py-16 text-center text-zinc-500 text-xs">
              Đang tải danh sách khóa học...
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="bento-card rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/60 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold">
                      {course.category}
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-500">
                      {course.status === "COMPLETED" ? "Đã hoàn thành" :
                       course.status === "IN_PROGRESS" ? "Đang diễn ra" : "Mở đăng ký"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1.5 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3.5">
                    Giảng viên: <strong className="text-zinc-700 dark:text-zinc-300 font-medium">{course.instructor}</strong>
                  </p>

                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-3.5">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-zinc-400" /> {course.duration}</span>
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-zinc-400" /> {course.participants} học viên</span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="font-medium">Tiến độ khóa học</span>
                      <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{course.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden p-0.5">
                      <div 
                        className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500" 
                        style={{ width: `${course.progress}%` }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3.5 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                    <Calendar className="w-3.5 h-3.5" /> {course.startDate}
                  </span>
                  <button 
                    onClick={() => setSelectedCourse(course)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-1 hover:gap-1.5 transition-all"
                  >
                    <span>Chi tiết</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Content for Surveys Tab */}
      {activeTab === "surveys" && (
        <div className="bento-card rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-900/40">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Khảo sát ý kiến nhân sự doanh nghiệp
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Thu thập đánh giá môi trường làm việc và văn hóa doanh nghiệp</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Bảo mật ẩn danh
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 text-xs font-semibold border-b border-zinc-100 dark:border-zinc-800 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Tên khảo sát</th>
                  <th className="px-5 py-3.5">Đối tượng</th>
                  <th className="px-5 py-3.5 text-center">Tiến độ phản hồi</th>
                  <th className="px-5 py-3.5 text-center">Điểm hài lòng</th>
                  <th className="px-5 py-3.5">Hạn chót</th>
                  <th className="px-5 py-3.5 text-right">Trạng thái & Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {surveys.map((survey) => (
                  <tr key={survey.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{survey.title}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Khảo sát nội bộ</div>
                    </td>

                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-300 font-medium">
                      {survey.targetDept}
                    </td>

                    <td className="px-5 py-3.5 text-center font-mono">
                      <span className="text-zinc-800 dark:text-zinc-200 font-semibold">
                        {survey.respondents} / {survey.totalTarget}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-center font-mono">
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {survey.score} / 5.0
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-zinc-500 font-mono">
                      {survey.deadline}
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-2">
                      {survey.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đang mở
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 bg-zinc-100 dark:bg-zinc-800 font-medium">
                          Đã đóng
                        </span>
                      )}
                      <button
                        onClick={() => setSelectedSurvey(survey)}
                        className="text-xs px-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold transition-all shadow-2xs"
                      >
                        Xem kết quả
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add Course */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Thêm Khóa đào tạo mới</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md"
                title="Thoát (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 mt-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Tên khóa học <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nâng cao kỹ năng phân tích dữ liệu"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700/80 rounded-lg text-xs focus:outline-none focus:border-blue-600 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Giảng viên / Đơn vị tổ chức <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  list="instructors-list"
                  placeholder="Chọn giảng viên nội bộ hoặc nhập đơn vị ngoài..."
                  value={courseForm.instructor}
                  onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700/80 rounded-lg text-xs focus:outline-none focus:border-blue-600 text-zinc-900 dark:text-zinc-100"
                />
                <datalist id="instructors-list">
                  <option value="Phòng Nhân sự & Đào tạo (HR)" />
                  <option value="Hội đồng Chuyên môn Kỹ thuật" />
                  <option value="Viện Quản trị Chiến lược Doanh nghiệp" />
                  {employees.map(e => (
                    <option key={e.id} value={`${e.user.name} (${e.position})`} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Thời lượng</label>
                  <input
                    type="text"
                    required
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700/80 rounded-lg text-xs focus:outline-none focus:border-blue-600 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Số học viên dự kiến</label>
                  <input
                    type="number"
                    required
                    value={courseForm.participants}
                    onChange={(e) => setCourseForm({ ...courseForm, participants: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700/80 rounded-lg text-xs focus:outline-none focus:border-blue-600 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
                >
                  Thoát
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-medium transition-colors"
                >
                  Tạo khóa học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chi tiết Khóa Học */}
      {selectedCourse && (
        <div 
          className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedCourse(null)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Sticky */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 print:hidden shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  Hồ sơ khóa học nội bộ
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> In khung đào tạo
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCourse(null)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
                  title="Thoát (Esc)"
                >
                  <X className="w-4 h-4" />
                  <span>Thoát</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedCourse.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Phân loại: {selectedCourse.category} • Ngày khai giảng: {selectedCourse.startDate}
                </p>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                <div>
                  <div className="text-xs text-zinc-400 font-medium">Giảng viên</div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{selectedCourse.instructor}</div>
                  <div className="text-[11px] text-zinc-500">Chuyên gia nội bộ</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-400 font-medium">Thời lượng</div>
                  <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{selectedCourse.duration}</div>
                  <div className="text-[11px] text-zinc-500">8 modules đào tạo</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-400 font-medium">Học viên</div>
                  <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{selectedCourse.participants} cán bộ</div>
                  <div className="text-[11px] text-zinc-500">Phủ 6 phòng ban</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-400 font-medium">Tiến độ</div>
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">{selectedCourse.progress}% hoàn thành</div>
                  <div className="text-[11px] text-emerald-600 font-medium">Đang triển khai</div>
                </div>
              </div>

              {/* Detailed Curriculum */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Khung chương trình đào tạo 4 tuần (Syllabus)
                </h4>
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-start gap-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">W1</span>
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Tuần 1: Kiến trúc Nền tảng & Tiêu chuẩn Kỹ thuật</div>
                      <div className="text-xs text-zinc-500 mt-0.5">Nắm vững kiến trúc phần mềm, nguyên tắc bảo mật và quy định phát triển hệ thống.</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-start gap-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">W2</span>
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Tuần 2: Phương pháp Luận Quản trị & Thực hành Agile/Scrum</div>
                      <div className="text-xs text-zinc-500 mt-0.5">Thiết lập backlog, chia nhỏ user story, tối ưu hóa workflow và kiểm soát chất lượng.</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-start gap-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">W3</span>
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Tuần 3: Bài tập Tình huống Thực tế (Case Study)</div>
                      <div className="text-xs text-zinc-500 mt-0.5">Phân tích sự cố vận hành thực tế, giải quyết xung đột nghiệp vụ và kiểm thử hiệu năng.</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-start gap-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">W4</span>
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Tuần 4: Bảo vệ Đồ án Capstone & Cấp Chứng chỉ</div>
                      <div className="text-xs text-zinc-500 mt-0.5">Báo cáo trước Hội đồng Thẩm định, chấm điểm xếp loại và bổ sung vào hồ sơ năng lực.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trainee Roster Sample */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Danh sách học viên tiêu biểu
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {employees.slice(0, 6).map((emp, idx) => (
                    <div key={emp.id} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{emp.user.name}</div>
                        <div className="text-xs text-zinc-400 mt-0.5">{emp.department?.name || 'Khối Kỹ thuật'}</div>
                      </div>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md font-medium border border-emerald-200 dark:border-emerald-800">
                        Điểm: 9.{idx + 2}/10
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
              >
                Thoát
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-medium transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> In khung đào tạo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kết Quả Khảo Sát Chi Tiết */}
      {selectedSurvey && (
        <div 
          className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedSurvey(null)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Sticky */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 print:hidden shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-emerald-500" />
                  Báo cáo phân tích khảo sát nội bộ
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> In báo cáo
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSurvey(null)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
                  title="Thoát (Esc)"
                >
                  <X className="w-4 h-4" />
                  <span>Thoát</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedSurvey.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Đối tượng: {selectedSurvey.targetDept} • Hạn chót: {selectedSurvey.deadline}
                </p>
              </div>

              {/* Score & Response Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-center">
                <div>
                  <div className="text-xs text-zinc-400 font-medium">Điểm hài lòng trung bình</div>
                  <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    {selectedSurvey.score} <span className="text-xs font-normal text-zinc-400 font-sans">/ 5.0</span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Mức độ: Rất tích cực</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-400 font-medium">Tỷ lệ phản hồi</div>
                  <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                    {Math.round((selectedSurvey.respondents / selectedSurvey.totalTarget) * 100)}%
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">{selectedSurvey.respondents} / {selectedSurvey.totalTarget} nhân sự</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-400 font-medium">Chỉ số tín nhiệm (eNPS)</div>
                  <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
                    +78
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Xếp loại: Xuất sắc</div>
                </div>
              </div>

              {/* Criteria Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Phân tích điểm số theo 4 tiêu chí cốt lõi
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">1. Môi trường làm việc & Văn hóa gắn kết</span>
                      <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">4.8 / 5.0</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '96%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">2. Sự minh bạch về Đãi ngộ, Thưởng & Phúc lợi</span>
                      <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">4.5 / 5.0</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '90%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">3. Năng lực điều hành & Sự hỗ trợ từ Trưởng bộ phận</span>
                      <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">4.7 / 5.0</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">4. Cơ hội đào tạo, nâng cao kỹ năng & Lộ trình phát triển</span>
                      <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">4.6 / 5.0</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Anonymous Feedback Quote */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5">
                <div className="text-xs text-zinc-400 font-medium">Ý kiến phản hồi ẩn danh tiêu biểu</div>
                <p className="italic">"Môi trường làm việc cởi mở, các chương trình đào tạo nội bộ rất thiết thực và bám sát dự án thực tế."</p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedSurvey(null)}
                className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
              >
                Thoát
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-medium transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> In báo cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
