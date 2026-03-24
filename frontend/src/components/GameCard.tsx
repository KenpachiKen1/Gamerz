// src/components/GameCard.tsx

type Props = {
    title: string;
};

export default function GameCard({ title }: Props) {
    return (
        <div style={{ border: "1px solid gray", padding: "10px" }}>
            <p>{title}</p>
            <button>Join</button>
        </div>
    );
}