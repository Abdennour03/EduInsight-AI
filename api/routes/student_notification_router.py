from fastapi import APIRouter, HTTPException

from api.dependencies import notification_controller, require_student
from fastapi import Depends


router = APIRouter(
    prefix="/student-notifications",
    tags=["student-notifications"]
)


@router.get(
    "/student/{student_id}",
    response_model=list[dict]
)
def get_notifications_for_student(student_id: int, current_user=Depends(require_student)):
    if student_id != current_user.student_id:
        raise HTTPException(status_code=403, detail="You can only access your own notifications.")

    notifications = (
        notification_controller.get_student_notifications(
            student_id,
            current_user.organization_id,
        )
    )

    return [
        {
            "student_notification_id":
                item.student_notification_id,

            "notification_id":
                item.notification.notification_id,

            "title":
                item.notification.title,

            "message":
                item.notification.message,

            "is_read":
                item.is_read,

            "created_at":
                item.notification.created_at
        }
        for item in notifications
    ]


@router.patch("/{student_notification_id}/read")
def mark_as_read(student_notification_id: int, current_user=Depends(require_student)):

    try:
        result = notification_controller.mark_as_read(
            student_notification_id,
            current_user.student_id,
            current_user.organization_id,
        )
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))

    return {
        "message": "Notification marked as read"
    }