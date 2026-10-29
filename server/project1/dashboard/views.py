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
                "ongoing_cases": Case.objects.filter(status="Ongoing").count(),
                "closed_cases": Case.objects.filter(status="Closed").count(),
                "total_invoices": Invoice.objects.count(),
                "pending_invoices": Invoice.objects.filter(status="PENDING").count(),   # ✅ fixed "Unpaid" → "PENDING"
                "overdue_invoices": Invoice.objects.filter(status="OVERDUE").count(),   # ✅ new
                "paid_invoices": Invoice.objects.filter(status="PAID").count(),         # ✅ new
                "total_appointments": Appointment.objects.count(),
                "pending_appointments": Appointment.objects.filter(status="Pending").count(),
            }
 
        elif user.role == "LAWYER":
            data = {
                "total_cases": Case.objects.filter(lawyer=user).count(),
                "ongoing_cases": Case.objects.filter(lawyer=user, status="Ongoing").count(),
                "closed_cases": Case.objects.filter(lawyer=user, status="Closed").count(),
                "pending_invoices": Invoice.objects.filter(
                    case__lawyer=user, status="PENDING"     # ✅ fixed "Unpaid" → "PENDING"
                ).count(),
                "overdue_invoices": Invoice.objects.filter(
                    case__lawyer=user, status="OVERDUE"
                ).count(),
                "total_appointments": Appointment.objects.filter(lawyer=user).count(),
                "pending_appointments": Appointment.objects.filter(
                    lawyer=user, status="Pending"
                ).count(),
            }
 
        else:  # CLIENT
            data = {
                "total_cases": Case.objects.filter(client=user).count(),
                "ongoing_cases": Case.objects.filter(client=user, status="Ongoing").count(),
                "pending_invoices": Invoice.objects.filter(
                    client=user, status="PENDING"           # ✅ fixed "Unpaid" → "PENDING"
                ).count(),
                "overdue_invoices": Invoice.objects.filter(
                    client=user, status="OVERDUE"
                ).count(),
                "total_appointments": Appointment.objects.filter(client=user).count(),
                "pending_appointments": Appointment.objects.filter(
                    client=user, status="Pending"
                ).count(),
            }
 
        # ✅ Unread notifications count — same for all roles
        data["unread_notifications"] = Notification.objects.filter(
            user=user, is_read=False
        ).count()
 
        return Response(data)
 