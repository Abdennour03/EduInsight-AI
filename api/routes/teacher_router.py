from fastapi import APIRouter, File, Form, HTTPException, Depends, UploadFile

from api.dependencies import (
    teacher_controller,
    get_current_admin,
    require_teacher,
    course_controller,
    exercise_controller,
    student_controller,
    db,
)
from utils.submission_storage import save_material_file

from api.schemas.teacher_schema import (
    TeacherResponse,
    TeacherCreate,
    TeacherUpdate
)
router = APIRouter(
    prefix="/teachers",
    tags=["Teachers"]
)


def teacher_response(teacher):
    return {
        "teacher_id": teacher.teacher_id,
        "full_name": teacher.full_name,
        "email": teacher.email,
        "phone_number": teacher.phone_number,
        "classes": [
            {
                "class_id": class_group.class_id,
                "name": class_group.name,
                "academic_year": class_group.academic_year,
            }
            for class_group in teacher.classes
        ],
    }

@router.get("/me", response_model=TeacherResponse)
def get_my_profile(
    current_user=Depends(require_teacher)
):

    return teacher_response(current_user)


@router.get("/me/classes")
def get_my_classes(current_user=Depends(require_teacher)):
    return teacher_response(current_user)["classes"]


@router.put("/me")
def update_my_profile(
    data: TeacherUpdate,
    current_user=Depends(require_teacher)
):

    updates = data.model_dump(exclude_none=True)

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="No data to update"
        )

    result = teacher_controller.update_teacher(
        current_user.teacher_id,
        **updates
    )

    return {
        "message": result
    }


# =========================================================
# MY COURSES
# =========================================================

@router.get("/me/courses")
def get_my_courses(
    current_user=Depends(require_teacher)
):

    courses = course_controller.get_courses_by_teacher(
        current_user.teacher_id,
        current_user.organization_id,
    )

    return [
        {
            "course_id": course.course_id,
            "course_name": course.course_name,
            "semester": course.semester,
            "level": course.level,
            "material_file_path": _material_path("course", course.course_id),
        }
        for course in courses
    ]

# =========================================================
# MY EXERCISES
# =========================================================

@router.get("/me/exercises")
def get_my_exercises(
    current_user=Depends(require_teacher)
):

    exercises = exercise_controller.get_exercises_by_teacher(
        current_user.teacher_id,
        current_user.organization_id,
    )

    return [
        {
            "exercise_id": exercise.exercise_id,
            "exercise_name": exercise.exercise_name,
            "course": {
                "course_id": exercise.course.course_id,
                "max_score": exercise.max_score,
                "course_name": exercise.course.course_name,
                "semester": exercise.course.semester
            },
            "material_file_path": _material_path("exercise", exercise.exercise_id),
        }
        for exercise in exercises
    ]

def _material_path(owner_type: str, owner_id: int):
    row = db.cursor.execute(
        "SELECT file_path FROM learning_materials WHERE owner_type = ? AND owner_id = ? ORDER BY material_id DESC LIMIT 1",
        (owner_type, owner_id),
    ).fetchone()
    return row[0] if row else None


from api.schemas.course_schema import TeacherCourseCreate

