from rest_framework import serializers
from .models import User, LawyerProfile, Review


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "phone", "password", "confirm_password", "role"]

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # ✅ Auto-create LawyerProfile if registering as LAWYER
        if user.role == "LAWYER":
            LawyerProfile.objects.create(user=user)

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "lawyer_type", "phone", "profile_image"]
        read_only_fields = ["id"]


class ReviewSerializer(serializers.ModelSerializer):
    client_username = serializers.CharField(source="client.username", read_only=True)
    client_image = serializers.ImageField(source="client.profile_image", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "rating", "comment", "client_username", "client_image", "created_at"]
        read_only_fields = ["client", "created_at"]


class LawyerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    profile_image = serializers.ImageField(source="user.profile_image", read_only=True)
    lawyer_type = serializers.CharField(source="user.lawyer_type", read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = LawyerProfile
        fields = [
            "id", "user_id", "username", "email", "phone",
            "profile_image", "lawyer_type",
            "bar_council_number", "specialization", "court_level",
            "experience_years", "consultation_fee",
            "bio", "state", "city",
            "total_cases", "cases_won",
            "average_rating", "total_reviews",
            "is_available", "reviews",
            "created_at",
        ]
        read_only_fields = ["average_rating", "total_reviews", "created_at"]


class LawyerProfileUpdateSerializer(serializers.ModelSerializer):
    """Used by lawyer to update their own profile"""
    class Meta:
        model = LawyerProfile
        fields = [
            "bar_council_number", "specialization", "court_level",
            "experience_years", "consultation_fee",
            "bio", "state", "city", "is_available",
        ]