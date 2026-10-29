from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status, filters
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import User, LawyerProfile, Review
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    LawyerProfileSerializer,
    LawyerProfileUpdateSerializer,
    ApplyListingSerializer,
    ReviewSerializer,
)


# ── Auth Views ─────────────────────────────────────────────────────────────
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User registered successfully. Please login to continue."},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Lawyer Directory Views ─────────────────────────────────────────────────
class LawyerListView(APIView):
    """Public lawyer directory — no login required"""
    permission_classes = [AllowAny]

    def get(self, request):
        profiles = LawyerProfile.objects.select_related('user').all()

        # Filter by verified status if specified
        verified = request.query_params.get('verified')
        if verified == 'true':
            profiles = profiles.filter(is_verified=True)
        elif verified == 'pending':
            profiles = profiles.filter(verification_status='PENDING')

        # Filter by specialization
        specialization = request.query_params.get('specialization')
        if specialization:
            profiles = profiles.filter(specialization=specialization)

        # Filter by court level
        court_level = request.query_params.get('court_level')
        if court_level:
            profiles = profiles.filter(court_level=court_level)

        # Filter by availability
        available = request.query_params.get('available')
        if available == 'true':
            profiles = profiles.filter(is_available=True)

        # Search by name, city, bar council id or bio
        search = request.query_params.get('search')
        if search:
            profiles = profiles.filter(
                user__username__icontains=search
            ) | profiles.filter(
                city__icontains=search
            ) | profiles.filter(
                bio__icontains=search
            ) | profiles.filter(
                bar_council_number__icontains=search
            )

        # Sort by rating or experience
        sort = request.query_params.get('sort', '-average_rating')
        profiles = profiles.order_by(sort)

        serializer = LawyerProfileSerializer(profiles, many=True)
        return Response(serializer.data)


class LawyerDetailView(APIView):
    """Get single lawyer profile by user ID"""
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        try:
            profile = LawyerProfile.objects.select_related('user').get(user__id=user_id)
        except LawyerProfile.DoesNotExist:
            return Response({"error": "Lawyer not found."}, status=404)

        serializer = LawyerProfileSerializer(profile)
        return Response(serializer.data)


class MyLawyerProfileView(APIView):
    """Lawyer manages their own profile"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "LAWYER":
            return Response({"error": "Only lawyers have a profile."}, status=403)
        try:
            profile = request.user.lawyer_profile
        except LawyerProfile.DoesNotExist:
            profile = LawyerProfile.objects.create(user=request.user)

        serializer = LawyerProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        if request.user.role != "LAWYER":
            return Response({"error": "Only lawyers can update a profile."}, status=403)
        try:
            profile = request.user.lawyer_profile
        except LawyerProfile.DoesNotExist:
            profile = LawyerProfile.objects.create(user=request.user)

        serializer = LawyerProfileUpdateSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(LawyerProfileSerializer(profile).data)
        return Response(serializer.errors, status=400)


class ApplyForListingView(APIView):
    """Lawyer applies for directory listing and verification"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "LAWYER":
            return Response({"error": "Only lawyers can apply for listing."}, status=403)

        try:
            profile = request.user.lawyer_profile
        except LawyerProfile.DoesNotExist:
            profile = LawyerProfile.objects.create(user=request.user)

        serializer = ApplyListingSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            profile = serializer.save()
            profile.verification_status = "PENDING"
            profile.applied_at = timezone.now()
            profile.save()

            # Notify admins of the new application
            try:
                from notifications.models import Notification
                admins = User.objects.filter(role="ADMIN")
                for admin_user in admins:
                    Notification.objects.create(
                        user=admin_user,
                        title="Lawyer Listing Application",
                        message=f"Advocate {request.user.username} (Bar Council: {profile.bar_council_number}) applied for directory listing.",
                        notification_type="SYSTEM"
                    )
            except Exception as e:
                pass

            return Response({
                "message": "Application for directory listing submitted! Status is now Pending Review.",
                "profile": LawyerProfileSerializer(profile).data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyLawyerView(APIView):
    """Admin verifies, approves or rejects a lawyer for listing"""
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        if request.user.role != "ADMIN":
            return Response({"error": "Admin privileges required."}, status=403)

        try:
            profile = LawyerProfile.objects.select_related("user").get(user__id=user_id)
        except LawyerProfile.DoesNotExist:
            return Response({"error": "Lawyer profile not found."}, status=404)

        action_type = request.data.get("action", "").lower().strip()
        notes = request.data.get("notes", "").strip()

        from notifications.models import Notification

        if action_type == "approve":
            profile.is_verified = True
            profile.verification_status = "APPROVED"
            profile.verified_at = timezone.now()
            if notes:
                profile.verification_notes = notes
            profile.save()

            try:
                Notification.objects.create(
                    user=profile.user,
                    title="Bar Council Verification Approved",
                    message="Congratulations! Your advocate credentials have been verified and approved for the public directory.",
                    notification_type="SYSTEM"
                )
            except Exception:
                pass

            return Response({
                "message": f"Lawyer {profile.user.username} approved for directory listing.",
                "profile": LawyerProfileSerializer(profile).data
            })
        elif action_type == "reject":
            profile.is_verified = False
            profile.verification_status = "REJECTED"
            if notes:
                profile.verification_notes = notes
            profile.save()

            try:
                Notification.objects.create(
                    user=profile.user,
                    title="Listing Application Rejected",
                    message=f"Your directory listing application was rejected. Note: {notes or 'Bar Council ID could not be validated.'}",
                    notification_type="SYSTEM"
                )
            except Exception:
                pass

            return Response({
                "message": f"Lawyer {profile.user.username} application rejected.",
                "profile": LawyerProfileSerializer(profile).data
            })
        else:
            return Response(
                {"error": "Invalid action. Use 'approve' or 'reject'."},
                status=status.HTTP_400_BAD_REQUEST
            )


class ReviewView(APIView):
    """Client submits a review for a lawyer"""
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        if request.user.role != "CLIENT":
            return Response({"error": "Only clients can submit reviews."}, status=403)

        try:
            profile = LawyerProfile.objects.get(user__id=user_id)
        except LawyerProfile.DoesNotExist:
            return Response({"error": "Lawyer not found."}, status=404)

        # Check if already reviewed
        if Review.objects.filter(lawyer=profile, client=request.user).exists():
            return Response({"error": "You have already reviewed this lawyer."}, status=400)

        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(lawyer=profile, client=request.user)
            profile.update_rating()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
