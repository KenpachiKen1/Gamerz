import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/community.css";

type CommunityType = {
    name: string;
    description: string;
    members: string[];
};

export default function Community() {
    const { id } = useParams();
    const navigate = useNavigate();

    const communityMap: Record<string, CommunityType> = {
        "call-of-duty": {
            name: "Call of Duty",
            description: "FPS community",
            members: ["virgil25", "jalen16", "bryson09"],
        },
        minecraft: {
            name: "Minecraft",
            description: "Creative builders",
            members: ["builder01", "steve22"],
        },
        fortnite: {
            name: "Fortnite",
            description: "Battle royale players",
            members: ["pro99", "sweatgod"],
        },
    };

    const community = communityMap[id || ""];

    const [joined, setJoined] = useState(false);

    const posts = [
        { id: 1, user: "virgil25", content: "Anyone running ranked?" },
        { id: 2, user: "jalen16", content: "New meta is crazy" },
    ];

    if (!community) {
        return <h1 style={{ color: "white" }}>Community not found</h1>;
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
                    className="join-btn"
                    onClick={() => setJoined(!joined)}
                >
                    {joined ? "Joined ✓" : "Join"}
                </button>
            </div>

            <div className="community-content">

                {/* Posts Feed */}
                <div className="posts-section">
                    <h2>Posts</h2>

                    <div className="post-input">
                        <input placeholder="Share something..." />
                        <button>Post</button>
                    </div>

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