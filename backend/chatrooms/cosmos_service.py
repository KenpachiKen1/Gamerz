import os
import uuid
from datetime import datetime, timezone

from azure.cosmos import CosmosClient, PartitionKey
from users.models import User

COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("COSMOS_KEY")
COSMOS_DATABASE = os.getenv("COSMOS_DATABASE")
COSMOS_CHAT_CONTAINER = os.getenv("COSMOS_CHAT_CONTAINER")

client = CosmosClient(COSMOS_ENDPOINT, credential=COSMOS_KEY)

database = client.create_database_if_not_exists(id=COSMOS_DATABASE)

container = database.create_container_if_not_exists(
    id=COSMOS_CHAT_CONTAINER,
    partition_key=PartitionKey(path="/chatroom_id"),
)


def save_message(
    chatroom_id,
    community_id,
    author: User,
    body="",
    message_type="text",
    media_url=None,
):
    item = {
        "id": str(uuid.uuid4()),
        "chatroom_id": str(chatroom_id),
        "community_id": str(community_id),
        "author_id": author.id,
        "author_username": author.username,
        "body": body,
        "message_type": message_type,
        "media_url": media_url,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    container.create_item(body=item)
    return item


def get_chat_messages(chatroom_id, limit=15):
    query = """
        SELECT TOP @limit *
        FROM c
        WHERE c.chatroom_id = @chatroom_id
        ORDER BY c.created_at ASC
    """

    parameters = [
        {"name": "@chatroom_id", "value": str(chatroom_id)},
        {"name": "@limit", "value": limit},
    ]

    return list(
        container.query_items(
            query=query,
            parameters=parameters,
            partition_key=str(chatroom_id),
        )
    )