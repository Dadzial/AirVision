import { useCesium } from "resium";
import { Cartesian3 } from "cesium";
import { useState } from "react";
import {getIcon} from "../utils/IconParser.tsx";
interface SearchResult {
    lat: string;
    lon: string;
    display_name: string;
}

export default function SearchBar() {
    const { viewer } = useCesium();
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const iconSrc = getIcon("search")

    const handleSearch = async () => {
        if (!viewer || !searchQuery.trim()) return;

        setIsLoading(true);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
            );
            const results: SearchResult[] = await response.json();

            if (results.length > 0) {
                const result = results[0];
                const lat = parseFloat(result.lat);
                const lon = parseFloat(result.lon);
                const position = Cartesian3.fromDegrees(lon, lat, 50000);

                viewer.scene.camera.flyTo({
                    destination: position,
                    duration: 2
                });
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            padding: "6px",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: "280px"
        }}>
            <img
                src={iconSrc}
                alt="Search"
                style={{
                    width: "20px",
                    height: "20px",
                    opacity: 0.7
                }}
            />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search location..."
                disabled={isLoading}
                style={{
                    flex: 1,
                    padding: "6px 8px",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: "14px",
                    color: "#333"
                }}
            />
            <div
                onClick={handleSearch}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    transition: "background 0.2s ease"
                }}
            >
            </div>
        </div>
    );
}