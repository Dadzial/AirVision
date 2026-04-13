import { Station } from "../services/FetchStations";
import { Measurement } from "../services/FetchMeasurements.ts";
import { getFlagByCountryCode } from "../utils/FlagParser";
import {getIcon} from "../utils/IconParser.tsx";

interface CityPanelProps {
    station: Station;
    measurements: Measurement | null;
    onClose: () => void;
}

export default function CityPanel({onClose, station, measurements}: CityPanelProps) {

    const flagSrc = getFlagByCountryCode(station.country);
    const faceGreen = getIcon("faceGreen")
    const faceYellow = getIcon("faceYellow")
    const faceRed = getIcon("faceRed")

    const displayLocation = (station.city && station.city !== "null") ? station.city : station.name;
    const isSame = (station.city === station.name) || !station.city;
    

    const selectFaceByPm25 = () => {
        if (!measurements || measurements.pm25 === undefined || measurements.pm25 === null) return faceGreen;
        const pm25 = measurements.pm25;
        if (pm25 <= 15) return faceGreen;
        if (pm25 <= 35) return faceYellow;
        return faceRed;
    }

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

            <div style={{ marginTop: "10px", width: "100%"}}>
                {measurements ? (
                    <div style={{
                        width: "100%",
                        background: "rgba(23, 193, 223, 0.08)",
                        borderRadius: "14px",
                        padding: "16px",
                        boxSizing: "border-box",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid rgba(23, 193, 223, 0.2)",
                        boxShadow: "inset 0 0 10px rgba(23, 193, 223, 0.05)"
                    }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <p style={{ margin: "0", color: "#666", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Current PM2.5
                            </p>
                            <p style={{ margin: "0", color: "#222", fontSize: "24px", fontWeight: "700", display: "flex", alignItems: "baseline", gap: "4px" }}>
                                {measurements.pm25}
                                <span style={{ fontSize: "12px", fontWeight: "500", color: "#888" }}>µg/m³</span>
                            </p>
                        </div>
                        <div style={{
                            background: "white",
                            borderRadius: "50%",
                            padding: "6px",
                            display: "flex",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
                        }}>
                            <img
                                src={selectFaceByPm25()}
                                alt="Air quality status"
                                style={{
                                    width: "32px",
                                    height: "32px",
                                    flexShrink: 0
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <span style={{ fontSize: "10px", color: "#888" }}>Fetching data from OpenAQ...</span>
                )}
            </div>

            <div style={{ marginTop: "10px", width: "100%"}}>
                {measurements ? (
                    <p style={{ margin: "0", fontSize: "10px", color: "#888", textAlign:"end" }}>
                        Update: {new Date(measurements.datetime).toLocaleString()}
                    </p>
                ) : null}
            </div>

            <span onClick={onClose} style={{ cursor:'pointer', fontSize: "13px", color: "#c13b3b", alignSelf: "flex-end", marginTop: "4px", fontWeight: "bold" }}>
                Close
            </span>
        </div>
    )
}
