from rest_framework.routers import DefaultRouter
from .views import CommunityViewSet, CommunityPostViewSet, CommunityPostCommentViewSet

router = DefaultRouter()
router.register(r"communities", CommunityViewSet, basename="community")
router.register(r"community-posts", CommunityPostViewSet, basename="community-post")
router.register(r"community-comments", CommunityPostCommentViewSet, basename="community-comment")

urlpatterns = router.urls