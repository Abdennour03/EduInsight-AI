"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  api,
  type ApiStudent,
  type AttendanceRecord,
  type AttendanceStudent,
  type Grade,
  type Course,
  type Exercise,
  type Submission,
  type StudentNotification,
  type Teacher,
  type TeacherCourse,
  type TeacherExercise,
  type TeacherNotification,
} from "../../lib/api";
import { getFileUrl } from "../../lib/api";
import {
  BarChart3,
  Bell,
  BookOpen,
  Award,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  Eye,
  EyeOff,
  FileText,
  Filter,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Pause,
  Pencil,
  Plus,
  Play,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
  Timer,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { jsPDF } from "jspdf";
import { LANGUAGE_KEY, type Language, translate } from "../../lib/i18n";

type Role = "Student" | "Teacher" | "Admin";

const blue = "#0052CC";

let students = [
  {
    name: "Amine El Idrissi",
    email: "amine.elidrissi@edu.ma",
    className: "3AC",
    status: "Active",
    initials: "AE",
  },
  {
    name: "Salma Benali",
    email: "salma.benali@edu.ma",
    className: "3AC",
    status: "Active",
    initials: "SB",
  },
  {
    name: "Youssef Alaoui",
    email: "youssef.alaoui@edu.ma",
    className: "3AC",
    status: "Active",
    initials: "YA",
  },
  {
    name: "Nour El Amrani",
    email: "nour.elamrani@edu.ma",
    className: "1BAC",
    status: "Active",
    initials: "NE",
  },
  {
    name: "Aya Tazi",
    email: "aya.tazi@edu.ma",
    className: "1BAC",
    status: "Inactive",
    initials: "AT",
  },
];

// student_id is added on top of the mock shape so real API rows (which do
// carry a student_id) can be tracked through the admin UI for reports/delete.
type AdminStudent = (typeof students)[number] & { student_id?: number; class_id?: number | null; class_ids?: number[]; phone_number?: string };
type AdminTeacher = {
  teacher_id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  classes: { class_id: number; name: string; academic_year: string }[];
};
type AdminClass = { class_id: number; name: string; academic_year: string };

// ---- Admin student report ---------------------------------------------
// Matches AdminStudentReportResponse from the OpenAPI spec exactly:
// GET /admin/students/{student_id}/report returns student_id, name, email,
// class_info, and exercises_and_exams (each with a nullable score). There
// is NO courses / submissions / attendance data on this endpoint, so we
// must not pretend those fields exist.
interface ReportExerciseEntry {
  exercise_id: number;
  exercise_name: string;
  score: number | null;
}

interface ClassInfo {
  class_id: number;
  name: string;
  academic_year: string;
}

interface StudentReportData {
  student_id: number;
  name: string;
  email: string;
  class_info: ClassInfo | null;
  exercises_and_exams: ReportExerciseEntry[];
}

let courses = [
  {
    name: "Algebra & Functions",
    teacher: "Nadia Bennani",
    exercises: [
      { name: "Exercise 1 — Equations", score: "18 / 20", state: "Submitted" },
      { name: "Exercise 2 — Functions", score: "—", state: "Not submitted" },
      {
        name: "Exercise 3 — Inequalities",
        score: "16 / 20",
        state: "Submitted",
      },
    ],
  },
  {
    name: "Geometry in Space",
    teacher: "Nadia Bennani",
    exercises: [
      { name: "Exercise 1 — Vectors", score: "19 / 20", state: "Submitted" },
      { name: "Exercise 2 — Planes", score: "—", state: "Not submitted" },
    ],
  },
  {
    name: "Probability",
    teacher: "Karim Rami",
    exercises: [
      { name: "Exercise 1 — Events", score: "17 / 20", state: "Submitted" },
    ],
  },
];

function Avatar({
  initials,
  image,
  className = "",
}: {
  initials: string;
  image?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-[#0052CC] ${className}`}
    >
      {image ? <img src={image} alt="Profile" className="h-full w-full rounded-full object-cover" /> : initials}
    </div>
  );
}

function Sidebar({
  role,
  open,
  setOpen,
  active,
  userName,
  onLogout,
  setActive,
  language,
}: {
  role: Role;
  open: boolean;
  setOpen: (value: boolean) => void;
  active: string;
  userName: string;
  onLogout: () => void;
  setActive: (value: string) => void;
  language: Language;
}) {
  const items =
    role === "Student"
      ? [
        ["Overview", LayoutDashboard],
        ["My Courses", BookOpen],
        ["Progress", BarChart3],
        ["Profile", Settings],
      ]
      : role === "Teacher"
        ? [
          ["Dashboard", LayoutDashboard],
          ["My Classes", GraduationCap],
          ["My Students", Users],
          ["My Courses", BookOpen],
          ["Submissions", ClipboardCheck],
          ["Attendance", CalendarDays],
          ["Notifications", Bell],
          ["Profile", Settings],
        ]
        : [
          ["Overview", LayoutDashboard],
          ["Reports", BarChart3],
          ["Notifications", Bell],
          ["Profile", Settings],
        ];
  return (
    <>
      {open && (
        <button
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/20 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-[#E2E8F0] bg-white text-[#334155] transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-[#E2E8F0] px-6">
          <div className={`flex h-11 w-11 shrink-0 aspect-square items-center justify-center rounded-xl text-white ${role === "Admin" ? "bg-[#15803D]" : "bg-[#0052CC]"}`}>
            <GraduationCap size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-bold tracking-tight text-[#0F172A]">
              EduInsight <span className={role === "Admin" ? "text-[#EAB308]" : "text-[#0052CC]"}>AI</span>
            </div>
            <div className="text-[10px] uppercase tracking-[.22em] text-[#64748B]">
              AI-Powered Learning Platform
            </div>
          </div>
          <button
            className="ml-auto text-[#334155] lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-4 pt-6">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#64748B]">
            {translate(language, "workspace")}
          </div>
          {items.map(([label, Icon]) => (
            <button
              key={label as string}
              onClick={() => {
                const section =
                  label === "Overview" || label === "Dashboard"
                    ? "overview"
                    : (label as string).toLowerCase().replaceAll(" ", "-");
                setActive(label as string);
                document
                  .getElementById(section)
                  ?.scrollIntoView({ behavior: "smooth" });
                setOpen(false);
              }}
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${active === label ? role === "Admin" ? "bg-[#FEF9C3] font-semibold text-[#15803D]" : "bg-[#EFF6FF] font-semibold text-[#0052CC]" : "text-[#334155] hover:bg-[#F8FAFC] hover:text-[#15803D]"}`}
            >
              <Icon size={17} />
              <span>{translate(language, label === "Overview" ? "overview" : (label as string).toLowerCase().replaceAll(" ", ""))}</span>
              {label === "Announcements" && (
                <span className="ml-auto rounded-full bg-[#0052CC] px-2 py-0.5 text-[10px] text-white">
                  3
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="mt-auto border-t border-[#E2E8F0] p-4">
          <div className="flex items-center gap-3">
            <Avatar
              initials={
                userName
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "U"
              }
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[#0F172A]">
                {userName}
              </p>
              <p className="text-[10px] text-[#64748B]">{role} Account</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${role === "Admin" ? "border-[#FDE68A] text-[#A16207] hover:bg-[#FEF9C3]" : "border-[#DBEAFE] text-[#0052CC] hover:bg-[#EFF6FF]"}`}
          >
            <LogOut size={14} /> {translate(language, "logout")}
          </button>
        </div>
      </aside>
    </>
  );
}

function Topbar({
  role,
  setOpen,
  onLogout,
  userName,
  notifications,
  language,
}: {
  role: Role;
  setOpen: (value: boolean) => void;
  onLogout: () => void;
  userName: string;
  notifications: Array<{ notification_id: number; title: string; message: string }>;
  language: Language;
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  return (
    <header className="relative flex min-h-16 items-center justify-between border-b border-[#DBEAFE] bg-white px-3 py-3 sm:px-5 md:px-8">
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
          className={`shrink-0 rounded-lg p-2 hover:bg-[#F8FAFC] lg:hidden ${role === "Admin" ? "text-[#15803D]" : "text-[#0052CC]"}`}
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-[#0F172A] sm:text-xl">
            {role === "Teacher" ? "Dashboard" : userName}
          </h1>
          <p className="truncate text-xs text-[#64748B]">{role === "Admin" ? translate(language, "adminWorkspace") : `${role} workspace`}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {role === "Teacher" && (
          <label className="hidden items-center gap-2 rounded-lg border border-[#DBEAFE] bg-[#F8FAFC] px-3 py-2 text-sm text-[#64748B] md:flex">
            <Search size={16} />
            <input
              aria-label="Search"
              placeholder="Search..."
              className="w-44 bg-transparent outline-none placeholder:text-[#94A3B8]"
            />
          </label>
        )}
        <button
          aria-label="Notifications"
          onClick={() => setNotificationsOpen((value) => !value)}
          className="relative rounded-xl border border-[#DBEAFE] p-2.5 text-[#475569] hover:bg-[#EFF6FF]"
        >
          <Bell size={18} />
          {notifications.length > 0 && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />}
        </button>
        {notificationsOpen && (
          <div className="absolute right-24 top-16 z-50 w-80 rounded-xl border border-[#DBEAFE] bg-white p-4 shadow-lg">
            <h3 className="font-bold text-[#0F172A]">Notifications</h3>
            {notifications.length ? (
              notifications.map((notification) => (
                <div
                  key={notification.notification_id}
                  className="border-b border-slate-50 py-3"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-xs text-[#64748B]">
                    {notification.message}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-5 text-sm text-[#64748B]">
                No new notifications
              </p>
            )}
          </div>
        )}
        {role === "Teacher" ? (
          <div className="hidden items-center gap-2 sm:flex">
            <Avatar initials={userName.split(" ").map((part) => part[0]).join("").slice(0, 2)} />
            <div className="leading-tight">
              <p className="text-xs font-semibold text-[#0F172A]">{userName}</p>
              <p className="text-[10px] text-[#64748B]">Teacher</p>
            </div>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="hidden items-center gap-2 rounded-xl border border-[#DBEAFE] px-3 py-2 text-xs font-semibold text-[#0052CC] hover:bg-[#EFF6FF] sm:flex"
          >
            <LogOut size={14} /> Logout
          </button>
        )}
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
  detail,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  detail?: string;
  icon: any;
  tone?: "blue" | "green" | "yellow";
}) {
  const toneClasses = {
    blue: "bg-blue-100 text-[#0052CC]",
    green: "bg-emerald-100 text-emerald-700",
    yellow: "bg-amber-100 text-amber-700",
  }[tone];
  return (
    <div className="rounded-2xl border border-[#DBEAFE] bg-white p-3.5 shadow-[0_2px_12px_rgba(29,78,216,.06)] sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-[#475569] sm:text-xs">
            {label}
          </p>
          <p className="mt-1.5 text-xl font-bold tracking-tight text-[#0F172A] sm:mt-2 sm:text-2xl">
            {value}
          </p>
          {detail && (
            <p className="mt-1 truncate text-[10px] text-[#475569] sm:text-xs">
              {detail}
            </p>
          )}
        </div>
        <div className={`shrink-0 rounded-xl p-2 sm:p-2.5 ${toneClasses}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function NotificationList({
  notifications,
  tone = "blue",
}: {
  notifications: Array<{ notification_id: number | string; title: string; message: string }>;
  tone?: "blue" | "yellow";
}) {
  const colors = tone === "yellow"
    ? { border: "border-[#FED7AA]", background: "bg-[#FFF7ED]", title: "text-[#7C2D12]", body: "text-[#9A3412]", dot: "bg-[#F59E0B]" }
    : { border: "border-[#DBEAFE]", background: "bg-white", title: "text-[#0F172A]", body: "text-[#64748B]", dot: "bg-[#2563EB]" };

  return (
    <section className={`rounded-2xl border p-5 ${colors.border} ${colors.background}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={`font-bold ${colors.title}`}>Notifications</h2>
        <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-[#64748B]">{notifications.length}</span>
      </div>
      {notifications.length ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {notifications.map((notification) => (
            <div key={notification.notification_id} className="flex gap-3">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${colors.dot}`} />
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${colors.title}`}>{notification.title}</p>
                <p className={`mt-1 text-xs leading-5 ${colors.body}`}>{notification.message}</p>
              </div>
            </div>
          ))}
        </div>
      ) : <p className={`mt-4 text-sm ${colors.body}`}>No notifications yet.</p>}
    </section>
  );
}

function StudentGradeRow({
  student,
  exercise,
  initialGrade,
  submission,
  onGradeChange,
  onNotify
}: {
  student: AttendanceStudent;
  exercise: TeacherExercise;
  initialGrade?: Grade;
  submission?: Submission;
  onGradeChange: () => void;
  onNotify: () => void;
}) {
  const [score, setScore] = useState<string>(initialGrade ? String(initialGrade.score) : "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialGrade) setScore(String(initialGrade.score));
  }, [initialGrade]);

  const handleSave = async () => {
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore === initialGrade?.score) return;
    setSaving(true);
    try {
      if (initialGrade?.grade_id) {
        await api.updateGrade(initialGrade.grade_id, numScore);
      } else {
        await api.createGrades([{ score: numScore, student_id: student.student_id, exercise_id: exercise.exercise_id }]);
      }
      onGradeChange();
    } catch (e) {
      console.error("Failed to save grade:", e);
      alert("Failed to save grade");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-3 border-b border-slate-50 py-3">
      <Avatar
        initials={student.full_name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)}
      />
      <div className="flex-1">
        <span className="text-sm font-semibold text-slate-700">
          {student.full_name}
        </span>
        {submission ? (
          <span className="ml-3 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
            Submitted
          </span>
        ) : (
          <span className="ml-3 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Pending
          </span>
        )}
      </div>

      {submission && (
        <a
          href={getFileUrl(submission.file_path)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#0052CC] transition hover:bg-blue-50"
        >
          <Eye size={14} /> View
        </a>
      )}

      <div className="ml-2 flex items-center gap-2">
        <input
          type="number"
          min="0"
          max={exercise.max_score}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          onBlur={handleSave}
          className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-center text-sm font-bold text-[#0052CC] outline-none transition focus:border-[#0052CC] focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="-"
          disabled={saving || (!submission && !initialGrade)}
          title={(!submission && !initialGrade) ? "The student must submit the exercise before it can be graded." : ""}
        />
        <span className="text-sm font-bold text-slate-400">/ {exercise.max_score}</span>
      </div>

      <button
        onClick={onNotify}
        className="ml-2 rounded-full p-2 text-[#475569] transition hover:bg-blue-50 hover:text-[#0052CC]"
        title="Notify Student"
      >
        <Bell size={16} />
      </button>
    </div>
  );
}

function DynamicTeacherWorkspace({
  active,
  teacher,
  students,
  courses,
  exercises,
  grades,
  attendance,
  teacherNotifications,
  onAttendanceSaved,
  reload,
}: {
  active: string;
  teacher: Teacher;
  students: AttendanceStudent[];
  courses: TeacherCourse[];
  exercises: TeacherExercise[];
  grades: Grade[];
  attendance: AttendanceRecord[];
  teacherNotifications: TeacherNotification[];
  onAttendanceSaved: () => void;
  reload: () => Promise<void>;
}) {
  const [profileImage, setProfileImage] = useState("");
  const [classId, setClassId] = useState(teacher.classes[0]?.class_id ?? 0);
  const [exerciseId, setExerciseId] = useState(exercises[0]?.exercise_id ?? 0);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    setProfileImage(window.localStorage.getItem("eduinsight_teacher_profile_image") ?? "");
  }, []);

  const handleProfileImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result);
      setProfileImage(image);
      window.localStorage.setItem("eduinsight_teacher_profile_image", image);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (exerciseId) {
      api.getExerciseSubmissions(exerciseId).then(setSubmissions).catch(() => setSubmissions([]));
    } else {
      setSubmissions([]);
    }
  }, [exerciseId]);

  const [statuses, setStatuses] = useState<Record<number, "present" | "absent">>(() =>
    Object.fromEntries(
      students.map((student) => [student.student_id, "absent"]),
    ) as Record<number, "present" | "absent">,
  );
  const [saving, setSaving] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseSubject, setNewCourseSubject] = useState("");
  const [newCourseFile, setNewCourseFile] = useState<File | undefined>();
  const [newCourseClassId, setNewCourseClassId] = useState(teacher.classes[0]?.class_id ?? 0);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseMaxScore, setNewExerciseMaxScore] = useState(20);
  const [newExerciseFile, setNewExerciseFile] = useState<File | undefined>();
  const [newExerciseCourseId, setNewExerciseCourseId] = useState(courses[0]?.course_id ?? 0);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [dmStudentId, setDmStudentId] = useState<number | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [dmTitle, setDmTitle] = useState("");
  const [dmMessage, setDmMessage] = useState("");
  const [messageMode, setMessageMode] = useState<"student" | "class">("student");
  const [broadcastClassId, setBroadcastClassId] = useState(teacher.classes[0]?.class_id ?? 0);

  const selectedStudents = students.filter(
    (student) => student.class_id === classId,
  );
  const selectedExercise = exercises.find(
    (exercise) => exercise.exercise_id === exerciseId,
  );
  const today = new Date().toISOString().slice(0, 10);
  const todayAttendance = attendance.filter(
    (record) => record.date === today && record.class_id === classId,
  );
  const presentCount = todayAttendance.filter(
    (record) => record.status === "present",
  ).length;
  const attendancePercent = selectedStudents.length
    ? Math.round((presentCount / selectedStudents.length) * 100)
    : 0;

  useEffect(() => {
    const current = Object.fromEntries(
      students.map((student) => [student.student_id, "absent"] as const),
    ) as Record<number, "present" | "absent">;
    attendance
      .filter((record) => record.date === today && record.class_id === classId)
      .forEach((record) => {
        current[record.student_id] = record.status;
      });
    setStatuses(current);
  }, [students, attendance, classId, today]);

  const saveAttendance = async () => {
    setSaving(true);
    try {
      await api.saveAttendance(
        classId,
        today,
        selectedStudents.map((student) => ({
          student_id: student.student_id,
          status: statuses[student.student_id] ?? "absent",
        })),
      );
      onAttendanceSaved();
    } finally {
      setSaving(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName || !newCourseSubject || !newCourseClassId) return;
    setWorkspaceError("");
    setSaving(true);
    try {
      await api.createCourse({
        course_name: newCourseName,
        semester: newCourseSubject,
        class_id: newCourseClassId,
        file: newCourseFile,
      });
      setShowCourseModal(false);
      setNewCourseName("");
      setNewCourseSubject("");
      setNewCourseFile(undefined);
      await reload();
    } catch (submissionError) {
      setWorkspaceError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to create the course.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseName || !newExerciseCourseId) return;
    setWorkspaceError("");
    setSaving(true);
    try {
      await api.createExercise({
        exercise_name: newExerciseName,
        max_score: newExerciseMaxScore,
        course_id: newExerciseCourseId,
        file: newExerciseFile,
      });
      setShowExerciseModal(false);
      setNewExerciseName("");
      setNewExerciseMaxScore(20);
      setNewExerciseFile(undefined);
      await reload();
    } catch (submissionError) {
      setWorkspaceError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to create the exercise.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementMessage) return;
    setSaving(true);
    try {
      await api.sendClassAnnouncement({ title: announcementTitle, message: announcementMessage });
      setShowAnnouncementModal(false);
      setAnnouncementTitle("");
      setAnnouncementMessage("");
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmStudentId || !dmTitle || !dmMessage) return;
    setSaving(true);
    try {
      await api.sendStudentFeedback(dmStudentId, { title: dmTitle, message: dmMessage });
      setDmStudentId(null);
      setDmTitle("");
      setDmMessage("");
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") ?? "");
    setWorkspaceError("");
    setSaving(true);
    try {
      await api.updateTeacherProfile({
        full_name: String(data.get("full_name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone_number: String(data.get("phone_number") ?? ""),
        ...(password ? { password } : {}),
      });
      await reload();
      setWorkspaceError("Profile updated successfully.");
    } catch (profileError) {
      setWorkspaceError(profileError instanceof Error ? profileError.message : "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (active === "Notifications") {
    const matchingStudents = students.filter((student) =>
      `${student.full_name} ${student.level ?? ""}`.toLowerCase().includes(studentSearch.toLowerCase()),
    );
    const selectedStudent = students.find((student) => student.student_id === dmStudentId);
    return (
      <section id="notifications" className="space-y-6">
        <div>
          <p className="text-sm text-[#475569]">Contact one student directly</p>
          <h2 className="mt-1 text-2xl font-bold text-[#0F172A]">Send a message</h2>
        </div>
        <div className="mb-2 flex w-fit rounded-xl bg-slate-100 p-1">
          <button type="button" onClick={() => setMessageMode("student")} className={`rounded-lg px-4 py-2 text-xs font-bold ${messageMode === "student" ? "bg-white text-[#1769E0] shadow-sm" : "text-[#64748B]"}`}>One student</button>
          <button type="button" onClick={() => setMessageMode("class")} className={`rounded-lg px-4 py-2 text-xs font-bold ${messageMode === "class" ? "bg-white text-[#1769E0] shadow-sm" : "text-[#64748B]"}`}>Whole class</button>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border border-[#DBE2EA] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,.03)]">
            <div className="border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-[#0F172A]">{messageMode === "student" ? "Find a student" : "Choose a class"}</h3>
                <p className="mt-1 text-xs text-[#64748B]">{messageMode === "student" ? "Search by student name or academic level." : "The message will be sent to every student in this class."}</p>
              </div>
              {messageMode === "student" ? (
                <input value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Search name or level..." className="mt-4 w-full rounded-lg border border-[#DBE2EA] px-3 py-2.5 text-sm outline-none focus:border-[#0052CC]" />
              ) : (
                <select value={broadcastClassId} onChange={(event) => setBroadcastClassId(Number(event.target.value))} className="mt-4 w-full rounded-lg border border-[#DBE2EA] px-3 py-2.5 text-sm outline-none focus:border-[#0052CC]">
                  {teacher.classes.map((item) => <option key={item.class_id} value={item.class_id}>{item.name} · {item.academic_year}</option>)}
                </select>
              )}
            </div>
            {messageMode === "student" && <div className="mt-3 divide-y divide-slate-100">
              {matchingStudents.length ? matchingStudents.map((student) => (
                <button key={student.student_id} type="button" onClick={() => setDmStudentId(student.student_id)} className={`flex w-full items-center gap-3 px-2 py-3 text-left ${dmStudentId === student.student_id ? "rounded-lg bg-blue-50" : "hover:bg-slate-50"}`}>
                  <Avatar initials={student.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()} />
                  <span className="min-w-0 flex-1"><strong className="block truncate text-sm text-[#0F172A]">{student.full_name}</strong><span className="text-xs text-[#64748B]">{student.level ?? "No level"} · {student.email}</span></span>
                  {dmStudentId === student.student_id && <Check className="size-4 text-[#1769E0]" />}
                </button>
              )) : <p className="py-8 text-center text-sm text-[#64748B]">No students match your search.</p>}
            </div>}
            {messageMode === "class" && <div className="mt-5 rounded-xl bg-blue-50 p-4"><p className="text-sm font-semibold text-[#1769E0]">{teacher.classes.find((item) => item.class_id === broadcastClassId)?.name}</p><p className="mt-1 text-xs text-[#64748B]">{students.filter((student) => student.class_id === broadcastClassId).length} students will receive this message.</p></div>}
          </section>
          <section className="rounded-2xl border border-[#DBE2EA] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,.03)]">
            <h3 className="font-bold text-[#0F172A]">Message student</h3>
            <p className="mt-1 text-xs leading-5 text-[#64748B]">{messageMode === "student" ? (selectedStudent ? `Send a private message to ${selectedStudent.full_name}.` : "Select one student from the list first.") : "Send one message to every student in the selected class."}</p>
            <form onSubmit={async (event) => { if (messageMode === "student") { await handleSendDirectMessage(event); return; } event.preventDefault(); if (!announcementTitle || !announcementMessage) return; setSaving(true); try { await api.sendClassAnnouncement({ title: announcementTitle, message: announcementMessage, class_id: broadcastClassId }); setAnnouncementTitle(""); setAnnouncementMessage(""); setWorkspaceError("Message sent to the class successfully."); } catch (error) { setWorkspaceError(error instanceof Error ? error.message : "Unable to send class message."); } finally { setSaving(false); } }} className="mt-5 space-y-4">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">
                Title
                <input value={messageMode === "student" ? dmTitle : announcementTitle} onChange={(event) => messageMode === "student" ? setDmTitle(event.target.value) : setAnnouncementTitle(event.target.value)} required placeholder="Message title" className="rounded-lg border border-[#DBE2EA] px-3 py-2.5 font-normal outline-none focus:border-[#0052CC]" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">
                Message
                <textarea value={messageMode === "student" ? dmMessage : announcementMessage} onChange={(event) => messageMode === "student" ? setDmMessage(event.target.value) : setAnnouncementMessage(event.target.value)} required rows={5} placeholder="Write your message..." className="resize-none rounded-lg border border-[#DBE2EA] px-3 py-2.5 font-normal outline-none focus:border-[#0052CC]" />
              </label>
              <button type="submit" disabled={saving || (messageMode === "student" && dmStudentId === null)} className="rounded-xl bg-[#0052CC] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                {saving ? "Sending..." : "Send message"}
              </button>
            </form>
          </section>
        </div>
      </section>
    );
  }

  if (active === "Profile") {
    return (
      <section id="profile" className="max-w-2xl space-y-6">
        <div>
          <p className="text-sm text-[#475569]">Your account details</p>
          <h2 className="mt-1 text-2xl font-bold text-[#0F172A]">Profile</h2>
        </div>
        <form onSubmit={handleProfileSubmit} className="rounded-2xl border border-[#DBE2EA] bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,.03)]">
          <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-5">
            <Avatar initials={teacher.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()} className="h-12 w-12" />
            <div>
              <p className="font-bold text-[#0F172A]">{teacher.full_name}</p>
              <p className="text-sm text-[#64748B]">Teacher account</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">
              Full name
              <input name="full_name" defaultValue={teacher.full_name} required className="rounded-lg border border-[#DBE2EA] px-3 py-2.5 font-normal outline-none focus:border-[#0052CC]" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">
              Email
              <input name="email" type="email" defaultValue={teacher.email} required className="rounded-lg border border-[#DBE2EA] px-3 py-2.5 font-normal outline-none focus:border-[#0052CC]" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">
              Phone number
              <input name="phone_number" defaultValue={teacher.phone_number ?? ""} className="rounded-lg border border-[#DBE2EA] px-3 py-2.5 font-normal outline-none focus:border-[#0052CC]" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">
              New password
              <input name="password" type="password" placeholder="Leave blank to keep current" className="rounded-lg border border-[#DBE2EA] px-3 py-2.5 font-normal outline-none focus:border-[#0052CC]" />
            </label>
          </div>
          {workspaceError && <p className={`mt-4 text-sm ${workspaceError.includes("success") ? "text-emerald-600" : "text-red-600"}`}>{workspaceError}</p>}
          <button type="submit" disabled={saving} className="mt-6 rounded-xl bg-[#0052CC] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>
    );
  }

  if (active === "My Students") {
    return (
      <section id="my-students" className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A]">My Students</h2>
          <p className="mt-1 text-sm text-[#64748B]">{students.length} students across your classes.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#DBEAFE] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-[#DBEAFE] text-sm text-[#334155]">
                  <th className="px-4 py-4 font-semibold">Student</th>
                  <th className="px-4 py-4 font-semibold">Class</th>
                  <th className="px-4 py-4 font-semibold">Level</th>
                  <th className="px-4 py-4 font-semibold">Average</th>
                  <th className="px-4 py-4 text-right font-semibold">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {students.map((student) => {
                  const studentGrades = grades.filter((grade) => grade.student_id === student.student_id);
                  const normalizedScores = studentGrades.flatMap((grade) => {
                    const exercise = exercises.find((item) => item.exercise_id === grade.exercise_id);
                    const score = Number(grade.score);
                    const maxScore = Number(exercise?.max_score);
                    if (!Number.isFinite(score)) return [];
                    if (Number.isFinite(maxScore) && maxScore > 0) return [(score / maxScore) * 20];
                    return [score];
                  });
                  const average = normalizedScores.length
                    ? normalizedScores.reduce((total, score) => total + score, 0) / normalizedScores.length
                    : null;
                  const performance = average === null
                    ? null
                    : average >= 16
                      ? { label: "Excellent", className: "bg-emerald-50 text-emerald-600" }
                      : average >= 12
                        ? { label: "Good", className: "bg-emerald-50 text-emerald-600" }
                        : { label: "Needs attention", className: "bg-amber-50 text-amber-600" };
                  const initials = student.full_name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const studentClass = teacher.classes.find((item) => item.class_id === student.class_id);

                  return (
                    <tr key={student.student_id} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar initials={initials} />
                          <div>
                            <p className="text-sm font-semibold text-[#334155]">{student.full_name}</p>
                            <p className="text-xs text-[#94A3B8]">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#475569]">{studentClass?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-[#475569]">{student.level ?? "—"}</td>
                      <td className={`px-4 py-3 text-sm font-bold ${average === null ? "text-[#64748B]" : average < 12 ? "text-amber-500" : "text-emerald-600"}`}>
                        {average === null ? "—" : `${average.toFixed(1)} / 20`}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {performance ? (
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${performance.className}`}>
                            {performance.label}
                          </span>
                        ) : (
                          <span className="text-sm text-[#64748B]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!students.length && <p className="p-8 text-center text-sm text-[#64748B]">No students assigned to your classes.</p>}
        </div>
      </section>
    );
  }

  if (active === "My Classes") {
    return (
      <section id="my-classes" className="space-y-6">
        <div>
          <p className="text-sm text-[#475569]">Manage your students</p>
          <h2 className="mt-1 text-2xl font-bold text-[#0F172A]">My Classes</h2>
        </div>
        {teacher.classes.length ? (
          <div className="grid items-start gap-6 xl:grid-cols-2">
            {teacher.classes.map((item) => {
          const classStudents = students.filter((student) => student.class_id === item.class_id);
          const classCourses = courses.filter((course) => course.level === item.name);
          const classScores = classStudents.flatMap((student) => grades
            .filter((grade) => grade.student_id === student.student_id)
            .flatMap((grade) => {
              const exercise = exercises.find((entry) => entry.exercise_id === grade.exercise_id);
              const score = Number(grade.score);
              const maxScore = Number(exercise?.max_score);
              if (!Number.isFinite(score)) return [];
              return [Number.isFinite(maxScore) && maxScore > 0 ? (score / maxScore) * 20 : score];
            }));
          const classAverage = classScores.length
            ? classScores.reduce((total, score) => total + score, 0) / classScores.length
            : null;
          const progress = classAverage === null ? 0 : Math.min(100, Math.max(0, (classAverage / 20) * 100));

          return (
            <div key={item.class_id} className="space-y-4">
              <article className="max-w-xl rounded-2xl border border-[#DBE2EA] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,.03)]">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#1769E0]"><BookOpen size={21} /></span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1769E0]">{item.name}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#0F172A]">{item.name}</h3>
                <p className="mt-1 text-sm text-[#64748B]">{classStudents.length} students · {classCourses.length} of your courses</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-[#64748B]">Average Score</span>
                  <span className={`font-bold ${classAverage === null ? "text-[#64748B]" : classAverage >= 12 ? "text-emerald-600" : "text-amber-500"}`}>
                    {classAverage === null ? "No grades yet" : `${classAverage.toFixed(1)} / 20`}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E8EEF4]"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} /></div>
                <p className={`mt-2 text-xs font-semibold ${classAverage !== null && classAverage >= 12 ? "text-emerald-600" : "text-[#64748B]"}`}>
                  {classAverage === null ? "No grades yet" : classAverage >= 12 ? "Good" : "Needs attention"}
                </p>
              </article>

              <div className="overflow-hidden rounded-2xl border border-[#DBE2EA] bg-white">
                <div className="border-b border-[#DBE2EA] px-5 py-4">
                  <h3 className="font-bold text-[#0F172A]">{item.name} — Student Statistics</h3>
                  <p className="mt-1 text-xs text-[#64748B]">Grades are calculated on a 20-point scale.</p>
                </div>
                {classStudents.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#F8FAFC] text-[10px] uppercase tracking-wider text-[#64748B]"><tr><th className="px-3 py-2.5">Student</th><th className="px-3 py-2.5">Average</th><th className="px-3 py-2.5 text-right">Performance</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {classStudents.map((student) => {
                          const scores = grades.filter((grade) => grade.student_id === student.student_id).flatMap((grade) => {
                            const exercise = exercises.find((entry) => entry.exercise_id === grade.exercise_id);
                            const score = Number(grade.score);
                            const maxScore = Number(exercise?.max_score);
                            if (!Number.isFinite(score)) return [];
                            return [Number.isFinite(maxScore) && maxScore > 0 ? (score / maxScore) * 20 : score];
                          });
                          const average = scores.length ? scores.reduce((total, score) => total + score, 0) / scores.length : null;
                          const good = average !== null && average >= 12;
                          return <tr key={student.student_id} className="hover:bg-[#F8FAFC]"><td className="px-3 py-2"><div className="flex items-center gap-2"><Avatar initials={student.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()} className="h-8 w-8" /><span className="truncate text-sm font-semibold text-[#334155]">{student.full_name}</span></div></td><td className={`px-3 py-2 text-sm font-bold ${average === null ? "text-[#64748B]" : good ? "text-emerald-600" : "text-amber-500"}`}>{average === null ? "—" : `${average.toFixed(1)} / 20`}</td><td className="px-3 py-2 text-right"><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${average === null ? "bg-slate-100 text-[#64748B]" : good ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{average === null ? "No grades" : good ? "Good" : "Needs attention"}</span></td></tr>;
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="p-8 text-center text-sm text-[#64748B]">No students currently enrolled in this class.</p>}
              </div>
            </div>
          );
            })}
          </div>
        ) : <p className="text-sm text-[#64748B]">No classes assigned.</p>}
      </section>
    );
  }

  if (active === "My Courses") {
    return (
      <section id="my-courses" className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.length ? courses.map((course) => {
            const courseExercises = exercises.filter(
              (exercise) => exercise.course.course_id === course.course_id,
            );
            const courseClass = teacher.classes.find((item) => item.name === course.level);
            const courseStudents = students.filter((student) => student.class_id === courseClass?.class_id);
            const courseScores = courseStudents.flatMap((student) => grades
              .filter((grade) => grade.student_id === student.student_id && courseExercises.some((exercise) => exercise.exercise_id === grade.exercise_id))
              .flatMap((grade) => {
                const exercise = courseExercises.find((item) => item.exercise_id === grade.exercise_id);
                const score = Number(grade.score);
                const maxScore = Number(exercise?.max_score);
                if (!Number.isFinite(score)) return [];
                return [Number.isFinite(maxScore) && maxScore > 0 ? (score / maxScore) * 20 : score];
              }));
            const courseAverage = courseScores.length
              ? courseScores.reduce((total, score) => total + score, 0) / courseScores.length
              : null;
            const averageClass = courseAverage === null
              ? "text-[#64748B]"
              : courseAverage >= 12
                ? "text-emerald-600"
                : "text-amber-500";
            return (
              <div key={course.course_id} className="flex flex-col rounded-2xl border border-[#DBEAFE] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,.03)]">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#1769E0]">
                    <BookOpen size={20} />
                  </span>
                  {course.material_file_path && (
                    <a href={getFileUrl(course.material_file_path)} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#0052CC] hover:underline">
                      View material
                    </a>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-[#0F172A]">{course.course_name}</h3>
                  <p className="mt-1 text-sm text-[#64748B]">{course.semester} · {course.level}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3 text-sm text-[#64748B]">
                  <span className="inline-flex items-center gap-1.5"><FileText size={14} />{courseExercises.length} exercise{courseExercises.length === 1 ? "" : "s"}</span>
                  <span className="inline-flex items-center gap-1.5 text-amber-600"><Users size={14} />{courseStudents.length} student{courseStudents.length === 1 ? "" : "s"}</span>
                </div>
                <div className={`mt-3 rounded-lg bg-[#F8FAFC] px-3 py-2 ${averageClass}`}>
                  <p className="text-xs">Class average</p>
                  <p className="mt-0.5 text-base font-bold">{courseAverage === null ? "No grades yet" : `${courseAverage.toFixed(1)} / 20`}</p>
                </div>
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                  {courseExercises.length ? courseExercises.map((exercise) => (
                    <div key={exercise.exercise_id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-[#334155]">{exercise.exercise_name}</span>
                      {exercise.material_file_path && (
                        <a href={getFileUrl(exercise.material_file_path)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#0052CC]">
                          View file
                        </a>
                      )}
                    </div>
                  )) : <p className="text-xs text-[#64748B]">No exercises yet.</p>}
                </div>
                <div className="mt-auto flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-semibold text-[#1769E0]">
                  <FileText size={14} />
                  {courseExercises.length} exercise{courseExercises.length === 1 ? "" : "s"}
                </div>
              </div>
            );
          }) : <p className="text-sm text-[#64748B]">No courses created yet.</p>}
        </div>
      </section>
    );
  }

  if (active === "Submissions")
    return (
      <section id="submissions" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">
              Submissions & Grading
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Real students and grades from the backend.
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={exerciseId}
              onChange={(event) => setExerciseId(Number(event.target.value))}
              className="rounded-xl border border-[#DBEAFE] px-3 py-2 text-sm focus:border-[#0052CC] focus:outline-none"
            >
              {exercises.map((item) => (
                <option key={item.exercise_id} value={item.exercise_id}>
                  {item.exercise_name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="rounded-xl bg-[#0052CC] px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Send Class Announcement
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5">
          {selectedExercise && selectedStudents.length ? (
            selectedStudents.map((student) => {
              const grade = grades.find(
                (item) =>
                  item.student_id === student.student_id &&
                  item.exercise_id === selectedExercise.exercise_id,
              );
              const submission = submissions.find(
                (sub) => sub.student_id === student.student_id && sub.exercise_id === selectedExercise.exercise_id
              );
              return (
                <StudentGradeRow
                  key={student.student_id}
                  student={student}
                  exercise={selectedExercise}
                  initialGrade={grade}
                  submission={submission}
                  onGradeChange={reload}
                  onNotify={() => setDmStudentId(student.student_id)}
                />
              );
            })
          ) : (
            <p className="text-sm text-[#64748B]">
              No submissions or exercises available.
            </p>
          )}
        </div>

        {showAnnouncementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-bold text-[#0F172A]">Class Announcement</h3>
              <form onSubmit={handleSendAnnouncement} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Title</label>
                  <input
                    autoFocus
                    required
                    type="text"
                    placeholder="e.g. Important Update"
                    value={announcementTitle}
                    onChange={e => setAnnouncementTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type your message to the class here..."
                    value={announcementMessage}
                    onChange={e => setAnnouncementMessage(e.target.value)}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#0052CC]"
                  ></textarea>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAnnouncementModal(false)}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-[#0052CC] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Sending..." : "Send to Class"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {dmStudentId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-bold text-[#0F172A]">Notify Student</h3>
              <p className="mb-4 text-sm text-slate-500">
                Sending direct message to {students.find(s => s.student_id === dmStudentId)?.full_name}.
              </p>
              <form onSubmit={handleSendDirectMessage} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Title</label>
                  <input
                    autoFocus
                    required
                    type="text"
                    placeholder="e.g. Missing Submission"
                    value={dmTitle}
                    onChange={e => setDmTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#0052CC]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type your message here..."
                    value={dmMessage}
                    onChange={e => setDmMessage(e.target.value)}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#0052CC]"
                  ></textarea>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDmStudentId(null)}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-[#0052CC] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    );

  return (
    <section id="overview" className="space-y-7 relative">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm text-[#475569]">Active class</p>
          <select
            value={classId}
            onChange={(event) => setClassId(Number(event.target.value))}
            className="rounded-xl border border-[#DBEAFE] bg-white px-4 py-3 text-sm font-semibold text-slate-800 focus:border-[#0052CC] focus:outline-none"
          >
            {teacher.classes.map((item) => (
              <option key={item.class_id} value={item.class_id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {workspaceError && (
        <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {workspaceError}
        </p>
      )}

      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-[#0F172A]">Create New Course</h3>
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Course Title</label>
                <input
                  autoFocus
                  required
                  type="text"
                  placeholder="e.g. Advanced Calculus"
                  value={newCourseName}
                  onChange={e => setNewCourseName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#0052CC]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Subject (Semester)</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Mathematics"
                  value={newCourseSubject}
                  onChange={e => setNewCourseSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#0052CC]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Class Group</label>
                <select
                  required
                  value={newCourseClassId}
                  onChange={e => setNewCourseClassId(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#0052CC]"
                >
                  {teacher.classes.map(c => (
                    <option key={c.class_id} value={c.class_id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Course Material (optional)</label>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={e => setNewCourseFile(e.target.files?.[0])}
                  className="w-full text-sm text-slate-600"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#0052CC] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-[#0F172A]">Create New Exercise</h3>
            <form onSubmit={handleAddExercise} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Course</label>
                {courses.length > 0 ? (
                  <select
                    required
                    value={newExerciseCourseId}
                    onChange={e => setNewExerciseCourseId(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#0052CC]"
                  >
                    {courses.map(c => (
                      <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-red-500">You must create a course first.</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Exercise Title</label>
                <input
                  autoFocus
                  required
                  type="text"
                  placeholder="e.g. Integration Practice"
                  value={newExerciseName}
                  onChange={e => setNewExerciseName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#0052CC]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Max Score</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={newExerciseMaxScore}
                  onChange={e => setNewExerciseMaxScore(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#0052CC]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Exercise Material (optional)</label>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={e => setNewExerciseFile(e.target.files?.[0])}
                  className="w-full text-sm text-slate-600"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowExerciseModal(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || courses.length === 0}
                  className="rounded-xl bg-[#0052CC] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Exercise"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="My Courses"
          value={String(courses.length)}
          icon={BookOpen}
        />
        <Stat
          label="My Classes"
          value={String(teacher.classes.length)}
          icon={GraduationCap}
          tone="green"
        />
        <Stat
          label="My Students"
          value={String(students.length)}
          icon={Users}
        />
        <Stat
          label="To Grade"
          value={String(Math.max(0, students.length - grades.length))}
          detail="Submitted"
          icon={ClipboardCheck}
          tone="yellow"
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-5">
        <section className="rounded-2xl border border-[#DBEAFE] bg-white p-5 xl:col-span-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-[#0F172A]">Submissions to Grade</h2>
              <p className="mt-1 text-sm text-[#64748B]">Student work waiting for your feedback.</p>
            </div>
            <button className="text-xs font-semibold text-[#0F172A] hover:text-[#0052CC]">Open <span className="ml-1 text-base">→</span></button>
          </div>
          <div className="mt-5 space-y-3">
            {students.slice(0, 3).map((student, index) => {
              const exercise = exercises[index % Math.max(exercises.length, 1)];
              return (
                <div key={student.student_id} className="flex items-center justify-between gap-3 rounded-lg border border-[#DBEAFE] bg-[#F8FAFC] px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar initials={student.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2)} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#0F172A]">{student.full_name}</p>
                      <p className="truncate text-xs text-[#64748B]">{exercise?.exercise_name ?? "Recent submission"} · {exercise?.course.course_name ?? "Course"}</p>
                    </div>
                  </div>
                  <button className="rounded-lg border border-[#DBEAFE] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A]">Grade</button>
                </div>
              );
            })}
            {!students.length && <p className="py-6 text-center text-sm text-[#64748B]">No submissions waiting for review.</p>}
          </div>
        </section>
        <section className="rounded-2xl border border-[#DBEAFE] bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-[#0F172A]">Notifications</h2>
            <button className="text-xs font-semibold text-[#0F172A]">All</button>
          </div>
          <div className="mt-5 space-y-5">
            {(teacherNotifications.length ? teacherNotifications.slice(0, 3) : [
              { notification_id: "attendance", title: "Attendance reminder", message: "Record attendance for today's class." },
              { notification_id: "submissions", title: "New submissions to grade", message: `${Math.max(0, students.length - grades.length)} submissions are pending review.` },
            ]).map((notification) => (
              <div key={notification.notification_id} className="flex gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#2563EB]" />
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{notification.title}</p>
                  <p className="mt-1 text-xs leading-4 text-[#64748B]">{notification.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="rounded-2xl border border-[#DBEAFE] bg-white p-5">
        <h2 className="font-bold text-[#0F172A]">Class Performance by Course</h2>
        <p className="mt-1 text-sm text-[#64748B]">Average student score in each of your courses.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {courses.slice(0, 4).map((course, index) => {
            const progress = 55 + ((index * 13) % 35);
            return (
              <div key={course.course_id} className="rounded-lg border border-[#DBEAFE] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">{course.course_name}</p>
                    <p className="mt-1 text-xs text-[#64748B]">{course.semester} · {students.length} students</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{(progress / 5).toFixed(1)} / 20</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} /></div>
              </div>
            );
          })}
          {!courses.length && <p className="text-sm text-[#64748B]">No courses available.</p>}
        </div>
      </section>
      <NotificationList notifications={teacherNotifications} />
    </section>
  );
}

function AdminDashboard({
  students,
  teachers,
  classes,
}: {
  students: AdminStudent[];
  teachers: AdminTeacher[];
  classes: AdminClass[];
}) {
  const [tab, setTab] = useState("Students");
  const [query, setQuery] = useState("");
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.email.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-[#475569]">
            Administration workspace
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">
            People, classes &amp; access
          </h2>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-[#DBEAFE] px-4 py-3 text-xs font-bold text-slate-700">
            <Download size={15} /> Export records
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-[#0052CC] px-4 py-3 text-xs font-bold text-white">
            <Plus size={15} /> Add {tab.slice(0, -1)}
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Total students"
          value={String(students.length)}
          icon={GraduationCap}
        />
        <Stat
          label="Teaching staff"
          value={String(teachers.length)}
          icon={Users}
        />
        <Stat
          label="Active classes"
          value={String(classes.length)}
          icon={BookOpen}
        />
      </div>
      <div className="rounded-2xl border border-[#DBEAFE] bg-white">
        <div className="flex flex-col justify-between gap-4 border-b border-[#DBEAFE] p-5 md:flex-row md:items-center">
          <div className="flex gap-1 rounded-lg bg-[#EFF6FF] p-1">
            {["Students", "Teachers", "Classes"].map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`rounded-md px-4 py-2 text-xs font-bold ${tab === item ? "bg-white text-[#0052CC] shadow-sm" : "text-[#475569]"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-[#475569]"
              size={15}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${tab.toLowerCase()}...`}
              className="w-full rounded-lg border border-[#DBEAFE] py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-500 md:w-64"
            />
          </div>
        </div>
        {tab === "Students" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#DBEAFE] text-[10px] uppercase tracking-wider text-[#475569]">
                  <th className="px-5 py-3">Student</th>
                  <th className="px-3 py-3">Class</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <tr
                    key={student.email}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar initials={student.initials} />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            {student.name}
                          </p>
                          <p className="text-[11px] text-[#475569]">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs font-medium text-slate-600">
                      {student.className}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${student.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-[#EFF6FF] text-[#475569]"}`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="rounded-lg p-2 text-[#475569] hover:bg-white">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {(tab === "Teachers" ? teachers : classes).map((item) => (
              <div
                key={"teacher_id" in item ? item.teacher_id : item.class_id}
                className="flex items-center gap-3 rounded-xl border border-[#DBEAFE] p-4"
              >
                <div className="rounded-xl bg-blue-50 p-2.5 text-[#0052CC]">
                  {tab === "Teachers" ? (
                    <Users size={17} />
                  ) : (
                    <BookOpen size={17} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {"full_name" in item ? item.full_name : item.name}
                  </p>
                  <p className="text-xs text-[#475569]">
                    {"full_name" in item
                      ? `${item.classes.length} assigned classes`
                      : item.academic_year}
                  </p>
                </div>
                <button className="rounded-lg p-2 text-[#475569] hover:bg-white">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <section className="rounded-2xl border border-[#DBEAFE] bg-white p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-[#0F172A]">
              Monthly attendance report
            </h2>
            <p className="mt-1 text-xs text-[#475569]">
              Review attendance trends across your classes.
            </p>
          </div>
          <div className="flex gap-2">
            <select className="rounded-lg border border-[#DBEAFE] px-3 py-2 text-xs">
              <option>April 2024</option>
              <option>March 2024</option>
            </select>
            <button className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-[#0052CC]">
              View report
            </button>
          </div>
        </div>
        <div className="mt-5 flex h-24 items-end gap-2">
          {[62, 78, 69, 84, 91, 86, 94, 88, 96, 90, 97, 93].map(
            (height, index) => (
              <div
                key={index}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  style={{ height: `${height}%` }}
                  className="w-full rounded-t-md bg-blue-200 first:bg-[#0052CC]"
                />
                <span className="text-[9px] text-[#475569]">{index + 1}</span>
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
}

function Login({ setRole }: { setRole: (role: Role) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const session = await api.login(
        String(form.get("email") ?? ""),
        String(form.get("password") ?? ""),
      );
      api.saveSession(session);
      window.location.href = `/${session.role}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    }
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7FA] p-4 font-sans sm:p-5">
      <div className="grid w-full max-w-md overflow-hidden rounded-xl border border-[#CBD5E1] bg-white shadow-[0_2px_5px_rgba(15,23,42,.12)]">
        <div className="hidden">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0crM3hmoRRVMnLX5x57rgKCIYcb5gX.png"
            alt="Abstract blue and white wave pattern"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
              <Sparkles size={20} />
            </div>
            <span className="text-lg font-bold">
              EduInsight <span className="text-blue-300">AI</span>
            </span>
          </div>
          <div className="relative">
            <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-blue-200">
              Learn smarter
            </p>
            <h1 className="max-w-sm text-4xl font-bold leading-tight">
              AI-powered learning for everyone.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-blue-100/75">
              One clear space for students, teachers, and the teams that support
              them.
            </p>
          </div>
          <p className="relative text-xs text-blue-100/60">
            © 2024 EduInsight AI
          </p>
        </div>
        <div className="p-7 sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-[70px] w-[70px] items-center justify-center rounded-[18px] bg-[#0052CC] text-white shadow-sm">
              <BookOpen size={34} strokeWidth={2} />
            </div>
            <div className="text-[29px] font-bold tracking-[-0.04em] text-[#07152F]">
              EduInsight AI
            </div>
            <p className="mt-2 text-[17px] text-[#64748B]">
              AI-Powered Learning Platform
            </p>
          </div>
          <p className="text-[22px] font-bold tracking-[-0.02em] text-[#07152F]">
            Welcome back
          </p>
          <h2 className="mt-2 text-[18px] font-normal text-[#526681]">
            Sign in to your account
          </h2>
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                Email
              </label>
              <input
                type="email"
                required
                name="email"
                placeholder="user@eduinsight.ai"
                className="w-full rounded-lg border border-[#DBEAFE] bg-[#F3F6F9] px-4 py-3 text-sm text-[#0F172A] outline-none placeholder:text-[#64748B] focus:border-[#0052CC] focus:ring-2 focus:ring-[#BFDBFE]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#DBEAFE] bg-[#F3F6F9] px-4 py-3 text-sm text-[#0F172A] outline-none placeholder:text-[#64748B] focus:border-[#0052CC] focus:ring-2 focus:ring-[#BFDBFE] pr-11"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <label className="flex items-center gap-2 text-[#475569]">
                <input
                  name="rememberMe"
                  type="checkbox"
                  className="rounded border-[#CBD5E1] text-[#0052CC]"
                />{" "}
                Remember me
              </label>
              <button
                type="button"
                className="font-semibold text-[#2563EB] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            {error && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-[#0052CC] py-3 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
            >
              Sign In
            </button>
          </form>
          <div className="hidden mt-8 space-y-3">
            {(["Student", "Teacher", "Admin"] as Role[]).map((role) => (
              <button
                onClick={() => setRole(role)}
                key={role}
                className="flex w-full items-center gap-4 rounded-xl border border-[#DBEAFE] p-4 text-left transition hover:border-blue-500 hover:bg-blue-50"
              >
                <div className="rounded-lg bg-blue-100 p-2.5 text-[#0052CC]">
                  {role === "Student" ? (
                    <GraduationCap size={18} />
                  ) : role === "Teacher" ? (
                    <ClipboardCheck size={18} />
                  ) : (
                    <ShieldCheck size={18} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">
                    Continue as {role}
                  </p>
                  <p className="mt-1 text-xs text-[#475569]">
                    Explore the {role.toLowerCase()} dashboard
                  </p>
                </div>
                <ChevronRight size={17} className="text-[#475569]" />
              </button>
            ))}
          </div>
          <div className="mt-8 border-t border-[#DBEAFE] pt-6 text-center text-xs text-[#475569]">
            <Link href="/setup" className="font-semibold text-[#0052CC] hover:underline">
              First time setup? Create Admin Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function AdminWorkspace({
  students,
  teachers,
  classes,
  reload,
  adminName,
}: {
  students: AdminStudent[];
  teachers: AdminTeacher[];
  classes: AdminClass[];
  reload: () => Promise<void>;
  adminName: string;
}) {
  const [tab, setTab] = useState<"Students" | "Teachers" | "Classes">(
    "Students",
  );
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [classAssignmentTeacher, setClassAssignmentTeacher] =
    useState<AdminTeacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<AdminTeacher | null>(null);
  const [selectedTeacherClassIds, setSelectedTeacherClassIds] = useState<number[]>([]);
  const [teacherEditError, setTeacherEditError] = useState("");
  const [teacherEditSuccess, setTeacherEditSuccess] = useState("");
  const [savingTeacher, setSavingTeacher] = useState(false);
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
  const [assignmentError, setAssignmentError] = useState("");
  const [report, setReport] = useState<StudentReportData | null>(null);
  const [openStudentMenu, setOpenStudentMenu] = useState<number | null>(null);
  const [editingStudent, setEditingStudent] = useState<AdminStudent | null>(null);
  const [studentEditError, setStudentEditError] = useState("");
  const [studentEditSuccess, setStudentEditSuccess] = useState("");
  const [savingStudent, setSavingStudent] = useState(false);
  const [selectedStudentClassIds, setSelectedStudentClassIds] = useState<number[]>([]);
  const [editing, setEditing] = useState<{ type: string; id: number } | null>(
    null,
  );
  const filteredStudents = students.filter((item) =>
    `${item.name} ${item.email}`.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredTeachers = teachers.filter((item) =>
    `${item.full_name} ${item.email}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const filteredClasses = classes.filter((item) =>
    `${item.name} ${item.academic_year}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      if (tab === "Classes")
        await api.createClass({
          name: String(data.get("name")),
          academic_year: String(data.get("academic_year")),
          teacher_ids: data.getAll("teacher_ids").map(Number),
        });
      if (tab === "Students") {
        // Level and class_id must come from the SAME selected class, not
        // from two independently-typed values. Courses are matched to
        // students by an exact string comparison against `level`, so a
        // free-typed level ("3ac", "3AC ", "3 AC"...) that doesn't exactly
        // match a real class name silently orphans the student from every
        // course/exercise in that class, even though class_id looks fine.
        const selectedClassId = Number(data.get("class_id")) || undefined;
        const selectedClass = classes.find(
          (c) => c.class_id === selectedClassId,
        );
        if (!selectedClass) {
          setError("Please select a class for the student.");
          return;
        }
        await api.createStudent({
          full_name: String(data.get("full_name")),
          email: String(data.get("email")),
          password: String(data.get("password")),
          phone_number: String(data.get("phone_number")),
          level: selectedClass.name,
          class_id: selectedClass.class_id,
        });
      }
      if (tab === "Teachers")
        await api.createTeacher({
          full_name: String(data.get("full_name")),
          email: String(data.get("email")),
          password: String(data.get("password")),
          phone_number: String(data.get("phone_number")),
          class_ids: data.getAll("class_ids").map(Number),
        });
      setFormOpen(false);
      await reload();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Request failed",
      );
    }
  };
  const addClassesToTeacher = async () => {
    if (!classAssignmentTeacher || selectedClassIds.length === 0) return;
    setAssignmentError("");
    try {
      await api.assignTeacherClasses(
        classAssignmentTeacher.teacher_id,
        selectedClassIds,
      );
      setClassAssignmentTeacher(null);
      setSelectedClassIds([]);
      await reload();
    } catch (assignmentSubmissionError) {
      setAssignmentError(
        assignmentSubmissionError instanceof Error
          ? assignmentSubmissionError.message
          : "Unable to assign classes.",
      );
    }
  };
  const updateTeacher = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingTeacher) return;
    const data = new FormData(event.currentTarget);
    setTeacherEditError("");
    setTeacherEditSuccess("");
    const conflictingClass = classes.find((item) =>
      selectedTeacherClassIds.includes(item.class_id) &&
      teachers.some((teacher) =>
        teacher.teacher_id !== editingTeacher.teacher_id &&
        teacher.classes.some((assignedClass) => assignedClass.class_id === item.class_id),
      ),
    );
    if (conflictingClass) {
      setTeacherEditError(`Cannot assign ${conflictingClass.name} because it is already taught by another teacher.`);
      return;
    }
    setSavingTeacher(true);
    try {
      await api.updateTeacher(editingTeacher.teacher_id, {
        full_name: String(data.get("full_name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone_number: String(data.get("phone_number") ?? ""),
        ...(String(data.get("password") ?? "") ? { password: String(data.get("password")) } : {}),
        class_ids: selectedTeacherClassIds,
      });
      setTeacherEditSuccess("Teacher information updated successfully.");
      await reload();
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : "Unable to update teacher.";
      const conflictingId = message.match(/Class ID (\d+)/)?.[1];
      const conflictingClass = conflictingId ? classes.find((item) => item.class_id === Number(conflictingId)) : null;
      setTeacherEditError(conflictingClass ? `Cannot assign ${conflictingClass.name} because it is already taught by another teacher.` : message);
    } finally {
      setSavingTeacher(false);
    }
  };
  const remove = async (type: string, id: number) => {
    if (!window.confirm("Delete this record?")) return;
    if (type === "student") await api.deleteStudent(id);
    if (type === "teacher") await api.deleteTeacher(id);
    if (type === "class") await api.deleteClass(id);
    await reload();
  };
  const updateStudent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingStudent?.student_id) return;
    const data = new FormData(event.currentTarget);
    setStudentEditError("");
    setStudentEditSuccess("");
    const selectedClassIds = selectedStudentClassIds;
    if (!selectedClassIds.length) {
      setStudentEditError("Please select at least one class for the student.");
      return;
    }
    const selectedClassId = selectedClassIds[0];
    const selectedClasses = classes.filter((item) => selectedClassIds.includes(item.class_id));
    const academicLevels = new Set(selectedClasses.map((item) => item.name.trim().split(/\s+/)[0].toUpperCase()));
    if (academicLevels.size > 1) {
      setStudentEditError("Impossible to combine classes from different academic levels (e.g., 3AC and 1BAC).");
      return;
    }
    const selectedClass = selectedClasses[0];
    setSavingStudent(true);
    try {
      await api.updateStudent(editingStudent.student_id, {
        full_name: String(data.get("full_name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone_number: String(data.get("phone_number") ?? ""),
        ...(String(data.get("password") ?? "") ? { password: String(data.get("password")) } : {}),
        class_id: selectedClassId,
        class_ids: selectedClassIds,
        level: selectedClass?.name,
      });
      setStudentEditSuccess("Student information updated successfully.");
      await reload();
    } catch (updateError) {
      setStudentEditError(updateError instanceof Error ? updateError.message : "Unable to update student.");
    } finally {
      setSavingStudent(false);
    }
  };
  return (
    <section id="overview" className="space-y-7">
      <section className="relative overflow-hidden rounded-2xl border border-[#DDE8DF] bg-[#F0FDF4] p-6 shadow-[0_2px_12px_rgba(22,101,52,.05)] sm:p-7">
        <div className="absolute -right-10 -top-16 h-36 w-36 rounded-full bg-[#DCFCE7]" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-bold text-[#15803D]"><span className="h-2 w-2 rounded-full bg-[#EAB308]" /> Active administration workspace</div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#07152F] sm:text-3xl">Welcome back, {adminName}! <span aria-hidden="true">👋</span></h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#3F5875]">Manage your learning community, classes, and academic access from one place.</p>
        </div>
      </section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[#475569]">
            Manage your learning community
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#0F172A]">
            People & classes
          </h2>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="rounded-xl bg-[#EAB308] px-4 py-3 text-xs font-bold text-[#422006] transition hover:bg-[#FACC15]"
        >
          <Plus size={15} className="mr-2 inline" />
          Add {tab.slice(0, -1)}
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Total students"
          value={String(students.length)}
          icon={GraduationCap}
          tone="green"
        />
        <Stat
          label="Teaching staff"
          value={String(teachers.length)}
          icon={Users}
          tone="yellow"
        />
        <Stat
          label="Active classes"
          value={String(classes.length)}
          icon={BookOpen}
          tone="green"
        />
      </div>
      <div className="rounded-2xl border border-[#DDE8DF] bg-white shadow-[0_2px_12px_rgba(22,101,52,.05)]">
        <div className="flex flex-wrap justify-between gap-4 border-b border-[#E2E8F0] p-5">
          <div className="flex gap-1 rounded-lg bg-[#FEF9C3] p-1">
            {(["Students", "Teachers", "Classes"] as const).map((item) => (
              <button
                key={item}
                onClick={() => {
                  setTab(item);
                  setQuery("");
                }}
                className={`rounded-md px-4 py-2 text-xs font-bold ${tab === item ? "bg-white text-[#15803D] shadow-sm" : "text-[#475569]"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${tab.toLowerCase()}...`}
            className="rounded-lg border border-[#DDE8DF] px-3 py-2 text-xs outline-none focus:border-[#EAB308] focus:ring-2 focus:ring-[#FEF08A]"
          />
        </div>
        <div className="divide-y divide-slate-100 p-5">
          {tab === "Students" &&
            (filteredStudents.length ? (
              filteredStudents.map((item) => (
                <div key={item.email} className="flex items-center gap-3 py-3">
                  <Avatar initials={item.initials} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {item.email} · {item.className || "No class"}
                    </p>
                    {!item.className && (
                      <p className="mt-0.5 text-[11px] font-semibold text-[#B45309]">
                        No class assigned — won't see any courses or exercises
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      aria-label={`Actions for ${item.name}`}
                      onClick={() => setOpenStudentMenu(openStudentMenu === item.student_id ? null : item.student_id ?? null)}
                      disabled={!item.student_id}
                      className="rounded-lg p-2 text-lg font-bold leading-none text-[#475569] transition hover:bg-[#FEF9C3] disabled:opacity-40"
                    >
                      ...
                    </button>
                    {openStudentMenu === item.student_id && item.student_id && (
                      <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-[#DDE8DF] bg-white p-1.5 text-left shadow-lg">
                        <button type="button" onClick={() => { setEditingStudent(item); setSelectedStudentClassIds(item.class_ids?.length ? item.class_ids : item.class_id ? [item.class_id] : []); setOpenStudentMenu(null); setStudentEditError(""); setStudentEditSuccess(""); }} className="flex w-full rounded-lg px-3 py-2 text-xs font-semibold text-[#334155] hover:bg-[#FEF9C3]">Update information</button>
                        <button type="button" onClick={() => { api.getStudentReport(item.student_id as number).then((data) => setReport(data as StudentReportData)); setOpenStudentMenu(null); }} className="flex w-full rounded-lg px-3 py-2 text-xs font-semibold text-[#A16207] hover:bg-[#FEF9C3]">Get grades</button>
                        <button type="button" onClick={() => { remove("student", item.student_id as number); setOpenStudentMenu(null); }} className="flex w-full rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="py-5 text-sm text-[#64748B]">No students found.</p>
            ))}
          {tab === "Teachers" &&
            (filteredTeachers.length ? (
              filteredTeachers.map((item) => (
                <div
                  key={item.teacher_id}
                  className="flex items-center gap-3 py-3"
                >
                  <Avatar
                    initials={item.full_name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {item.full_name}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {item.email} · {item.classes.length} classes
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setTeacherEditError("");
                      setTeacherEditSuccess("");
                      setSelectedTeacherClassIds(item.classes.map((assignedClass) => assignedClass.class_id));
                      setEditingTeacher(item);
                    }}
                    className="text-xs font-semibold text-[#15803D]"
                  >
                    Update information
                  </button>
                  <button
                    onClick={() => remove("teacher", item.teacher_id)}
                    className="text-xs text-rose-600"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p className="py-5 text-sm text-[#64748B]">No teachers found.</p>
            ))}
          {tab === "Classes" &&
            (filteredClasses.length ? (
              filteredClasses.map((item) => (
                <div
                  key={item.class_id}
                  className="flex items-center gap-3 py-3"
                >
                  <BookOpen className="text-[#15803D]" size={18} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {item.academic_year}
                    </p>
                  </div>
                  <button
                    onClick={() => remove("class", item.class_id)}
                    className="text-xs text-rose-600"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p className="py-5 text-sm text-[#64748B]">No classes found.</p>
            ))}
        </div>
      </div>
      {formOpen && (
        <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5">
          <h3 className="font-bold text-[#0F172A]">Add {tab.slice(0, -1)}</h3>
          <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
            {tab === "Classes" ? (
              <>
                <input
                  name="name"
                  required
                  placeholder="Class name"
                  className="rounded-lg border border-[#DBEAFE] px-3 py-2 text-sm"
                />
                <input
                  name="academic_year"
                  required
                  placeholder="Academic year"
                  className="rounded-lg border border-[#DBEAFE] px-3 py-2 text-sm"
                />
                <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                  Assign teachers (optional)
                  <select
                    name="teacher_ids"
                    multiple
                    className="mt-1 min-h-24 w-full rounded-lg border border-[#DBEAFE] px-3 py-2 text-sm font-normal"
                  >
                    {teachers.length ? (
                      teachers.map((teacher) => (
                        <option key={teacher.teacher_id} value={teacher.teacher_id}>
                          {teacher.full_name} · {teacher.email}
                        </option>
                      ))
                    ) : (
                      <option disabled>No teachers available</option>
                    )}
                  </select>
                </label>
              </>
            ) : (
              <>
                <input
                  name="full_name"
                  required
                  placeholder="Full name"
                  className="rounded-lg border border-[#DBEAFE] px-3 py-2 text-sm"
                />
                <input
                  name="email"
                  required
                  type="email"
                  placeholder="Email"
                  className="rounded-lg border border-[#DBEAFE] px-3 py-2 text-sm"
                />
                <input
                  name="password"
                  required
                  type="password"
                  placeholder="Password"
                  className="rounded-lg border border-[#DBEAFE] px-3 py-2 text-sm"
                />
                <input
                  name="phone_number"
                  required
                  placeholder="Phone"
                  className="rounded-lg border border-[#DBEAFE] px-3 py-2 text-sm"
                />
                {tab === "Students" ? (
                  <select
                    name="class_id"
                    required
                    defaultValue=""
                    className="rounded-lg border border-[#DBEAFE] px-3 py-2 text-sm"
                  >
                    <option value="" disabled>
                      Select class
                    </option>
                    {classes.map((c) => (
                      <option key={c.class_id} value={c.class_id}>
                        {c.name} · {c.academic_year}
                      </option>
                    ))}
                  </select>
                ) : (
                  <label className="text-sm font-semibold text-slate-700">
                    Assign existing classes (optional)
                    <span className="mt-1 grid gap-2 rounded-lg border border-[#DBEAFE] p-3 font-normal">
                      {classes.length ? classes.map((c) => (
                        <label
                          key={c.class_id}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[#EFF6FF]"
                        >
                          <input
                            type="checkbox"
                            name="class_ids"
                            value={c.class_id}
                            className="h-4 w-4 rounded border-slate-300 text-[#0052CC]"
                          />
                          <span>{c.name} · {c.academic_year}</span>
                        </label>
                      )) : <span className="text-sm text-slate-500">No classes available</span>}
                    </span>
                  </label>
                )}
              </>
            )}
            {tab === "Students" && classes.length === 0 && (
              <p className="text-sm text-amber-600 sm:col-span-2">
                No classes exist yet. Create a class first so students can be
                assigned to one.
              </p>
            )}
            <button
              disabled={tab === "Students" && classes.length === 0}
              className="rounded-lg bg-[#0052CC] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              Save
            </button>
            {error && <p className="text-sm text-rose-600">{error}</p>}
          </form>
        </div>
      )}
      {classAssignmentTeacher && (
        <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-[#0F172A]">
                Add class to {classAssignmentTeacher.full_name}
              </h3>
              <p className="mt-1 text-xs text-[#64748B]">
                Select one or more classes that are not already assigned.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setClassAssignmentTeacher(null)}
              className="text-sm text-slate-500"
            >
              Cancel
            </button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {classes.map((item) => {
              const alreadyAssigned = classAssignmentTeacher.classes.some(
                (assignedClass) => assignedClass.class_id === item.class_id,
              );
              return (
                <label
                  key={item.class_id}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${alreadyAssigned ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400" : "cursor-pointer border-[#DBEAFE] hover:bg-[#EFF6FF]"}`}
                >
                  <input
                    type="checkbox"
                    disabled={alreadyAssigned}
                    checked={selectedClassIds.includes(item.class_id)}
                    onChange={(event) =>
                      setSelectedClassIds((current) =>
                        event.target.checked
                          ? [...current, item.class_id]
                          : current.filter((id) => id !== item.class_id),
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300 text-[#0052CC]"
                  />
                  <span>
                    {item.name} · {item.academic_year}
                    {alreadyAssigned ? " (already assigned)" : ""}
                  </span>
                </label>
              );
            })}
          </div>
          {assignmentError && (
            <p className="mt-3 text-sm text-rose-600">{assignmentError}</p>
          )}
          <button
            type="button"
            onClick={addClassesToTeacher}
            disabled={!selectedClassIds.length}
            className="mt-4 rounded-lg bg-[#0052CC] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            Add selected classes
          </button>
        </div>
      )}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={() => setEditingTeacher(null)}>
          <form onSubmit={updateTeacher} onClick={(event) => event.stopPropagation()} className="w-full max-w-2xl rounded-2xl border border-[#DDE8DF] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#15803D]">Teacher account</p>
                <h3 className="mt-1 text-xl font-bold text-[#0F172A]">Update {editingTeacher.full_name}</h3>
              </div>
              <button type="button" onClick={() => setEditingTeacher(null)} className="rounded-lg px-2 py-1 text-xl text-[#64748B] hover:bg-slate-100" aria-label="Close">&times;</button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">Full name<input name="full_name" required defaultValue={editingTeacher.full_name} className="rounded-lg border border-[#DDE8DF] px-3 py-2.5 font-normal outline-none focus:border-[#EAB308]" /></label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">Email<input name="email" type="email" required defaultValue={editingTeacher.email} className="rounded-lg border border-[#DDE8DF] px-3 py-2.5 font-normal outline-none focus:border-[#EAB308]" /></label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">Phone number<input name="phone_number" defaultValue={editingTeacher.phone_number ?? ""} className="rounded-lg border border-[#DDE8DF] px-3 py-2.5 font-normal outline-none focus:border-[#EAB308]" /></label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">New password<input name="password" type="password" placeholder="Leave blank to keep current" className="rounded-lg border border-[#DDE8DF] px-3 py-2.5 font-normal outline-none focus:border-[#EAB308]" /></label>
              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-semibold text-[#334155]">Teaching classes</legend>
                <div className="mt-1.5 grid max-h-44 gap-2 overflow-y-auto rounded-lg border border-[#DDE8DF] p-3 sm:grid-cols-2">
                  {classes.map((item) => {
                    const assignedToOtherTeacher = teachers.some((teacher) => teacher.teacher_id !== editingTeacher.teacher_id && teacher.classes.some((assignedClass) => assignedClass.class_id === item.class_id));
                    return <label key={item.class_id} className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${assignedToOtherTeacher ? "cursor-not-allowed bg-slate-50 text-slate-400" : "cursor-pointer hover:bg-[#FEF9C3]"}`}><input type="checkbox" checked={selectedTeacherClassIds.includes(item.class_id)} disabled={assignedToOtherTeacher} onChange={(event) => setSelectedTeacherClassIds((current) => event.target.checked ? [...current, item.class_id] : current.filter((id) => id !== item.class_id))} className="h-4 w-4 accent-[#15803D]" /><span>{item.name} · {item.academic_year}{assignedToOtherTeacher ? " (assigned)" : ""}</span></label>;
                  })}
                </div>
                <p className="mt-1 text-xs font-normal text-[#64748B]">Teachers can teach classes across different academic levels.</p>
              </fieldset>
            </div>
            {teacherEditError && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">{teacherEditError}</p>}
            {teacherEditSuccess && <p role="status" className="mt-4 rounded-lg bg-[#DCFCE7] p-3 text-sm font-semibold text-[#166534]">{teacherEditSuccess}</p>}
            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <button type="button" onClick={() => { setEditingTeacher(null); remove("teacher", editingTeacher.teacher_id); }} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50">Delete teacher</button>
              <div className="flex gap-3"><button type="button" onClick={() => setEditingTeacher(null)} className="rounded-lg border border-[#DDE8DF] px-4 py-2.5 text-sm font-semibold text-[#475569]">Cancel</button><button type="submit" disabled={savingTeacher} className="rounded-lg bg-[#EAB308] px-4 py-2.5 text-sm font-bold text-[#422006] disabled:opacity-50">{savingTeacher ? "Saving..." : "Save changes"}</button></div>
            </div>
          </form>
        </div>
      )}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={() => setEditingStudent(null)}>
          <form id="student-update-form" onSubmit={updateStudent} onClick={(event) => event.stopPropagation()} className="w-full max-w-xl rounded-2xl border border-[#DDE8DF] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#15803D]">Student account</p>
                <h3 className="mt-1 text-xl font-bold text-[#0F172A]">Update {editingStudent.name}</h3>
              </div>
              <button type="button" onClick={() => setEditingStudent(null)} className="rounded-lg px-2 py-1 text-xl text-[#64748B] hover:bg-slate-100" aria-label="Close">&times;</button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">Full name<input name="full_name" required defaultValue={editingStudent.name} className="rounded-lg border border-[#DDE8DF] px-3 py-2.5 font-normal outline-none focus:border-[#EAB308]" /></label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">Email<input name="email" type="email" required defaultValue={editingStudent.email} className="rounded-lg border border-[#DDE8DF] px-3 py-2.5 font-normal outline-none focus:border-[#EAB308]" /></label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">Phone number<input name="phone_number" defaultValue={editingStudent.phone_number ?? ""} className="rounded-lg border border-[#DDE8DF] px-3 py-2.5 font-normal outline-none focus:border-[#EAB308]" /></label>
              <fieldset className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155] sm:col-span-2">
                <legend>Classes</legend>
                <div className="grid max-h-36 gap-2 overflow-y-auto rounded-lg border border-[#DDE8DF] p-3 sm:grid-cols-2">
                  {classes.map((item) => <label key={item.class_id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 font-normal hover:bg-[#FEF9C3]"><input type="checkbox" checked={selectedStudentClassIds.includes(item.class_id)} onChange={(event) => setSelectedStudentClassIds((current) => event.target.checked ? [...current, item.class_id] : current.filter((id) => id !== item.class_id))} className="h-4 w-4 accent-[#15803D]" /><span>{item.name} · {item.academic_year}</span></label>)}
                </div>
                <span className="text-xs font-normal text-[#64748B]">Select one or more classes from the same academic level.</span>
              </fieldset>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155] sm:col-span-2">New password<input name="password" type="password" placeholder="Leave blank to keep current" className="rounded-lg border border-[#DDE8DF] px-3 py-2.5 font-normal outline-none focus:border-[#EAB308]" /></label>
            </div>
            {studentEditError && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">{studentEditError}</p>}
            {studentEditSuccess && <p role="status" className="mt-4 rounded-lg bg-[#DCFCE7] p-3 text-sm font-semibold text-[#166534]">{studentEditSuccess}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditingStudent(null)} className="rounded-lg border border-[#DDE8DF] px-4 py-2.5 text-sm font-semibold text-[#475569]">Cancel</button>
              <button type="submit" disabled={savingStudent} className="rounded-lg bg-[#EAB308] px-5 py-2.5 text-sm font-bold text-[#422006] shadow-sm transition hover:bg-[#FACC15] disabled:cursor-not-allowed disabled:opacity-50">{savingStudent ? "Saving..." : "Save changes"}</button>
            </div>
          </form>
        </div>
      )}
      {report && (
        <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5">
          <div className="flex justify-between">
            <h3 className="font-bold text-[#0F172A]">
              Academic report — {report.name}
            </h3>
            <button onClick={() => setReport(null)} className="text-[#0052CC]">
              Close
            </button>
          </div>

          {(() => {
            // AdminStudentReportResponse only gives us exercises_and_exams
            // (with a nullable score) and class_info. There is no
            // submissions/attendance data on this endpoint — don't fake it.
            const exercisesAndExams = report.exercises_and_exams ?? [];
            const avgScore = computeAverage(exercisesAndExams);
            const gradedCount = exercisesAndExams.filter(
              (e) => e.score !== null && e.score !== undefined,
            ).length;

            return (
              <>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Stat
                    label="Average grade"
                    value={avgScore !== null ? avgScore.toFixed(1) : "-"}
                    icon={BarChart3}
                  />
                  <Stat
                    label="Graded exercises"
                    value={`${gradedCount} / ${exercisesAndExams.length}`}
                    icon={ClipboardCheck}
                  />
                  <Stat
                    label="Class"
                    value={report.class_info?.name ?? "-"}
                    detail={report.class_info?.academic_year}
                    icon={CalendarDays}
                  />
                </div>

                <div className="mt-5">
                  <h4 className="text-sm font-bold text-[#0F172A]">
                    Grades by exercise
                  </h4>
                  {exercisesAndExams.length ? (
                    <div className="mt-2 divide-y divide-slate-100">
                      {exercisesAndExams.map((entry) => (
                        <div
                          key={entry.exercise_id}
                          className="flex justify-between py-2 text-sm"
                        >
                          <span className="text-slate-700">
                            {entry.exercise_name}
                          </span>
                          <strong className="text-[#0052CC]">
                            {entry.score !== null ? entry.score : "-"}
                          </strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[#64748B]">
                      No exercises recorded.
                    </p>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </section>
  );
}

// ---- Reports helpers -------------------------------------------------

interface StudentReportCacheEntry {
  loading: boolean;
  error?: string;
  data?: StudentReportData;
}

function normalizeClassLabel(value: string) {
  return value.trim().toLowerCase();
}

function reportCacheKey(student: AdminStudent) {
  return student.student_id !== undefined
    ? `id:${student.student_id}`
    : `email:${student.email}`;
}

// Averages over exercises_and_exams entries, ignoring ungraded (null score)
// exercises. This matches AdminStudentReportResponse's real shape — there
// is no separate "grades" array from the backend.
function computeAverage(
  entries: { score: number | null }[] | undefined,
) {
  if (!entries || !entries.length) return null;
  const graded = entries.filter(
    (entry): entry is { score: number } =>
      entry.score !== null && entry.score !== undefined,
  );
  if (!graded.length) return null;
  return graded.reduce((sum, entry) => sum + entry.score, 0) / graded.length;
}

function StudentReportModal({
  student,
  entry,
  onClose,
}: {
  student: AdminStudent;
  entry: StudentReportCacheEntry | undefined;
  onClose: () => void;
}) {
  const exercisesAndExams = entry?.data?.exercises_and_exams ?? [];

  const rows = exercisesAndExams.map((item, index) => ({
    label: `Ex ${index + 1}`,
    name: item.exercise_name,
    score: item.score,
  }));

  const chartData = rows.map((row) => ({
    name: row.label,
    score: row.score ?? 0,
  }));

  const average = computeAverage(exercisesAndExams);
  const gradedCount = exercisesAndExams.filter(
    (e) => e.score !== null && e.score !== undefined,
  ).length;
  const downloadPdf = () => {
    const document = new jsPDF();
    const className = entry?.data?.class_info?.name ?? student.className ?? "No class";
    const academicYear = entry?.data?.class_info?.academic_year ?? "";
    const safeName = student.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
    const pageWidth = document.internal.pageSize.getWidth();
    const scoreMax = 20;

    document.setTextColor(15, 23, 42);
    document.setFontSize(20);
    document.text("Student Academic Report", 20, 22);
    document.setFontSize(12);
    document.text(`Name: ${student.name}`, 20, 34);
    document.text(`Email: ${student.email}`, 20, 42);
    document.text(`Class / level: ${className}${academicYear ? ` (${academicYear})` : ""}`, 20, 50);
    document.setDrawColor(219, 234, 254);
    document.line(20, 57, pageWidth - 20, 57);

    document.setFontSize(12);
    document.text(`Average score: ${average !== null ? average.toFixed(2) : "N/A"}`, 20, 68);
    document.text(`Result: ${gradedCount} of ${exercisesAndExams.length} exercises graded`, 20, 76);

    document.setFontSize(14);
    document.text("Score graph", 20, 92);
    const graphX = 28;
    const graphY = 105;
    const graphWidth = pageWidth - 48;
    const graphHeight = 62;
    document.setDrawColor(148, 163, 184);
    document.line(graphX, graphY, graphX, graphY + graphHeight);
    document.line(graphX, graphY + graphHeight, graphX + graphWidth, graphY + graphHeight);
    document.setFontSize(8);
    document.text("20", graphX - 8, graphY + 3);
    document.text("0", graphX - 5, graphY + graphHeight + 3);
    const points = exercisesAndExams.map((item, index) => {
      const score = item.score ?? 0;
      const x = graphX + ((index + 1) / Math.max(exercisesAndExams.length, 1)) * graphWidth;
      const y = graphY + graphHeight - (Math.max(0, Math.min(score, scoreMax)) / scoreMax) * graphHeight;
      return { x, y, score };
    });
    document.setDrawColor(0, 82, 204);
    document.setFillColor(0, 82, 204);
    points.forEach((point, index) => {
      if (index > 0) document.line(points[index - 1].x, points[index - 1].y, point.x, point.y);
      document.circle(point.x, point.y, 1.5, "F");
      document.setFontSize(7);
      document.text(`Ex ${index + 1}`, point.x - 5, graphY + graphHeight + 10);
    });

    let y = 195;
    document.setTextColor(15, 23, 42);
    document.setFontSize(14);
    document.text("Exercises and grades", 20, y);
    y += 10;
    document.setFontSize(10);
    document.setFillColor(239, 246, 255);
    document.rect(20, y - 6, pageWidth - 40, 9, "F");
    document.text("#", 23, y);
    document.text("Exercise", 38, y);
    document.text("Score", pageWidth - 45, y);
    y += 10;
    exercisesAndExams.forEach((item, index) => {
      if (y > 275) {
        document.addPage();
        y = 22;
      }
      document.setDrawColor(226, 232, 240);
      document.line(20, y + 3, pageWidth - 20, y + 3);
      document.text(String(index + 1), 23, y);
      const exerciseName = document.splitTextToSize(item.exercise_name, pageWidth - 85);
      document.text(exerciseName, 38, y);
      document.text(item.score === null ? "N/A" : String(item.score), pageWidth - 45, y);
      y += Math.max(10, exerciseName.length * 5 + 3);
    });

    document.setFontSize(8);
    document.setTextColor(100, 116, 139);
    document.text("Generated by EduInsight AI", 20, 290);
    document.save(`student-report-${safeName || "student"}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-[#0F172A]">
              {student.name}
            </h3>
            <p className="mt-1 text-sm text-[#64748B]">
              {student.email} · {student.className || "No class"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!entry?.loading && !entry?.error && (
              <button
                onClick={downloadPdf}
                className="rounded-lg bg-[#EAB308] px-3 py-2 text-xs font-bold text-[#422006] hover:bg-[#FACC15]"
              >
                Download PDF
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-[#475569] hover:bg-slate-50"
              aria-label="Close report"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {entry?.loading ? (
          <p className="mt-6 text-sm text-[#64748B]">Loading report...</p>
        ) : entry?.error ? (
          <p className="mt-6 text-sm text-rose-600">{entry.error}</p>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Stat
                label="Average score"
                value={average !== null ? average.toFixed(2) : "-"}
                icon={BarChart3}
                tone="green"
              />
              <Stat
                label="Graded exercises"
                value={`${gradedCount} / ${exercisesAndExams.length}`}
                icon={ClipboardCheck}
                tone="yellow"
              />
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-bold text-[#0F172A]">
                Progress across exercises
              </h4>
              {chartData.length ? (
                <div className="mt-3 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 20]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#0052CC"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="mt-2 text-sm text-[#64748B]">
                  No exercises available for this student yet.
                </p>
              )}
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-bold text-[#0F172A]">
                Grades by exercise
              </h4>
              {rows.length ? (
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-[#475569]">
                        <th className="py-2 pr-3 font-semibold">#</th>
                        <th className="py-2 pr-3 font-semibold">Exercise</th>
                        <th className="py-2 text-right font-semibold">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((row) => (
                        <tr key={row.label}>
                          <td className="py-2 pr-3 font-semibold text-slate-500">
                            {row.label}
                          </td>
                          <td className="py-2 pr-3 text-slate-700">
                            {row.name}
                          </td>
                          <td className="py-2 text-right font-bold text-[#0052CC]">
                            {row.score !== null ? row.score : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-2 text-sm text-[#64748B]">
                  No grades recorded yet.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AdminProfile({
  profile,
  reload,
}: {
  profile: { admin_id: number; full_name: string; email: string };
  reload: () => Promise<void>;
}) {
  const [feedback, setFeedback] = useState("");
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    try {
      await api.updateAdminProfile({
        full_name: String(data.get("full_name") ?? ""),
        email: String(data.get("email") ?? ""),
        ...(password ? { password } : {}),
      });
      await reload();
      setFeedback("Profile updated successfully.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update profile.");
    }
  };

  return (
    <section id="profile" className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#15803D]">Administrator account</p>
        <h2 className="mt-1 text-2xl font-bold text-[#0F172A]">Profile</h2>
      </div>
      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#DDE8DF] bg-white p-6 shadow-[0_2px_12px_rgba(22,101,52,.05)]">
        <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-5">
          <Avatar initials={profile.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()} className="h-12 w-12 bg-[#FEF9C3] text-[#A16207]" />
          <div>
            <p className="font-bold text-[#0F172A]">{profile.full_name}</p>
            <p className="text-sm text-[#64748B]">Admin account</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">Full name<input name="full_name" defaultValue={profile.full_name} required className="rounded-lg border border-[#DDE8DF] px-3 py-2.5 font-normal outline-none focus:border-[#EAB308] focus:ring-2 focus:ring-[#FEF08A]" /></label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">Email<input name="email" type="email" defaultValue={profile.email} required className="rounded-lg border border-[#DDE8DF] px-3 py-2.5 font-normal outline-none focus:border-[#EAB308] focus:ring-2 focus:ring-[#FEF08A]" /></label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155] sm:col-span-2">New password<input name="password" type="password" placeholder="Leave blank to keep current" className="rounded-lg border border-[#DDE8DF] px-3 py-2.5 font-normal outline-none focus:border-[#EAB308] focus:ring-2 focus:ring-[#FEF08A]" /></label>
        </div>
        {feedback && <p className={`mt-4 text-sm ${feedback.includes("successfully") ? "text-[#15803D]" : "text-rose-600"}`}>{feedback}</p>}
        <button type="submit" className="mt-6 rounded-xl bg-[#EAB308] px-5 py-2.5 text-sm font-bold text-[#422006] transition hover:bg-[#FACC15]">Save changes</button>
      </form>
    </section>
  );
}

function AdminNotifications({
  students,
  classes,
  reload,
  language,
}: {
  students: AdminStudent[];
  classes: AdminClass[];
  reload: () => Promise<void>;
  language: Language;
}) {
  const [recipientMode, setRecipientMode] = useState<"class" | "student">("class");
  const [selectedClassId, setSelectedClassId] = useState<number>(classes[0]?.class_id ?? 0);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const classStudents = students.filter((student) => {
    return student.class_id === selectedClassId;
  });

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (recipientMode === "student" && selectedStudentId === null) {
      setFeedback(translate(language, "selectStudentFirst"));
      return;
    }
    setSaving(true);
    setFeedback("");
    try {
      await api.sendAdminNotification({
        title: String(data.get("title") ?? ""),
        message: String(data.get("message") ?? ""),
        ...(recipientMode === "class" ? { class_id: selectedClassId } : { student_id: selectedStudentId ?? undefined }),
      });
      event.currentTarget.reset();
      setFeedback(translate(language, "notificationSent"));
      await reload();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to send notification.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="notifications" className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#15803D]">{translate(language, "communicationCenter")}</p>
        <h2 className="mt-1 text-2xl font-bold text-[#0F172A]">{translate(language, "notificationsTitle")}</h2>
        <p className="mt-1 text-sm text-[#64748B]">{translate(language, "sendToClassOrStudent")}</p>
      </div>
      <div className="max-w-3xl">
        <form onSubmit={submit} className="rounded-2xl border border-[#DDE8DF] bg-white p-6 shadow-[0_2px_12px_rgba(22,101,52,.05)]">
          <div className="mb-5 flex gap-1 rounded-lg bg-[#FEF9C3] p-1">
            <button type="button" onClick={() => { setRecipientMode("class"); setSelectedStudentId(null); }} className={`flex-1 rounded-md px-4 py-2 text-xs font-bold ${recipientMode === "class" ? "bg-white text-[#15803D] shadow-sm" : "text-[#64748B]"}`}>{translate(language, "wholeClass")}</button>
            <button type="button" onClick={() => setRecipientMode("student")} className={`flex-1 rounded-md px-4 py-2 text-xs font-bold ${recipientMode === "student" ? "bg-white text-[#15803D] shadow-sm" : "text-[#64748B]"}`}>{translate(language, "oneStudent")}</button>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">{translate(language, "class")}
            <select value={selectedClassId} onChange={(event) => { setSelectedClassId(Number(event.target.value)); setSelectedStudentId(null); }} className="rounded-lg border border-[#DDE8DF] px-3 py-2.5 font-normal outline-none focus:border-[#EAB308] focus:ring-2 focus:ring-[#FEF08A]">
              {classes.map((item) => <option key={item.class_id} value={item.class_id}>{item.name} · {item.academic_year}</option>)}
            </select>
          </label>
          {recipientMode === "student" && <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold text-[#334155]">{translate(language, "selectStudent")}</p>
            {classStudents.length ? classStudents.map((student) => <button type="button" key={student.student_id ?? student.email} onClick={() => setSelectedStudentId(student.student_id ?? null)} className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left ${selectedStudentId === student.student_id ? "border-[#EAB308] bg-[#FEF9C3]" : "border-[#E2E8F0] hover:bg-[#F8FAFC]"}`}><Avatar initials={student.initials} className="h-8 w-8" /><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-[#0F172A]">{student.name}</strong><span className="text-xs text-[#64748B]">{student.email} · {student.className}</span></span>{selectedStudentId === student.student_id && <Check size={16} className="text-[#15803D]" />}</button>) : <p className="rounded-lg bg-slate-50 p-3 text-sm text-[#64748B]">{translate(language, "noStudentsInClass")}</p>}
          </div>}
          {recipientMode === "class" && <p className="mt-4 rounded-lg bg-[#DCFCE7] p-3 text-sm text-[#166534]">{translate(language, "allStudentsIn")} {classes.find((item) => item.class_id === selectedClassId)?.name ?? translate(language, "class")}.</p>}
          <div className="mt-4 grid gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">{translate(language, "title")}<input name="title" required placeholder={translate(language, "title")} className="rounded-lg border border-[#DDE8DF] px-3 py-2.5 font-normal outline-none focus:border-[#EAB308] focus:ring-2 focus:ring-[#FEF08A]" /></label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">{translate(language, "message")}<textarea name="message" required rows={4} placeholder={translate(language, "message")} className="resize-none rounded-lg border border-[#DDE8DF] px-3 py-2.5 font-normal outline-none focus:border-[#EAB308] focus:ring-2 focus:ring-[#FEF08A]" /></label>
          </div>
          {feedback && <p className={`mt-4 text-sm ${feedback.includes("successfully") ? "text-[#15803D]" : "text-rose-600"}`}>{feedback}</p>}
          <button type="submit" disabled={saving || !classes.length || (recipientMode === "student" && selectedStudentId === null)} className="mt-5 rounded-xl bg-[#EAB308] px-5 py-2.5 text-sm font-bold text-[#422006] transition hover:bg-[#FACC15] disabled:opacity-50">{saving ? translate(language, "sending") : translate(language, "sendNotification")}</button>
        </form>
      </div>
    </section>
  );
}

function AdminReports({ students }: { students: AdminStudent[] }) {
  // Distinct class labels derived purely from real student data
  // (student.className, sourced from the API's level field), e.g. "3AC", "1BAC".
  const classNames = Array.from(
    new Set(
      students
        .map((student) => student.className)
        .filter((name): name is string => Boolean(name && name.trim())),
    ),
  );

  const [selectedClass, setSelectedClass] = useState("");
  const [reportsByStudent, setReportsByStudent] = useState<
    Record<string, StudentReportCacheEntry>
  >({});
  const [loadingClass, setLoadingClass] = useState(false);
  const [activeReportStudent, setActiveReportStudent] =
    useState<AdminStudent | null>(null);

  useEffect(() => {
    if (!selectedClass && classNames.length) {
      setSelectedClass(classNames[0]);
    }
  }, [classNames, selectedClass]);

  // Normalized comparison (trim + lowercase) fixes the "0 students" bug
  // caused by case or whitespace mismatches between the tab label and the
  // stored class name (e.g. "3AC Math" vs "3ac math").
  const classStudents = students.filter(
    (student) =>
      normalizeClassLabel(student.className || "") ===
      normalizeClassLabel(selectedClass),
  );

  useEffect(() => {
    let cancelled = false;
    const studentsNeedingFetch = classStudents.filter(
      (student) =>
        student.student_id !== undefined &&
        !reportsByStudent[reportCacheKey(student)],
    );
    if (!studentsNeedingFetch.length) return;
    setLoadingClass(true);
    Promise.all(
      studentsNeedingFetch.map(async (student) => {
        const key = reportCacheKey(student);
        try {
          const data = (await api.getStudentReport(
            student.student_id as number,
          )) as StudentReportData;
          return [key, { loading: false, data }] as const;
        } catch {
          return [
            key,
            { loading: false, error: "Failed to load report." },
          ] as const;
        }
      }),
    ).then((entries) => {
      if (cancelled) return;
      setReportsByStudent((prev) => ({
        ...prev,
        ...Object.fromEntries(entries),
      }));
      setLoadingClass(false);
    });
    return () => {
      cancelled = true;
    };
    // classStudents/reportsByStudent are derived each render; keying off
    // selectedClass + students avoids an identity-based effect loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, students]);

  const ranked = [...classStudents].sort((a, b) => {
    const avgA =
      computeAverage(
        reportsByStudent[reportCacheKey(a)]?.data?.exercises_and_exams,
      ) ?? -Infinity;
    const avgB =
      computeAverage(
        reportsByStudent[reportCacheKey(b)]?.data?.exercises_and_exams,
      ) ?? -Infinity;
    return avgB - avgA;
  });

  const validAverages = ranked
    .map((student) =>
      computeAverage(
        reportsByStudent[reportCacheKey(student)]?.data?.exercises_and_exams,
      ),
    )
    .filter((value): value is number => value !== null);
  const classAverage = validAverages.length
    ? validAverages.reduce((sum, value) => sum + value, 0) /
    validAverages.length
    : null;

  const openReport = async (student: AdminStudent) => {
    setActiveReportStudent(student);
    const key = reportCacheKey(student);
    if (!reportsByStudent[key] && student.student_id !== undefined) {
      setReportsByStudent((prev) => ({ ...prev, [key]: { loading: true } }));
      try {
        const data = (await api.getStudentReport(
          student.student_id,
        )) as StudentReportData;
        setReportsByStudent((prev) => ({
          ...prev,
          [key]: { loading: false, data },
        }));
      } catch {
        setReportsByStudent((prev) => ({
          ...prev,
          [key]: { loading: false, error: "Failed to load report." },
        }));
      }
    }
  };

  return (
    <section id="reports" className="space-y-7">
      <div>
        <p className="text-sm font-semibold text-[#15803D]">Academic performance overview</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">
          Reports
        </h2>
      </div>

      {classNames.length ? (
        <div className="flex flex-wrap gap-1 rounded-lg bg-[#FEF9C3] p-1">
          {classNames.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedClass(name)}
              className={`rounded-md px-4 py-2 text-xs font-bold ${normalizeClassLabel(selectedClass) === normalizeClassLabel(name)
                ? "bg-white text-[#15803D] shadow-sm"
                : "text-[#475569]"
                }`}
            >
              {name}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#64748B]">
          No classes available yet. Add students to see class reports.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Selected class"
          value={selectedClass || "-"}
          icon={BookOpen}
          tone="yellow"
        />
        <Stat
          label="Students in class"
          value={String(classStudents.length)}
          icon={Users}
          tone="green"
        />
        <Stat
          label="Class average"
          value={classAverage !== null ? classAverage.toFixed(2) : "-"}
          detail={loadingClass ? "Calculating..." : undefined}
          icon={BarChart3}
          tone="green"
        />
      </div>

      <div className="rounded-2xl border border-[#DDE8DF] bg-white shadow-[0_2px_12px_rgba(22,101,52,.05)]">
        <div className="border-b border-[#E2E8F0] p-5">
          <h3 className="font-bold text-[#0F172A]">
            {selectedClass
              ? `${selectedClass} — Class Ranking`
              : "Class Ranking"}
          </h3>
          <p className="mt-1 text-xs text-[#64748B]">
            Ranked by average score across all graded exercises. Students
            without grades yet still appear, ranked last.
          </p>
        </div>
        {ranked.length ? (
          <div className="divide-y divide-slate-100">
            {ranked.map((student, index) => {
              const entry = reportsByStudent[reportCacheKey(student)];
              const average = computeAverage(
                entry?.data?.exercises_and_exams,
              );
              return (
                <div
                  key={student.email}
                  className="flex flex-wrap items-center gap-4 px-5 py-4"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index === 0
                      ? "bg-[#15803D] text-white"
                      : "bg-[#DCFCE7] text-[#15803D]"
                      }`}
                  >
                    {index + 1}
                  </div>
                  <Avatar initials={student.initials} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {student.name}
                    </p>
                    <p className="truncate text-xs text-[#64748B]">
                      {student.email}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-[#15803D]">
                    {entry?.loading
                      ? "..."
                      : average !== null
                        ? average.toFixed(2)
                        : "N/A"}
                  </span>
                  <button
                    onClick={() => openReport(student)}
                    disabled={!student.student_id}
                    className="shrink-0 rounded-lg border border-[#FDE68A] bg-[#FEFCE8] px-3 py-1.5 text-xs font-bold text-[#A16207] transition hover:bg-[#FEF9C3] disabled:opacity-40"
                  >
                    Get Report
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="p-5 text-sm text-[#64748B]">
            No students found in this class.
          </p>
        )}
      </div>

      {activeReportStudent && (
        <StudentReportModal
          student={activeReportStudent}
          entry={reportsByStudent[reportCacheKey(activeReportStudent)]}
          onClose={() => setActiveReportStudent(null)}
        />
      )}
    </section>
  );
}

function DynamicStudentWorkspace({
  active,
  profile,
  courses,
  exercises,
  grades,
  submissions,
  notifications,
}: {
  active: string;
  profile: ApiStudent;
  courses: Course[];
  exercises: Exercise[];
  grades: Grade[];
  submissions: Submission[];
  notifications: StudentNotification[];
}) {
  const [tab, setTab] = useState("Courses");
  const [feedback, setFeedback] = useState("");
  const [submittedExerciseIds, setSubmittedExerciseIds] = useState(
    () => new Set(submissions.map((item) => item.exercise_id)),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingExerciseId = useRef<number | null>(null);
  const chooseSubmissionFile = (exerciseId: number) => {
    pendingExerciseId.current = exerciseId;
    fileInputRef.current?.click();
  };
  const handleSubmissionFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    const exerciseId = pendingExerciseId.current;
    event.target.value = "";
    pendingExerciseId.current = null;
    if (!file || exerciseId === null) return;

    try {
      await api.createSubmission({ exercise_id: exerciseId, file });
      setFeedback("Submission sent successfully.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Submission failed.");
    }
  };

  const removeSubmission = async (submission: Submission) => {
    if (!window.confirm("Remove this submission? You can submit a new file afterward.")) return;
    try {
      await api.deleteStudentSubmission(submission.submission_id);
      setSubmittedExerciseIds((current) => {
        const next = new Set(current);
        next.delete(submission.exercise_id);
        return next;
      });
      setFeedback("Submission removed. You can submit a new file now.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to remove submission.");
    }
  };

  const handleStudentProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await api.updateStudentProfile({
        full_name: String(data.get("full_name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone_number: String(data.get("phone_number") ?? ""),
        ...(String(data.get("password") ?? "") ? { password: String(data.get("password")) } : {}),
      });
      setFeedback("Profile updated successfully.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update profile.");
    }
  };

  if (active === "Profile") {
    return (
      <section className="max-w-3xl space-y-6 bg-[#F6F9FC] font-sans">
        <div>
          <p className="text-sm text-[#64748B]">Your account details</p>
          <h2 className="mt-1 text-2xl font-bold text-[#0F172A]">Profile</h2>
        </div>
        <form id="student-profile-form" onSubmit={handleStudentProfileSubmit} className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,.03)]">
          <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-5">
            <Avatar initials={profile.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()} className="h-12 w-12" />
            <div><p className="font-bold text-[#0F172A]">{profile.full_name}</p><p className="text-sm text-[#64748B]">Student account · {profile.level ?? "No level"}</p></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">Full name<input name="full_name" defaultValue={profile.full_name} required className="rounded-lg border border-[#E2E8F0] px-3 py-2.5 font-normal outline-none focus:border-[#1769E0]" /></label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">Email<input name="email" type="email" defaultValue={profile.email} required className="rounded-lg border border-[#E2E8F0] px-3 py-2.5 font-normal outline-none focus:border-[#1769E0]" /></label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">Phone number<input name="phone_number" defaultValue={profile.phone_number ?? ""} className="rounded-lg border border-[#E2E8F0] px-3 py-2.5 font-normal outline-none focus:border-[#1769E0]" /></label>
            <div className="flex flex-col justify-end gap-1.5 rounded-lg border border-dashed border-[#E2E8F0] bg-slate-50 px-3 py-2.5">
              <span className="text-sm font-semibold text-[#334155]">Academic level</span>
              <span className="text-sm text-[#64748B]">{profile.level ?? "No academic level"}</span>
            </div>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155] sm:col-span-2">New password<input name="password" type="password" placeholder="Leave blank to keep current" className="rounded-lg border border-[#E2E8F0] px-3 py-2.5 font-normal outline-none focus:border-[#1769E0]" /></label>
          </div>
          {feedback && <p className={`mt-4 text-sm ${feedback.includes("successfully") ? "text-emerald-600" : "text-red-600"}`}>{feedback}</p>}
          <button type="submit" className="mt-6 rounded-xl bg-[#1769E0] px-5 py-2.5 text-sm font-bold text-white">Save changes</button>
        </form>
      </section>
    );
  }
  return (
    <section className="space-y-7 font-sans">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={handleSubmissionFile}
      />
      <div>
        <p className="text-sm text-[#64748B]">Student workspace</p>
        <h2 className="mt-1 text-2xl font-bold text-[#0F172A]">
          {profile.full_name}
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          {profile.email} · {profile.level ?? "No level"}
        </p>
      </div>
      <div className="flex gap-1 rounded-lg bg-[#EFF6FF] p-1">
        {["Courses", "Grades", "Submissions", "Notifications"].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-md px-4 py-2 text-xs font-bold ${tab === item ? "bg-white text-[#0052CC] shadow-sm" : "text-[#475569]"}`}
          >
            {item}
          </button>
        ))}
      </div>
      {feedback && (
        <p className="rounded-lg bg-blue-50 p-3 text-sm text-[#0052CC]">
          {feedback}
        </p>
      )}
      {tab === "Courses" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.length ? (
            courses.map((course) => (
              <div
                key={course.course_id}
                className="rounded-2xl border border-[#DBEAFE] bg-white p-5"
              >
                <h3 className="font-bold text-[#0F172A]">
                  {course.course_name}
                </h3>
                <p className="mt-1 text-xs text-[#64748B]">
                  {course.teacher?.full_name ?? ""} · {course.level}
                </p>
                {exercises
                  .filter(
                    (exercise) =>
                      exercise.course?.course_id === course.course_id,
                  )
                  .map((exercise) => (
                    <div
                      key={exercise.exercise_id}
                      className="mt-4 flex items-center gap-2 border-t border-slate-50 pt-3"
                    >
                      <span className="flex-1 text-sm text-slate-700">
                        {exercise.exercise_name}
                      </span>
                      <button
                        onClick={() => chooseSubmissionFile(exercise.exercise_id)}
                        className="text-xs font-semibold text-[#0052CC]"
                      >
                        Submit
                      </button>
                    </div>
                  ))}
              </div>
            ))
          ) : (
            <p className="text-sm text-[#64748B]">No courses enrolled.</p>
          )}
        </div>
      )}
      {tab === "Grades" && (
        <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5">
          {grades.length ? (
            grades.map((grade) => (
              <div
                key={
                  grade.grade_id ?? `${grade.student_id}-${grade.exercise_id}`
                }
                className="flex justify-between border-b border-slate-50 py-3 text-sm"
              >
                <span>Exercise {grade.exercise_id}</span>
                <strong className="text-[#0052CC]">{grade.score}</strong>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#64748B]">No grades available.</p>
          )}
        </div>
      )}
      {tab === "Submissions" && (
        <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5">
          {submissions.length ? (
            submissions.map((submission) => (
              <div
                key={submission.submission_id}
                className="flex justify-between border-b border-slate-50 py-3 text-sm"
              >
                <span>Exercise {submission.exercise_id}</span>
                <span className="text-[#64748B]">{submission.status}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#64748B]">No submissions yet.</p>
          )}
        </div>
      )}
      {tab === "Notifications" && (
        <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5">
          {notifications.length ? (
            notifications.map((notification) => (
              <div
                key={notification.notification_id}
                className="border-b border-slate-50 py-3"
              >
                <p className="font-semibold text-slate-800">
                  {notification.title}
                </p>
                <p className="text-xs text-[#64748B]">{notification.message}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#64748B]">No new notifications.</p>
          )}
        </div>
      )}
    </section>
  );
}

function DynamicStudentWorkspaceLegacy({
  active,
  setActive,
  profile,
  courses,
  exercises,
  grades,
  submissions,
  notifications,
}: {
  active: string;
  setActive: (value: string) => void;
  profile: ApiStudent;
  courses: Course[];
  exercises: Exercise[];
  grades: Grade[];
  submissions: Submission[];
  notifications: StudentNotification[];
}) {
  const [feedback, setFeedback] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [submittedExerciseIds, setSubmittedExerciseIds] = useState(
    () => new Set(submissions.map((item) => item.exercise_id)),
  );

  useEffect(() => {
    setProfileImage(window.localStorage.getItem("eduinsight_student_profile_image") ?? "");
  }, []);

  const handleProfileImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result);
      setProfileImage(image);
      window.localStorage.setItem("eduinsight_student_profile_image", image);
    };
    reader.readAsDataURL(file);
  };

  const handleStudentProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await api.updateStudentProfile({
        full_name: String(data.get("full_name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone_number: String(data.get("phone_number") ?? ""),
        ...(String(data.get("password") ?? "") ? { password: String(data.get("password")) } : {}),
      });
      setFeedback("Profile updated successfully.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update profile.");
    }
  };

  if (active === "Profile") {
    return (
      <section className="max-w-3xl space-y-6 bg-[#F6F9FC] font-sans">
        <div><p className="text-sm text-[#64748B]">Your account details</p><h2 className="mt-1 text-2xl font-bold text-[#0F172A]">Profile</h2></div>
        <form id="student-profile-form" onSubmit={handleStudentProfileSubmit} className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-5">
            <Avatar initials={profile.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()} image={profileImage} className="h-12 w-12" />
            <div><p className="font-bold text-[#0F172A]">{profile.full_name}</p><p className="text-sm text-[#64748B]">Student account</p></div>
          </div>
          <label className="mb-6 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#DBE2EA] px-3 py-2 text-xs font-semibold text-[#1769E0] hover:bg-blue-50">Add profile picture<input type="file" accept="image/*" onChange={handleProfileImage} className="hidden" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">Full name<input name="full_name" defaultValue={profile.full_name} required className="rounded-lg border border-[#DBE2EA] px-3 py-2.5 font-normal outline-none focus:border-[#0052CC]" /></label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">Email<input name="email" type="email" defaultValue={profile.email} required className="rounded-lg border border-[#DBE2EA] px-3 py-2.5 font-normal outline-none focus:border-[#0052CC]" /></label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">Phone number<input name="phone_number" defaultValue={profile.phone_number ?? ""} className="rounded-lg border border-[#DBE2EA] px-3 py-2.5 font-normal outline-none focus:border-[#0052CC]" /></label>
            <div className="flex flex-col justify-end gap-1.5 rounded-lg border border-dashed border-[#E2E8F0] bg-slate-50 px-3 py-2.5"><span className="text-sm font-semibold text-[#334155]">Academic level</span><span className="text-sm text-[#64748B]">{profile.level ?? "No academic level"}</span></div>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155] sm:col-span-2">New password<input name="password" type="password" placeholder="Leave blank to keep current" className="rounded-lg border border-[#DBE2EA] px-3 py-2.5 font-normal outline-none focus:border-[#0052CC]" /></label>
          </div>
          {feedback && <p className={`mt-4 text-sm ${feedback.includes("successfully") ? "text-emerald-600" : "text-red-600"}`}>{feedback}</p>}
          <button type="submit" className="mt-6 rounded-xl bg-[#0052CC] px-5 py-2.5 text-sm font-bold text-white">Save changes</button>
        </form>
      </section>
    );
  }

  return (
    <section className="space-y-7 font-sans">
      <div>
        <p className="text-sm text-[#64748B]">Student workspace</p>
        <h2 className="mt-1 text-2xl font-bold text-[#0F172A]">{profile.full_name}</h2>
        <p className="mt-1 text-sm text-[#64748B]">{profile.email} · {profile.level ?? "No level"}</p>
      </div>
      {feedback && <p className="rounded-lg bg-blue-50 p-3 text-sm text-[#0052CC]">{feedback}</p>}
      <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5">
        <p className="text-sm text-[#64748B]">This workspace is on the current student layout.</p>
      </div>
    </section>
  );
}

function StudentFocusTimer() {
  const duration = 25 * 60;
  const [seconds, setSeconds] = useState(duration);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          setRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  const progress = ((duration - seconds) / duration) * 100;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#2563EB] p-6 text-white shadow-[0_8px_24px_rgba(37,99,235,.2)]">
      <div className="absolute -right-12 -top-12 size-40 rounded-full border border-white/15" />
      <div className="absolute -bottom-20 right-16 size-48 rounded-full border border-white/10" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-white/75">
            <Timer size={16} /> Focus productivity
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Make space to learn.</h2>
          <p className="mt-1 max-w-md text-sm text-white/75">
            A 25-minute study sprint for your next exercise.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 border-white/20 bg-white/10">
            <div
              className="absolute inset-[-4px] rounded-full border-4 border-white border-b-transparent border-l-transparent"
              style={{ transform: `rotate(${progress * 3.6 - 45}deg)` }}
            />
            <span className="font-mono text-2xl font-semibold tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(remaining).padStart(2, "0")}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setRunning((value) => !value)}
              className="flex min-w-24 items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-[#1D4ED8] transition hover:bg-blue-50"
            >
              {running ? <Pause size={14} /> : <Play size={14} />}
              {running ? "Pause" : "Start"}
            </button>
            <button
              onClick={() => {
                setRunning(false);
                setSeconds(duration);
              }}
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StudentProgressWorkspace({
  profile,
  courses,
  exercises,
  grades,
  submissions,
  onSubmitExercise,
}: {
  profile: ApiStudent;
  courses: Course[];
  exercises: Exercise[];
  grades: Grade[];
  submissions: Submission[];
  onSubmitExercise: (exerciseId: number) => void;
}) {
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [submittedExerciseIds, setSubmittedExerciseIds] = useState(
    () => new Set(submissions.map((item) => item.exercise_id)),
  );
  const submittedIds = submittedExerciseIds;
  const courseNames = Array.from(new Set(courses.map((course) => course.course_name)));

  const filteredExercises = useMemo(() => exercises.filter((exercise) => {
    const matchesCourse = selectedCourse === "All Courses" || exercise.course?.course_name === selectedCourse;
    const query = searchQuery.toLowerCase();
    return matchesCourse && (!query || exercise.exercise_name.toLowerCase().includes(query) || exercise.course?.course_name.toLowerCase().includes(query));
  }), [exercises, searchQuery, selectedCourse]);

  const gradedExercises = filteredExercises.filter((exercise) =>
    grades.some((grade) => grade.exercise_id === exercise.exercise_id),
  );
  const scoreFor = (exerciseId: number) => grades.find((grade) => grade.exercise_id === exerciseId)?.score ?? 0;
  const average = gradedExercises.length
    ? gradedExercises.reduce((sum, exercise) => sum + scoreFor(exercise.exercise_id), 0) / gradedExercises.length
    : 0;
  const completionRate = filteredExercises.length
    ? Math.round((filteredExercises.filter((exercise) => submittedIds.has(exercise.exercise_id)).length / filteredExercises.length) * 100)
    : 0;
  const highest = gradedExercises.reduce<Exercise | null>((best, exercise) =>
    !best || scoreFor(exercise.exercise_id) > scoreFor(best.exercise_id) ? exercise : best, null);
  const chartCourses = Array.from(new Set(filteredExercises.map((exercise) => exercise.course?.course_name ?? "Course")));
  const chartColors = ["#16A34A", "#FACC15", "#F97316", "#DC2626", "#2563EB", "#D4A017"];
  const exercisesByCourse = chartCourses.map((courseName) => ({
    courseName,
    exercises: filteredExercises.filter((exercise) => (exercise.course?.course_name ?? "Course") === courseName),
  }));
  const lineChartLength = Math.max(...exercisesByCourse.map((course) => course.exercises.length), 0);
  const lineChartData = Array.from({ length: lineChartLength }, (_, index) => {
    const point: Record<string, string | number | null> = { name: `ex${index + 1}` };
    exercisesByCourse.forEach(({ courseName, exercises: courseExercises }) => {
      const exercise = courseExercises[index];
      point[courseName] = exercise
        ? grades.find((grade) => grade.exercise_id === exercise.exercise_id)?.score ?? null
        : null;
    });
    return point;
  });

  return (
    <section className="space-y-7">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#64748B]">Student workspace</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#07152F]">Academic Progress &amp; Performance</h2>
          <p className="mt-1 text-sm text-[#64748B]">Review your scores, submissions, and feedback in one place.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={15} />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search exercise..." className="w-52 rounded-xl border border-[#DBEAFE] bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#1769E0] focus:ring-2 focus:ring-[#BFDBFE]" />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#DBEAFE] bg-white px-3">
            <Filter size={14} className="text-[#94A3B8]" />
            <select value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)} className="bg-transparent py-2.5 text-xs font-bold text-[#334155] outline-none">
              <option>All Courses</option>
              {courseNames.map((name) => <option key={name}>{name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ProgressMetric label="Overall average" value={`${average.toFixed(1)} / 20`} detail={`${Math.round((average / 20) * 100)}% target progress`} icon={BarChart3} tone="blue" />
        <ProgressMetric label="Completed exercises" value={`${filteredExercises.filter((exercise) => submittedIds.has(exercise.exercise_id)).length} / ${filteredExercises.length}`} detail={`${completionRate}% submission rate`} icon={CheckCircle2} tone="green" />
        <ProgressMetric label="Highest score" value={highest ? `${scoreFor(highest.exercise_id)} / 20` : "N/A"} detail={highest?.exercise_name ?? "No graded exercise yet"} icon={Award} tone="amber" />
        <ProgressMetric label="Study status" value="Active student" detail={`${profile.full_name} · consistent progress`} icon={Target} tone="purple" />
      </div>

      <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,.03)] sm:p-6">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black text-[#0F172A]">Exercise score progression</h3><span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-[#1769E0]">Scale 0 - 20</span></div>
            <p className="mt-1 text-xs text-[#64748B]">Your performance for {selectedCourse === "All Courses" ? "all courses" : selectedCourse} against the 10/20 target.</p>
          </div>
        </div>
        {filteredExercises.length ? (
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 12, right: 18, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11, fontFamily: "var(--font-inter)" }} axisLine={{ stroke: "#CBD5E1" }} />
                <YAxis domain={[0, 20]} ticks={[0, 5, 10, 15, 20]} tick={{ fill: "#64748B", fontSize: 11, fontFamily: "var(--font-inter)" }} axisLine={{ stroke: "#CBD5E1" }} />
                <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#DBEAFE", fontSize: 12, fontFamily: "var(--font-inter)" }} />
                <ReferenceLine y={10} stroke="#F59E0B" strokeDasharray="5 5" label={{ value: "Target: 10 / 20", fill: "#92400E", fontSize: 11, fontFamily: "var(--font-inter)", position: "insideTopLeft" }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10, fontFamily: "var(--font-inter)" }} />
                {chartCourses.map((courseName, index) => (
                  <Line key={courseName} type="monotone" dataKey={courseName} name={courseName} stroke={chartColors[index % chartColors.length]} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="py-16 text-center text-sm text-[#64748B]">No exercises match your filters.</p>}
        <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-[#64748B]"><span><i className="mr-1 inline-block h-3 w-3 rounded bg-[#1769E0]" />Graded</span><span><i className="mr-1 inline-block h-3 w-3 rounded bg-[#10B981]" />Top score</span><span><i className="mr-1 inline-block h-3 w-3 rounded bg-[#FCD34D]" />Pending submission</span></div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_2px_10px_rgba(15,23,42,.03)]">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6"><div><h3 className="text-lg font-black text-[#0F172A]">Exercise submissions &amp; grades</h3><p className="mt-1 text-xs text-[#64748B]">Detailed scores and submission status for your selected view.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-[#475569]">{filteredExercises.length} exercises</span></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-[#64748B]"><tr><th className="px-5 py-3">Exercise</th><th className="px-5 py-3">Course</th><th className="px-5 py-3">Score</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredExercises.map((exercise) => { const submitted = submittedIds.has(exercise.exercise_id); const score = scoreFor(exercise.exercise_id); return <tr key={exercise.exercise_id} className="transition hover:bg-blue-50/30"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-lg ${submitted ? "bg-blue-50 text-[#1769E0]" : "bg-amber-50 text-[#D97706]"}`}><FileText size={15} /></span><span className="text-sm font-bold text-[#0F172A]">{exercise.exercise_name}</span></div></td><td className="px-5 py-4"><span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#1769E0]">{exercise.course?.course_name ?? "Course"}</span></td><td className="px-5 py-4 text-sm font-bold text-[#1769E0]">{submitted ? `${score} / 20` : "-"}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${submitted ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{submitted ? "Submitted" : "Pending"}</span></td><td className="px-5 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => setSelectedExercise(exercise)} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#1769E0]">View details</button>{!submitted && <button onClick={() => onSubmitExercise(exercise.exercise_id)} className="rounded-lg bg-[#F59E0B] px-3 py-1.5 text-xs font-bold text-white">Submit</button>}</div></td></tr>; })}</tbody></table></div>
      </section>

      {selectedExercise && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={() => setSelectedExercise(null)}><div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="bg-[#1769E0] p-5 text-white"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">Exercise details</p><h3 className="mt-1 text-xl font-black">{selectedExercise.exercise_name}</h3><p className="mt-1 text-xs text-blue-100">{selectedExercise.course?.course_name ?? "Course"}</p></div><button onClick={() => setSelectedExercise(null)}><X size={18} /></button></div></div><div className="space-y-4 p-5"><div className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><span className="text-xs font-bold uppercase text-[#64748B]">Current score</span><strong className="text-2xl text-[#1769E0]">{submittedIds.has(selectedExercise.exercise_id) ? `${scoreFor(selectedExercise.exercise_id)} / 20` : "Pending"}</strong></div><p className="text-sm leading-6 text-[#475569]">{submittedIds.has(selectedExercise.exercise_id) ? "Your submission has been recorded. Review the course material and keep building on this result." : "This exercise is ready for submission. Upload your work from the course workspace."}</p>{!submittedIds.has(selectedExercise.exercise_id) && <button onClick={() => { setSelectedExercise(null); onSubmitExercise(selectedExercise.exercise_id); }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F59E0B] py-3 text-sm font-bold text-white"><Send size={15} /> Submit exercise</button>}</div></div></div>}
    </section>
  );
}

function ProgressMetric({ label, value, detail, icon: Icon, tone }: { label: string; value: string; detail: string; icon: typeof BarChart3; tone: "blue" | "green" | "amber" | "purple" }) {
  const styles = { blue: "bg-blue-50 text-[#1769E0]", green: "bg-emerald-50 text-[#10B981]", amber: "bg-amber-50 text-[#F59E0B]", purple: "bg-violet-50 text-violet-600" };
  return <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,.03)]"><div className="flex items-start justify-between gap-2"><span className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">{label}</span><span className={`flex h-8 w-8 items-center justify-center rounded-xl ${styles[tone]}`}><Icon size={15} /></span></div><p className="mt-3 truncate text-2xl font-black tracking-tight text-[#0F172A]">{value}</p><p className="mt-1 truncate text-xs font-medium text-[#64748B]">{detail}</p></div>;
}

function ClassicStudentWorkspace({
  active,
  setActive,
  profile,
  courses,
  exercises,
  grades,
  submissions,
  notifications,
}: {
  active: string;
  setActive: (value: string) => void;
  profile: ApiStudent;
  courses: Course[];
  exercises: Exercise[];
  grades: Grade[];
  submissions: Submission[];
  notifications: StudentNotification[];
}) {
  const [feedback, setFeedback] = useState("");
  const [profileTab, setProfileTab] = useState<"personal" | "academic" | "security" | "notifications">("personal");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingExerciseId = useRef<number | null>(null);
  const pendingSubmissionId = useRef<number | null>(null);
  const [submittedExerciseIds, setSubmittedExerciseIds] = useState(
    () => new Set(submissions.map((item) => item.exercise_id)),
  );
  const submittedIds = submittedExerciseIds;
  useEffect(() => {
    setProfileImage(window.localStorage.getItem("eduinsight_student_profile_image") ?? "");
  }, []);

  const handleProfileImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result);
      setProfileImage(image);
      window.localStorage.setItem("eduinsight_student_profile_image", image);
    };
    reader.readAsDataURL(file);
  };
  const removeSubmission = async (submission: Submission) => {
    if (!window.confirm("Remove this submission? You can submit a new file afterward.")) return;
    try {
      await api.deleteStudentSubmission(submission.submission_id);
      setSubmittedExerciseIds((current) => {
        const next = new Set(current);
        next.delete(submission.exercise_id);
        return next;
      });
      setFeedback("Submission removed. You can submit a new file now.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to remove submission.");
    }
  };
  const handleStudentProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await api.updateStudentProfile({
        full_name: String(data.get("full_name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone_number: String(data.get("phone_number") ?? ""),
        ...(String(data.get("password") ?? "") ? { password: String(data.get("password")) } : {}),
      });
      setFeedback("Profile updated successfully.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update profile.");
    }
  };

  if (active === "Profile") {
    return (
      <section className="max-w-3xl space-y-6 bg-[#F6F9FC] font-sans">
        <div><p className="text-sm text-[#64748B]">Your account details</p><h2 className="mt-1 text-2xl font-bold text-[#0F172A]">Profile</h2></div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <Avatar initials={profile.full_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()} className="h-16 w-16 text-lg" />
              <div><h3 className="text-xl font-bold text-[#0F172A]">{profile.full_name}</h3><p className="mt-1 text-sm text-[#64748B]">Student account · {profile.email}</p><p className="mt-1 text-xs text-[#64748B]">{profile.level ?? "No academic level"} · <span className="font-semibold text-emerald-600">Active account</span></p></div>
            </div>
            <button type="submit" form="student-profile-form" className="rounded-xl bg-[#1769E0] px-5 py-2.5 text-sm font-bold text-white">Save Changes</button>
          </div>
        </div>
        <form id="student-profile-form" onSubmit={handleStudentProfileSubmit} className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h3 className="text-lg font-bold text-[#0F172A]">Personal Information</h3><div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-[#0F172A]">Email<input name="email" type="email" defaultValue={profile.email} required className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 font-normal outline-none focus:border-[#1769E0]" /></label>
              <label className="text-sm font-semibold text-[#0F172A]">Phone<input name="phone_number" defaultValue={profile.phone_number ?? ""} className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 font-normal outline-none focus:border-[#1769E0]" /></label>
              <div className="rounded-lg border border-dashed border-[#E2E8F0] bg-slate-50 px-3 py-2.5">
                <span className="text-sm font-semibold text-[#0F172A]">Academic level</span>
                <p className="mt-1 text-sm text-[#64748B]">{profile.level ?? "No academic level"}</p>
              </div>
              <label className="text-sm font-semibold text-[#0F172A] sm:col-span-2">New password<input name="password" type="password" placeholder="Leave blank to keep current" className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 font-normal outline-none focus:border-[#1769E0]" /></label>
          </div>{feedback && <p className="mt-4 text-sm text-emerald-600">{feedback}</p>}
          <button type="submit" className="mt-6 rounded-xl bg-[#1769E0] px-5 py-2.5 text-sm font-bold text-white">Save changes</button>
        </form>
      </section>
    );
  }
  const average = grades.length
    ? grades.reduce((sum, item) => sum + item.score, 0) / grades.length
    : 0;
  const progress = exercises.length
    ? Math.round((submittedIds.size / exercises.length) * 100)
    : 0;
  const chartData = exercises.map((exercise) => ({
    name:
      exercise.exercise_name.length > 16
        ? `${exercise.exercise_name.slice(0, 16)}...`
        : exercise.exercise_name,
    score:
      grades.find((grade) => grade.exercise_id === exercise.exercise_id)
        ?.score ?? 0,
  }));
  const announcements = notifications.filter(
    (item) => !item.title.toLowerCase().includes("feedback"),
  );
  const privateFeedback = notifications.filter((item) =>
    item.title.toLowerCase().includes("feedback"),
  );
  const pendingExercises = exercises.filter(
    (exercise) => !submittedIds.has(exercise.exercise_id),
  );
  const recentActivity = [
    ...grades.map((grade) => ({
      icon: CheckCircle2,
      title: `Exercise ${grade.exercise_id} was graded`,
      detail: `${grade.score} points · Recent result`,
      tone: "bg-emerald-50 text-emerald-600",
    })),
    ...notifications.slice(0, 2).map((item) => ({
      icon: Bell,
      title: item.title,
      detail: item.message,
      tone: "bg-blue-50 text-[#0052CC]",
    })),
  ].slice(0, 4);
  const submitExercise = (exerciseId: number, submissionId: number | null = null) => {
    pendingExerciseId.current = exerciseId;
    pendingSubmissionId.current = submissionId;
    setFeedback("Choose your exercise file to submit.");
    fileInputRef.current?.click();
  };
  const handleSubmissionFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    const exerciseId = pendingExerciseId.current;
    const submissionId = pendingSubmissionId.current;
    event.target.value = "";
    pendingExerciseId.current = null;
    pendingSubmissionId.current = null;
    if (!file || exerciseId === null) return;

    try {
      if (submissionId !== null) {
        await api.replaceStudentSubmission(submissionId, file);
        setFeedback("Submission updated successfully.");
      } else {
        await api.createSubmission({ exercise_id: exerciseId, file });
        setSubmittedExerciseIds((current) => new Set(current).add(exerciseId));
        setFeedback("Exercise submitted successfully.");
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Submission failed.");
    }
  };

  if (active === "Notifications") {
    return (
      <section className="space-y-6">
        <div>
          <p className="text-sm text-[#64748B]">Updates from your teachers and administrator</p>
          <h2 className="mt-1 text-2xl font-bold text-[#07152F]">Notifications</h2>
        </div>
        <section className="overflow-hidden rounded-2xl border border-[#FDE68A] bg-[#FFFBEB]">
          <div className="flex items-center justify-between gap-3 border-b border-[#FDE68A] px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#D97706]"><Bell size={19} /></span>
              <h3 className="font-bold text-[#7C2D12]">Teacher updates</h3>
            </div>
            <span className="rounded-full bg-[#FEF3C7] px-2.5 py-1 text-xs font-bold text-[#92400E]">{notifications.length} / 3 max</span>
          </div>
          <div className="space-y-3 p-5">
            {notifications.length ? notifications.slice(0, 3).map((notification) => (
              <article key={notification.notification_id} className="rounded-xl border border-[#FDE68A] bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#F59E0B]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold text-[#7C2D12]">{notification.title}</h4>
                      {notification.created_at && <time className="text-[11px] text-[#94A3B8]">{new Date(notification.created_at).toLocaleString()}</time>}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#9A3412]">{notification.message}</p>
                    <button type="button" className="mt-3 text-xs font-semibold text-emerald-700">✓ Mark read</button>
                  </div>
                </div>
              </article>
            )) : <p className="py-10 text-center text-sm text-[#9A3412]">No new messages from your teachers or administrator.</p>}
          </div>
          <p className="border-t border-[#FDE68A] px-5 py-3 text-center text-xs text-[#A16207]">Showing the latest 3 teacher updates.</p>
        </section>
      </section>
    );
  }

  if (active === "Progress")
    return (
      <StudentProgressWorkspace
        profile={profile}
        courses={courses}
        exercises={exercises}
        grades={grades}
        submissions={submissions}
        onSubmitExercise={submitExercise}
      />
    );
  if (active === "My Courses")
    return (
      <section className="space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          className="hidden"
          onChange={handleSubmissionFile}
        />
        <div>
          <p className="text-sm text-[#64748B]">Student workspace</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">My Courses</h2>
          <p className="mt-2 text-sm text-[#526681]">
            {courses.length} course{courses.length === 1 ? "" : "s"} enrolled this semester.
          </p>
        </div>
        {feedback && (
          <p className={`rounded-lg p-3 text-sm ${feedback.includes("successfully") ? "bg-emerald-50 text-emerald-700" : feedback.includes("failed") ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-[#0052CC]"}`}>
            {feedback}
          </p>
        )}

        {courses.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {courses.map((course) => {
              const courseExercises = exercises.filter(
                (item) => item.course?.course_id === course.course_id,
              );
              const courseMaterialPath = course.material_file_path ?? courseExercises.find(
                (item) => item.material_file_path,
              )?.material_file_path;
              const courseGrades = grades.filter((grade) =>
                courseExercises.some((item) => item.exercise_id === grade.exercise_id),
              );
              const completed = courseExercises.filter((exercise) =>
                submittedIds.has(exercise.exercise_id),
              ).length;
              const completion = courseExercises.length
                ? Math.round((completed / courseExercises.length) * 100)
                : 0;
              const averageScore = courseGrades.length
                ? courseGrades.reduce((sum, grade) => sum + grade.score, 0) / courseGrades.length
                : null;
              const scorePercent = averageScore === null
                ? 0
                : Math.min(100, Math.round((averageScore / 20) * 100));
              const performance = averageScore === null
                ? "No grades yet"
                : averageScore >= 15
                  ? "Good performance"
                  : averageScore >= 10
                    ? "Needs attention"
                    : "Keep practicing";
              const performanceColor = averageScore === null
                ? "text-[#64748B]"
                : averageScore >= 15
                  ? "text-[#16A34A]"
                  : averageScore >= 10
                    ? "text-[#F59E0B]"
                    : "text-[#DC2626]";

              return (
                <article
                  key={course.course_id}
                  className="group rounded-2xl border border-[#D8E1EA] bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,.03)] transition hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-[0_8px_24px_rgba(37,99,235,.09)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#1769E0]">
                      <BookOpen size={25} strokeWidth={1.8} />
                    </div>
                    <span className="rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#1E3A8A]">
                      {course.semester ?? "Current term"}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold tracking-tight text-[#07152F]">
                    {course.course_name}
                  </h3>
                  <p className="mt-1 text-sm text-[#526681]">
                    {course.teacher?.full_name ?? "Course instructor"}
                  </p>

                  <div className="mt-6 space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-[#526681]">Average score</span>
                        <strong className={performanceColor}>
                          {averageScore === null ? "-" : `${averageScore.toFixed(1)} / 20`}
                        </strong>
                      </div>
                      <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#EDF2F7]">
                        <div
                          className={`h-full rounded-full transition-all ${averageScore !== null && averageScore >= 15 ? "bg-[#16A34A]" : averageScore !== null && averageScore >= 10 ? "bg-[#F59E0B]" : "bg-[#2563EB]"}`}
                          style={{ width: `${scorePercent}%` }}
                        />
                      </div>
                      <p className={`mt-2 text-xs font-medium ${performanceColor}`}>{performance}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-[#526681]">Exercises completed</span>
                        <strong className="text-[#07152F]">{completed}/{courseExercises.length}</strong>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EDF2F7]">
                        <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${completion}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-[#F7F9FC] px-4 py-3 text-sm text-[#526681]">
                    {averageScore !== null && averageScore >= 15
                      ? "Good performance. You are progressing well."
                      : averageScore !== null
                        ? "Review recent exercises and focus on your weaker topics."
                        : "Complete an exercise to start building your course progress."}
                  </div>

                  <div className="mt-5 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-[#07152F]">Course exercises</h4>
                        <p className="mt-0.5 text-[11px] text-[#64748B]">Assignments and submission status</p>
                      </div>
                      <span className="rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[11px] font-bold text-[#92400E]">{completed}/{courseExercises.length} complete</span>
                    </div>
                    {courseExercises.length ? (
                      <div className="space-y-2.5">
                        {courseExercises.map((exercise) => {
                          const isSubmitted = submittedIds.has(exercise.exercise_id);
                          const submission = submissions.find((item) => item.exercise_id === exercise.exercise_id);
                          return (
                            <div key={exercise.exercise_id} className="flex items-center gap-2 rounded-lg border border-[#E1EAF5] bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,.03)]">
                              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${isSubmitted ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#EAF2FF] text-[#1769E0]"}`}>
                                {isSubmitted ? <Check size={13} /> : <Pencil size={13} />}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#334155]">{exercise.exercise_name}</span>
                              {exercise.material_file_path && (
                                <a
                                  href={getFileUrl(exercise.material_file_path)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="shrink-0 text-[11px] font-semibold text-[#1769E0] hover:underline"
                                >
                                  View file
                                </a>
                              )}
                              {isSubmitted ? (
                                <div className="flex shrink-0 items-center gap-2">
                                  <span className="text-[11px] font-semibold text-[#16A34A]">Submitted</span>
                                  {submission && (
                                    <>
                                      <button
                                        onClick={() => submitExercise(exercise.exercise_id, submission.submission_id)}
                                        className="rounded-md bg-[#EAF2FF] px-2 py-1 text-[11px] font-bold text-[#1769E0] hover:bg-[#DBEAFE]"
                                      >
                                        Replace
                                      </button>
                                      <button
                                        onClick={() => removeSubmission(submission)}
                                        className="rounded-md bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-100"
                                      >
                                        Remove
                                      </button>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => submitExercise(exercise.exercise_id)}
                                  className="shrink-0 rounded-md bg-[#EAF2FF] px-2 py-1 text-[11px] font-bold text-[#1769E0] hover:bg-[#DBEAFE]"
                                >
                                  Submit
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-[#C8D8E8] bg-white px-3 py-3 text-xs text-[#64748B]">No exercises published for this course yet.</div>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t-2 border-[#EAF2FF] pt-4">
                    {courseMaterialPath ? (
                      <a
                        href={getFileUrl(courseMaterialPath)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1769E0] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#1257BD]"
                      >
                        <FileText size={15} /> View course material
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-xl bg-[#F1F5F9] px-3.5 py-2.5 text-xs font-semibold text-[#64748B]">
                        <FileText size={15} /> Course material not available
                      </span>
                    )}
                    <span className="ml-auto text-xs text-[#64748B]">
                      {courseExercises.length} exercise{courseExercises.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#DBEAFE] bg-white p-8 text-center text-sm text-[#64748B]">
            No courses enrolled yet.
          </div>
        )}
      </section>
    );
  return (
    <section className="space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={handleSubmissionFile}
      />
      <section className="relative overflow-hidden rounded-2xl border border-[#BFEEDB] bg-gradient-to-br from-[#E8FBF1] via-[#F0FAFF] to-white p-6 sm:p-8">
        <div className="absolute -right-12 -top-20 h-48 w-48 rounded-full bg-[#DDF4FF] opacity-70" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#A7E8D1] bg-[#D9F8EB] px-3 py-1 text-xs font-bold text-[#087F5B]">
            <span className="h-2 w-2 rounded-full bg-[#10B981]" /> Active semester 2026 · Spring term
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#07152F] sm:text-4xl">
            Welcome back, {profile.full_name.split(" ")[0]}! <span aria-hidden="true">👋</span>
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#3F5875] sm:text-base">
            Ready to continue your learning journey and make progress today?
          </p>
        </div>
      </section>

      <StudentFocusTimer />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat
          label="Average score"
          value={grades.length ? `${average.toFixed(1)} / 20` : "-"}
          icon={BarChart3}
        />
        <Stat
          label="Exercises done"
          value={`${submittedIds.size} / ${exercises.length}`}
          icon={ClipboardCheck}
        />
        <Stat
          label="Overall progress"
          value={`${progress}%`}
          icon={GraduationCap}
        />
      </div>
      {feedback && (
        <p className="rounded-lg bg-blue-50 p-3 text-sm text-[#0052CC]">
          {feedback}
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-5">
        <section id="my-courses" className="rounded-2xl border border-[#DBEAFE] bg-white lg:col-span-3">
          <div className="flex items-center justify-between border-b border-[#DBEAFE] px-5 py-4">
            <h2 className="font-bold text-[#0F172A]">Exercises to submit</h2>
            <button onClick={() => document.getElementById("my-courses")?.scrollIntoView({ behavior: "smooth" })} className="text-xs font-bold text-[#0052CC]">View all</button>
          </div>
          <div className="divide-y divide-slate-100 px-5">
            {pendingExercises.length ? pendingExercises.map((exercise) => (
              <div key={exercise.exercise_id} className="flex items-center gap-3 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0052CC]"><Pencil size={15} /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#0F172A]">{exercise.exercise_name}</p><p className="text-xs text-[#64748B]">Ready for submission</p></div>
                <button onClick={() => submitExercise(exercise.exercise_id)} className="rounded-lg bg-[#EFF6FF] px-3 py-1.5 text-xs font-bold text-[#0052CC] hover:bg-[#DBEAFE]">Submit</button>
              </div>
            )) : <p className="py-6 text-center text-sm text-[#64748B]">You&apos;re all caught up.</p>}
          </div>
        </section>
        <section className="rounded-2xl border border-[#DBEAFE] bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#DBEAFE] px-5 py-4">
            <h2 className="font-bold text-[#0F172A]">Recent grades</h2>
            <button onClick={() => setFeedback("Your grades are shown in the Progress section.")} className="text-xs font-bold text-[#0052CC]">View all</button>
          </div>
          <div className="space-y-3 p-5">
            {grades.length ? grades.slice(0, 4).map((grade) => (
              <div key={`${grade.exercise_id}-${grade.grade_id ?? grade.score}`} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#0052CC]"><ClipboardCheck size={15} /></span><p className="truncate text-sm font-semibold text-[#0F172A]">Exercise {grade.exercise_id}</p></div>
                <span className="text-sm font-bold text-[#0052CC]">{grade.score}<span className="font-normal text-[#64748B]"> / 20</span></span>
              </div>
            )) : <p className="py-6 text-center text-sm text-[#64748B]">No grades yet.</p>}
          </div>
        </section>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-[#DBEAFE] bg-white">
          <div className="border-b border-[#DBEAFE] px-5 py-4">
            <h2 className="font-bold text-[#0F172A]">Recent activity</h2>
            <p className="mt-1 text-xs text-[#475569]">Your latest learning updates</p>
          </div>
          <div className="space-y-4 p-5">
            {recentActivity.length ? recentActivity.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={`${item.title}-${index}`} className="flex items-start gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.tone}`}>
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A]">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-[#64748B]">{item.detail}</p>
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-[#64748B]">Your activity will appear here as you learn.</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

export function ConnectedApp({
  allowedRole,
}: {
  allowedRole?: "admin" | "teacher" | "student";
}) {
  const [role, setRole] = useState<Role | null>(null);
  const [userName, setUserName] = useState("User");
  const [adminStudents, setAdminStudents] = useState<AdminStudent[]>([]);
  const [adminTeachers, setAdminTeachers] = useState<AdminTeacher[]>([]);
  const [adminClasses, setAdminClasses] = useState<AdminClass[]>([]);
  const [adminProfile, setAdminProfile] = useState<{ admin_id: number; full_name: string; email: string } | null>(null);
  const [adminNotifications, setAdminNotifications] = useState<TeacherNotification[]>([]);
  const [teacherData, setTeacherData] = useState<Teacher | null>(null);
  const [teacherStudents, setTeacherStudents] = useState<AttendanceStudent[]>(
    [],
  );
  const [teacherCourses, setTeacherCourses] = useState<TeacherCourse[]>([]);
  const [teacherExercises, setTeacherExercises] = useState<TeacherExercise[]>(
    [],
  );
  const [teacherGrades, setTeacherGrades] = useState<Grade[]>([]);
  const [teacherAttendance, setTeacherAttendance] = useState<AttendanceRecord[]>([]);
  const [teacherNotifications, setTeacherNotifications] = useState<TeacherNotification[]>([]);
  const [studentProfile, setStudentProfile] = useState<ApiStudent | null>(null);
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [studentExercises, setStudentExercises] = useState<Exercise[]>([]);
  const [studentGrades, setStudentGrades] = useState<Grade[]>([]);
  const [studentSubmissions, setStudentSubmissions] = useState<Submission[]>(
    [],
  );
  const [studentNotifications, setStudentNotifications] = useState<StudentNotification[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("Overview");
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_KEY) as Language | null;
    if (storedLanguage === "en" || storedLanguage === "fr" || storedLanguage === "ar") {
      setLanguage(storedLanguage);
    }
    document.documentElement.lang = storedLanguage ?? "en";
    document.documentElement.dir = storedLanguage === "ar" ? "rtl" : "ltr";
    const handleLanguageChange = (event: Event) => {
      const value = (event as CustomEvent<Language>).detail;
      if (value === "en" || value === "fr" || value === "ar") {
        setLanguage(value);
        document.documentElement.lang = value;
        document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
      }
    };
    window.addEventListener("eduinsight-language-change", handleLanguageChange);
    return () => window.removeEventListener("eduinsight-language-change", handleLanguageChange);
  }, []);
  const reloadAdmin = async () => {
    const [profile, apiStudents, apiTeachers, apiClasses, apiNotifications] = await Promise.all([
      api.getAdminProfile(),
      api.getStudents(),
      api.getTeachers(),
      api.getClasses(),
      api.getAdminNotifications(),
    ]);
    setAdminProfile(profile);
    setUserName(profile.full_name);
    setAdminNotifications(apiNotifications);
    setAdminStudents(
      apiStudents.map((student) => ({
        student_id: student.student_id,
        name: student.full_name,
        email: student.email,
        phone_number: student.phone_number,
        className: student.level ?? "",
        class_id: student.class_id,
        class_ids: student.class_ids,
        status: "Active",
        initials: student.full_name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
      })),
    );
    setAdminTeachers(apiTeachers);
    setAdminClasses(apiClasses);
  };

  useEffect(() => {
    let cancelled = false;
    const session = api.getSession();
    const sessionRole = session.role;
    if (!session.token || !sessionRole)
      return () => {
        cancelled = true;
      };
    if (!allowedRole) {
      window.location.replace(`/${sessionRole}`);
      return () => {
        cancelled = true;
      };
    }
    if (allowedRole !== sessionRole) {
      window.location.replace(`/${sessionRole}`);
      return () => {
        cancelled = true;
      };
    }
    const displayRole = (sessionRole[0].toUpperCase() +
      sessionRole.slice(1)) as Role;
    if (!cancelled) setRole(displayRole);

    const loadData = async () => {
      if (sessionRole === "admin") {
        const [profile, apiStudents, apiTeachers, apiClasses, apiNotifications] =
          await Promise.all([
            api.getAdminProfile(),
            api.getStudents(),
            api.getTeachers(),
            api.getClasses(),
            api.getAdminNotifications(),
          ]);
        if (!cancelled) {
          setUserName(profile.full_name);
          setAdminProfile(profile);
          setAdminNotifications(apiNotifications);
          setAdminStudents(
            apiStudents.map((student) => ({
              student_id: student.student_id,
              name: student.full_name,
              email: student.email,
              phone_number: student.phone_number,
              className: student.level ?? "",
              class_id: student.class_id,
              class_ids: student.class_ids,
              status: "Active",
              initials: student.full_name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
            })),
          );
          setAdminTeachers(apiTeachers);
          setAdminClasses(apiClasses);
        }
        students = apiStudents.map((student) => ({
          name: student.full_name,
          email: student.email,
          className: student.level ?? "",
          class_id: student.class_id,
          status: "Active",
          initials: student.full_name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
        }));
      }

      const loadTeacherData = async (teacherObj: Teacher) => {
        const [
          classStudentGroups,
          apiCourses,
          apiExercises,
          apiGrades,
          apiAttendance,
          apiNotifications,
        ] = await Promise.all([
          Promise.all(
            teacherObj.classes.map((item) =>
              api.getAttendanceStudents(item.class_id),
            ),
          ),
          api.getTeacherCourses(),
          api.getTeacherExercises(),
          api.getTeacherGrades(),
          api.getTeacherAttendance(),
          api.getNotifications(),
        ]);
        if (!cancelled) {
          setUserName(teacherObj.full_name);
          setTeacherData(teacherObj);
          setTeacherStudents(classStudentGroups.flat());
          setTeacherCourses(apiCourses);
          setTeacherExercises(apiExercises);
          setTeacherGrades(apiGrades);
          setTeacherAttendance(apiAttendance);
          setTeacherNotifications(apiNotifications);
        }
      };

      if (sessionRole === "teacher") {
        const teacher = await api.getTeacher();
        await loadTeacherData(teacher);

        // Expose reload globally for the workspace to use
        (window as any).reloadTeacherData = async () => {
          cancelled = false;
          const t = await api.getTeacher();
          await loadTeacherData(t);
        };
      }
      if (sessionRole === "student") {
        const [
          profile,
          apiCourses,
          apiExercises,
          apiGrades,
          apiSubmissions,
          apiNotifications,
        ] = await Promise.all([
          api.getStudentProfile(),
          api.getStudentCourses(),
          api.getStudentExercises(),
          api.getStudentGrades(),
          api.getStudentSubmissions(),
          api.getStudentNotifications(),
        ]);
        if (!cancelled) {
          setUserName(profile.full_name);
          setStudentProfile(profile);
          setStudentCourses(apiCourses);
          setStudentExercises(apiExercises);
          setStudentGrades(apiGrades);
          setStudentSubmissions(apiSubmissions);
          setStudentNotifications(apiNotifications);
        }
        courses = apiCourses.map((course) => ({
          name: course.course_name,
          teacher: course.teacher?.full_name ?? "",
          exercises: apiExercises
            .filter(
              (exercise) => exercise.course?.course_id === course.course_id,
            )
            .map((exercise) => {
              const grade = apiGrades.find(
                (item) => item.exercise_id === exercise.exercise_id,
              );
              return {
                name: exercise.exercise_name,
                score: grade ? String(grade.score) : "—",
                state: grade ? "Submitted" : "Not submitted",
              };
            }),
        }));
      }
    };
    loadData().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!role) return <Login setRole={setRole} />;
  const logout = () => {
    api.logout();
    window.location.assign("/login");
  };
  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} className={`flex min-h-screen bg-white text-[#0F172A] ${role === "Teacher" ? "teacher-workspace" : role === "Admin" ? "admin-workspace" : ""}`}>
      <Sidebar
        role={role}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        active={active}
        userName={userName}
        onLogout={logout}
        setActive={setActive}
        language={language}
      />
      <div className="min-w-0 flex-1">
        <Topbar
          role={role}
          setOpen={setSidebarOpen}
          onLogout={logout}
          userName={userName}
          notifications={role === "Student" ? studentNotifications : role === "Admin" ? adminNotifications : teacherNotifications}
          language={language}
        />
        <main className="mx-auto max-w-[1500px] p-5 pb-24 md:p-8 md:pb-24 lg:pb-8">
          {role === "Student" ? (
            studentProfile ? (
              <ClassicStudentWorkspace
                active={active}
                setActive={setActive}
                profile={studentProfile}
                courses={studentCourses}
                exercises={studentExercises}
                grades={studentGrades}
                submissions={studentSubmissions}
                notifications={studentNotifications}
              />
            ) : (
              <p className="text-sm text-[#64748B]">
                Loading student workspace...
              </p>
            )
          ) : role === "Teacher" ? (
            teacherData ? (
              <DynamicTeacherWorkspace
                active={active}
                teacher={teacherData}
                students={teacherStudents}
                courses={teacherCourses}
                exercises={teacherExercises}
                grades={teacherGrades}
                attendance={teacherAttendance}
                teacherNotifications={teacherNotifications}
                reload={async () => {
                  if ((window as any).reloadTeacherData) {
                    await (window as any).reloadTeacherData();
                  }
                }}
                onAttendanceSaved={async () => {
                  if (teacherData)
                    setTeacherAttendance(await api.getTeacherAttendance());
                }}
              />
            ) : (
              <p className="text-sm text-[#64748B]">
                Loading teacher workspace...
              </p>
            )
          ) : active === "Profile" && adminProfile ? (
            <AdminProfile profile={adminProfile} reload={reloadAdmin} />
          ) : active === "Notifications" ? (
            <AdminNotifications
              students={adminStudents}
              classes={adminClasses}
              reload={reloadAdmin}
              language={language}
            />
          ) : active === "Reports" ? (
            <AdminReports students={adminStudents} />
          ) : (
            <>
              <AdminWorkspace
                students={adminStudents}
                teachers={adminTeachers}
                classes={adminClasses}
                reload={reloadAdmin}
                adminName={userName}
              />
              <div className="mt-6">
                <NotificationList notifications={adminNotifications} />
              </div>
            </>
          )}
        </main>
        {role === "Teacher" && (
          <nav className="fixed inset-x-0 bottom-0 z-40 grid h-20 grid-cols-5 border-t border-[#DBE2EA] bg-white px-2 shadow-[0_-4px_16px_rgba(15,23,42,.06)] lg:hidden">
            {[
              ["Dashboard", LayoutDashboard],
              ["My Classes", GraduationCap],
              ["My Students", Users],
              ["My Courses", BookOpen],
              ["Exercises", ClipboardCheck],
            ].map(([label, Icon]) => {
              const NavIcon = Icon as typeof LayoutDashboard;
              const isActive = active === label || (label === "Dashboard" && active === "Overview");
              return (
                <button
                  key={label as string}
                  onClick={() => setActive(label as string)}
                  className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${isActive ? "text-[#1769E0]" : "text-[#475569]"}`}
                >
                  <NavIcon size={21} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{label as string}</span>
                </button>
              );
            })}
          </nav>
        )}
        {role === "Admin" && (
          <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-3 border-t border-[#DDE8DF] bg-white px-2 shadow-[0_-4px_16px_rgba(22,101,52,.06)] lg:hidden">
            {[["Overview", LayoutDashboard], ["Reports", BarChart3], ["Profile", Settings]].map(([label, Icon]) => {
              const NavIcon = Icon as typeof LayoutDashboard;
              const isActive = active === label;
              return <button key={label as string} onClick={() => setActive(label as string)} className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${isActive ? "text-[#15803D]" : "text-[#64748B]"}`}><NavIcon size={19} strokeWidth={isActive ? 2.5 : 2} /><span>{label as string}</span></button>;
            })}
          </nav>
        )}
      </div>
    </div>
  );
}

