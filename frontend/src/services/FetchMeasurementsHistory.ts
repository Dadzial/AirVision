import { BACKEND_URL } from "../config/config.ts";

export interface MeasurementHistory {
    pm25: number;
    datetime: string;
}

interface MeasurementHistoryResponse {
    measurementsHistory: MeasurementHistory[];
}

export const fetchMeasurementHistory = async (station_id: number): Promise<MeasurementHistory[]> => {
    try{
        const response = await fetch(`${BACKEND_URL}/api/measurements/${station_id}/history`);

        if (!response.ok) {
            throw new Error(`Error fetching measurement history: ${response.statusText}`);
        }

        const data = await response.json();
        return data.measurements;
    }catch(error){
        console.error(error);
        return [];
    }
}

