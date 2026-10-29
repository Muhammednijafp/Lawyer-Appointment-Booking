from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import CaseViewSet, CaseCategoryViewSet

# ✅ Separate router for cases only
cases_router = DefaultRouter()
cases_router.register(r'', CaseViewSet, basename='cases')

# ✅ Separate router for categories
categories_router = DefaultRouter()
categories_router.register(r'', CaseCategoryViewSet, basename='categories')

urlpatterns = [
    # /api/cases/categories/ — must be BEFORE the empty prefix
    path('categories/', include(categories_router.urls)),
    # /api/cases/ — empty prefix catches everything else
    path('', include(cases_router.urls)),
]