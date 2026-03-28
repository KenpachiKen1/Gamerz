from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    hours = models.IntegerField(default=0, blank=True, null=True, editable=True)
    profile_picture = models.CharField(max_length=255, blank=True, null=True, editable=True)
    created_at = models.DateTimeField(auto_now_add=True)
    favorite_game = models.ForeignKey('games.Game', on_delete=models.SET_NULL, blank=True, null=True, related_name='favorite_game')
    main_platform = models.CharField(max_length=50, blank=True, null=True, editable=True)
    wishlist_name = models.CharField(max_length=255, blank=True, null=True, editable=True)

    def __str__(self):
        return f"username: {self.username} password: {self.password}, email: {self.email}, first name: {self.first_name}, last name: {self.last_name}"

class UserWishlist(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True, editable=True, unique=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlists')
    games = models.ManyToManyField("games.Game", blank=True) #Multiple games can be on multiple wishlists

    def __str__(self):
        return f"created Wishlist : {self.name} for {self.user.username}"
    
class Notification(models.Model): #For comments, likes, friend requests, etc.

    STATUS_CHOICES = [('UNREAD', 'Unread'), ('READ', 'Read')]

    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_notifications')
    message = models.CharField(max_length=255)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='UNREAD')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Notification from {self.sender.username} to {self.receiver.username}: {self.message} - Status: {self.status}"
    class Meta:
        unique_together = ("sender", "receiver")      

class Friendship(models.Model):
    NO_REL = "X"
    PENDING = "P"
    ACCEPTED = "A"
    DECLINED = "D"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (ACCEPTED, "Accepted"),
        (DECLINED, "Declined"),
        (NO_REL, "No Relationship"),
    ]

    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships_sent")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships_received")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=NO_REL)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.sender.username} and {self.receiver.username} friendship status: {self.status}"
    class Meta:
        unique_together = ("sender", "receiver")  # no duplicate requests
    







