from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils import timezone
from .models import User, LawyerProfile, Review


class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'role', 'lawyer_type', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('role', 'lawyer_type', 'phone', 'profile_image')
        }),
    )


@admin.register(LawyerProfile)
class LawyerProfileAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'bar_council_number', 'is_verified', 'verification_status',
        'specialization', 'court_level', 'experience_years',
        'consultation_fee', 'average_rating', 'is_available'
    ]
    list_filter = ['is_verified', 'verification_status', 'specialization', 'court_level', 'is_available']
    search_fields = ['user__username', 'bar_council_number', 'city', 'state']
    actions = ['approve_lawyers', 'reject_lawyers']

    @admin.action(description="Approve selected lawyers for directory listing")
    def approve_lawyers(self, request, queryset):
        count = queryset.update(
            is_verified=True,
            verification_status='APPROVED',
            verified_at=timezone.now()
        )
        self.message_user(request, f"{count} lawyer profile(s) approved for listing.")

    @admin.action(description="Reject selected lawyers for directory listing")
    def reject_lawyers(self, request, queryset):
        count = queryset.update(
            is_verified=False,
            verification_status='REJECTED'
        )
        self.message_user(request, f"{count} lawyer profile(s) rejected.")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['client', 'lawyer', 'rating', 'created_at']
    list_filter = ['rating']


admin.site.register(User, CustomUserAdmin)
