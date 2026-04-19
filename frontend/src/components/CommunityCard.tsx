type Props = {
  title: string;
};

export default function CommunityCard({ title }: Props) {
  return (
    <div style={{ border: "1px solid gray", padding: "10px" }}>
      <p>{title}</p>
      <button>Join</button>
    </div>
  );
}
