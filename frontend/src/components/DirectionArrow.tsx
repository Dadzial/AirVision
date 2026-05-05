import {getIcon} from "../utils/IconParser.tsx";

export interface DirectionArrowProps {
    degree?: number;
}

export default function DirectionArrow ({ degree = 0 }: DirectionArrowProps) {
    const windIcon = getIcon('windDeg');

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <button
                style={{
                    padding: "10px 12px",
                    background: "white",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    cursor: "default",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    transition: "box-shadow 0.2s",
                }}
                title={`Wind Direction: ${degree}°`}
            >
                <img
                    src={windIcon}
                    alt="Wind Direction" 
                    style={{ 
                        width: 30,
                        height: 30,
                        transform: `rotate(${degree}deg)`,
                        transition: "transform 0.5s ease-in-out",
                    }} 
                />
            </button>
        </div>
    );
}
