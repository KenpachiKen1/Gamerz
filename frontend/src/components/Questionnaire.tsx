import { useState } from "react";
import {
  Button,
  message,
  Steps,
  theme,
  Slider,
  Row,
  Col,
  InputNumber,
  Avatar,
  Card,
} from "antd";
import { useNavigate } from "react-router-dom";

import GamesDisplay from "../components/GamesDisplay";
import ProfilePics from "./ProfilePictures";
import { useAuth } from "../context/AuthContext";

type Level = {
  level: string;
  description: string;
  minHours: number;
  maxHours: number;
  color: string;
};

const Questionnaire = () => {
  const [hours, setHours] = useState<number>(1);
  const { token } = theme.useToken();
  const [current, setCurrent] = useState<number>(0);
  const [userPlatform, setUserPlatform] = useState<string | null>(null);
  const [games, setGames] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pic, setPic] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const navigate = useNavigate();

  const next = () => setCurrent((prev) => prev + 1);
  const prev = () => setCurrent((prev) => prev - 1);
  const { getToken } = useAuth();

  message.config({
    top: 100,
    duration: 2,
    maxCount: 1,
  });

  const levels: Level[] = [
    {
      level: "Novice",
      description: "Just picked up the controller yesterday",
      minHours: 1,
      maxHours: 5,
      color: "#A8E6CF",
    },
    {
      level: "Casual",
      description: "Games when Netflix is down.",
      minHours: 6,
      maxHours: 20,
      color: "#FFD3B6",
    },
    {
      level: "Dedicated",
      description: "Has more game achievements than friends",
      minHours: 21,
      maxHours: 50,
      color: "#FF8C94",
    },
    {
      level: "No Life Legend",
      description: "Go interact with nature",
      minHours: 51,
      maxHours: 168,
      color: "#FFD700",
    },
  ];

  const handleChange = (value: number | null) => {
    if (value !== null) setHours(value);
  };

  const getLevelByHours = (hrs: number) =>
    levels.find((level) => hrs >= level.minHours && hrs <= level.maxHours) ??
    levels[0];

  const currLevel = getLevelByHours(hours);

  const setUserInfo = async () => {
      try {
        const token =  await getToken()
      const response = await fetch(
        "http://127.0.0.1:8000/api/users/update_profile/",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            hours: hours,
            main_platform: userPlatform,
            profile_picture: pic,
          }),
        }
      );

      if (!response.ok) {
        setError("Failed to finish setting up user profile");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(message);
    }

    try {
      setError(null);
        setLoading(true);
        
        const token = await getToken();

      const response = await fetch(
        "http://127.0.0.1:8000/api/games/set_fav_game/",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ name: games }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to set your favorite game");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to set favorite game";
      setError(message);
    } finally {
      setLoading(false);
    }

    navigate("/home");
  };

  const Platforms = () => {
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(
      null
    );

    const platforms = [
      { name: "PC", color: "#FF6B35", emoji: "💻" },
      { name: "Nintendo", color: "#E60012", emoji: "🎮" },
      { name: "Xbox", color: "#107C10", emoji: "🎮" },
      { name: "Mobile", color: "#00D4FF", emoji: "📱" },
      { name: "Playstation", color: "#003791", emoji: "🎮" },
    ];

    const handlePlatformClick = (platform: string) => {
      setSelectedPlatform(selectedPlatform === platform ? null : platform);
      setUserPlatform(platform);
    };

    return (
      <>
        <h2
          style={{
            textAlign: "center",
            marginBottom: "32px",
            color: "#333",
            fontSize: "24px",
          }}
        >
          Choose your main gaming platform
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "16px",
            padding: "20px",
          }}
        >
          {platforms.map((platform) => (
            <Button
              key={platform.name}
              onClick={() => handlePlatformClick(platform.name)}
              style={{
                backgroundColor:
                  selectedPlatform === platform.name
                    ? platform.color
                    : "#f5f5f5",
                color: selectedPlatform === platform.name ? "white" : "#333",
                border:
                  selectedPlatform === platform.name
                    ? `3px solid ${platform.color}`
                    : "2px solid #ddd",
                fontWeight: "bold",
                fontSize: "16px",
                padding: "16px 24px",
                borderRadius: "12px",
                minWidth: "140px",
                height: "80px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow:
                  selectedPlatform === platform.name
                    ? `0 8px 20px ${platform.color}40`
                    : "0 2px 8px rgba(0,0,0,0.1)",
                transform:
                  selectedPlatform === platform.name
                    ? "translateY(-4px)"
                    : "none",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "24px" }}>{platform.emoji}</span>
              <span>{platform.name}</span>
            </Button>
          ))}
        </div>

        {selectedPlatform && (
          <div
            style={{
              textAlign: "center",
              marginTop: "24px",
              padding: "16px",
              backgroundColor: "#f0f8ff",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          >
            <p
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
                margin: 0,
              }}
            >
              Your main platform: {selectedPlatform}
            </p>
          </div>
        )}
      </>
    );
  };

  const sliderContent = () => (
    <>
      <h2 style={{ textAlign: "center" }}>
        About how many hours a week do you game?
      </h2>

      <div
        style={{
          fontSize: "18px",
          marginBottom: 24,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {levels.map((item, index) => (
          <span
            key={index}
            style={{
              backgroundColor:
                item.level === currLevel.level ? currLevel.color : "#f5f5f5",
              color: item.level === currLevel.level ? "#000" : "#666",
              padding: "8px 16px",
              borderRadius: "20px",
              fontWeight: item.level === currLevel.level ? "bold" : "normal",
              border:
                item.level === currLevel.level
                  ? "2px solid #333"
                  : "1px solid #ddd",
              whiteSpace: "nowrap",
              transition: "all 0.3s ease",
              boxShadow:
                item.level === currLevel.level
                  ? "0 2px 8px rgba(0,0,0,0.2)"
                  : "none",
            }}
          >
            {item.level}
          </span>
        ))}
      </div>

      <Row style={{ marginBottom: 32 }}>
        <Col span={15}>
          <Slider min={1} max={168} onChange={handleChange} value={hours} />
        </Col>
        <Col span={4}>
          <InputNumber
            min={1}
            max={168}
            style={{ margin: "0 16px" }}
            value={hours}
            onChange={handleChange}
          />
        </Col>
      </Row>

      <div
        style={{
          textAlign: "center",
          padding: "24px",
          backgroundColor: currLevel.color,
          borderRadius: "12px",
          border: "2px solid #333",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "12px",
            color: "#333",
          }}
        >
          🎮 {currLevel.level} Gamer 🎮
        </div>
        <div
          style={{
            fontSize: "16px",
            fontStyle: "italic",
            color: "#444",
            lineHeight: "1.4",
          }}
        >
          "{currLevel.description}"
        </div>
        <div
          style={{
            fontSize: "14px",
            marginTop: "8px",
            color: "#555",
            fontWeight: "500",
          }}
        >
          {hours} hour{hours !== 1 ? "s" : ""} per week
        </div>
      </div>
    </>
  );

  const confirmation = () => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <Card
          title={
            <span
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#333",
                textAlign: "center",
                display: "block",
              }}
            >
              Is this correct?
            </span>
          }
          hoverable
          style={{
            width: "100%",
            textAlign: "left",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            borderRadius: "16px",
            border: "2px solid #e8e8e8",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            Here are your details:
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div style={detailBoxStyle}>
              <span style={{ color: "#333", fontWeight: "500" }}>
                <strong>Gaming Hours:</strong> {hours} hours per week
              </span>
            </div>

            <div style={detailBoxStyle}>
              <span style={{ color: "#333", fontWeight: "500" }}>
                <strong>Main Platform:</strong> {userPlatform}
              </span>
            </div>

            <div style={detailBoxStyle}>
              <span style={{ color: "#333", fontWeight: "500" }}>
                <strong>Favorite Game:</strong> {games || "Not selected"}
              </span>
            </div>

            <div style={detailBoxStyle}>
              <span style={{ color: "#333", fontWeight: "500" }}>
                <strong>Profile Picture:</strong>{" "}
                {pic ? <Avatar src={pic} size="large" /> : "Not selected"}
              </span>
            </div>
          </div>
        </Card>

        <p style={{ color: "black" }}>You can edit this information later</p>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <Button
            size="large"
            onClick={() => setShowConfirmation(false)}
            danger
          >
            Cancel
          </Button>

          <Button
            size="large"
            type="primary"
            onClick={() => {
              void setUserInfo();
              setShowConfirmation(false);
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );

  const detailBoxStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
  };

  const steps = [
    {
      title: "Select Favorite Game",
      content: <GamesDisplay setGames={setGames} />,
    },
    { title: "Main Platform", content: <Platforms /> },
    { title: "Gaming Hours", content: sliderContent() },
    {
      title: "Choose your profile picture",
      content: <ProfilePics setPic={setPic} />,
    },
  ];

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  const contentStyle: React.CSSProperties = {
    lineHeight: "normal",
    textAlign: "left",
    color: token.colorText,
    backgroundColor: "white",
    borderRadius: token.borderRadiusLG,
    border: `1px solid ${token.colorBorder}`,
    marginTop: 16,
    minHeight: "300px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  };

  return (
    <>
      <div style={containerStyle}>
        <h3 style={{ textAlign: "center", color: "black" }}>
          Lets get to know you better
        </h3>

        <Steps
          current={current}
          items={items}
          style={{ marginBottom: "20px" }}
        />

        <div style={contentStyle}>{steps[current].content}</div>

        <div style={{ marginTop: 24 }}>
          {current < steps.length - 1 && (
            <Button type="primary" onClick={next}>
              Next
            </Button>
          )}

          {current === steps.length - 1 && (
            <Button type="primary" onClick={() => setShowConfirmation(true)}>
              Complete
            </Button>
          )}

          {current > 0 && (
            <Button style={{ margin: "0 8px" }} onClick={prev}>
              Previous
            </Button>
          )}
        </div>
      </div>

      {showConfirmation && confirmation()}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {loading && <p style={{ textAlign: "center" }}>Saving...</p>}
    </>
  );
};

export default Questionnaire;
