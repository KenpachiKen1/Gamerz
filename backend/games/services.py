from .models import *
import requests
import os 
from dotenv import load_dotenv
import time
import datetime
load_dotenv()

client_id=os.getenv("CLIENT_ID") #TWITCH 
secret = os.getenv("SECRET") #TWITCH 



def add_game_to_db(game: str) -> Game: #game will be the name of the game chosen from the frontend by the user
    base_url = "https://api.igdb.com/v4/games"
       #will maybe add more fields depending on what it is necessary
    try:
        token = get_token() #twitch token loading
    except Exception as e:
        return str(e)
    headers = {
        "Client-ID": client_id,
        "Authorization": f"Bearer {token}"
        }
    
    
    body = f""" search "{game}"; 
    fields name, first_release_date, summary, genres.name, websites.url, cover.url, platforms.name; where name ~ "{game}"; 
    limit 1; """
    
    response = requests.post(base_url, headers=headers, data=body)
    data = response.json()
    if not data:
        raise ValueError(f"No IGDB results for {game}")
    
    try:
        fields = [{
        "name": details.get("name"),
        "summary" : details.get("summary"),
        "cover_art" : details["cover"].get("url"),
        "release_date" : datetime.datetime.fromtimestamp(details["first_release_date"]).date().isoformat() if details.get("first_release_date") else None,  #Converts the date but if there is nothing there it will just be null
        "platforms" : [platforms["name"] for platforms in details.get("platforms", [])]
    } for details in data] 
        
        _game = Game.objects.create(title=fields[0]["name"],
                                    description = fields[0].get("summary"),
                                    released = fields[0].get("release_date"), game_image = fields[0].get("cover_art"))
    except Exception as e:
        return {"Something here is buggy" : str(e)}
    try: #handling adding the platofrms: 
        for plat in fields[0].get("platforms", []):
            platform_obj, isCreated = Platform.objects.get_or_create(name = plat) #returns a tuple
            _game.platform.add(platform_obj)
        _game.save()
    except Exception as e:
        return str(e)
    
    return _game
#For twitch tokens
def update_token():
    url = f"https://id.twitch.tv/oauth2/token?client_id={client_id}&client_secret={secret}&grant_type=client_credentials" #url needed to get the token
    response = requests.post(url) #post request, will return the token and the expire time

    data = response.json() 

    _token = data.get("access_token") #The key

    _token_expires = time.time() + data.get("expires_in") - 60  # expire time, subtract 60s buffer 

    return {"token" : _token, "expires_in" : _token_expires}



def get_token():
    try:
        if not AuthToken.objects.filter(id=1).exists(): #for initial token set up but after I add a new token it will never be none
            token = update_token()
            AuthToken.objects.create(token=token.get("token"), expire_time=token.get("expires_in"))
            return AuthToken.objects.get(id=1).token
        
        if time.time() < AuthToken.objects.get(id=1).expire_time: #The token exists at this point so just checking the expire time
            return AuthToken.objects.get(id=1).token #returning the token because it's still valid 
        
        #If the time passed the expired time, then i get a new token
        new_token = update_token()
        curr_token = AuthToken.objects.get(id=1)

        curr_token.token = new_token.get("token")
        curr_token.expire_time = new_token.get("expires_in")
        curr_token.save()

        return curr_token.token
    except Exception as e:
        return {"Token error" :str(e)}
    
