from .models import Community, CommunityPost, CommunityPostComment
from rest_framework import serializers
from users.serializers import UserReadSerializer
from games.serializers import GameReadSerializer
from pathlib import Path
from django.conf import settings
import re

p = Path(settings.BASE_DIR) / "GameHaven" / "profanity_wordlist.txt"


class CommunityReadSerializer(serializers.ModelSerializer):
    members = UserReadSerializer(read_only=True, many=True)
    game = GameReadSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = [
            "id",
            "title",
            "members",
            "member_count",
            "game",
        ]

    def get_member_count(self, obj):
        return obj.members.count()


class CommunityPostWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityPost
        fields = ["subject", "body"]

    def validate_body(self, value):
        s = str(value).lower()

        with open(p, "r") as data:
            for word in data:
                word = word.strip().lower()

                if not word:
                    continue

                pattern = re.compile(rf"\b{re.escape(word)}\b")

                if pattern.search(s):
                    raise serializers.ValidationError(
                        f"This post contains '{word}' which is banned!"
                    )

        return value

    def validate_subject(self, value):
        s = str(value).lower()

        with open(p, "r") as data:
            for word in data:
                word = word.strip().lower()

                if not word:
                    continue

                pattern = re.compile(rf"\b{re.escape(word)}\b")

                if pattern.search(s):
                    raise serializers.ValidationError(
                        f"This post contains '{word}' which is banned!"
                    )

        return value


class CommunityPostReadSerializer(serializers.ModelSerializer):
    poster = UserReadSerializer(read_only=True)
    community = CommunityReadSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    dislike_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    liked_by_user = serializers.SerializerMethodField()
    disliked_by_user = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    

    class Meta:
        model = CommunityPost
        fields = [
            "id",
            "subject",
            "body",
            "creation",
            "poster",
            "like_count",
            "dislike_count",
            "comment_count",
            "liked_by_user",
            "disliked_by_user",
            "can_delete",
        ]

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_dislike_count(self, obj):
        return obj.dislikes.count()

    def get_comment_count(self, obj):
        return obj.replies.count()

    def get_liked_by_user(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        return obj.likes.filter(id=request.user.id).exists()

    def get_disliked_by_user(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        return obj.dislikes.filter(id=request.user.id).exists()

    def get_can_delete(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        return obj.poster_id == request.user.id


class CommunityPostCommentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityPostComment
        fields = ["reply"]

    def validate_reply(self, value):
        s = str(value).lower()

        with open(p, "r") as data:
            for word in data:
                word = word.strip().lower()

                if not word:
                    continue

                pattern = re.compile(rf"\b{re.escape(word)}\b")

                if pattern.search(s):
                    raise serializers.ValidationError(
                        f"This post contains '{word}' which is banned!"
                    )

        return value


class CommunityPostCommentReadSerializer(serializers.ModelSerializer):
    poster = UserReadSerializer(read_only=True)
    like_count = serializers.SerializerMethodField()
    dislike_count = serializers.SerializerMethodField()
    liked_by_user = serializers.SerializerMethodField()
    disliked_by_user = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = CommunityPostComment
        fields = [
            "id",
            "original_post",
            "creation",
            "reply",
            "poster",
            "like_count",
            "dislike_count",
            "liked_by_user",
            "disliked_by_user",
            "can_delete",
        ]

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_dislike_count(self, obj):
        return obj.dislikes.count()

    def get_liked_by_user(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        return obj.likes.filter(id=request.user.id).exists()

    def get_disliked_by_user(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        return obj.dislikes.filter(id=request.user.id).exists()

    def get_can_delete(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        return obj.poster_id == request.user.id