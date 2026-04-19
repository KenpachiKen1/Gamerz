from rest_framework import serializers
from .models import *

from pathlib import Path
from games.models import Game
from django.conf import settings 
from games.serializers import GameReadSerializer
from django.db.models import Q
import re

p = Path(settings.BASE_DIR) / "GameHaven" / "profanity_wordlist.txt"

class UserReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ['password', 
                   'is_staff', 
                   'groups', 
                   'user_permissions', 
                   'is_active', 
                   'is_superuser',
                   ]
        
class UserWriteSerializer(serializers.ModelSerializer): #will be using this just for checking mainly
    class Meta:
        model = User
        fields = ["email", "username", "password", "first_name", "last_name", "hours", "profile_picture", "main_platform"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    
    def validate_username(self, value):
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
    def validate_wishlist_name(self, value):
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
        

class WishlistReadSerializer(serializers.ModelSerializer):
    game = GameReadSerializer(many=True, read_only=True)
    
    class Meta:
        model = UserWishlist
        fields = ["id", "games"]

class WishlistWriteSerializer(serializers.ModelSerializer):
    games = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Game.objects.all()
    )

    def validate_name(self, value):
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
    class Meta:
        model = UserWishlist
        fields = ["id", "games"]  # don't expose user
    

            
class ProfileReadSerializer(serializers.ModelSerializer):
    favorite_game = GameReadSerializer(read_only=True)
    friendship_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        exclude = ['password', 
                   'is_staff', 
                   'groups', 
                   'user_permissions', 
                   'is_active', 
                   'is_superuser',
                   'id', 'first_name', 'last_name', 'email', 
                   ]
        

    def get_friendship_status(self, obj):
        friendship_map = self.context.get("friendship_map", {})
        return friendship_map.get(
            obj.id,
            {
                "status": "NOT_FRIENDS",
                "is_sender": False,
            },
        )

