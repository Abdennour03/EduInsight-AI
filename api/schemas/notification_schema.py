from pydantic import BaseModel, Field, model_validator


class NotificationResponse(BaseModel):
    notification_id: int
    title: str
    message: str
    teacher_id: int
    teacher_name: str
    sender_role: str = "teacher"
    created_at: str


class AdminNotificationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=5000)
    class_id: int | None = Field(default=None, gt=0)
    student_id: int | None = Field(default=None, gt=0)

    @model_validator(mode="after")
    def validate_recipient(self):
        if (self.student_id is None) == (self.class_id is None):
            raise ValueError("Provide exactly one of student_id or class_id.")
        return self


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