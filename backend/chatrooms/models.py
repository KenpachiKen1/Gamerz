from django.db import models
from users.models import User
from communities.models import Community


class ChatRoom(models.Model):
    community = models.ForeignKey(
        Community,
        on_delete=models.CASCADE,
        related_name="chatrooms"
    )
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.community.title} - {self.name}"


class ChatMessage(models.Model):
    chatroom = models.ForeignKey(
        ChatRoom,
        related_name="messages",
        on_delete=models.CASCADE
    )
    author = models.ForeignKey(
        User,
        related_name="chat_messages",
        on_delete=models.CASCADE
    )
    body = models.TextField(max_length=250)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created"]

    def __str__(self):
        return f"{self.author.username}: {self.body[:40]}"