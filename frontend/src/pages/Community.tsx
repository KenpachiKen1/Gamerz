import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, Modal } from "antd";
import "../styles/community.css";
import { useCommunity } from "../context/CommunityContext";
import { useAuth } from "../context/AuthContext";

type FeedTab = "feed" | "clips" | "chat";
type PostFilter = "all" | "discussion" | "clip" | "news";

type ChatMessage = {
  id: number;
  author: string;
  message: string;
  created: string;
};

const MOCK_CLIPS = [
  {
    id: 1,
    title: "Clutch 1v4 ranked",
    username: "virgil25",
    videoUrl: "/videos/clip1.mp4",
  },
  {
    id: 2,
    title: "Worst death you'll see",
    username: "jalen16",
    videoUrl: "/videos/clip2.mp4",
  },
  {
    id: 3,
    title: "New meta strat",
    username: "kenneth88",
    videoUrl: "/videos/clip3.mp4",
  },
  {
    id: 4,
    title: "Bugs nest speed run",
    username: "bryson09",
    videoUrl: "/videos/clip4.mp4",
  },
  {
    id: 5,
    title: "Insane snipe across map",
    username: "mia_plays",
    videoUrl: "/videos/clip5.mp4",
  },
  {
    id: 6,
    title: "Squad wipe in 8 seconds",
    username: "virgil25",
    videoUrl: "/videos/clip6.mp4",
  },
];

const TEMP_ONLINE_MEMBERS = [
  { name: "virgil25", status: "online" },
  { name: "kenneth88", status: "online" },
  { name: "mia_plays", status: "online" },
];

const initials = (name: string) => name.slice(0, 2).toUpperCase();

