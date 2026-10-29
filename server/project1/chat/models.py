from django.db import models
from django.conf import settings
from cases.models import Case
 
 
class ChatRoom(models.Model):
    case = models.OneToOneField(
        Case,
        on_delete=models.CASCADE,
        related_name="chat_room"
    )
    created_at = models.DateTimeField(auto_now_add=True)
 
    def __str__(self):
        return f"ChatRoom for Case: {self.case.title}"
 
 
class Message(models.Model):
 
    STATUS_CHOICES = (
        ("sent", "Sent"),
        ("delivered", "Delivered"),
        ("seen", "Seen"),
    )
 
    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name="messages"
    )
 
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )
 
    content = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="sent"
    )
 
    timestamp = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        ordering = ["timestamp"]
 
    def __str__(self):
        return f"{self.sender.username}: {self.content[:40]}"
 