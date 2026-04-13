// src/components/CommunityCard.tsx

import "../styles/home.css";

type Props = {
    name: string;
    members: number;
    image: string;
    onClick?: () => void;
};

// format helper
const formatMembers = (num: number) => {
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(".0", "") + "M";
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(1).replace(".0", "") + "k";
    }
    return num.toString();
};

export default function CommunityCard({ name, members, image, onClick }: Props) {
    return (
        <div className="game-card" onClick={onClick}>
            <img src={image} alt={name} className="game-image" />

            <div className="game-info">
                <h3>{name}</h3>
                <p>{formatMembers(members)} members</p>
            </div>
        </div>
    );
}