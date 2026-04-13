import { useState } from "react";
import { getIcon } from "../utils/IconParser.tsx";

type GpsButtonProps = {
    onGps?: (coords: { lat: number; lng: number }) => void;
};

export default function GpsButton({ onGps }: GpsButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClick = () => {
        setLoading(true);
        setError(null);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLoading(false);
                    const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    if (onGps) onGps(coords);
                },
                () => {
                    setLoading(false);
                    setError("Location unavailable");
                }
            );
        } else {
            setLoading(false);
            setError("Geolocation not supported");
        }
    };

    const iconSrc = getIcon("gpsIcon");

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <button
                onClick={handleClick}
                disabled={loading}
                style={{
                    padding: "10px 12px",
                    background: "white",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    transition: "box-shadow 0.2s",
                }}
                title="Go to my location"
            >
                <img src={iconSrc} alt="GPS" style={{ width: 30, height: 30 }} />
            </button>
            {error && <span style={{ color: "red", fontSize: 12 }}>{error}</span>}
        </div>
    );
}
