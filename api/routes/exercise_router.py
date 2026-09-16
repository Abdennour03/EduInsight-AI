from fastapi import APIRouter, HTTPException

from api.schemas.exercise_schema import (
    ExerciseResponse,
    ExerciseCreate,
    ExerciseUpdate
)

from api.dependencies import exercise_controller, get_current_user, require_teacher
from fastapi import Depends


router = APIRouter(
    prefix="/exercises",
    tags=["exercises"]
)


@router.get("/", response_model=list[ExerciseResponse])
def get_all_exercises(current_user=Depends(get_current_user)):

    exercises = exercise_controller.get_all_exercises(current_user.organization_id)

    return [
        {
            "exercise_id": exercise.exercise_id,
            "exercise_name": exercise.exercise_name,
            "course_id": exercise.course.course_id,
            "max_score": exercise.max_score,
        }
        for exercise in exercises
    ]


@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(exercise_id: int, current_user=Depends(get_current_user)):

    try:
        exercise = exercise_controller.get_exercise(exercise_id, current_user.organization_id)

        return {
            "exercise_id": exercise.exercise_id,
            "exercise_name": exercise.exercise_name,
            "course_id": exercise.course.course_id,
            "max_score": exercise.max_score,
        }

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


@router.post("/")
def create_exercise(data: ExerciseCreate, current_user=Depends(require_teacher)):

    try:

        result = exercise_controller.create_exercise(
            data.exercise_name,
            data.course_id,
            current_user.teacher_id,
            data.max_score,
        )

        return {
            "message": result
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.put("/{exercise_id}")
def update_exercise(
    exercise_id: int,
    data: ExerciseUpdate,
    current_user=Depends(require_teacher)
):

    try:

        updates = data.model_dump(exclude_none=True)

        result = exercise_controller.update_exercise(
            exercise_id,
            current_user.teacher_id,
            **updates
        )

        return {
            "message": result
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.delete("/{exercise_id}")
def delete_exercise(exercise_id: int, current_user=Depends(require_teacher)):

    try:

        result = exercise_controller.delete_exercise(
            exercise_id,
            current_user.teacher_id
        )

        return {
            "message": result
        }

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


@router.get("/search")
def search_exercises(query: str, current_user=Depends(get_current_user)):

    try:

        exercises = exercise_controller.search_exercise(query, current_user.organization_id)

        return [
            {
                "exercise_id": exercise.exercise_id,
                "exercise_name": exercise.exercise_name,
                "course_id": exercise.course.course_id,
                "max_score": exercise.max_score,
            }
            for exercise in exercises
        ]

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


@router.get("/count")
def count_exercises(current_user=Depends(get_current_user)):

    return {
        "count": exercise_controller.count_exercise(current_user.organization_id)
    }