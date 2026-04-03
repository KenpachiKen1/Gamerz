from rest_framework.routers import DefaultRouter
from .views import UserViewSet, WishlistViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register('wishlists', WishlistViewSet, basename='wishlists')

urlpatterns = router.urls

