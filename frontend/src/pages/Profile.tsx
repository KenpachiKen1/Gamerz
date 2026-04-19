import { useEffect, useState } from "react";
import { Avatar, Card, Layout } from "antd";
import Sider from "antd/es/layout/Sider";

import { useAccount } from "../context/ProfileContext";
import Wishlist from "../components/Wishlist";
import Friends from "../components/Friends";
import "../styles/profile.css";
import Sidebar from "../components/sidebar";

const { Content } = Layout;

type ProfileType = {
  username: string;
  wishlist_name: string | null;
  profile_photo?: string | null;
  profile_picture?: string | null;
  main_platform?: string | null;
  avg_hours_week?: number | null;
  hours?: number | null;
  favorite_game?: {
    id?: number;
    name?: string;
    title?: string;
  } | null;
};

const Profile = () => {
  const [collapsed] = useState<boolean>(false);
  const { profile, getProfile } = useAccount();

  useEffect(() => {
    if (!profile) {
      getProfile();
    }
  }, [profile, getProfile]);

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  const typedProfile = profile as ProfileType;

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
              src={typedProfile.profile_picture}
              className="profile-avatar"
            />
            <div className="user-info">
              <h2>{typedProfile.username}</h2>
              <p>Main Platform: {typedProfile.main_platform || "Not set"}</p>
              <p>Bio: Lorem ipsum</p>

              <div className="stats">
                <div className="stat-item">
                  <span className="stat-label">Weekly Hours</span>
                  <span className="stat-value">{typedProfile.hours ?? 0}</span>
                </div>

<<<<<<< HEAD
            
            <div className="profile-section">
                <h2>Clips</h2>

                <div className="clip-grid">
                    {/* Replace with backend later *
                    <ClipCard title="Clip 1" username={user.username} />
                    <ClipCard title="Clip 2" username={user.username} />
                    <ClipCard title="Clip 3" username={user.username} />
=======
                <div className="stat-item">
                  <span className="stat-label">Favorite Game</span>
                  <span className="stat-value">
                    {typedProfile.favorite_game?.title || "None"}
                  </span>
>>>>>>> kenneth
                </div>
              </div>
            </div>
          </Card>

          <div className="profile-panels">
            <Card className="panel">
              <h2 className="panel-title">Wishlist</h2>
              <Wishlist Profile={typedProfile} />
            </Card>

            <Card className="panel">
              <h2 className="panel-title">Friends</h2>
              <Friends Profile={typedProfile} />
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

<<<<<<< HEAD
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
=======
export default Profile;
>>>>>>> kenneth
