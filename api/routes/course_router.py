from fastapi import APIRouter, HTTPException

from api.schemas.course_schema import (
    CourseResponse,
    CourseCreate,
    CourseUpdate
)

from api.dependencies import course_controller, get_current_user, require_teacher
from fastapi import Depends


router = APIRouter(
    prefix="/courses",
    tags=["Courses"]
)


@router.get("/", response_model=list[CourseResponse])
def get_all_courses(current_user=Depends(get_current_user)):

    courses = course_controller.get_all_courses(current_user.organization_id)

    return [
        {
            "course_id": course.course_id,
            "course_name": course.course_name,
            "teacher_id": course.teacher.teacher_id,
            "semester": course.semester,
            "level": course.level
        }
        for course in courses
    ]


@router.post("/")
def create_course(data: CourseCreate, current_user=Depends(require_teacher)):

    result = course_controller.create_course(
        data.course_name,
        current_user.teacher_id,
        data.level,
        data.semester
    )

    if result is False:
        raise HTTPException(
            status_code=400,
            detail="Could not create course"
        )

    return {
        "message": result
    }


@router.get("/search")
def search_courses(query: str, current_user=Depends(get_current_user)):

    courses = course_controller.search_course(query, current_user.organization_id)

    return [
        {
            "course_id": course.course_id,
            "course_name": course.course_name,
            "teacher_id": course.teacher.teacher_id,
            "semester": course.semester,
            "level": course.level
        }
        for course in courses
    ]


@router.get("/count")
def count_courses(current_user=Depends(get_current_user)):

    count = course_controller.count_courses(current_user.organization_id)

    return {
        "count": count
    }


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, current_user=Depends(get_current_user)):

    course = course_controller.get_course(course_id, current_user.organization_id)

    if course is None:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return {
        "course_id": course.course_id,
        "course_name": course.course_name,
        "teacher_id": course.teacher.teacher_id,
        "semester": course.semester,
        "level": course.level
    }


@router.put("/{course_id}")
def update_course(
    course_id: int,
    data: CourseUpdate,
    current_user=Depends(require_teacher)
):

    updates = data.model_dump(exclude_none=True)

    result = course_controller.update_course(
        course_id,
        current_user.teacher_id,
        **updates
    )

    return {
        "message": result
    }


@router.delete("/{course_id}")
def delete_course(course_id: int, current_user=Depends(require_teacher)):

    result = course_controller.delete_course(course_id, current_user.teacher_id)

    return {
        "message": result
    }