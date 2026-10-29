from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
 
from .models import Notification
from .serializers import NotificationSerializer
 
 
class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    # ✅ ReadOnlyModelViewSet — clients cannot create/update/delete notifications
    # Notifications are created only by the system (billing, appointments etc.)
 
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by("-created_at")
 
    # =============================
    # Mark single notification as read
    # =============================
    @action(detail=True, methods=["post"])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
 
        if notification.user != request.user:
            return Response(
                {"error": "Not authorized."},
                status=status.HTTP_403_FORBIDDEN
            )
 
        notification.is_read = True
        notification.save()
        return Response({"message": "Notification marked as read."})
 
    # =============================
    # Mark all notifications as read  ✅ new
    # =============================
    @action(detail=False, methods=["post"])
    def mark_all_as_read(self, request):
        updated = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({"message": f"{updated} notifications marked as read."})
 
    # =============================
    # Unread count  ✅ new
    # =============================
    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({"unread_count": count})
 