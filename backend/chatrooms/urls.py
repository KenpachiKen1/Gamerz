from django.urls import path, include
from rest_framework.routers import DefaultRouter
from chatrooms.views import ChatRoomViewSet

router = DefaultRouter()
router.register(r'chatrooms', ChatRoomViewSet, basename='chatroom')

urlpatterns = router.urls