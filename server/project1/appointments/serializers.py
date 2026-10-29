from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    client_username = serializers.CharField(source="client.username", read_only=True)
    lawyer_username = serializers.CharField(source="lawyer.username", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "client", "client_username",
            "lawyer", "lawyer_username",
            "category", "category_name",
            "description",
            "appointment_date",
            "status",
            "created_at",
        ]
        read_only_fields = ["client", "status", "created_at"]