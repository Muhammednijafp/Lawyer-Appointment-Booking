from django.urls import path
from .views import (
    RegisterView,
    CurrentUserView,
    LawyerListView,
    LawyerDetailView,
    MyLawyerProfileView,
    ApplyForListingView,
    VerifyLawyerView,
    ReviewView,
)

urlpatterns = [
    # Auth
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", CurrentUserView.as_view(), name="current_user"),

    # Lawyer directory — public
    path("lawyers/", LawyerListView.as_view(), name="lawyer_list"),
    path("lawyers/<int:user_id>/", LawyerDetailView.as_view(), name="lawyer_detail"),

    # Lawyer manages own profile & applies for listing
    path("lawyers/profile/", MyLawyerProfileView.as_view(), name="my_lawyer_profile"),
    path("lawyers/apply-listing/", ApplyForListingView.as_view(), name="apply_listing"),

    # Admin verifies lawyer for directory
    path("lawyers/<int:user_id>/verify/", VerifyLawyerView.as_view(), name="verify_lawyer"),

    # Client submits review
    path("lawyers/<int:user_id>/review/", ReviewView.as_view(), name="lawyer_review"),
]
