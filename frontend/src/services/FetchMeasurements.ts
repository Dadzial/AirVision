import { BACKEND_URL } from "../config/config.ts";

export interface Measurement {
    pm25: number;
    datetime: string;
}

interface MeasurementResponse {
    measurements: Measurement[];
}

export const fetchMeasurements = async (station_id: number): Promise<Measurement[]> => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/measurements/${station_id}`);

        if (!response.ok) {
            throw new Error(`Error fetching pm25: ${response.statusText}`);
        }

        const data: MeasurementResponse = await response.json();
        return data.measurements;

    } catch (error) {
        console.error(error);
        return [];
    }
}
