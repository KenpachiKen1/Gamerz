from rest_framework.routers import DefaultRouter
from .views import UserViewSet, WishlistViewSet, FriendsViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'wishlists', WishlistViewSet, basename='wishlists')
router.register(r'friends', FriendsViewSet, basename='friends')


urlpatterns = router.urls

