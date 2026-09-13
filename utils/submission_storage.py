from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile


UPLOAD_ROOT = Path(__file__).resolve().parent.parent / "uploads"
SUBMISSION_UPLOAD_DIR = UPLOAD_ROOT / "submissions"
ALLOWED_SUBMISSION_TYPES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
}
ALLOWED_MATERIAL_TYPES = ALLOWED_SUBMISSION_TYPES


def save_submission_file(
    file: UploadFile,
    exercise_id: int,
    student_id: int,
) -> str:
    extension = ALLOWED_SUBMISSION_TYPES.get(file.content_type)
    if extension is None:
        raise ValueError("Only PDF, JPEG, and PNG files are allowed.")

    SUBMISSION_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f")
    filename = (
        f"exercise_{exercise_id}_student_{student_id}_"
        f"{timestamp}_{uuid4().hex}{extension}"
    )
    destination = SUBMISSION_UPLOAD_DIR / filename

    with destination.open("wb") as output_file:
        while chunk := file.file.read(1024 * 1024):
            output_file.write(chunk)

    return f"/uploads/submissions/{filename}"


def delete_submission_file(file_path: str) -> None:
    relative_path = file_path.removeprefix("/uploads/")
    (UPLOAD_ROOT / relative_path).unlink(missing_ok=True)


def save_material_file(file: UploadFile, owner_type: str, owner_id: int) -> str:
    extension = ALLOWED_MATERIAL_TYPES.get(file.content_type)
    if extension is None:
        raise ValueError("Only PDF, JPEG, and PNG files are allowed.")

    material_dir = UPLOAD_ROOT / "materials"
    material_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f")
    filename = f"{owner_type}_{owner_id}_{timestamp}_{uuid4().hex}{extension}"
    destination = material_dir / filename
    with destination.open("wb") as output_file:
        while chunk := file.file.read(1024 * 1024):
            output_file.write(chunk)
    return f"/uploads/materials/{filename}"