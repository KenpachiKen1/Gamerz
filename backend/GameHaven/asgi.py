import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "GameHaven.settings")

import django
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

from chatrooms.routing import websocket_urlpatterns
from chatrooms.middleware import FirebaseAuthMiddlewareStack

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": FirebaseAuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})