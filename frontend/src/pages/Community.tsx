import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/community.css";

type CommunityType = {
    slug: string;
    name: string;
    description: string;
    members: string[];
};

type PostType = {
    id: number;
    user: string;
    content: string;
};

export default function Community() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Centralized community data (slug-based)
    const communities: CommunityType[] = [
        {
            slug: "call-of-duty",
            name: "Call of Duty",
            description: "FPS community",
            members: ["virgil25", "jalen16", "bryson09", "kenneth88"],
        },
        {
            slug: "minecraft",
            name: "Minecraft",
            description: "Creative builders",
            members: ["builder01", "steve22"],
        },
        {
            slug: "fortnite",
            name: "Fortnite",
            description: "Battle royale players",
            members: ["pro99", "sweatgod"],
        },
    ];

    // Find community by slug
    const community = communities.find((c) => c.slug === id);

    const [joined, setJoined] = useState(false);

    // Post system (local for now, Firebase later)
    const [posts, setPosts] = useState<PostType[]>([
        { id: 1, user: "virgil25", content: "Anyone running ranked?" },
        { id: 2, user: "jalen16", content: "New meta is crazy" },
    ]);

    const [newPost, setNewPost] = useState("");

    const handlePost = () => {
        if (!newPost.trim()) return;

        const post: PostType = {
            id: Date.now(),
            user: "currentUser", // replace with auth user later
            content: newPost,
        };

        setPosts([post, ...posts]);
        setNewPost("");
    };

    if (!community) {
        return (
            <div style={{ padding: "20px", color: "white" }}>
                <h1>Community not found</h1>
            </div>
        );
    }

    return (
        <div className="community-container">

            {/* Header */}
            <div className="community-header">
                <div>
                    <h1>{community.name}</h1>
                    <p>{community.description}</p>
                </div>

                <button
                    className={`join-btn ${joined ? "joined" : ""}`}
                    onClick={() => setJoined(!joined)}
                >
                    {joined ? "Joined ✓" : "Join"}
                </button>
            </div>

            <div className="community-content">

                {/* Posts Feed */}
                <div className="posts-section">
                    <h2>Posts</h2>

                    {/* Input */}
                    <div className="post-input">
                        <input
                            placeholder="Share something..."
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                        />
                        <button onClick={handlePost}>Post</button>
                    </div>

                    {/* Posts */}
                    {posts.map((post) => (
                        <div key={post.id} className="post">
                            <h4
                                className="username"
                                onClick={() => navigate(`/profile/${post.user}`)}
                            >
                                @{post.user}
                            </h4>
                            <p>{post.content}</p>
                        </div>
                    ))}
                </div>

                {/* Members List */}
                <div className="members-section">
                    <h2>Members</h2>

                    {community.members.map((member, index) => (
                        <div
                            key={index}
                            className="member"
                            onClick={() => navigate(`/profile/${member}`)}
                        >
                            @{member}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}