export interface FactProjectImages{
    image_id: string;
    project_id: string;
    image_url: string;
    caption: string;
    uploaded_at: Date;
}

export const FactProjectImagesSchema = {
    image_id: String,
    project_id: String,
    image_url: String,
    caption: String,
    uploaded_at: Date,
}
