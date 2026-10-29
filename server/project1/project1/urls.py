from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import AllowAny

urlpatterns = [
    path('admin/', admin.site.urls),
 
    # Auth
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
 
    # Apps
    path("api/accounts/", include("accounts.urls")),
    path("api/cases/", include("cases.urls")),           # ✅ added
    path("api/appointments/", include("appointments.urls")),
    path("api/billing/", include("billing.urls")),
    path("api/chat/", include("chat.urls")),             # ✅ fixed prefix (was doubled)
    path("api/notifications/", include("notifications.urls")),
    path("api/dashboard/", include("dashboard.urls")),   # ✅ added
    path("api/token/", TokenObtainPairView.as_view(permission_classes=[AllowAny])),
    path("api/token/refresh/", TokenRefreshView.as_view(permission_classes=[AllowAny])),
 
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
 