export default function Community() {
  const {
    community,
    posts,
    loading,
    error,
    fetchCommunityPosts,
    createCommunityPost,
    likePost,
    dislikePost,
    deletePost,
  } = useCommunity();

  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { name, id } = useParams<{ name?: string; id?: string }>();

  const communityName =
    typeof community?.title === "string"
      ? community.title
      : name
      ? name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Community";

  const [activeTab, setActiveTab] = useState<FeedTab>("feed");
  const [filter, setFilter] = useState<PostFilter>("all");
  const [postContent, setPostContent] = useState("");
  const [postSubject, setPostSubject] = useState("");
  const [postType, setPostType] = useState<"discussion" | "clip" | "news">(
    "discussion"
  );
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [uploadModal, setUploadModal] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (id) {
      fetchCommunityPosts(Number(id));
    }
  }, [id, fetchCommunityPosts]);

  useEffect(() => {
    if (!id) return;

    let socket: WebSocket | null = null;

    const connectSocket = async () => {
      try {
        const token = String(await getToken());

        socket = new WebSocket(
          `ws://127.0.0.1:8000/ws/chat/${id}/?token=${encodeURIComponent(
            token
          )}`
        );

        socketRef.current = socket;

        socket.onopen = () => {
          console.log("WebSocket connected");
        };

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data) as ChatMessage;
          setMessages((prev) => [...prev, data]);
        };

        socket.onclose = () => {
          console.log("WebSocket closed");
        };

        socket.onerror = (event) => {
          console.log("WebSocket error:", event);
        };
      } catch (error) {
        console.error("Socket setup failed:", error);
      }
    };

    connectSocket();

    return () => {
      socket?.close();
    };
  }, [id, getToken]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!id) return null;

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;

    setIsSubmittingPost(true);

    const success = await createCommunityPost(
      Number(id),
      postSubject,
      postContent
    );

    if (success) {
      setPostContent("");
      setPostSubject("");
      setPostType("discussion");
    }

    setIsSubmittingPost(false);
  };

  const handleLike = async (postId: number) => {
    await likePost(postId);
    fetchCommunityPosts(Number(id));
  };

  const handleDislike = async (postId: number) => {
    await dislikePost(postId);
    fetchCommunityPosts(Number(id));
  };

  const handleDeletePost = async (postId: number) => {
    await deletePost(postId);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        body: chatInput,
      })
    );

    setChatInput("");
  };

  const filteredPosts =
    filter === "all"
      ? posts
      : posts.filter((post: any) => {
          const normalizedSubject = post.subject?.toLowerCase() || "";
          return normalizedSubject.includes(filter);
        });

  const isJoined = community?.joined_by_user === true;

  const renderMessages = () => (
    <>
      {messages.length === 0 && (
        <div className="chat-msg">
          <div className="chat-msg-body">
            <div className="chat-msg-text">
              Live chat will show here once your websocket is connected.
            </div>
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <div key={msg.id} className="chat-msg">
          <div className="chat-msg-avatar">{initials(msg.author)}</div>
          <div className="chat-msg-body">
            <div className="chat-msg-name">
              @{msg.author}
              <span
                style={{
                  color: "#334155",
                  fontWeight: 400,
                  marginLeft: 6,
                }}
              >
                {new Date(msg.created).toLocaleTimeString()}
              </span>
            </div>
            <div className="chat-msg-text">{msg.message}</div>
          </div>
        </div>
      ))}

      <div ref={chatEndRef} />
    </>
  );

  return (
    <div className="community-container">
      <div className="community-banner">
        <div className="banner-content">
          

          <div className="community-icon" style={{cursor: 'pointer'}} onClick={() => {navigate("/home")}}>🏠</div>

          <div className="banner-meta">
            <h1>{communityName}</h1>
            <p>Your hub for clips, strats, news, and squad-finding.</p>

            <div className="banner-stats">
              <span className="banner-stat">
                <span>
                  {typeof community?.member_count === "number"
                    ? community.member_count
                    : "--"}
                </span>
                {} members
              </span>
              <span className="banner-stat">
                <span>{TEMP_ONLINE_MEMBERS.length}</span> online now
              </span>
              <span className="banner-stat">
                <span>{posts.length}</span> posts
              </span>
            </div>
          </div>

          <div className="banner-actions">
            {isJoined ? (
              <button className="btn-joined" disabled>
                ✓ Joined
              </button>
            ) : (
              <button className="btn-join">Join Community</button>
            )}
          </div>
        </div>
      </div>

      <div className="community-tabs">
        {(["feed", "clips", "chat"] as const).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "feed" && "📋 Feed"}
            {tab === "clips" && "🎬 Clips"}
            {tab === "chat" && "💬 Live Chat"}
          </button>
        ))}
      </div>

      {activeTab === "feed" && (
        <div className="community-body">
          <aside className="community-sidebar">
            <div className="comm-card">
              <h3>About</h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#94a3b8",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                The official Game Haven community for {communityName}. Share
                clips, find squads, discuss strategies, and stay up-to-date on
                the latest news.
              </p>
            </div>

            <div className="comm-card">
              <h3>Community Rules</h3>
              <ul className="rules-list">
                <li>Be respectful to all members</li>
                <li>No spam or self-promotion</li>
                <li>Tag your posts correctly</li>
                <li>No spoilers without a warning</li>
                <li>Keep clips under 5 minutes</li>
              </ul>
            </div>

            <div className="comm-card">
              <h3>Online Now</h3>
              <div className="member-list">
                {TEMP_ONLINE_MEMBERS.map((member) => (
                  <div key={member.name} className="member-item">
                    <span
                      className={`member-dot ${
                        member.status === "away" ? "away" : ""
                      }`}
                    />
                    <span>{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="community-feed">
            <div className="create-post-box">
              <input
                className="create-post-input"
                placeholder="Post title..."
                value={postSubject}
                onChange={(e) => setPostSubject(e.target.value)}
                style={{ marginBottom: 12 }}
              />

              <textarea
                className="create-post-input"
                rows={3}
                placeholder={`Share something with the ${communityName} community...`}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />

              <div className="create-post-actions">
                <div className="post-type-btns">
                  {(["discussion", "clip", "news"] as const).map((type) => (
                    <button
                      key={type}
                      className={`post-type-btn ${
                        postType === type ? "active" : ""
                      }`}
                      onClick={() => setPostType(type)}
                    >
                      {type === "discussion" && "💬 Discussion"}
                      {type === "clip" && "🎬 Clip"}
                      {type === "news" && "📰 News"}
                    </button>
                  ))}

                  {postType === "clip" && (
                    <button
                      className="post-type-btn active"
                      onClick={() => setUploadModal(true)}
                    >
                      ⬆ Upload
                    </button>
                  )}
                </div>

                <button
                  className="btn-submit-post"
                  onClick={handleCreatePost}
                  disabled={!postContent.trim() || isSubmittingPost}
                >
                  {isSubmittingPost ? "Posting..." : "Post"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(["all", "discussion", "clip", "news"] as const).map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {loading && <div className="comm-card">Loading posts...</div>}
            {error && <div className="comm-card">Error: {error}</div>}

            {!loading && !error && filteredPosts.length === 0 && (
              <div className="comm-card">No posts yet.</div>
            )}

            {!loading &&
              !error &&
              filteredPosts.map((post: any) => (
                <div key={post.id} className="post-card">
                  <div className="post-card-header">
                    <div className="post-avatar">
                      <Avatar src={post.poster?.profile_picture} />
                    </div>

                    <div className="post-meta">
                      <div
                        className="post-username"
                        onClick={() =>
                          navigate(`/profile/${post.poster?.username}`)
                        }
                      >
                        @{post.poster?.username}
                      </div>
                      <div className="post-time">
                        {new Date(post.creation).toLocaleString()}
                      </div>
                    </div>

                    <span className="post-tag">{post.subject || "post"}</span>
                  </div>

                  <p className="post-content">{post.body}</p>

                  <div className="post-footer">
                    <button
                      className="post-action-btn"
                      onClick={() => handleLike(post.id)}
                    >
                      ♥ {post.like_count ?? post.likes?.length ?? 0}
                    </button>

                    <button
                      className="post-action-btn"
                      onClick={() => handleDislike(post.id)}
                    >
                      👎 {post.dislike_count ?? post.dislikes?.length ?? 0}
                    </button>

                    <button className="post-action-btn">
                      💬 {post.comment_count ?? 0}
                    </button>

                    <button
                      className="post-action-btn"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>

          <aside className="community-right">
            <div className="chat-card">
              <div className="chat-header">
                <h3>Live Chat</h3>
                <span className="chat-online">
                  {TEMP_ONLINE_MEMBERS.length} online
                </span>
              </div>

              <div className="chat-messages">{renderMessages()}</div>

              <div className="chat-input-row">
                <input
                  className="chat-input"
                  placeholder="Send a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                />
                <button className="chat-send-btn" onClick={handleSendChat}>
                  Send
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {activeTab === "clips" && (
        <div className="community-body">
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div className="comm-card" style={{ padding: "20px" }}>
              <h3>Upload a Clip</h3>
              <div className="upload-area" onClick={() => setUploadModal(true)}>
                <div className="upload-icon">🎬</div>
                <p>
                  <strong>Click to upload</strong> or drag and drop
                </p>
                <p style={{ marginTop: 4 }}>MP4, MOV up to 500MB</p>
              </div>
            </div>

            <div className="comm-card">
              <h3>Community Clips</h3>
              <div className="clips-grid">
                {MOCK_CLIPS.map((clip) => (
                  <div key={clip.id} className="clip-item">
                    <video src={clip.videoUrl} muted controls />
                    <div className="clip-item-meta">
                      <p className="clip-item-title">{clip.title}</p>
                      <p className="clip-item-user">@{clip.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "chat" && (
        <div className="community-body">
          <div style={{ flex: 1, maxWidth: 720 }}>
            <div className="chat-card" style={{ height: 560 }}>
              <div className="chat-header">
                <h3>Community Chat</h3>
                <span className="chat-online">
                  {TEMP_ONLINE_MEMBERS.length} online
                </span>
              </div>

              <div className="chat-messages">{renderMessages()}</div>

              <div className="chat-input-row">
                <input
                  className="chat-input"
                  placeholder="Type a message and press Enter..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                />
                <button className="chat-send-btn" onClick={handleSendChat}>
                  Send
                </button>
              </div>
            </div>
          </div>

          <aside className="community-right" style={{ position: "static" }}>
            <div className="comm-card">
              <h3>Online Now</h3>
              <div className="member-list">
                {TEMP_ONLINE_MEMBERS.map((member) => (
                  <div key={member.name} className="member-item">
                    <span
                      className={`member-dot ${
                        member.status === "away" ? "away" : ""
                      }`}
                    />
                    <span>{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}

      <Modal
        title="Upload a Clip"
        open={uploadModal}
        onCancel={() => setUploadModal(false)}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              className="filter-btn"
              onClick={() => setUploadModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn-submit-post"
              onClick={() => setUploadModal(false)}
            >
              Upload
            </button>
          </div>
        }
      >
        <div className="upload-area" style={{ marginBottom: 12 }}>
          <div className="upload-icon">🎬</div>
          <p>
            <strong>Click to select a file</strong>
          </p>
          <p style={{ marginTop: 4 }}>MP4, MOV up to 500MB</p>
          <input type="file" accept="video/*" style={{ display: "none" }} />
        </div>

        <input
          className="create-post-input"
          placeholder="Add a title for your clip..."
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            boxSizing: "border-box",
          }}
        />
      </Modal>
    </div>
  );
}
