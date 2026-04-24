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
from .services import send_friend_notification


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
    
    @action(detail=False, methods=['PATCH'])
    def update_profile(self, request):
 
        user = request.user
        serializer =  self.get_serializer(user, data = request.data, partial = True)
       
        try: 
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response({"success": "sucessfully updated account", "data": serializer.data}, status=status.HTTP_200_OK)
            else:
                return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=["GET"], url_path=r"profile/(?P<username>[^/.]+)")
    def public_profile(self, request, username=None):
            current_user = request.user
            target_user = get_object_or_404(
                User.objects.select_related("favorite_game"),
                username=username
            )

            friendship = Friendship.objects.filter(
                Q(sender=current_user, receiver=target_user) |
                Q(sender=target_user, receiver=current_user)
            ).first()

            friendship_map = {}

            if friendship:
                if friendship.sender_id == current_user.id:
                    friendship_map[target_user.id] = {
                        "status": friendship.status,
                        "is_sender": True,
                    }
                else:
                    friendship_map[target_user.id] = {
                        "status": friendship.status,
                        "is_sender": False,
                    }

            serializer = ProfileReadSerializer(
                target_user,
                context={
                    "request": request,
                    "friendship_map": friendship_map,
                },
            )

            return Response(serializer.data, status=status.HTTP_200_OK)
                

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
    

    @action(detail=False, methods=['PATCH'])
    def add_to_wishlist(self, request): #the pk is the wishlist id
        user = request.user
    
        wishlist = get_object_or_404(UserWishlist, user = user)
        game = request.data.get("game")
        
            #check if the game exists already, if it does then add it to the wishlist and return, if not add it to the game databse first then to the wishlist
        if Game.objects.filter(title = game).exists():
                game = Game.objects.get(title=game)
                try:
                    wishlist.games.add(game)
                    wishlist.save()
                except Exception as e:
                        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                return Response({"Success": f"added {game.title} to {wishlist.name}"}, status=status.HTTP_200_OK)
        else:
                print("Not in the database, going to add it first then add to wishlist")
                _game = add_game_to_db(game)
                try:
                    wishlist.games.add(_game)
                    wishlist.save()
                except Exception as e:
                        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                return Response({"Success": f"added {game.title} to {wishlist.name}"}, status=status.HTTP_200_OK)
            
    @action(detail = False, methods=['PATCH'])
    def remove_game_from_list(self, request):
        user = request.user
        wishlist = get_object_or_404(UserWishlist, user = user)


      
        game = request.data.get("game") #will always be a direct match since the user is clicking on the game itself
        
        try:
            game = Game.objects.get(title = game)
            if not wishlist.games.filter(id=game.id).exists():
                return Response(
                    {"error": "This game isn't in your wishlist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
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
        

class FriendsViewSet(viewsets.ModelViewSet):
    queryset = Friendship.objects.select_related("sender", "receiver").all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return self.queryset.filter(Q(sender=user) | Q(receiver=user))

    @action(detail=False, methods=["POST"])
    def add_friend(self, request):
        user = request.user
        friend_username = request.data.get("username")

        if not friend_username:
            return Response(
                {"error": "Username is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if friend_username == user.username:
            return Response(
                {"error": "You cannot send a friend request to yourself"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        receiver = get_object_or_404(User, username=friend_username)

        existing = Friendship.objects.filter(
            Q(sender=user, receiver=receiver) | Q(sender=receiver, receiver=user)
        ).first()

        if existing:
            return Response(
                {"error": "A friendship or friend request already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        friendship = Friendship.objects.create(
            sender=user,
            receiver=receiver,
            status=Friendship.PENDING,
        )

        serializer = ProfileReadSerializer(receiver, context={"request": request})
        return Response(
            {
                "message": "Friend request sent",
                "friendship_status": friendship.status,
                "user": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["PATCH"])
    def accept_friend_request(self, request):
        user = request.user
        friend_username = request.data.get("username")

        if not friend_username:
            return Response(
                {"error": "Username is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        sender = get_object_or_404(User, username=friend_username)

        friendship = get_object_or_404(
            Friendship,
            sender=sender,
            receiver=user,
            status=Friendship.PENDING,
        )

        friendship.status = Friendship.ACCEPTED
        friendship.save()

        friend_list = get_users_friend_list(user, request=request)

        return Response(
            {
                "message": "Friend request accepted",
                "friends": friend_list,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["DELETE"])
    def decline_friend_request(self, request):
        user = request.user
        friend_username = request.data.get("username")

        if not friend_username:
            return Response(
                {"error": "Username is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        sender = get_object_or_404(User, username=friend_username)

        friendship = Friendship.objects.filter(
            sender=sender,
            receiver=user,
            status=Friendship.PENDING,
        )

        if not friendship.exists():
            return Response(
                {"error": "No pending friend request found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        friendship.delete()

        return Response(
            {"message": "Declined friend request"},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["GET"])
    def show_friend_list(self, request):
        user = request.user
        friend_list = get_users_friend_list(user, request=request)

        return Response(friend_list, status=status.HTTP_200_OK)
    @action(detail=False, methods=["GET"])
    def show_pending_friend_list(self, request):
        user = request.user

        sent_pending = Friendship.objects.filter(
            sender=user,
            status=Friendship.PENDING
        ).select_related("receiver")

        received_pending = Friendship.objects.filter(
            receiver=user,
            status=Friendship.PENDING
        ).select_related("sender")

        sent_users = [friendship.receiver for friendship in sent_pending]
        received_users = [friendship.sender for friendship in received_pending]

        sent_friendship_map = {
            friendship.receiver_id: {
                "status": friendship.status,
                "is_sender": True,
            }
            for friendship in sent_pending
        }

        received_friendship_map = {
            friendship.sender_id: {
                "status": friendship.status,
                "is_sender": False,
            }
            for friendship in received_pending
        }

        sent_serializer = ProfileReadSerializer(
            sent_users,
            many=True,
            context={
                "request": request,
                "friendship_map": sent_friendship_map,
            },
        )

        received_serializer = ProfileReadSerializer(
            received_users,
            many=True,
            context={
                "request": request,
                "friendship_map": received_friendship_map,
            },
        )

        return Response(
            {
                "sent_requests": sent_serializer.data,
                "received_requests": received_serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["DELETE"])
    def remove_friend(self, request):
        user = request.user
        friend_username = request.data.get("username")

        if not friend_username:
            return Response(
                {"error": "Username is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ex_friend = get_object_or_404(User, username=friend_username)

        deleted_count, _ = Friendship.objects.filter(
            Q(sender=user, receiver=ex_friend, status=Friendship.ACCEPTED) |
            Q(sender=ex_friend, receiver=user, status=Friendship.ACCEPTED)
        ).delete()

        if deleted_count == 0:
            return Response(
                {"error": "No accepted friendship found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        friend_list = get_users_friend_list(user, request=request)

        return Response(
            {
                "message": "Friend removed successfully",
                "friends": friend_list,
            },
            status=status.HTTP_200_OK,
        )

   
    @action(detail=False, methods=["POST"])
    def user_search(self, request):
        user = request.user
        account_name = str(request.data.get("username", "")).strip()

        if account_name == "":
            accounts = User.objects.exclude(id=user.id)
        else:
            accounts = User.objects.filter(
                username__icontains=account_name
            ).exclude(id=user.id)

        account_ids = list(accounts.values_list("id", flat=True))

        friendships = Friendship.objects.filter(
            Q(sender=user, receiver_id__in=account_ids) |
            Q(receiver=user, sender_id__in=account_ids)
        ).select_related("sender", "receiver")

        friendship_map = {}

        #using a map instead of having to using a serializer, more efficient.
        for friendship in friendships:
            if friendship.sender_id == user.id:
                other_user_id = friendship.receiver_id
                friendship_map[other_user_id] = {
                    "status": friendship.status,
                    "is_sender": True,
                }
            else:
                other_user_id = friendship.sender_id
                friendship_map[other_user_id] = {
                    "status": friendship.status,
                    "is_sender": False,
                }

        serializer = UserReadSerializer(
            accounts,
            many=True,
            context={
                "request": request,
                "friendship_map": friendship_map,
            },
        )

        return Response(serializer.data, status=status.HTTP_200_OK)




def get_users_friend_list(user: User, request):
    sent_accepted = Friendship.objects.filter(
        sender=user,
        status=Friendship.ACCEPTED
    ).values_list("receiver", flat=True)

    received_accepted = Friendship.objects.filter(
        receiver=user,
        status=Friendship.ACCEPTED
    ).values_list("sender", flat=True)

    friends = User.objects.filter(
        id__in=list(sent_accepted) + list(received_accepted)
    ).distinct()

    serializer = ProfileReadSerializer(
        friends,
        many=True,
        context={"request": request},
    )

    return serializer.data
        



        



        
    








