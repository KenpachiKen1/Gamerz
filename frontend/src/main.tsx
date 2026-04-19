import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/ProfileContext";
import { FriendsProvider } from "./context/FriendsContext";
import { CommunityProvider } from "./context/CommunityContext";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <FriendsProvider>
            <CommunityProvider>
              <App />
            </CommunityProvider>
          </FriendsProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);