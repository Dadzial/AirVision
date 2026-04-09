import {Viewer, ImageryLayer, Entity} from "resium";
import { UrlTemplateImageryProvider, Ion, Cartesian3  } from "cesium";
import { CESIUM_ION_TOKEN } from "../config/config.ts";
import styles from './MainPage.module.css';
import HomeButton from "../components/HomeButton.tsx";
import SearchBar from "../components/SearchBar.tsx";
import Header from "../components/Header.tsx";
import CityPanel from "../components/CityPanel.tsx";
import {useEffect, useState, useRef} from "react";
import { fetchStations, type Station } from "../services/FetchStations.ts";
import {fetchMeasurements, type Measurement} from "../services/FetchMeasurements.ts";
import {getIcon} from "../utils/IconParser.tsx";

Ion.defaultAccessToken = CESIUM_ION_TOKEN;

export default function MainPage() {
    const homePosition = Cartesian3.fromDegrees(0, 50, 3600000);
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [selectedMeasurements, setSelectedMeasurements] = useState<Measurement[]>([]);
    const greenIcon = getIcon("greenStateIcon");

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

        const measurementsParams = await fetchMeasurements(station.id);
        setSelectedMeasurements(measurementsParams);

        if (viewerRef.current && viewerRef.current.cesiumElement) {
            const flyToPosition = Cartesian3.fromDegrees(station.lng, station.lat, 200000);
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

                <div className={styles.controls}>

                    <div className={styles.controlsTop}>
                        <SearchBar/>
                        <HomeButton/>
                    </div>

                    {selectedStation && (
                        <CityPanel
                            onClose={() => {
                                setSelectedStation(null);
                                setSelectedMeasurements([]);
                            }}
                            station={selectedStation}
                            measurements={selectedMeasurements.length > 0 ? selectedMeasurements[0] : null}
                        />
                    )}
                </div>

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

                    return (
                        <Entity
                            key={station.id}
                            name={station.name}
                            position={position}
                            billboard={{
                                image: greenIcon,
                                scale: 0.01,
                                disableDepthTestDistance: Number.POSITIVE_INFINITY
                            }}
                            onClick={() => handleStationClick(station)}
                        />
                    );
                })}

            </Viewer>
        </div>
    );
}