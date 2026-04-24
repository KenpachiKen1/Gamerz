from .models import Game
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from games.serializers import *
from .services import *
import os
from dotenv import load_dotenv
load_dotenv()
from rest_framework.permissions import IsAuthenticated
from requests import post
import datetime

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameReadSerializer
    permission_classes = [IsAuthenticated]

    CID = os.getenv("CLIENT_ID")

    @action(detail=False, methods=["POST"])
    def game_search(self, request):
        base_url = "https://api.igdb.com/v4/games"
        token = get_token()

        headers = {
            "Client-ID": self.CID,
            "Authorization": f"Bearer {token}"
        }

        game = request.data.get("game")

        body = f"""
        search "{game}";
        fields id, name, first_release_date, summary, first_release_date, genres.name, websites.url, cover.url, platforms.name, artworks.url;
        limit 30;
        """

        response = post(base_url, headers=headers, data=body)
        data = response.json()

        filtered_results = [
            {
                "id": details["id"],
                "name": details["name"],
                "cover": details.get("cover").get("url") if details.get("cover") else None,
                "release_date": datetime.datetime.fromtimestamp(
                    details["first_release_date"]
                ).date().isoformat() if details.get("first_release_date") else None,
                "summary": details.get("summary"),
                "platforms": [platform["name"] for platform in details.get("platforms", [])]
            }
            for details in data
        ]

        return Response(filtered_results, status=status.HTTP_200_OK)

    @action(detail=False, methods=["POST"])
    def follow_game(self, request):
        user = request.user
        game_name = request.data.get("name")

        if not game_name:
            return Response(
                {"error": "No game name provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            game = Game.objects.filter(title=game_name).first()

            if not game:
                game = add_game_to_db(game_name)

            user.followed_games.add(game)

            community = getattr(game, "community", None)
            if community:
                community.members.add(user)

            return Response(
                {
                    "message": f"Now following {game.title}",
                    "game": game.title,
                    "community_joined": community.title if community else None,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["DELETE"])
    def unfollow_game(self, request):
        user = request.user
        game_name = request.data.get("name")

        if not game_name:
            return Response(
                {"error": "No game name provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            game = Game.objects.get(title=game_name)

            if not user.followed_games.filter(id=game.id).exists():
                return Response(
                    {"error": "You are not following this game"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.followed_games.remove(game)

            community = getattr(game, "community", None)

            # only leave community if it is not also their favorite game
            if community and user.favorite_game_id != game.id:
                community.members.remove(user)

            return Response(
                {
                    "message": f"Unfollowed {game.title}",
                    "game": game.title,
                },
                status=status.HTTP_200_OK,
            )

        except Game.DoesNotExist:
            return Response(
                {"error": "Game not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["GET"])
    def show_followed_games(self, request):
        user = request.user

        try:
            games = user.followed_games.all()
            serializer = GameReadSerializer(games, many=True)

            return Response(
                {"followed_games": serializer.data},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["PATCH"])
    def set_fav_game(self, request):
        user = request.user
        game_name = request.data.get("name")

        if not game_name:
            return Response(
                {"error": "No game name provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            game = Game.objects.filter(title=game_name).first()

            if not game:
                game = add_game_to_db(game_name)

            user.favorite_game = game
            user.save()

            # favorite game should also become followed
            user.followed_games.add(game)

            community = getattr(game, "community", None)
            if community:
                community.members.add(user)

            return Response(
                {
                    "favorite_game": game.title,
                    "community_joined": community.title if community else None,
                    "message": f"{game.title} set as favorite and followed",
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"Adding game error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["GET"])
    def get_fav_game(self, request):
        user = request.user
        game = user.favorite_game

        if game is None:
            return Response(
                {"error": "No favorite game set"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = GameReadSerializer(game, many=False)
        return Response({"details": serializer.data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["POST"])
    def game_details(self, request):
        title = request.data.get("game")

        try:
            if Game.objects.filter(title=title).exists():
                game = Game.objects.get(title=title)
            else:
                game = add_game_to_db(title)

            serializer = GameReadSerializer(game)
            return Response({"details": serializer.data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)