from django.contrib import admin
from .models import ChatRoom, Message
 
 
@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ['id', 'case', 'created_at']
 
 
@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'room', 'sender', 'status', 'timestamp']
    list_filter = ['status']
    search_fields = ['sender__username', 'content']
 


























