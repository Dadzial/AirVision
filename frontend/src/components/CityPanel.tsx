import { Station } from "../services/FetchStations";
import { Measurement } from "../services/FetchMeasurements.ts";
import { getFlagByCountryCode } from "../utils/FlagParser";

interface CityPanelProps {
    station: Station;
    measurements: Measurement | null;
    onClose: () => void;
}

export default function CityPanel({onClose, station, measurements}: CityPanelProps) {

    const flagSrc = getFlagByCountryCode(station.country);

    const displayLocation = (station.city && station.city !== "null") ? station.city : station.name;
    const isSame = (station.city === station.name) || !station.city;

    return (
        <div style={{
            width: "100%",
            boxSizing: "border-box",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            padding: "14px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "4px",
        }}
        >
            <span style={{ fontSize: "18px", fontWeight: "600", color: "#17C1DF", display: "flex", alignItems: "center", gap: "8px", wordBreak: "break-word" }}>
                {flagSrc && (
                    <img
                        src={flagSrc}
                        alt={`${station.country} flag`}
                        style={{ width: "24px", height: "auto", flexShrink: 0 }}
                    />
                )}
                <span style={{ fontSize: "15px", fontWeight: "500", color: "#666" }}>
                    {station.country}
                </span>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#666" }}></div>
                {displayLocation}
            </span>

            {!isSame && (
                <span style={{ fontSize: "13px", color: "#888", wordBreak: "break-word" }}>
                    Station: {station.name}
                </span>
            )}

            <div style={{ marginTop: "10px", width: "100%" }}>
                {measurements ? (
                    <div>
                        <p style={{ margin: "4px 0", color: "#333", fontWeight: "bold" }}>
                            PM2.5: {measurements.pm25} µg/m³
                        </p>
                        <p style={{ margin: "0", fontSize: "11px", color: "#888" }}>
                            Update: {new Date(measurements.datetime).toLocaleString()}
                        </p>
                    </div>
                ) : (
                    <span style={{ fontSize: "13px", color: "#888" }}>Fetching data from OpenAQ...</span>
                )}
            </div>

            <span onClick={onClose} style={{ cursor:'pointer', fontSize: "13px", color: "#c13b3b", alignSelf: "flex-end", marginTop: "4px", fontWeight: "bold" }}>
                Close
            </span>
        </div>
    )
}
