import { useParams, useNavigate } from "react-router-dom";
import "../styles/game.css";

type GameType = {
    slug: string;
    name: string;
    description: string;
    players: string;
};

export default function Game() {
    const { id } = useParams();
    const navigate = useNavigate();

    // 🔥 Match your Home.tsx games
    const games: GameType[] = [
        {
            slug: "counter-strike-2",
            name: "Counter-Strike 2",
            description: "Competitive tactical FPS",
            players: "590k online",
        },
        {
            slug: "dota2",
            name: "Dota 2",
            description: "MOBA strategy game",
            players: "280k online",
        },
        {
            slug: "slay-the-spire-ii",
            name: "Slay the Spire II",
            description: "Deck-building roguelike",
            players: "170k online",
        },
    ];

    const game = games.find((g) => g.slug === id);

    if (!game) {
        return (
            <div style={{ color: "white", padding: "20px" }}>
                <h1>Game not found</h1>
            </div>
        );
    }

    return (
        <div className="game-container">

            {/* Header */}
            <div className="game-header">
                <h1>{game.name}</h1>
                <p>{game.description}</p>
                <span className="players">{game.players}</span>
            </div>

            {/* Sections */}
            <div className="game-content">

                {/* Example: Clips */}
                <div className="game-section">
                    <h2>Top Clips</h2>
                    <p>(Hook this to your clips later)</p>
                </div>

                {/* Example: Communities */}
                <div className="game-section">
                    <h2>Communities</h2>
                    <button
                        onClick={() =>
                            navigate(`/community/${game.slug}`)
                        }
                    >
                        Go to Community
                    </button>
                </div>

            </div>
        </div>
    );
}