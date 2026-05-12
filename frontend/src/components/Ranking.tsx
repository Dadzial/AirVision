import { useState ,useEffect} from "react";
import { IconsParser } from "../utils/IconParser";
import {getFlagByCountryCode} from "../utils/FlagParser.tsx";
import {fetchStations, type Station} from "../services/FetchStations.ts";

const countryNames: Record<string, string> = {
    PL: "Poland",
    GB: "Great Britain",
    DE: "Germany",
    AT: "Austria",
    GR: "Greece",
    SK: "Slovakia",
    NL: "Netherlands",
    FR: "France",
    ES: "Spain",
    CZ: "Czechia",
    SE: "Sweden",
    IT: "Italy",
};

interface RankingRecord {
    flag: string;
    country: string;
    stationName: string;
    pm25: number;
    stationId: number;
    station: Station;
}

interface RankingListProps {
    records: RankingRecord[];
    sortOrder: SortOrder;
    setSortOrder: (order: SortOrder) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onStationSelect: (station: Station) => void;
}

type SortOrder = "asc" | "desc";

function RankingList({ records, sortOrder, setSortOrder, searchQuery, setSearchQuery  , onStationSelect }: RankingListProps) {
    const filteredRecords = records.filter(
        (record) =>
            record.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayRecords = [...filteredRecords].sort((a, b) => {
        return sortOrder === "desc" ? b.pm25 - a.pm25 : a.pm25 - b.pm25;
    });

    const getColor = (pm25: number): string => {
        if (pm25 < 15) return "#10B981";
        if (pm25 < 35) return "#F59E0B";
        return "#EF4444";
    };

    return (
        <div>

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
                        placeholder="Search stations..."
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
                    <option value="desc">▼ Worst PM2.5</option>
                    <option value="asc">▲ Best PM2.5</option>
                </select>
            </div>


            {displayRecords.map((record, index) => (
                <div
                    key={record.stationId}
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
                    onClick={() => onStationSelect(record.station)}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor = "#F0F9FF";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor =
                            index % 2 === 0 ? "#F9FAFB" : "white";
                    }}
                >

                    <img
                        src={record.flag}
                        alt={record.country}
                        style={{
                            width: "28px",
                            height: "20px",
                            borderRadius: "3px",
                            objectFit: "cover",
                            flexShrink: 0,
                        }}
                    />


                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                        }}
                    >
                        {/* Country */}
                        <div
                            style={{
                                fontSize: "12px",
                                color: "#6B7280",
                                fontWeight: "500",
                            }}
                        >
                            {record.country}
                        </div>


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
                            {record.stationName}
                        </div>
                    </div>


                    <div
                        style={{
                            minWidth: "50px",
                            textAlign: "right",
                            fontSize: "14px",
                            fontWeight: "700",
                            color: getColor(record.pm25),
                        }}
                    >
                        {Math.round(record.pm25 * 10) / 10}
                    </div>
                </div>
            ))}
        </div>
    );
}

interface RankingProps {
    onStationSelect: (station: Station) => void;
}

export default function Ranking({onStationSelect}:RankingProps) {
    const [open, setOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [searchQuery, setSearchQuery] = useState("");
    const [records, setRecords] = useState<RankingRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStations = async () => {
            setLoading(true);
            try {
                const stations = await fetchStations();

                const rankingRecords = stations
                    .filter(station => station.last_pm25 !== null && station.last_pm25 !== undefined)
                    .map(station => ({
                        flag: getFlagByCountryCode(station.country) || "",
                        country: countryNames[station.country] || station.country,
                        stationName: station.name,
                        pm25: station.last_pm25 || 0,
                        stationId: station.id,
                        station: station
                    }));

                setRecords(rankingRecords);
            } catch (error) {
                console.error("Error loading stations:", error);
            } finally {
                setLoading(false);
            }
        };

        loadStations();
    }, []);

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
                        maxHeight: "550px",
                        overflowY: "auto",
                        overflowX: "hidden",
                    }}
                >
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                            Loading...
                        </div>
                    ) : records.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                            No stations to display
                        </div>
                    ) : (
                        <RankingList
                            records={records}
                            sortOrder={sortOrder}
                            setSortOrder={setSortOrder}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            onStationSelect={onStationSelect}
                        />
                    )}
                </div>
            </div>

        </div>
    );
}

