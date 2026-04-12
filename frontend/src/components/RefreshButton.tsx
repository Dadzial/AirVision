import { useState } from "react";
import { getIcon } from "../utils/IconParser.tsx";
import { fetchStations } from "../services/FetchStations.ts";
import { BACKEND_URL } from "../config/config.ts";

type RefreshButtonProps = {
    onStationsUpdate: (stations: any[]) => void;
};

export default function RefreshButton({ onStationsUpdate }: RefreshButtonProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const iconSrc = getIcon("refreshIcon");

    const handleClick = async () => {
        setIsRefreshing(true);
        await fetch(`${BACKEND_URL}/api/stations/sync`, { method: "POST" });
        const stations = await fetchStations();
        onStationsUpdate(stations);
        setIsRefreshing(false);
    };

    return (
        <button
            style={{
                padding: "8px 12px",
                color: "#17C1DF",
                border: "1px solid #ccc",
                borderRadius: 4,
                fontFamily: "Poppins, sans-serif",
                fontWeight:600,
                fontSize: 14,
                background: "white",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: isRefreshing ? "wait" : "pointer",
                transition: "background 0.2s",
            }}
            onClick={handleClick}
            disabled={isRefreshing}
        >
            <img
                src={iconSrc}
                alt="Refresh"
                style={{
                    width: 22,
                    height: 22,
                    marginRight: 2,
                    marginBottom: 1,
                    transition: "transform 0.3s",
                    animation: isRefreshing ? "spin 1s linear infinite" : "none"
                }}
            />
            {isRefreshing ? "Synchronizing data..." : "Sync data"}
            <style>
                {`
                @keyframes spin {
                    100% { transform: rotate(360deg); }
                }
                `}
            </style>
        </button>
    );
}
