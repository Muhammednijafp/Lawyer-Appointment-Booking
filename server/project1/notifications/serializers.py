from rest_framework import serializers
from .models import Notification
 
 
class NotificationSerializer(serializers.ModelSerializer):
 
    class Meta:
        model = Notification
        fields = "__all__"          # ✅ fixed — was "_all_"
        read_only_fields = ["user", "created_at"]
 