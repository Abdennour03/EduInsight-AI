from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from api.schemas.submission_schema import (
    SubmissionUpdate,
    SubmissionResponse
)

from api.dependencies import submission_controller
from api.dependencies import require_student
from fastapi import Depends
from utils.submission_storage import (
    delete_submission_file,
    save_submission_file,
)


router = APIRouter(
    prefix="/submissions",
    tags=["submissions"]
)


def submission_to_response(submission):

    return {
        "submission_id": submission.submission_id,
        "student_id": submission.student_id,
        "exercise_id": submission.exercise.exercise_id,
        "submission_date": submission.submission_date,
        "file_path": submission.file_path,
        "status": submission.status
    }


@router.post(
    "/",
    response_model=dict
)
def create_submission(
    exercise_id: int = Form(...),
    file: UploadFile = File(...),
    current_user=Depends(require_student)
):

    try:
        file_path = save_submission_file(
            file,
            exercise_id,
            current_user.student_id
        )

        result = submission_controller.create_submission(
            current_user.student_id,
            exercise_id,
            file_path
        )

        return {
            "message": result
        }

    except ValueError as error:

        if "file_path" in locals():
            delete_submission_file(file_path)

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.get(
    "/",
    response_model=list[SubmissionResponse]
)
def get_all_submissions():

    submissions = (
        submission_controller
        .get_all_submissions()
    )

    return [
        submission_to_response(submission)
        for submission in submissions
    ]


@router.get(
    "/student/{student_id}",
    response_model=list[SubmissionResponse]
)
def get_submissions_by_student(
    student_id: int
):

    try:

        submissions = (
            submission_controller
            .search_submission_by_student(
                student_id
            )
        )

        return [
            submission_to_response(submission)
            for submission in submissions
        ]

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

@router.get(
    "/exercise/{exercise_id}",
    response_model=list[SubmissionResponse]
)
def get_submissions_by_exercise(
    exercise_id: int
):

    try:

        submissions = (
            submission_controller
            .search_submission_by_exercise(
                exercise_id
            )
        )

        return [
            submission_to_response(submission)
            for submission in submissions
        ]

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

@router.get(
    "/count",
    response_model=dict
)
def count_submissions():

    return {
        "count":
            submission_controller
            .count_submissions()
    }

@router.get(
    "/{submission_id}",
    response_model=SubmissionResponse
)
def get_submission(
    submission_id: int
):

    try:

        submission = (
            submission_controller
            .get_submission(
                submission_id
            )
        )

        return submission_to_response(
            submission
        )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

@router.put(
    "/{submission_id}",
    response_model=dict
)
def update_submission(
    submission_id: int,
    data: SubmissionUpdate
):

    try:

        updates = data.model_dump(
            exclude_none=True
        )

        result = (
            submission_controller
            .update_submission(
                submission_id,
                **updates
            )
        )

        return {
            "message": result
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

@router.delete(
    "/{submission_id}",
    response_model=dict
)
def delete_submission(
    submission_id: int
):

    try:

        result = (
            submission_controller
            .delete_submission(
                submission_id
            )
        )

        return {
            "message": result
        }

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )