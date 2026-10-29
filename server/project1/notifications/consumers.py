import json
from channels.generic.websocket import AsyncWebsocketConsumer
 
 
class NotificationConsumer(AsyncWebsocketConsumer):
 
    async def connect(self):
        user = self.scope.get("user")
 
        # ✅ Reject unauthenticated connections
        if not user or user.is_anonymous:
            print("❌ Unauthenticated user rejected from notifications")
            await self.close()
            return
 
        # ✅ Per-user group — each user only receives their own notifications
        self.group_name = f"notifications_user_{user.id}"
 
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
 
        await self.accept()
        print(f"✅ Notification socket connected: user={user.username}")
 
    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
 
    async def send_notification(self, event):
        # ✅ Includes notification_type so frontend can handle different types
        await self.send(text_data=json.dumps({
            "type": "notification",
            "title": event["title"],
            "message": event["message"],
            "notification_type": event.get("notification_type", "SYSTEM"),
        }))
 


























