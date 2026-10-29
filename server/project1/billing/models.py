from django.db import models
from django.utils import timezone


class Invoice(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PAID", "Paid"),
        ("OVERDUE", "Overdue"),
        ("CANCELLED", "Cancelled"),
    ]

    case = models.ForeignKey(
        "cases.Case", on_delete=models.CASCADE, related_name="invoices"
    )
    client = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="invoices"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    description = models.TextField(blank=True, null=True)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # ✅ Razorpay payment tracking fields
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    paid_at = models.DateTimeField(blank=True, null=True)

    def mark_overdue(self):
        if self.status == "PENDING" and self.due_date and self.due_date < timezone.now().date():
            self.status = "OVERDUE"
            self.save()

    def __str__(self):
        return f"Invoice #{self.id} - {self.status}"