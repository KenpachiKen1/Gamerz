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

    client = CosmosClient(str(endpoint).strip(), credential=str(key).strip())

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

    get_container().create_item(body=item)
    return item