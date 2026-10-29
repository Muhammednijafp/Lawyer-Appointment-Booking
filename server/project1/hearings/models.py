from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from cases.models import Case
from billing.models import Invoice
from appointments.models import Appointment
from notifications.models import Notification


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == "ADMIN":
            data = {
                "total_cases": Case.objects.count(),
                "total_invoices": Invoice.objects.count(),
                "pending_invoices": Invoice.objects.filter(status="Unpaid").count(),
                "appointments": Appointment.objects.count(),
            }

        elif user.role == "LAWYER":
            data = {
                "total_cases": Case.objects.filter(lawyer=user).count(),
                "pending_invoices": Invoice.objects.filter(
                    case__lawyer=user,
                    status="Unpaid"
                ).count(),
                "appointments": Appointment.objects.filter(lawyer=user).count(),
            }

        else:  # CLIENT
            data = {
                "total_cases": Case.objects.filter(client=user).count(),
                "pending_invoices": Invoice.objects.filter(
                    client=user,
                    status="Unpaid"
                ).count(),
                "appointments": Appointment.objects.filter(client=user).count(),
            }

        data["unread_notifications"] = Notification.objects.filter(
            user=user,
            is_read=False
        ).count()

        return Response(data)