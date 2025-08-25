export interface Status{
    status_id: string;
    status_name: string;
    description: string;
}

export const StatusSchema = {
    status_id: String,
    status_name: String,
    description: String,
}