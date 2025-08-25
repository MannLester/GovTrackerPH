export interface Location {
    location_id: string;
    region: string;
    province: string;
    city: string;
    barangay?: string;
    address_details?: string;
    latitude?: number;
    longitude?: number;
    created_at?: Date;
    updated_at?: Date;
}

// CRUD Interfaces
export interface CreateLocationRequest {
    region: string;
    province: string;
    city: string;
    barangay?: string;
    address_details?: string;
    latitude?: number;
    longitude?: number;
}

export interface UpdateLocationRequest {
    region?: string;
    province?: string;
    city?: string;
    barangay?: string;
    address_details?: string;
    latitude?: number;
    longitude?: number;
}

export interface DeleteLocationRequest {
    location_id: string;
}

export interface GetLocationRequest {
    location_id: string;
}

export const LocationSchema = {
    location_id: String,
    region: String,
    province: String,
    city: String,
    barangay: String,
    address_details: String,
    latitude: Number,
    longitude: Number,
    created_at: Date,
    updated_at: Date
}