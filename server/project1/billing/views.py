from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.utils import timezone
import io
import hmac
import hashlib
import razorpay

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4

from .models import Invoice
from .serializers import InvoiceSerializer
from .permissions import InvoicePermission
from cases.models import CaseActivityLog
from notifications.models import Notification
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

# ─── Razorpay credentials ─────────────────────────────────────────────────
# Replace these with your actual Razorpay keys from https://dashboard.razorpay.com
RAZORPAY_KEY_ID     = "rzp_test_RifDitkcb9Q5gl"  # Your Razorpay Key ID     e.g. rzp_test_XXXXXXXXXX
RAZORPAY_KEY_SECRET = "jFvg655jJ2ixRc1FZovsZAAu" # Your Razorpay Key Secret e.g. XXXXXXXXXXXXXXXXXXXXXXXX

razorpay_client = razorpay.Client(
    auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
)


class InvoiceViewSet(viewsets.ModelViewSet):

    serializer_class = InvoiceSerializer
    permission_classes = [InvoicePermission]

    def get_queryset(self):
        user = self.request.user
        invoices = Invoice.objects.all()

        for invoice in invoices:
            if invoice.status == "PENDING" and invoice.due_date and invoice.due_date < timezone.now().date():
                invoice.status = "OVERDUE"
                invoice.save()

        if user.role == "ADMIN":
            return invoices
        if user.role == "LAWYER":
            return invoices.filter(case__lawyer=user)
        return invoices.filter(client=user)

    def perform_create(self, serializer):
        case = serializer.validated_data.get("case")

        invoice = serializer.save(
            client=case.client
        )

        CaseActivityLog.objects.create(
            case=invoice.case,
            user=self.request.user,
            action_type="Invoice Generated",
            description=f"Invoice of ₹{invoice.amount} generated."
        )

        Notification.objects.create(
            user=invoice.client,
            title="Invoice Generated",
            message=f"Invoice #{invoice.id} has been generated for your case.",
            notification_type="INVOICE"
        )

        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            f"notifications_user_{invoice.client.id}",
            {
                "type": "send_notification",
                "title": "Invoice Generated",
                "message": f"Invoice #{invoice.id} has been generated for your case.",
                "notification_type": "INVOICE",
            }
        )

    # ─────────────────────────────────────────────────────────────────────
    # RAZORPAY — Step 1: Create Razorpay Order
    # Client calls this to get an order_id before opening the payment popup
    # ─────────────────────────────────────────────────────────────────────
    @action(detail=True, methods=["post"])
    def create_payment_order(self, request, pk=None):
        invoice = self.get_object()

        # Only the client of this invoice can pay
        if request.user != invoice.client:
            return Response(
                {"error": "Only the client can pay this invoice."},
                status=status.HTTP_403_FORBIDDEN
            )

        if invoice.status == "PAID":
            return Response(
                {"error": "Invoice is already paid."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if invoice.status == "CANCELLED":
            return Response(
                {"error": "Cancelled invoice cannot be paid."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # ✅ Razorpay amount is in paise (1 INR = 100 paise)
            amount_paise = int(float(invoice.amount) * 100)

            order_data = {
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"invoice_{invoice.id}",
                "notes": {
                    "invoice_id": str(invoice.id),
                    "client": invoice.client.username,
                    "case": invoice.case.title,
                }
            }

            razorpay_order = razorpay_client.order.create(data=order_data)

            # Save the order ID to the invoice
            invoice.razorpay_order_id = razorpay_order["id"]
            invoice.save()

            return Response({
                "order_id": razorpay_order["id"],
                "amount": amount_paise,
                "currency": "INR",
                "key_id": RAZORPAY_KEY_ID,
                "invoice_id": invoice.id,
                "description": invoice.description or f"Invoice #{invoice.id} Payment",
                "client_name": invoice.client.username,
                "client_email": invoice.client.email or "",
                "client_phone": invoice.client.phone or "",
            })

        except Exception as e:
            return Response(
                {"error": f"Failed to create payment order: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # ─────────────────────────────────────────────────────────────────────
    # RAZORPAY — Step 2: Verify Payment
    # Called after user completes payment in the Razorpay popup
    # ─────────────────────────────────────────────────────────────────────
    @action(detail=True, methods=["post"])
    def verify_payment(self, request, pk=None):
        invoice = self.get_object()

        razorpay_order_id   = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature  = request.data.get("razorpay_signature")

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response(
                {"error": "Missing payment details."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # ✅ Verify signature using HMAC SHA256
            message = f"{razorpay_order_id}|{razorpay_payment_id}"
            generated_signature = hmac.new(
                RAZORPAY_KEY_SECRET.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()

            if generated_signature != razorpay_signature:
                return Response(
                    {"error": "Payment verification failed. Invalid signature."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ✅ Signature valid — mark invoice as paid
            invoice.status = "PAID"
            invoice.razorpay_payment_id = razorpay_payment_id
            invoice.razorpay_signature  = razorpay_signature
            invoice.paid_at = timezone.now()
            invoice.save()

            # Activity log
            CaseActivityLog.objects.create(
                case=invoice.case,
                user=request.user,
                action_type="Status Updated",
                description=f"Invoice #{invoice.id} paid via Razorpay. Payment ID: {razorpay_payment_id}"
            )

            # Notify client
            Notification.objects.create(
                user=invoice.client,
                title="Payment Successful",
                message=f"Your payment of ₹{invoice.amount} for Invoice #{invoice.id} was successful.",
                notification_type="INVOICE"
            )

            # Notify lawyer
            Notification.objects.create(
                user=invoice.case.lawyer,
                title="Payment Received",
                message=f"Client {invoice.client.username} paid Invoice #{invoice.id} — ₹{invoice.amount}.",
                notification_type="INVOICE"
            )

            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"notifications_user_{invoice.client.id}",
                {
                    "type": "send_notification",
                    "title": "Payment Successful",
                    "message": f"Payment of ₹{invoice.amount} received successfully.",
                    "notification_type": "INVOICE",
                }
            )

            return Response({
                "message": "Payment verified successfully.",
                "payment_id": razorpay_payment_id,
                "invoice_id": invoice.id,
            })

        except Exception as e:
            return Response(
                {"error": f"Payment verification error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # ─────────────────────────────────────────────────────────────────────
    # Mark as Paid manually (Lawyer/Admin only)
    # ─────────────────────────────────────────────────────────────────────
    @action(detail=True, methods=["post"])
    def mark_as_paid(self, request, pk=None):
        invoice = self.get_object()
        user = request.user

        if user.role not in ["ADMIN", "LAWYER"]:
            return Response({"error": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        if user.role == "LAWYER" and invoice.case.lawyer != user:
            return Response({"error": "You can only mark invoices for your own cases."}, status=status.HTTP_403_FORBIDDEN)

        if invoice.status == "PAID":
            return Response({"error": "Invoice is already paid."}, status=status.HTTP_400_BAD_REQUEST)

        if invoice.status == "CANCELLED":
            return Response({"error": "Cancelled invoice cannot be marked as paid."}, status=status.HTTP_400_BAD_REQUEST)

        invoice.status = "PAID"
        invoice.paid_at = timezone.now()
        invoice.save()

        CaseActivityLog.objects.create(
            case=invoice.case, user=user,
            action_type="Status Updated",
            description=f"Invoice #{invoice.id} manually marked as PAID."
        )

        Notification.objects.create(
            user=invoice.client, title="Invoice Paid",
            message=f"Invoice #{invoice.id} has been marked as PAID.",
            notification_type="INVOICE"
        )

        return Response({"message": "Invoice marked as PAID successfully."})

    # ─────────────────────────────────────────────────────────────────────
    # Cancel Invoice
    # ─────────────────────────────────────────────────────────────────────
    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        invoice = self.get_object()

        if request.user.role not in ["ADMIN", "LAWYER"]:
            return Response({"error": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        if invoice.status in ["PAID", "CANCELLED"]:
            return Response(
                {"error": f"Cannot cancel — status is {invoice.status}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        invoice.status = "CANCELLED"
        invoice.save()

        Notification.objects.create(
            user=invoice.client, title="Invoice Cancelled",
            message=f"Invoice #{invoice.id} has been cancelled.",
            notification_type="INVOICE"
        )

        return Response({"message": "Invoice cancelled successfully."})

    # ─────────────────────────────────────────────────────────────────────
    # Download PDF
    # ─────────────────────────────────────────────────────────────────────
    @action(detail=True, methods=["get"])
    def download_invoice(self, request, pk=None):
        invoice = self.get_object()

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()

        elements.append(Paragraph("<b>LAW MANAGEMENT SYSTEM</b>", styles["Title"]))
        elements.append(Spacer(1, 20))

        invoice_data = [
            ["Invoice ID",   str(invoice.id)],
            ["Case",         invoice.case.title],
            ["Client",       invoice.client.username],
            ["Amount",       f"₹ {invoice.amount}"],
            ["Description",  invoice.description or "—"],
            ["Status",       invoice.status],
            ["Due Date",     str(invoice.due_date) if invoice.due_date else "—"],
            ["Created At",   invoice.created_at.strftime("%Y-%m-%d")],
        ]

        if invoice.paid_at:
            invoice_data.append(["Paid At", invoice.paid_at.strftime("%Y-%m-%d %H:%M")])
        if invoice.razorpay_payment_id:
            invoice_data.append(["Payment ID", invoice.razorpay_payment_id])

        table = Table(invoice_data, colWidths=[140, 300])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))

        elements.append(table)
        elements.append(Spacer(1, 30))
        elements.append(Paragraph("Thank you for choosing our legal services.", styles["Normal"]))

        doc.build(elements)
        pdf = buffer.getvalue()
        buffer.close()

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="invoice_{invoice.id}.pdf"'
        response.write(pdf)
        return response