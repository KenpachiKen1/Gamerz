from rest_framework import serializers
from .models import *

from pathlib import Path
from games.models import Game
from django.conf import settings 
from games.serializers import GameReadSerializer

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
        fields = ["email", "username", "password", "first_name", "last_name"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    
    def validate_username(self, value):
        s = value.lower() #the username
        pat = re.compile(r'[@!#$%^&*()<>?/|}{~:]')

        if pat.search(s):
                raise serializers.ValidationError("This username has invalid characters")
        
        with open(p, 'r') as f:
             for word in f:
                  word = word.strip().lower()

                  if word in s:
                       raise serializers.ValidationError("This username contains profanity!")
        return value
    
    def validate_wishlist_name(self, value):
        s = value.lower() #the wishlist name
        pat = re.compile(r'[@!#$%^&*()<>?/|}{~:]')

        if pat.search(s):
                raise serializers.ValidationError("This username has invalid characters")
        
        with open(p, 'r') as f:
             for word in f:
                  word = word.strip().lower()

                  if word in s:
                       raise serializers.ValidationError("This username contains profanity!")
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
        s = value.lower()
        pat = re.compile(r'[@!#$%^&*()<>?/|}{~:]')
        if pat.search(s):
            raise serializers.ValidationError("This wishlist name has invalid characters.")
        with open(p, 'r') as f:
             for word in f:
                  word = word.strip().lower()
                  if word in s:
                    raise serializers.ValidationError("This wishlist name contains profanity!")
    class Meta:
        model = UserWishlist
        fields = ["id", "games"]  # don't expose user
    



    
