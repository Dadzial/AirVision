

interface CityPanelProps {
    onClose: () => void;
}

export default function CityPanel({onClose}: CityPanelProps) {


    return (
        <div style={{
            width: "100%",
            boxSizing: "border-box",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            padding: "14px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "4px",
        }}
        >
            <span style={{ fontSize: "15px", fontWeight: "500", color: "#666"}}>
                Poland
            </span>
            <span style={{ fontSize: "18px", fontWeight: "600", color: "#17C1DF", wordBreak: "break-word" }}>
            </span>
            <span onClick={onClose} style={{ cursor:'pointer', fontSize: "13px", color: "#aaa", alignSelf: "flex-end", marginTop: "4px" }}>
                Close
            </span>
        </div>
    )
}
