export interface Stats {
    stats_id: string;
    title: string;
    value: number;
    description: string;
    icon: string;
}

export const StatsSchema = {
    stats_id: String,
    title: String,
    value: Number,
    description: String,
    icon: String,
}