import { Station } from "../services/FetchStations";
import { Measurement } from "../services/FetchMeasurements.ts";
import {type Weather } from "../services/FetchWeather.ts";
import { getFlagByCountryCode } from "../utils/FlagParser";
import {getIcon} from "../utils/IconParser.tsx";

interface CityPanelProps {
    station: Station;
    measurements: Measurement | null;
    weather: Weather | null;
    onClose: () => void;
}

export default function CityPanel({onClose , station , measurements, weather}: CityPanelProps) {

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

            <div style={{ marginTop: "2px", width: "100%"}}>
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

            <div style={{ margin: "2px 0 0 0", width: "100%"}}>
                {measurements ? (
                    <p style={{ fontSize: "10px", color: "#888", textAlign:"end", margin: 0 }}>
                        Update: {new Date(measurements.datetime).toLocaleString()}
                    </p>
                ) : null}
            </div>
            <div style={{ margin: "2px 0 0 0", width: "100%" }}>
                {weather ? (
                    <>
                    <div style={{
                        width: "100%",
                        background: "rgba(23, 193, 223, 0.10)",
                        borderRadius: "14px",
                        padding: "14px 10px 10px 10px",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        border: "1px solid rgba(23, 193, 223, 0.25)",
                        boxShadow: "inset 0 0 10px rgba(23, 193, 223, 0.07)",
                        alignItems: "flex-start"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: 13, color: "#666", letterSpacing: 0.5, textTransform: "uppercase" }}>Weather</span>
                        </div>
                        <div style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                            width: "100%",
                            justifyContent: "space-between"
                        }}>
                            <div style={{
                                flex: "1 1 80px",
                                minWidth: 0,
                                background: "#fff",
                                borderRadius: 10,
                                padding: "8px 6px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                boxShadow: "0 2px 8px rgba(23,193,223,0.07)",
                                border: "1px solid #e0f7fa"
                            }}>
                                <span style={{ fontSize: 11, color: "#17C1DF", fontWeight: 500 }}>Temperature</span>
                                <span style={{ fontSize: 17, fontWeight: 700, color: "#222" }}>{weather.temperature !== undefined && weather.temperature !== null ? weather.temperature.toFixed(1) : "-"}<span style={{ fontSize: 11, color: "#888" }}>°C</span></span>
                            </div>
                            <div style={{
                                flex: "1 1 80px",
                                minWidth: 0,
                                background: "#fff",
                                borderRadius: 10,
                                padding: "8px 6px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                boxShadow: "0 2px 8px rgba(23,193,223,0.07)",
                                border: "1px solid #e0f7fa"
                            }}>
                                <span style={{ fontSize: 11, color: "#17C1DF", fontWeight: 500 }}>Humidity</span>
                                <span style={{ fontSize: 17, fontWeight: 700, color: "#222" }}>{weather.humidity !== undefined && weather.humidity !== null ? weather.humidity.toFixed(0) : "-"}<span style={{ fontSize: 11, color: "#888" }}>%</span></span>
                            </div>
                            <div style={{
                                flex: "1 1 80px",
                                minWidth: 0,
                                background: "#fff",
                                borderRadius: 10,
                                padding: "8px 6px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                boxShadow: "0 2px 8px rgba(23,193,223,0.07)",
                                border: "1px solid #e0f7fa"
                            }}>
                                <span style={{ fontSize: 11, color: "#17C1DF", fontWeight: 500 }}>Wind</span>
                                <span style={{ fontSize: 17, fontWeight: 700, color: "#222" }}>{weather.wind_speed !== undefined && weather.wind_speed !== null ? weather.wind_speed.toFixed(1) : "-"}<span style={{ fontSize: 11, color: "#888" }}>m/s</span></span>
                            </div>
                            <div style={{
                                flex: "1 1 80px",
                                minWidth: 0,
                                background: "#fff",
                                borderRadius: 10,
                                padding: "8px 6px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                boxShadow: "0 2px 8px rgba(23,193,223,0.07)",
                                border: "1px solid #e0f7fa"
                            }}>
                                <span style={{ fontSize: 11, color: "#17C1DF", fontWeight: 500 }}>Precipitation</span>
                                <span style={{ fontSize: 17, fontWeight: 700, color: "#222" }}>{weather.precipitation !== undefined && weather.precipitation !== null ? weather.precipitation.toFixed(1) : "-"}<span style={{ fontSize: 11, color: "#888" }}>mm</span></span>
                            </div>
                            <div style={{
                                flex: "1 1 80px",
                                minWidth: 0,
                                background: "#fff",
                                borderRadius: 10,
                                padding: "8px 6px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                boxShadow: "0 2px 8px rgba(23,193,223,0.07)",
                                border: "1px solid #e0f7fa"
                            }}>
                                <span style={{ fontSize: 11, color: "#17C1DF", fontWeight: 500 }}>Pressure</span>
                                <span style={{ fontSize: 17, fontWeight: 700, color: "#222" }}>{weather.pressure !== undefined && weather.pressure !== null ? weather.pressure.toFixed(0) : "-"}<span style={{ fontSize: 11, color: "#888" }}>hPa</span></span>
                            </div>
                        </div>
                    </div>
                    <span style={{ fontSize: 10, color: "#888", fontWeight: 400, marginTop: 10, alignSelf: "flex-end", display: "block", width: "100%", textAlign: "right" }}>
                        {weather.timestamp ? `Weather update: ${new Date(weather.timestamp).toLocaleString()}` : "-"}
                    </span>
                    </>
                ) : (
                    <span style={{ fontSize: 10, color: "#888" }}>Fetching weather data...</span>
                )}
            </div>
            <span onClick={onClose} style={{ cursor:'pointer', fontSize: "13px", color: "#c13b3b", alignSelf: "flex-end", marginTop: "4px", fontWeight: "bold" }}>
                Close
            </span>
        </div>
    )
}
