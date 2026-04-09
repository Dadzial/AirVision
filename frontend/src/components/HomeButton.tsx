import {useCesium} from "resium";
import {Cartesian3} from "cesium";
import {getIcon} from "../utils/IconParser.tsx";

export default function HomeButton () {
    const { viewer } = useCesium();
    const homePosition = Cartesian3.fromDegrees(0, 50, 3600000);
    const iconSrc = getIcon("homeIcon");

    const goHome = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (viewer) {
            viewer.camera.flyTo({
                destination: homePosition,
                duration: 2
            });
        }
    };

    return (
        <button
            style={{
                padding: "8px 12px",
                background: "white",
                border: "1px solid #ccc",
                borderRadius: 4,
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "box-shadow 0.2s",
                pointerEvents: "auto"
            }}
            onClick={goHome}
        >
            <img src={iconSrc} alt="Home" style={{ width: 30, height: 30 }} />

        </button>
    );
}