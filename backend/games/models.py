from django.db import models

# Create your models here.

class Platform(models.Model):
    name = models.CharField(max_length=50, unique=True)
    def __str__(self):
        return f"{self.platform}"
    
class Tags(models.Model):
    tags = models.CharField(max_length=75, unique=True)

    def __str__(self):
        return f"{self.tags}"
    
class Game(models.Model):
    title = models.CharField(max_length=255, unique=True)
    alt_title = models.CharField(unique=True, blank=True, max_length=200, editable=True, null=True) 


    '''
    alt_title is going to be the field that a user types in, basically another name that the game could go by. For right now it's
    going to be one alternate title but (it may stay that way) but this is mainly for ease of use
    Postgres is case sensitive right now, I'm going to change it later but when looking up a game like 
    nba 2k25, even if NBA 2K25 is the the database nothing will show up.
    
    '''
    description = models.TextField(blank=True, null=True)
    released = models.DateField(blank=True, null=True) #The game's release date
    game_image = models.URLField(null=True, max_length=500, editable=True, blank=True)
    platform = models.ManyToManyField(Platform, blank=True) #Each game can be linked to multiple platforms if needed.
    store = models.URLField(null=True, max_length=200, editable=True, blank=True)
    tags = models.ManyToManyField(Tags, blank=True) #The Tags associated with each game

    def __str__(self):
        return f"{self.title}"


class AuthToken(models.Model):
    id = models.PositiveSmallIntegerField(primary_key=True, default=1, editable=False) #defaults so that anytime i add a new token it'll always be one
    token = models.CharField(unique=True, null=True, blank=True, max_length=250, editable=True)
    expire_time = models.DecimalField(null=True, blank=True, decimal_places=6, max_digits=16, editable=True)




