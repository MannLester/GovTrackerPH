export interface Comment {
  comment_id: string;
  project_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}
