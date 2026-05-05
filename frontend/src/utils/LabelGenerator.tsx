export function createCountryLabelCanvas(flagUrl: string, countryName: string): Promise<HTMLCanvasElement> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const paddingX = 10;
            const paddingY = 6;
            const targetFlagHeight = 14;
            const spacing = 8;
            

            const aspectRatio = img.width / img.height;
            const flagWidth = targetFlagHeight * aspectRatio;
            const flagHeight = targetFlagHeight;
            
            const fontSize = 12;
            const fontWeight = '600';
            const fontFamily = 'Poppins, "Open Sans", helvetica, arial, sans-serif';
            ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
            
            const textMetrics = ctx.measureText(countryName);
            const textWidth = textMetrics.width;
            
            const totalWidth = paddingX * 2 + flagWidth + spacing + textWidth;
            const totalHeight = Math.max(flagHeight, fontSize) + paddingY * 2;


            const scale = 2;
            canvas.width = totalWidth * scale;
            canvas.height = totalHeight * scale;
            ctx.scale(scale, scale);


            ctx.fillStyle = 'white';
            const radius = 6;
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.lineTo(totalWidth - radius, 0);
            ctx.quadraticCurveTo(totalWidth, 0, totalWidth, radius);
            ctx.lineTo(totalWidth, totalHeight - radius);
            ctx.quadraticCurveTo(totalWidth, totalHeight, totalWidth - radius, totalHeight);
            ctx.lineTo(radius, totalHeight);
            ctx.quadraticCurveTo(0, totalHeight, 0, totalHeight - radius);
            ctx.lineTo(0, radius);
            ctx.quadraticCurveTo(0, 0, radius, 0);
            ctx.closePath();
            

            ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetY = 1;
            ctx.fill();
            
            ctx.shadowColor = 'transparent';


            const flagY = (totalHeight - flagHeight) / 2;
            ctx.drawImage(img, paddingX, flagY, flagWidth, flagHeight);


            ctx.fillStyle = '#333333';
            ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
            ctx.textBaseline = 'middle';
            ctx.fillText(countryName, paddingX + flagWidth + spacing, totalHeight / 2);

            resolve(canvas);
        };
        img.onerror = () => {
            console.error(`Failed to load flag: ${flagUrl}`);
            resolve(document.createElement('canvas'));
        };
        img.src = flagUrl;
    });
}
