from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from cases.models import Case
from .models import Message
from .serializers import MessageSerializer
 
 
class MessagePagination(PageNumberPagination):
    page_size = 20
 
 
class CaseMessagesView(APIView):
    """Paginated message history — newest first, for loading older messages"""
    permission_classes = [IsAuthenticated]
 
    def get(self, request, case_id):
        try:
            case = Case.objects.get(id=case_id)
        except Case.DoesNotExist:
            return Response({"error": "Case not found"}, status=404)
 
        if request.user != case.client and request.user != case.lawyer:
            return Response({"error": "Not authorized"}, status=403)
 
        # ✅ Returns newest first for pagination (frontend reverses for display)
        messages = Message.objects.filter(room__case=case).order_by("-timestamp")
 
        paginator = MessagePagination()
        result_page = paginator.paginate_queryset(messages, request)
        serializer = MessageSerializer(result_page, many=True)
 
        return paginator.get_paginated_response(serializer.data)
 
 
class ChatHistoryView(APIView):
    """Full chat history — oldest first, for initial load"""
    permission_classes = [IsAuthenticated]  # ✅ added auth
 
    def get(self, request, case_id):
        try:
            case = Case.objects.get(id=case_id)
        except Case.DoesNotExist:
            return Response({"error": "Case not found"}, status=404)
 
        # ✅ Added access control
        if request.user != case.client and request.user != case.lawyer:
            return Response({"error": "Not authorized"}, status=403)
 
        messages = Message.objects.filter(
            room__case_id=case_id
        ).order_by("timestamp")
 
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
 