import {useCesium} from "resium";
import {Cartesian3} from "cesium";

export default function HomeCameraButton () {
    const {viewer} = useCesium();
    const homePosition = Cartesian3.fromDegrees(0, 50, 3600000);


    const goHome = () => {
        if (viewer) {
            viewer.scene.camera.flyTo({
                destination: homePosition,
                duration: 2
            });
        }
    };

    return (
        <button
            style={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 1000,
                padding: "8px 12px",
                background: "white",
                border: "1px solid #ccc",
                borderRadius: 4,
                cursor: "pointer"
            }}
            onClick={goHome}
        >
            Home
        </button>
    );
}