export default function Scale() {
    return (
        <div style={{
            backgroundColor: 'rgb(255,255,255)',
            padding: '8px 12px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
        }}>
            <span style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#333',
                letterSpacing: '0.05em'
            }}>Air Index</span>
            
            <div style={{
                width: '180px',
                height: '6px',
                borderRadius: '3px',
                background: 'linear-gradient(to right, #4ade80, #facc15, #f87171)',
                position: 'relative'
            }} />
            
            <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '9px',
                fontWeight: '500',
                color: '#666',
                marginTop: '-4px'
            }}>
                <span>Good</span>
                <span>Moderate</span>
                <span>Poor</span>
            </div>
        </div>
    )
}