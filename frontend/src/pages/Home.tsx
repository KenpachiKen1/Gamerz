// src/pages/Home.tsx

import GameCard from "../components/GameCard";
import ClipCard from "../components/ClipCard";
import CommunityCard from "../components/CommunityCard";


export default function Home() {
    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            
            {/* Navbar */}
            <nav style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>Game Haven</h2>
                <input placeholder="Search games..." />
                <button>Login</button>
            </nav>

            {/* Hero Section */}
            <section style={{ marginTop: "40px" }}>
                <h2>Find Your Gaming Community</h2>
                <p>Join discussions, share clips, and meet other players.</p>
            </section>

            {/* Game Grid */}
            <section style={{ marginTop: "40px" }}>
                <h2>Popular Games</h2>

                <div style={{ display: "flex", gap: "20px" }}>
                    <GameCard title="Game 1" />
                    <GameCard title="Game 2" />
                    <GameCard title="Game 3" />
                </div>
            </section>

            { /* Clips Grid */ }
            <section style={{ marginTop: "40px" }}>
                <h2>Featured Clips</h2>

                <div style={{ display: "flex", gap: "20px" }}>
                    <ClipCard title="Clip 1" />
                    <ClipCard title="Clip 2" />
                    <ClipCard title="Clip 3" />

                </div>
            </section>

            { /* Communities  Grid */ }
            <section style={{ marginTop: "40px" }}>
                <h2>Trending Communities</h2>
                
                <div style={{ display: "flex", gap: "20px" }}>
                    <CommunityCard title="Community 1" />
                    <CommunityCard title="Community 2" />
                    <CommunityCard title="Community 3" />

                </div>

            </section>
        </div>
    );
}