import {Viewer, ImageryLayer, Entity} from "resium";
import {UrlTemplateImageryProvider, Ion, Cartesian3, NearFarScalar} from "cesium";
import {BACKEND_URL, CESIUM_ION_TOKEN} from "../config/config.ts";
import styles from './MainPage.module.css';
import HomeButton from "../components/HomeButton.tsx";
import SearchBar from "../components/SearchBar.tsx";
import Header from "../components/Header.tsx";
import CityPanel from "../components/CityPanel.tsx";
import {useEffect, useState, useRef} from "react";
import { fetchStations, type Station } from "../services/FetchStations.ts";
import {fetchMeasurements, type Measurement} from "../services/FetchMeasurements.ts";
import {fetchPm25Predict, type Predict} from "../services/FetchPm25Predict.ts";
import {getIcon} from "../utils/IconParser.tsx";
import Scale from "../components/Scale.tsx";
import GpsButton from "../components/GpsButton.tsx";
import RefreshButton from "../components/RefreshButton.tsx";
import { FetchWeather, type Weather } from "../services/FetchWeather.ts";

Ion.defaultAccessToken = CESIUM_ION_TOKEN;

export default function MainPage() {
    const homePosition = Cartesian3.fromDegrees(0, 50, 3600000);
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [selectedMeasurements, setSelectedMeasurements] = useState<Measurement[]>([]);
    const [weather, setWeather] = useState<Weather | null>(null);
    const [predict, setPredict] = useState<Predict | null>(null);
    const greenIcon = getIcon("greenStateIcon");
    const redIcon = getIcon("redStateIcon");
    const yellowIcon = getIcon("yellowStateIcon");
    const markerIcon = getIcon("markerIcon");

    const viewerRef =  useRef<any>(null);

    useEffect(() => {
       const loadAirStations = async () => {
         const  data = await fetchStations();
         setStations(data);
         setLoading(false);
       };

       loadAirStations();
    },[])

    useEffect(() => {
        const refreshPm25 = async () => {
            const response = await fetch(`${BACKEND_URL}/api/stations/pm25`);
            const data = await response.json();
            setStations(prev =>
                prev.map(station => {
                    const update = data.updates.find((u: any) => u.id === station.id);
                    return update ? { ...station, last_pm25: update.last_pm25 } : station;
                })
            );
        };

        const interval = setInterval(refreshPm25, 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (viewerRef.current && viewerRef.current.cesiumElement) {
                viewerRef.current.cesiumElement.camera.flyTo({
                    destination: homePosition,
                    duration: 2,
                });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleStationClick = async (station: Station) => {
        setSelectedStation(station);
        setSelectedMeasurements([]);
        setWeather(null);

        const measurementsParams = await fetchMeasurements(station.id);
        setSelectedMeasurements(measurementsParams);

        const weatherData = await FetchWeather(station.id);
        setWeather(weatherData);

        const predict = await fetchPm25Predict(station.id);
        setPredict(predict);

        if (viewerRef.current && viewerRef.current.cesiumElement) {
            const flyToPosition = Cartesian3.fromDegrees(station.lng, station.lat, 200000);
            viewerRef.current.cesiumElement.camera.flyTo({
                destination: flyToPosition,
                duration: 2,
            });
        }
    };

    const getStationIcon = (station: Station) => {
        const isSelected = selectedStation?.id === station.id;
        const liveVal = isSelected && selectedMeasurements.length > 0 ? selectedMeasurements[0].pm25 : null;

        const val = liveVal ?? station.last_pm25;
        
        if (val === null || val === undefined) return greenIcon;

        if (val <= 12) return greenIcon;
        if (val <= 35) return yellowIcon;
        return redIcon;
    }

    const handleGps = ({ lat, lng }: { lat: number; lng: number }) => {
        if (viewerRef.current && viewerRef.current.cesiumElement) {
            const flyToPosition = Cartesian3.fromDegrees(lng, lat, 200000);
            viewerRef.current.cesiumElement.camera.flyTo({
                destination: flyToPosition,
                duration: 2
            });
        }
    };

    return (
        <div className={styles.mainContainer}>
            <Header/>
            <Viewer
                ref={viewerRef}
                full
                baseLayerPicker={false}
                timeline={false}
                vrButton={false}
                animation={false}
                navigationHelpButton={false}
                fullscreenButton={false}
                sceneModePicker={false}
                homeButton={false}
                geocoder={false}
                infoBox={false}
                selectionIndicator={false}
            >

                {loading && (
                    <div className={styles.loadingPopup}>
                        Loading stations...
                    </div>
                )}

                <ImageryLayer
                    brightness={1.6}
                    contrast={1}
                    imageryProvider={
                        new UrlTemplateImageryProvider({
                            url: "https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=nXLbVYOK4nrLyi55xjql",
                            maximumLevel: 19,
                            credit: "© MapTiler © OpenStreetMap"
                        })
                    }
                />

                {stations.map(station => {
                    const position = Cartesian3.fromDegrees(station.lng, station.lat);
                    const isSelected = selectedStation?.id === station.id;

                    return (
                        <>
                            {isSelected && (
                                <Entity
                                    key={`marker-${station.id}`}
                                    name={`Selected: ${station.name}`}
                                    position={position}
                                    billboard={{
                                        image: markerIcon,
                                        scale: 0.08,
                                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                                    }}
                                />
                            )}
                            <Entity
                                key={station.id}
                                name={station.name}
                                position={position}
                                billboard={{
                                    image: getStationIcon(station),
                                    scaleByDistance: new NearFarScalar(
                                        2.0e5, 0.02,
                                        5.0e7, 0.001
                                    ),
                                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                                }}
                                onClick={() => handleStationClick(station)}
                            />
                        </>
                    );
                })}

            <div className={styles.controls}>

                <div className={styles.controlsTop}>
                    <SearchBar/>
                    <RefreshButton onStationsUpdate={setStations}/>
                    <HomeButton/>
                </div>
                
                {selectedStation && (
                    <CityPanel
                        onClose={() => {
                            setSelectedStation(null);
                            setSelectedMeasurements([]);
                            setWeather(null);
                            setPredict(null);
                        }}
                        station={selectedStation}
                        measurements={selectedMeasurements}
                        weather={weather}
                        pm25Prediction={predict ? predict.pm25Predicted : null}
                    />
                )}
            </div>

            <div className={styles.controlsBottomRight}>
                <Scale />
                <GpsButton onGps={handleGps} />
            </div>

            </Viewer>
        </div>
    );
}