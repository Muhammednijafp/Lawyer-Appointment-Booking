import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatRoom, Message
from cases.models import Case
 
 
class ChatConsumer(AsyncWebsocketConsumer):
 
    async def connect(self):
        try:
            self.case_id = self.scope["url_route"]["kwargs"]["case_id"]
            self.room_group_name = f"chat_{self.case_id}"
 
            user = self.scope.get("user")
 
            # ✅ Reject anonymous users at connection time
            if not user or user.is_anonymous:
                print("❌ Anonymous user rejected")
                await self.close()
                return
 
            # ✅ check_user_access is now actually called
            has_access = await self.check_user_access(user)
            if not has_access:
                print(f"❌ User {user.username} has no access to case {self.case_id}")
                await self.close()
                return
 
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
 
            await self.accept()
            print(f"✅ Connected: user={user.username}, case={self.case_id}")
 
        except Exception as e:
            print("CONNECT ERROR:", e)
            await self.close()
 
    @database_sync_to_async
    def check_user_access(self, user):
        try:
            case = Case.objects.get(id=self.case_id)
            return user == case.client or user == case.lawyer
        except Case.DoesNotExist:
            return False  # ✅ fixed indentation
 
    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
 
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            msg_type = data.get("type", "message")
 
            # ✅ Handle seen acknowledgement from frontend
            if msg_type == "seen":
                message_id = data.get("message_id")
                if message_id:
                    await self.mark_seen(message_id)
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            "type": "seen_update",
                            "message_id": message_id,
                        }
                    )
                return
 
            message_text = data.get("message", "").strip()
            temp_id = data.get("temp_id")
 
            if not message_text:
                return
 
            user = self.scope.get("user")
 
            if not user or user.is_anonymous:
                await self.close()
                return
 
            message_obj = await self.save_message(user, message_text)
 
            if not message_obj:
                return
 
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message_text,
                    "username": user.username,
                    "message_id": message_obj.id,
                    "temp_id": temp_id,   # ✅ passed through
                    "status": "sent",
                }
            )
 
        except Exception as e:
            print("❌ RECEIVE ERROR:", str(e))
 
    async def chat_message(self, event):
        user = self.scope["user"]
 
        if user.username != event["username"]:
            await self.mark_delivered(event["message_id"])
            status = "delivered"
        else:
            status = event["status"]
 
        # ✅ temp_id included in response so frontend can match optimistic messages
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"],
            "username": event["username"],
            "message_id": event["message_id"],
            "temp_id": event.get("temp_id"),
            "status": status,
        }))
 
    @database_sync_to_async
    def save_message(self, user, message):
        try:
            # ✅ Removed duplicate Case import
            case = Case.objects.get(id=self.case_id)
            room, _ = ChatRoom.objects.get_or_create(case=case)
 
            msg = Message.objects.create(
                room=room,
                sender=user,
                content=message,
                status="sent"
            )
            return msg
 
        except Exception as e:
            print("❌ SAVE ERROR:", str(e))
            return None
 
    @database_sync_to_async
    def mark_delivered(self, message_id):
        try:
            message = Message.objects.get(id=message_id)
            if message.status == "sent":
                message.status = "delivered"
                message.save()
        except Message.DoesNotExist:
            pass
 
    @database_sync_to_async
    def mark_seen(self, message_id):
        try:
            message = Message.objects.get(id=message_id)
            if message.status != "seen":  # ✅ only update if not already seen
                message.status = "seen"
                message.save()
        except Message.DoesNotExist:
            pass
 
    async def seen_update(self, event):
        # ✅ Now properly triggered via receive → group_send
        await self.send(text_data=json.dumps({
            "type": "seen_update",
            "message_id": event["message_id"],
            "status": "seen",
        }))
 


























