import {getIcon} from "../utils/IconParser.tsx";

export interface LayerButtonProps {
    switchLayer: () => void;
    isVisible: boolean;
}

export default function LayerButton ({ switchLayer, isVisible }: LayerButtonProps) {
    const layerIcon = getIcon("layerIcon");
    const pointsIcon = getIcon("pointsIcon");

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <button
                onClick={switchLayer}
                style={{
                    padding: "10px 12px",
                    background: "white",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    transition: "box-shadow 0.2s",
                }}
                title="Toggle Europe Layer"
            >
                <img 
                    src={isVisible ? pointsIcon : layerIcon} 
                    alt="Layer Icon" 
                    style={{ width: 30, height: 30 }} 
                />
            </button>
        </div>
    );
}
