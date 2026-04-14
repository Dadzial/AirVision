import { BACKEND_URL } from "../config/config.ts";

export interface Weather {
    id: number;
    station_id: number;
    lat: number;
    lng: number;
    timestamp: string;
    temperature: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    precipitation: number;
}

export const FetchWeather = async (stationId: number): Promise<Weather | null> => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/weather/station/${stationId}/latest`);

        if (!response.ok) {
            throw new Error(`Error fetching weather data: ${response.statusText}`);
        }

        const data: Weather = await response.json();
        return data ?? null;
    } catch (error) {
        console.error(error);
        return null;
    }
};
