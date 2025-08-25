import admin from 'firebase-admin';
import { usersRepository } from '@/lib/database/config';
import { NextRequest } from 'next/server';

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID || 'libraryofjournals',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

export interface AuthUser {
    user_id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
    role: 'citizen' | 'admin' | 'personnel' | 'super-admin';
    is_active: boolean;
    status_id: string;
    created_at: string;
    updated_at: string;
}

export interface AuthResult {
    user?: AuthUser;
    firebaseUser?: admin.auth.DecodedIdToken;
    error?: string;
}

// Helper function to get or create user in our database
const getOrCreateUser = async (firebaseUser: admin.auth.DecodedIdToken): Promise<AuthUser> => {
    try {
        const user = await usersRepository.getOrCreateUser(firebaseUser);
        return user as AuthUser;
    } catch (error) {
        console.error('Error getting/creating user:', error);
        throw error;
    }
};

// Function to verify Firebase token and get user info
export const authenticateUser = async (request: NextRequest): Promise<AuthResult> => {
    try {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { error: 'No token provided' };
        }

        const token = authHeader.split(' ')[1];
        
        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Get or create user in our database
        const user = await getOrCreateUser(decodedToken);
        
        return { user, firebaseUser: decodedToken };
    } catch (error) {
        console.error('Authentication error:', error);
        return { error: 'Invalid token' };
    }
};

// Optional authentication (for public endpoints that can work with or without auth)
export const optionalAuth = async (request: NextRequest): Promise<AuthResult> => {
    try {
        const authHeader = request.headers.get('authorization');
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decodedToken = await admin.auth().verifyIdToken(token);
            const user = await getOrCreateUser(decodedToken);
            return { user, firebaseUser: decodedToken };
        }
        
        return {}; // No auth, but that's okay
    } catch (error) {
        // Continue without authentication for optional auth
        console.log('Optional auth failed:', error);
        return {};
    }
};

// Function to check if user is admin
export const requireAdmin = (user?: AuthUser): boolean => {
    return user ? ['admin', 'super-admin'].includes(user.role) : false;
};

// Function to check if user is personnel or admin
export const requirePersonnel = (user?: AuthUser): boolean => {
    return user ? ['personnel', 'admin', 'super-admin'].includes(user.role) : false;
};
