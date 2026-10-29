from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
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
    list_display = ['user', 'specialization', 'court_level', 'experience_years',
                    'consultation_fee', 'average_rating', 'is_available']
    list_filter = ['specialization', 'court_level', 'is_available']
    search_fields = ['user__username', 'city', 'state']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['client', 'lawyer', 'rating', 'created_at']
    list_filter = ['rating']


admin.site.register(User, CustomUserAdmin)