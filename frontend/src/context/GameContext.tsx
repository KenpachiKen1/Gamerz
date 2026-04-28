import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

type GameSearchResult = {
  id: number;
  name: string;
  cover: string | null;
  release_date: string | null;
  summary: string | null;
  platforms: string[];
};

type FollowedGame = Record<string, any>;

type GameContextType = {
  searchResults: GameSearchResult[];
  followedGames: FollowedGame[];
  favoriteGame: FollowedGame | null;
  loading: boolean;
  error: string | null;
  searchGames: (query: string) => Promise<void>;
  followGame: (name: string) => Promise<boolean>;
  unfollowGame: (name: string) => Promise<boolean>;
  showFollowedGames: () => Promise<void>;
  setFavoriteGame: (name: string) => Promise<boolean>;
  getFavoriteGame: () => Promise<void>;
  clearGameState: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  const [searchResults, setSearchResults] = useState<GameSearchResult[]>([]);
  const [followedGames, setFollowedGames] = useState<FollowedGame[]>([]);
  const [favoriteGame, setFavoriteGameState] = useState<FollowedGame | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchGames = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await getToken();

        const response = await fetch(
          "gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/games/game_search/",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ game: query }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to search games");
        }

        setSearchResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  const followGame = useCallback(
    async (name: string) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();

        const response = await fetch(
          "gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/games/follow_game/",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to follow game");
        }

        await showFollowedGames();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  const unfollowGame = useCallback(
    async (name: string) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();

        const response = await fetch(
          "gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/games/unfollow_game/",
          {
            method: "DELETE",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to unfollow game");
        }

        await showFollowedGames();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  const showFollowedGames = useCallback(async () => {
    setError(null);

    try {
      const token = await getToken();

      const response = await fetch(
        "gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/games/show_followed_games/",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load followed games");
      }

      setFollowedGames(data.followed_games || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }, [getToken]);

  const setFavoriteGame = useCallback(
    async (name: string) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();

        const response = await fetch(
          "gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/games/set_fav_game/",
          {
            method: "PATCH",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to set favorite game");
        }

        await getFavoriteGame();
        await showFollowedGames();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getToken, showFollowedGames]
  );

  const getFavoriteGame = useCallback(async () => {
    setError(null);

    try {
      const token = await getToken();

      const response = await fetch(
        "gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/games/get_fav_game/",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setFavoriteGameState(null);
          return;
        }
        throw new Error(data.error || "Failed to load favorite game");
      }

      setFavoriteGameState(data.details || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }, [getToken]);

  const clearGameState = () => {
    setSearchResults([]);
    setFollowedGames([]);
    setFavoriteGameState(null);
    setError(null);
  };

  return (
    <GameContext.Provider
      value={{
        searchResults,
        followedGames,
        favoriteGame,
        loading,
        error,
        searchGames,
        followGame,
        unfollowGame,
        showFollowedGames,
        setFavoriteGame,
        getFavoriteGame,
        clearGameState,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGames() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGames must be used inside a GameProvider");
  }

  return context;
}
