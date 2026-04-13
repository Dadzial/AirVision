import { useState } from "react";
import { getIcon } from "../utils/IconParser.tsx";
import { BACKEND_URL } from "../config/config.ts";

type RefreshButtonProps = {
    onStationsUpdate: (updater: (prev: any[]) => any[]) => void;
};

export default function RefreshButton({ onStationsUpdate }: RefreshButtonProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const iconSrc = getIcon("refreshIcon");

    const handleClick = async () => {
        setIsRefreshing(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/stations/pm25`);
            const data = await response.json();

            onStationsUpdate(prev =>
                prev.map(station => {
                    const update = data.updates.find((u: any) => u.id === station.id);
                    return update ? { ...station, last_pm25: update.last_pm25 } : station;
                })
            );
        } catch (e) {
            console.error("Błąd odświeżania:", e);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <button
            style={{
                padding: "8px 12px",
                color: "#17C1DF",
                border: "1px solid #ccc",
                borderRadius: 4,
                fontFamily: "Poppins, sans-serif",
                fontWeight: 600,
                fontSize: 14,
                background: "white",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: isRefreshing ? "wait" : "pointer",
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
                    animation: isRefreshing ? "spin 1s linear infinite" : "none"
                }}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </button>
    );
}