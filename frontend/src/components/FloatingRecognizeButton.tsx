import { useLocation, useNavigate } from "react-router-dom";

function CameraFlowerIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect
        x="4"
        y="7"
        width="20"
        height="15"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="14" cy="14.5" r="3.5" fill="currentColor" opacity="0.9" />
      <circle cx="14" cy="6" r="2" fill="currentColor" />
      <circle cx="9" cy="8.5" r="1.6" fill="currentColor" />
      <circle cx="19" cy="8.5" r="1.6" fill="currentColor" />
      <circle cx="7.5" cy="12" r="1.4" fill="currentColor" />
      <circle cx="20.5" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}

export default function FloatingRecognizeButton() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/recognize") {
    return null;
  }

  return (
    <button
      type="button"
      className="fab"
      aria-label="Распознать растение"
      onClick={() => navigate("/recognize")}
    >
      <CameraFlowerIcon />
    </button>
  );
}
