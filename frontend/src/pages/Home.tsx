import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import GameCard from "../components/GameCard";
import ClipCard from "../components/ClipCard";
import CommunityCard from "../components/CommunityCard";

import "../styles/home.css";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/ProfileContext";
import { Avatar, Modal, Input } from "antd";

const { TextArea } = Input;

type Community = {
  id: number;
  title: string;
  member_count?: number;
  game?: {
    id: number;
    title: string;
  };
};

export default function Home() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [postModal, setPostModal] = useState(false);
  const [postContent, setPostContent] = useState("");

  const { isAuthenticated, logout, getToken } = useAuth();
  const { profile, getProfile } = useAccount();
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  useEffect(() => {
    const fetchMyCommunities = async () => {
      try {
        const token = await getToken();

        const response = await fetch("http://127.0.0.1:8000/api/communities/", {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        });

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

  const posts = [
    {
      id: 1,
      user: "virgil25",
      content: "Check this clip!",
      videoUrl: "/videos/clip1.mp4",
    },
    { id: 2, user: "jalen16", content: "Looking for a squad" },
    { id: 3, user: "kenneth88", content: "yo there's a new update!" },
    { id: 4, user: "bryson09", content: "Anyone recommend any new games?" },
  ];

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

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-left">
          <h2 className="logo">Game Haven</h2>
          <input
            className="search"
            placeholder="Search games, players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
        <p>Join discussions, share clips, and meet other players.</p>
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
              <p>
                Pick up where you left off and jump back into the conversation.
              </p>
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
                    onClick={() =>
                      navigate(
                        `/community/${community.id}/${community.title
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`
                      )
                    }
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
              <button
                className="new-post-btn"
                onClick={() => setPostModal(true)}
              >
                + New Post
              </button>
            </div>

            <div className="feed">
              {posts.map((post) => (
                <div key={post.id} className="post">
                  <h4
                    className="username"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${post.user}`);
                    }}
                  >
                    @{post.user}
                  </h4>
                  <p>{post.content}</p>
                  {post.videoUrl && (
                    <video
                      className="post-video"
                      src={post.videoUrl}
                      controls
                      muted
                    />
                  )}
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
            <h2>Trending Communities</h2>
            <div className="card-row">
              <CommunityCard title="Community 1" />
              <CommunityCard title="Community 2" />
              <CommunityCard title="Community 3" />
            </div>
          </div>

          <div className="section-card">
            <h2>Popular Games</h2>
            <div className="card-row">
              <GameCard title="Game 1" />
              <GameCard title="Game 2" />
              <GameCard title="Game 3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
