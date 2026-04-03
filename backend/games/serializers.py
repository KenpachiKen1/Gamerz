from rest_framework import serializers
from .models import *



#Since this is all game related stuff from an API, we don't need to check for profanity
class GameReadSerializer(serializers.ModelSerializer):
    platform = serializers.SlugRelatedField(many=True, read_only=True, slug_field="platform")
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field="tags")
    
    class Meta:
        model = Game
        fields = "__all__"

class GameWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = "__all__"

class PlatformSerializer (serializers.ModelSerializer):
    class Meta:
        model = Platform
        fields = '__all__'

class TagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tags
        fields = '__all__'



