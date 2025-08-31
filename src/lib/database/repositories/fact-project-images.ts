import { supabase, handleSupabaseError } from '../client';
import { FactProjectImages } from '@/models/fact-models/fact-project-images';

export class FactProjectImagesRepository {
  async getImagesByProjectId(project_id: string): Promise<FactProjectImages[]> {
    try {
      console.log(`[FactProjectImages] Fetching images for project: ${project_id}`);
      const { data, error } = await supabase
        .from('fact_project_images')
        .select('image_id, project_id, image_url, caption, is_primary, uploaded_by, created_at')
        .eq('project_id', project_id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      console.log(`[FactProjectImages] Found ${data?.length || 0} images for project ${project_id}:`, data);
      return (data || []).map((item: {
        image_id: string;
        project_id: string;
        image_url: string;
        caption: string;
        is_primary: boolean;
        uploaded_by: string;
        created_at: string;
      }) => ({
        image_id: item.image_id,
        project_id: item.project_id,
        image_url: item.image_url,
        caption: item.caption,
        is_primary: item.is_primary,
        uploaded_by: item.uploaded_by,
        created_at: new Date(item.created_at),
      }));
    } catch (error) {
      console.error('❌ Error fetching project images:', error);
      const errorDetails = handleSupabaseError(error, 'getImagesByProjectId');
      throw new Error(errorDetails.error);
    }
  }
}

export const factProjectImagesRepository = new FactProjectImagesRepository();
