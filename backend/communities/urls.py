from rest_framework.routers import DefaultRouter
from .views import (
    CommunityViewSet,
    CommunityPostViewSet,
    CommunityPostCommentViewSet,
    ActivityFeedView,
    UserPostsView
)
from django.urls import path

router = DefaultRouter()
router.register(r"communities", CommunityViewSet, basename="community")
router.register(r"community-posts", CommunityPostViewSet, basename="community-post")
router.register(r"community-comments", CommunityPostCommentViewSet, basename="community-comment")

urlpatterns = [
    path("feed/", ActivityFeedView.as_view(), name="activity-feed"),
    path("users/<str:username>/posts/", UserPostsView.as_view(), name="user-posts"),
]

urlpatterns += router.urls

