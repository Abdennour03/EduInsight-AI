from fastapi import APIRouter, Depends, HTTPException

from api.dependencies import (
    admin_controller,
    class_controller,
    get_current_admin,
    student_controller,
    teacher_controller,
)
from api.schemas.admin_schemas import (
    AdminStudentCreate,
    AdminStudentReportResponse,
    AdminStudentUpdate,
    AdminProfileResponse,
    AdminProfileUpdate,
    AdminSetupRequest,
    AdminTeacherCreate,
    AdminTeacherUpdate,
    TeacherClassAssignment,
    ClassCreate,
    ClassResponse,
    ClassUpdate,
)
from api.schemas.notification_schema import AdminNotificationCreate
from api.dependencies import notification_controller

router = APIRouter(prefix="/admin", tags=["admin"])


def student_response(student):
    return {
        "student_id": student.student_id,
        "full_name": student.full_name,
        "email": student.email,
        "phone_number": student.phone_number,
        "level": student.level,
        "class_id": student.class_id,
        "class_ids": getattr(student, "class_ids", [student.class_id] if student.class_id is not None else []),
    }


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


def class_response(class_group):
    return {
        "class_id": class_group.class_id,
        "name": class_group.name,
        "academic_year": class_group.academic_year,
        "organization_id": class_group.organization_id,
    }


def notification_response(notification):
    if notification.admin_sender is not None:
        sender_name = notification.admin_sender.full_name
        sender_role = "admin"
    else:
        sender_name = notification.sender.full_name
        sender_role = "teacher"
    return {
        "notification_id": notification.notification_id,
        "title": notification.title,
        "message": notification.message,
        "teacher_id": getattr(notification.sender, "teacher_id", 0),
        "teacher_name": sender_name,
        "sender_role": sender_role,
        "created_at": notification.created_at,
    }


@router.post("/setup")
def setup_admin(data: AdminSetupRequest):
    try:
        admin = admin_controller.setup_admin(
            data.name,
            data.email,
            data.phone_number,
            data.password,
        )
        return {
            "message": "Admin account created successfully.",
            "admin_id": admin.admin_id,
            "email": admin.email,
            "phone_number": admin.phone_number,
        }
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error))


@router.get("/me", response_model=AdminProfileResponse)
def get_my_profile(admin=Depends(get_current_admin)):
    return admin_controller.get_profile(admin.admin_id)


