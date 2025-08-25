export interface Location{
    location_id: string;
    country: string;
    city: string;
    region: string;
    latitude: number;
    longitude: number;
}

export const LocationSchema = {
    location_id: String,
    country: String,
    city: String,
    region: String,
    latitude: Number,
    longitude: Number,
}