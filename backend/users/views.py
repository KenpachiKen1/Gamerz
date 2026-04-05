from .models import User, UserWishlist, Friendship
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from users.serializers import *
from rest_framework.permissions import IsAuthenticated, AllowAny
from games.models import Game
from django.shortcuts import get_object_or_404
from games.services import add_game_to_db
from games.serializers import GameReadSerializer
from .authentication import *
from django.db.models import Q

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related('favorite_game').all()
    permission_classes = [IsAuthenticated]


    def get_authenticators(self):
        action = getattr(self, "action", None)
        if action in ["signup", "login"]:
            return []
        return super().get_authenticators()

    def get_permissions(self):
        action = getattr(self, "action", None)
        if action in ["signup", "login"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update', 'signup']:
            return UserWriteSerializer
        return UserReadSerializer
    
    @action(detail=False, methods=['GET'])
    def profile(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail = False, methods=['POST'], permission_classes=[AllowAny])
    def signup(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return Response(
                {"error": "Authorization header must be Bearer <token>."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token = auth_header.split("Bearer ")[1].strip()

        try:
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token["uid"]
        except Exception:
            return Response(
                {"error": "Invalid or expired Firebase token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data.get("email")
        username = serializer.validated_data.get("username")

        if User.objects.filter(firebase_uid=uid).exists():
            return Response(
                {"error": "A Django account already exists for this Firebase user."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "There is an account with this username already"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "There is an account with this email already"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=request.data.get("password"),
            first_name=serializer.validated_data.get("first_name"),
            last_name=serializer.validated_data.get("last_name"),
        )
        user.firebase_uid = uid
        user.save()

        return Response(
            {
                "success": "Account created!",
                "data": UserReadSerializer(user, context={"request": request}).data,
            },
            status=status.HTTP_201_CREATED,
        )
    #will fully develop this when firebase auth is set-up
    @action(detail = False, methods=['POST'], permission_classes=[AllowAny])
    def login(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return Response(
                {"error": "Authorization header must be Bearer <token>."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token = auth_header.split("Bearer ")[1].strip()

        try:
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token["uid"]
        except Exception:
            return Response(
                {"error": "Invalid or expired Firebase token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            user = User.objects.get(firebase_uid=uid)
        except User.DoesNotExist:
            return Response(
                {"error": "No Django account exists for this Firebase user."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = UserReadSerializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    @action(detail = False, methods=['DELETE'])
    def delete_account(self, request):
        user = request.user #the user object itself
        user.delete()
        return Response({'status': 'Account deleted'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['PATCH'])
    def update_profile(self, request, pk = None):

        user = get_object_or_404(User, id = pk)
        serializer =  self.get_serializer(user, data = request.data, many = False)
       
        try: 
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response({"success": "sucessfully updated account", "data": serializer.data}, status=status.HTTP_200_OK)
            else:
                return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

class WishlistViewSet(viewsets.ModelViewSet):
    queryset = UserWishlist.objects.prefetch_related("games").select_related("user").all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return WishlistWriteSerializer
        return WishlistReadSerializer

    
    @action(detail = False, methods=['POST'])
    def create_wishlist(self, request):
        user = request.user
        name = request.data.get("wishlist_name")

        if UserWishlist.objects.filter(user = user).exists():
            return Response({"error": "You can only have one wishlist per user"}, status=status.HTTP_400_BAD_REQUEST)
        
        user.wishlist_name = name
        user.save()

        wishlist = UserWishlist.objects.create(user = user, name = name).save()
        return Response({"Done: " : wishlist.__str__()}, status=status.HTTP_201_CREATED)
    

    @action(detail=True, methods=['PATCH'])
    def add_to_wishlist(self, request, pk = None): #the pk is the wishlist id
        user = request.user
        wishlist = self.get_object() #the desired wishlist
        game = request.data.get("game")
        
        if wishlist.user is not user:
            return Response({"error" : "this wishlist's user is not matching to the request's user"}, status=status.HTTP_400_BAD_REQUEST)
        
            #check if the game exists already, if it does then add it to the wishlist and return, if not add it to the game databse first then to the wishlist
            if Game.objects.filter(name = game).exists():
                game = Game.objects.get(name=game_name)
                try:
                    wishlist.games.add(game)
                    wishlist.save()
                except Exception as e:
                        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                return Response({"Success": f"added {game.name} to {wishlist.name}"}, status=status.HTTP_200_OK)
            else:
                print("Not in the database, going to add it first then add to wishlist")
                _game = add_game_to_db(game)
                try:
                    wishlist.games.add(game)
                    wishlist.save()
                except Exception as e:
                        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                return Response({"Success": f"added {game.name} to {wishlist.name}"}, status=status.HTTP_200_OK)
            
    @action(detail = True, methods=['PATCH'])
    def remove_game_from_list(self, request, pk = None):
        user = request.user
        wishlist = self.get_object()

        if wishlist.user is not user:
            return Response({"error" : "this wishlist's user is not matching to the request's user"}, status=status.HTTP_400_BAD_REQUEST)
        game = request.data.get("game_name") #will always be a direct match since the user is clicking on the game itself
 
        try:
            game = Game.objects.get(game)
            wishlist.games.remove(game)
            wishlist.save()
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"success": f"removed game from {wishlist.name}"}, status=status.HTTP_200_OK)
    
    @action(detail=False) #READ
    def show_wishlist(self, request):
        try:
            user = request.user
            wishlist_name = user.wishlist_name
            if wishlist_name == None: #either they have one or they don't
                return Response("This user doesn't have a wishlist", status=status.HTTP_200_OK)
            wishlist = UserWishlist.objects.get(user = user, name = wishlist_name)
            games = wishlist.games.all()
            serializer = GameReadSerializer(games, many=True)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.data, status=status.HTTP_200_OK)
   
    @action(detail = False, methods=['DELETE'])
    def delete_wishlist(self, request):
        try:
            user = request.user
            wishlist = user.wishlist_name
            UserWishlist.objects.filter(user = user, name = wishlist).delete()
            user.wishlist_name = None
            user.save()
            return Response({"message": "deleted wishlist successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)

        
    


        



        
    








