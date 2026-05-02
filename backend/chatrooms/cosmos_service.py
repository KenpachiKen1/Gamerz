import os
import uuid
from datetime import datetime, timezone

from azure.cosmos import CosmosClient, PartitionKey
from users.models import User

_container = None


def get_container():
    global _container

    if _container is not None:
        return _container

    endpoint = os.getenv("COSMOS_ENDPOINT")
    key = os.getenv("COSMOS_KEY")
    database_name = os.getenv("COSMOS_DATABASE")
    container_name = os.getenv("COSMOS_CHAT_CONTAINER")

    missing = [
        name
        for name, value in {
            "COSMOS_ENDPOINT": endpoint,
            "COSMOS_KEY": key,
            "COSMOS_DATABASE": database_name,
            "COSMOS_CHAT_CONTAINER": container_name,
        }.items()
        if not value
    ]

    if missing:
        raise RuntimeError(f"Missing Cosmos env vars: {', '.join(missing)}")

    key = str(key).strip()
    endpoint = str(endpoint).strip()

    client = CosmosClient(endpoint, credential=key)

    database = client.create_database_if_not_exists(id=database_name)

    _container = database.create_container_if_not_exists(
        id=container_name,
        partition_key=PartitionKey(path="/chatroom_id"),
    )

    return _container


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

    container = get_container()
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

    container = get_container()

    return list(
        container.query_items(
            query=query,
            parameters=parameters,
            partition_key=str(chatroom_id),
        )
    )