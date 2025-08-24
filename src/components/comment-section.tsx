"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown, Reply, Flag } from "lucide-react"
import { useState } from "react"
import { Comment } from "@/models/comment-model"

interface CommentSectionProps {
  projectId: string
}

// Mock comments data
const mockComments: Comment[] = [
  {
    id: "1",
    author: "Maria Santos",
    avatar: "/filipino-woman-avatar.png",
    content:
      "This subway project is exactly what Metro Manila needs! The traffic situation has been getting worse every year. I hope they can finish this on schedule.",
    timestamp: "2 hours ago",
    likes: 24,
    dislikes: 2,
    replies: [
      {
        id: "1-1",
        author: "Juan Dela Cruz",
        avatar: "/filipino-man-avatar.png",
        content:
          "I agree! But I'm concerned about the budget. ₱357 billion is a huge amount. I hope there's proper oversight.",
        timestamp: "1 hour ago",
        likes: 12,
        dislikes: 1,
        replies: [],
      },
    ],
  },
  {
    id: "2",
    author: "Carlos Reyes",
    avatar: "/filipino-businessman-avatar.png",
    content:
      "As someone who commutes daily from QC to Makati, this project can't come soon enough. The current MRT system is overcrowded and unreliable.",
    timestamp: "4 hours ago",
    likes: 18,
    dislikes: 0,
    replies: [],
  },
  {
    id: "3",
    author: "Ana Gonzales",
    avatar: "/filipino-professional-woman-avatar.png",
    content:
      "I'm worried about the environmental impact. Has there been a proper environmental assessment? We need to make sure this doesn't harm our communities.",
    timestamp: "6 hours ago",
    likes: 15,
    dislikes: 8,
    replies: [
      {
        id: "3-1",
        author: "Engineer Mike Torres",
        avatar: "/filipino-engineer-avatar.png",
        content:
          "Good point Ana. From what I know, they did conduct environmental impact studies. The project actually reduces carbon emissions by providing clean public transport.",
        timestamp: "5 hours ago",
        likes: 22,
        dislikes: 1,
        replies: [],
      },
    ],
  },
]

export function CommentSection({ projectId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const handleSubmitComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      author: "You",
      avatar: "/diverse-user-avatars.png",
      content: newComment,
      timestamp: "Just now",
      likes: 0,
      dislikes: 0,
      replies: [],
    }

    setComments([comment, ...comments])
    setNewComment("")
  }

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim()) return

    const reply: Comment = {
      id: `${parentId}-${Date.now()}`,
      author: "You",
      avatar: "/diverse-user-avatars.png",
      content: replyContent,
      timestamp: "Just now",
      likes: 0,
      dislikes: 0,
      replies: [],
    }

    setComments(
      comments.map((comment) =>
        comment.id === parentId ? { ...comment, replies: [...comment.replies, reply] } : comment,
      ),
    )
    setReplyContent("")
    setReplyingTo(null)
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`space-y-3 ${isReply ? "ml-12 border-l-2 border-border pl-4" : ""}`}>
      <div className="flex space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.avatar || "/placeholder.svg"} alt={comment.author} />
          <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm text-foreground">{comment.author}</span>
            <span className="text-xs text-gray-500">{comment.timestamp}</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <ThumbsUp className="w-3 h-3 mr-1" />
              {comment.likes}
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <ThumbsDown className="w-3 h-3 mr-1" />
              {comment.dislikes}
            </Button>
            {!isReply && (
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setReplyingTo(comment.id)}>
                <Reply className="w-3 h-3 mr-1" />
                Reply
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500">
              <Flag className="w-3 h-3 mr-1" />
              Report
            </Button>
          </div>

          {replyingTo === comment.id && (
            <div className="space-y-2 mt-3">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px] bg-white text-black placeholder:text-gray-500 border border-gray-300"
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
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

      {comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
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
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
