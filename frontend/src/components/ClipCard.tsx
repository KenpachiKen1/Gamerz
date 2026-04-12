import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/clipcard.css";

type ClipCardProps = {
    title: string;
    videoUrl?: string;
    username?: string;
};

export default function ClipCard({
    title,
    videoUrl = "https://38613882-69f4-4e51-b230-0779359f369f.mdnplay.dev/shared-assets/videos/flower.webm",
    username = "User",
}: ClipCardProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const navigate = useNavigate();

    const handleMouseEnter = () => {
        videoRef.current?.play();
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    const goToProfile = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/profile/${username}`);
    };

    return (
        <div
            className="clip-card"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <video
                ref={videoRef}
                className="clip-video"
                muted
                loop
                playsInline
            >
                <source src={videoUrl} type="video/mp4" />
            </video>

            {/* Overlay */}
            <div className="clip-overlay">
                <p className="clip-user" onClick={goToProfile}>
                    @{username}
                </p>
                <p className="clip-title">{title}</p>
            </div>
        </div>
    );
}