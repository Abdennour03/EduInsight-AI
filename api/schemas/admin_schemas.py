from pydantic import BaseModel, Field


class ClassCreate(BaseModel):
    name: str
    academic_year: str
    teacher_ids: list[int] = Field(default_factory=list)


class ClassUpdate(BaseModel):
    name: str | None = None
    academic_year: str | None = None


class ClassResponse(BaseModel):
    class_id: int
    name: str
    academic_year: str
    organization_id: int | None = None


class AdminStudentCreate(BaseModel):
    full_name: str
    email: str
    password: str
    phone_number: str
    level: str
    class_id: int | None = None
    class_ids: list[int] = Field(default_factory=list)


class AdminProfileResponse(BaseModel):
    admin_id: int
    full_name: str
    email: str
    phone_number: str | None = None


class AdminProfileUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    password: str | None = None


class AdminSetupRequest(BaseModel):
    name: str
    email: str
    phone_number: str
    password: str


class AdminStudentUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    password: str | None = None
    phone_number: str | None = None
    level: str | None = None
    class_id: int | None = None
    class_ids: list[int] | None = None


class AdminTeacherCreate(BaseModel):
    full_name: str
    email: str
    password: str
    phone_number: str
    class_ids: list[int] | None = None


class AdminTeacherUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    password: str | None = None
    phone_number: str | None = None
    class_ids: list[int] | None = None


class TeacherClassAssignment(BaseModel):
    class_ids: list[int]


class ClassInfo(BaseModel):
    class_id: int
    name: str
    academic_year: str


class ExerciseGradeReport(BaseModel):
    exercise_id: int
    exercise_name: str
    score: float | None


class AdminStudentReportResponse(BaseModel):
    student_id: int
    name: str
    email: str
    class_info: ClassInfo | None
    exercises_and_exams: list[ExerciseGradeReport]