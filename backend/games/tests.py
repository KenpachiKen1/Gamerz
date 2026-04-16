from django.test import TestCase
from games.models import Game         # add this

# Create your tests here.

class TestGameCRUD(TestCase):
    def test_create_game(self):
        game = Game.objects.create(title="nba2k")
        self.assertEqual(Game.objects.count(), 1)
        self.assertEqual(game.title, "nba2k")

    def test_delete_game(self):             
        game = Game.objects.create(title="Elden Ring")
        game.delete()
        self.assertEqual(Game.objects.count(), 0) 
    
    def test_update_game(self):
        game = Game.objects.create(title="nba2k")
        game.title = "2k"
        game.save()
        updated = Game.objects.get(pk=game.pk)
        self.assertEqual(updated.title, "NBA 2K25")
    
    def test_read_game(self):
        Game.objects.create(title="nba2k")
        game = Game.objects.get(title="nba2k")
        self.assertEqual(game.title, "nba2k")