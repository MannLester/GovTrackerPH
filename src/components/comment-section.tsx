"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown, Reply, Flag } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { AuthService } from "@/lib/auth/supabase-auth"
// import { formatDistanceToNow } from "date-fns" // Not available, using simple date formatting

interface CommentSectionProps {
  projectId: string
}

interface Comment {
  comment_id: string
  content: string
  created_at: string
  username: string
  profile_picture: string | null
  parent_comment_id: string | null
  project_id: string
  user_id: string
  updated_at: string
  is_deleted: boolean
  like_count: number
  likes: number
  dislikes: number
  userVote?: 'like' | 'dislike' | null
  replies?: Comment[]
}

interface CommentWithUser extends Comment {
  // User info
  userName: string;
  userAvatar: string | null;
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
  likes: number;
  dislikes: number;
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
  const [visibleReplies, setVisibleReplies] = useState<Set<string>>(new Set()) // Track which comments have visible replies
  
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
              comment_id: comment.comment_id,
              user_id: comment.user_id,
              project_id: comment.project_id,
              content: comment.content,
              created_at: comment.created_at,
              updated_at: comment.created_at,
              is_deleted: false,
              parent_comment_id: comment.parent_comment_id,
              username: userName,
              profile_picture: comment.dim_user?.profile_picture || comment.profile_picture,
              like_count: comment.likes || 0,
              likes: comment.likes || 0,
              dislikes: comment.dislikes || 0,
              userName: userName,
              userAvatar: comment.dim_user?.profile_picture || comment.profile_picture,
              replies: replies
                .filter((reply: ApiComment) => reply.parent_comment_id === comment.comment_id)
                .map((reply: ApiComment) => ({
                  comment_id: reply.comment_id,
                  user_id: reply.user_id,
                  project_id: reply.project_id,
                  content: reply.content,
                  created_at: reply.created_at,
                  updated_at: reply.created_at,
                  is_deleted: false,
                  parent_comment_id: reply.parent_comment_id,
                  username: reply.dim_user?.username || reply.username || 'Unknown User',
                  profile_picture: reply.dim_user?.profile_picture || reply.profile_picture,
                  like_count: reply.likes || 0,
                  likes: reply.likes || 0,
                  dislikes: reply.dislikes || 0
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
          comment_id: data.data.comment_id,
          user_id: data.data.user_id,
          project_id: data.data.project_id,
          content: data.data.content,
          created_at: data.data.created_at,
          updated_at: data.data.created_at,
          is_deleted: false,
          parent_comment_id: data.data.parent_comment_id,
          username: data.data.dim_user?.username || data.data.username || user.email || 'You',
          profile_picture: data.data.dim_user?.profile_picture || data.data.profile_picture || user.profile_picture,
          like_count: 0,
          likes: 0,
          dislikes: 0,
          userName: data.data.dim_user?.username || data.data.username || user.email || 'You',
          userAvatar: data.data.dim_user?.profile_picture || data.data.profile_picture || user.profile_picture,
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
          comment_id: data.data.comment_id,
          user_id: data.data.user_id,
          project_id: data.data.project_id,
          content: data.data.content,
          created_at: data.data.created_at,
          updated_at: data.data.created_at,
          is_deleted: false,
          parent_comment_id: data.data.parent_comment_id,
          username: data.data.dim_user?.username || data.data.username || user.email || 'You',
          profile_picture: data.data.dim_user?.profile_picture || data.data.profile_picture || user.profile_picture,
          like_count: 0,
          likes: 0,
          dislikes: 0,
          userName: data.data.dim_user?.username || data.data.username || user.email || 'You',
          userAvatar: data.data.dim_user?.profile_picture || data.data.profile_picture || user.profile_picture,
        }

        const updatedComments = comments.map(comment => {
          if (comment.comment_id === replyingTo) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReplyData]
            }
          }
          return comment
        })
        setComments(updatedComments)
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

  const handleCommentVote = async (commentId: string, voteType: "like" | "dislike") => {
    if (!user) {
      try {
        await signInWithGoogle()
        return
      } catch (error) {
        console.error('Sign in error:', error)
        return
      }
    }

    try {
      const token = await AuthService.getIdToken()
      if (!token) {
        throw new Error('Failed to get authentication token')
      }

      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ voteType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote')
      }

      if (data.success) {
        // Update the comment in the state
        const updateCommentVote = (comment: CommentWithUser): CommentWithUser => {
          if (comment.comment_id === commentId) {
            return {
              ...comment,
              likes: data.data.likes,
              dislikes: data.data.dislikes,
              userVote: data.data.userVote
            }
          }
          
          // Update replies if they exist
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(updateCommentVote as (reply: Comment) => CommentWithUser)
            }
          }
          
          return comment
        }

        setComments(comments.map(updateCommentVote as (comment: CommentWithUser) => CommentWithUser))
      }
    } catch (error) {
      console.error('Error voting on comment:', error)
      setError(error instanceof Error ? error.message : 'Failed to vote')
    }
  }

  // Toggle reply visibility
  const toggleRepliesVisibility = (commentId: string) => {
    setVisibleReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  // Comment Item Component
  const CommentItem = ({ comment, isReply = false }: { comment: CommentWithUser; isReply?: boolean }) => (
    <div className={`flex space-x-3 ${isReply ? 'ml-8 pt-3 border-l-2 border-gray-100 pl-4' : ''}`}>
      <Avatar className="w-8 h-8">
        <AvatarImage src={comment.userAvatar || undefined} />
        <AvatarFallback>{comment.userName?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm text-foreground">{comment.userName || 'Unknown User'}</span>
          <div className="text-sm text-muted-foreground">
            {new Date(comment.created_at).toLocaleDateString()}
          </div>
        </div>
        <p className="text-sm text-foreground">{comment.content}</p>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center space-x-1 ${comment.userVote === 'like' ? 'text-blue-600' : 'text-gray-500'}`}
            onClick={() => handleCommentVote(comment.comment_id, 'like')}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{comment.likes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center space-x-1 ${comment.userVote === 'dislike' ? 'text-red-600' : 'text-gray-500'}`}
            onClick={() => handleCommentVote(comment.comment_id, 'dislike')}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>{comment.dislikes}</span>
          </Button>

          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(comment.comment_id)}
            >
              <Reply className="w-4 h-4 mr-1" />
              Reply
            </Button>
          )}

          {!isReply && comment.replies && comment.replies.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleRepliesVisibility(comment.comment_id)}
              className="text-blue-600 hover:text-blue-700"
            >
              {visibleReplies.has(comment.comment_id) ? 'Hide Replies' : `View Replies (${comment.replies.length})`}
            </Button>
          )}
        </div>

        {replyingTo === comment.comment_id && (
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

        {comment.replies && comment.replies.length > 0 && visibleReplies.has(comment.comment_id) && (
          <div className="space-y-3 mt-3">
            {comment.replies.map((reply: Comment) => (
              <CommentItem 
                key={reply.comment_id} 
                comment={reply as CommentWithUser} 
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
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
            <div key={comment.comment_id}>
              <CommentItem 
                comment={comment}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
