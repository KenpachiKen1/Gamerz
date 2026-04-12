import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import GameCard from "../components/GameCard";
import ClipCard from "../components/ClipCard";
import CommunityCard from "../components/CommunityCard";

import "../styles/home.css";

export default function Home() {
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [search, setSearch] = useState("");

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.reload();
    };

    const communities = [
        { id: 1, name: "Call of Duty" },
        { id: 2, name: "Minecraft" },
        { id: 3, name: "Fortnite" },
    ];

    const posts = [
        { id: 1, user: "virgil25", content: "Check this clip!", hasClip: true },
        { id: 2, user: "jalen16", content: "Looking for squad", hasClip: false },
        { id: 3, user: "bryson09", content: "yo there's a new update!", hasClip: false },
        { id: 4, user: "kenneth88", content: "Look at this new skin!", hasClip: false },
        { id: 5, user: "kenneth88", content: "What's up", hasClip: false }
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
            title: "we in the bugs nest",
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
            title: "cuttin up in assetto",
            username: "jalen16",
            videoUrl: "/videos/clip6.mp4",
        },
    ];

    const visibleClips = clips.slice(currentIndex, currentIndex + 3);

    const next = () => {
        if (currentIndex + 3 < clips.length) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <div className="home-container">

            {/* Navbar */}
            <nav className="navbar">
                <h2 className="logo">Game Haven</h2>

                <input
                    className="search"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {isLoggedIn ? (
                    <button className="nav-btn" onClick={handleLogout}>
                        Logout
                    </button>
                ) : (
                    <button className="nav-btn" onClick={() => navigate("/login")}>
                        Login
                    </button>
                )}
            </nav>

            {/* Hero */}
            <section className="hero">
                <h2>Find Your Gaming Community</h2>
                <p>Join discussions, share clips, and meet other players.</p>
            </section>

            <div className="content-container">

                {/* Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-card">
                        <div className="sidebar-header">
                            <h2>Your Communities</h2>
                            <p>Pick up where you left off and jump back into the conversation.</p>
                        </div>

                        <div className="community-list">
                            {communities.map((c) => (
                                <button
                                    key={c.id}
                                    className="community-item"
                                    onClick={() => navigate(`/community/${c.id}`)}
                                >
                                    <span>{c.name}</span>
                                    <span className="community-action">Open</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Activity Feed */}
                <div className="activity-feed">
                    <div className="section-card">
                        <h2>Activity Feed</h2>

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

                                    {post.hasClip && (
                                        <div className="clip-placeholder">🎥 Clip</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="main-content">

                    {/* Featured Clips  */}
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

                    {/* Trending Communities */}
                    <div className="section-card">
                        <h2>Trending Communities</h2>
                        <div className="card-row">
                            <CommunityCard title="Community 1" />
                            <CommunityCard title="Community 2" />
                            <CommunityCard title="Community 3" />
                        </div>
                    </div>

                    {/* Popular Games */}
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