import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

type User = {
  id: number;
  username: string;
  profile_picture?: string | null;
};

type CommunityMember = {
  id: number;
  username: string;
  profile_picture?: string | null;
};

type Community = {
  id: number;
  title: string;
  member_count?: number;
  joined_by_user?: boolean;
  members?: CommunityMember[];
  game?: {
    id: number;
    title: string;
  };
};

type CommunityPost = {
  id: number;
  subject: string;
  body: string;
  creation: string;
  poster: User;
  like_count?: number;
  dislike_count?: number;
  comment_count?: number;
  liked_by_user?: boolean;
  disliked_by_user?: boolean;
  can_delete?: boolean;
};

type CommunityContextType = {
  community: Community | null;
  posts: CommunityPost[];
  loading: boolean;
  error: string | null;
  fetchCommunityPosts: (communityId: number) => Promise<void>;
  createCommunityPost: (
    communityId: number,
    subject: string,
    body: string
  ) => Promise<boolean>;
  likePost: (postId: number) => Promise<void>;
  dislikePost: (postId: number) => Promise<void>;
  deletePost: (postId: number) => Promise<boolean>;
  joinCommunity: (communityId: number) => Promise<boolean>;
  leaveCommunity: (communityId: number) => Promise<boolean>;
  clearCommunityState: () => void;
};

const CommunityContext = createContext<CommunityContextType | undefined>(
  undefined
);

export const CommunityProvider = ({ children }: { children: ReactNode }) => {
  const { getToken } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunityPosts = useCallback(
    async (communityId: number) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();

        const response = await fetch(
          `http://127.0.0.1:8000/api/communities/${communityId}/get_posts/`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch community posts");
        }

        setCommunity(data.community);
        setPosts(data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  const createCommunityPost = useCallback(
    async (communityId: number, subject: string, body: string) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();

        const response = await fetch(
          `http://127.0.0.1:8000/api/communities/${communityId}/create_post/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify({
              subject,
              body,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create post");
        }

        setPosts((prev) => [data, ...prev]);
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

  const likePost = useCallback(
    async (postId: number) => {
      setError(null);

      try {
        const token = await getToken();

        const response = await fetch(
          `http://127.0.0.1:8000/api/community-posts/${postId}/like/`,
          {
            method: "PATCH",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to like post");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    },
    [getToken]
  );

  const dislikePost = useCallback(
    async (postId: number) => {
      setError(null);

      try {
        const token = await getToken();

        const response = await fetch(
          `http://127.0.0.1:8000/api/community-posts/${postId}/dislike/`,
          {
            method: "PATCH",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to dislike post");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    },
    [getToken]
  );

  const deletePost = useCallback(
    async (postId: number) => {
      setError(null);

      try {
        const token = await getToken();

        const response = await fetch(
          `http://127.0.0.1:8000/api/community-posts/${postId}/`,
          {
            method: "DELETE",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to delete post");
        }

        setPosts((prev) => prev.filter((post) => post.id !== postId));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        return false;
      }
    },
    [getToken]
  );

  const joinCommunity = useCallback(
    async (communityId: number) => {
      setError(null);

      try {
        const token = await getToken();

        const response = await fetch(
          `http://127.0.0.1:8000/api/communities/${communityId}/join/`,
          {
            method: "PATCH",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to join community");
        }

        setCommunity((prev) =>
          prev
            ? {
                ...prev,
                joined_by_user: true,
                member_count: (prev.member_count ?? 0) + 1,
              }
            : prev
        );

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        return false;
      }
    },
    [getToken]
  );

  const leaveCommunity = useCallback(
    async (communityId: number) => {
      setError(null);

      try {
        const token = await getToken();

        const response = await fetch(
          `http://127.0.0.1:8000/api/communities/${communityId}/leave/`,
          {
            method: "PATCH",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to leave community");
        }

        setCommunity((prev) =>
          prev
            ? {
                ...prev,
                joined_by_user: false,
                member_count: Math.max((prev.member_count ?? 1) - 1, 0),
              }
            : prev
        );

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        return false;
      }
    },
    [getToken]
  );

  const clearCommunityState = () => {
    setCommunity(null);
    setPosts([]);
    setError(null);
  };

  return (
    <CommunityContext.Provider
      value={{
        community,
        posts,
        loading,
        error,
        fetchCommunityPosts,
        createCommunityPost,
        likePost,
        dislikePost,
        deletePost,
        joinCommunity,
        leaveCommunity,
        clearCommunityState,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);

  if (!context) {
    throw new Error("useCommunity must be used within a CommunityProvider");
  }

  return context;
};
