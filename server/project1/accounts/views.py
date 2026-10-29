from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import User, LawyerProfile, Review
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    LawyerProfileSerializer,
    LawyerProfileUpdateSerializer,
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
                {"message": "User registered successfully"},
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

        # ✅ Filter by specialization
        specialization = request.query_params.get('specialization')
        if specialization:
            profiles = profiles.filter(specialization=specialization)

        # ✅ Filter by court level
        court_level = request.query_params.get('court_level')
        if court_level:
            profiles = profiles.filter(court_level=court_level)

        # ✅ Filter by availability
        available = request.query_params.get('available')
        if available == 'true':
            profiles = profiles.filter(is_available=True)

        # ✅ Search by name or city
        search = request.query_params.get('search')
        if search:
            profiles = profiles.filter(
                user__username__icontains=search
            ) | profiles.filter(
                city__icontains=search
            ) | profiles.filter(
                bio__icontains=search
            )

        # ✅ Sort by rating
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
            # Auto create if missing
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