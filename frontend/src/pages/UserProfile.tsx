import { useEffect, useState } from "react";
import { Avatar, Card, Layout } from "antd";
import Sider from "antd/es/layout/Sider";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useFriends } from "../context/FriendsContext";
import Sidebar from "../components/sidebar";
import "../styles/profile.css";

const { Content } = Layout;

type FriendshipStatus = {
  status: string;
  is_sender: boolean;
};

type FavoriteGameType = {
  id?: number;
  name?: string;
  title?: string;
  community?: {
    id: number;
    title: string;
  } | null;
};

type ProfileType = {
  username: string;
  profile_picture?: string | null;
  main_platform?: string | null;
  hours?: number | null;
  favorite_game?: FavoriteGameType | null;
  friendship_status?: FriendshipStatus;
};

type ProfilePost = {
  id: number;
  subject: string;
  body: string;
  creation: string;
  poster: {
    id: number;
    username: string;
    profile_picture?: string | null;
  };
  like_count?: number;
  dislike_count?: number;
  comment_count?: number;
};

export default function UserProfile() {
  const [collapsed] = useState(false);
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const { getToken } = useAuth();
  const {
    add_friend,
    remove_friend,
    accept_friend_request,
    decline_friend_request,
  } = useFriends();

  const [viewedProfile, setViewedProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  const [userPosts, setUserPosts] = useState<ProfilePost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;

      setLoading(true);

      try {
        const token = await getToken();

        const response = await fetch(
          `gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/users/profile/${username}/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load profile");
        }

        setViewedProfile(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, getToken]);

  useEffect(() => {
    const loadPosts = async () => {
      if (!username) return;

      setPostsLoading(true);
      setPostsError(null);

      try {
        const token = await getToken();

        const response = await fetch(
          `gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/users/${username}/posts/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load posts");
        }

        setUserPosts(data);
      } catch (error) {
        setPostsError(
          error instanceof Error ? error.message : "Something went wrong"
        );
      } finally {
        setPostsLoading(false);
      }
    };

    loadPosts();
  }, [username, getToken]);

  if (loading || !viewedProfile) {
    return <p>Loading profile...</p>;
  }

  const handleFavoriteGameClick = () => {
    const community = viewedProfile.favorite_game?.community;
    if (!community) return;

    navigate(
      `/community/${community.id}/${community.title
        .toLowerCase()
        .replace(/\s+/g, "-")}`
    );
  };

  const renderFriendshipAction = () => {
    const status = viewedProfile.friendship_status?.status;
    const isSender = viewedProfile.friendship_status?.is_sender;

    if (!status || status === "NOT_FRIENDS") {
      return (
        <button
          className="profile-action-btn"
          onClick={() => add_friend(viewedProfile.username)}
        >
          Add Friend
        </button>
      );
    }

    if (status === "PENDING" && isSender) {
      return (
        <button className="profile-action-btn" disabled>
          Request Sent
        </button>
      );
    }

    if (status === "PENDING" && !isSender) {
      return (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="profile-action-btn"
            onClick={() => accept_friend_request(viewedProfile.username)}
          >
            Accept Friend
          </button>
          <button
            className="profile-action-btn secondary"
            onClick={() => decline_friend_request(viewedProfile.username)}
          >
            Decline
          </button>
        </div>
      );
    }

    if (status === "ACCEPTED") {
      return (
        <button
          className="profile-action-btn danger"
          onClick={() => remove_friend(viewedProfile.username)}
        >
          Remove Friend
        </button>
      );
    }

    return (
      <button
        className="profile-action-btn"
        onClick={() => add_friend(viewedProfile.username)}
      >
        Add Friend
      </button>
    );
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        theme="light"
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="sider"
        width={160}
      >
        <Sidebar />
      </Sider>

      <Layout>
        <Content className="profile-container">
          <Card className="profile-header">
            <Avatar
              src={viewedProfile.profile_picture}
              className="profile-avatar"
            />
            <div className="user-info">
              <div className="profile-action-row">
                {renderFriendshipAction()}
              </div>

              <h2>{viewedProfile.username}</h2>
              <p>Main Platform: {viewedProfile.main_platform || "Not set"}</p>

              <div className="stats">
                <div className="stat-item">
                  <span className="stat-label">Weekly Hours</span>
                  <span className="stat-value">{viewedProfile.hours ?? 0}</span>
                </div>

                <div className="stat-item">
                  <span className="stat-label">Favorite Game</span>
                  <span
                    className="stat-value"
                    style={{
                      cursor: viewedProfile.favorite_game?.community
                        ? "pointer"
                        : "default",
                      textDecoration: viewedProfile.favorite_game?.community
                        ? "underline"
                        : "none",
                    }}
                    onClick={handleFavoriteGameClick}
                  >
                    {viewedProfile.favorite_game?.title || "None"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <div className="profile-panels">
            <Card className="panel">
              <h2 className="panel-title">Posts</h2>

              {postsLoading && (
                <p className="profile-posts-loading">Loading posts...</p>
              )}
              {postsError && (
                <p className="profile-posts-error">{postsError}</p>
              )}
              {!postsLoading && !postsError && userPosts.length === 0 && (
                <p className="profile-posts-empty">No posts yet.</p>
              )}

              {!postsLoading && !postsError && userPosts.length > 0 && (
                <div className="profile-posts-list">
                  {userPosts.map((post) => (
                    <div key={post.id} className="profile-post-card">
                      {post.subject && (
                        <p className="profile-post-subject">{post.subject}</p>
                      )}
                      <p className="profile-post-body">{post.body}</p>
                      <div className="profile-post-footer">
                        <span className="profile-post-time">
                          {new Date(post.creation).toLocaleString()}
                        </span>
                        <div className="profile-post-stats">
                          <span className="profile-post-stat">
                            ♥ {post.like_count ?? 0}
                          </span>
                          <span className="profile-post-stat">
                            👎 {post.dislike_count ?? 0}
                          </span>
                          <span className="profile-post-stat">
                            💬 {post.comment_count ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
