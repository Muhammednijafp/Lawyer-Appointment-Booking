from django.contrib import admin
from .models import Invoice
 
 
@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['id', 'case', 'client', 'amount', 'status', 'due_date', 'created_at']
    list_filter = ['status']
    search_fields = ['client__username', 'case__title']
 