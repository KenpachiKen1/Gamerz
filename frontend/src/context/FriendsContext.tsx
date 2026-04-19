import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

type FriendshipStatus = {
  status: string;
  is_sender: boolean;
};

type FriendUser = {
  id: number;
  username: string;
  profile_photo?: string | null;
  profile_picture?: string | null;
  avg_hours_week?: number | null;
  hours?: number | null;
  main_platform?: string | null;
  friendship_status?: FriendshipStatus;
};

type PendingResponse = {
  sent_requests: FriendUser[];
  received_requests: FriendUser[];
};

type FriendsContextType = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  users: FriendUser[];
  setUsers: React.Dispatch<React.SetStateAction<FriendUser[]>>;
  error: string | null;
  friendsList: FriendUser[];
  setFriendsList: React.Dispatch<React.SetStateAction<FriendUser[]>>;
  pendingList: FriendUser[];
  setPendingList: React.Dispatch<React.SetStateAction<FriendUser[]>>;
  user_search: (search: string) => Promise<void>;
  add_friend: (username: string) => Promise<void>;
  accept_friend_request: (username: string) => Promise<void>;
  decline_friend_request: (username: string) => Promise<void>;
  show_friends: () => Promise<FriendUser[]>;
  show_pending: () => Promise<void>;
  remove_friend: (username: string) => Promise<void>;
};

const FriendContext = createContext<FriendsContextType | null>(null);

type FriendsProviderProps = {
  children: ReactNode;
};

export function FriendsProvider({ children }: FriendsProviderProps) {
  const { getToken } = useAuth();

  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<FriendUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [friendsList, setFriendsList] = useState<FriendUser[]>([]);
  const [pendingList, setPendingList] = useState<FriendUser[]>([]);

  async function user_search(username: string) {
    const token = await getToken();
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://127.0.0.1:8000/api/friends/user_search/`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ username: username }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "User search failed");
      }

      setUsers(data);

    } catch (err) {
      const message = err instanceof Error ? err.message : "User search failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function add_friend(username: string) {
    const token = await getToken();

    try {
      setError(null);

      const response = await fetch(
        `http://127.0.0.1:8000/api/friends/add_friend/`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not add friend");
      }

      await show_pending();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not add friend";
      setError(message);
    }
  }

  async function accept_friend_request(username: string) {
    const token = await getToken();

    try {
      setError(null);

      const response = await fetch(
        `http://127.0.0.1:8000/api/friends/accept_friend_request/`,
        {
          method: "PATCH",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not accept friend request");
      }

      setPendingList((prev) => prev.filter((u) => u.username !== username));
      setFriendsList(data.friends ?? []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not accept friend request";
      setError(message);
    }
  }

  async function decline_friend_request(username: string) {
    const token = await getToken();

    try {
      setError(null);

      const response = await fetch(
        `http://127.0.0.1:8000/api/friends/decline_friend_request/`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not decline friend request");
      }

      setPendingList((prev) => prev.filter((u) => u.username !== username));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not decline friend request";
      setError(message);
    }
  }

  async function show_friends(): Promise<FriendUser[]> {
    const token = await getToken();

    try {
      setError(null);

      const response = await fetch(
        `http://127.0.0.1:8000/api/friends/show_friend_list/`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load friends");
      }

      setFriendsList(data);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not load friends";
      setError(message);
      return [];
    }
  }

  async function show_pending() {
    const token = await getToken();

    try {
      setError(null);

      const response = await fetch(
        `http://127.0.0.1:8000/api/friends/show_pending_friend_list/`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data: PendingResponse = await response.json();

      if (!response.ok) {
        throw new Error("Could not load pending requests");
      }

      setPendingList([
        ...(data.sent_requests ?? []),
        ...(data.received_requests ?? []),
      ]);

      console.log(pendingList)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not load pending requests";
      setError(message);
    }
  }

  async function remove_friend(username: string) {
    const token = await getToken();

    try {
      setError(null);

      const response = await fetch(
        `http://127.0.0.1:8000/api/friends/remove_friend/`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not remove friend");
      }

      setFriendsList((prev) => prev.filter((u) => u.username !== username));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not remove friend";
      setError(message);
    }
  }

  return (
    <FriendContext.Provider
      value={{
        search,
        setSearch,
        loading,
        users,
        setUsers,
        error,
        friendsList,
        setFriendsList,
        pendingList,
        setPendingList,
        remove_friend,
        add_friend,
        accept_friend_request,
        decline_friend_request,
        show_friends,
        show_pending,
        user_search,
      }}
    >
      {children}
    </FriendContext.Provider>
  );
}

export function useFriends(): FriendsContextType {
  const context = useContext(FriendContext);

  if (!context) {
    throw new Error("useFriends must be used inside a FriendsProvider");
  }

  return context;
}
