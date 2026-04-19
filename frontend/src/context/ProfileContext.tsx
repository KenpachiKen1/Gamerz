import { createContext, useContext, useEffect, useState } from "react";
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
  add_to_wishlist: ( game: string) => Promise<void>;
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

  const [profile, setProfile] = useState<Profile| null>(null);
  const [userGames, setUserGames] = useState<Game[] | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null);
      setUserGames(null);
      setError(null);
    }
  }, [isAuthenticated]);

  async function getProfile(): Promise<void>{
    const token = await getToken();
    setError(null)
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/profile/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
  }

  //may have to keep local versions of profile data to prevent excessive calls, we'll see.
  async function create_wishlist(name: string): Promise<void> {
    setError(null)
    const token = await getToken();
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/wishlists/create_wishlist/",
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
  }

  async function add_to_wishlist(game: string): Promise<void> {

    setError(null)
    const token = await getToken();
    try {
        console.log("trying to add " + `${game}`);

      const response = await fetch(
        "http://127.0.0.1:8000/api/wishlists/add_to_wishlist/",
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
  }

  async function show_wishlist(): Promise<void> {
    const token = await getToken();
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/wishlists/show_wishlist",
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
  }

  async function delete_wishlist(): Promise<void> {
    const token = await getToken();
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/wishlists/delete_wishlist/",
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      await response.json();
      await getProfile(); //need to showcase that the users wishlist is no longer available
      setUserGames(null); //We reset the games that were there previously
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error happened.";
      setError(message);
      throw err;
    }
  }

  async function remove_from_wishlist(title: string): Promise<void> {
    const token = await getToken();

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/wishlists/remove_game_from_list/",
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
      await getProfile(); //need to showcase that the users wishlist is no longer available
      await show_wishlist(); //We reset the games that were there previously
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error happened.";
      setError(message);
      throw error;
    }
    
  
  }

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