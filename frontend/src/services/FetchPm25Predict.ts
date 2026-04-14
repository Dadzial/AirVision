import { BACKEND_URL } from "../config/config.ts";

export interface Predict {
    pm25Predicted: number;
}

export const fetchPm25Predict = async (station_id: number): Promise<Predict | null> => {
    try {
        const response = await fetch(`${BACKEND_URL}/pm25/next_hour/${station_id}`);
        if (!response.ok) {
            throw new Error(`Error fetching predicts: ${response.statusText}`);
        }
        const data = await response.json();
        return { pm25Predicted: data.pm25_next_hour };
    } catch (error) {
        console.error(error);
        return null;
    }
};
