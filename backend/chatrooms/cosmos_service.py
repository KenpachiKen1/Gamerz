import os
import uuid
from datetime import datetime, timezone

from azure.cosmos import CosmosClient, PartitionKey
from users.models import User
_chat_container = None
_post_container = None


def get_chat_container():
    global _chat_container

    if _chat_container is not None:
        return _chat_container

    endpoint = os.getenv("COSMOS_ENDPOINT")
    key = os.getenv("COSMOS_KEY")
    database_name = os.getenv("COSMOS_DATABASE")
    container_name = os.getenv("COSMOS_CHAT_CONTAINER")

    client = CosmosClient(str(endpoint).strip(), credential=str(key).strip())
    database = client.create_database_if_not_exists(id=database_name)

    _chat_container = database.create_container_if_not_exists(
        id=container_name,
        partition_key=PartitionKey(path="/chatroom_id"),
    )

    return _chat_container


def get_post_container():
    global _post_container

    if _post_container is not None:
        return _post_container

    endpoint = os.getenv("COSMOS_ENDPOINT")
    key = os.getenv("COSMOS_KEY")
    database_name = os.getenv("COSMOS_DATABASE")
    container_name = os.getenv("COSMOS_POST_CONTAINER", "community_posts")

    client = CosmosClient(str(endpoint).strip(), credential=str(key).strip())
    database = client.create_database_if_not_exists(id=database_name)

    _post_container = database.create_container_if_not_exists(
        id=container_name,
        partition_key=PartitionKey(path="/community_id"),
    )

    return _post_container

def save_community_post(
        post_id,
          community_id, 
          community_title,
            author: User,
              subject = "",
                body = "", 
                media_url = None,
                  media_type = None
):
    
    item = {
        "id": f"post-{post_id}",
        "type": "community_post",
        "post_id": post_id,
        "community_id": str(community_id),
        "community_title": community_title,
        "author_id": author.id,
        "author_username": author.username,
        "subject": subject,
        "body": body,
        "media_url": media_url,
        "media_type": media_type,
        "created_at": datetime.now(timezone.utc).isoformat(),

    }

    get_post_container().create_item(body=item)
    return
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

    get_chat_container().create_item(body=item)
    return item