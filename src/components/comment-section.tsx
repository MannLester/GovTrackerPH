"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown, Reply, Flag } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { AuthService } from "@/lib/auth/supabase-auth"

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
  username: string;
  profile_picture: string | null;
  like_count: number;
  dim_user?: {
    username: string;
    first_name: string;
    last_name: string;
    profile_picture: string | null;
  } | null;
}

export function CommentSection({ projectId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [newReply, setNewReply] = useState("") // Simple string state like newComment
  const [submitting, setSubmitting] = useState(false) // For main comments only
  const [replySubmitting, setReplySubmitting] = useState(false) // Simple boolean like submitting
  
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null)
  
  const { user, signInWithGoogle } = useAuth()

  // Proper cursor position management for controlled textarea
  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const cursorPosition = e.target.selectionStart
    const newValue = e.target.value
    
    setNewReply(newValue)
    
    // Restore cursor position after React re-render using requestAnimationFrame
    requestAnimationFrame(() => {
      if (replyTextareaRef.current) {
        replyTextareaRef.current.setSelectionRange(cursorPosition, cursorPosition)
      }
    })
  }

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
          const commentsWithReplies = mainComments.map((comment: ApiComment) => {
            const userName = comment.dim_user?.username || comment.username || 'Unknown User';
            
            return {
              commentId: comment.comment_id,
              userId: comment.user_id,
              projectId: comment.project_id,
              content: comment.content,
              createdAt: comment.created_at,
              parentCommentId: comment.parent_comment_id,
              userName: userName,
              userAvatar: comment.dim_user?.profile_picture || comment.profile_picture,
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
                  userName: reply.dim_user?.username || reply.username || 'Unknown User',
                  userAvatar: reply.dim_user?.profile_picture || reply.profile_picture,
                  likes: reply.like_count || 0,
                  dislikes: 0
                }))
            };
          });
          
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

    if (!user) {
      // Ask user to sign in
      try {
        await signInWithGoogle()
      } catch (error) {
        console.error('Sign in error:', error)
        setError('Please sign in to post a comment')
        return
      }
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      // Get Firebase ID token for authentication
      const token = await AuthService.getIdToken()
      if (!token) {
        throw new Error('Failed to get authentication token')
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          content: newComment.trim(),
          parent_comment_id: null
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post comment')
      }

      if (data.success) {
        // Add the new comment to the list
        const newCommentData: CommentWithUser = {
          commentId: data.data.comment_id,
          userId: data.data.user_id,
          projectId: data.data.project_id,
          content: data.data.content,
          createdAt: data.data.created_at,
          parentCommentId: data.data.parent_comment_id,
          userName: data.data.dim_user?.username || data.data.username || user.email || 'You',
          userAvatar: data.data.dim_user?.profile_picture || data.data.profile_picture || user.profile_picture,
          likes: 0,
          dislikes: 0,
          replies: [],
        }

        setComments([newCommentData, ...comments])
        setNewComment("")
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      setError(error instanceof Error ? error.message : 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async () => {
    if (!newReply.trim() || !replyingTo) return

    if (!user) {
      // Ask user to sign in
      try {
        await signInWithGoogle()
      } catch (error) {
        console.error('Sign in error:', error)
        setError('Please sign in to post a reply')
        return
      }
      return
    }

    try {
      setReplySubmitting(true)
      setError(null)

      // Get Firebase ID token for authentication
      const token = await AuthService.getIdToken()
      if (!token) {
        throw new Error('Failed to get authentication token')
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          content: newReply.trim(),
          parent_comment_id: replyingTo
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post reply')
      }

      if (data.success) {
        // Add the new reply to the parent comment
        const newReplyData: CommentWithUser = {
          commentId: data.data.comment_id,
          userId: data.data.user_id,
          projectId: data.data.project_id,
          content: data.data.content,
          createdAt: data.data.created_at,
          parentCommentId: data.data.parent_comment_id,
          userName: data.data.dim_user?.username || data.data.username || user.email || 'You',
          userAvatar: data.data.dim_user?.profile_picture || data.data.profile_picture || user.profile_picture,
          likes: 0,
          dislikes: 0,
        }

        setComments(
          comments.map((comment) =>
            comment.commentId === replyingTo ? { 
              ...comment, 
              replies: [...(comment.replies || []), newReplyData] 
            } : comment,
          ),
        )
        // Clear the reply and close reply form
        setNewReply("")
        setReplyingTo(null)
      }
    } catch (error) {
      console.error('Error posting reply:', error)
      setError(error instanceof Error ? error.message : 'Failed to post reply')
    } finally {
      setReplySubmitting(false)
    }
  }

const CommentItem = ({ 
  comment, 
  isReply = false
}: { 
  comment: CommentWithUser; 
  isReply?: boolean;
}) => (
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
                ref={replyTextareaRef}
                placeholder="Write a reply..."
                value={newReply}
                onChange={handleReplyChange}
                className="min-h-[80px] bg-white text-black placeholder:text-gray-500 border border-gray-300"
                autoFocus
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleSubmitReply} disabled={replySubmitting}>
                  {replySubmitting ? "Posting..." : "Post Reply"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)} disabled={replySubmitting}>
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
            <CommentItem 
              key={reply.commentId} 
              comment={reply} 
              isReply={true}
            />
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
            placeholder={user ? "Share your thoughts about this project..." : "Please sign in to comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] bg-white text-black placeholder:text-gray-500 border border-gray-300"
            disabled={!user}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">
              {user ? "Be respectful and constructive in your feedback" : "You must be signed in to post comments"}
            </span>
            <Button 
              onClick={handleSubmitComment} 
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? "Posting..." : user ? "Post Comment" : "Sign In to Comment"}
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
            <CommentItem 
              key={comment.commentId} 
              comment={comment}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
