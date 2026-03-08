import { getIcon } from "../utils/IconParser.tsx";

export default function Header() {
    return (
        <div style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            padding: "10px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            zIndex: 1000
        }}>
            <img
                src={getIcon('airIcon')}
                alt="AirVision"
                style={{
                    width: "24px",
                    height: "24px"
                }}
            />
            <span style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#333",
                letterSpacing: "0.5px"
            }}>
                AirVision
            </span>
        </div>
    );
}