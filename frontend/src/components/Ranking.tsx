export default function Ranking() {
    return (
        <div 
            style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1000,
                width: "25%",
                maxWidth: "600px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            }}
        >
            <button
                className="ranking-handle"
                style={{
                    width: "100%",
                    background: "white",
                    border: "none",
                    borderRadius: "12px 12px 0 0",
                    boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
                    padding: "8px 0",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.2s ease"
                }}
            >
                <div style={{
                    width: "40px",
                    height: "4px",
                    background: "#17C1DF",
                    borderRadius: "2px"
                }} />
                
                <span style={{
                    fontSize: 13, 
                    letterSpacing: "1px",
                    fontWeight: "600", 
                    color: "#444",
                    fontFamily: "'Poppins', sans-serif"
                }}>
                    Stations Ranking
                </span>
            </button>
            <style>{`
                .ranking-handle:hover {
                    background: #f9f9f9 !important;
                    padding-top: 10px !important;
                }
            `}</style>
        </div>
    );
}
