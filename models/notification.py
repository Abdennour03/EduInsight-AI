class Notification:
    def __init__(
        self,
        notification_id,
        title,
        message,
        sender,
        receiver,
        created_at=None,
        admin_sender=None,
        organization_id=None,
    ):
        self.notification_id = notification_id
        self.title = title
        self.message = message
        self.sender = sender
        self.receiver = receiver
        self.created_at = created_at
        self.admin_sender = admin_sender
        self.organization_id = organization_id