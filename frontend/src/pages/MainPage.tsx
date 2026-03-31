import {Viewer, ImageryLayer,CameraFlyTo,Entity} from "resium";
import { UrlTemplateImageryProvider, Ion, Cartesian3 } from "cesium";
import { CESIUM_ION_TOKEN } from "../config/config.ts";
import styles from './MainPage.module.css';
import HomeButton from "../components/HomeButton.tsx";
import SearchBar from "../components/SearchBar.tsx";
import Header from "../components/Header.tsx";
import {useEffect, useState} from "react";
import { fetchStations, type Station } from "../services/FetchStations.ts";
import {getIcon} from "../utils/IconParser.tsx";

Ion.defaultAccessToken = CESIUM_ION_TOKEN;

export default function MainPage() {
    const homePosition = Cartesian3.fromDegrees(0, 50, 3600000);
    const [stations, setStations] = useState<Station[]>([]);
    const [loading,setLoading] = useState<boolean>(true);
    const greenIcon = getIcon("greenStateIcon")

    useEffect(() => {
       const loadAirStations = async () => {
         const  data = await fetchStations();
         setStations(data);
         setLoading(false);
       };

       loadAirStations();
    },[])

    return (
        <div className={styles.mainContainer}>
            <Header/>
            <Viewer
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
            >
                {loading && (
                    <div className={styles.loadingPopup}>
                        Loading stations...
                    </div>
                )}

                <div className={styles.controls}>
                    <SearchBar/>
                    <HomeButton/>
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
                <CameraFlyTo destination={homePosition}  />

                {stations.map(station => (
                    <Entity
                        key={station.id}
                        name={station.name}
                        description={`Localization: ${station.city} (${station.country})`}
                        position={Cartesian3.fromDegrees(station.lng, station.lat)}
                        billboard={{
                            image: greenIcon,
                            scale: 0.01,
                            disableDepthTestDistance: Number.POSITIVE_INFINITY
                        }}
                    />
                ))}
            </Viewer>
        </div>
    );
}