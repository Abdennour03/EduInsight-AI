from pydantic import BaseModel
from typing import Optional


class StudentExerciseResponse(BaseModel):
    exercise_id: int
    exercise_name: str
    course: dict
    max_score: Optional[float] = None
    score: Optional[float] = None
    submission_status: str = "pending"