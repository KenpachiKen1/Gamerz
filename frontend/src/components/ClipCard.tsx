// src/components/ClipCard.tsx

type Props = {
    title: string;
};

export default function ClipCard({ title }: Props) {
    return (
        <div style={{ border: "1px solid gray", padding: "10px" }}>
            <p>{title}</p>
            <button>Watch</button>
        </div>
    );
}