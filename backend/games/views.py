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

# Create your views here.
class GameViewSet(viewsets.ModelViewSet):
    
    queryset = Game.objects.all()
    serializer_class = Game
    permission_classes = [IsAuthenticated]

    global CID
    
    CID = os.getenv("CLIENT_ID") #can be global, client id will always be the same
  
   

    @action(detail=False, methods=['POST'])
    def game_search(self, request):

        base_url = "https://api.igdb.com/v4/games"
       #will maybe add more fields depending on what it is necessary
        token = get_token()
        headers = {
        "Client-ID": CID,
        "Authorization": f"Bearer {token}"
    }
        game = request.data.get("game")

        #added where clause for hopefully more exact look ups
        body = f"""
        search "{game}"; 
        fields id, name, first_release_date, summary, first_release_date, genres.name, websites.url, cover.url, platforms.name, artworks.url;
        limit 30;
        """ #using college football just for testing purposes
        response = post(base_url, headers=headers, data=body)
        data = response.json()

        #datetime.datetime.fromtimestamp(details.get("first_release_date"))
        filtered_results = [
        {
            "id": details["id"],
            "name": details["name"],
            "cover": details.get("cover").get("url") if details.get("cover") else None, #returns a dictionary with both the ID and the url, I just want the url
            "release_date" : datetime.datetime.fromtimestamp(details["first_release_date"]).date().isoformat() if details.get("first_release_date") else None,  #Converts the date but if there is nothing there it will just be null
            "summary" : details.get("summary"), #some search results don't have summaries .get() is more loose in the sense that if the key isn't there it just wont return
            "platforms" : [platforms["name"] for platforms in details.get("platforms", [])]
        } for details in data]

        return Response(filtered_results, status=status.HTTP_200_OK)
    

    @action(detail=False, methods=['PATCH'])
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

            return Response(
                {"Favorite Game": game.title},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"Adding game error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
    @action(detail=False, methods=['GET']) 
    def get_fav_game(self, request):
        user = request.user
        game = user.favorite_game

        if game is None:
            return Response({"Error" : "No favorite game set"}, status=status.HTTP_404_NOT_FOUND)
        serializer = GameReadSerializer(game, many=False)

        return Response({"Details" : serializer.data}, status=status.HTTP_200_OK) 


    @action(detail=False)
    def game_details(self, request): 
        title = request.data.get("game")

        try:
            if Game.objects.filter(title=title).exists():
                game = Game.objects.get(title=title)
            else:
                game = add_game_to_db(title)

            print(game)
            serializer = GameReadSerializer(game)
            return Response({"Details": serializer.data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"Error": str(e)}, status=status.HTTP_400_BAD_REQUEST)