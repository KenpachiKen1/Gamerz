import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

type Profile = Record<string, any> | null;
type Game = Record<string, any>;

type UserContextType = {
  profile: Profile;
  userGames: Game[] | null;
  error: string | null;
  getProfile: () => Promise<void>;
  create_wishlist: (name: string) => Promise<void>;
  add_to_wishlist: (game: string) => Promise<void>;
  show_wishlist: () => Promise<void>;
  delete_wishlist: () => Promise<void>;
  remove_from_wishlist: (title: string) => Promise<void>;
};

const userContext = createContext<UserContextType | null>(null);

type UserProviderProps = {
  children: ReactNode;
};

export function UserProvider({ children }: UserProviderProps) {
  const { getToken, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [userGames, setUserGames] = useState<Game[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null);
      setUserGames(null);
      setError(null);
    }
  }, [isAuthenticated]);

  const getProfile = useCallback(async (): Promise<void> => {
    const token = await getToken();
    setError(null);

    try {
      const response = await fetch(
        "https://gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/users/profile/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        setError("Could not load profile");
        return;
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error happened.";
      setError(message);
      throw err;
    }
  }, [getToken]);

  const show_wishlist = useCallback(async (): Promise<void> => {
    const token = await getToken();
    setError(null);

    try {
      const response = await fetch(
        "https://gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/wishlists/show_wishlist",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();
      setUserGames(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error happened.";
      setError(message);
      throw err;
    }
  }, [getToken]);

  const create_wishlist = useCallback(
    async (name: string): Promise<void> => {
      setError(null);
      const token = await getToken();

      try {
        const response = await fetch(
          "https://gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/wishlists/create_wishlist/",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ wishlist_name: name }),
          }
        );

        if (!response.ok) {
          setError("couldn't create wishlist");
          return;
        }

        await response.json();
        await getProfile();
        setUserGames(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error happened.";
        setError(message);
        throw err;
      }
    },
    [getToken, getProfile]
  );

  const add_to_wishlist = useCallback(
    async (game: string): Promise<void> => {
      setError(null);
      const token = await getToken();

      try {

        const response = await fetch(
          "https://gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/wishlists/add_to_wishlist/",
          {
            method: "PATCH",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              game: game,
            }),
          }
        );

        if (!response.ok) {
          setError("couldn't add game :(");
          return;
        }

        await response.json();
        await getProfile();
        await show_wishlist();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error happened.";
        setError(message);
        throw err;
      }
    },
    [getToken, getProfile, show_wishlist]
  );

  const delete_wishlist = useCallback(async (): Promise<void> => {
    const token = await getToken();
    setError(null);

    try {
      const response = await fetch(
        "https://gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/wishlists/delete_wishlist/",
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      await response.json();
      await getProfile();
      setUserGames(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error happened.";
      setError(message);
      throw err;
    }
  }, [getToken, getProfile]);

  const remove_from_wishlist = useCallback(
    async (title: string): Promise<void> => {
      const token = await getToken();
      setError(null);

      try {
        const response = await fetch(
          "https://gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/wishlists/remove_game_from_list/",
          {
            method: "PATCH",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ game: title }),
          }
        );

        await response.json();
        await getProfile();
        await show_wishlist();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error happened.";
        setError(message);
        throw err;
      }
    },
    [getToken, getProfile, show_wishlist]
  );

  const value: UserContextType = {
    profile,
    userGames,
    error,
    getProfile,
    create_wishlist,
    add_to_wishlist,
    show_wishlist,
    delete_wishlist,
    remove_from_wishlist,
  };

  return <userContext.Provider value={value}>{children}</userContext.Provider>;
}

export function useAccount(): UserContextType {
  const context = useContext(userContext);

  if (!context) {
    throw new Error("useAccount must be used inside a UserProvider");
  }

  return context;
}
