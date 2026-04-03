import firebase_admin
from firebase_admin import auth, credentials
from rest_framework import authentication
from rest_framework import exceptions
from .models import User


#class FireBaseAuth(authentication.BaseAuthentication):

