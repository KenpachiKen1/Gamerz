import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/ProfileContext";
import { FriendsProvider } from "./context/FriendsContext";
import { CommunityProvider } from "./context/CommunityContext";
import { GameProvider } from "./context/GameContext";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <FriendsProvider>
            <GameProvider>
              <CommunityProvider>
                <App />
              </CommunityProvider>
            </GameProvider>
          </FriendsProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);