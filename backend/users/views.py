from .models import User, UserWishlist, Friendship
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
#from users.serializers import UserSerializer, ProfileReadSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
#from games.models import Game
#from games.services import add_game_to_db
#from games.serializers import GameReadSerializer
#from users.services import *
#from django.db.models import Q
#from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
#from games.start_gg import retrieve_game_id

# Create your views here.

