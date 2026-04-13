// src/components/GameCard.tsx

interface Props {
    name: string;
    image: string;
    players: string;
    onClick: () => void;
}

export default function GameCard({ name, image, players, onClick }: Props) {
    return (
        <div className="game-card" onClick={onClick}>
            <img src={image} alt={name} className="game-image" />

            <div className="game-info">
                <h3>{name}</h3>
                <p>{players}</p>
            </div>
        </div>
    );
}