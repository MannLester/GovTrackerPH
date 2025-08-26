"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown, Reply, Flag } from "lucide-react"
import { useState, useEffect } from "react"

interface CommentSectionProps {
  projectId: string
}

interface CommentWithUser {
  commentId: string;
  userId: string;
  projectId: string;
  content: string;
  createdAt: string;
  parentCommentId: string | null;
  // User info
  userName: string;
  userAvatar: string | null;
  // Additional fields we might get from API
  likes?: number;
  dislikes?: number;
  replies?: CommentWithUser[];
}

interface ApiComment {
  comment_id: string;
  user_id: string;
  project_id: string;
  content: string;
  created_at: string;
  parent_comment_id: string | null;
  author_name: string;
  author_avatar: string | null;
  like_count: number;
}

export function CommentSection({ projectId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  console.log('🔍 CommentSection rendered with projectId:', projectId)

  // Fetch comments from the API
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log(`Fetching comments for project: ${projectId}`)
        const response = await fetch(`/api/comments?projectId=${projectId}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('Comments API response:', data)
        
        if (data.success && data.data?.comments) {
          // Organize comments with their replies
          const mainComments = data.data.comments.filter((comment: ApiComment) => !comment.parent_comment_id)
          const replies = data.data.comments.filter((comment: ApiComment) => comment.parent_comment_id)
          
          // Attach replies to their parent comments
          const commentsWithReplies = mainComments.map((comment: ApiComment) => ({
            commentId: comment.comment_id,
            userId: comment.user_id,
            projectId: comment.project_id,
            content: comment.content,
            createdAt: comment.created_at,
            parentCommentId: comment.parent_comment_id,
            userName: comment.author_name || 'Unknown User',
            userAvatar: comment.author_avatar,
            likes: comment.like_count || 0,
            dislikes: 0, // TODO: Add dislikes support
            replies: replies
              .filter((reply: ApiComment) => reply.parent_comment_id === comment.comment_id)
              .map((reply: ApiComment) => ({
                commentId: reply.comment_id,
                userId: reply.user_id,
                projectId: reply.project_id,
                content: reply.content,
                createdAt: reply.created_at,
                parentCommentId: reply.parent_comment_id,
                userName: reply.author_name || 'Unknown User',
                userAvatar: reply.author_avatar,
                likes: reply.like_count || 0,
                dislikes: 0
              }))
          }))
          
          setComments(commentsWithReplies)
        } else {
          setComments([])
        }
      } catch (err) {
        console.error('Error fetching comments:', err)
        setError(err instanceof Error ? err.message : 'Failed to load comments')
        setComments([])
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      console.log('🚀 Triggering fetchComments for projectId:', projectId)
      fetchComments()
    } else {
      console.log('⚠️ No projectId provided, skipping fetchComments')
    }
  }, [projectId])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    // TODO: Implement API call to create new comment
    const comment: CommentWithUser = {
      commentId: Date.now().toString(),
      userId: "current-user", // TODO: Get from auth context
      projectId: projectId,
      content: newComment,
      createdAt: new Date().toISOString(),
      parentCommentId: null,
      userName: "You",
      userAvatar: "/diverse-user-avatars.png",
      likes: 0,
      dislikes: 0,
      replies: [],
    }

    setComments([comment, ...comments])
    setNewComment("")
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return

    // TODO: Implement API call to create new reply
    const reply: CommentWithUser = {
      commentId: `${parentId}-${Date.now()}`,
      userId: "current-user", // TODO: Get from auth context
      projectId: projectId,
      content: replyContent,
      createdAt: new Date().toISOString(),
      parentCommentId: parentId,
      userName: "You",
      userAvatar: "/diverse-user-avatars.png",
      likes: 0,
      dislikes: 0,
      replies: [],
    }

    setComments(
      comments.map((comment) =>
        comment.commentId === parentId ? { 
          ...comment, 
          replies: [...(comment.replies || []), reply] 
        } : comment,
      ),
    )
    setReplyContent("")
    setReplyingTo(null)
  }

  const CommentItem = ({ comment, isReply = false }: { comment: CommentWithUser; isReply?: boolean }) => (
    <div className={`space-y-3 ${isReply ? "ml-12 border-l-2 border-border pl-4" : ""}`}>
      <div className="flex space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.userAvatar || "/placeholder.svg"} alt={comment.userName} />
          <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm text-foreground">{comment.userName}</span>
            <span className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <ThumbsUp className="w-3 h-3 mr-1" />
              {comment.likes || 0}
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <ThumbsDown className="w-3 h-3 mr-1" />
              {comment.dislikes || 0}
            </Button>
            {!isReply && (
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setReplyingTo(comment.commentId)}>
                <Reply className="w-3 h-3 mr-1" />
                Reply
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500">
              <Flag className="w-3 h-3 mr-1" />
              Report
            </Button>
          </div>

          {replyingTo === comment.commentId && (
            <div className="space-y-2 mt-3">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px] bg-white text-black placeholder:text-gray-500 border border-gray-300"
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => handleSubmitReply(comment.commentId)}>
                  Post Reply
                </Button>
                <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.commentId} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between font-[family-name:var(--font-space-grotesk)]">
          <span>Comments ({comments.length})</span>
          <Button variant="outline" size="sm">
            Sort by: Most Recent
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Comment Form */}
        <div className="space-y-3">
          <Textarea
            placeholder="Share your thoughts about this project..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] bg-white text-black placeholder:text-gray-500 border border-gray-300"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Be respectful and constructive in your feedback</span>
            <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
              Post Comment
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {loading && <p>Loading comments...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!loading && !error && comments.length === 0 && (
            <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
          )}
          {!loading && !error && comments.map((comment) => (
            <CommentItem key={comment.commentId} comment={comment} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