@router.post("/me/courses")
def create_my_course(
    course_name: str = Form(...),
    class_id: int = Form(...),
    semester: str = Form(...),
    file: UploadFile | None = File(None),
    current_user=Depends(require_teacher)
):
    try:
        class_group = next(
            (
                class_group
                for class_group in current_user.classes
                if class_group.class_id == class_id
            ),
            None,
        )
        if class_group is None:
            raise ValueError("You can only create courses for your assigned classes.")

        result = course_controller.create_course(
            course_name,
            current_user.teacher_id,
            class_group.name,
            semester
        )

        if file:
            course = db.cursor.execute(
                "SELECT course_id FROM courses WHERE teacher_id = ? AND course_name = ? ORDER BY course_id DESC LIMIT 1",
                (current_user.teacher_id, course_name),
            ).fetchone()
            if course:
                file_path = save_material_file(file, "course", course[0])
                db.cursor.execute(
                    "INSERT INTO learning_materials (owner_type, owner_id, file_path) VALUES (?, ?, ?)",
                    ("course", course[0], file_path),
                )
                db.connection.commit()

        return {
            "message": result
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


from api.schemas.exercise_schema import TeacherExerciseCreate

@router.post("/me/exercises")
def create_my_exercise(
    exercise_name: str = Form(...),
    course_id: int = Form(...),
    max_score: float = Form(20),
    file: UploadFile | None = File(None),
    current_user=Depends(require_teacher)
):

    try:

        result = exercise_controller.create_exercise(
            exercise_name,
            course_id,
            current_user.teacher_id,
            max_score,
        )

        if file:
            exercise = db.cursor.execute(
                "SELECT exercise_id FROM exercises WHERE course_id = ? AND exercise_name = ? ORDER BY exercise_id DESC LIMIT 1",
                (course_id, exercise_name),
            ).fetchone()
            if exercise:
                file_path = save_material_file(file, "exercise", exercise[0])
                db.cursor.execute(
                    "INSERT INTO learning_materials (owner_type, owner_id, file_path) VALUES (?, ?, ?)",
                    ("exercise", exercise[0], file_path),
                )
                db.connection.commit()

        return {
            "message": result
        }

    except ValueError as error:

        status_code = 409 if "already has a grade" in str(error) else 400
        raise HTTPException(status_code=status_code, detail=str(error))

@router.get("/me/students")
def get_my_students(
    current_user=Depends(require_teacher)
):
    class_ids = [class_group.class_id for class_group in current_user.classes]
    students = student_controller.get_students_by_class_ids(class_ids)

    return [
        {
            "student_id": student.student_id,
            "full_name": student.full_name,
            "email": student.email,
            "phone_number": student.phone_number,
            "level": student.level,
            "class_id": student.class_id
        }
        for student in students
    ]


@router.get("/me/submissions")
def get_my_submissions(
    current_user=Depends(require_teacher)
):
    from api.dependencies import submission_controller
    try:
        submissions = submission_controller.get_submissions_by_teacher(
            current_user.teacher_id,
            current_user.organization_id,
        )
    except ValueError:
        return []

    return [
        {
            "submission_id": submission.submission_id,
            "student_id": submission.student.student_id,
            "exercise_id": submission.exercise.exercise_id,
            "submission_date": str(submission.submission_date),
            "file_path": submission.file_path,
            "status": submission.status
        }
        for submission in submissions
    ]

from api.schemas.grade_schema import GradeCreate
from api.dependencies import grade_controller

# =========================================================
# MY GRADES
# =========================================================

from api.schemas.grade_schema import (
    GradeBulkUpdate,
    GradeCreate,
    GradeUpdate
)
from api.dependencies import grade_controller


@router.get("/me/grades")
def get_my_grades(
    current_user=Depends(require_teacher)
):

    grades = grade_controller.get_grades_by_teacher(
        current_user.teacher_id,
        current_user.organization_id,
    )

    return [
        {
            "grade_id": grade.grade_id,
            "score": grade.score,
            "student_id": grade.student.student_id,
            "exercise_id": grade.exercise.exercise_id
        }
        for grade in grades
    ]


@router.post("/me/grades")
def add_grade_to_student(
    data: GradeCreate | list[GradeCreate],
    current_user=Depends(require_teacher)
):

    try:
        grade_items = data if isinstance(data, list) else [data]

        for grade_data in grade_items:
            grade_controller.create_grade(
                grade_data.score,
                grade_data.student_id,
                grade_data.exercise_id,
                current_user.teacher_id,
                current_user.organization_id,
            )

        return {
            "message": f"{len(grade_items)} grade(s) created successfully."
        }

    except ValueError as error:

        status_code = 409 if "already has a grade" in str(error) else 400
        raise HTTPException(status_code=status_code, detail=str(error))


@router.put("/me/grades")
def update_my_grades(
    data: list[GradeBulkUpdate],
    current_user=Depends(require_teacher)
):

    try:
        for grade_data in data:
            grade_controller.update_grade_by_teacher(
                grade_data.grade_id,
                current_user.teacher_id,
                grade_data.score
            )

        return {
            "message": f"{len(data)} grade(s) updated successfully."
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.put("/me/grades/{grade_id}")
def update_my_grade(
    grade_id: int,
    data: GradeUpdate,
    current_user=Depends(require_teacher)
):

    try:

        result = grade_controller.update_grade_by_teacher(
            grade_id,
            current_user.teacher_id,
            data.score
        )

        return {
            "message": result
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )
    
# =========================================================
# NOTIFICATIONS
# =========================================================

from api.schemas.notification_schema import TeacherNotificationCreate
from api.dependencies import notification_controller


@router.post("/me/notifications")
def send_notification_to_students(
    data: TeacherNotificationCreate,
    current_user=Depends(require_teacher)
):
    """Broadcast an announcement to all students in the teacher's assigned classes."""
    try:
        assigned_class_ids = [c.class_id for c in current_user.classes]
        class_ids = assigned_class_ids
        if data.class_id is not None:
            if data.class_id not in assigned_class_ids:
                raise ValueError("You can only message students in your assigned classes.")
            class_ids = [data.class_id]
        if not class_ids:
            raise ValueError("You have no assigned classes to send notifications to.")

        # Create a single notification and send it only to students in teacher's classes
        from services.notification_service import NotificationService
        result = notification_controller.send_notification_to_class_students(
            current_user.teacher_id,
            class_ids,
            data.title,
            data.message
        )

        return {
            "message": result
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

@router.post("/me/notifications/{student_id}")
def send_notification_to_student(
    student_id: int,
    data: TeacherNotificationCreate,
    current_user=Depends(require_teacher)
):

    try:

        result = notification_controller.send_notification_to_student(
            current_user.teacher_id,
            student_id,
            data.title,
            data.message
        )

        return {
            "message": result
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )
        
@router.get("/", response_model=list[TeacherResponse])
def get_all_teachers(_admin=Depends(get_current_admin)):

    teachers = teacher_controller.get_all_teachers()

    return [
        teacher_response(teacher)
        for teacher in teachers
    ]


@router.post("/")
def create_teacher(data: TeacherCreate):
    try:
        result = teacher_controller.create_teacher(
            data.full_name,
            data.email,
            data.password,
            data.phone_number
        )
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error))

    if result is False:
        raise HTTPException(
            status_code=400,
            detail="Could not create teacher"
        )

    return {
        "message": result
    }


@router.get("/search")
def search_teachers(full_name: str):

    teachers = teacher_controller.search_teacher(full_name)

    return [
        teacher_response(teacher)
        for teacher in teachers
    ]


@router.get("/count")
def count_teachers():

    count = teacher_controller.count_teachers()

    return {
        "count": count
    }


@router.put("/{teacher_id}")
def update_teacher(
    teacher_id: int,
    data: TeacherUpdate
):

    teacher = teacher_controller.get_teacher(teacher_id)

    if teacher is None:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    updates = data.model_dump(exclude_none=True)

    result = teacher_controller.update_teacher(
        teacher_id,
        **updates
    )

    return {
        "message": result
    }


@router.delete("/{teacher_id}")
def delete_teacher(teacher_id: int):

    teacher = teacher_controller.get_teacher(teacher_id)

    if teacher is None:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    result = teacher_controller.delete_teacher(teacher_id)

    return {
        "message": result
    }


@router.get("/{teacher_id}", response_model=TeacherResponse)
def get_teacher(teacher_id: int):

    teacher = teacher_controller.get_teacher(teacher_id)

    if teacher is None:
        raise HTTPException(
            status_code=404,
            detail="Teacher not found"
        )

    return {
        "teacher_id": teacher.teacher_id,
        "full_name": teacher.full_name,
        "email": teacher.email,
        "phone_number": teacher.phone_number
    }