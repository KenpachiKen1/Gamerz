from django.db import models
from users.models import User
from games.models import Game
# Create your models here.

class Community(models.Model):
    title = models.CharField(unique=True, max_length=225, editable=False, null=True)
    members = models.ManyToManyField(User)
    game = models.OneToOneField(Game, on_delete=models.CASCADE, related_name="community")
    def __str__(self):
        return f"{self.title} id: {self.id}"

class CommunityPost(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="post")
    poster = models.ForeignKey(User, on_delete=models.CASCADE, related_name="poster")
    subject = models.CharField(max_length=300, null=True, blank=True, editable=True)
    body = models.TextField(max_length=500, null=True, blank=True, editable=True)    
    creation = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='post_likes', blank=True, editable=True)
    dislikes = models.ManyToManyField(User, related_name='post_dislikes', blank=True, editable=True)

    def __str__(self):
        return f"Poster: {self.poster.username} - Subject: {self.subject}"
    
    class Meta: 
        ordering = ['-creation']

class CommunityPostComment(models.Model): #keeping it base level right now, but as information grows will build it to have replies within replies
    original_post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name="replies")
    creation = models.DateTimeField(auto_now_add=True)
    reply = models.TextField()
    poster = models.ForeignKey(User, on_delete=models.CASCADE, related_name="post_replies")
    likes = models.ManyToManyField(User, related_name='comment_likes', blank=True, editable=True)
    dislikes = models.ManyToManyField(User, related_name='comment_dislikes', blank=True, editable=True)
    def __str__(self):
        return f"Original Subject: {self.original_post.subject}, Poster: {self.poster.username}, Reply: {self.reply}"

    class Meta: 
        ordering = ['-creation']





