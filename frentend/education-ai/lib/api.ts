const rawUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.VITE_API_BASE_URL;
const DIRECT_URL = (!rawUrl || rawUrl === "/" ? "http://127.0.0.1:8000" : rawUrl).replace(/\/$/, "");
// In the browser, use the Next.js proxy to avoid CORS. On the server (SSR), call directly.
const API_BASE_URL = typeof window !== "undefined" ? "/api-proxy" : DIRECT_URL;
export const getFileUrl = (filePath: string) =>
  typeof window === "undefined" ? `${DIRECT_URL}${filePath}` : `/api-proxy${filePath}`;


export type Role = "admin" | "teacher" | "student";

export type ApiStudent = {
  student_id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  level?: string;
  class_id?: number | null;
};

export type ApiClass = {
  class_id: number;
  name: string;
  academic_year: string;
};

export type AttendanceStudent = ApiStudent;

export type AttendanceRecord = {
  student_id: number;
  student_name?: string;
  class_id: number;
  date: string;
  status: "present" | "absent";
};

export type Course = {
  course_id: number;
  course_name: string;
  semester?: string;
  level?: string;
  teacher?: { teacher_id: number; full_name: string };
};

export type Exercise = {
  exercise_id: number;
  exercise_name: string;
  course?: { course_id: number; course_name: string; semester?: string };
};

export type Grade = {
  grade_id?: number;
  score: number;
  student_id: number;
  exercise_id: number;
};

export type Teacher = {
  teacher_id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  classes: ApiClass[];
};

export type TeacherCourse = {
  course_id: number;
  course_name: string;
  semester: string;
  level: string;
  material_file_path?: string | null;
};
export type TeacherExercise = {
  exercise_id: number;
  exercise_name: string;
  max_score: number;
  course: { course_id: number; course_name: string; semester: string };
  material_file_path?: string | null;
};
export type Submission = {
  submission_id: number;
  student_id: number;
  exercise_id: number;
  submission_date: string;
  file_path: string;
  status: string;
};
export type StudentNotification = {
  student_notification_id?: number;
  notification_id: number;
  title: string;
  message: string;
  is_read?: boolean;
  created_at: string;
};
export type TeacherNotification = {
  notification_id: number;
  title: string;
  message: string;
  teacher_id: number;
  teacher_name: string;
  created_at: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  role: Role;
};

const TOKEN_KEY = "eduinsight_access_token";
const ROLE_KEY = "eduinsight_role";

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token =
    typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(init.headers);
  if (!(typeof FormData !== "undefined" && init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (response.status === 401) {
    clearSession();
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.location.assign("/login");
    }
    throw new Error("Your session has expired. Please sign in again.");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      payload && typeof payload.detail === "string"
        ? payload.detail
        : "Request failed";
    throw new Error(detail);
  }
  return payload as T;
}

