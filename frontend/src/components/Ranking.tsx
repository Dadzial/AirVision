import { useState } from "react";
import { IconsParser } from "../utils/IconParser";

interface RankingRecord {
    flag: string;
    country: string;
    station: string;
    pm25: number;
}

type SortOrder = "asc" | "desc";

function RankingList() {
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [searchQuery, setSearchQuery] = useState("");

    const recordsData: RankingRecord[] = [
        { flag: "🇵🇱", country: "Polska", station: "Warszawa Centrum", pm25: 45 },
        { flag: "🇵🇱", country: "Polska", station: "Kraków Śródmieście", pm25: 38 },
        { flag: "🇩🇪", country: "Niemcy", station: "Berlin Mitte", pm25: 28 },
        { flag: "🇩🇪", country: "Niemcy", station: "München Altstadt", pm25: 22 },
        { flag: "🇫🇷", country: "Francja", station: "Paris 8e", pm25: 35 },
        { flag: "🇬🇧", country: "Wielka Brytania", station: "London City", pm25: 42 },
        { flag: "🇳🇱", country: "Holandia", station: "Amsterdam", pm25: 31 },
    ];

    const filteredRecords = recordsData.filter(
        (record) =>
            record.station.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const records = [...filteredRecords].sort((a, b) => {
        return sortOrder === "desc" ? b.pm25 - a.pm25 : a.pm25 - b.pm25;
    });

    const getColor = (pm25: number): string => {
        if (pm25 < 35) return "#10B981";
        if (pm25 < 75) return "#F59E0B";
        return "#EF4444";
    };

    return (
        <div>
            {/* Pasek wyszukiwania i sortowania */}
            <div
                style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "12px",
                    paddingBottom: "8px",
                    borderBottom: "1px solid #E5E7EB",
                    alignItems: "center",
                }}
            >
                {/* Search bar po lewej */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 10px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "6px",
                        transition: "all 0.2s ease",
                        backgroundColor: "white",
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = "#17C1DF";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = "#D1D5DB";
                    }}
                >
                    <img
                        src={IconsParser.search}
                        alt="search"
                        style={{
                            width: "16px",
                            height: "16px",
                            opacity: 0.6,
                            flexShrink: 0,
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Szukaj stacji..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            fontSize: "12px",
                            background: "transparent",
                        }}
                    />
                </div>

                {/* Sort dropdown po prawej */}
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    style={{
                        padding: "6px 8px",
                        fontSize: "12px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "6px",
                        background: "white",
                        cursor: "pointer",
                        outline: "none",
                        transition: "all 0.2s ease",
                        color: "#444",
                        fontWeight: "500",
                    }}
                    onFocus={(e) => {
                        (e.currentTarget as HTMLSelectElement).style.borderColor = "#17C1DF";
                    }}
                    onBlur={(e) => {
                        (e.currentTarget as HTMLSelectElement).style.borderColor = "#D1D5DB";
                    }}
                >
                    <option value="desc">▼ Najgorsze PM2.5</option>
                    <option value="asc">▲ Najlepsze PM2.5</option>
                </select>
            </div>

            {/* Lista rekordów */}
            {records.map((record, index) => (
                <div
                    key={index}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 8px",
                        borderRadius: "8px",
                        backgroundColor: index % 2 === 0 ? "#F9FAFB" : "white",
                        marginBottom: "4px",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor = "#F0F9FF";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor =
                            index % 2 === 0 ? "#F9FAFB" : "white";
                    }}
                >
                    {/* Flaga */}
                    <div style={{ fontSize: "24px", minWidth: "32px" }}>
                        {record.flag}
                    </div>

                    {/* Kolumna: Kraj i Stacja */}
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                        }}
                    >
                        {/* Kraj */}
                        <div
                            style={{
                                fontSize: "12px",
                                color: "#6B7280",
                                fontWeight: "500",
                            }}
                        >
                            {record.country}
                        </div>

                        {/* Nazwa stacji */}
                        <div
                            style={{
                                fontSize: "13px",
                                fontWeight: "500",
                                color: "#111827",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {record.station}
                        </div>
                    </div>

                    {/* PM25 */}
                    <div
                        style={{
                            minWidth: "50px",
                            textAlign: "right",
                            fontSize: "14px",
                            fontWeight: "700",
                            color: getColor(record.pm25),
                        }}
                    >
                        {record.pm25}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function Ranking() {
    const [open, setOpen] = useState(false);

    return (
        <div
            style={{
                position: "fixed",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1000,
                width: "25%",
                maxWidth: "600px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                pointerEvents: "none",
            }}
        >
            <div
                style={{
                    width: "100%",
                    background: "white",
                    borderRadius: "12px 12px 0 0",
                    boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                    transform: open
                        ? "translateY(0)"
                        : "translateY(calc(100% - 44px))",
                    transition: "transform 0.3s ease",
                    pointerEvents: "auto",
                }}
            >
                <button
                    className="ranking-handle"
                    onClick={() => setOpen((prev) => !prev)}
                    style={{
                        width: "100%",
                        background: "white",
                        border: "none",
                        padding: "8px 0",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        transition: "all 0.2s ease",
                    }}
                >
                    <div
                        style={{
                            width: "40px",
                            height: "4px",
                            background: "#17C1DF",
                            borderRadius: "2px",
                        }}
                    />

                    <span
                        style={{
                            fontSize: 13,
                            letterSpacing: "1px",
                            fontWeight: "600",
                            color: "#444",
                            fontFamily: "'Poppins', sans-serif",
                        }}
                    >
                        Stations Ranking
                    </span>
                </button>

                <div
                    style={{
                        padding: "16px",
                        minHeight: "220px",
                        maxHeight: "520px",
                        overflowY: "auto",
                    }}
                >
                    {/* Ranking stacji */}
                    <RankingList />
                </div>
            </div>

        </div>
    );
}
