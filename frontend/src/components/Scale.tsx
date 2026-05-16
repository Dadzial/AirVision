import { useState, useEffect } from 'react';

export default function Scale() {
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => setIsSmallScreen(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{
            backgroundColor: 'rgb(255,255,255)',
            padding: isSmallScreen ? '10px 8px' : '8px 12px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: isSmallScreen ? 'row' : 'column',
            alignItems: 'center',
            gap: isSmallScreen ? '8px' : '4px',
        }}>
            <span style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#333',
                letterSpacing: '0.05em',
                writingMode: isSmallScreen ? 'vertical-lr' : 'horizontal-tb',
                transform: isSmallScreen ? 'rotate(180deg)' : 'none',
                textAlign: 'center'
            }}>Air Index</span>
            
            <div style={{
                width: isSmallScreen ? '6px' : '240px',
                height: isSmallScreen ? '160px' : '6px',
                borderRadius: '3px',
                background: isSmallScreen 
                    ? 'linear-gradient(to bottom, #7f1d1d, #a855f7, #f87171, #fb923c, #facc15, #4ade80)' 
                    : 'linear-gradient(to right, #4ade80, #facc15, #fb923c, #f87171, #a855f7, #7f1d1d)',
                position: 'relative'
            }} />
            
            <div style={{
                width: isSmallScreen ? 'auto' : '100%',
                height: isSmallScreen ? '160px' : 'auto',
                display: 'flex',
                flexDirection: isSmallScreen ? 'column-reverse' : 'row',
                justifyContent: 'space-between',
                fontSize: '8px',
                fontWeight: '500',
                color: '#666',
                marginTop: isSmallScreen ? '0' : '-4px'
            }}>
                <span>Good</span>
                <span>Moderate</span>
                <span>Unhealthy+</span>
                <span>Poor</span>
                <span>Very Poor</span>
                <span>Hazardous</span>
            </div>
        </div>
    )
}
