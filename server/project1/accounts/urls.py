from django.urls import path
from .views import (
    RegisterView,
    CurrentUserView,
    LawyerListView,
    LawyerDetailView,
    MyLawyerProfileView,
    ReviewView,
)

urlpatterns = [
    # Auth
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", CurrentUserView.as_view(), name="current_user"),

    # Lawyer directory — public
    path("lawyers/", LawyerListView.as_view(), name="lawyer_list"),
    path("lawyers/<int:user_id>/", LawyerDetailView.as_view(), name="lawyer_detail"),

    # Lawyer manages own profile
    path("lawyers/profile/", MyLawyerProfileView.as_view(), name="my_lawyer_profile"),

    # Client submits review
    path("lawyers/<int:user_id>/review/", ReviewView.as_view(), name="lawyer_review"),
]