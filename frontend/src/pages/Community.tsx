import { useParams } from "react-router-dom";

export default function Community() {
    const { id } = useParams();

    return <h1>Community {id}</h1>;
}