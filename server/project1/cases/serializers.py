from rest_framework import serializers
from .models import Case, CaseCategory, CaseDocument, CaseActivityLog
 
 
class CaseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseCategory
        fields = "__all__"
 
 
class CaseDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_username = serializers.CharField(
        source="uploaded_by.username", read_only=True
    )
 
    class Meta:
        model = CaseDocument
        fields = ["id", "document", "uploaded_by", "uploaded_by_username", "uploaded_at"]
        read_only_fields = ["uploaded_by", "uploaded_at"]
 
 
class CaseActivityLogSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
 
    class Meta:
        model = CaseActivityLog
        fields = ["id", "action_type", "description", "user_username", "timestamp"]
        read_only_fields = ["timestamp"]
 
 
class CaseSerializer(serializers.ModelSerializer):
    client_username = serializers.CharField(source="client.username", read_only=True)
    lawyer_username = serializers.CharField(source="lawyer.username", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    documents = CaseDocumentSerializer(many=True, read_only=True)
    activities = CaseActivityLogSerializer(many=True, read_only=True)
 
    class Meta:
        model = Case
        fields = [
            "id", "title", "description",
            "client", "client_username",
            "lawyer", "lawyer_username",
            "category", "category_name",
            "status", "created_at",
            "documents", "activities",
        ]
        read_only_fields = ["client", "created_at"]
 


























