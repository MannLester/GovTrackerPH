import admin from 'firebase-admin';
import { query } from '../config/database.js';

// Initialize Firebase Admin (you'll need to add service account credentials)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID || 'libraryofjournals',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

// Middleware to verify Firebase token and get user info
export const authenticateFirebaseUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Get or create user in our database
        const user = await getOrCreateUser(decodedToken);
        
        // Add user info to request
        req.user = user;
        req.firebaseUser = decodedToken;
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
};

// Helper function to get or create user in our database
const getOrCreateUser = async (firebaseUser) => {
    try {
        // Check if user exists in our database
        const result = await query(
            'SELECT * FROM dim_user WHERE email = $1',
            [firebaseUser.email]
        );

        if (result.rows.length > 0) {
            return result.rows[0];
        }

        // Create new user if doesn't exist
        const newUserResult = await query(`
            INSERT INTO dim_user (
                username, 
                email, 
                password_hash, 
                first_name, 
                last_name, 
                profile_picture,
                role,
                status_id
            ) 
            SELECT 
                $1, $2, 'firebase_auth', $3, $4, $5, 'citizen',
                status_id 
            FROM dim_status 
            WHERE status_name = 'Active'
            RETURNING *
        `, [
            firebaseUser.email.split('@')[0], // username from email
            firebaseUser.email,
            firebaseUser.name?.split(' ')[0] || 'User',
            firebaseUser.name?.split(' ').slice(1).join(' ') || '',
            firebaseUser.picture || null
        ]);

        return newUserResult.rows[0];
    } catch (error) {
        console.error('Error getting/creating user:', error);
        throw error;
    }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
    if (!req.user || !['admin', 'super-admin'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }
    next();
};

// Middleware to check if user is personnel or admin
export const requirePersonnel = (req, res, next) => {
    if (!req.user || !['personnel', 'admin', 'super-admin'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: 'Personnel access required'
        });
    }
    next();
};

// Optional authentication (for public endpoints that can work with or without auth)
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decodedToken = await admin.auth().verifyIdToken(token);
            const user = await getOrCreateUser(decodedToken);
            req.user = user;
            req.firebaseUser = decodedToken;
        }
        
        next();
    } catch (error) {
        // Continue without authentication for optional auth
        next();
    }
};
