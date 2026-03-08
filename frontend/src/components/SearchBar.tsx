import { useCesium } from "resium";
import { Cartesian3 } from "cesium";
import { useState } from "react";

interface SearchResult {
    lat: string;
    lon: string;
    display_name: string;
}

export default function SearchBar() {
    const { viewer } = useCesium();
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 1000,
            background: "white",
            padding: "8px",
            borderRadius: 4,
            border: "1px solid #ccc",
            display: "flex",
            gap: "4px"
        }}>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search city (e.g., Warsaw)"
                disabled={isLoading}
                style={{
                    padding: "4px 8px",
                    border: "1px solid #ddd",
                    borderRadius: 3,
                    minWidth: "200px"
                }}
            />
            <button
                onClick={handleSearch}
                disabled={isLoading}
                style={{
                    padding: "4px 12px",
                    background: isLoading ? "#ccc" : "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: 3,
                    cursor: isLoading ? "not-allowed" : "pointer"
                }}
            >
                {isLoading ? "..." : "Search"}
            </button>
        </div>
    );
}