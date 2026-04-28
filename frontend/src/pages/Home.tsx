import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ClipCard from "../components/ClipCard";
import "../styles/home.css";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/ProfileContext";

import { Avatar, Modal, Input } from "antd";

const { TextArea } = Input;

type Community = {
  id: number;
  title: string;
  member_count?: number;
  joined_by_user?: boolean;
  image?: string | null;
  game?: {
    id: number;
    title: string;
    game_image: string;
  };
};

type FeedPost = {
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

export default function Home() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [postModal, setPostModal] = useState(false);
  const [postContent, setPostContent] = useState("");

  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [trendingCommunities, setTrendingCommunities] = useState<Community[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);

  const { isAuthenticated, logout, getToken } = useAuth();
  const { profile, getProfile } = useAccount();

  useEffect(() => {
    if (!profile) {
      getProfile();
    }
  }, [profile, getProfile]);

  useEffect(() => {
    const fetchMyCommunities = async () => {
      try {
        const token = await getToken();

        const response = await fetch(
          "https://gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/communities/",
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch communities");
        }

        setMyCommunities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchMyCommunities();
  }, [getToken]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setFeedLoading(true);
        setFeedError(null);

        const token = await getToken();

        const response = await fetch(
          "https://gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/feed/",
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load feed");
        }

        setFeedPosts(data);
      } catch (err) {
        setFeedError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setFeedLoading(false);
      }
    };

    fetchFeed();
  }, [getToken]);

  useEffect(() => {
    const fetchTrendingCommunities = async () => {
      try {
        const token = await getToken();

        const response = await fetch(
          "https://gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/communities/trending/",
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load trending communities");
        }

        setTrendingCommunities(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTrendingCommunities();
  }, [getToken]);

  const handleLogout = async () => {
    await logout();
  };

  const handleClick = () => {
    navigate("/profile");
  };

  const handlePost = () => {
    setPostContent("");
    setPostModal(false);
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    if (!search.trim()) return;

    navigate(`/search?query=${encodeURIComponent(search.trim())}`);
  };

  const clips = [
    {
      id: 1,
      title: "bf6 night vision",
      username: "virgil25",
      videoUrl: "/videos/clip1.mp4",
    },
    {
      id: 2,
      title: "worst doom player",
      username: "virgil25",
      videoUrl: "/videos/clip2.mp4",
    },
    {
      id: 3,
      title: "When bro calling you on dc but you're locking in",
      username: "kenneth88",
      videoUrl: "/videos/clip3.mp4",
    },
    {
      id: 4,
      title: "In the bugs nest",
      username: "bryson09",
      videoUrl: "/videos/clip4.mp4",
    },
    {
      id: 5,
      title: "A380 landing",
      username: "virgil25",
      videoUrl: "/videos/clip5.mp4",
    },
    {
      id: 6,
      title: "cutting up in assetto",
      username: "jalen16",
      videoUrl: "/videos/clip6.mp4",
    },
  ];

  const visibleClips = clips.slice(currentIndex, currentIndex + 3);

  const next = () => {
    if (currentIndex + 3 < clips.length) setCurrentIndex(currentIndex + 1);
  };

  const prev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const openCommunity = (community: Community) => {
    navigate(
      `/community/${community.id}/${community.title
        .toLowerCase()
        .replace(/\s+/g, "-")}`
    );
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-left">
          <h2 className="logo">Game Haven</h2>
          <form onSubmit={handleSearch}>
            <input
              className="search"
              placeholder="Search games, players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        <div className="nav-center">
          <p className="welcome-text">
            Welcome back, <span>{profile?.username}</span>
          </p>
        </div>

        <div className="nav-right">
          <Avatar
            size={{ xs: 24, sm: 32, md: 36 }}
            src={profile?.profile_picture}
            onClick={handleClick}
          />
          {isAuthenticated ? (
            <button
              className="nav-btn"
              style={{ color: "white" }}
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <button className="nav-btn" onClick={() => navigate("/login")}>
              Login
            </button>
          )}
        </div>
      </nav>

      <section className="hero">
        <h2>Find Your Gaming Community</h2>
      </section>

      <Modal
        title="Create a Post"
        open={postModal}
        onCancel={() => setPostModal(false)}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button className="nav-btn" onClick={() => setPostModal(false)}>
              Cancel
            </button>
            <button
              className="nav-btn new-post-btn"
              onClick={handlePost}
              disabled={!postContent.trim()}
            >
              Post
            </button>
          </div>
        }
      >
        <TextArea
          rows={4}
          placeholder="What's on your mind?"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          className="post-textarea"
        />
      </Modal>

      <div className="content-container">
        <aside className="sidebar">
          <div className="sidebar-card">
            <div className="sidebar-header">
              <h2>Your Communities</h2>
              
            </div>

            <div className="community-list">
              {loading && <p>Loading communities...</p>}
              {error && <p>{error}</p>}

              {!loading && !error && myCommunities.length === 0 && (
                <p>You haven’t joined any communities yet.</p>
              )}

              {!loading &&
                !error &&
                myCommunities.map((community) => (
                  <button
                    key={community.id}
                    className="community-item"
                    onClick={() => openCommunity(community)}
                  >
                    <span>{community.title}</span>
                    <span className="community-action">Open</span>
                  </button>
                ))}
            </div>
          </div>
        </aside>

        <div className="activity-feed">
          <div className="section-card">
            <div className="section-header">
              <h2>Activity Feed</h2>
            </div>

            <div className="feed">
              {feedLoading && <p>Loading feed...</p>}
              {feedError && <p>{feedError}</p>}
              {!feedLoading && !feedError && feedPosts.length === 0 && (
                <p>No activity yet.</p>
              )}

              {!feedLoading &&
                !feedError &&
                feedPosts.map((post) => (
                  <div key={post.id} className="post">
                    <h4
                      className="username"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${post.poster.username}`);
                      }}
                    >
                      @{post.poster.username}
                    </h4>

                    {post.subject && (
                      <p>
                        <strong>{post.subject}</strong>
                      </p>
                    )}
                    <p>{post.body}</p>
                    <small>{new Date(post.creation).toLocaleString()}</small>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="section-card">
            <div className="section-header">
              <h2>Featured Clips</h2>
              <div className="carousel-controls">
                <button onClick={prev}>◀</button>
                <button onClick={next}>▶</button>
              </div>
            </div>
            <div className="carousel">
              {visibleClips.map((clip) => (
                <ClipCard
                  key={clip.id}
                  title={clip.title}
                  username={clip.username}
                  videoUrl={clip.videoUrl}
                />
              ))}
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <h2>Top Communities</h2>
            </div>
            <div className="trending-scroll">
              {trendingCommunities.map((community) => (
                <div
                  key={community.id}
                  className="trending-card"
                  onClick={() => openCommunity(community)}
                >
                  <div className="trending-card-image">
                    {community.game?.game_image ? (
                      <img
                        src={
                          community.game.game_image.startsWith("//")
                            ? `https:${community.game.game_image}`
                            : community.game.game_image
                        }
                        alt={community.title}
                      />
                    ) : (
                      <div className="trending-card-placeholder">
                        {community.title.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="trending-card-body">
                    <p className="trending-card-title">{community.title}</p>
                    <p className="trending-card-members">
                      {community.member_count ?? 0} followers
                    </p>

                    <div className="trending-card-footer">
                      <button
                        className={
                          community.joined_by_user
                            ? "community-status-btn joined"
                            : "community-status-btn join"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          openCommunity(community);
                        }}
                      >
                        {community.joined_by_user ? "Joined" : "Enter"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
