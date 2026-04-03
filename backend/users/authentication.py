import firebase_admin
from firebase_admin import auth, credentials
from rest_framework import authentication
from rest_framework import exceptions
from .models import User
from .serializers import UserWriteSerializer

class FirebaseAuthentication(authentication.BaseAuthentication):

   def authenticate_signup(self, request):
      token = str(request.headers.get("Authorization"))

      if not token:
        return None
      

      if not token.startswith("Bearer "):
         raise exceptions.AuthenticationFailed("This isn't the accepted header token for Auth.")
      

      token = token.split("Bearer ")[1].strip() #getting the token itself
      
      try:
         decoded_token = auth.verify_id_token(token)
         uid = decoded_token["uid"]
      except Exception as e:
        return str(e)
            
      try: 
            serializer = UserWriteSerializer(data = request.data)
            if serializer.is_valid(raise_exception=True):
               email = serializer.validated_data.get("email")
            username =  serializer.validated_data.get("username")
           
            if User.objects.filter(username = username).exists():
               return {"error" : "There is an account with this username"}

            elif User.objects.filter(email = email).exists():
             return {"error" : "An account with tbis email exists"}

            
            user = User.objects.create_user(username=username, email=email,
                                             password = request.data.get("password"), 
                                            first_name = serializer.validated_data.get("first_name"), 
                                            last_name = serializer.validated_data.get("last_name"), uid = uid)
      except Exception as e:
            return {"error" : str(e)}
      return user
   

   def authenticate_login(self, request):
      token = str(request.headers.get("Authorization"))

      if not token:
        return None
      

      if not token.startswith("Bearer "):
         raise exceptions.AuthenticationFailed("This isn't the accepted header token for Auth, should be Bearer <token>")
      

      token = token.split("Bearer ")[1].strip() #getting the token itself
      
      try:
         decoded_token = auth.verify_id_token(token)
         uid = decoded_token["uid"]
      except Exception as e:
        return str(e)
      
      try:
         if User.objects.filter(firebase_uid = uid).exists(): #the requested user has an account..login endpoint
            user = User.objects.get(firebase_uid = uid)
            return user
      except User.DoesNotExist:
         return None
    
    