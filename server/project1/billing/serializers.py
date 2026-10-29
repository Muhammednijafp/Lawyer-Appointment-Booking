from rest_framework import serializers
from .models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    client_username = serializers.CharField(source="client.username", read_only=True)
    case_title = serializers.CharField(source="case.title", read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "case", "case_title",
            "client", "client_username",
            "amount",
            "description",
            "status",
            "due_date",
            "created_at",
        ]

        read_only_fields = ["status", "created_at", "client"]

        extra_kwargs = {
            "client": {"required": False}
        }