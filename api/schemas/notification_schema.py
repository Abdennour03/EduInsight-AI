from pydantic import BaseModel


class NotificationResponse(BaseModel):
    notification_id: int
    title: str
    message: str
    teacher_id: int
    teacher_name: str
    sender_role: str = "teacher"
    created_at: str


class AdminNotificationCreate(BaseModel):
    title: str
    message: str
    class_id: int | None = None
    student_id: int | None = None


class NotificationCreate(BaseModel):
    title: str
    message: str
    teacher_id: int
    student_id: int


class TeacherNotificationCreate(BaseModel):
    title: str
    message: str
    class_id: int | None = None


class NotificationUpdate(BaseModel):
    title: str | None = None
    message: str | None = None
    teacher_id: int | None = None