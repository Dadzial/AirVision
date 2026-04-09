import {getIcon} from "../utils/IconParser.tsx";


export default function GpsButton () {
    const iconSrc = getIcon("gpsIcon")

    return (
        <button
            style={{
                padding: "10px 12px",
                background: "white",
                border: "1px solid #ccc",
                borderRadius: 4,
                cursor: "pointer",
                boxShadow: "inherit",
                transition: "box-shadow 0.2s",
            }}

        >
            <img src={iconSrc} alt="Home" style={{ width: 30, height: 30 }} />

        </button>
    );
}