from django.db import models
from django.conf import settings
from cases.models import CaseCategory


class Appointment(models.Model):

    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_appointments'
    )

    lawyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lawyer_appointments'
    )

    category = models.ForeignKey(
        CaseCategory,
        on_delete=models.SET_NULL,
        null=True
    )

    description = models.TextField()
    appointment_date = models.DateTimeField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.username} → {self.lawyer.username} ({self.status})"