from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from communities.models import Community
from .models import ChatRoom, ChatMessage
from .serializers import (
    ChatRoomReadSerializer,
    ChatRoomWriteSerializer,
    ChatMessageReadSerializer,
)

class ChatRoomViewSet(viewsets.ModelViewSet):
    queryset = ChatRoom.objects.select_related("community").prefetch_related("messages")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["list", "retrieve", "get_all_chat_rooms"]:
            return ChatRoomReadSerializer
        return ChatRoomWriteSerializer

    def get_queryset(self):
        return ChatRoom.objects.filter(
            community__members=self.request.user
        ).select_related("community").prefetch_related("messages")

    @action(detail=True, methods=["GET"])
    def get_chat_messages(self, request, pk=None):
        chatroom = get_object_or_404(
            ChatRoom.objects.select_related("community"),
            id=pk,
            community__members=request.user,
        )

        messages = ChatMessage.objects.filter(chatroom=chatroom).select_related("author")[:45]
        serializer = ChatMessageReadSerializer(messages, many=True)

        return Response({"messages": serializer.data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["GET"])
    def get_all_chat_rooms(self, request):
        chatrooms = self.get_queryset()
        serializer = ChatRoomReadSerializer(chatrooms, many=True)
        return Response({"rooms": serializer.data}, status=status.HTTP_200_OK)
    

    @action(detail=False, methods=["post"])
    def create_chatroom(self, request):
        user = request.user
        community_id = request.data.get("community")
        name = request.data.get("name")

        if not community_id or not name:
            return Response(
                {"error": "community and name are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        community = get_object_or_404(Community, id=community_id)

        if not community.members.filter(id=user.id).exists():
            return Response(
                {"error": "You are not part of this community"},
                status=status.HTTP_403_FORBIDDEN
            )

        chatroom = ChatRoom.objects.create(
            community=community,
            name=name
        )

        return Response(
            {"id": chatroom.id, "name": chatroom.name},
            status=status.HTTP_201_CREATED
        )