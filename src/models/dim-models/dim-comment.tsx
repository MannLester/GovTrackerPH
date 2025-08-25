export interface Comment {
  commentId: string;
  userId: string;
  projectId: string;
  content: string;
  createdAt: Date;
  parentCommentId: string;
}
