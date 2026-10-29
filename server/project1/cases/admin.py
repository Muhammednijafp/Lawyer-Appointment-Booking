from django.contrib import admin
from .models import CaseCategory, Case, CaseDocument, CaseActivityLog


@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ['title', 'client', 'lawyer', 'category', 'status', 'created_at']
    list_filter = ['status', 'category']
    search_fields = ['title', 'client__username', 'lawyer__username']


@admin.register(CaseActivityLog)
class CaseActivityLogAdmin(admin.ModelAdmin):
    list_display = ['action_type', 'case', 'user', 'timestamp']
    list_filter = ['action_type']


admin.site.register(CaseCategory)
admin.site.register(CaseDocument)