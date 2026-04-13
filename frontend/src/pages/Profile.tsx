// src/pages/Profile.tsx


{ /* FIREBASE INTEGRATION
    // src/pages/Profile.tsx

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import ClipCard from "../components/ClipCard";
import "../styles/profile.css";

export default function Profile() {
    const { username } = useParams();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch("http://localhost:8000/users/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch profile");
                }

                const data = await res.json();
                setUser(data);

            } catch (err) {
                setError("Could not load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <p style={{ color: "white" }}>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div className="profile-container">

            
            <div className="profile-header">
                <div className="avatar" />

                <div className="user-info">
                    <h2>@{user.username}</h2>
                    <p>{user.first_name} {user.last_name}</p>

                    <div className="stats">
                        <span>🎮 {user.favorite_game}</span>
                        <span>💻 {user.main_platform}</span>
                        <span>⏱ {user.hours} hrs</span>
                    </div>
                </div>
            </div>

            
            <div className="profile-section">
                <h2>Clips</h2>

                <div className="clip-grid">
                    {/* Replace with backend later *
                    <ClipCard title="Clip 1" username={user.username} />
                    <ClipCard title="Clip 2" username={user.username} />
                    <ClipCard title="Clip 3" username={user.username} />
                </div>
            </div>
        </div>
    );
}*/}



import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import ClipCard from "../components/ClipCard";
import "../styles/profile.css";

export default function Profile() {
    const { username } = useParams();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TEMP (replace with backend later)
        setTimeout(() => {
            setUser({
                username,
                hours: 120,
                favorite_game: "Call of Duty",
                main_platform: "PC",
                bio: "FPS player | Sniper main",
            });
            setLoading(false);
        }, 500);
    }, [username]);

    const clips = [
        { id: 1, title: "Crazy clutch", username },
        { id: 2, title: "1v3 win", username },
        { id: 3, title: "Insane flick", username },
    ];

    if (loading) return <p>Loading...</p>;

    return (
        <div className="profile-container">

            {/* Header */}
            <div className="profile-header">
                <div className="avatar" />

                <div className="user-info">
                    <h2>@{user.username}</h2>
                    <p>{user.bio}</p>

                    <div className="stats">
                        <span>🎮 {user.favorite_game}</span>
                        <span>💻 {user.main_platform}</span>
                        <span>⏱ {user.hours} hrs</span>
                    </div>
                </div>
            </div>

            {/* Clips */}
            <div className="profile-section">
                <h2>Clips</h2>

                <div className="clip-grid">
                    {clips.map((clip) => (
                        <ClipCard
                            key={clip.id}
                            title={clip.title}
                            username={clip.username}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}