from rest_framework import serializers
from .models import ChatRoom, ChatMessage

from pathlib import Path
from django.conf import settings 

p = Path(settings.BASE_DIR) / "GameHaven" / "profanity_wordlist.txt"


class ChatMessageReadSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="author.username", read_only=True)

    def validate_body(self, value):
        s = value.lower()
        with open(p, 'r') as f:
             for word in f:
                  word = word.strip().lower()
                  if word in s:
                    raise serializers.ValidationError("This message ontains profanity!")

    class Meta:
        model = ChatMessage
        fields = ["id", "author", "body", "created"]


class ChatRoomReadSerializer(serializers.ModelSerializer):
    community_name = serializers.CharField(source="community.name", read_only=True)

    class Meta:
        model = ChatRoom
        fields = ["id", "name", "community", "community_name"]


class ChatRoomWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ["id", "name", "community"]