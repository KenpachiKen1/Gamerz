import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import GameCard from "../components/GameCard";
import ClipCard from "../components/ClipCard";
import CommunityCard from "../components/CommunityCard";
import ActivityCard from "../components/ActivityCard";
import "../styles/home.css";

export default function Home() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.reload();
    };

    return (
        <div className="home-container">
            {/* Navbar */}
            <nav className="navbar">
                <h2 className="logo">Game Haven</h2>

                <input className="search" placeholder="Search games..." />

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

                {/* Activity Feed */}
                <section className="activitySection">
                    <h2>Activity Feed</h2>
                    <div className="card-row">
                        <ActivityCard title="Clip 1" />
                        <ActivityCard title="Clip 2" />
                        <ActivityCard title="Clip 3" />
                    </div>
                </section>

                {/* Clips */}
                <section className="section">
                    <h2>Featured Clips</h2>
                    <div className="card-row">
                        <ClipCard title="Clip 1" />
                        <ClipCard title="Clip 2" />
                        <ClipCard title="Clip 3" />
                    </div>
                </section>

                {/* Communities */}
                <section className="section">
                    <h2>Trending Communities</h2>
                    <div className="card-row">
                        <CommunityCard title="Community 1" />
                        <CommunityCard title="Community 2" />
                        <CommunityCard title="Community 3" />
                    </div>
                </section>

                {/* Games */}
                <section className="section">
                    <h2>Popular Games</h2>
                    <div className="card-row">
                        <GameCard title="Game 1" />
                        <GameCard title="Game 2" />
                        <GameCard title="Game 3" />
                    </div>
                </section>
            </div>
        </div>
    );
}
