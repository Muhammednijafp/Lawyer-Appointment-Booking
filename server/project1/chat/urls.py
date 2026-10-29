from django.urls import path
from .views import CaseMessagesView, ChatHistoryView
 
urlpatterns = [
    # ✅ Removed "chat/" prefix — already handled in project1/urls.py as "api/chat/"
    path("case/<int:case_id>/messages/", CaseMessagesView.as_view(), name="case-messages"),
    path("case/<int:case_id>/history/", ChatHistoryView.as_view(), name="chat-history"),
]