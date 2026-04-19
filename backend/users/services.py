from .models import User, Notification
from users.serializers import *




def send_friend_notification(user: User, friend: User):
        Notification.objects.create(sender=user, receiver=friend, message=f"{user.username} wants to be your friend")
        return f"{user.username} has sent a friend request to {friend.username}"
