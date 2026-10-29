from rest_framework.permissions import BasePermission


class InvoicePermission(BasePermission):

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.role == "ADMIN":
            return True

        if user.role == "LAWYER":
            return request.method in ["GET", "POST", "PUT", "PATCH"]

        if user.role == "CLIENT":
            # ✅ Allow GET + payment actions for clients
            if request.method in ["GET", "HEAD", "OPTIONS"]:
                return True
            # ✅ Allow POST only for payment endpoints
            action = getattr(view, 'action', None)
            if action in ["create_payment_order", "verify_payment"]:
                return True
            return False

        return False

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.role == "ADMIN":
            return True

        if user.role == "LAWYER":
            return obj.case.lawyer == user

        if user.role == "CLIENT":
            return obj.client == user

        return False