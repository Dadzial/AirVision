export const AIR_QUALITY_COLORS = {
    GOOD: "#4ade80",
    MODERATE: "#facc15",
    SENSITIVE: "#fb923c",
    UNHEALTHY: "#f87171",
    VERY_UNHEALTHY: "#a855f7",
    HAZARDOUS: "#7f1d1d",
    UNKNOWN: "#9ca3af"
};

const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
};

const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
};

const interpolate = (color1: string, color2: string, factor: number) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const r = rgb1[0] + factor * (rgb2[0] - rgb1[0]);
    const g = rgb1[1] + factor * (rgb2[1] - rgb1[1]);
    const b = rgb1[2] + factor * (rgb2[2] - rgb1[2]);
    return rgbToHex(r, g, b);
};

export const getAirQualityColor = (pm25: number | null | undefined): string => {
    if (pm25 === null || pm25 === undefined) return AIR_QUALITY_COLORS.UNKNOWN;
    
    if (pm25 <= 15) {
        return interpolate(AIR_QUALITY_COLORS.GOOD, AIR_QUALITY_COLORS.MODERATE, pm25 / 15);
    } else if (pm25 <= 35) {
        return interpolate(AIR_QUALITY_COLORS.MODERATE, AIR_QUALITY_COLORS.SENSITIVE, (pm25 - 15) / (35 - 15));
    } else if (pm25 <= 55) {
        return interpolate(AIR_QUALITY_COLORS.SENSITIVE, AIR_QUALITY_COLORS.UNHEALTHY, (pm25 - 35) / (55 - 35));
    } else if (pm25 <= 100) {
        return interpolate(AIR_QUALITY_COLORS.UNHEALTHY, AIR_QUALITY_COLORS.VERY_UNHEALTHY, (pm25 - 55) / (100 - 55));
    } else if (pm25 <= 150) {
        return interpolate(AIR_QUALITY_COLORS.VERY_UNHEALTHY, AIR_QUALITY_COLORS.HAZARDOUS, (pm25 - 100) / (150 - 100));
    } else {
        return AIR_QUALITY_COLORS.HAZARDOUS;
    }
};

export const getStationIconSvg = (pm25: number | null | undefined): string => {
    const color = getAirQualityColor(pm25);
    const darkerColor = interpolate(color, "#000000", 0.2);

    const svg = `<?xml version="1.0" encoding="utf-8"?>
<svg width="527" height="527" viewBox="0 0 527 527" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="gradient_1" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="matrix(0 256 -256 0 256 256)">
      <stop offset="0" stop-color="${color}" />
      <stop offset="1" stop-color="${darkerColor}" stop-opacity="0.5" />
    </radialGradient>
    <filter color-interpolation-filters="sRGB" x="-510" y="-510" width="512" height="512" id="filter_2">
      <feFlood flood-opacity="0" result="BackgroundImageFix_1" />
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix_1" result="Shape_2" />
      <feGaussianBlur stdDeviation="2.5" />
    </filter>
  </defs>
  <path d="M0 256C0 114.615 114.615 0 256 0C397.385 0 512 114.615 512 256C512 397.385 397.385 512 256 512C114.615 512 0 397.385 0 256Z" fill="url(#gradient_1)" fill-rule="evenodd" filter="url(#filter_2)" transform="translate(7.5 7.5)" />
</svg>`;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const getFaceIconSvg = (pm25: number | null | undefined): string => {
    const color = getAirQualityColor(pm25);
    
    let path = "";
    if (pm25 === null || pm25 === undefined || pm25 <= 15) {
        // Happy
        path = "M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14M15 9H15.01M9 9H9.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM15.5 9C15.5 9.27614 15.2761 9.5 15 9.5C14.7239 9.5 14.5 9.27614 14.5 9C14.5 8.72386 14.7239 8.5 15 8.5C15.2761 8.5 15.5 8.72386 15.5 9ZM9.5 9C9.5 9.27614 9.27614 9.5 9 9.5C8.72386 9.5 8.5 9.27614 8.5 9C8.5 8.72386 8.72386 8.5 9 8.5C9.27614 8.5 9.5 8.72386 9.5 9Z";
    } else if (pm25 <= 35) {
        // Slightly less happy but still smiling (Happy face reused)
        path = "M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14M15 9H15.01M9 9H9.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM15.5 9C15.5 9.27614 15.2761 9.5 15 9.5C14.7239 9.5 14.5 9.27614 14.5 9C14.5 8.72386 14.7239 8.5 15 8.5C15.2761 8.5 15.5 8.72386 15.5 9ZM9.5 9C9.5 9.27614 9.27614 9.5 9 9.5C8.72386 9.5 8.5 9.27614 8.5 9C8.5 8.72386 8.72386 8.5 9 8.5C9.27614 8.5 9.5 8.72386 9.5 9Z";
    } else if (pm25 <= 55) {
        // Neutral
        path = "M8 15H16M15 9H15.01M9 9H9.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM15.5 9C15.5 9.27614 15.2761 9.5 15 9.5C14.7239 9.5 14.5 9.27614 14.5 9C14.5 8.72386 14.7239 8.5 15 8.5C15.2761 8.5 15.5 8.72386 15.5 9ZM9.5 9C9.5 9.27614 9.27614 9.5 9 9.5C8.72386 9.5 8.5 9.27614 8.5 9C8.5 8.72386 8.72386 8.5 9 8.5C9.27614 8.5 9.5 8.72386 9.5 9Z";
    } else {
        // Sad
        path = "M16 16C16 16 14.5 14 12 14C9.5 14 8 16 8 16M15 9H15.01M9 9H9.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM15.5 9C15.5 9.27614 15.2761 9.5 15 9.5C14.7239 9.5 14.5 9.27614 14.5 9C14.5 8.72386 14.7239 8.5 15 8.5C15.2761 8.5 15.5 8.72386 15.5 9ZM9.5 9C9.5 9.27614 9.27614 9.5 9 9.5C8.72386 9.5 8.5 9.27614 8.5 9C8.5 8.72386 8.72386 8.5 9 8.5C9.27614 8.5 9.5 8.72386 9.5 9Z";
    }

    const svg = `<?xml version="1.0" encoding="utf-8"?>
<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g> <path d="${path}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </g>
</svg>`;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
};