@router.put("/me", response_model=AdminProfileResponse)
def update_my_profile(data: AdminProfileUpdate, admin=Depends(get_current_admin)):
    try:
        return admin_controller.update_profile(
            admin.admin_id,
            data.model_dump(exclude_none=True),
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.post("/classes", response_model=ClassResponse)
def create_class(data: ClassCreate, _admin=Depends(get_current_admin)):
    try:
        selected_teachers = [
            teacher_controller.get_teacher(teacher_id, _admin.admin_id)
            for teacher_id in data.teacher_ids
        ]
        for teacher in selected_teachers:
            admin_controller.assert_teacher_access(teacher.teacher_id, _admin.admin_id)
        created_class = admin_controller.create_class(data, _admin.admin_id)
        for teacher in selected_teachers:
            existing_class_ids = [
                class_group.class_id for class_group in teacher.classes
            ]
            if created_class.class_id not in existing_class_ids:
                existing_class_ids.append(created_class.class_id)
            admin_controller.assign_teacher_to_classes(
                teacher.teacher_id,
                existing_class_ids,
                _admin.admin_id,
            )
        return class_response(created_class)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.get("/classes", response_model=list[ClassResponse])
def list_classes(_admin=Depends(get_current_admin)):
    return [class_response(item) for item in admin_controller.get_classes(_admin.admin_id)]


@router.get("/stats")
def workspace_stats(_admin=Depends(get_current_admin)):
    return {
        "total_students": student_controller.count_students(_admin.admin_id),
        "teaching_staff": teacher_controller.count_teachers(_admin.admin_id),
        "active_classes": len(admin_controller.get_classes(_admin.admin_id)),
    }


@router.put("/classes/{class_id}")
def update_class(class_id: int, data: ClassUpdate, _admin=Depends(get_current_admin)):
    try:
        admin_controller.assert_class_access(class_id, _admin.admin_id)
        return {"message": admin_controller.admin_service.class_service.update_class(
            class_id, _admin.admin_id, **data.model_dump(exclude_none=True)
        )}
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.delete("/classes/{class_id}")
def delete_class(class_id: int, _admin=Depends(get_current_admin)):
    try:
        admin_controller.assert_class_access(class_id, _admin.admin_id)
        return {"message": admin_controller.admin_service.class_service.delete_class(class_id, _admin.admin_id)}
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post("/students")
def create_student(data: AdminStudentCreate, _admin=Depends(get_current_admin)):
    try:
        return student_response(admin_controller.create_student(data, _admin.admin_id))
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.get("/students")
def list_students(_admin=Depends(get_current_admin)):
    return [student_response(item) for item in admin_controller.get_students(_admin.admin_id)]


@router.get("/students/search")
def search_students(full_name: str, _admin=Depends(get_current_admin)):
    return [student_response(item) for item in student_controller.search_student(full_name, _admin.admin_id)]


@router.put("/students/{student_id}")
def update_student(student_id: int, data: AdminStudentUpdate, _admin=Depends(get_current_admin)):
    try:
        admin_controller.assert_student_access(student_id, _admin.admin_id)
        return {"message": admin_controller.update_student(
            student_id, data.model_dump(exclude_none=True), _admin.admin_id
        )}
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.delete("/students/{student_id}")
def delete_student(student_id: int, _admin=Depends(get_current_admin)):
    try:
        admin_controller.assert_student_access(student_id, _admin.admin_id)
        admin_controller.assert_student_access(student_id, _admin.admin_id)
        return {"message": student_controller.delete_student(student_id)}
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.get("/students/{student_id}/report", response_model=AdminStudentReportResponse)
def student_report(student_id: int, _admin=Depends(get_current_admin)):
    try:
        admin_controller.assert_student_access(student_id, _admin.admin_id)
        return admin_controller.get_student_report(student_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post("/students/{student_id}/class/{class_id}")
def assign_student(student_id: int, class_id: int, _admin=Depends(get_current_admin)):
    try:
        admin_controller.assert_student_access(student_id, _admin.admin_id)
        admin_controller.assert_class_access(class_id, _admin.admin_id)
        return {"message": admin_controller.assign_student_to_class(student_id, class_id, _admin.admin_id)}
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.post("/teachers")
def create_teacher(data: AdminTeacherCreate, _admin=Depends(get_current_admin)):
    try:
        return teacher_response(admin_controller.create_teacher(data, _admin.admin_id))
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.get("/teachers")
def list_teachers(_admin=Depends(get_current_admin)):
    return [teacher_response(item) for item in admin_controller.get_teachers(_admin.admin_id)]


@router.get("/teachers/search")
def search_teachers(full_name: str, _admin=Depends(get_current_admin)):
    return [teacher_response(item) for item in teacher_controller.search_teacher(full_name, _admin.admin_id)]


@router.put("/teachers/{teacher_id}")
def update_teacher(teacher_id: int, data: AdminTeacherUpdate, _admin=Depends(get_current_admin)):
    try:
        admin_controller.assert_teacher_access(teacher_id, _admin.admin_id)
        return {"message": admin_controller.update_teacher(
            teacher_id, data.model_dump(exclude_none=True), _admin.admin_id
        )}
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.delete("/teachers/{teacher_id}")
def delete_teacher(teacher_id: int, _admin=Depends(get_current_admin)):
    try:
        admin_controller.assert_teacher_access(teacher_id, _admin.admin_id)
        admin_controller.assert_teacher_access(teacher_id, _admin.admin_id)
        return {"message": teacher_controller.delete_teacher(teacher_id)}
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post("/teachers/{teacher_id}/classes")
def assign_teacher(teacher_id: int, data: TeacherClassAssignment, _admin=Depends(get_current_admin)):
    try:
        admin_controller.assert_teacher_access(teacher_id, _admin.admin_id)
        for class_id in data.class_ids:
            admin_controller.assert_class_access(class_id, _admin.admin_id)
        teacher = teacher_controller.get_teacher(teacher_id, _admin.admin_id)
        existing_class_ids = {
            class_group.class_id for class_group in teacher.classes
        }
        duplicate_class_ids = existing_class_ids.intersection(data.class_ids)
        if duplicate_class_ids:
            duplicate_ids = ", ".join(
                str(class_id) for class_id in sorted(duplicate_class_ids)
            )
            raise ValueError(
                f"Teacher is already assigned to class ID(s): {duplicate_ids}."
            )

        all_class_ids = [*existing_class_ids, *data.class_ids]
        return {"message": admin_controller.assign_teacher_to_classes(
            teacher_id,
            all_class_ids,
            _admin.admin_id,
        )}
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.get("/notifications")
def list_admin_notifications(admin=Depends(get_current_admin)):
    return [
        notification_response(item)
        for item in notification_controller.get_admin_notifications(admin.admin_id)
    ]


@router.post("/notifications")
def send_admin_notification(
    data: AdminNotificationCreate,
    admin=Depends(get_current_admin),
):
    try:
        result = notification_controller.send_admin_notification(
            admin.admin_id,
            data.title,
            data.message,
            student_id=data.student_id,
            class_id=data.class_id,
        )
        return {"message": result}
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))