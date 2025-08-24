export interface Comment {
  id: string
  author: string
  avatar: string
  content: string
  timestamp: string
  likes: number
  dislikes: number
  replies: Comment[]
}
