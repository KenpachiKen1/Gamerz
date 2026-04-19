import json
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .models import ChatRoom, ChatMessage


class CommunityChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.chatroom_id = self.scope["url_route"]["kwargs"]["chatroom_id"]
        self.chatroom = await self.get_chat_room_for_user()

        if not self.chatroom:
            await self.close()
            return

        self.group_name = f"chatroom_{self.chatroom_id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data or "{}")
        body = (data.get("body") or "").strip()

        if not body:
            return

        message = await self.create_message(body)

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat_message",
                "id": message.id,
                "message": message.body,
                "author": message.author.username,
                "created": message.created.isoformat(),
            },
        )

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "id": event["id"],
                    "message": event["message"],
                    "author": event["author"],
                    "created": event["created"],
                }
            )
        )

    @database_sync_to_async
    def get_chat_room_for_user(self):
        return ChatRoom.objects.filter(
            id=self.chatroom_id,
            community__members__id=self.user.id,
        ).select_related("community").first()

    @database_sync_to_async
    def create_message(self, body):
        return ChatMessage.objects.create(
            body=body,
            author=self.user,
            chatroom=self.chatroom,
        )