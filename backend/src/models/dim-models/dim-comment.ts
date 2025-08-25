export interface Comment {
  comment_id: string;
  user_id: string;
  project_id: string;
  content: string;
  created_at: Date;
  parent_comment_id: string;
}

export const CommentSchema = {
    comment_id: String,
    user_id: String,
    project_id: String,
    content: String,
    created_at: Date,
    parent_comment_id: String,
}