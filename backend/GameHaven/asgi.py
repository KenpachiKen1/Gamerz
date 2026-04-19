import os
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

from chatrooms.routing import websocket_urlpatterns
from chatrooms.middleware import FirebaseAuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'GameHaven.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),

    "websocket": FirebaseAuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})