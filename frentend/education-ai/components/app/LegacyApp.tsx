"use client";

import { useEffect, useRef, useState } from "react";
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
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  Eye,
  EyeOff,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { jsPDF } from "jspdf";

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
type AdminStudent = (typeof students)[number] & { student_id?: number };
type AdminTeacher = {
  teacher_id: number;
  full_name: string;
  email: string;
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
  className = "",
}: {
  initials: string;
  className?: string;
}) {
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-[#0052CC] ${className}`}
    >
      {initials}
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
}: {
  role: Role;
  open: boolean;
  setOpen: (value: boolean) => void;
  active: string;
  userName: string;
  onLogout: () => void;
  setActive: (value: string) => void;
}) {
  const items =
    role === "Student"
      ? [
        ["Overview", LayoutDashboard],
        ["My Courses", BookOpen],
        ["Progress", BarChart3],
      ]
      : role === "Teacher"
        ? [
          ["Overview", LayoutDashboard],
          ["My Courses", BookOpen],
          ["Submissions", ClipboardCheck],
          ["Attendance", CalendarDays],
          ["My Classes", Users],
        ]
        : [
          // Students / Teachers / Classes management is unified inside the
          // Overview tab-group in AdminWorkspace, so no separate sidebar
          // entries are needed for them. Reports is now the primary
          // analytics view for admins.
          ["Overview", LayoutDashboard],
          ["Reports", BarChart3],
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
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0052CC] text-white">
            <BookOpen size={18} />
          </div>
          <div>
            <div className="font-bold tracking-tight text-[#0F172A]">
              EduInsight <span className="text-[#0052CC]">AI</span>
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
            Workspace
          </div>
          {items.map(([label, Icon]) => (
            <button
              key={label as string}
              onClick={() => {
                const section =
                  label === "Overview"
                    ? "overview"
                    : (label as string).toLowerCase().replaceAll(" ", "-");
                setActive(label as string);
                document
                  .getElementById(section)
                  ?.scrollIntoView({ behavior: "smooth" });
                setOpen(false);
              }}
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${active === label ? "bg-[#EFF6FF] font-semibold text-[#0052CC]" : "text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0052CC]"}`}
            >
              <Icon size={17} />
              <span>{label as string}</span>
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
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#DBEAFE] px-3 py-2 text-xs font-semibold text-[#0052CC] hover:bg-[#EFF6FF]"
          >
            <LogOut size={14} /> Logout
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
}: {
  role: Role;
  setOpen: (value: boolean) => void;
  onLogout: () => void;
  userName: string;
  notifications: TeacherNotification[];
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  return (
    <header className="relative flex min-h-20 items-center justify-between border-b border-[#DBEAFE] bg-white px-3 pb-3 pt-7 sm:px-5 md:px-8 lg:pt-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-lg p-2 text-[#0052CC] hover:bg-[#EFF6FF] lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <div className="truncate text-[10px] font-bold uppercase tracking-[.14em] text-[#64748B] sm:text-xs">
            {role} workspace
          </div>
          <h1 className="truncate text-base font-bold text-[#0F172A] sm:text-xl">
            {userName}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          aria-label="Notifications"
          onClick={() => setNotificationsOpen((value) => !value)}
          className="relative rounded-xl border border-[#DBEAFE] p-2.5 text-[#475569] hover:bg-[#EFF6FF]"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#0052CC]" />
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
        <button
          onClick={onLogout}
          className="hidden items-center gap-2 rounded-xl border border-[#DBEAFE] px-3 py-2 text-xs font-semibold text-[#0052CC] hover:bg-[#EFF6FF] sm:flex"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: any;
}) {
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
        <div className="shrink-0 rounded-xl bg-[#EFF6FF] p-2 text-[#1D4ED8] sm:p-2.5">
          <Icon size={18} />
        </div>
      </div>
    </div>
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
  onAttendanceSaved: () => void;
  reload: () => Promise<void>;
}) {
  const [classId, setClassId] = useState(teacher.classes[0]?.class_id ?? 0);
  const [exerciseId, setExerciseId] = useState(exercises[0]?.exercise_id ?? 0);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

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
    ),
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
  const [dmTitle, setDmTitle] = useState("");
  const [dmMessage, setDmMessage] = useState("");

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
    );
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

  if (active === "My Classes") {
    const activeClass = teacher.classes.find(c => c.class_id === classId);
    return (
      <section id="my-classes" className="space-y-7">
        <div>
          <p className="text-sm text-[#475569]">Manage your students</p>
          <h2 className="mt-1 text-2xl font-bold text-[#0F172A]">My Classes</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teacher.classes.length ? (
            teacher.classes.map((item) => (
              <button
                key={item.class_id}
                onClick={() => setClassId(item.class_id)}
                className={`flex flex-col rounded-2xl border p-5 text-left transition hover:border-[#0052CC] hover:shadow-sm ${classId === item.class_id ? "border-[#0052CC] bg-[#EFF6FF] shadow-sm" : "border-[#DBEAFE] bg-white"}`}
              >

                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${classId === item.class_id ? "bg-[#0052CC] text-white" : "bg-blue-50 text-[#0052CC]"}`}>
                  <BookOpen size={20} />
                </div>
                <p className="font-bold text-[#0F172A]">{item.name}</p>
                <p className="mt-1 text-xs text-[#64748B]">
                  {item.academic_year}
                </p>
              </button>
            ))
          ) : (
            <p className="text-sm text-[#64748B]">No classes assigned.</p>
          )}
        </div>

        {activeClass && (
          <div className="rounded-2xl border border-[#DBEAFE] bg-white">
            <div className="border-b border-[#DBEAFE] p-5">
              <h3 className="font-bold text-[#0F172A]">{activeClass.name} — Enrolled Students</h3>
              <p className="mt-1 text-xs text-[#64748B]">Total: {selectedStudents.length} students</p>
            </div>
            {selectedStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-wider text-[#475569]">
                      <th className="px-5 py-3 font-semibold">Student Name</th>
                      <th className="px-5 py-3 font-semibold">Email Address</th>
                      <th className="px-5 py-3 font-semibold">Class Name</th>
                      <th className="px-5 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedStudents.map((student) => (
                      <tr key={student.student_id} className="transition hover:bg-slate-50/50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              initials={student.full_name
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            />
                            <span className="text-sm font-semibold text-slate-800">
                              {student.full_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#64748B]">
                          {student.email}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {activeClass.name}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button className="rounded-lg p-2 text-[#475569] transition hover:bg-white hover:text-[#0052CC] hover:shadow-sm">
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Users className="mx-auto mb-3 text-slate-300" size={32} />
                <p className="text-sm font-medium text-[#475569]">No students currently enrolled in this class</p>
                <p className="mt-1 text-xs text-slate-500">Students must be assigned to this class by an administrator.</p>
              </div>
            )}
          </div>
        )}
      </section>
    );
  }

  if (active === "My Courses") {
    return (
      <section id="my-courses" className="space-y-5">
        <div>
          <p className="text-sm text-[#475569]">Teaching materials</p>
          <h2 className="mt-1 text-2xl font-bold text-[#0F172A]">My Courses</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.length ? courses.map((course) => {
            const courseExercises = exercises.filter(
              (exercise) => exercise.course.course_id === course.course_id,
            );
            return (
              <div key={course.course_id} className="rounded-2xl border border-[#DBEAFE] bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#0F172A]">{course.course_name}</h3>
                    <p className="mt-1 text-xs text-[#64748B]">{course.semester} · {course.level}</p>
                  </div>
                  {course.material_file_path && (
                    <a href={getFileUrl(course.material_file_path)} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#0052CC]">
                      View material
                    </a>
                  )}
                </div>
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                  {courseExercises.length ? courseExercises.map((exercise) => (
                    <div key={exercise.exercise_id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-700">{exercise.exercise_name}</span>
                      {exercise.material_file_path && (
                        <a href={getFileUrl(exercise.material_file_path)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#0052CC]">
                          View file
                        </a>
                      )}
                    </div>
                  )) : <p className="text-xs text-[#64748B]">No exercises yet.</p>}
                </div>
              </div>
            );
          }) : <p className="text-sm text-[#64748B]">No courses created yet.</p>}
        </div>
      </section>
    );
  }

  if (active === "Attendance")
    return (
      <section id="attendance" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Attendance</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              {today} · {attendancePercent}% present
            </p>
          </div>
          <select
            value={classId}
            onChange={(event) => setClassId(Number(event.target.value))}
            className="rounded-xl border border-[#DBEAFE] px-3 py-2 text-sm"
          >
            {teacher.classes.map((item) => (
              <option key={item.class_id} value={item.class_id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5">
          {selectedStudents.length ? (
            selectedStudents.map((student) => (
              <div
                key={student.student_id}
                className="flex items-center gap-3 border-b border-slate-50 py-3"
              >
                <Avatar
                  initials={student.full_name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                />
                <span className="flex-1 text-sm font-semibold text-slate-700">
                  {student.full_name}
                </span>
                <button
                  onClick={() =>
                    setStatuses({
                      ...statuses,
                      [student.student_id]:
                        statuses[student.student_id] === "present"
                          ? "absent"
                          : "present",
                    })
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${statuses[student.student_id] === "present" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}
                >
                  {statuses[student.student_id] === "present"
                    ? "Present"
                    : "Absent"}
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#64748B]">
              No students enrolled in this class.
            </p>
          )}
          <button
            onClick={saveAttendance}
            disabled={saving || !classId}
            className="mt-4 rounded-xl bg-[#0052CC] px-4 py-3 text-xs font-bold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save attendance"}
          </button>
        </div>
      </section>
    );

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
        <div className="flex gap-3">
          <button
            onClick={() => setShowCourseModal(true)}
            className="rounded-xl bg-[#0052CC] px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 hover:shadow-md"
          >
            + Add Course
          </button>
          <button
            onClick={() => {
              if (courses.length > 0) setNewExerciseCourseId(courses[0].course_id);
              setShowExerciseModal(true);
            }}
            className="rounded-xl border border-[#0052CC] px-5 py-3 text-sm font-bold text-[#0052CC] transition hover:bg-blue-50"
          >
            + Add Exercise
          </button>
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
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Class students"
          value={String(selectedStudents.length)}
          icon={Users}
        />
        <Stat
          label="Exercises"
          value={String(exercises.length)}
          icon={ClipboardCheck}
        />
        <Stat
          label="Attendance today"
          value={`${attendancePercent}%`}
          icon={CalendarDays}
        />
      </div>
      <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5">
        <h2 className="font-bold text-[#0F172A]">Classes and courses</h2>
        {courses.length ? (
          courses.map((course) => (
            <div
              key={course.course_id}
              className="flex justify-between border-b border-slate-50 py-3 text-sm"
            >
              <span className="font-semibold text-slate-700">
                {course.course_name}
              </span>
              <span className="text-[#64748B]">{course.level}</span>
            </div>
          ))
        ) : (
          <p className="mt-3 text-sm text-[#64748B]">No courses available.</p>
        )}
      </div>
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
            Manage your learning community
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">
            People & classes
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
                key={item}
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
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          rememberMe: form.get("rememberMe") === "on",
        }),
      });
      if (!response.ok) throw new Error("Invalid email or password");
      const data = await response.json();
      const role = String(data.role ?? data.user?.role ?? "").toLowerCase();
      if (role === "admin") window.location.href = "/admin";
      else if (role === "teacher") window.location.href = "/teacher";
      else if (role === "student") window.location.href = "/student";
      else throw new Error("Your account role could not be verified");
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
            Demo mode · No account required
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
}: {
  students: AdminStudent[];
  teachers: AdminTeacher[];
  classes: AdminClass[];
  reload: () => Promise<void>;
}) {
  const [tab, setTab] = useState<"Students" | "Teachers" | "Classes">(
    "Students",
  );
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [classAssignmentTeacher, setClassAssignmentTeacher] =
    useState<AdminTeacher | null>(null);
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
  const [assignmentError, setAssignmentError] = useState("");
  const [report, setReport] = useState<StudentReportData | null>(null);
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
  const remove = async (type: string, id: number) => {
    if (!window.confirm("Delete this record?")) return;
    if (type === "student") await api.deleteStudent(id);
    if (type === "teacher") await api.deleteTeacher(id);
    if (type === "class") await api.deleteClass(id);
    await reload();
  };
  return (
    <section id="overview" className="space-y-7">
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
          className="rounded-xl bg-[#0052CC] px-4 py-3 text-xs font-bold text-white"
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
        <div className="flex flex-wrap justify-between gap-4 border-b border-[#DBEAFE] p-5">
          <div className="flex gap-1 rounded-lg bg-[#EFF6FF] p-1">
            {(["Students", "Teachers", "Classes"] as const).map((item) => (
              <button
                key={item}
                onClick={() => {
                  setTab(item);
                  setQuery("");
                }}
                className={`rounded-md px-4 py-2 text-xs font-bold ${tab === item ? "bg-white text-[#0052CC] shadow-sm" : "text-[#475569]"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${tab.toLowerCase()}...`}
            className="rounded-lg border border-[#DBEAFE] px-3 py-2 text-xs"
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
                      <p className="mt-0.5 text-[11px] font-semibold text-amber-600">
                        No class assigned — won't see any courses or exercises
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      item.student_id &&
                      api
                        .getStudentReport(item.student_id)
                        .then((data) => setReport(data as StudentReportData))
                    }
                    disabled={!item.student_id}
                    className="text-xs font-semibold text-[#0052CC] disabled:opacity-40"
                  >
                    Report
                  </button>
                  <button
                    onClick={() =>
                      item.student_id && remove("student", item.student_id)
                    }
                    disabled={!item.student_id}
                    className="text-xs text-rose-600 disabled:opacity-40"
                  >
                    Delete
                  </button>
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
                      setAssignmentError("");
                      setSelectedClassIds([]);
                      setClassAssignmentTeacher(item);
                    }}
                    className="text-xs font-semibold text-[#0052CC]"
                  >
                    Add class
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
                  <BookOpen className="text-[#0052CC]" size={18} />
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
                className="rounded-lg bg-[#0052CC] px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
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
              />
              <Stat
                label="Graded exercises"
                value={`${gradedCount} / ${exercisesAndExams.length}`}
                icon={ClipboardCheck}
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
        <p className="text-sm text-[#475569]">Academic performance overview</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">
          Reports
        </h2>
      </div>

      {classNames.length ? (
        <div className="flex flex-wrap gap-1 rounded-lg bg-[#EFF6FF] p-1">
          {classNames.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedClass(name)}
              className={`rounded-md px-4 py-2 text-xs font-bold ${normalizeClassLabel(selectedClass) === normalizeClassLabel(name)
                ? "bg-white text-[#0052CC] shadow-sm"
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
        />
        <Stat
          label="Students in class"
          value={String(classStudents.length)}
          icon={Users}
        />
        <Stat
          label="Class average"
          value={classAverage !== null ? classAverage.toFixed(2) : "-"}
          detail={loadingClass ? "Calculating..." : undefined}
          icon={BarChart3}
        />
      </div>

      <div className="rounded-2xl border border-[#DBEAFE] bg-white">
        <div className="border-b border-[#DBEAFE] p-5">
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
                      ? "bg-[#0052CC] text-white"
                      : "bg-[#EFF6FF] text-[#0052CC]"
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
                  <span className="shrink-0 text-sm font-bold text-[#0052CC]">
                    {entry?.loading
                      ? "..."
                      : average !== null
                        ? average.toFixed(2)
                        : "N/A"}
                  </span>
                  <button
                    onClick={() => openReport(student)}
                    disabled={!student.student_id}
                    className="shrink-0 rounded-lg border border-[#DBEAFE] px-3 py-1.5 text-xs font-bold text-[#0052CC] transition hover:bg-[#EFF6FF] disabled:opacity-40"
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
  profile,
  courses,
  exercises,
  grades,
  submissions,
  notifications,
}: {
  profile: ApiStudent;
  courses: Course[];
  exercises: Exercise[];
  grades: Grade[];
  submissions: Submission[];
  notifications: StudentNotification[];
}) {
  const [tab, setTab] = useState("Courses");
  const [feedback, setFeedback] = useState("");
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
  return (
    <section className="space-y-7">
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

function ClassicStudentWorkspace({
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
  const [feedback, setFeedback] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingExerciseId = useRef<number | null>(null);
  const submittedIds = new Set(submissions.map((item) => item.exercise_id));
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
  const submitExercise = (exerciseId: number) => {
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
      setFeedback("Exercise submitted successfully.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Submission failed.");
    }
  };

  if (active === "Progress")
    return (
      <section className="space-y-6">
        <div>
          <p className="text-sm text-[#64748B]">Student workspace</p>
          <h2 className="mt-1 text-2xl font-bold text-[#0F172A]">Progress</h2>
        </div>
        <div className="rounded-2xl border border-[#DBEAFE] bg-white p-5">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 20]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#0052CC" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {!chartData.length && (
            <p className="text-sm text-[#64748B]">
              No grades or exercises available.
            </p>
          )}
        </div>
      </section>
    );
  if (active === "My Courses")
    return (
      <section className="space-y-5">
        <h2 className="text-2xl font-bold text-[#0F172A]">My Courses</h2>
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
                  {course.teacher?.full_name ?? ""} · {course.level ?? ""}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-[#475569]">
                    {exercises.filter(
                      (item) => item.course?.course_id === course.course_id,
                    ).length}{" "}
                    exercises
                  </p>
                  {course.material_file_path && (
                    <a
                      href={getFileUrl(course.material_file_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#0052CC] hover:underline"
                    >
                      View course material
                    </a>
                  )}
                </div>
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                  {exercises
                    .filter(
                      (item) => item.course?.course_id === course.course_id,
                    )
                    .map((exercise) => (
                      <div
                        key={exercise.exercise_id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="text-slate-700">
                          {exercise.exercise_name}
                        </span>
                        {exercise.material_file_path && (
                          <a
                            href={getFileUrl(exercise.material_file_path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-[#0052CC] hover:underline"
                          >
                            View exercise file
                          </a>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#64748B]">No courses enrolled.</p>
          )}
        </div>
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[#64748B]">Active classroom</p>
          <h2 className="mt-1 text-2xl font-bold text-[#0F172A]">
            {profile.full_name}
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            {profile.email} · {profile.level ?? "No level"}
          </p>
        </div>
      </div>
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
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-[#DBEAFE] bg-white">
          <div className="border-b border-[#DBEAFE] px-5 py-4">
            <h2 className="font-bold text-[#0F172A]">Learning path</h2>
            <p className="mt-1 text-xs text-[#475569]">
              Courses and exercises for your class
            </p>
          </div>
          <div className="space-y-3 p-5">
            {courses.length ? (
              courses.map((course) => (
                <div
                  key={course.course_id}
                  className="rounded-xl border border-[#DBEAFE]"
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <BookOpen className="text-[#0052CC]" size={17} />
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        {course.course_name}
                      </h3>
                      <p className="text-[11px] text-[#475569]">
                        with {course.teacher?.full_name ?? ""}
                      </p>
                    </div>
                  </div>
                  {exercises
                    .filter(
                      (item) => item.course?.course_id === course.course_id,
                    )
                    .map((exercise) => (
                      <div
                        key={exercise.exercise_id}
                        className="flex items-center gap-3 border-t border-[#DBEAFE] px-4 py-3"
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${submittedIds.has(exercise.exercise_id) ? "bg-emerald-500" : "bg-slate-300"}`}
                        />
                        <span className="flex-1 text-xs font-medium text-slate-700">
                          {exercise.exercise_name}
                        </span>
                        <span className="rounded-full bg-[#EFF6FF] px-2 py-1 text-[10px] font-semibold text-[#475569]">
                          {submittedIds.has(exercise.exercise_id)
                            ? "Submitted"
                            : "Not submitted"}
                        </span>
                        {!submittedIds.has(exercise.exercise_id) && (
                          <button
                            onClick={() => submitExercise(exercise.exercise_id)}
                            className="text-xs font-bold text-[#0052CC]"
                          >
                            Submit
                          </button>
                        )}
                        <span className="w-14 text-right text-xs font-bold">
                          {grades.find(
                            (grade) =>
                              grade.exercise_id === exercise.exercise_id,
                          )?.score ?? "-"}
                        </span>
                      </div>
                    ))}
                </div>
              ))
            ) : (
              <p className="text-sm text-[#64748B]">No courses enrolled.</p>
            )}
          </div>
        </section>
        <aside className="space-y-5">
          <section className="rounded-2xl bg-[#0c2254] p-5 text-white">
            <div className="flex items-center gap-2 text-blue-200">
              <Bell size={16} />
              <span className="text-xs font-semibold uppercase tracking-[.15em]">
                Announcements
              </span>
            </div>
            {announcements.length ? (
              announcements.slice(0, 3).map((item) => (
                <div key={item.notification_id} className="mt-4">
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm text-blue-100/80">
                    {item.message}
                  </p>
                </div>
              ))
            ) : (
              <p className="mt-4 text-sm text-blue-100/80">
                No new announcements.
              </p>
            )}
          </section>
          <section className="rounded-2xl border border-[#DBEAFE] bg-white p-5">
            <h2 className="font-bold text-[#0F172A]">Recent feedback</h2>
            {privateFeedback.length ? (
              privateFeedback.slice(0, 3).map((item) => (
                <div
                  key={item.notification_id}
                  className="mt-4 border-b border-slate-50 pb-3"
                >
                  <p className="text-xs font-semibold text-slate-800">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#475569]">
                    {item.message}
                  </p>
                </div>
              ))
            ) : (
              <p className="mt-4 text-sm text-[#64748B]">
                No private feedback yet.
              </p>
            )}
          </section>
        </aside>
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
  const reloadAdmin = async () => {
    const [apiStudents, apiTeachers, apiClasses] = await Promise.all([
      api.getStudents(),
      api.getTeachers(),
      api.getClasses(),
    ]);
    setAdminStudents(
      apiStudents.map((student) => ({
        student_id: student.student_id,
        name: student.full_name,
        email: student.email,
        className: student.level ?? "",
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
        const [profile, apiStudents, apiTeachers, apiClasses] =
          await Promise.all([
            api.getAdminProfile(),
            api.getStudents(),
            api.getTeachers(),
            api.getClasses(),
          ]);
        if (!cancelled) {
          setUserName(profile.full_name);
          setAdminStudents(
            apiStudents.map((student) => ({
              student_id: student.student_id,
              name: student.full_name,
              email: student.email,
              className: student.level ?? "",
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
        ]);
        if (!cancelled) {
          setUserName(teacherObj.full_name);
          setTeacherData(teacherObj);
          setTeacherStudents(classStudentGroups.flat());
          setTeacherCourses(apiCourses);
          setTeacherExercises(apiExercises);
          setTeacherGrades(apiGrades);
          setTeacherAttendance(apiAttendance);
          setTeacherNotifications([]); // Clear feed to prevent student notifications from leaking to teacher
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
    <div className="flex min-h-screen bg-white text-[#0F172A]">
      <Sidebar
        role={role}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        active={active}
        userName={userName}
        onLogout={logout}
        setActive={setActive}
      />
      <div className="min-w-0 flex-1">
        <Topbar
          role={role}
          setOpen={setSidebarOpen}
          onLogout={logout}
          userName={userName}
          notifications={teacherNotifications}
        />
        <main className="mx-auto max-w-[1500px] p-5 md:p-8">
          {role === "Student" ? (
            studentProfile ? (
              <ClassicStudentWorkspace
                active={active}
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
          ) : active === "Reports" ? (
            <AdminReports students={adminStudents} />
          ) : (
            <AdminWorkspace
              students={adminStudents}
              teachers={adminTeachers}
              classes={adminClasses}
              reload={reloadAdmin}
            />
          )}
        </main>
      </div>
    </div>
  );
}

