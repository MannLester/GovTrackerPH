import express from 'express';
import { query } from '../config/database.js';
import { authenticateFirebaseUser, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/comments/project/:projectId - Get comments for a project
router.get('/project/:projectId', optionalAuth, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const commentsQuery = `
            SELECT 
                c.*,
                u.first_name || ' ' || u.last_name as author_name,
                u.profile_picture as author_avatar,
                COALESCE(like_count.count, 0) as like_count,
                CASE 
                    WHEN cl.user_id IS NOT NULL THEN true 
                    ELSE false 
                END as is_liked_by_user,
                reply_count.count as reply_count
            FROM dim_comment c
            LEFT JOIN dim_user u ON c.user_id = u.user_id
            LEFT JOIN (
                SELECT comment_id, COUNT(*) as count
                FROM fact_comment_likes 
                GROUP BY comment_id
            ) like_count ON c.comment_id = like_count.comment_id
            LEFT JOIN fact_comment_likes cl ON c.comment_id = cl.comment_id 
                ${req.user ? `AND cl.user_id = $4` : 'AND cl.user_id IS NULL'}
            LEFT JOIN (
                SELECT parent_comment_id, COUNT(*) as count
                FROM dim_comment 
                WHERE parent_comment_id IS NOT NULL AND is_deleted = FALSE
                GROUP BY parent_comment_id
            ) reply_count ON c.comment_id = reply_count.parent_comment_id
            WHERE c.project_id = $1 
                AND c.parent_comment_id IS NULL 
                AND c.is_deleted = FALSE
            ORDER BY c.created_at DESC
            LIMIT $2 OFFSET $3
        `;

        const queryParams = [projectId, limit, offset];
        if (req.user) {
            queryParams.push(req.user.user_id);
        }

        const result = await query(commentsQuery, queryParams);

        // Get total count
        const countResult = await query(`
            SELECT COUNT(*) 
            FROM dim_comment 
            WHERE project_id = $1 AND parent_comment_id IS NULL AND is_deleted = FALSE
        `, [projectId]);

        const totalCount = parseInt(countResult.rows[0].count);

        res.json({
            success: true,
            data: {
                comments: result.rows,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch comments'
        });
    }
});

// GET /api/comments/:commentId/replies - Get replies to a comment
router.get('/:commentId/replies', optionalAuth, async (req, res) => {
    try {
        const { commentId } = req.params;

        const repliesQuery = `
            SELECT 
                c.*,
                u.first_name || ' ' || u.last_name as author_name,
                u.profile_picture as author_avatar,
                COALESCE(like_count.count, 0) as like_count,
                CASE 
                    WHEN cl.user_id IS NOT NULL THEN true 
                    ELSE false 
                END as is_liked_by_user
            FROM dim_comment c
            LEFT JOIN dim_user u ON c.user_id = u.user_id
            LEFT JOIN (
                SELECT comment_id, COUNT(*) as count
                FROM fact_comment_likes 
                GROUP BY comment_id
            ) like_count ON c.comment_id = like_count.comment_id
            LEFT JOIN fact_comment_likes cl ON c.comment_id = cl.comment_id 
                ${req.user ? `AND cl.user_id = $2` : 'AND cl.user_id IS NULL'}
            WHERE c.parent_comment_id = $1 AND c.is_deleted = FALSE
            ORDER BY c.created_at ASC
        `;

        const queryParams = [commentId];
        if (req.user) {
            queryParams.push(req.user.user_id);
        }

        const result = await query(repliesQuery, queryParams);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching replies:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch replies'
        });
    }
});

// POST /api/comments/project/:projectId - Add comment to project
router.post('/project/:projectId', authenticateFirebaseUser, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { content, parent_comment_id } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Comment content is required'
            });
        }

        const result = await query(`
            INSERT INTO dim_comment (user_id, project_id, content, parent_comment_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [req.user.user_id, projectId, content.trim(), parent_comment_id || null]);

        // Get the created comment with user info
        const commentWithUser = await query(`
            SELECT 
                c.*,
                u.first_name || ' ' || u.last_name as author_name,
                u.profile_picture as author_avatar,
                0 as like_count,
                false as is_liked_by_user
            FROM dim_comment c
            LEFT JOIN dim_user u ON c.user_id = u.user_id
            WHERE c.comment_id = $1
        `, [result.rows[0].comment_id]);

        res.status(201).json({
            success: true,
            data: commentWithUser.rows[0]
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create comment'
        });
    }
});

// PUT /api/comments/:id - Update comment (author only)
router.put('/:id', authenticateFirebaseUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Comment content is required'
            });
        }

        // Check if user owns the comment
        const ownershipCheck = await query(
            'SELECT user_id FROM dim_comment WHERE comment_id = $1',
            [id]
        );

        if (ownershipCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            });
        }

        if (ownershipCheck.rows[0].user_id !== req.user.user_id) {
            return res.status(403).json({
                success: false,
                error: 'You can only edit your own comments'
            });
        }

        const result = await query(`
            UPDATE dim_comment 
            SET content = $1, updated_at = NOW()
            WHERE comment_id = $2
            RETURNING *
        `, [content.trim(), id]);

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update comment'
        });
    }
});

// DELETE /api/comments/:id - Delete comment (soft delete)
router.delete('/:id', authenticateFirebaseUser, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user owns the comment or is admin
        const comment = await query(
            'SELECT user_id FROM dim_comment WHERE comment_id = $1',
            [id]
        );

        if (comment.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            });
        }

        const isOwner = comment.rows[0].user_id === req.user.user_id;
        const isAdmin = ['admin', 'super-admin'].includes(req.user.role);

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'You can only delete your own comments'
            });
        }

        // Soft delete
        await query(`
            UPDATE dim_comment 
            SET is_deleted = TRUE, updated_at = NOW()
            WHERE comment_id = $1
        `, [id]);

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete comment'
        });
    }
});

// POST /api/comments/:id/like - Like/unlike comment
router.post('/:id/like', authenticateFirebaseUser, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;

        // Check if already liked
        const existingLike = await query(
            'SELECT * FROM fact_comment_likes WHERE comment_id = $1 AND user_id = $2',
            [id, userId]
        );

        if (existingLike.rows.length > 0) {
            // Unlike
            await query(
                'DELETE FROM fact_comment_likes WHERE comment_id = $1 AND user_id = $2',
                [id, userId]
            );
            
            res.json({
                success: true,
                data: { liked: false, message: 'Comment unliked' }
            });
        } else {
            // Like
            await query(
                'INSERT INTO fact_comment_likes (comment_id, user_id) VALUES ($1, $2)',
                [id, userId]
            );
            
            res.json({
                success: true,
                data: { liked: true, message: 'Comment liked' }
            });
        }
    } catch (error) {
        console.error('Error toggling comment like:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to toggle like'
        });
    }
});

export default router;
