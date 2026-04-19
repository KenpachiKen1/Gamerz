# chatrooms/middleware.py
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from firebase_admin import auth

from users.models import User


@database_sync_to_async
def get_user_from_firebase_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get("uid")

        if not uid:
            return AnonymousUser()

        return User.objects.get(firebase_uid=uid)
    except Exception:
        return AnonymousUser()


class FirebaseAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)

        token_list = query_params.get("token", [])
        token = token_list[0] if token_list else None

        if token:
            scope["user"] = await get_user_from_firebase_token(token)
        else:
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)


def FirebaseAuthMiddlewareStack(inner):
    return FirebaseAuthMiddleware(inner)