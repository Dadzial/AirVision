import { Line } from 'react-chartjs-2';
import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend} from 'chart.js';
import { Station } from "../services/FetchStations";
import { Measurement } from "../services/FetchMeasurements.ts";
import { fetchMeasurementHistory, MeasurementHistory } from "../services/FetchMeasurementsHistory.ts";
import { type Weather } from "../services/FetchWeather.ts";
import { Predictions } from "../services/FetchPm25Predict.ts";
import { getFlagByCountryCode } from "../utils/FlagParser";
import {getIcon} from "../utils/IconParser.tsx";
import { useEffect, useState } from 'react';

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
    const [history, setHistory] = useState<MeasurementHistory[]>([]);

    useEffect(() => {
        setHistory([]);
        fetchMeasurementHistory(station.id).then(setHistory);
    }, [station.id]);

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

    const chartData = {
        labels: history.map(m => m.datetime ? new Date(m.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""),
        datasets: [
            {
                label: 'PM2.5 (µg/m³)',
                data: history.map(m => m.pm25),
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
            padding: "12px 14px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "6px",
            overflowY: "auto",
            maxHeight: "calc(100vh - 130px)",
        }}
        >
            <span style={{ fontSize: "17px", fontWeight: "600", color: "#17C1DF", display: "flex", alignItems: "center", gap: "7px", wordBreak: "break-word" }}>
                {flagSrc && (
                    <img
                        src={flagSrc}
                        alt={`${station.country} flag`}
                        style={{ width: "22px", height: "auto", flexShrink: 0 }}
                    />
                )}
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#666" }}>
                    {station.country}
                </span>
                <div style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "#666" }}></div>
                {displayLocation}
            </span>

            {!isSame && (
                <span style={{ fontSize: "12px", color: "#888", wordBreak: "break-word", marginTop: "-3px" }}>
                    Station: {station.name}
                </span>
            )}

            <div style={{ marginTop: "2px", width: "100%"}}>
                {latestMeasurement ? (
                    <div style={{
                        width: "100%",
                        background: "rgba(23, 193, 223, 0.08)",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        boxSizing: "border-box",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid rgba(23, 193, 223, 0.2)",
                    }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                            <p style={{ margin: "0", color: "#666", fontWeight: "600", fontSize: "11px",letterSpacing: "0.5px" }}>
                                Current PM2.5
                            </p>
                            <p style={{ margin: "0", color: "#222", fontSize: "22px", fontWeight: "700", display: "flex", alignItems: "baseline", gap: "4px" }}>
                                {latestMeasurement.pm25}
                                <span style={{ fontSize: "11px", fontWeight: "500", color: "#888" }}>µg/m³</span>
                            </p>
                        </div>
                        <div style={{
                            background: "white",
                            borderRadius: "50%",
                            padding: "5px",
                            display: "flex",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                        }}>
                            <img
                                src={selectFaceByPm25()}
                                alt="Air quality status"
                                style={{
                                    width: "30px",
                                    height: "30px",
                                    flexShrink: 0
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <span style={{ fontSize: "10px", color: "#888" }}>Fetching data from OpenAQ...</span>
                )}
            </div>

            <div style={{ margin: "0", width: "100%"}}>
                {latestMeasurement ? (
                    <p style={{ fontSize: "10px", color: "#888", textAlign:"end", margin: 0 }}>
                        Update: {new Date(latestMeasurement.datetime).toLocaleString()}
                    </p>
                ) : null}
            </div>
            <div style={{ margin: "0", width: "100%" }}>
                {weather ? (
                    <>
                    <div style={{
                        width: "100%",
                        background: "rgba(23, 193, 223, 0.06)",
                        borderRadius: "10px",
                        padding: "10px",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        border: "1px solid rgba(23, 193, 223, 0.15)",
                        alignItems: "flex-start"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: 12, color: "#666", letterSpacing: 0.5 }}>Weather</span>
                        </div>
                        <div style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            width: "100%",
                            justifyContent: "space-between"
                        }}>
                            {[
                                { label: "Temp", value: weather.temperature?.toFixed(1), unit: "°C" },
                                { label: "Hum", value: weather.humidity?.toFixed(0), unit: "%" },
                                { label: "Wind", value: weather.wind_speed?.toFixed(1), unit: "m/s" },
                                { label: "Prec", value: weather.precipitation?.toFixed(1), unit: "mm" },
                                { label: "Pres", value: weather.pressure?.toFixed(0), unit: "hPa" }
                            ].map((item, idx) => (
                                <div key={idx} style={{
                                    flex: "1 1 55px",
                                    minWidth: 0,
                                    background: "#fff",
                                    borderRadius: 8,
                                    padding: "6px 2px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    boxShadow: "0 1px 4px rgba(23,193,223,0.05)",
                                    border: "1px solid #e0f7fa"
                                }}>
                                    <span style={{ fontSize: 10, color: "#17C1DF", fontWeight: 500 }}>{item.label}</span>
                                    <span style={{ fontSize: 15, fontWeight: 700, color: "#222" }}>{item.value || "-"}<span style={{ fontSize: 10, color: "#888", fontWeight: 400 }}>{item.unit}</span></span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{
                        width: "100%",
                        background: isPredictLoading ? "rgba(23, 193, 223, 0.12)" : "rgba(23, 193, 223, 0.06)",
                        animation: isPredictLoading ? "pulse 1.5s infinite ease-in-out" : "none",
                        borderRadius: "10px",
                        padding: "10px",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        border: "1px solid rgba(23, 193, 223, 0.15)",
                        alignItems: "flex-start",
                        marginTop: 6
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: 12, color: "#666", letterSpacing: 0.5}}>Forecast PM2.5:</span>
                            {isPredictLoading && (
                                <span style={{ fontSize: 10, color: "#17C1DF", fontWeight: 500, fontStyle: "italic" }}>Loading...</span>
                            )}
                        </div>
                        <div style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            width: "100%",
                            justifyContent: "space-between"
                        }}>
                            {[
                                { label: "+1h", value: pm25Predictions?.["1h"] },
                                { label: "+3h", value: pm25Predictions?.["3h"] },
                                { label: "+12h", value: pm25Predictions?.["12h"] },
                                { label: "+24h", value: pm25Predictions?.["24h"] }
                            ].map((item, idx) => (
                                <div key={idx} style={{
                                    flex: "1 1 65px",
                                    minWidth: 0,
                                    background: "#fff",
                                    borderRadius: 8,
                                    padding: "6px 2px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    boxShadow: "0 1px 4px rgba(23,193,223,0.05)",
                                    border: "1px solid #e0f7fa"
                                }}>
                                    <span style={{ fontSize: 10, color: "#17C1DF", fontWeight: 500 }}>{item.label}</span>
                                    <span style={{ fontSize: 15, fontWeight: 700, color: "#222", display: "flex", alignItems: "center", gap: 2 }}>
                                        {renderPredictionValue(item.value)}
                                        <span style={{ fontSize: 10, color: "#888", fontWeight: 400 }}>µg/m³</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    </>
                ) : (
                    <span style={{ fontSize: "10px", color: "#888" }}>Fetching weather data...</span>
                )}
            </div>
            <div style={{ width: "100%", marginTop: "8px" }}>
                <span style={{ fontWeight: 600, fontSize: 12, color: "#666", letterSpacing: 0.5, marginBottom: "4px", display: "block" }}>
                    PM2.5 History (Last 24h)
                </span>
                <div style={{ height: "150px", width: "100%" }}>
                    {history.length > 0 ? (
                        <Line data={chartData} options={chartOptions}/>
                    ) : (
                        <div style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(23, 193, 223, 0.05)",
                            borderRadius: "10px",
                            color: "#888",
                            fontSize: "12px"
                        }}>
                            No measurement data available
                        </div>
                    )}
                </div>
            </div>
            <span onClick={onClose} style={{ cursor:'pointer', fontSize: "13px", color: "#c13b3b", alignSelf: "flex-end", marginTop: "4px", fontWeight: "bold" }}>
                Close
            </span>
        </div>
    )
}
