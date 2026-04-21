import { BACKEND_URL } from "../config/config.ts";

export interface Predictions {
    "1h": number | null;
    "3h": number | null;
    "12h": number | null;
    "24h": number | null;
}

export const fetchPm25Predict = async (station_id: number): Promise<Predictions | null> => {
    try {
        const response = await fetch(`${BACKEND_URL}/pm25/predict/${station_id}`);
        if (!response.ok) {
            throw new Error(`Error fetching predicts: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
};
