import { useState } from "react";
import { getIcon } from "../utils/IconParser.tsx";

type GpsButtonProps = {
    onGps?: (coords: { lat: number; lng: number }) => void;
    onError?: (message: string) => void;
};

export default function GpsButton({ onGps, onError }: GpsButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleClick = () => {
        setLoading(true);
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
                (error) => {
                    setLoading(false);
                    let message = "Location unavailable";
                    if (error.code === error.PERMISSION_DENIED) {
                        message = "Location access denied";
                    }
                    if (onError) onError(message);
                }
            );
        } else {
            setLoading(false);
            if (onError) onError("Geolocation not supported");
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
        </div>
    );
}
