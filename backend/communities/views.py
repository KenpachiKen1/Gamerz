from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from users.models import Friendship, User
from .models import Community, CommunityPost, CommunityPostComment
from .serializers import (
    CommunityReadSerializer,
    CommunityPostReadSerializer,
    CommunityPostWriteSerializer,
    CommunityPostCommentReadSerializer,
    CommunityPostCommentWriteSerializer,
)
from rest_framework.views import APIView


class CommunityViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Community.objects.select_related("game").prefetch_related("members", "post")
    serializer_class = CommunityReadSerializer


    def get_queryset(self):
        user = self.request.user
        return self.queryset.filter(members=user)
    
    @action(detail=True, methods=["PATCH"])
    def join(self, request, pk=None):
        community = get_object_or_404(Community, id=pk)
        community.members.add(request.user)
        return Response({"message": "Joined community"}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=["PATCH"])
    def leave(self, request, pk=None):
        community = get_object_or_404(Community, id=pk)
        community.members.remove(request.user)
        return Response({"message": "Left community"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["GET"])
    def get_community_details(self, request, pk=None):
        community = get_object_or_404(self.get_queryset(), id=pk)
        serializer = self.get_serializer(community)
        return Response(serializer.data, status=status.HTTP_200_OK)
    @action(detail=True, methods=["GET"])
    def get_posts(self, request, pk=None):
        community = get_object_or_404(Community, id=pk)

        posts = (
            CommunityPost.objects.filter(community=community)
            .select_related("poster", "community")
            .prefetch_related("likes", "dislikes", "replies")
        )

        serializer = CommunityPostReadSerializer(
            posts,
            many=True,
            context={"request": request},
        )

        community_serializer = CommunityReadSerializer(
            community,
            context={"request": request},
        )

        community_data = community_serializer.data
        community_data["joined_by_user"] = community.members.filter(
            id=request.user.id
        ).exists()

        return Response(
            {
                "community": community_data,
                "count": posts.count(),
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
    
    @action(detail=False, methods=["GET"])
    def trending(self, request):
        communities = (
            Community.objects.all()
            .prefetch_related("members")
            .select_related("game")
        )

        serializer = CommunityReadSerializer(
            communities,
            many=True,
            context={"request": request},
        )

        data = serializer.data

        for item in data:
            item["joined_by_user"] = any(
                member["id"] == request.user.id for member in item.get("members", [])
            )

        data.sort(key=lambda c: c.get("member_count", 0), reverse=True)

        return Response(data[:6], status=status.HTTP_200_OK)
    @action(detail=True, methods=["POST"])
    def create_post(self, request, pk=None):
        user = request.user
        community = get_object_or_404(self.get_queryset(), id=pk)

        serializer = CommunityPostWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        post = CommunityPost.objects.create(
            community=community,
            poster=user,
            subject=serializer.validated_data.get("subject"),
            body=serializer.validated_data.get("body"),
        )

        read_serializer = CommunityPostReadSerializer(
            post,
            context={"request": request},
        )

        return Response(read_serializer.data, status=status.HTTP_201_CREATED)


class CommunityPostViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = (
        CommunityPost.objects.select_related("community", "poster")
        .prefetch_related("likes", "dislikes", "replies")
    )

    def get_queryset(self):
        user = self.request.user
        return self.queryset.filter(community__members=user)

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return CommunityPostReadSerializer
        return CommunityPostWriteSerializer

    @action(detail=True, methods=["PATCH"])
    def like(self, request, pk=None):
        user = request.user
        post = get_object_or_404(self.get_queryset(), id=pk)

        if user in post.dislikes.all():
            post.dislikes.remove(user)

        if user in post.likes.all():
            post.likes.remove(user)
            post.save()

            return Response(
                {
                    "message": "Removed like from post",
                    "id": post.id,
                    "like_count": post.likes.count(),
                    "dislike_count": post.dislikes.count(),
                },
                status=status.HTTP_200_OK,
            )

        post.likes.add(user)
        post.save()

        return Response(
            {
                "message": "Liked post",
                "id": post.id,
                "like_count": post.likes.count(),
                "dislike_count": post.dislikes.count(),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["PATCH"])
    def dislike(self, request, pk=None):
        user = request.user
        post = get_object_or_404(self.get_queryset(), id=pk)

        if user in post.likes.all():
            post.likes.remove(user)

        if user in post.dislikes.all():
            post.dislikes.remove(user)
            post.save()

            return Response(
                {
                    "message": "Removed dislike from post",
                    "id": post.id,
                    "like_count": post.likes.count(),
                    "dislike_count": post.dislikes.count(),
                },
                status=status.HTTP_200_OK,
            )

        post.dislikes.add(user)
        post.save()

        return Response(
            {
                "message": "Disliked post",
                "id": post.id,
                "like_count": post.likes.count(),
                "dislike_count": post.dislikes.count(),
            },
            status=status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        post = get_object_or_404(self.get_queryset(), id=kwargs.get("pk"))

        if post.poster != request.user:
            return Response(
                {"error": "You can only delete your own posts"},
                status=status.HTTP_403_FORBIDDEN,
            )

        post.delete()

        return Response(
            {"message": "Post deleted successfully"},
            status=status.HTTP_200_OK,
        )


class CommunityPostCommentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = (
        CommunityPostComment.objects.select_related(
            "original_post",
            "original_post__community",
            "poster",
        ).prefetch_related("likes", "dislikes")
    )

    def get_queryset(self):
        user = self.request.user
        return self.queryset.filter(original_post__community__members=user)

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return CommunityPostCommentReadSerializer
        return CommunityPostCommentWriteSerializer

    @action(detail=False, methods=["POST"])
    def create_comment(self, request):
        user = request.user
        post_id = request.data.get("post_id")

        original_post = get_object_or_404(
            CommunityPost,
            id=post_id,
            community__members=user,
        )

        serializer = CommunityPostCommentWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        comment = CommunityPostComment.objects.create(
            original_post=original_post,
            reply=serializer.validated_data["reply"],
            poster=user,
        )

        read_serializer = CommunityPostCommentReadSerializer(
            comment,
            context={"request": request},
        )

        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["PATCH"])
    def like(self, request, pk=None):
        user = request.user
        comment = get_object_or_404(self.get_queryset(), id=pk)

        if user in comment.dislikes.all():
            comment.dislikes.remove(user)

        if user in comment.likes.all():
            comment.likes.remove(user)
            comment.save()

            return Response(
                {
                    "message": "Removed like from comment",
                    "id": comment.id,
                    "like_count": comment.likes.count(),
                    "dislike_count": comment.dislikes.count(),
                },
                status=status.HTTP_200_OK,
            )

        comment.likes.add(user)
        comment.save()

        return Response(
            {
                "message": "Added like to comment",
                "id": comment.id,
                "like_count": comment.likes.count(),
                "dislike_count": comment.dislikes.count(),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["PATCH"])
    def dislike(self, request, pk=None):
        user = request.user
        comment = get_object_or_404(self.get_queryset(), id=pk)

        if user in comment.likes.all():
            comment.likes.remove(user)

        if user in comment.dislikes.all():
            comment.dislikes.remove(user)
            comment.save()

            return Response(
                {
                    "message": "Removed dislike from comment",
                    "id": comment.id,
                    "like_count": comment.likes.count(),
                    "dislike_count": comment.dislikes.count(),
                },
                status=status.HTTP_200_OK,
            )

        comment.dislikes.add(user)
        comment.save()

        return Response(
            {
                "message": "Added dislike to comment",
                "id": comment.id,
                "like_count": comment.likes.count(),
                "dislike_count": comment.dislikes.count(),
            },
            status=status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        comment = get_object_or_404(self.get_queryset(), id=kwargs.get("pk"))

        if comment.poster != request.user:
            return Response(
                {"error": "You can only delete your own comments"},
                status=status.HTTP_403_FORBIDDEN,
            )

        comment.delete()

        return Response(
            {"message": "Comment deleted successfully"},
            status=status.HTTP_200_OK,
        )
    
class ActivityFeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        sent_friend_ids = Friendship.objects.filter(
            sender=user,
            status=Friendship.ACCEPTED
        ).values_list("receiver_id", flat=True)

        received_friend_ids = Friendship.objects.filter(
            receiver=user,
            status=Friendship.ACCEPTED
        ).values_list("sender_id", flat=True)

        friend_ids = list(sent_friend_ids) + list(received_friend_ids)

        posts = (
            CommunityPost.objects.filter(
                Q(community__members=user) | Q(poster_id__in=friend_ids)
            )
            .select_related("poster", "community")
            .prefetch_related("likes", "dislikes", "replies")
            .distinct()
            .order_by("-creation")
        )

        serializer = CommunityPostReadSerializer(
            posts,
            many=True,
            context={"request": request},
        )

        return Response(serializer.data, status=status.HTTP_200_OK)
    
class UserPostsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        target_user = get_object_or_404(User, username=username)

        posts = (
            CommunityPost.objects.filter(
                poster=target_user,
                community__members=request.user,
            )
            .select_related("poster", "community")
            .prefetch_related("likes", "dislikes", "replies")
            .order_by("-creation")
        )

        serializer = CommunityPostReadSerializer(
            posts,
            many=True,
            context={"request": request},
        )

        return Response(serializer.data, status=200)