import {Viewer, ImageryLayer,CameraFlyTo} from "resium";
import { UrlTemplateImageryProvider, Ion, Cartesian3 } from "cesium";
import { CESIUM_ION_TOKEN } from "../config/config.ts";
import styles from './MainPage.module.css';
import HomeCameraButton from "../components/HomeCameraButton.tsx";
import SearchBar from "../components/SearchBar.tsx";
import Header from "../components/Header.tsx";


Ion.defaultAccessToken = CESIUM_ION_TOKEN;

export default function MainPage() {
    const homePosition = Cartesian3.fromDegrees(0, 50, 3600000);

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
                <div className={styles.controls}>
                    <SearchBar/>
                    <HomeCameraButton/>
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
            </Viewer>
        </div>
    );
}