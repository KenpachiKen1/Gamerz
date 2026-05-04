import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";
import "../styles/clipcard.css";

type ClipCardProps = {
  title: string;
  videoUrl?: string;
  username?: string;
};

export default function ClipCard({ title, videoUrl, username }: ClipCardProps) {
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const [videoModal, setVideoModal] = useState(false);

  const handleMouseEnter = () => {
    previewVideoRef.current?.play().catch(() => {});
  };

  const handleMouseLeave = () => {
    if (previewVideoRef.current) {
      previewVideoRef.current.pause();
      previewVideoRef.current.currentTime = 0;
    }
  };

  const goToProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  const closeModal = () => {
    modalVideoRef.current?.pause();
    setVideoModal(false);
  };

  return (
    <>
      <div
        className="clip-card"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setVideoModal(true)}
      >
        <video
          ref={previewVideoRef}
          className="clip-video"
          muted
          loop
          playsInline
          src={videoUrl}
        />

        <div className="clip-overlay">
          {username && (
            <p className="clip-user" onClick={goToProfile}>
              @{username}
            </p>
          )}
          <p className="clip-title">{title}</p>
        </div>
      </div>

      <Modal
        open={videoModal}
        onCancel={closeModal}
        footer={null}
        title={title}
        width={800}
      >
        <video
          ref={modalVideoRef}
          className="clip-modal-video"
          controls
          autoPlay
          src={videoUrl}
          style={{ width: "100%", borderRadius: 12 }}
        />
      </Modal>
    </>
  );
}
