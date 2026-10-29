from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Case, CaseCategory, CaseDocument, CaseActivityLog
from .serializers import (
    CaseSerializer,
    CaseCategorySerializer,
    CaseDocumentSerializer,
    CaseActivityLogSerializer,
)


class CaseCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Anyone authenticated can view categories"""
    queryset = CaseCategory.objects.all()
    serializer_class = CaseCategorySerializer
    permission_classes = [IsAuthenticated]


class CaseViewSet(viewsets.ModelViewSet):
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return Case.objects.all()

        if user.role == "LAWYER":
            return Case.objects.filter(lawyer=user)

        # CLIENT
        return Case.objects.filter(client=user)

    def perform_create(self, serializer):
        case = serializer.save(client=self.request.user)

        CaseActivityLog.objects.create(
            case=case,
            user=self.request.user,
            action_type="Case Created",
            description=f"Case '{case.title}' was created."
        )

    def perform_update(self, serializer):
        old_status = self.get_object().status
        case = serializer.save()

        if case.status != old_status:
            CaseActivityLog.objects.create(
                case=case,
                user=self.request.user,
                action_type="Status Updated",
                description=f"Status changed from '{old_status}' to '{case.status}'."
            )

    # =============================
    # Upload Document
    # =============================
    @action(detail=True, methods=["post"])
    def upload_document(self, request, pk=None):
        case = self.get_object()

        # Only lawyer or client of this case can upload
        if request.user != case.client and request.user != case.lawyer:
            return Response(
                {"error": "Not authorized to upload to this case."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CaseDocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(case=case, uploaded_by=request.user)

            CaseActivityLog.objects.create(
                case=case,
                user=request.user,
                action_type="Document Uploaded",
                description=f"Document uploaded by {request.user.username}."
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # =============================
    # View Activity Log
    # =============================
    @action(detail=True, methods=["get"])
    def activity_log(self, request, pk=None):
        case = self.get_object()
        logs = CaseActivityLog.objects.filter(case=case).order_by("-timestamp")
        serializer = CaseActivityLogSerializer(logs, many=True)
        return Response(serializer.data)