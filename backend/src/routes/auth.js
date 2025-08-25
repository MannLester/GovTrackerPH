import express from 'express';
import { authenticateFirebaseUser } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/verify - Verify Firebase token and get user info
router.post('/verify', authenticateFirebaseUser, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                user: req.user,
                firebase: {
                    uid: req.firebaseUser.uid,
                    email: req.firebaseUser.email,
                    name: req.firebaseUser.name,
                    picture: req.firebaseUser.picture
                }
            }
        });
    } catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify user'
        });
    }
});

// GET /api/auth/profile - Get current user profile
router.get('/profile', authenticateFirebaseUser, async (req, res) => {
    try {
        res.json({
            success: true,
            data: req.user
        });
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get profile'
        });
    }
});

export default router;