export const api = {
  login: async (email: string, password: string) => {
    try {
      return await request<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Invalid email or password"
      ) {
        throw new Error(
          "Invalid email or password. Create the admin environment first, then create teacher accounts from the admin workspace.",
        );
      }
      throw error;
    }
  },
  setupAdmin: (data: { name: string; email: string; password: string }) =>
    request<{ message: string; admin_id: number; email: string }>(
      "/admin/setup",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),
  saveSession: (session: LoginResponse) => {
    localStorage.setItem(TOKEN_KEY, session.access_token);
    localStorage.setItem(ROLE_KEY, session.role);
  },
  getSession: () => ({
    token:
      typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY),
    role: (typeof window === "undefined"
      ? null
      : localStorage.getItem(ROLE_KEY)) as Role | null,
  }),
  logout: () => clearSession(),
  getTeacher: () => request<Teacher>("/teachers/me"),
  getTeacherClasses: () => request<ApiClass[]>("/teachers/me/classes"),
  getTeacherCourses: () => request<TeacherCourse[]>("/teachers/me/courses"),
  getTeacherExercises: () =>
    request<TeacherExercise[]>("/teachers/me/exercises"),
  createCourse: (data: {
    course_name: string;
    class_id: number;
    semester: string;
    file?: File;
  }) => {
    const formData = new FormData();
    formData.append("course_name", data.course_name);
    formData.append("class_id", String(data.class_id));
    formData.append("semester", data.semester);
    if (data.file) formData.append("file", data.file);
    return request<{ message: string }>("/teachers/me/courses", {
      method: "POST",
      body: formData,
    });
  },
  createExercise: (data: {
    exercise_name: string;
    course_id: number;
    max_score: number;
    file?: File;
  }) => {
    const formData = new FormData();
    formData.append("exercise_name", data.exercise_name);
    formData.append("course_id", String(data.course_id));
    formData.append("max_score", String(data.max_score));
    if (data.file) formData.append("file", data.file);
    return request<{ message: string }>("/teachers/me/exercises", {
      method: "POST",
      body: formData,
    });
  },
  sendClassAnnouncement: (data: { title: string; message: string }) =>
    request<{ message: string }>("/teachers/me/notifications", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  sendStudentFeedback: (
    studentId: number,
    data: { title: string; message: string },
  ) =>
    request<{ message: string }>(`/teachers/me/notifications/${studentId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getTeacherStudents: () =>
    request<AttendanceStudent[]>("/teachers/me/students"),
  getNotifications: () => request<TeacherNotification[]>("/notifications/"),
  getAdminProfile: () =>
    request<{ admin_id: number; full_name: string; email: string }>(
      "/admin/me",
    ),
  getAttendanceStudents: (classId: number) =>
    request<AttendanceStudent[]>(
      `/teachers/me/attendance/classes/${classId}/students`,
    ),
  saveAttendance: (
    classId: number,
    date: string,
    records: { student_id: number; status: "present" | "absent" }[],
  ) =>
    request<{ message: string }>("/teachers/me/attendance", {
      method: "POST",
      body: JSON.stringify({ class_id: classId, date, records }),
    }),
  getTeacherAttendance: (classId?: number, month?: string) =>
    request<AttendanceRecord[]>(
      `/teachers/me/attendance${classId || month ? `?${new URLSearchParams({ ...(classId ? { class_id: String(classId) } : {}), ...(month ? { month } : {}) })}` : ""}`,
    ),
  getTeacherGrades: () => request<Grade[]>("/teachers/me/grades"),
  getExerciseSubmissions: (exerciseId: number) =>
    request<Submission[]>(`/submissions/exercise/${exerciseId}`),
  createGrades: (
    grades: { score: number; student_id: number; exercise_id: number }[],
  ) =>
    Promise.all(
      grades.map((grade) =>
        request<{ message: string }>("/teachers/me/grades", {
          method: "POST",
          body: JSON.stringify(grade),
        }),
      ),
    ).then(() => ({ message: "Grades saved successfully." })),
  updateGrade: (gradeId: number, score: number) =>
    request<{ message: string }>(`/teachers/me/grades/${gradeId}`, {
      method: "PUT",
      body: JSON.stringify({ score }),
    }),
  getStudentProfile: () => request<ApiStudent>("/students/me"),
  getStudentCourses: () => request<Course[]>("/students/me/courses"),
  getStudentExercises: () => request<Exercise[]>("/students/me/exercises"),
  getStudentGrades: () => request<Grade[]>("/students/me/grades"),
  getStudentSubmissions: () =>
    request<Submission[]>("/students/me/submissions"),
  createSubmission: (data: { exercise_id: number; file: File }) => {
    const formData = new FormData();
    formData.append("exercise_id", String(data.exercise_id));
    formData.append("file", data.file);

    return request<Submission>("/students/me/submissions", {
      method: "POST",
      body: formData,
    });
  },
  getStudentNotifications: () =>
    request<StudentNotification[]>("/students/me/notifications"),
  updateStudentProfile: (
    data: Partial<{
      full_name: string;
      email: string;
      password: string;
      phone_number: string;
      level: string;
    }>,
  ) =>
    request<ApiStudent>("/students/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateTeacherProfile: (
    data: Partial<{
      full_name: string;
      email: string;
      password: string;
      phone_number: string;
    }>,
  ) =>
    request<{ message: string }>("/teachers/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getStudents: () => request<ApiStudent[]>("/admin/students"),
  searchStudents: (fullName: string) =>
    request<ApiStudent[]>(
      `/admin/students/search?full_name=${encodeURIComponent(fullName)}`,
    ),
  getTeachers: () => request<Teacher[]>("/admin/teachers"),
  searchTeachers: (fullName: string) =>
    request<Teacher[]>(
      `/admin/teachers/search?full_name=${encodeURIComponent(fullName)}`,
    ),
  getClasses: () => request<ApiClass[]>("/admin/classes"),
  createClass: (data: {
    name: string;
    academic_year: string;
    teacher_ids?: number[];
  }) =>
    request<ApiClass>("/admin/classes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateAdminProfile: (
    data: Partial<{ full_name: string; email: string; password: string }>,
  ) =>
    request<{ admin_id: number; full_name: string; email: string }>(
      "/admin/me",
      { method: "PUT", body: JSON.stringify(data) },
    ),
  assignStudentClass: (studentId: number, classId: number) =>
    request<{ message: string }>(
      `/admin/students/${studentId}/class/${classId}`,
      { method: "POST" },
    ),
  getStudentReport: (studentId: number) =>
    request<Record<string, unknown>>(`/admin/students/${studentId}/report`),
  createStudent: (data: {
    full_name: string;
    email: string;
    password: string;
    phone_number: string;
    level: string;
    class_id?: number;
  }) =>
    request<ApiStudent>("/admin/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStudent: (
    studentId: number,
    data: Partial<{
      full_name: string;
      email: string;
      password: string;
      phone_number: string;
      level: string;
      class_id: number;
    }>,
  ) =>
    request<{ message: string }>(`/admin/students/${studentId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteStudent: (studentId: number) =>
    request<{ message: string }>(`/admin/students/${studentId}`, {
      method: "DELETE",
    }),
  createTeacher: (data: {
    full_name: string;
    email: string;
    password: string;
    phone_number: string;
    class_ids?: number[];
  }) =>
    request<Teacher>("/admin/teachers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTeacher: (
    teacherId: number,
    data: Partial<{
      full_name: string;
      email: string;
      password: string;
      phone_number: string;
      class_ids: number[];
    }>,
  ) =>
    request<{ message: string }>(`/admin/teachers/${teacherId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteTeacher: (teacherId: number) =>
    request<{ message: string }>(`/admin/teachers/${teacherId}`, {
      method: "DELETE",
    }),
  assignTeacherClasses: (teacherId: number, classIds: number[]) =>
    request<{ message: string }>(`/admin/teachers/${teacherId}/classes`, {
      method: "POST",
      body: JSON.stringify({ class_ids: classIds }),
    }),
  updateClass: (
    classId: number,
    data: Partial<{ name: string; academic_year: string }>,
  ) =>
    request<{ message: string }>(`/admin/classes/${classId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteClass: (classId: number) =>
    request<{ message: string }>(`/admin/classes/${classId}`, {
      method: "DELETE",
    }),
  getMonthlyAttendance: (classId: number, month: string) =>
    request<AttendanceRecord[]>(
      `/admin/attendance/report?class_id=${classId}&month=${month}`,
    ),
};
