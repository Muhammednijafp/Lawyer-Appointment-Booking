from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from notifications.models import Notification
from chat.models import ChatRoom
from cases.models import Case, CaseActivityLog
from .models import Appointment
from .serializers import AppointmentSerializer


def update_lawyer_stats(lawyer):
    """✅ Auto-recalculate lawyer stats"""
    try:
        from accounts.models import LawyerProfile
        profile = LawyerProfile.objects.get(user=lawyer)
        all_cases = Case.objects.filter(lawyer=lawyer)
        profile.total_cases = all_cases.count()
        profile.cases_won = all_cases.filter(status="Closed").count()
        profile.save()
    except Exception as e:
        print(f"Failed to update lawyer stats: {e}")


class AppointmentViewSet(viewsets.ModelViewSet):

    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "CLIENT":
            return Appointment.objects.filter(client=user)
        if user.role == "LAWYER":
            return Appointment.objects.filter(lawyer=user)
        if user.role == "ADMIN":
            return Appointment.objects.all()
        return Appointment.objects.none()

    def perform_create(self, serializer):
        appointment = serializer.save(client=self.request.user)

        Notification.objects.create(
            user=appointment.lawyer,
            title="New Appointment Request",
            message=f"{appointment.client.username} has requested an appointment.",
            notification_type="APPOINTMENT"
        )

        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"notifications_user_{appointment.lawyer.id}",
                {
                    "type": "send_notification",
                    "title": "New Appointment Request",
                    "message": f"{appointment.client.username} has requested an appointment.",
                    "notification_type": "APPOINTMENT",
                }
            )
        except Exception as e:
            print(f"Notification error: {e}")

    # ── Approve ────────────────────────────────────────
    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        appointment = self.get_object()

        if request.user.role != "LAWYER":
            return Response({"error": "Only a lawyer can approve appointments."}, status=status.HTTP_403_FORBIDDEN)

        if appointment.lawyer != request.user:
            return Response({"error": "You can only approve your own appointments."}, status=status.HTTP_403_FORBIDDEN)

        if appointment.status != "Pending":
            return Response({"error": f"Appointment is already {appointment.status}."}, status=status.HTTP_400_BAD_REQUEST)

        appointment.status = "Approved"
        appointment.save()

        # Create case from appointment
        case = Case.objects.create(
            title=f"{appointment.category.name} Case",
            description=appointment.description,
            client=appointment.client,
            lawyer=appointment.lawyer,
            category=appointment.category,
            status="Ongoing"
        )

        ChatRoom.objects.get_or_create(case=case)

        CaseActivityLog.objects.create(
            case=case,
            user=request.user,
            action_type="Case Created",
            description="Case auto-created from approved appointment."
        )

        # ✅ Update lawyer stats when new case is created
        update_lawyer_stats(request.user)

        Notification.objects.create(
            user=appointment.client,
            title="Appointment Approved",
            message="Your appointment has been approved and a case has been created.",
            notification_type="APPOINTMENT"
        )

        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"notifications_user_{appointment.client.id}",
                {
                    "type": "send_notification",
                    "title": "Appointment Approved",
                    "message": "Your appointment has been approved and a case has been created.",
                    "notification_type": "APPOINTMENT",
                }
            )
        except Exception as e:
            print(f"Notification error: {e}")

        return Response({
            "message": "Appointment approved and case created.",
            "case_id": case.id,
        })

    # ── Reject ─────────────────────────────────────────
    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        appointment = self.get_object()

        if request.user.role != "LAWYER":
            return Response({"error": "Only a lawyer can reject appointments."}, status=status.HTTP_403_FORBIDDEN)

        if appointment.lawyer != request.user:
            return Response({"error": "You can only reject your own appointments."}, status=status.HTTP_403_FORBIDDEN)

        if appointment.status != "Pending":
            return Response({"error": f"Appointment is already {appointment.status}."}, status=status.HTTP_400_BAD_REQUEST)

        appointment.status = "Rejected"
        appointment.save()

        Notification.objects.create(
            user=appointment.client,
            title="Appointment Rejected",
            message="Your appointment request has been rejected.",
            notification_type="APPOINTMENT"
        )

        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"notifications_user_{appointment.client.id}",
                {
                    "type": "send_notification",
                    "title": "Appointment Rejected",
                    "message": "Your appointment request has been rejected.",
                    "notification_type": "APPOINTMENT",
                }
            )
        except Exception as e:
            print(f"Notification error: {e}")

        return Response({"message": "Appointment rejected."})