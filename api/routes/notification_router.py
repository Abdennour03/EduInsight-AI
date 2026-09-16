from fastapi import APIRouter, HTTPException

from api.schemas.notification_schema import (
    NotificationResponse,
    NotificationCreate,
    NotificationUpdate
)

from api.dependencies import notification_controller


router = APIRouter(
    prefix="/notifications",
    tags=["notifications"]
)


def notification_to_response(notification):

    if notification.admin_sender is not None:
        return {
            "notification_id": notification.notification_id,
            "title": notification.title,
            "message": notification.message,
            "teacher_id": 0,
            "teacher_name": notification.admin_sender.full_name,
            "sender_role": "admin",
            "created_at": notification.created_at,
        }

    return {
        "notification_id": notification.notification_id,
        "title": notification.title,
        "message": notification.message,
        "teacher_id": notification.sender.teacher_id,
        "teacher_name": notification.sender.full_name,
        "sender_role": "teacher",
        "created_at": notification.created_at
    }

@router.get("/", response_model=list[NotificationResponse])
def get_all_notifications():

    notifications = notification_controller.get_all_notifications()

    return [
        notification_to_response(notification)
        for notification in notifications
    ]

@router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(notification_id: int):

    try:

        notification = notification_controller.get_notification(
            notification_id
        )

        return notification_to_response(notification)

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

@router.post("/")
def create_notification(data: NotificationCreate):

    try:
        notification = notification_controller.create_notification(
            data.title,
            data.message,
            data.teacher_id
        )

        result = notification_controller.send_to_student(
            notification,
            data.student_id
        )

        return {
            "message": result
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )
    
@router.put("/{notification_id}")
def update_notification(
    notification_id: int,
    data: NotificationUpdate
):

    try:

        updates = data.model_dump(exclude_none=True)

        result = notification_controller.update_notification(
            notification_id,
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

@router.get("/search")
def search_notifications(query: str):

    try:

        notifications = notification_controller.search_notification(
            query
        )

        return [
            notification_to_response(notification)
            for notification in notifications
        ]

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


@router.get("/count")
def count_notifications():

    return {
        "count": notification_controller.count_notifications()
    }