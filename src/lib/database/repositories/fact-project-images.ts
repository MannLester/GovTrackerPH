import { supabase, handleSupabaseError } from '../client';
import { FactProjectImages } from '@/models/fact-models/fact-project-images';

export class FactProjectImagesRepository {
  async getImagesByProjectId(projectId: string): Promise<FactProjectImages[]> {
    try {
      const { data, error } = await supabase
        .from('fact_project_images')
        .select('image_id, project_id, image_url, caption, created_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map((item: {
        image_id: string;
        project_id: string;
        image_url: string;
        caption: string;
        created_at: string;
      }) => ({
        imageId: item.image_id,
        projectId: item.project_id,
        imageUrl: item.image_url,
        caption: item.caption,
        uploadedAt: new Date(item.created_at),
      }));
    } catch (error) {
      console.error('❌ Error fetching project images:', error);
      const errorDetails = handleSupabaseError(error, 'getImagesByProjectId');
      throw new Error(errorDetails.error);
    }
  }
}

export const factProjectImagesRepository = new FactProjectImagesRepository();
