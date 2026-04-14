import {BACKEND_URL} from "../config/config.ts";

export interface Predict {
    id: string;
    station_id: string;
    pm25Predicted: number;
}

export const FetchPm25Predict = async (): Promise<Predict[]> => {

}