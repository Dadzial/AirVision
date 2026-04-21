import { Line } from 'react-chartjs-2';
import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend} from 'chart.js';
import { Station } from "../services/FetchStations";
import { Measurement } from "../services/FetchMeasurements.ts";
import { type Weather } from "../services/FetchWeather.ts";
import { Predictions } from "../services/FetchPm25Predict.ts";
import { getFlagByCountryCode } from "../utils/FlagParser";
import {getIcon} from "../utils/IconParser.tsx";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface CityPanelProps {
    station: Station;
    measurements: Measurement[];
    weather: Weather | null;
    onClose: () => void;
    pm25Predictions: Predictions | null;
    isPredictLoading: boolean;
}

export default function CityPanel({onClose , station , measurements, weather, pm25Predictions, isPredictLoading}: CityPanelProps) {

    const flagSrc = getFlagByCountryCode(station.country || "");
    const faceGreen = getIcon("faceGreen")
    const faceYellow = getIcon("faceYellow")
    const faceRed = getIcon("faceRed")

    const displayLocation = (station.city && station.city !== "null") ? station.city : (station.name || "Unknown");
    const isSame = (station.city === station.name) || !station.city;
    
    const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;

    const selectFaceByPm25 = () => {
        if (!latestMeasurement || latestMeasurement.pm25 === undefined || latestMeasurement.pm25 === null) return faceGreen;
        const pm25 = latestMeasurement.pm25;
        if (pm25 <= 15) return faceGreen;
        if (pm25 <= 35) return faceYellow;
        return faceRed;
    }

    const recentMeasurements = measurements.slice(-24);
    const chartData = {
        labels: recentMeasurements.map(m => m.datetime ? new Date(m.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""),
        datasets: [
            {
                label: 'PM2.5 (µg/m³)',
                data: recentMeasurements.map(m => m.pm25),
                borderColor: '#17C1DF',
                backgroundColor: 'rgba(23, 193, 223, 0.2)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#17C1DF',
                pointRadius: 3,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    font: {
                        size: 9
                    }
                }
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 9
                    }
                }
            },
        },
    };

    const renderPredictionValue = (val: number | null | undefined) => {
        if (isPredictLoading) return <span style={{ color: "#aaa" }}>...</span>;
        return val !== null && val !== undefined ? val.toFixed(1) : "-";
    };

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
            gap: "5px",
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
                {latestMeasurement ? (
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
                            <p style={{ margin: "0", color: "#666", fontWeight: "600", fontSize: "12px",letterSpacing: "0.5px" }}>
                                Current PM2.5
                            </p>
                            <p style={{ margin: "0", color: "#222", fontSize: "24px", fontWeight: "700", display: "flex", alignItems: "baseline", gap: "4px" }}>
                                {latestMeasurement.pm25}
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
                {latestMeasurement ? (
                    <p style={{ fontSize: "10px", color: "#888", textAlign:"end", margin: 0 }}>
                        Update: {new Date(latestMeasurement.datetime).toLocaleString()}
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
                            <span style={{ fontWeight: 600, fontSize: 13, color: "#666", letterSpacing: 0.5 }}>Weather</span>
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
                    <div style={{
                        width: "100%",
                        background: isPredictLoading ? "rgba(23, 193, 223, 0.15)" : "rgba(23, 193, 223, 0.10)",
                        animation: isPredictLoading ? "pulse 1.5s infinite ease-in-out" : "none",
                        borderRadius: "14px",
                        padding: "14px 10px 10px 10px",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        border: "1px solid rgba(23, 193, 223, 0.25)",
                        boxShadow: "inset 0 0 10px rgba(23, 193, 223, 0.07)",
                        alignItems: "flex-start",
                        marginTop: 12
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: 13, color: "#666", letterSpacing: 0.5}}>PM2.5 for next hours :</span>
                            {isPredictLoading && (
                                <span style={{ fontSize: 10, color: "#17C1DF", fontWeight: 500, fontStyle: "italic" }}>Loading prediction...</span>
                            )}
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
                                boxShadow: "0 2px 8px rgba(23, 193, 223, 0.07)",
                                border: "1px solid #e0f7fa"
                            }}>
                                <span style={{ fontSize: 11, color: "#17C1DF", fontWeight: 500 }}>+1h</span>
                                <span style={{ fontSize: 17, fontWeight: 700, color: "#222", display: "flex", alignItems: "center", gap: 4 }}>
                                    {renderPredictionValue(pm25Predictions?.["1h"])}
                                    <span style={{ fontSize: 11, color: "#888", marginLeft: 4 }}>µg/m³</span>
                                </span>
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
                                boxShadow: "0 2px 8px rgba(23, 193, 223, 0.07)",
                                border: "1px solid #e0f7fa"
                            }}>
                                <span style={{ fontSize: 11, color: "#17C1DF", fontWeight: 500 }}>+3h</span>
                                <span style={{ fontSize: 17, fontWeight: 700, color: "#222", display: "flex", alignItems: "center", gap: 4 }}>
                                    {renderPredictionValue(pm25Predictions?.["3h"])}
                                    <span style={{ fontSize: 11, color: "#888", marginLeft: 4 }}>µg/m³</span>
                                </span>
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
                                boxShadow: "0 2px 8px rgba(23, 193, 223, 0.07)",
                                border: "1px solid #e0f7fa"
                            }}>
                                <span style={{ fontSize: 11, color: "#17C1DF", fontWeight: 500 }}>+12h</span>
                                <span style={{ fontSize: 17, fontWeight: 700, color: "#222", display: "flex", alignItems: "center", gap: 4 }}>
                                    {renderPredictionValue(pm25Predictions?.["12h"])}
                                    <span style={{ fontSize: 11, color: "#888", marginLeft: 4 }}>µg/m³</span>
                                </span>
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
                                boxShadow: "0 2px 8px rgba(23, 193, 223, 0.07)",
                                border: "1px solid #e0f7fa"
                            }}>
                                <span style={{ fontSize: 11, color: "#17C1DF", fontWeight: 500 }}>+24h</span>
                                <span style={{ fontSize: 17, fontWeight: 700, color: "#222", display: "flex", alignItems: "center", gap: 4 }}>
                                    {renderPredictionValue(pm25Predictions?.["24h"])}
                                    <span style={{ fontSize: 11, color: "#888", marginLeft: 4 }}>µg/m³</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    </>
                ) : (
                    <span style={{ fontSize: 10, color: "#888" }}>Fetching weather data...</span>
                )}
            </div>
            {recentMeasurements.length > 0 && (
                <div style={{ width: "100%", marginTop: "15px" }}>
                    <span style={{ fontWeight: 600, fontSize: 12, color: "#666", letterSpacing: 0.5, marginBottom: "8px", display: "block" }}>
                        PM2.5 History (Last 24h)
                    </span>
                    <div style={{ height: "180px", width: "100%" }}>
                        <Line data={chartData} options={chartOptions}/>
                    </div>
                </div>
            )}
            <span onClick={onClose} style={{ cursor:'pointer', fontSize: "13px", color: "#c13b3b", alignSelf: "flex-end", marginTop: "10px", fontWeight: "bold" }}>
                Close
            </span>
        </div>
    )
}
