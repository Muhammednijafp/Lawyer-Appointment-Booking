from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['client', 'lawyer', 'category', 'appointment_date', 'status', 'created_at']
    list_filter = ['status', 'category']
    search_fields = ['client__username', 'lawyer__username']