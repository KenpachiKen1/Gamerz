import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "antd";
import "../styles/searchResults.css";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/ProfileContext";
import { useGames } from "../context/GameContext";

export default function SearchResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated } = useAuth();
  const { profile, getProfile } = useAccount();
  const {
    searchResults,
    loading,
    error,
    searchGames,
    followGame,
    setFavoriteGame,
  } = useGames();

  const query = new URLSearchParams(location.search).get("query") || "";
  const [busyGame, setBusyGame] = useState<string | null>(null);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  useEffect(() => {
    searchGames(query);
  }, [query, searchGames]);

  const handleFollow = async (name: string) => {
    setBusyGame(name);
    const success = await followGame(name);
    setBusyGame(null);

    if (success) {
      navigate("/home");
    }
  };

  const handleFavorite = async (name: string) => {
    setBusyGame(name);
    const success = await setFavoriteGame(name);
    setBusyGame(null);

    if (success) {
      navigate("/home");
    }
  };

  return (
    <div className="search-page">
      <nav className="search-nav">
        <div className="search-nav-left">
          <h2 className="logo" onClick={() => navigate("/home")}>
            Game Haven
          </h2>
        </div>

        <div className="search-nav-center">
          <p className="search-query-label">
            Results for <span>"{query}"</span>
          </p>
        </div>

        <div className="search-nav-right">
          <Avatar
            size={{ xs: 24, sm: 32, md: 36 }}
            src={profile?.profile_picture}
            onClick={() => navigate("/profile")}
          />
          {isAuthenticated && (
            <button className="nav-btn" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </nav>

      <div className="search-results-wrapper">
        <div className="search-results-header">
          <h1>Game Results</h1>
          <p>Join a community or set it as your favorite.</p>
        </div>

        {loading && (
          <div className="search-state-card loading">Searching games...</div>
        )}
        {error && <div className="search-state-card error">{error}</div>}

        {!loading && !error && searchResults.length === 0 && (
          <div className="search-state-card">
            No games found for <strong>{query}</strong>.
          </div>
        )}

        {!loading && !error && searchResults.length > 0 && (
          <div className="results-grid">
            {searchResults.map((game) => (
              <div key={game.id} className="game-result-card">
                <div className="game-result-image-wrap">
                  {game.cover ? (
                    <img
                      src={
                        game.cover.startsWith("//")
                          ? `https:${game.cover}`
                          : game.cover
                      }
                      alt={game.name}
                      className="game-result-image"
                    />
                  ) : (
                    <div className="game-result-placeholder">No Image</div>
                  )}
                </div>

                <div className="game-result-content">
                  <h3>{game.name}</h3>

                  {game.release_date && (
                    <p className="game-result-date">
                      Released: {game.release_date}
                    </p>
                  )}

                  {game.platforms?.length > 0 && (
                    <p className="game-result-platforms">
                      {game.platforms.join(" • ")}
                    </p>
                  )}

                  <p className="game-result-summary">
                    {game.summary || "No description available."}
                  </p>

                  <div className="game-result-actions">
                    <button
                      className="follow-game-btn"
                      onClick={() => handleFollow(game.name)}
                      disabled={busyGame === game.name}
                    >
                      {busyGame === game.name ? "Working..." : "Join Community"}
                    </button>

                    <button
                      className="favorite-game-btn"
                      onClick={() => handleFavorite(game.name)}
                      disabled={busyGame === game.name}
                    >
                      {busyGame === game.name
                        ? "Working..."
                        : "Set as Favorite"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
