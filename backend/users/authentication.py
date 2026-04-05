from firebase_admin import auth
from rest_framework import authentication, exceptions
from .models import User


class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return None

        if not auth_header.startswith("Bearer "):
            raise exceptions.AuthenticationFailed(
                "Authorization header must be Bearer <token>."
            )

        token = auth_header.split("Bearer ")[1].strip()

        try:
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token["uid"]
        except Exception:
            raise exceptions.AuthenticationFailed("Invalid or expired Firebase token.")

        try:
            user = User.objects.get(firebase_uid=uid)
        except User.DoesNotExist: #return none so first time users can go through the process
            return None

        return (user, None)