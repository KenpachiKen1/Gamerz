import { useState } from "react";
import { Button, Input } from "antd";

type GameResult = {
  id: number
  name: string;
  cover: string | null;
  release_date: string | null;
  platforms: string[] | string | null;
  summary: string | null;
};

type DisplayGame = {
  id: number
  title: string;
  image: string | null;
  release: string | null;
  platforms: string[] | string | null;
  summary: string;
};

type GamesDisplayProps = {
  setGames: React.Dispatch<React.SetStateAction<string | null>>;
};

import { useAuth } from "../context/AuthContext";



function GamesDisplay({ setGames }: GamesDisplayProps) {

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [gameList, setGameList] = useState<GameResult[] | null>(null);
  const [input, setInput] = useState<string | null>(null);
  const [option, setOption] = useState<string | null>(null);
    
   const { getToken } = useAuth();

  const getGameList = async (game: string) => {
    try {
      setError(null);
        setLoading(true);
        
        const token = await getToken()

      const response = await fetch(
        "http://127.0.0.1:8000/api/games/game_search/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ game }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to find game list");
      }

      const data: GameResult[] = await response.json();
      setGameList(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load games";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const searchResults: DisplayGame[] =
    gameList?.map((game) => ({
      id: game.id,
      title: game.name,
      image: game.cover,
      release: game.release_date,
      platforms: game.platforms,
      summary: game.summary ?? "",
    })) || [];

  const maxLength = 150;

  return (
    <div>
      <Input.Search
        required
        placeholder="Search"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onSearch={() => {
          getGameList(search);
          setInput(search);
          setSearch("");
        }}
        styles={{
          input: {
            backgroundColor: "white",
            color: "#333",
          },
        }}
      />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {gameList && (
        <div
          style={{
            maxHeight: "500px",
            overflowY: "auto",
            paddingRight: "10px",
          }}
        >
          {searchResults.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
                marginBottom: "20px",
                padding: "16px",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  width: "100%",
                }}
              >
                <div style={{ flex: 1, paddingRight: "20px" }}>
                  <Button
                    style={{
                      transition: "all 0.3s ease",
                      border: "1px solid #d9d9d9",
                      borderRadius: "6px",
                      backgroundColor:
                        option === item.title ? "green" : "white",
                      color: option === item.title ? "white" : "black",
                      marginBottom: "8px",
                    }}
                    onClick={() => {
                      setGames(item.title);
                      setOption(item.title);
                    }}
                  >
                    {item.title}
                  </Button>

                  <h4>Release date: {item.release ?? "Unknown"}</h4>

                  <h3>
                    Platforms:{" "}
                    {Array.isArray(item.platforms)
                      ? item.platforms.join(", ")
                      : item.platforms ?? "Unknown"}
                  </h3>

                  {item.summary ? (
                    item.summary.length > maxLength ? (
                      <h5>
                        Summary: {item.summary.slice(0, maxLength) + "..."}
                      </h5>
                    ) : (
                      <h5>Summary: {item.summary}</h5>
                    )
                  ) : null}
                </div>

                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: "30%",
                      objectFit: "cover",
                      alignSelf: "flex-start",
                      marginLeft: "auto",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                ) : null}
              </div>
            </div>
          ))}

          <div style={{ marginTop: "20px", fontSize: "16px" }}>
            Results for: <b>{input}</b>
          </div>
        </div>
      )}
    </div>
  );
}

export default GamesDisplay;
