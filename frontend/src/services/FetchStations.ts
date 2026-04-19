import {BACKEND_URL} from "../config/config.ts";

export interface Station {
    id: number;
    name: string;
    city: string;
    country: string;
    lat: number;
    lng: number;
    pm25?: number | null;
    last_pm25?: number;
}

interface StationResponse {
    stations: Station[];
}

export const fetchStations = async (): Promise<Station[]> => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/stations`)

        if (!response.ok) {
            throw new Error(`Error fetching stations: ${response.statusText}`);
        }

        const data: StationResponse = await response.json();
        return data.stations;
    }catch (error) {
        console.error(error);
        return [];
    }
}
