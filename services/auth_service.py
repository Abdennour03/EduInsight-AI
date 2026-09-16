from utils.security import create_access_token, verify_password


class AuthService:
    def __init__(self, student_repo, teacher_repo, admin_repo=None):
        self.student_repo = student_repo
        self.teacher_repo = teacher_repo
        self.admin_repo = admin_repo

    def login(self, email, password):
        candidates = (
            ("student", self.student_repo.get_student_by_email(email)),
            ("teacher", self.teacher_repo.get_teacher_by_email(email)),
            ("admin", self.admin_repo.get_admin_by_email(email))
            if self.admin_repo is not None else ("__disabled__", None),
        )
        for role, user in candidates:
            if user is not None and verify_password(password, user.password):
                user_id = (
                    user.student_id
                    if role == "student"
                    else user.teacher_id
                    if role == "teacher"
                    else user.admin_id
                )
                payload = {"sub": str(user_id), "role": role}
                if hasattr(user, "organization_id") and user.organization_id is not None:
                    payload["organization_id"] = user.organization_id
                return {
                    "access_token": create_access_token(payload),
                    "token_type": "bearer",
                    "role": role,
                }
        return None
